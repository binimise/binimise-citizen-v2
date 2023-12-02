import React, {useState, useEffect, useReducer}  from 'react';
import { ScrollView, KeyboardAvoidingView, Image, Dimensions,StyleSheet } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import { View, Text, Touch, TextInput, Picker,PickerModal } from "./../ui-kit";
import Header from "../components/header";
import * as Location from 'expo-location';
import Modal from "./../components/modal";
import { getCommercialByQrCode, getAllAreas,checkUsersData, getCommercialWardUserData, updateCitizenData,getUserData } from "./../repo/repo";
import { Color, APP_CONFIG, USERINFO, AUTHUID,QRCODE,PHONENUMBER } from '../global/util';
import MapView,{Marker}  from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome';
import BarScanner from "./../components/barcodeScanner";
let { width, height } = Dimensions.get('window');

const updatedCommercialState = {
    name : "",
    phoneNumber : "",
    areaCode : "",
    municipality : APP_CONFIG.MUNICIPALITY_NAME,
    address : "",
}

const RESET = "reset"
  
const reducer = (state, { field, value }) => {
    if(field == USERINFO){
      return {
        ...state,
        ...value
      }
    }
    if(field.includes(".")){
      let field2 = field.split(".")[1];
      let field1 = field.split(".")[0];
      let obj = {};
      obj[field1] = state[field1];
      obj[field1] = { ...obj[field1], [field2]: value };
      obj[field1][field2] = value;
      return {
        ...state,
        ...obj
      }
    }
    if(field == RESET){
        return { ...updatedCommercialState };
    }
    return {
      ...state,
      [field]: value
    }
}

export default ({ navigation }) => {

    const [state, dispatchStateAction] = useReducer(reducer, updatedCommercialState);
    const [areas, setAreas] = useState({});
    const [region, setRegion] = useState(APP_CONFIG.COORDINATES.coords);
    const [mapModal, setMapModal] = useState(false);

    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    let {userInfo} = useSelector(state => state.testReducer) || {};

    const [citizenInfo, setcitizenInfo] = useState({});
    const [currentLocation, setCurrentLocation] = useState({});
    const [updateLocation, setUpdateLocation] = useState({});
    const [searchByCode, setSearchByCode] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [scannedValue, setScannedValue] = useState("");
    const [_mapType,setMapType] = useState("hybrid")
    const [isPickerShow,setIsPickerShow] = useState(false);
    const [selectedArray,setSelectedArray] = useState([]);
    const [selectedKey,setSelectedKey] = useState("");
    const [selectedValue,setSelectedValue] = useState("");
    const [isSearching,setIsSearching] = useState(false);
    const [isLocationUpdated,setIsLocationUpdated] = useState(false);

    useEffect(() => {
        getAreas(); 
    }, []);
    
    function CommonItemsArray(array_1, array_2) {
        var commonArray = []; 
        for (var i = 0; i < array_1.length; i++) {
           for (var j = 0; j < array_2.length; j++) {
              if (array_1[i].id == array_2[j]) {
                 commonArray.push(array_1[i]);
              }
           }
        }
        return commonArray;
     }

    getAreas = async () => {
        let areaList = await getAllAreas();
        let modifiedArrayList = []
        areaList.map((eachitem)=>{
            let obj={"id":eachitem.data().id, "name": eachitem.data().name}
            modifiedArrayList.push(obj);
        })
        let sortedlist = modifiedArrayList.map(item => item.id.toLowerCase()).
            sort((a,b) => parseInt(a.toLowerCase().replace('ward ', '').replace("ward", '')) > 
            parseInt(b.toLowerCase().replace('ward ', '').replace("ward", ''))).
            map((item, index) => Object.assign({}, {id : item, name: item}))
         
        let commonItem = userInfo.ward&&(userInfo.ward).length>0?
            CommonItemsArray(sortedlist, userInfo.ward):sortedlist
         setAreas(commonItem);
    }

    toggleLoading = show => {
        setDataAction({"loading": {show}});
    }
    
    formOnChangeEditCommercial = (field, value) => {
        dispatchStateAction({ field, value });
    }

    getCurrentLocation = async () => {
        try {
            await Location.enableNetworkProviderAsync().then().catch(_ => null);
            let location = await Location.getLastKnownPositionAsync({enableHighAccuracy: true});
            setCurrentLocation(location.coords);
            return location.coords;
        }catch(e){
            showErrorModalMsg("error_in_getting_current_location");
        }
    }

    showErrorModalMsg = (message, title = "message") => {
        setDataAction({ 
            errorModalInfo : {
                showModal : true, title, message
            }
        })
    };

    skipValidationFields = field => {
        return ["email"].includes(field);
    }

    validateUpdatedCommercialInfo = () => {
        let message = ["please_enter", " "];
        for(let key in updatedCommercialState) {
            if(!skipValidationFields(key) && !state[key]){
                message.push(key);
                showErrorModalMsg(message);
                return true
            }
        }
        if(!updateLocation?.latitude){
            showErrorModalMsg("error_in_getting_location_please_set_location_in_map");
            return true
        }
        return false
    }

    updateUserData = ({uInfo, authUid, ward, lat, long}) => {
        uInfo[AUTHUID] = authUid;
        uInfo["ward"] = ward;
        uInfo["lat"] = lat;
        uInfo["long"] = long;
        return uInfo;
    }

    updateCommercialInfo = async () => {
        toggleLoading(true);
        try {
            let uInfo = {...citizenInfo, ...state};
            uInfo.areaCode = uInfo.areaCode || "ward 1";
            uInfo.ward_id = uInfo.areaCode? uInfo.areaCode: "ward 1";
            var authUid = uInfo[AUTHUID];
            uInfo = updateUserData({ uInfo, authUid, ward: uInfo.areaCode.toLowerCase(), lat: updateLocation?.latitude, long: updateLocation?.longitude });
            
            uInfo[QRCODE] =  scannedValue.length>0?scannedValue:null
            uInfo["holdingNo"] =  scannedValue.length>0?scannedValue:null
            await updateCitizenData(uInfo);
            let uData = await checkUsersData(uInfo.phoneNumber);
            if(!uData){
                toggleLoading(false);
                return showErrorModalMsg("failed_to_update_citizen");
            }
        } catch(err){}
        toggleLoading(false);
        setScannedValue("");
        formOnChangeEditCommercial(RESET, {});
        setUpdateLocation({});
        setIsLocationUpdated(false);
        showErrorModalMsg("user_detail_updated_successfully");
        let obj = {};
        for(let key in state){
            obj[key] = "";
        }
        obj["userType"] = "user"
        formOnChangeEditCommercial(USERINFO, obj);
    }

    getImageDetails= async(region)=>{
    
        await Location.reverseGeocodeAsync({latitude:region.latitude,longitude: region.longitude}).
          then(result => {
            let address = result[0];
            let city=address.city |"",district=address.region||"",country=address.country||"",
                name=address.name||"",postalCode=address.postalCode||""
            let _address = name+", "+city+", "+district+"  "+postalCode+", "+country
            formOnChangeEditCommercial("address",_address)
          });
      };

    selectLocationFromMap = () => {
        setUpdateLocation(region);
        setMapModal(false);
        getImageDetails(region);
        setIsLocationUpdated(true);
        // setTimeout(async () => {
        //     alert("Location Captured Sucessfully")
        // }, 1000);
    }
    
    showMapModal = () => (
        <Modal>
            <View row>
                <Text center b s={16} t="mapView"  w={"50%"}/> 
                <Touch s={16} c={"red"}  t={"close_map"} w={"50%"} onPress={()=>setMapModal(false)}  ai />
            </View>
            <View>
                <MapView
                    ref={ref => (this.mapView = ref)}
                    mapType={_mapType}
                    style={{height: height-200 }}
                    zoomEnabled={true}
                    followUserLocation={true}
                    showsUserLocation={true}
                    initialRegion={region || APP_CONFIG.COORDINATES.coords}
                    onRegionChangeComplete={region => setRegion({ ...region, latitudeDelta: 0.01, longitudeDelta: 0.01 })}>
                        <Marker coordinate={{ ...region }} draggable />
                </MapView>
                <Touch style={{ position: "absolute", bottom: 30, left: 10 }} onPress={async () => {
                    let location = await getCurrentLocation();
                    setRegion({ ...location, latitudeDelta: 0.01, longitudeDelta: 0.01 });
                    this.mapView.animateToRegion({ ...location, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 2000);
                }}>
                    <Image source={require("./../assets/currentLocation.webp")} style={{ width: 50, height: 50 }} />
                </Touch>
                <View style={{ position: "absolute", bottom: 30, right:10 }}c={"white"} row w={"40%"}>
                    <Touch jc ai t={"Map"} w={"48%"} onPress={()=>setMapType("standard")} c={_mapType =="standard"?"green":"black"}/>
                    <View w={1} c={"black"}/>
                    <Touch jc ai t={"Satelite"} w={"50%"} onPress={()=>setMapType("hybrid")} c={_mapType =="hybrid"?"green":"black"}/>
                </View>
            </View>
            <Touch jc bc={Color.themeColor} c={Color.themeFontColor} w={'100%'} br={4} mt={10}
                onPress={selectLocationFromMap} s={16} t={'select_location_from_map'}/>
        </Modal>
    )

    getUpdateCommercialView = (text, ph, name, value, keyboardType, maxLength) => {
        return (
            
            <View style={styles.cardStyle}>
                <Text s={12} t={text} c={"black"} b/>
                <TextInput ml nl={1} ph={ph} pl={"4%"} h={40} bc={"white"} bbw= {1}
                    onChangeText={formOnChangeEditCommercial} name={name} tbc={"#F0F0F0"} mb={4}
                    value={value}  bw={1} k={keyboardType} maxLength={maxLength}
                />
          </View>
        )
    }

    searchCommercialUser = async () => {
        if(state.phoneNumber.length != 10){
            return showErrorModalMsg("please_enter_10_digit_phonenumber");
        }
        toggleLoading(true);
        let _commercialInfo = await getCommercialWardUserData(state.phoneNumber);
        if(!_commercialInfo ) {
            toggleLoading(false);
            return showErrorModalMsg("no_user_with_this_number_exists");
        }
        let loc_obj={latitude:_commercialInfo.lat?_commercialInfo.lat:APP_CONFIG.COORDINATES.coords.latitude,
            longitude:_commercialInfo.long?_commercialInfo.long:APP_CONFIG.COORDINATES.coords.longitude}
    
        setRegion({ ...loc_obj, latitudeDelta: 0.01, longitudeDelta: 0.01 });
        setScannedValue(_commercialInfo?.qrCode?_commercialInfo.qrCode:"")
      
        formOnChangeEditCommercial(USERINFO, _commercialInfo);
        setUpdateLocation(loc_obj);
        toggleLoading(false);
    }

    closeModal = () => {
        setShowScanner(false);
    }

    getScannedValue = scannedValue => {
        if(!scannedValue){
             return showErrorModalMsg("incorrect bar code");
         }
         isSearching? searchCommercialByQr(scannedValue):setScannedValue(scannedValue)
       
     }
 

    searchCommercialByQr = async (scannedValue) => {
        
        toggleLoading(true);
        let _commercialInfo = await getCommercialByQrCode(scannedValue);
        if(!_commercialInfo) {
            toggleLoading(false);
            return showErrorModalMsg("no_user_with_this_qr_exists");
        }
        let loc_obj={latitude:_commercialInfo.lat?_commercialInfo.lat:APP_CONFIG.COORDINATES.coords.latitude,
            longitude:_commercialInfo.long?_commercialInfo.long:APP_CONFIG.COORDINATES.coords.longitude}
    
        setRegion({ ...loc_obj, latitudeDelta: 0.01, longitudeDelta: 0.01 });
        setScannedValue(_commercialInfo?.qrCode)
       
        formOnChangeEditCommercial(USERINFO,_commercialInfo);
        setUpdateLocation(loc_obj);
        toggleLoading(false);
    }
   

    searchByPhone_C= () => {
        return (
            <View mt={16} mb={16} c={"white"}>
                <Text t={"search_user_by_phoneNumber"} mt={16}/>
                <View row mb={4}>
                    <View br={4} bc={Color.lightGrayColor}c={"white"} w={width - 80} bw={1} pt={4} pb={4} mb={8}>
                        <Text s={12} ml={16} c={Color.lightGrayColor} t={'search'} />
                        <TextInput ml nl={1} ph={'9989443788'} pl={16} h={24}
                            k={"numeric"} maxLength={10}
                            onChangeText={formOnChangeEditCommercial} name={"phoneNumber"}
                            value={state.phoneNumber}
                        />
                    </View>
                    <Touch row jc ai w={40} bw={1}bc={'white'} h={48} ml={4} br={4}
                        onPress={searchCommercialUser } boc={Color.themeColor}>
                        <Icon size={22}
                            name={"search"}
                            color={Color.themeColor} />
                    </Touch>
                </View>
                <Text u c={Color.themeColor} t={"donot_have_phoneNumber_press_here"}
                    onPress={() => {
                        setSearchByCode(true);
                    }} mt={4} mb={4}/>
            </View>
        )
    }

    searchByCodeView = () => {
        return (
            <View mt={16} mb={16} c={"white"}>
                <Text t={"search_user_qr"}/>
                <View br={4} bc={Color.lightGrayColor} bw={1} pt={4} pb={4} mb={8}>
                        <Touch h={38} c={Color.black} w={'100%'} jc ai b={false}
                             onPress={() => {setIsSearching(true);setShowScanner(true)}}
                        >
                            <Text b s={16} t={'scan_qr'} />
                        </Touch>
                </View>
                <Text u t={"search_user_by_phoneNumber"} c={Color.themeColor}
                    onPress={() => {
                        setSearchByCode(false);
                    }} mt={4} mb={4}/>
            </View>
        )
    }

    isClosedModal= ()=>{
     setIsPickerShow(false);
    }

    selectedPickerData = (key,data)=>{
      setSelectedValue(data)
      formOnChangeEditCommercial(key,data)
    }
    return <View c={Color.viewColor} w={"100%"} h={"100%"}>
            <View h={1} bw={0.5} bc={Color.borderColor}/>
            <Header navigation={navigation} headerText={"updateCommercial"}/>
            <View ph={16} mb={16} mt={24}>
                <Text s={16} t={["work_in_progress"]} />
            </View>
        </View>
    // return (
    //     <View>
    //         {showScanner ? 
    //             <BarScanner getScannedValue={getScannedValue} closeModal={closeModal} />:
    //             <View c={Color.viewColor} w={"100%"} h={"100%"}>
    //                 <View h={1} bw={0.5} bc={Color.borderColor}/>
    //                 <Header navigation={navigation} headerText={"updateCommercial"}/>
    //                 <ScrollView contentContainerStyle={{ width:"90%",marginHorizontal:"5%"}}>
    //                     {
    //                         searchByCode ? searchByCodeView() : searchByPhone_C()
    //                     }
    //                     <Text t={"update_details"} mb={4}/>
    //                     {
    //                         getUpdateCommercialView('name', 'firstName_lastName', 'name', state.name)
    //                     }

    //                     {
    //                         getUpdateCommercialView('phoneNumber', '9954672326', 'phoneNumber', state.phoneNumber, "numeric", 10)
    //                     }
                        
    //                     <View  br={4} c={"white"} bw={1} mb={4}>
    //                         <Text t={"click_below"} b  style={{margin:"2%"}}/>
    //                         <View  w={"100%"}  bw={1} bc={"#CCCCCC"}/>
    //                         <Touch br={4} s={16} w={'90%'} mh={"5%"} mt={"2%"} mb={"2%"} ai jc bc={"#FFFFFF"} bw={1}
    //                             onPress={()=> {setSelectedArray(areas);
    //                             setSelectedKey("areaCode");
    //                             setSelectedValue(state.areaCode);
    //                             setIsPickerShow(true)}}  t={state.areaCode?state.areaCode:"select_your_ward"}
    //                         />
    //                     </View>
    //                     <Touch bw={1} jc boc={Color.lightGrayColor} bc={"white"} w={'100%'} mb={16} br={4}
    //                         onPress={() => {setIsSearching(false);setShowScanner(true)}}>
    //                         {scannedValue.length>0 ?<Text t={["scanned_val"+":"+" "+scannedValue]} b c={"green"} s={14} center/>:null}
    //                         <Text  t={scannedValue.length>0 ?'update_qr':'scan_qr'} b c={Color.black} s={16} center/>
    //                     </Touch>
    //                     <View w={"100%"} mb={"4%"} bc={Color.black} bw={1}  br={4} c={"white"}>
    //                         {
    //                             getUpdateCommercialView('address', 'address', 'address', state.address)
    //                         }
    //                         <Text t={updateLocation?.latitude?"click_to_change":"click_to_select"} b />
    //                         <View  w={"100%"} bw={1} bc={"#CCCCCC"}/>
                    
    //                         <Touch  h={120} onPress={() => {setMapModal(true)}}>
    //                             <MapView
    //                                 language={"hn"}
    //                                 mapType={"hybrid"}
    //                                 style={{ alignSelf: 'stretch', height: "100%" }}
    //                                 region={{ latitude:region.latitude, longitude: region.longitude,  latitudeDelta: 0.01, longitudeDelta: 0.01 }}
    //                             >
    //                                 <MapView.Marker coordinate={{ ...region }} draggable />
    //                             </MapView>
    //                         </Touch>
    //                         <Text t={isLocationUpdated?"location_updated":""} b  s={20} 
    //                             h={40} ml={10} c={"green"}
    //                         />
    //                     </View>

    //                     <View row mb={16}>
    //                         <Touch ai jc h={48} br={4} onPress={() => {
    //                             if(!validateUpdatedCommercialInfo()){
    //                                 updateCommercialInfo();
    //                             }
    //                         }}
    //                         s={16} c={Color.themeFontColor} bc={Color.themeColor} b t={"submit"} />
    //                     </View>
    //                 </ScrollView>
    //                 {
    //                     mapModal ? showMapModal() : null
    //                 }
    //             </View>
    //         }
      
    //         {isPickerShow&&selectedArray.length>0?
    //             <PickerModal 
    //                 items={selectedArray} 
    //                 selectedKey ={selectedKey} 
    //                 selectedValue={selectedValue} 
    //                 selectedPicker={selectedPickerData}
    //                 isClosedModal={isClosedModal} 
    //             />:null}
    //     </View>
    // )
}
const styles = StyleSheet.create({
    cardStyle :{
        marginVertical:"4%",
        backgroundColor : "white",
        padding : "4%"
    }
});