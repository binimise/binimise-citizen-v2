import React, {useState, useEffect, useReducer}  from 'react';
import { ScrollView, NativeModules, Image, Dimensions,BackHandler } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import { View, Text, Touch, TextInput } from "./../ui-kit";
import Header from "../components/header";
import Icon from 'react-native-vector-icons/AntDesign';
import { updateUserData, addUserData, updateUserToken,updateSupervisorOfSaathi, 
     storeSaathiMetaData,getStaffMeta,deleteSaathiThumbnail
} from "./../repo/repo";
import { Color, PAGES, PHONENUMBER,  USERINFO, AUTHUID,STAFF_OBJ_STORAGE } from '../global/util';
import { Camera,CameraType } from 'expo-camera';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from "./../repo/firebase";
import {useIsFocused, useNavigationState} from '@react-navigation/native';
import { createNewDocOfSaathi,modifyDocOfStaff } from '../global/api';
const width = Math.round(Dimensions.get('window').width);  
const height = Math.round(Dimensions.get('window').height); 

const {FaceRecognition} = NativeModules; 


export default ({ navigation }) => {
    const [userEditObj, setUserEditObj] = useState({});
    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    let updateUserInfoFlag = useSelector(state => state.testReducer.updateUserInfoFlag) || false;
    let userInfo = useSelector(state => state.testReducer.userInfo) || {};
    let tokenFromOneSignal = useSelector(state => state.testReducer.tokenFromOneSignal) || "";

    const [ openCamera,setOpenCamera ] = useState(false);
    const [type, setType] = useState(CameraType.back);
    const [camera, setCamera] = useState({});
    const storageRef = firebase().firebase.storage();
    const state = useNavigationState(state => state);
    const routeName = (state.routeNames[state.index]);
    const isFocus = useIsFocused();
    const [ selfImage,setSelfImage] = useState("");
    const [assignedStaffList,setAssignedStaffList] = useState([]);

    useEffect(() => {

        if(routeName === "EditDetails"){
          const backAction = () => {
            setDataAction({
                confirmModalInfo : {
                    showModal : true,
                    title : "Hold on!",
                    message : "Are you sure you want to go back?",
                    primaryText : "YES",
                    primaryAction : () => {
                        toggleLoading(false);
                        setDataAction({ 
                            confirmModalInfo : { showModal: false }
                        });
                        navigation.navigate(PAGES.USERDETAIL);
                    },
                    secondaryText : "NO",
                    secondaryAction : () => {
                        setDataAction({ confirmModalInfo : { showModal: false }});
                    }
                }
            });
            return true;
          };
          const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
          );
    
          return () => {
            backHandler.remove();
          }
        }
    });

    useEffect(() => {
        if(isFocus){
            setFormPhoneNumber();
        }
        if(userInfo.name){
            setUserEditObj({...userInfo});
            setSelfImage(userInfo?.imageUrl || "");
            setAssignedStaffList(userInfo.saathi_list || []);
        }
        
    }, [isFocus])
   
    setFormPhoneNumber = async () => {
        let phoneNumber = await AsyncStorage.getItem(PHONENUMBER);
        if(phoneNumber) {
            formOnChangeText(PHONENUMBER, phoneNumber);
        }
    }

    const toggleLoading = show => {
      dispatch(setData({"loading": {show}}));
    }
    
    const formOnChangeText = (field, value) => {
        setUserEditObj(Object.assign({}, userEditObj, {[field] : value}));
    }

    const showErrorModalMsg = (message, title = "message") => {
        setDataAction({ 
            errorModalInfo : {
                showModal : true,
                title : title,
                message : message
            }
        })
    };

    skipValidationFields = field => {
        return ["email", "areaCode", "landmark"].includes(field);
    }

    // validateUserInfo = () => {
    //     let message = ["please_enter", " "];
    //     for(let key in userState) {
    //         if(!skipValidationFields(key) && !state[key]){
    //             message.push(key);
    //             showErrorModalMsg(message);
    //             return true
    //         }
    //     }
    //     return false
    // }

    const updateOneSignalToken = async (staff_obj,tokenFromOneSignal) => {
        // let token = await AsyncStorage.getItem(TOKEN);
    updateUserToken(staff_obj, tokenFromOneSignal);
    }
    const updateStaffOfSupervisor = async (supervisorObj) => {
       
        let dataFromAsync = await AsyncStorage.getItem(STAFF_OBJ_STORAGE);
        let objFromAsync = JSON.parse(dataFromAsync) || {};  
        const ownDocument = modifyDocOfStaff(supervisorObj);
        const staffData = await getStaffMeta();
        
        staffData[ownDocument.authUid] = ownDocument;
    
        const updatePromises = (supervisorObj.saathi_list || []).map(async (element) => {
            const newObj = {};
            const s_obj = { "name": supervisorObj?.name, "authUid": supervisorObj?.authUid };
            const uId = element.authUid || element.id;
    
            newObj.uId = uId;
            newObj.supervisor = s_obj;
            newObj.supervisor_name = supervisorObj?.name || "Admin";
    
            if (staffData[uId]) {
                staffData[uId]["supervisor"] = s_obj;
                staffData[uId]["supervisor_name"] = supervisorObj.name || "Admin";
            }
            if(objFromAsync[uId]){
                objFromAsync[uId]["supervisor"] = s_obj;
                objFromAsync[uId]["supervisor_name"] = supervisorObj.name || "Admin";
            }
    
            await updateSupervisorOfSaathi(newObj);
        });
    
        await Promise.all(updatePromises);
        await storeSaathiMetaData(staffData);
        
        objFromAsync[userInfo[AUTHUID]] = {...userInfo};
        setDataAction({allSaathiObj:objFromAsync});
        await AsyncStorage.setItem(STAFF_OBJ_STORAGE, JSON.stringify(objFromAsync));
    }

    const containsOnlyNumbers = (str) => {
        // Use a regular expression to match only numeric characters (0-9)
        return /^\d+$/.test(str);
    }
    
    const __updateUserInfo = async () => {
        // try {
            if (!userEditObj?.userId) {
                return showErrorModalMsg("please_enter_userid")
            }
            if (!userEditObj?.name) {
                return showErrorModalMsg("please_enter_name")
            }
            if (!userEditObj?.father_name) {
                return showErrorModalMsg("please_enter_father_name")
            }
            if (!userEditObj?.phoneNumber) {
                return showErrorModalMsg("please_enter_number")
            }
            if (!containsOnlyNumbers(userEditObj?.phoneNumber) || userEditObj?.phoneNumber.length != 10) {
                return showErrorModalMsg("please_enter_10_digit_phonenumber")
            }
            if (!selfImage) {
                return showErrorModalMsg("please_enter_image")
            }
            
            let message = "saving_data";
            setDataAction({ loading: { show: true,message:message } });

            let userInfo = createNewDocOfSaathi({ ...userEditObj, ...userInfo });
            let authUid = await AsyncStorage.getItem(AUTHUID);
            userInfo[AUTHUID] = authUid;

            if(selfImage != userInfo?.imageUrl){
                if(userInfo.thumbnailUrl){
                    await deleteSaathiThumbnail(authUid);
                }
                userInfo.thumbnailUrl = "";
            }else{
                userInfo.thumbnailUrl = userInfo.thumbnailUrl || "";
            }
            userInfo.imageUrl = selfImage;
            userInfo.saathi_list = [...assignedStaffList];
            if (!updateUserInfoFlag) {
                await addUserData(userInfo);
                await updateOneSignalToken(userInfo, tokenFromOneSignal);
            } else {
                await updateUserData(userInfo);
            }
            await updateStaffOfSupervisor(userInfo);


            await AsyncStorage.setItem(USERINFO, JSON.stringify(userInfo));
            setDataAction({
                updateUserInfoFlag: true,
                userInfo: userInfo,
                loading: { show: false }
            });
            AsyncStorage.removeItem(PHONENUMBER);
            navigation.navigate(PAGES.HOME);

        // } catch (e) {
        //     setDataAction({ loading: { show: false } });
        //     showErrorModalMsg("failed_to_store_data");
        //     return;
        // }

    }

    getSignUpEditView = (text, ph, name, value, keyboardType, maxLength) => {
        return (
            <View br={4} bc={Color.lightGrayColor} bw={1} pt={4} pb={4} mb={8}>
                <Text s={12} ml={16} c={Color.lightGrayColor} t={text} b />
                <TextInput nl={1} ph={ph} pl={16} h={24}
                    k={keyboardType} maxLength={maxLength}
                    onChangeText={formOnChangeText} name={name}
                    value={value}/>
            </View>
        )
    }


    const takeImageOfSaathiInEd = async () => {
        if (!camera) return;
        try {
            const photo = await camera.takePictureAsync({ quality: 0.1, base64: true});
            setOpenCamera(false);
            setDataAction({ loading: { show: true,message:"saving_image" } });
            var authUid = await AsyncStorage.getItem(AUTHUID);           
            let imageRef ="saathiImage/" + userInfo[AUTHUID] + "/" + new Date().toLocaleDateString().split("/").join("-") + "/" + new Date().getTime() + '.jpg';
            const reference = storageRef.ref(imageRef);
            await reference.putFile(photo.uri);
            let downloadUrl = await reference.getDownloadURL();
            setSelfImage(downloadUrl);
            setDataAction({ loading: { show: false } });
        } catch(e) {
            throw e;
        }
    }
    
    const showCamera = () =>{
        return(
            <Camera
                style={{height}} 
                type={type}
                ratio={"16:9"}
                ref={(ref) => setCamera(ref)}
            >
                <Touch a to={20} le={20} h={60} bc={Color.white} 
                    br={32} w={60} jc ai onPress={()=>setOpenCamera(false)}
                >
                    <Icon 
                        size={36} 
                        name={"close"}
                        color={Color.themeColor}
                    />
                </Touch>
                <Touch a bo={10} le={20} h={60} bc={Color.white} br={32} w={60} jc ai  
                    onPress={()=>{type == CameraType.front?
                                setType(CameraType.back):setType(CameraType.front)
                            }}
                >
                    <MaterialIcons 
                        size={36}
                        name={"camera-flip-outline"}
                        color={Color.themeColor} 
                    />
                </Touch>
                <Touch a bo={10}  h={60} bc={Color.white} br={32} w={60} jc ai
                    style={{alignSelf:"center"}}
                    onPress={()=>takeImageOfSaathiInEd()}
                >
                    <Icon 
                        size={36} 
                        name={"camera"} 
                        color={Color.themeColor}
                    />
                </Touch>
            </Camera>

        ) 
    }

    if(openCamera) {
        return showCamera();
    }
    
    return <View c={"white"} w={"100%"} h={"100%"}>
        {
            updateUserInfoFlag ? <Header navigation={navigation} headerText={"editprofile"} /> : null
        }
       
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
            <View row ai jc>
                <View bc={Color.black} mt={24} mb={24} h={120} w={120}>
                    <Image source={require("./../assets/icon.jpg")} style={{ flex:1, width: undefined, height: undefined }} />
                </View>
            </View>
            {/* <Text center s={24} t={updateUserInfoFlag ? 'editYourDetail' : 'signup_to_continue'} mb={24} /> */}
            {
                getSignUpEditView('userId', 'Safai Mitra', 'userId', userEditObj?.userId)
            }
            {
                getSignUpEditView('name', 'firstName_lastName', 'name', userEditObj?.name)
            }
            {
                getSignUpEditView('father_name', 'father_name', 'father_name', userEditObj?.father_name)
            }
            {
                getSignUpEditView('phoneNumber', '9954672326', 'phoneNumber', userEditObj?.phoneNumber, "numeric", 10)
            }
            {
                getSignUpEditView('email', 'abc@def.com', 'email', userEditObj?.email)
            }
            {
                getSignUpEditView('address', 'address ', 'address', userEditObj?.address)
            }
            {
                getSignUpEditView('landmark', 'address', 'landmark', userEditObj?.landmark)
            }
            <View mt={10}>
                <Text s={12} c={"black"} t={"please_take_image_of_saathi"} b />
                <View bw={1} bs={"dashed"} br={4} s={16} mb={30} h={200} w={'100%'}
                    bc={Color.lightGrayColor} c={Color.backgroundColor}
                >
                    <Image
                        source={selfImage ? { uri: selfImage} : require("./../assets-images/image2.jpg")}
                        resizeMode="contain"
                        style={{ width: "100%", height: "100%" }}
                    />
                    <Touch t={selfImage ? "retake_image" : "take_image"} jc ai h={40} bc={"#F0F0F0"}
                        style={{ position: "absolute", top: 0, right: 0 }} w={150} c={selfImage ? "red" : "green"}
                        onPress={() => { setOpenCamera(true) }}
                    />
                </View>
            </View>
            <View row mb={16}>
                <Touch ai jc h={48} br={4} onPress={() => {
                            __updateUserInfo();
                    }}
                    s={16} c={Color.themeFontColor} bc={Color.themeColor} b t={"submit"} />
            </View>
            <View row mb={16}>
                <Touch ai jc h={48} br={4} onPress={() => {
                        navigation.navigate(PAGES.USERDETAIL)
                    }}
                    s={16} c={Color.themeFontColor} bc={Color.themeColor} b t={"userprofile"} />
            </View>
            <View h={20}/>
        </ScrollView>
        
    </View>
}