import React, { useEffect, useState } from "react";
import { Dimensions, BackHandler,StyleSheet,TouchableOpacity,Image , ScrollView,Linking} from "react-native";
import { View, Text, TextInput, Touch, Picker, Loading } from "../ui-kit";
import Header from "../components/header";
import { AUTHUID, Color, generateUUID, PAGES, TOKEN,APP_CONFIG } from "../global/util";
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import { Camera,CameraType } from 'expo-camera';
import { updateComplaints,getComplaintsFromSettings } from "./../repo/repo";
import firebase from "./../repo/firebase";
import * as Location from 'expo-location';
import MapView,{Marker} from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconAnt from 'react-native-vector-icons/AntDesign';
import Styles from "../styles/styles";
import {useIsFocused, useNavigationState} from '@react-navigation/native';
import CameraDiv from "../components/camera";
import MapViewModal from "../components/mapViewModal";
let { width, height } = Dimensions.get("window");



export default ({ navigation }) => {

  const dispatch = useDispatch()
  const setDataAction = (arg) => dispatch(setData(arg));
  const [complaintObj, setComplaintObj] = useState({});
  const navigationValue = useNavigationState(state => state);
  const routeName = (navigationValue.routeNames[navigationValue.index]);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [startCamera, setStartCamera] = useState(false);
  const [imageModal, setImageModal] = useState(false);
  const [ispickerShow,setIsPickerShow] = useState(false);
  const [typesOfGarbageDump,setTypesOfGarbageDump] = useState([]);
  const isFocus = useIsFocused();
  const [complaintAddress,setComplaintAddress] = useState("");
  const [isHideMap,setIsHideMap] = useState(false);
  const [region, setRegion] = useState(APP_CONFIG.COORDINATES.coords);
  let { userInfo} = useSelector(state => state.testReducer) || {};

  const loadingInAddComplaint = show => {
    setDataAction({"loading": {show:show,message:"image_loading"}});
  }
  
  useEffect(() => {
    if(routeName === "AddComplaint"){
      const backAction = () => {
        if(ispickerShow){
          formOnChangeComText("typesOfComplaint", "")
          setIsPickerShow(false);
          return true;
        }
        if(startCamera){
          setStartCamera(false);
          return true;
        }
        if(imageModal){
          setImageModal(false);
          return true;
        }
        navigation.navigate(PAGES.COMPLAINT);
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );
      return () => backHandler.remove();
    }
  });

  useEffect(() =>{
    if(isFocus){
      setComplaintObj(Object.assign({}, complaintObj, {name:userInfo.name, phoneNumber : userInfo.phoneNumber }));
    }else{
      setComplaintObj({});
      setImageUrl("");
      setComplaintAddress("");
      setImageModal(false);
      setIsPickerShow(false);
      setStartCamera(false);
      loadingInAddComplaint(false);
    }
    getCameraPermission();
  },[isFocus])

  useEffect(() => {
   getComplaintsSettings();
  }, []);

  const getCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === "granted") {
      setDataAction({ 
        errorModalInfo: {
          showModal: false,
        }
      });
    }else{
      showErrorModalMsg("camera_permission");
    }
  };

  const showErrorModalMsg = (message, title = "message") => {
    setDataAction({ 
      errorModalInfo: {
        showModal: true,
        title,
        message,
        onClose: () =>onCloseEvent() // Ask for permissions again
      }
    });
  };

  const selectLocationFromMap = (locObj) => {
   
    setIsHideMap(false);
    let lat = locObj?.latitude ||APP_CONFIG.COORDINATES.coords.latitude ;
    let long = locObj?.longitude ||APP_CONFIG.COORDINATES.coords.longitude ;
    let _latlng = { latitude : lat, longitude : long };
    formOnChangeComText("location",_latlng);
    getAddressFromLocation(_latlng);

  }

  const onCloseEvent = async() =>{
    
    Linking.openSettings();
    await getCameraPermission();
  }


  const getComplaintsSettings = async() => {
    let complaintsData = await getComplaintsFromSettings();
  
    let complaintsArray = [];
    (complaintsData || []).map((key) => {
      complaintsArray.push({name :key,id:key});
    });
    setTypesOfGarbageDump(complaintsArray);
  }

  const getAddressFromLocation = async(locObj)=>{
    
    await Location.reverseGeocodeAsync({latitude:locObj.latitude,longitude: locObj.longitude}).
      then(result => {
        let address = result[0];
        let city=address?.city |"",district=address?.region||"",country=address?.country||"",
            name=address?.name||"",postalCode=address?.postalCode||""
        let _address =  name+", "+city+", "+district+"  "+postalCode+", "+country;
        setComplaintAddress(_address);
      });
  };

  const _updateUserData = ({userInfo}) => {
    let _userObj = {};
    _userObj[TOKEN] =userInfo[TOKEN] || "";
    _userObj[AUTHUID] = userInfo[AUTHUID];
    _userObj["name"] = userInfo.name;
    _userObj["phoneNumber"] = userInfo.phoneNumber;
    _userObj["areaCode"] = userInfo.areaCode;
    _userObj["ward"] = userInfo.areaCode;
    _userObj["ward_id"] = userInfo.areaCode;
    _userObj["address"] = complaintAddress || userInfo.address || "N/A";
    _userObj["municipality"] = userInfo.municipality || "chatrapur";
    return _userObj;
  }

  const storeComplaintMessage = async () => {
    if(isLoading){
      return errorModal("please_wait_until_image_is_loaded");
    }
    if(!complaintObj.typesOfComplaint) {
      return errorModal("please_enter_complaint_typesOfcomplaint");
    }
    if(!complaintObj?.location?.latitude){
      return errorModal("please_select_complaint_location");
    }
    
    if(!complaintObj.message) {
      return errorModal("please_enter_complaint_message");
    }
    if(!imageUrl){
      return errorModal("upload_image");
    }
    loadingInAddComplaint(true,"saving_complaint");
    complaintObj["photo_url"] = imageUrl;
    complaintObj["typesOfComplaint"] = complaintObj.typesOfComplaint;
    complaintObj["status"] = true;
    let userObj = _updateUserData({ userInfo });
    updateComplaints(complaintObj,userObj);
    loadingInAddComplaint(false);
    errorModal("we_shall_contact_you_soon");
    setImageUrl("");
    setComplaintAddress("");
    setComplaintObj(Object.assign({}, complaintObj, {typesOfComplaint:null,message:"" }));
    navigation.navigate(PAGES.COMPLAINT);
    
  }
  
  const errorModal = message => {
    setDataAction({
      errorModalInfo : {
        showModal : true,
        message,
      }
    });
  }
  const formOnChangeComText = (field, value) => setComplaintObj(Object.assign({}, complaintObj, {[field] : value}));
 
  const showUserDetails = (text, ph, name, value, h) => {
    return (
      <View mt={"4%"} w={'90%'} mh={"5%"}>
        <Text s={12} t={text} c={"black"} b/>
        <TextInput ml nl={1} ph={ph} pl={"4%"} h={h} bc={"white"}
          onChangeText={formOnChangeComText} name={name} bbw= {1}  
          tbc={'#F0F0F0'} value={value}  bw={1}
        />
      </View>
    )
  }

  const handleCloseSaveModal = () =>{
    if(!complaintObj?.typesOfComplaint){
      errorModal("please_select_c_type");
      return;
    }
    setIsPickerShow(false);
    
  }

  if(ispickerShow){
    return(
      <View a c={Color.backgroundModalColor} jc ai zi={999} to={0} le={0} h={height} w={width}>
          <View w={width - 48} br={8} c={Color.white} jc pa={16} style={{height:"auto",minHeight:100}}>
            <Text t={"please_select_c_type"} center s={20} />
            <View w={"90%"} bw={0.5} mh={"5%"} bc={"black"} mb={"4%"}/>
            <ScrollView>
              {typesOfGarbageDump.length>0&&typesOfGarbageDump.map((each,index)=>{
                
                return(
                  <Touch h={40} w={"90%"} ml={"5%"} row key={index} ai
                    onPress={() => {formOnChangeComText("typesOfComplaint", each.name)}}>
                    <View style={styles.radioCircle}>
                      {each.name === complaintObj?.typesOfComplaint && <View style={styles.selectedRb} />}
                    </View>
                    <Text center ml={2} s={18} t={each.name} />
                  </Touch>
                )
              })}
            </ScrollView>
            <View w={"90%"} bw={0.5} mh={"5%"} bc={"black"}/>
              <View row jc>
                <Touch h={40} w={"40%"} jc ai t={"close_c"} mb={4} boc={"#F0F0F0"} bc={"red"}
                  mt={2} mr={10} bw={2} onPress={() =>{ formOnChangeComText("typesOfComplaint", "");
                  setIsPickerShow(false)}} br={8}/>
                <Touch h={40} w={"40%"} jc ai t={"submit"} mb={4} boc={"#F0F0F0"} bc={"green"}
                  mt={2} bw={2} onPress={handleCloseSaveModal} br={8}/>
              </View>
          </View>
      </View>
    )
  }

  if(imageModal){
    return<View c={"white"} h={height} w={width}>
      <Image source={{ uri: imageUrl }} resizeMode="cover" 
        style={{width:width,height:(height*0.90)}}
      />
      <View row h={height*(0.10)} jc ai>
        <Touch jc h={36} w={'48%'} br={4} bw={1} mr={8}
          s={14} c={"white"} center t={ "retake" } bc={"red"}
          onPress={() => {setImageModal(false);setImageUrl("");setStartCamera(true)}}
        />
          <Touch jc h={36} w={'48%'} br={4} bw={1}
            s={14} c={"white"} center t={ "save_c" }
            onPress={()=>setImageModal(false)} bc={"green"}
          />
      </View>
    </View> 
  } 

  const complaintImageOnLoad = async (url) => {
    setImageUrl(url);
    setStartCamera(false);
  }

  if (startCamera) {
      return(
        <CameraDiv
          onLoadOp = {complaintImageOnLoad}
          handleCloseCam = {() =>{setImageUrl("");setStartCamera(false)}}
          imageRef = {"complaints/" + new Date().toLocaleDateString().split("/").join("-") + "/" + new Date().getTime() + '.jpg'}
        />
      )
  }

  if(isHideMap){
    return <View style={Styles.edContainer}>
        <IconAnt size={32} name={"closecircle"} style={{marginTop:20}}
                onPress={()=>{setIsHideMap(false)}} 
            />
        <MapViewModal
            intialCoordinates = {region}
            handleLocationSelected = {selectLocationFromMap}
            handleMapClose = {()=> setIsHideMap(false)}
        /> 
    </View>
  }

  
  return (
    <ScrollView>
      <Header navigation={navigation} headerText={"post_complaint"} b_Text={"gotoComplaints"} />
      <View w={"90%"} style={{ margin: "5%" }} br={4} c={"white"}>
        <Text t={"type_of_complaint"} b style={{ margin: "2%" }} />
        <View w={"100%"} bw={1} bc={"#CCCCCC"} />
        <Touch br={4} s={16} w={'90%'} mh={"5%"} mt={"2%"} mb={"2%"} ai jc bc={"#FFFFFF"} bw={1}
          onPress={() => { setIsPickerShow(true) }} h={48}
          t={complaintObj?.typesOfComplaint || "select_complaint"} />
      </View>

      {
        isLoading && <Loading mb={16} isLoading loadingText={"image_loading"} />
      }
      <View w={"90%"} mh={"5%"} mb={"4%"} br={4} c={"white"}>
        <Text t={"current_location"} b style={{ margin: "2%" }} />
        <View w={"100%"} bw={1} bc={"#CCCCCC"} />
      
        <Touch h={120} onPress={() => { setIsHideMap(true) }}>
          <MapView
            language={"hn"}
            mapType={"hybrid"}
            style={{ alignSelf: 'stretch', height: "100%" }}
            region={{ latitude: complaintObj?.location?.latitude || region.latitude, longitude: complaintObj?.location?.longitude || region.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
          >
            <Marker coordinate={{
              latitude: complaintObj?.location?.latitude || region.latitude,
              longitude:complaintObj?.location?.longitude || region.longitude
              }}  
            />
          </MapView>
        </Touch>
        <Text t={complaintObj?.location?.latitude ? "location_captured" : ""} b s={20}
          h={40} ml={10} c={"green"}
        />
      </View>
        
      <View w={"90%"} mh={"5%"} mb={"5%"} br={4} c={"white"}>
          <Text t={"describe_issue"} b   style={{margin:"2%"}}/>
          <View  w={"100%"} bw={1} bc={"#CCCCCC"}/>
          {
            showUserDetails('message', 'complaint_message', 'message', complaintObj.message,60)
          }
          
          <View w={"90%"} mh={"5%"}>
            <Text s={12} c={"black"} t={"capture_image"} b/>
            <Touch bw={1} bs={"dashed"} br={4} s={16} mb={12} h={100}w={'100%'} ai jc 
              boc={Color.lightGrayColor}  bc={"#FFFFFF"} onPress={()=> {setStartCamera(true);}}
            > 
              {imageUrl?
                <Image 
                  source={{ uri: imageUrl }} 
                  resizeMode="cover" 
                  style ={{width:"100%",height:"100%"}} 
                />:
                <View>
                  <Icon size={36}
                    name={"camera"}
                    color={"#979797"} 
                    style={{alignSelf:"center"}}
                  />
                  <Text t={"click_to_attach"}/>
                </View>
              }
            </Touch>
          </View>
      </View>

      <View row mt={10} w={"90%"} mh={"5%"}>
        <Touch ai jc h={48} br={8} w={"49%"} t={"cancel"} mr={"2%"} mb={16}
          s={16} c={Color.themeFontColor} bc={"red"} b
            onPress={() => {
              setImageUrl("");
              setComplaintObj(Object.assign({}, complaintObj, {typesOfComplaint:"",message:"" }));
              navigation.navigate(PAGES.COMPLAINT);
            }}
        />
        <Touch ai mb={16} jc h={48} w={'49%'} br={8} s={16} c={Color.themeFontColor}
          bc={Color.themeColor} onPress={storeComplaintMessage} t={"submit"} 
        />  
      </View>
      
           
     
    </ScrollView>
  )

};


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
       }

});

