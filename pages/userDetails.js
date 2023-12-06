import React, {useState, useEffect, useReducer}  from 'react';
import { ScrollView,Switch, Image,StyleSheet,Dimensions,Alert,BackHandler} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import { View, Text, Touch, TextInput, PickerModal ,Loading} from "./../ui-kit";
import { Checkbox } from 'react-native-paper';
import * as Location from 'expo-location';
import { addUserData, getAllAreas, getUserData ,getAppSettings,} from "./../repo/repo";
import { Color, PAGES, PHONENUMBER, APP_CONFIG, USERINFO, AUTHUID, TOKEN } from '../global/util';
import MapView,{Marker} from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconF from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from "../components/header";
import CustomMultiPicker from "react-native-multiple-select-list";
import {useNavigationState} from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Camera,CameraType } from 'expo-camera'; 
import firebase from "./../repo/firebase";
let {height,width} =Dimensions.get("window");


const initialState = {
    name : "",
    phoneNumber : "",
    userType : "app_user",
    email:"",
    address : "",
    areaCode : "",
    municipality : APP_CONFIG.MUNICIPALITY_NAME,
    profile :""
    
}
  
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
    return {
      ...state,
      [field]: value
    }
}

export default ({ navigation }) => {

    const [state, dispatchStateAction] = useReducer(reducer, initialState);
    const [areas, setAreas] = useState({});
    const [region, setRegion] = useState(APP_CONFIG.COORDINATES.coords);
    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    let { userInfo } = useSelector(state => state.testReducer) || {};
    const [currentLocation, setCurrentLocation] = useState({});
    const [updateLocation, setUpdateLocation] = useState({});
    const [isNotificationOn, setIsNotificationOn] = useState(true);
    const [isAlertOn, setIsAlertOn] = useState(true);
    const [isPrivate, setIsPrivate] = useState(false);
    const [isHideMap, setIsHideMap] = useState(true);
    const [isExpandLocation, setIsExpandLocation] = useState(false);
    const [isExpandAlert, setIsExpandAlert] = useState(false);
    const [isExpandWard, setIsExpandWard] = useState(false);
    const [isExpandAssignedTags, setIsExpandAssignedTags] = useState(false);
    const [isExpandTags, setIsExpandTags] = useState(false);
    const [isExpandBox, setIsExpandBox] = useState(false);
    const[userTags,setUserTags] = useState([]);
    const [selectedItems, setSelectedItems] = useState({});
    const [newlyAddedTag, setNewlyAddedTag] = useState("");
    const [isPickerShow,setIsPickerShow] = useState(false);
   const [selectedArray,setSelectedArray] = useState([]);
   const [selectedKey,setSelectedKey] = useState("");
   const [selectedValue,setSelectedValue] = useState("");
    const [documentId, setDocumentId] = useState("");
    const [_mapType,setMapType] = useState("hybrid"); 
    const navigationValue = useNavigationState(state => state);
    const routeName = (navigationValue.routeNames[navigationValue.index]);
    let { tokenFromOneSignal } = useSelector(state => state.testReducer) || {};
    const [image, setImage] = useState("");
    const [showImageLibrary,setShowImageLibrary] = useState(false);
    const [startCamera, setStartCamera] = useState(false);
    const [type, setType] = useState(CameraType.back);
    const [camera, setCamera] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [hasPermission, setHasPermission] = useState(null);
    const storageRef = firebase().firebase.storage();

    useEffect(() => {
        if(routeName === "UserDetails"){
          const backAction = () => {
            navigation.navigate(PAGES.PROFILE)
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
        formOnChangeText(USERINFO, userInfo);
        updateLocationFromDb();
    }, [userInfo?.name])

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
          })();
        getAreas(); 
        setFormPhoneNumber();
        getDynamicDataFromSettings();
    }, []);

    const getDynamicDataFromSettings = async ()=>{
        let customizedValues = await getAppSettings();
        let local_userTa = customizedValues?.userlist ||{};
        let doc_id = customizedValues.length>0?customizedValues[0].id:"aW6v6b4vlYxlbWxVUFGc"
        setDocumentId(doc_id);
        setSelectedItems(local_userTa);
    }

    const updateLocationFromDb = () => {
        let obj = { latitude: userInfo?.lat, longitude: userInfo?.long, latitudeDelta: 0.01, longitudeDelta: 0.01};
        if(userInfo?.authUid){
            setUpdateLocation(obj);
            setRegion(obj);
        }
        setUserTags(userInfo?.userTags || []);
        setIsAlertOn(userInfo?.isAlertOn === false?userInfo.isAlertOn :isAlertOn  )
        setIsNotificationOn(userInfo?.isNotificationOn === false?userInfo?.isNotificationOn:isNotificationOn)
        setIsPrivate(userInfo?.isPrivate  ||isPrivate )
    }

    const setFormPhoneNumber = async () => {
        let phoneNumber = await AsyncStorage.getItem(PHONENUMBER);
        if(phoneNumber) {
            formOnChangeText(PHONENUMBER, phoneNumber);
        }
    }

    const getAreas = async () => {
        
        let areaList = await getAllAreas();
        let modifiedArrayList = []
        areaList.map((eachitem)=>{
            let obj={"id":eachitem.data().id, "name": eachitem.data().name}
            modifiedArrayList.push(obj);
        })
        let sortedlist = modifiedArrayList.map(item => item.id.toLowerCase()).
            sort((a,b) => parseInt(a.toLowerCase().replace('ward ', '').replace("ward", '')) > parseInt(b.toLowerCase().replace('ward ', '').replace("ward", ''))).
            map((item, index) => Object.assign({}, {id : item, name: item}))
        
        setAreas(sortedlist);
    }
    
    const toggleLoading = show => {
        setDataAction({"loading": {show}});
    }
    
    const formOnChangeText = (field, value) => {
        dispatchStateAction({ field, value });
    }

    const getCurrentLocation = async () => {
        try {
            await Location.enableNetworkProviderAsync().then().catch(_ => null);
            let location = await Location.getLastKnownPositionAsync({enableHighAccuracy: true});
            setCurrentLocation(location.coords);
            return location.coords;
        }catch(e){
            showErrorModalMsg("error_in_getting_current_location");
        }
    }

    const showErrorModalMsg = (message, title = "message") => {
        setDataAction({ 
            errorModalInfo : {
                showModal : true, title, message
            }
        })
    };

    const skipValidationFields = field => {
        return ["profile","email"].includes(field);
    }

    const containsOnlyNumbers = (str) => {
        // Use a regular expression to match only numeric characters (0-9)
        return /^\d+$/.test(str);
    }
    
    const validateUserInfo = () => {
        let message = ["please_enter", " "];
        for(let key in initialState) {
            if(!skipValidationFields(key) && !state[key]){
                message.push(key);
                showErrorModalMsg(message);
                return true
            }
        }
        if (!state?.phoneNumber) {
            return showErrorModalMsg("please_enter_number")
        }
        if (!containsOnlyNumbers(state?.phoneNumber) || state?.phoneNumber.length != 10) {
            return showErrorModalMsg("please_enter_10_digit_phonenumber")
        }
        if(!updateLocation?.latitude){
            showErrorModalMsg("error_in_getting_location_please_set_location_in_map");
            return true
        }
        return false
    }

    const updateUserData = ({userInfo, token,authUid, ward, lat, long,userTags,isAlertOn,isNotificationOn,isPrivate}) => {
        userInfo[TOKEN] = isNotificationOn?token:"";
        userInfo[AUTHUID] = authUid;
        userInfo["ward"] = ward;
        userInfo["lat"] = lat;
        userInfo["long"] = long;
        userInfo["isPrivate"] = isPrivate ;
        userInfo["userTags"] = userTags ;
        userInfo["isAlertOn"] = isAlertOn ;
        userInfo["isNotificationOn"] = isNotificationOn ;
        return userInfo;
    }

    const updateUserInfo = async () => {
        toggleLoading(true);
        
        try {
            let userInfo = JSON.parse(JSON.stringify(state));
            userInfo.areaCode = userInfo.areaCode || "ward 1";
            let authUid = await AsyncStorage.getItem(AUTHUID);
            let token = (userInfo?.token)?userInfo.token:(tokenFromOneSignal || "");
          
            userInfo = updateUserData({ userInfo,token,authUid, ward: userInfo.areaCode.toLowerCase(), 
                                        lat: updateLocation?.latitude, long: updateLocation?.longitude,
                                        userTags,isAlertOn,isNotificationOn,isPrivate });
            userInfo.profile = image?image:userInfo.profile;
            await addUserData(userInfo);
            let uInfo = await getUserData(userInfo.phoneNumber);
            if(!uInfo){
                toggleLoading(false);
                return showErrorModalMsg("Failed to insert user");
            }
            setDataAction({ updateUserInfoFlag: false, userInfo: uInfo});
            AsyncStorage.removeItem(PHONENUMBER);
            AsyncStorage.setItem(USERINFO, JSON.stringify(uInfo));
            navigation.navigate(PAGES.SIGNUPCOMPLETE);
        } catch(err){
            console.log(err);
        }
        toggleLoading(false);
    }
  
    const showSucessAlert  = () =>{
        Alert.alert(
          "Dear User",
           "Your Location Sucessfully Updated",
          [
            { text: "OK", onPress: () => console.log("OK Pressed") }
          ]
        );
    }
    

    const selectLocationFromMap = () => {
        setUpdateLocation(region);
        setIsHideMap(true);
        setIsExpandLocation(false);
        // showSucessAlert();
        showErrorModalMsg("location_updated","dear_user")
    }
  
    const getSignUpView = (text, ph, name, value,flag,keyboardType, maxLength) => {
        return (
            <View mb={12}>
                <View row>
                    <Text s={12} t={text} c={"black"} b/>
                    {flag&&<Text s={12} t={"*"} c={Color.red} b/>}
                </View>
                
                <TextInput ml nl={1} ph={ph} pl={16} h={40} 
                    bc={'#FFFFFF'} 
                    k={keyboardType} maxLength={maxLength}
                    onChangeText={formOnChangeText} name={name}
                    w={'100%'} bbw= {1} 
                    bbc={'#F0F0F0'}
                   value={value}
                />
            </View>
        )
    }

    toggleAlertSwitch = () => setIsAlertOn(previousState => !previousState);
    toggleNotificationSwitch = () => setIsNotificationOn(previousState => !previousState);

    const showLocation = ()=>(
        <View w={"100%"} mb={20} bw={1} bc={'#F0F0F0'}>
            <Touch w={"100%"} boc={"#F0F0F0"}  h={48} bc={"#F8F8F8"} jc onPress={() =>{setIsExpandLocation(false)}}>
                <View row>
                    <Text c={Color.themeColor} le={2} s={14}  b lh={18} t={"location"}/>
                    <IconF size={24} name={"angle-up"} color={"green"} style={{position:"absolute",right:8}}/> 
                </View>
            </Touch>
            <View row>
                <Text s={18} t={"add_location"} c={"black"} b/>
                <View row style={{position:"absolute",right:0}}>
                    <Icon size={16} name={"crosshairs"} color={"green"}/> 
                    <Touch h={20} onPress={() =>{setIsHideMap(false)}}>
                        <Text c={"green"} s={16} t={"locateme"}/>
                    </Touch>
                </View>
            </View>
        </View>
    )

    const _showAlerts = (text1,text2,text3)=>(
        <View row mb={16} mt={20} width={"90%"}>
            <Text s={18} c={"black"} t={text1} b />
            <Switch
                thumbColor={text2? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                style={{position:"absolute",right:0}}
                onValueChange={text3}
                value={text2}
            />
        </View>
    )

    const showAlerts = ()=>(
        <View w={"100%"} mb={20} bw={1} bc={'#F0F0F0'}>
            <Touch w={"100%"} h={48} boc={"#F0F0F0"} jc bc={"#F8F8F8"} onPress={() =>{setIsExpandAlert(false)}}>
                <View row>
                    <Text c={Color.themeColor} le={2} s={14}  b lh={18} t={"alert"}/>
                    <IconF size={24} name={"angle-up"} color={"green"} style={{position:"absolute",right:8}}/> 
                </View>
            </Touch>
            {_showAlerts("show_alert",isAlertOn,toggleAlertSwitch)}
            {_showAlerts("show_notification",isNotificationOn,toggleNotificationSwitch)}
        </View>
    )
 
    const showAssignedTags = ()=>(
        <View w={"100%"} mb={20} bw={1} bc={'#F0F0F0'}>
            <Touch w={"100%"} h={48} boc={"#F0F0F0"} bc={"#F8F8F8"} jc onPress={() =>{setIsExpandAssignedTags(false)}}>
                <View row>
                    <Text le={2} c={Color.themeColor} s={14} b lh={18} t={"assigned_tags"}/>
                    <IconF size={24} name={"angle-up"} color={"green"} style={{position:"absolute",right:8}}/> 
                </View>
            </Touch>
            <View mb={12} mt={10}>
                {Array.isArray(userTags)&&userTags.length>0?
                    <View  w={"100%"}  c={'#FFFFFF'} bc={"#666666"} row style={{display:"flex",flexWrap: 'wrap'}}> 
                        {userTags.map((each,index)=>(
                            <Touch key={index} ml={2} boc={'#F0F0F0'} h={30} w={"30.00%"} 
                                br={10} bw={2} mt={"2%"}>
                                <Text c={Color.themeColor} center  t={each}/>
                            </Touch>
                        ))}
                    </View>
                :null}
              
            </View>
        </View>
    )

    const addNewTagIntoBackend = async()=>{
        userTags.push(newlyAddedTag);
        setUserTags(userTags);
        setIsExpandBox(false);
        setNewlyAddedTag("");
        showErrorModalMsg("tag_added");
    }

    const showTags = ()=>(
        <View w={"100%"} mb={20} bw={1} bc={'#F0F0F0'}>
             <Touch row w={"100%"} h={48} boc={"#F0F0F0"} bc={"#F8F8F8"} 
                ai onPress={() =>{setIsExpandTags(false)}}
            >
                <Text le={2} c={Color.themeColor} s={14} b lh={18} t={"_tags"}/>
                <IconF 
                    size={24} 
                    name={"angle-up"} 
                    color={"green"} 
                    style={{position:"absolute",right:8}}
                /> 
            </Touch>
            {Array.isArray(userTags)&&userTags.length>0?
                <View w={"90%"} mh={"5%"} bc={"#757575"} bw={2} c={"white"}
                    mv={10} pa={6} row style={{display:"flex",flexWrap: 'wrap',}}
                > 
                    {userTags.map((each,index)=>(
                        <Touch key={index} mh={4} boc={'#F0F0F0'} h={30} w={"30%"} 
                            br={10} bw={2} mt={4}
                        >
                            <Text c={Color.themeColor} center  t={each}/>
                        </Touch>
                    ))}
                </View>
            :null}
            {isExpandBox?
                <View mb={12} mt={3}>
                    <TextInput ml nl={4} ph={"add_tag"} pl={16} h={40} bc={'#FFFFFF'} bbc={'black'}  
                        w={'90%'} bbw= {2} style={{marginLeft:20}} value={newlyAddedTag}
                        onChangeText={ (field, value)=> setNewlyAddedTag(value)}
                    /> 
                    <Touch boc={"#F0F0F0"} bc={Color.themeColor} b jc  ai  h={30} br={4} s={16} w={"90%"} mt={4}
                        c={Color.themeFontColor}  ml={20}  onPress={addNewTagIntoBackend}  t={"submit"} 
                    />
                </View>: 
                <Touch boc={"#F0F0F0"} bc={Color.themeColor} b jc  ai  h={30} br={4} s={16} w={"90%"} 
                    c={Color.themeFontColor}  ml={20} onPress={() =>{setIsExpandBox(true)}} t={"add_newtag"} mt={4}
                />
            }
            <CustomMultiPicker
                options={selectedItems}
                search={true} // should show search bar?
                multiple={true} //
                placeholder={"Search"}
                placeholderTextColor={'#757575'}
                returnValue={"label"} // label or value
                callback={(res)=>{  console.log("res",res)
                let temp = JSON.parse(JSON.stringify(res));
                setUserTags(temp || []);}} // callback, array of selected items
                rowBackgroundColor={"#eee"}
                rowHeight={40}
                rowRadius={5}
                iconColor={"#00a2dd"}
                iconSize={28}
                selectedIconName={"ios-checkmark-circle-outline"}
                unselectedIconName={"ios-radio-button-off-outline"}
                // scrollViewHeight={100}
                selected={userTags} // list of options which are selected by default
            />
        </View>
    )

  

    const showWards = ()=>(
        <View w={"100%"} mb={20} bw={1} bc={'#F0F0F0'}>
            <Touch w={"100%"} h={48} boc={"#F0F0F0"} bc={"#F8F8F8"} jc onPress={() =>{setIsExpandWard(false)}}>
                <View row>
                    <Text c={Color.themeColor} s={14} le={2} b lh={18} t={"ward_details"}/>
                    <IconF 
                        size={24} 
                        name={"angle-up"} 
                        color={"green"} 
                        style={{position:"absolute",right:8}}
                    /> 
                </View>
            </Touch>
            {/* <View>
                <Text s={12} c={"black"} t={'wardnum'} b/>
                <View style={styles.pickerContainer}>
                {
                    Array.isArray(areas) ? <Picker h={45} w={"100%"}
                        items={areas.
                            map(item => item.data().name.toLowerCase()).
                            sort((a,b) => parseInt(a.toLowerCase().replace('ward ', '').replace("ward", '')) > parseInt(b.toLowerCase().replace('ward ', '').replace("ward", ''))).
                            map((item, index) => Object.assign({}, {id : item, name: item}))}
                        selectedValue={state.areaCode}
                        onValueChange={(itemValue, itemIndex) => formOnChangeText("areaCode", itemValue)}
                        backgroundColor={'#FFFFFF'} 
                    /> : null
                }
                </View>
            </View> */}
            <View br={4} c={"white"} bw={1} mb={4}>
                <Text t={'wardnum'} b style={{ margin: "2%" }} />
                <View w={"100%"} bw={1} bc={"#CCCCCC"} />
                <Touch br={4} s={16} w={'90%'} mh={"5%"} mt={"2%"} mb={"2%"} ai jc bc={"#FFFFFF"} bw={1}
                    onPress={() => {
                        setSelectedArray(areas);
                        setSelectedKey("areaCode");
                        setSelectedValue(state.areaCode);
                        setIsPickerShow(true)
                    }} t={state.areaCode ? state.areaCode : "select_your_ward"}
                />
            </View>
        </View>

    )

    const openImagePickerAsync = async () => {
        let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
        if (permissionResult.granted === false) {
          alert("Permission to access camera roll is required!");
          return;
        }
    
        let pickerResult = await ImagePicker.launchImageLibraryAsync();
        
        let image_url = pickerResult?.assets?.[0]?.uri;
        setShowImageLibrary(false);
        toggleLoading(true);
        const reference = storageRef.ref("profile/" + new Date().toLocaleDateString().split("/").join("-") + "/" + new Date().getTime() + '.jpg');
          reference.putFile(image_url).then(()=> {
            reference.getDownloadURL().then(url => {
              setImage(url);
              formOnChangeText("profile", url)
              toggleLoading(false);
            }).catch((error) => { 
                toggleLoading(false);
                errorModal("oops_there_is_an_error_while_getting_image_url");
            });
          }).catch(() => {
            toggleLoading(false);
            errorModal("Oops!! there is an error while storing image"); 
          });
       
    }

    const showImageOptionList = ()=>{
        return(
            <View a c={Color.backgroundModalColor} jc ai zi={999} to={0} le={0} h={height} w={width}>
                <IconAnt size={32} color={"red"}  name={"closecircle"}
                    style={{marginTop:20}}
                    onPress={()=>{setShowImageLibrary(false)}} 
                />
                <View w={width - 48} br={8} c={Color.white} jc pa={16} mt={20}>
                    <Text center b s={16} mb={14} t="PickImage"/>
                    <View row>
                        <Touch onPress={()=>openImagePickerAsync()} w={"49%"} mr={"2%"}>
                            <Icon size={40} name={"photo"} style={{alignSelf:"center",color:"green"}}/> 
                            <Text t={"choose_image"} s={20} center c={"green"}/>
                        </Touch>
                        <Touch   onPress={()=>{setShowImageLibrary(false);setStartCamera(true);}} w={"49%"}>
                            <Icon size={40} name={"camera"} style={{alignSelf:"center",color:"green"}}/> 
                            <Text t={"click_image"} s={20} center c={"green"}/>
                        </Touch>
                    </View>
                </View>
            </View>
        )
    }

    const takePicture = async () => {
        if (!camera) return;
          try {
            const options = { quality: 0.1 };
            const photo = await camera.takePictureAsync(options);
            setShowImageLibrary(false);
            toggleLoading(true);
            const reference = storageRef.ref("profile/" + new Date().toLocaleDateString().split("/").join("-") + "/" + new Date().getTime() + '.jpg');
            reference.putFile(photo.uri).then(()=> {
              reference.getDownloadURL().then(url => {
                setImage(url);
                formOnChangeText("profile", url);
                toggleLoading(false);
              }).catch((error) => { 
                toggleLoading(false);
                errorModal("oops_there_is_an_error_while_getting_image_url");
              });
            }).catch(() => {
                toggleLoading(false);
              errorModal("Oops!! there is an error while storing image"); 
            });
        } catch(e) {}
        setStartCamera(false);
    }

    const showOpenCamera = ()=>{
        return(
            <View a c={Color.backgroundModalColor} jc ai zi={999} to={0} le={0} h={height} w={width}>
            <View w={width} br={8} c={Color.white} jc  h={"100%"}>
                <Camera
                    style={{height:"100%",width:"100%"}}
                    type={type}
                    ref={(ref) => setCamera(ref)}
                >
                <Touch a to={20} le={20} h={60} bc={Color.white} 
                  br={32} w={60} jc ai onPress={()=>setStartCamera(false)}
                >
                    <IconAnt size={36} 
                        name={"close"}
                        color={Color.themeColor}
                    />
                </Touch>
                <Touch a bo={10} le={20} h={60} bc={Color.white} br={32} w={60} jc ai  
                    onPress={()=>{type == CameraType.front?setType(CameraType.back):setType(CameraType.front)}}
                >
                    <MaterialIcons size={36}
                        name={"camera-flip-outline"}
                        color={Color.themeColor} 
                    />
                </Touch>
                <Touch a bo={10}  h={60} bc={Color.white} br={32} w={60}  jc ai
                    style={{alignSelf:"center"}} onPress={takePicture}
                >
                    <IconAnt size={36} 
                        name={"camera"} 
                        color={Color.themeColor}
                    />
                </Touch>
              </Camera> 
              </View>
          </View>
       )
    }

    const selectedPickerData = (key,data)=>{
        setSelectedValue(data)
        formOnChangeText(key,data)
    }
    

    return (
        <View style={styles.container}>  
            {!isHideMap?
                <IconAnt size={32} name={"closecircle"} style={{marginTop:20}}
                    onPress={()=>{setIsHideMap(true)}} 
                />
                :null
            }
            
            {isHideMap?
                <View h={"100%"} w={"100%"}>
                    <Header navigation={navigation} headerText={"editprofile"} b_Text={"gotoProfile"}/>
                    <ScrollView 
                        contentContainerStyle={{ paddingHorizontal: 16,paddingTop:10}}
                        showsVerticalScrollIndicator={false}
                    >
                        <View w={"100%"} h={110} mt={20}>
                            <Image 
                                source = {image?{uri:image}:
                                state.profile?{ uri:state.profile}:require("./../assets/blankavatar.png")}
                                style = {{height:"100%",width:110,borderRadius:20,
                                borderWidth:2,borderColor:"black",alignSelf:"center"
                                }} resizeMode="cover"
                            />
                            <Touch h={40} w={40} a br={8} ml={(55*width)/100} mt={85}
                                onPress={() => {setShowImageLibrary(true)}}
                            >
                                <Icon size={30} name={"camera"} color={"#979797"}/>
                            </Touch>
                        </View>
                        

                        {
                            getSignUpView('name', 'firstName_lastName', 'name', state.name,true)
                        }

                        {
                            getSignUpView('phoneNumber', '9954672326', 'phoneNumber', state.phoneNumber,true, "numeric", 10)
                        }
                        {
                            getSignUpView('emailid', 'email', 'email', state.email)
                        }
                        {
                            getSignUpView('address', 'm.g. road', 'address', state.address,true,"","","crosshairs","Locate Me")
                        }

                        <View bw={1} w={"100%"}  bc={'#F0F0F0'} mb={20}/>
                        {isExpandWard?showWards():
                            <Touch h={40} w={"100%"} boc={"#F0F0F0"} 
                                onPress={() =>{setIsExpandWard(true)}}>
                                <View row>
                                    <Text c={"black"} s={14} b lh={18} t={"ward_details"}/>
                                    <Text s={12} t={"*"} c={Color.red} b/>
                                    <IconF 
                                        size={24}
                                        style={{position:"absolute",right:8}}
                                        name={"angle-down"}
                                        color={"black"} 
                                    /> 
                                </View>
                            </Touch>
                        }
                        <View bw={1} w={"100%"}  bc={'#F0F0F0'} mb={20}/>
                        {isExpandLocation?showLocation():
                            <Touch h={40} w={"100%"} boc={"#F0F0F0"} 
                                onPress={() =>{setIsExpandLocation(true)}}>
                                <View row>
                                    <Text c={"black"} s={14} b lh={18} t={"add_location"}/>
                                    <Text s={12} t={"*"} c={Color.red} b/>
                                    <IconF 
                                        size={24}
                                        style={{position:"absolute",right:8}}
                                        name={"angle-down"}
                                        color={"black"} 
                                    /> 
                                </View>
                            </Touch>
                        }

                        <View bw={1} w={"100%"}  bc={'#F0F0F0'} mb={20}/>
                        {isExpandAlert?showAlerts():
                            <Touch h={40} w={"100%"} boc={"#F0F0F0"} 
                                onPress={() =>{setIsExpandAlert(true)}}>
                                <View row>
                                    <Text c={"black"} s={14} b lh={18} t={"show_alerts"}/>
                                    <IconF 
                                        size={24}
                                        style={{position:"absolute",right:8}}
                                        name={"angle-down"}
                                        color={"black"} 
                                    /> 
                                </View>
                            </Touch>
                        }
                        
                         <View bw={1} w={"100%"}  bc={'#F0F0F0'} mb={20}/>
                          {isExpandTags?showTags():
                            <Touch h={40} w={"100%"} boc={"#F0F0F0"} 
                                onPress={() =>{setIsExpandTags(true)}}>
                                <View row>
                                    <Text c={"black"} s={14} b lh={18} t={"_tags"}/>
                                    <IconF 
                                        size={24}
                                        style={{position:"absolute",right:8}}
                                        name={"angle-down"}
                                        color={"black"} 
                                    /> 
                                </View>
                            </Touch>
                        }
                        <View bw={1} w={"100%"}  bc={'#F0F0F0'} mb={20}/>

                        <View row w={"100%"}>
                            <Checkbox
                                status={isPrivate ? 'checked' : 'unchecked'}
                                onPress={() => {
                                    setIsPrivate(!isPrivate);
                                }}/>
                            <Text t={"make_my_profile_private"} mt={8}  c={"#666666"} b />
                        </View>

                        <View row mb={16} mt={20} width={"90%"}>
                            <Touch ai jc h={48} br={4} s={16} b
                                c={Color.themeFontColor} bc={Color.themeColor} 
                                onPress={() => {
                                    if(!validateUserInfo()){
                                        updateUserInfo();
                                    }
                                }}
                                t={userInfo?.authUid? 'update' : 'signup'} 
                            />
                        </View>
                        <View row mb={20} mt={20} width={"96%"}>
                            <Touch ai jc h={48} 
                                onPress={() => {
                                    userInfo?.authUid? 
                                    navigation.navigate(PAGES.HOME)
                                    :navigation.navigate(PAGES.SIGNUPCOMPLETE)
                                }}
                                s={16} c={"green"}  t={"skip"} 
                            />
                        </View>
                       
       
                    </ScrollView>
                </View>:
                <View style={styles.mapView}>
                   <MapView
                        style={{height: "100%",width: '100%'}}
                        ref={ref => (this.mapView = ref)}
                        mapType = {_mapType}
                        zoomEnabled={true}
                        followUserLocation={true}
                        showsUserLocation={true}
                        initialRegion={region || APP_CONFIG.COORDINATES.coords}
                        onRegionChangeComplete={region => setRegion({ ...region, latitudeDelta: 0.01, longitudeDelta: 0.01 })}>
                        <Marker coordinate={{ ...region }} draggable />
                    </MapView>
                    <Touch style={{ position: "absolute", bottom: 80, left: 10 }} h={48} onPress={async () => {
                        let location = await getCurrentLocation();
                        setRegion({ ...location, latitudeDelta: 0.01, longitudeDelta: 0.01 });
                        this.mapView.animateToRegion({ ...location, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 2000);
                        }}
                    >
                        <Image source={require("./../assets-images/currentLocation.webp")} style={{ width: 50, height: 50 }} />
                       
                    </Touch>
                    <View style={{ position: "absolute", bottom: 80, right:10 }}c={"white"} row w={"40%"}>
                        <Touch jc ai t={"Map"} w={"48%"} h={48} onPress={()=>setMapType("standard")}/>
                        <View w={1} c={"black"}/>

                        <Touch jc ai t={"Satelite"} w={"50%"} h={48} onPress={()=>setMapType("hybrid")}/>
                       
                    </View>
                    <Touch jc bc={Color.themeColor}  a h={48} style={{bottom:20}}
                        c={Color.themeFontColor} w={'80%'} br={4} ml={40} 
                        onPress={selectLocationFromMap} s={16} t={'save'}
                    />
                </View>
            }
            {
                showImageLibrary?showImageOptionList():null
            }
            {
                startCamera ?showOpenCamera():null
            }
             {isPickerShow&&selectedArray.length>0?
                <PickerModal 
                    items={selectedArray} 
                    selectedKey ={selectedKey} 
                    selectedValue={selectedValue} 
                    selectedPicker={selectedPickerData}
                    isClosedModal={()=>setIsPickerShow(false)} 
                />:null}
            {
            isLoading && <Loading mb={16} isLoading loadingText={"image_loading"}/>
          }
        </View>
    )
}


  
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      backgroundColor : "white"
    },
    bottomView: {
        width: '100%',
        height: 250,
        backgroundColor: 'white',
        position: 'absolute', 
        bottom: 0, 
        borderTopLeftRadius:50,
        borderTopRightRadius:50,
        overflow: 'hidden'
      },
    mapView: {
        width: '100%',
        height: "90%",
        backgroundColor: '#F0F0F0',
        position: 'absolute', 
        bottom: 0, 
        borderTopLeftRadius:50,
        borderTopRightRadius:50,
        overflow: 'hidden'
    },
    pickerContainer: {
        width: "100%",
        borderRadius: 10,
        alignSelf: 'center',
        backgroundColor:"white",
        borderColor :"#666666",
        borderWidth : 1
    }
});
  
