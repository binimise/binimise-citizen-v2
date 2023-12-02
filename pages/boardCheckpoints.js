import React, {useState, useEffect, useReducer}  from 'react';
import { ScrollView, Dimensions, Image,StyleSheet,TouchableOpacity } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import { View, Text, Touch, TextInput, Picker,PickerModal } from "./../ui-kit";
import Header from "../components/header";
import * as Location from 'expo-location';
import { getAllAreas,onBoardCheckpoint,getCheckpointsFromSettings,getUserData,getCheckpointByQr} from "./../repo/repo";
import { Color, PAGES,USERINFO, AUTHUID, QRCODE ,APP_CONFIG} from '../global/util';
import BarScanner from "./../components/barcodeScanner";
import MapView,{Marker}  from 'react-native-maps';
import Modal from "./../components/modal";
import Icon from 'react-native-vector-icons/FontAwesome';
let { height ,width} = Dimensions.get('window');

const initialState = {
    name : "",
    areaCode : "",
    type: "",
    scannedValue:""
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
        return { ...initialState };
    }
    return {
      ...state,
      [field]: value
    }
}


export default ({ navigation }) => {

    const [state, dispatchStateAction] = useReducer(reducer, initialState);
    const [areas, setAreas] = useState([]);
    const [checkpointTypes, setCheckpointTypes] = useState([]);
    // const [scannedValue, setScannedValue] = useState("");
    const [showScanner, setShowScanner] = useState(false);
    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    let { userInfo } = useSelector(state => state.testReducer) || {};
   const [region, setRegion] = useState(APP_CONFIG.COORDINATES.coords);
   const [mapModal, setMapModal] = useState(false);
   const [_mapType,setMapType] = useState("hybrid");
   const [currentLocation, setCurrentLocation] = useState({});
   const [updateLocation, setUpdateLocation] = useState({});
   const [isPickerShow,setIsPickerShow] = useState(false);
   const [selectedArray,setSelectedArray] = useState([]);
   const [selectedKey,setSelectedKey] = useState("");
   const [selectedValue,setSelectedValue] = useState("");

    useEffect(() => {
        getAreas();
        getCheckpointTypesFromSettings();
    }, []);

    getCheckpointTypesFromSettings=async()=>{
        let checkpointsData = await getCheckpointsFromSettings();
        let checkpointsArray = [];
        // checkpointsArray.push({ name : "--- Select A Request ---", id : "" })
        checkpointsData.map((key) => {
            checkpointsArray.push({name :key,id:key});
        });
        setCheckpointTypes(checkpointsArray);
    }
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
    
    formOnChangeCheckpoints = (field, value) => {
        dispatchStateAction({ field, value });
    }
    // if(ispickerShow){
    //     return(
    //       <View a c={Color.backgroundModalColor} jc ai zi={999} to={0} le={0} h={height} w={width}>
    //           <View w={width - 48} br={8} c={Color.white} jc pa={16} h={300}>
    //             <Text t={"select_your_ward"} center s={20} />
    //             <View w={"90%"} bw={0.5} mh={"5%"} bc={"black"} mb={"4%"}/>
    //             <ScrollView>
    //               {areas.map((each,index)=>{
    //                 return <View>
    //                     <View h={40} w={"90%"} ml={"5%"} row key={index}>
    //                         <TouchableOpacity
    //                             style={styles.radioCircle}
    //                             onPress={() => {formOnChangeCheckpoints("areaCode", each.name)}}
    //                         >
    //                             {each.name===state["areaCode"] && <View style={styles.selectedRb} />}
    //                         </TouchableOpacity>
    //                         <Text center ml={2} s={18} t={each.name} />
    //                     </View>
    //                     <View h={1} bw={0.5} bc={"#CCCCCC"} mh={"5%"} w={"90%"}/>
    //                 </View>
    //               })}
    //             </ScrollView>
    //             <View w={"90%"} bw={0.5} mh={"5%"} bc={"black"}/>
    //               <View row jc>
    //                 <Touch h={40} w={"40%"} jc ai t={"close_c"} mb={4} boc={"#F0F0F0"} bc={"red"}
    //                   mt={2} mr={10} bw={2} onPress={() =>{setIsPickerShow(false)}}/>
    //                 <Touch h={40} w={"40%"} jc ai t={"submit"} mb={4} boc={"#F0F0F0"} bc={"green"}
    //                   mt={2} bw={2} onPress={() =>{setIsPickerShow(false)}}/>
    //               </View>
    //           </View>
    //       </View>
    //     )
    // }
   

    getCheckpointView = (text, ph, name, value, keyboardType, maxLength) => {
        return (
            <View style={styles.cardStyle}>
                <Text s={12} t={text} c={"black"} b/>
                <TextInput ml nl={1} ph={ph} pl={"4%"} h={40} bc={"white"} bbw= {1}
                    onChangeText={formOnChangeCheckpoints} name={name} tbc={"#F0F0F0"} mb={4}
                    value={value}  bw={1} k={keyboardType} maxLength={maxLength}
                />
           </View>
        )
    }

    showErrorModalMsg = (message, title = "message") => {
        setDataAction({ 
            errorModalInfo : {
                showModal : true, title, message
            }
        })
    };

    skipValidationFields = field => {
        return [].includes(field);
    }

    validateUserInfo = () => {
        let message = ["please_enter", " "];
        for(let key in initialState) {
            if(!skipValidationFields(key) && !state[key]){
                message.push(key);
                showErrorModalMsg(message);
                return true
            }
        }
      return false
    }

    addNewCheckpoint = async () => {
        toggleLoading(true);
        var ch_info = JSON.parse(JSON.stringify(state));
        let cData = await getCheckpointByQr(state.scannedValue);
            if(cData){
                toggleLoading(false);
                return showErrorModalMsg("check_with_same_qr_exists");
            }
        ch_info.lat =updateLocation?.latitude  || 19.0840319;
        ch_info.lng = updateLocation?.longitude || 82.0222439;
        
        ch_info.ward_id = ch_info.areaCode|| "ward1";
        var authUid = await AsyncStorage.getItem(AUTHUID);
        ch_info["boardedBy"] = authUid; 
        ch_info[QRCODE] = state.scannedValue.length>0?state.scannedValue:null;
        
        onBoardCheckpoint(ch_info);
        toggleLoading(false);
        // setScannedValue("");
 
        showErrorModalMsg("checkpoint_onboarded_successfully");
        formOnChangeCheckpoints(RESET, {});
        setUpdateLocation({})
        // navigation.navigate(PAGES.HOME);
    }

   

    getScannedValue = scannedValue => {
        if(!scannedValue){
            return showErrorModalMsg("incorrect bar code");
        }
        // setScannedValue(scannedValue);
        formOnChangeCheckpoints("scannedValue",scannedValue)
    }

    closeModal = () => {
        setShowScanner(false);
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
                                onPress={() => formOnChangeCheckpoints(key, each.name)}
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
    getImageDetails= async(region)=>{
    
        await Location.reverseGeocodeAsync({latitude:region.latitude,longitude: region.longitude}).
          then(result => {
            let address = result[0];
            let city=address.city |"",district=address.region||"",country=address.country||"",
                name=address.name||"",postalCode=address.postalCode||""
            let _address = name+", "+city+", "+district+"  "+postalCode+", "+country
            formOnChangeCheckpoints("address",_address)
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

    const showMapModal = () => (
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
    isClosedModal= ()=>{
        setIsPickerShow(false);
    }
   
    selectedPickerData = (key,data)=>{
        setSelectedValue(data)
        formOnChangeCheckpoints(key,data)
    }
    // console.log("s in checkpointys",state)

    return  showScanner ? <BarScanner getScannedValue={getScannedValue} closeModal={closeModal}/> : 
        <View c={"#F0F0F0"} w={"100%"} h={"100%"}>
            <Header navigation={navigation} headerText={"boardCheckpoints"}/>
            <View h={1} bw={0.5} bc={"#CCCCCC"}/>
            <ScrollView>
                <View mv={"4%"} w={"90%"} mh={"5%"}>
                    {
                        getCheckpointView('name', 'name', 'name', state.name)
                    }
                    <View br={4} c={"white"} bw={1} mb={4}>
                        <Text t={"click_below"} b  style={{margin:"2%"}}/>
                        <View w={"100%"} bw={1} bc={"#CCCCCC"}/>
                        <Touch br={4} s={16} w={'90%'} mh={"5%"} mt={"2%"} mb={"2%"} ai jc bc={"#FFFFFF"} bw={1}
                             onPress={()=> {setSelectedArray(areas);
                            setSelectedKey("areaCode");
                            setSelectedValue(state.areaCode);
                            setIsPickerShow(true)}}  t={state.areaCode?state.areaCode:"select_your_ward"}
                        />
                    </View>
                    <View br={4} c={"white"} bw={1} mb={4}>
                        <Text t={"click_below_t"} b  style={{margin:"2%"}}/>
                        <View  w={"100%"}  bw={1} bc={"#CCCCCC"}/>
                        <Touch br={4} s={16} w={'90%'} mh={"5%"} mt={"2%"} mb={"2%"} ai jc bc={"#FFFFFF"} bw={1}
                             onPress={()=> {setSelectedArray(checkpointTypes);
                            setSelectedKey("type");
                            setSelectedValue(state.type);
                            setIsPickerShow(true)}}  t={state.type?state.type:"select_your_type"}
                        />
                    </View>

                    <Touch bw={1} jc boc={Color.lightGrayColor} bc={"white"} w={'100%'} mb={16} br={4}
                        onPress={() => { setShowScanner(true) }}>
                        {state?.scannedValue?.length>0 ?<Text t={"scanned_val"+":"+state.scannedValue} b c={"green"} s={14} center/>:null}
                        <Text  t={state?.scannedValue?.length>0 ?'update_qr':'scan_qr'} b c={Color.black} s={16} center/>
                    </Touch>
                    <View w={"100%"} mb={"4%"} bc={Color.black} bw={1}  br={4} c={"white"}>
                        {
                        getCheckpointView('address', 'address', 'address', state.address)
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
                    <View row mb={16}>
                    <Touch br={4} mr={"2%"} bw={1} bc={"red"} boc={Color.lightGrayColor} jc h={48} w={'49%'}
                            onPress={()=>{formOnChangeCheckpoints(RESET, {})}} c={Color.white} s={14} b t={"reset"} />
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
                            addNewCheckpoint();
                            }}
                            s={14} c={Color.themeFontColor} bc={Color.themeColor} b t={"submit"} />
                    </View>
                </View>
            </ScrollView>
            {
                mapModal ? showMapModal() : null
            }
             {isPickerShow&&selectedArray.length>0?
                <PickerModal 
                    items={selectedArray} 
                    selectedKey ={selectedKey} 
                    selectedValue={selectedValue} 
                    selectedPicker={selectedPickerData}
                    isClosedModal={isClosedModal} 
                />:null}
        </View>
}     
    

const styles = StyleSheet.create({
    cardStyle :{
        marginVertical:"4%",
        backgroundColor : "white",
        padding : "4%"
    }
});