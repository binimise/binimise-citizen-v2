import React, {useState, useEffect, useReducer}  from 'react';
import { ScrollView, Dimensions, Image ,TouchableOpacity,StyleSheet} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import { View, Text, Touch, TextInput, Picker } from "./../ui-kit";
import Header from "../components/header";
import * as Location from 'expo-location';
import Modal from "./../components/modal";
import { getAllAreas,getUserData, onBoardCommercialUsers, getCommercialWardUserData } from "./../repo/repo";
import { Color, PAGES, APP_CONFIG, USERINFO, AUTHUID, QRCODE } from '../global/util';
import BarScanner from "./../components/barcodeScanner";
import MapView,{Marker}  from 'react-native-maps';
import NetInfo from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/FontAwesome';
let { height,width } = Dimensions.get('window');

const commercialState = {
    name : "",
    phoneNumber : "",
    shopName : "",
    // aadharNumber: "",
    // holdingNo: "",
    areaCode:"",
    dustBinStatus:"",
    // dustBinColor:"",
    scannedValue:"",
    commercialImage : "",
    address:""
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
        return { ...commercialState };
    }
    return {
      ...state,
      [field]: value
    }
}

const YesOrNo = [
    { id : "yes", name : "Yes" },
    { id : "no", name : "No" }
];

const DustbinColor = [
    { id : "blue", name : "Blue" },
    { id : "green", name : "Green" },
    { id : "both", name : "Both" },
]

export default ({ navigation }) => {

    const [state, dispatchStateAction] = useReducer(reducer, commercialState);
    const [areas, setAreas] = useState([]);
    const [region, setRegion] = useState(APP_CONFIG.COORDINATES.coords);
    const [mapModal, setMapModal] = useState(false);
    const [_mapType,setMapType] = useState("hybrid");
    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    const [ispickerShow,setIsPickerShow] = useState(false)
    let { userInfo } = useSelector(state => state.testReducer) || {};

    const [currentLocation, setCurrentLocation] = useState({});
    const [updateLocation, setUpdateLocation] = useState({});
    // const [scannedValue, setScannedValue] = useState("");
    const [showScanner, setShowScanner] = useState(false);

    useEffect(() => {
        getAreas(); 
        _getLocationAsync();
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
        // let intialArrElement =[{"id":"Select Your Ward", "name": "Select Your Ward"}]
        let SaathiData = await getUserData(userInfo.phoneNumber);
        let areaList = await getAllAreas();
        let modifiedArrayList = []
        areaList.map((eachitem)=>{
            let obj={"id":eachitem.data().id, "name": eachitem.data().name}
            modifiedArrayList.push(obj);
        })
        let sortedlist = modifiedArrayList.map(item => item.id.toLowerCase()).
            sort((a,b) => parseInt(a.toLowerCase().replace('ward ', '').replace("ward", '')) > parseInt(b.toLowerCase().replace('ward ', '').replace("ward", ''))).
            map((item, index) => Object.assign({}, {id : item, name: item}))
         
        let commonItem= SaathiData.ward&&(SaathiData.ward).length>0?CommonItemsArray(sortedlist, SaathiData.ward):sortedlist
        // let combinedArr =intialArrElement.concat(commonItem)
        setAreas(commonItem);
    }

    toggleLoading = show => {
        setDataAction({"loading": {show}});
    }
    
    formOnChangeText = (field, value) => {
        dispatchStateAction({ field, value });
    }

    getCommercialView = (text, ph, name, value, keyboardType, maxLength) => {
        return (
            <View style={styles.cardStyle}>
                <Text s={12} t={text} c={"black"} b/>
                <TextInput ml nl={1} ph={ph} pl={"4%"} h={40} bc={"white"} bbw= {1}
                    onChangeText={formOnChangeText} name={name} tbc={"#F0F0F0"} mb={4}
                    value={value}  bw={1} k={keyboardType} maxLength={maxLength}
                />
            </View>
        )
    }

    _getLocationAsync = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync(); //await Permissions.askAsync(Permissions.LOCATION);
        if(status !== "granted"){
            return showErrorModalMsg("please_grant_location_permission_c");
        }
        toggleLoading(true);
        try {
            let location = await Location.getLastKnownPositionAsync({enableHighAccuracy: true});
            setCurrentLocation(location.coords);
            setRegion({ ...location.coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
        }catch(e){
            showErrorModalMsg("error_in_getting_current_location");
        }
        toggleLoading(false);
      };

    showErrorModalMsg = (message, title = "message") => {
        setDataAction({ 
            errorModalInfo : {
                showModal : true, title, message
            }
        })
    };

    skipValidationFields = field => {
        return ["address","dustBinColor"].includes(field);
    }

    validateUserInfo = () => {
        let message = ["please_enter", " "];
        for(let key in commercialState) {
            if(!skipValidationFields(key) && !state[key]){
                message.push(key);
                showErrorModalMsg(message);
                return true
            }
        }
        return false
    }

    onBoardCommercialInfo = async () => {
        toggleLoading(true);
         var comInfo = JSON.parse(JSON.stringify(state));
        comInfo.ward_id = comInfo.areaCode &&comInfo.areaCode!= "Select Your Ward"? comInfo.areaCode: "ward 1";
        comInfo.areaCode = comInfo.areaCode &&comInfo.areaCode!= "Select Your Ward"?comInfo.areaCode: "ward 1";
        comInfo["ward"] = comInfo.areaCode.replace("ward ", "");
        comInfo[QRCODE] =  state.scannedValue.length>0?state.scannedValue:null
        var authUid = await AsyncStorage.getItem(AUTHUID) || userInfo?.authUid;
        comInfo["boardedBy"] = authUid; 
        let uInfo = await getCommercialWardUserData(comInfo.phoneNumber);
        if(uInfo) {
            toggleLoading(false);
            return showErrorModalMsg("user_with_same_number_exists");
        }
        comInfo = { ...comInfo, ...updateLocation};
        onBoardCommercialUsers(comInfo);
        toggleLoading(false);
        showErrorModalMsg("commercial_onboarded_successfully");
        formOnChangeText(RESET, {});
        // navigation.navigate(PAGES.HOME);
        setUpdateLocation({});
    }
    getImageDetails= async(region)=>{
    
        await Location.reverseGeocodeAsync({latitude:region.latitude,longitude: region.longitude}).
          then(result => {
            let address = result[0];
            let city=address.city |"",district=address.region||"",country=address.country||"",
                name=address.name||"",postalCode=address.postalCode||""
            let _address = name+", "+city+", "+district+"  "+postalCode+", "+country
            formOnChangeText("address",_address)
          });
      };

    selectLocationFromMap = () => {
        setUpdateLocation(region);
        setMapModal(false);
        getImageDetails(region);
        // alert("Location Captured Sucessfully")
        // setTimeout(async () => {
        //     alert("Location Captured Sucessfully")
        // }, 1000);
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

    showMapModal = () => (
        <Modal >
            <View row>
                <Text center b s={16} t="mapView"  w={"50%"}/> 
                <Touch s={16} c={"red"}  t={"close_m"} w={"50%"} onPress={()=>setMapModal(false)}  ai />
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

    closeModal = () => {
        setShowScanner(false);
    }

    showCameraOfCommercial = async () => {
        let state = await NetInfo.fetch();
        if (!state.isConnected) {
            return setDataAction({ errorModalInfo: { showModal: true, message: "you_are_offline" }});
        }
        setDataAction({ cameraInfo: { 
            show : true , 
            onLoadOp : drainImageOnLoad,
            imageRef : "onboard_commercial/" + userInfo[AUTHUID] + "/" + new Date().toLocaleDateString().split("/").join("-") + "/" + new Date().getTime() + '.jpg'
        }});
    }

    drainImageOnLoad = async (url) => {
        formOnChangeText("commercialImage", url)
    }

    // showPicker = (key, item) => {
    //     return (
    //         <View br={4} bc={Color.black} bw={1} pt={4} pb={4} mb={8}>
    //                 <Text s={16} ml={16} c={Color.black} t={key} />
    //                 <Picker h={50} w={"100%"}
    //                     items={item}
    //                     selectedValue={state[key]}
    //                     onValueChange={(itemValue, itemIndex) => formOnChangeText(key, itemValue)}
    //                 />
    //             </View>
    //     );
    // }

    getScannedValue = scannedValue => {
        if(!scannedValue){
            return showErrorModalMsg("incorrect bar code");
        }
        formOnChangeText("scannedValue",scannedValue)
    //   setScannedValue(scannedValue);
    }
    if(ispickerShow){
        return(
          <View a c={Color.backgroundModalColor} jc ai zi={999} to={0} le={0} h={height} w={width}>
              <View w={width - 24} br={8} c={Color.white} jc pa={16} h={"90%"}>
                <Text t={"select_your_ward"} center s={20} />
                <View w={"90%"} bw={0.5} mh={"5%"} bc={"black"} mb={"4%"}/>
                <ScrollView>
                  {areas.length>0&&areas.map((each,index)=>{
                    return  <View key={index} mb={4}>
                            <Touch h={40} w={"90%"} mh={"5%"} row key={index} bc={"#F0F8FF"} 
                                ai br={16} onPress={() => {formOnChangeText("areaCode", each.name)}}
                            >
                                <View style={styles.radioCircle}>
                                    {each.name===state["areaCode"] && <View style={styles.selectedRb} />}
                                </View>
                                <Text center ml={2} s={18} t={each.name} />
                            </Touch>
                            <View h={1} bw={0.5} bc={"#CCCCCC"} mh={"5%"} w={"90%"}/>
                        </View>
                    // <View key={index}>
                    //     <View h={40} w={"90%"} ml={"5%"} row >
                    //         <TouchableOpacity
                    //             style={styles.radioCircle}
                    //             onPress={() => {formOnChangeText("areaCode", each.name)}}
                    //         >
                    //             {each.name===state["areaCode"] && <View style={styles.selectedRb} />}
                    //         </TouchableOpacity>
                    //         <Text center ml={2} s={18} t={each.name} />
                    //     </View>
                    //     <View h={1} bw={0.5} bc={"#CCCCCC"} mh={"5%"} w={"90%"}/>
                    // </View>
                  })}
                </ScrollView>
                <View w={"90%"} bw={0.5} mh={"5%"} bc={"black"}/>
                  <View row jc>
                    <Touch h={40} w={"40%"} jc ai t={"close_c"} mb={4} boc={"#F0F0F0"} bc={"red"}
                      mt={2} mr={10} bw={2} onPress={() =>{setIsPickerShow(false)}}/>
                    <Touch h={40} w={"40%"} jc ai t={"submit"} mb={4} boc={"#F0F0F0"} bc={"green"}
                      mt={2} bw={2} onPress={() =>{setIsPickerShow(false)}}/>
                  </View>
              </View>
          </View>
        )
    }

    showPicker = (key,item)=>{
        return(
            <View br={4} bc={Color.black} bw={1} pt={4} pb={4} mb={8} style={styles.cardStyle}>
                <Text s={16} ml={16} c={Color.black} t={key} b/>
                <View h={1} bw={0.5} bc={Color.lightGrayColor}/>
                {item.map((each,index)=>{
                    return(
                        <View h={40} w={"90%"} ml={"5%"} row key={index}>
                            <TouchableOpacity
                                style={styles.radioCircle}
                                onPress={() => formOnChangeText(key, each.name)}
                            >
                                {each.name===state[key] && <View style={styles.selectedRb} />}
                            </TouchableOpacity>
                            <Text center ml={2} s={18} t={each.name} />
                        </View>
                    )
                })}
            </View>
        )
    }
  
    return  showScanner ?<BarScanner getScannedValue={getScannedValue} closeModal={closeModal} />:
    <View c={"#F0F0F0"} w={"100%"} h={"100%"}>
        <Header navigation={navigation} headerText={"boardCommercial"}/>
        <View h={1} bw={0.5} bc={"#CCCCCC"}/>
        <ScrollView>
            <View mv={"4%"} w={"90%"} mh={"5%"}>
                {
                    getCommercialView('sk_name', 'sk_name', 'name', state.name)
                }
                {
                    getCommercialView('sh_name', 'sh_name', 'shopName', state.shopName)
                }
                {
                    getCommercialView('phoneNumber', '9954672326', 'phoneNumber', state.phoneNumber, "numeric", 10)
                }
                {/* {
                    getCommercialView('aadharNumber', '995467232662', 'aadharNumber', state.aadharNumber, "numeric", 12)
                }  */}
                 {/* {
                    getCommercialView('holdingNo', 'Holding Number/Ration Number', 'holdingNo', state.holdingNo)
                } */}
                <View  br={4} c={"white"} bw={1} mb={4}>
                    <Text t={"click_below"} b  style={{margin:"2%"}}/>
                    <View  w={"100%"}  bw={1} bc={"#CCCCCC"}/>
                    <Touch br={4} s={16} w={'90%'} mh={"5%"} mt={"2%"} mb={"2%"} ai jc bc={"#FFFFFF"} bw={1}
                        onPress={()=> {setIsPickerShow(true)}} t={state?.areaCode?state.areaCode:"select_your_ward"}
                    />
                </View>
                {
                    showPicker("dustBinStatus", YesOrNo)
                }
                
                <Touch bw={1} jc boc={Color.lightGrayColor} bc={"white"} w={'100%'} mb={16} br={4}
                    onPress={() => { setShowScanner(true) }}>
                    {state?.scannedValue?.length>0 ?
                        <Text t={"scanned_val"+":"+state.scannedValue} b c={"green"} s={14} center/>:null}
                        <Text t={state?.scannedValue?.length>0 ?'update_qr':'scan_qr'} 
                            b c={Color.black} s={16} center/>
                </Touch>
                
                <View w={"100%"} mb={"4%"} bc={Color.black} bw={1}  br={4} c={"white"}>
                    {
                        getCommercialView('address', 'address', 'address', state.address)
                    }
                    <Text t={updateLocation?.latitude?"click_to_change":"click_to_select"} b />
                    <View  w={"100%"} bw={1} bc={"#CCCCCC"}/>
                    <Touch  h={120} onPress={() => {setMapModal(true)}}>
                        <MapView
                            language={"hn"}
                            mapType={"hybrid"}
                            style={{ alignSelf: 'stretch', height: "100%" }}
                            region={{ latitude:region.latitude, longitude: region.longitude,  latitudeDelta: 0.01, longitudeDelta: 0.01 }}
                        >
                            <Marker coordinate={{ ...region }} draggable />
                        </MapView>
                    </Touch>
                    <Text t={updateLocation?.latitude?"location_captured":""} b  s={20} 
                        h={40} ml={10} c={"green"}
                    />
                </View>
                <View>
                    <Text s={12} c={"black"} t={"please_take_image"} b/>
                    <View bw={1} bs={"dashed"} br={4} s={16} mb={12} h={180}w={'100%'}
                        bc={Color.lightGrayColor}  c={"#FFFFFF"}
                    >
                        <Image 
                            source={state.commercialImage?{ uri: state.commercialImage}:
                                require("./../assets-images/image2.jpg")} 
                                resizeMode="stretch"
                                style ={{width:"100%",height:"100%"}} 
                                />
                                <Touch t={state.commercialImage?"retake_image":"take_image"} jc ai h={40} bc={"#F0F0F0"}
                                style={{position:"absolute",top:0,right:0}} w={150} c={state.commercialImage?"red":"green"}
                                onPress={()=> {showCameraOfCommercial()}}
                        /> 
                    </View>
                </View>
                <View row mb={16}>
                    <Touch br={4} mr={"2%"} bw={1} boc={Color.lightGrayColor} jc h={48} w={'49%'}
                        onPress={()=>{formOnChangeText(RESET,{})}} c={Color.white}
                        s={14}  b t={"reset"} bc={"red"} />
                    <Touch ai jc h={48} w={'49%'} br={4} onPress={() => {
                            // if(validateUserInfo()) return;
                            if(!userInfo.isApproved){
                                return showErrorModalMsg("agent_is_not_approved");
                            }
                            if(!userInfo.status){
                                return showErrorModalMsg("saathi_duty_is_off");
                            }
                            if(!updateLocation.latitude){
                                return showErrorModalMsg("please_select_a_location");
                            }
                            if(!state.areaCode){
                                return showErrorModalMsg("select_your_ward");
                            }
                            onBoardCommercialInfo();
                        }}
                        s={14} c={Color.themeFontColor} bc={Color.themeColor} b t={"submit"} />
                </View>
            </View>
        </ScrollView>
        {
            mapModal ? showMapModal() : null
        }
    </View>
}

const styles = StyleSheet.create({
    bottomView: {
     width: '100%',
     height: "85%",
     backgroundColor: '#F0F0F0',
     position: 'absolute', 
       bottom: 0, 
       borderTopLeftRadius:50,
       borderTopRightRadius:50,
       overflow: 'hidden'
     },
       radioCircle: {
            marginTop: 4,
        height: 20,
        width: 20,
        borderRadius: 70,
        borderWidth: 2,
        borderColor: '#808080',
        alignItems: 'center',
        justifyContent: 'center',
      },
      selectedRb: {
        width: 10,
        height: 10,
        borderRadius: 50,
        backgroundColor: '#808080',
        },
        pickerContainer: {
         width: "100%",
         alignSelf: 'center',
         backgroundColor:"white"
         
       },cardStyle :{
        marginVertical:"4%",
        backgroundColor : "white",
        padding : "4%"
        
    },
   
 
 });