import React, {useState, useEffect, useReducer}  from 'react';
import { ScrollView, Dimensions, Image,StyleSheet,TouchableOpacity } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import { View, Text, Touch, TextInput, Picker } from "./../ui-kit";
import Header from "../components/header";
import * as Location from 'expo-location';
import Modal from "./../components/modal";
import { getAllAreas, onBoardUsers,getUserData, getWardUserData,getUserByQrCode } from "./../repo/repo";
import { Color, PAGES, APP_CONFIG, USERINFO, AUTHUID, QRCODE } from '../global/util';
import BarScanner from "./../components/barcodeScanner";
import MapView,{Marker} from 'react-native-maps';
import MapInModal from "../components/map";
import NetInfo from '@react-native-community/netinfo';
let { height ,width} = Dimensions.get('window');
import Icon from 'react-native-vector-icons/FontAwesome';

const onboardState = {
    name : "",
    phoneNumber : "",
    userType : "user",
    areaCode : "",
    // houseOwner : "",
    // houseType : "",
    municipality : APP_CONFIG.MUNICIPALITY_NAME,
    // waterSupply : "",
    dustBinStatus : "",
    toiletStatus : "",
    // typeOfToilet : "",
    scannedValue :"",
    // drainImage : "",
    // dustBinColor : "",
    address : "",
    // supplyType : "",
    houseImage : "",
}

const typeOfToilet = [
    { id : "twinPit", name : "Twin Pit" },
    { id : "septicTank", name : "Septic Tank" },
    { id : "drain", name : "Drain" }
];

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
        return { ...onboardState };
    }
    return {
      ...state,
      [field]: value
    }
}

const toiletStatus = [
    { id : "present", name : "Present" },
    { id : "absent", name : "Absent" }
]

const YesOrNo = [
    { id : "yes", name : "Yes" },
    { id : "no", name : "No" }
]

const HouseType = [
    { id : "kachcha", name : "Kachcha" },
    { id : "first_floor", name : "1stFloor" },
    { id : "second_floor", name : "2ndFloor" },
    { id : "third_floor", name : "3rdFloor" },
    { id : "tin", name : "Tin" }
]

const HouseOwner = [
    { id : "own", name : "Own" },
    { id : "Rent", name : "Rent" }
]

const SupplyType = [
    { id : "own", name : "Own" },
    { id : "phd", name : "Phd" }
]



export default ({ navigation }) => {

    const [state, dispatchStateAction] = useReducer(reducer, onboardState);
    const [areas, setAreas] = useState([]);
    const [scrollview, setScrollView] = useState({});
    const [region, setRegion] = useState(APP_CONFIG.COORDINATES.coords);
    const [mapModal, setMapModal] = useState(false);
    // const [scannedValue, setScannedValue] = useState("");
    const [showScanner, setShowScanner] = useState(false);
    const [isCommercial, setIsCommercial] = useState(false);
    const [_mapType,setMapType] = useState("hybrid");
    const [ispickerShow,setIsPickerShow] = useState(false)
    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    const [updateLocation, setUpdateLocation] = useState({});
    const [showPreview,setIsPreview] = useState(false);
    let { userInfo } = useSelector(state => state.testReducer) || {};

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
    
    formOnChangeUsers = (field, value) => {
        dispatchStateAction({ field, value });
    }

    getOnBoardResView = (text, ph, name, value,flag, keyboardType, maxLength) => {
        return (
            <View style={styles.cardStyle}>
                <Text s={12} t={text} c={"black"} b/>
                <TextInput ml nl={1} ph={ph} pl={"4%"} h={40} bc={"white"} bbw= {1}
                    onChangeText={formOnChangeUsers} name={name} tbc={"#F0F0F0"} mb={4}
                    value={value}  bw={1} k={keyboardType} maxLength={maxLength} editable={flag}
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
        return ["address","drainImage", "typeOfToilet", "dustBinColor", "supplyType"].includes(field);
    }

    validateonBoardResInfo = () => {
        let message = ["please_enter", " "];
        for(let key in onboardState) {
          
            if(!skipValidationFields(key) && !state[key]){
                message.push(key);
                showErrorModalMsg(message);
                return true
            }
        }
        if(!state.phoneNumber) {
            showErrorModalMsg("please_enter_mobileNumber_or_aadhar_Number");
            return true;
        }
        if(state.phoneNumber && state.phoneNumber.length != 10){
            showErrorModalMsg("please_enter_10_digit_phonenumber");
            return true;
        }
        
        // if(state.phoneNumber && state.phoneNumber.length )
        return false
    }

    updateonBoardResInfo = async () => {
        toggleLoading(true);
        var resInfo = JSON.parse(JSON.stringify(state));
        resInfo.areaCode = resInfo.areaCode|| "ward 1";
        resInfo.ward_id =  resInfo.areaCode|| "ward 1";
        resInfo["ward"] = resInfo.areaCode.replace("ward ", "");
        var authUid = await AsyncStorage.getItem(AUTHUID);
        resInfo["boardedBy"] = authUid; 
        resInfo[QRCODE] =  state.scannedValue.length>0?state.scannedValue:null
        resInfo["holdingNo"] =  state.scannedValue.length>0?state.scannedValue:null
        let uInfo = await getWardUserData(resInfo.phoneNumber);
        if(uInfo) {
            toggleLoading(false);
            return showErrorModalMsg("user_with_same_number_exists");
        }
        let uInfo_qr = await getUserByQrCode(resInfo.scannedValue)
        if(uInfo_qr) {
            toggleLoading(false);
            return showErrorModalMsg("user_with_same_qr_exists");
        }
        resInfo = { ...resInfo, ...updateLocation};
        onBoardUsers(resInfo);
        toggleLoading(false);
        showErrorModalMsg("user_onboarded_successfully");
        // setScannedValue("");
        formOnChangeUsers(RESET, {});
        setIsPreview(false);
        // navigation.navigate(PAGES.HOME);
        setUpdateLocation({});
    }

    const getImageDetails= async(region)=>{
    
        await Location.reverseGeocodeAsync({latitude:region.latitude,longitude: region.longitude}).
          then(result => {
            let address = result[0];
            let city=address.city |"",district=address.region||"",country=address.country||"",
                name=address.name||"",postalCode=address.postalCode||""
            let _address = name+", "+city+", "+district+"  "+postalCode+", "+country
            formOnChangeUsers("address",_address)
          });
    };

    const selectLocationFromMap = () => {
        setUpdateLocation(region);
        setMapModal(false);
        getImageDetails(region);
    }
    
    const getScannedValue = scannedValue => {
        if(!scannedValue){
            return showErrorModalMsg("incorrect bar code");
        }
        formOnChangeUsers("scannedValue", scannedValue)
    }


    closeModal = () => {
        setShowScanner(false);
    }

    showCameraOfDraingae = async () => {
        let state = await NetInfo.fetch();
        if (!state.isConnected) {
            return setDataAction({ errorModalInfo: { showModal: true, message: "you_are_offline" }});
        }
        setDataAction({ cameraInfo: { 
            show : true , 
            onLoadOp : drainImageOnLoad,
            imageRef : "onboard_drain/" + userInfo[AUTHUID] + "/" + new Date().toLocaleDateString().split("/").join("-") + "/" + new Date().getTime() + '.jpg'
        }});
    }

    showCameraOfHouse = async () => {
        let state = await NetInfo.fetch();
        if (!state.isConnected) {
            return setDataAction({ errorModalInfo: { showModal: true, message: "you_are_offline" }});
        }
        setDataAction({ cameraInfo: { 
            show : true , 
            onLoadOp : houseImageOnLoad,
            imageRef : "houseImage/" + userInfo[AUTHUID] + "/" + new Date().toLocaleDateString().split("/").join("-") + "/" + new Date().getTime() + '.jpg'
        }});
    }

    drainImageOnLoad = async (url) => {
        formOnChangeUsers("drainImage", url)
    }

    houseImageOnLoad = async (url) => {
        formOnChangeUsers("houseImage", url)
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
                                onPress={() => formOnChangeUsers(key, each.name)}
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
                        ai br={16} onPress={() => {formOnChangeUsers("areaCode", each.name)}}
                    >
                        <View style={styles.radioCircle}>
                            {each.name===state["areaCode"] && <View style={styles.selectedRb} />}
                        </View>
                        <Text center ml={2} s={18} t={each.name} />
                    </Touch>
                    <View h={1} bw={0.5} bc={"#CCCCCC"} mh={"5%"} w={"90%"}/>
                </View>
                    // <View key={index}>
                    //     <View h={40} w={"90%"} ml={"5%"} row key={index}>
                    //         <TouchableOpacity
                    //             style={styles.radioCircle}
                    //             onPress={() => {formOnChangeUsers("areaCode", each.name)}}
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

    if(showPreview){
        return  <View c={"#F0F0F0"} w={"100%"} h={"100%"}>
            <Header navigation={navigation} headerText={"boardUsers"}/>
            <View h={1} bw={0.5} bc={"#CCCCCC"}/>
            <ScrollView>
                <View mv={"4%"} w={"90%"} mh={"5%"}>
                <Text t={"preview_details"} b center style={{margin:"2%"}}/>
                    {
                        getOnBoardResView('name', 'firstName_lastName', 'name', state.name,false)
                    }
                    {
                        getOnBoardResView('phoneNumber', '9954672326', 'phoneNumber', state.phoneNumber,false, "numeric", 10)
                    }
                    <View  br={4} c={"white"} bw={1} mb={4}>
                        <Text t={state.areaCode} b center  style={{margin:"2%"}}/>
                      
                    </View>
                    {
                        showPicker("dustBinStatus", YesOrNo)
                    }
                    {
                        showPicker("toiletStatus", toiletStatus)
                    }
                    <Touch bw={1} jc boc={Color.lightGrayColor} bc={"white"} w={'100%'} mb={16} br={4}
                        onPress={() => { setShowScanner(true)}}
                    >
                        {state?.scannedValue?.length>0 ?
                            <Text t={"scanned_val"+":"+" "+state.scannedValue} b c={"green"} s={14} center/>
                        :null}
                        {/* <Text t={state?.scannedValue?.length>0 ?'update_qr':'scan_qr'} b c={Color.black} s={16} center/> */}
                    </Touch>
                
                    <View w={"100%"} mb={"4%"} bc={Color.black} bw={1}  br={4} c={"white"}>
                        {
                            getOnBoardResView('address', 'address', 'address', state.address,false)
                        }
                        <Text t={updateLocation?.latitude?"click_to_change":"click_to_select"} b />
                        <View  w={"100%"} bw={1} bc={"#CCCCCC"}/>
                        <MapView
                            language={"hn"}
                            mapType={"hybrid"}
                            style={{ alignSelf: 'stretch', height: 120}}
                            region={{ latitude:region.latitude, longitude: region.longitude,  latitudeDelta: 0.01, longitudeDelta: 0.01 }}
                        >
                            <Marker coordinate={{ ...region }} draggable />
                        </MapView>
                    </View>
                    <View>
                        <Text s={12} c={"black"} t={"please_take_image_of_house"} b/>
                        <View bw={1} bs={"dashed"} br={4} s={16} mb={30} h={180} w={'100%'}
                            bc={Color.lightGrayColor}  c={"#FFFFFF"}
                        > 
                            <Image 
                                source={state.houseImage?{ uri: state.houseImage }:require("./../assets-images/image2.jpg")} 
                                resizeMode="stretch"
                                style ={{width:"100%",height:"100%"}} 
                            />
                        </View>
                    </View>
                    <View row mb={16}>
                        <Touch br={4} mr={"2%"} bw={1} bc={"red"} boc={Color.lightGrayColor} jc h={48} w={'49%'}
                            onPress={()=>{setIsPreview(false)}} c={Color.white} s={14} b t={"reset"} />
                        <Touch ai jc h={48} w={'49%'} br={4} onPress={() => {
                            // if(validateonBoardResInfo()) return;
                            updateonBoardResInfo();
                            }}
                        s={14} c={Color.themeFontColor} bc={Color.themeColor} b t={"submit"} />
                     
                </View>
            </View>
            </ScrollView> 
           
        </View>
    
    }

    const showMapModal = () => (
        <Modal >
            <View row>
                <Text center b s={16} t="mapView" w={"50%"} />
                <Touch s={16} c={"red"} t={"close_m"} w={"50%"} onPress={() => setMapModal(false)} ai />
            </View>
            <View>
                <MapView
                    ref={ref => (this.mapView = ref)}
                    mapType={_mapType}
                    style={{ height: height - 200 }}
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
                <View style={{ position: "absolute", bottom: 30, right: 10 }} c={"white"} row w={"40%"}>
                    <Touch jc ai t={"Map"} w={"48%"} onPress={() => setMapType("standard")} c={_mapType == "standard" ? "green" : "black"} />
                    <View w={1} c={"black"} />
                    <Touch jc ai t={"Satelite"} w={"50%"} onPress={() => setMapType("hybrid")} c={_mapType == "hybrid" ? "green" : "black"} />
                </View>
            </View>
            <Touch jc bc={Color.themeColor} c={Color.themeFontColor} w={'100%'} br={4} mt={10}
                onPress={selectLocationFromMap} s={16} t={'select_location_from_map'} />
        </Modal>
    )
    
    return showScanner ? 
        <BarScanner getScannedValue={getScannedValue} closeModal={closeModal}/>:
        <View c={"#F0F0F0"} w={"100%"} h={"100%"}>
            <Header navigation={navigation} headerText={"boardUsers"}/>
            <View h={1} bw={0.5} bc={"#CCCCCC"}/>
            <ScrollView>
                <View mv={"4%"} w={"90%"} mh={"5%"}>
                    {
                        getOnBoardResView('name', 'firstName_lastName', 'name', state.name,true)
                    }
                    {
                        getOnBoardResView('phoneNumber', '9954672326', 'phoneNumber', state.phoneNumber,true, "numeric", 10)
                    }
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
                    {
                        showPicker("toiletStatus", toiletStatus)
                    }

                    <Touch bw={1} jc boc={Color.lightGrayColor} bc={"white"} w={'100%'} mb={16} br={4}
                        onPress={() => { setShowScanner(true)}}
                    >
                        {state?.scannedValue?.length>0 ?
                            <Text t={"scanned_val"+":"+" "+state.scannedValue} b c={"green"} s={14} center/>
                        :null}
                        <Text t={state?.scannedValue?.length>0 ?'update_qr':'scan_qr'} b c={Color.black} s={16} center/>
                    </Touch>
                
                    <View w={"100%"} mb={"4%"} bc={Color.black} bw={1}  br={4} c={"white"}>
                        {
                            getOnBoardResView('address', 'address', 'address', state.address,true)
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
                        <Text s={12} c={"black"} t={"please_take_image_of_house"} b/>
                        <View bw={1} bs={"dashed"} br={4} s={16} mb={30} h={180} w={'100%'}
                            bc={Color.lightGrayColor}  c={"#FFFFFF"}
                        > 
                            <Image 
                                source={state.houseImage?{ uri: state.houseImage }:require("./../assets-images/image2.jpg")} 
                                resizeMode="stretch"
                                style ={{width:"100%",height:"100%"}} 
                            />
                            <Touch t={state.houseImage?"retake_image":"take_image"} jc ai h={40} bc={"#F0F0F0"}
                                style={{position:"absolute",top:0,right:0}} w={150} c={state.houseImage?"red":"green"}
                                onPress={()=> {showCameraOfHouse()}}
                            />
                        </View>
                    </View>
                    <View row mb={16}>
                        <Touch br={4} mr={"2%"} bw={1} bc={"red"} boc={Color.lightGrayColor} jc h={48} w={'49%'}
                            onPress={()=>{formOnChangeUsers(RESET, {})}} c={Color.white} s={14} b t={"reset"} />
                        <Touch ai jc h={48} w={'49%'} br={4} onPress={() => {
                            // if(validateonBoardResInfo()) return;
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
                           
                            setIsPreview(true);
                            // updateonBoardResInfo();
                            }}
                        s={14} c={Color.themeFontColor} bc={Color.themeColor} b t={"confirm"} />
                     
                </View>
                {/* <View h={60}/> */}
            </View>
            </ScrollView> 
            {/* {
                mapModal ? 
                <MapInModal
                    closeMapModal = {()=>setMapModal(false)}
                    selectLocationFromMap = {selectLocationFromMap}
                /> : null
            } */}
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