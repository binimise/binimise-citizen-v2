import React, { useEffect, useState } from "react";
import { Dimensions, BackHandler,StyleSheet,TouchableOpacity,Image , ScrollView} from "react-native";
import { View, Text, TextInput, Touch, Picker, Loading } from "../ui-kit";
import Header from "../components/header";
import { AUTHUID, Color, generateUUID, PAGES, TOKEN,APP_CONFIG } from "../global/util";
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import { Camera } from 'expo-camera';
import { updateComplaints,getComplaintsFromSettings } from "./../repo/repo";
import firebase from "./../repo/firebase";
import * as Location from 'expo-location';
import MapView,{Marker} from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconAnt from 'react-native-vector-icons/AntDesign';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useNavigationState} from '@react-navigation/native';
let { width, height } = Dimensions.get("window");



export default ({ navigation }) => {

  const dispatch = useDispatch()
  const setDataAction = (arg) => dispatch(setData(arg));
  const [complaintObj, setComplaintObj] = useState({});
  const navigationValue = useNavigationState(state => state);
  const routeName = (navigationValue.routeNames[navigationValue.index]);
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [camera, setCamera] = useState({});
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [startCamera, setStartCamera] = useState(false);
  const [imageModal, setImageModal] = useState(false);
  const [ispickerShow,setIsPickerShow] = useState(false);
  const storageRef = firebase().firebase.storage();
  const [typesOfGarbageDump,setTypesOfGarbageDump] = useState([]);
  // let userInfo = useSelector(state => state.testReducer.userInfo) || {};
  let { userInfo,selectedLanguage} = useSelector(state => state.testReducer) || {};

  useEffect(() => {
    if(routeName === "AddComplaint"){
      const backAction = () => {
        navigation.navigate(PAGES.COMPLAINT)
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );
      return () => backHandler.remove();
    }
  });

  useEffect(() => {
    setComplaintObj(Object.assign({}, complaintObj, {name:userInfo.name, phoneNumber : userInfo.phoneNumber }));
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    getComplaintsSettings();
    getAddress();
  }, []);


  const getComplaintsSettings = async() => {
    let complaintsData = await getComplaintsFromSettings();
    console.log("c",complaintsData)
    let complaintsArray = [];
    (complaintsData || []).map((key) => {
      complaintsArray.push({name :key,id:key});
    });
    setTypesOfGarbageDump(complaintsArray);
  }
  console.log("t",typesOfGarbageDump)
  const getAddress =async ()=>{
    let location = await Location.getLastKnownPositionAsync({enableHighAccuracy: true});
    let lat = location?.coords?.latitude ||APP_CONFIG.COORDINATES.coords.latitude ,
      long = location?.coords?.longitude ||APP_CONFIG.COORDINATES.coords.longitude ;
    let _latlng = { latitude : lat, longitude : long }
    formOnChangeComText("location",_latlng);
  };

  const _updateUserData = ({userInfo}) => {
    let _userObj={}
    _userObj[TOKEN] =userInfo[TOKEN] || "";
    _userObj[AUTHUID] = userInfo[AUTHUID];
    _userObj["name"] = userInfo.name;
    _userObj["phoneNumber"] = userInfo.phoneNumber;
    _userObj["areaCode"] = userInfo.areaCode;
    _userObj["ward"] = userInfo.areaCode;
    _userObj["ward_id"] = userInfo.areaCode;
    _userObj["address"] = userInfo.address || "";
    _userObj["municipality"] = userInfo.municipality || "buguda";
    return _userObj;
  }

  const storeComplaintMessage = async () => {
    if(isLoading){
      return errorModal("please_wait_until_image_is_loaded");
    }
    if(!complaintObj.typesOfComplaint) {
      return errorModal("please_enter_complaint_typesOfcomplaint");
    }
    
    if(!complaintObj.message) {
      return errorModal("please_enter_complaint_message");
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

  const loadingInAddComplaint = show => {
    setDataAction({"loading": {show:show,message:"image_loading"}});
  }

  const formOnChangeComText = (field, value) => setComplaintObj(Object.assign({}, complaintObj, {[field] : value}));
 
  const takePicture = async () => {
    if (!camera) return;
    try {
      const options = { quality: 0.05 };
      const photo = await camera.takePictureAsync(options);
      // setStartCamera(false);
      loadingInAddComplaint(true,"image_loading");
      const reference = storageRef.ref("complaints/" + new Date().toLocaleDateString().split("/").join("-") + "/" + new Date().getTime() + '.jpg');
      reference.putFile(photo.uri).then(()=> {
        reference.getDownloadURL().then(url => {
          loadingInAddComplaint(false);
          setImageUrl(url);
          setImageModal(true);
          
        }).catch((error) => { 
          loadingInAddComplaint(false); 
          errorModal("oops_there_is_an_error_while_getting_image_url");
        });
      }).catch(() => {
        loadingInAddComplaint(false);
        errorModal("Oops!! there is an error while storing image"); 
      });
    } catch(e) {}
    setStartCamera(false);
  }

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

  if(ispickerShow){
    return(
      <View a c={Color.backgroundModalColor} jc ai zi={999} to={0} le={0} h={height} w={width}>
          <View w={width - 48} br={8} c={Color.white} jc pa={16} h={"90%"}>
            <Text t={"select_type"} center s={20} />
            <View w={"90%"} bw={0.5} mh={"5%"} bc={"black"} mb={"4%"}/>
            <ScrollView>
              {typesOfGarbageDump.length>0&&typesOfGarbageDump.map((each,index)=>{
                console.log("e",each)
                return(
                  <Touch h={40} w={"90%"} ml={"5%"} row key={index} ai
                    onPress={() => {formOnChangeComText("typesOfComplaint", each.name)}}>
                    <View style={styles.radioCircle}>
                      {each.name===complaintObj?.typesOfComplaint && <View style={styles.selectedRb} />}
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
                  mt={2} bw={2} onPress={() =>{setIsPickerShow(false)}} br={8}/>
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

  if(startCamera){
    return( 
      <Camera
        style={{height,width}}
        ratio="4:3"
        type={type}
        ref={(ref) => setCamera(ref)}
      >
        <View a to={height-50} row jc w={width}>
          <Touch fl={1} h={48} c={Color.white} s={16} t={"cancel"} w={width/2}
            onPress={()=> {setStartCamera(false);}} />
          <Touch fl={1} h={48} c={Color.white} s={16} t={"save_c"} w={width/2}
            onPress={takePicture} />
        </View>
      </Camera> 
    )
  }

 
  
  return (
    <ScrollView>
      <Header navigation={navigation}  headerText={"post_complaint"} b_Text={"gotoComplaints"}/>
      <View w={"90%"} style={{margin:"5%"}}  br={4} c={"white"}>
        <Text t={"type_of_complaint"} b  style={{margin:"2%"}}/>
        <View  w={"100%"}  bw={1} bc={"#CCCCCC"}/>
        <Touch br={4} s={16} w={'90%'} mh={"5%"} mt={"2%"} mb={"2%"} ai jc bc={"#FFFFFF"} bw={1}
          onPress={()=> {setIsPickerShow(true)}} h={48}
          t={complaintObj?.typesOfComplaint!=null?complaintObj?.typesOfComplaint:"select_complaint"}/>
      </View>
     
      {
        isLoading && <Loading mb={16} isLoading loadingText={"image_loading"}/>
      }
      <View w={"90%"} mh={"5%"} mb={"4%"}  br={4} c={"white"}>
          <Text t={"current_location"} b  style={{margin:"2%"}}/>
          <View  w={"100%"} bw={1} bc={"#CCCCCC"}/>
          {complaintObj?.location?
            <MapView
              language={"hn"}
              mapType={"hybrid"}
              style={{ alignSelf: 'stretch', height: 100 }}
              region={{ latitude:complaintObj?.location?.latitude, longitude: complaintObj?.location?.longitude,  latitudeDelta: 0.01, longitudeDelta: 0.01 }}
            >
              <Marker
                coordinate={{latitude: complaintObj?.location?.latitude,longitude:complaintObj?.location?.longitude}} 
              />
            </MapView>:null
          }
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
                  <Icon size={18}
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
              setComplaintObj(Object.assign({}, complaintObj, {typesOfComplaint:null,message:"" }));
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
       },
       pickerContainer: {
        width: "100%",
        alignSelf: 'center',
        backgroundColor:"white"
        
      }
  

});

