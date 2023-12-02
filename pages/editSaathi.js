import React, { useState,useEffect } from "react";
import { Image,StyleSheet,Dimensions,ScrollView, NativeModules,BackHandler} from "react-native";
import {View, Text,Touch,TextInput } from "../ui-kit";
import Header from "../components/header";
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import {AUTHUID,Color, PAGES,USERINFO,STAFF_OBJ_STORAGE } from '../global/util';
import { Camera,CameraType } from 'expo-camera';
import Icon from 'react-native-vector-icons/AntDesign';
import { uploadSaathiImage,updateUserData, getStaffMeta,storeSaathiMetaData,deleteSaathiThumbnail } from "./../repo/repo";
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useIsFocused, useNavigationState} from '@react-navigation/native';
import Styles from "../styles/styles";
import firebase from "./../repo/firebase";
import * as FaceDetector from "expo-face-detector";
import { modifyDocOfStaff} from "../global/api";
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width, height } = Dimensions.get('window');

const {FaceRecognition} = NativeModules;

export default ({navigation,route}) => {

    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    let { userInfo,allSaathiObj } = useSelector(state => state.testReducer) || {};
    const [ openCamera,setOpenCamera ] = useState(false);
    const [type, setType] = useState(CameraType.back);
    const [camera, setCamera] = useState({});
    const [selectedSaathi,setSelectedSaathi] = useState({});
    const [registerImage,setRegisterImage] = useState("");
    const storageRef = firebase().firebase.storage();
    const isFocus = useIsFocused();
    const state = useNavigationState(state => state);
    const routeName = (state.routeNames[state.index]);

    useEffect(() => {

        if(routeName === "editSaathi"){
          const backAction = () => {
            setDataAction({
                confirmModalInfo : {
                    showModal : true,
                    title : "Hold on!",
                    message : "Are you sure you want to go back?",
                    primaryText : "YES",
                    primaryAction : () => {
                        setDataAction({ 
                            confirmModalInfo : { showModal: false },
                            loading : { show : false }
                        });
                        navigation.navigate(PAGES.UPDATESAATHI,{
                            isfromEditSaathi : false
                        })
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
    }, []);

    useEffect(()=>{
        if(isFocus){
            setSelectedSaathi(route?.params?.selectedSaathiObj||{});
            setRegisterImage(route?.params?.selectedSaathiObj?.imageUrl||"")
        }

    },[isFocus])

    const formOnChangeEditStaff = (field, value) => {
        setSelectedSaathi(Object.assign({}, selectedSaathi, {[field] : value}));
    }
    

    const getUpdateStaffView = (text, ph, name, value, keyboardType, maxLength) => {
        return (
            
            <View style={Styles.cardStyle}>
                <Text s={12} t={text} c={"black"} b/>
                <TextInput ml nl={1} ph={ph} pl={"4%"} h={40} bc={"white"} bbw= {1}
                    onChangeText={formOnChangeEditStaff} name={name}
                    tbc={"#F0F0F0"} mb={4} value={value}
                    bw={1} k={keyboardType} maxLength={maxLength}
                />
          </View>
        )
    }

    const  showErrorModalMsg = (message, title = "message") => {
        setDataAction({ 
            errorModalInfo : {
                showModal : true, title, message
            }
        })
    };

    const updateSaathiListOfSupervisor = async() =>{
        let temp = [];
        userInfo.saathi_list.map((each)=>{
            if(each.authUid!=selectedSaathi.authUid){
                temp.push(each)
            }
        })
        temp.push({
            id:selectedSaathi.authUid,
            authUid:selectedSaathi.authUid,
            name:selectedSaathi.name,
            phoneNumber: selectedSaathi.phoneNumber,
            userId : selectedSaathi.userId,
            imageUrl:registerImage||""
        })
        userInfo.saathi_list = [...temp];
        await updateUserData(userInfo);
        if(allSaathiObj[selectedSaathi.authUid]){
            allSaathiObj[selectedSaathi.authUid] = selectedSaathi;
        }
        if(allSaathiObj[userInfo[AUTHUID]]){
            allSaathiObj[userInfo[AUTHUID]] = {...userInfo};
        }
        await AsyncStorage.setItem(USERINFO, JSON.stringify(userInfo));
        await AsyncStorage.setItem(STAFF_OBJ_STORAGE, JSON.stringify(allSaathiObj));
        setDataAction({ userInfo ,allSaathiObj});
    }

    const updateSaathisMeta = async(saathiData) =>{
        let temp = modifyDocOfStaff(saathiData);
        let staffData = await getStaffMeta();
        staffData[temp.authUid] = temp;
        await storeSaathiMetaData(staffData);
        setDataAction({ userInfo });
    }

 
    const updateSaathiData = async () => {
        try{
            let message = "saving_data"
            setDataAction({ loading : { show : true,message:message }});
            selectedSaathi.isFaceRegistered = true;
            selectedSaathi["id"] = selectedSaathi.userId;
            
            if(registerImage != route?.params?.selectedSaathiObj?.imageUrl ){
                if (selectedSaathi.thumbnailUrl) { //check and change it to route.
                   
                    console.log(" // delete and thumbnail")
                    await deleteSaathiThumbnail(selectedSaathi?.authUid);
    
                }
                selectedSaathi.thumbnailUrl = "";
                selectedSaathi["isApproved"] = false;
            }else{
                selectedSaathi.thumbnailUrl = selectedSaathi?.thumbnailUrl || "";
                selectedSaathi["isApproved"] = true;
            }
            selectedSaathi["imageUrl"] = registerImage;
            await uploadSaathiImage(selectedSaathi);
            await updateSaathisMeta(selectedSaathi);
            await updateSaathiListOfSupervisor();
            setSelectedSaathi({});
            setRegisterImage("");
            showErrorModalMsg(`Staff Updated by ${userInfo?.name || ""}`);
            setDataAction({ loading : { show : false }});
            navigation.navigate(PAGES.UPDATESAATHI,{
                isfromEditSaathi : true
            }); //chck this
            


        }catch(e){
            setDataAction({ loading : { show : false }});
            showErrorModalMsg("failed_to_store_data");
            return;
        }
    }

   

    const closeCameraWithModalsInAtt = message => {
        setDataAction({ 
          loading: { show : false },
          errorModalInfo: { showModal: true, message },
          cameraInfo: { show: false }
        });
    } 

    const setImageLoadingInAtt = type => {
        setDataAction({ loading: { show : type }});
    }

    const takeImageSaathi = async () => {
        if (!camera) return;
        try {
            const photo = await camera.takePictureAsync({ quality: 0.1, base64: true});
            setOpenCamera(false);
            setDataAction({ loading: { show: true,message:"saving_image" } });
            let imageRef ="saathiImage/" + selectedSaathi[AUTHUID] + "/" + new Date().toLocaleDateString().split("/").join("-") + "/" + new Date().getTime() + '.jpg'
            const reference = storageRef.ref(imageRef);
            await reference.putFile(photo.uri);
            let downloadUrl = await reference.getDownloadURL();
            setRegisterImage(downloadUrl)
            setDataAction({ loading: { show: false } });
        } catch(e) {
            closeCameraWithModalsInAtt("Oops!! there is an error while capturing image");
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
                <Touch a bo={10}  h={60} bc={Color.white} br={32} w={60}  jc ai
                    style={{alignSelf:"center"}} 
                    onPress={()=>takeImageSaathi()}
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

    return openCamera ? showCamera() :
        <View w={width} h={height} c={Color.viewColor}>
            <Header navigation={navigation} headerText={"view_staff"} />
            <View mh={"5%"} bw={1} w={"90%"} bc={Color.borderColor} />

            <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
                {
                    
                        <View>
                            <Text t={"edit_staff"} mb={4} mt={8} b />
                            {
                                getUpdateStaffView('userId', 'Safai Mitra', 'userId', selectedSaathi?.userId)
                            }
                            {
                                getUpdateStaffView('name', 'firstName_lastName', 'name', selectedSaathi?.name)
                            }
                            {
                                getUpdateStaffView('father_name', 'father_name', 'father_name', selectedSaathi?.father_name)
                            }

                            {
                                getUpdateStaffView('phoneNumber', '9954672326', 'phoneNumber', selectedSaathi?.phoneNumber, "numeric", 10)
                            }
                            {
                                getUpdateStaffView('email', 'abc@def.com', 'email', selectedSaathi?.email)
                            }
                            {
                                getUpdateStaffView('address', 'address ', 'address', selectedSaathi?.address)
                            }
                            {
                                getUpdateStaffView('landmark', 'address', 'landmark', selectedSaathi?.landmark)
                            }
                            <View mt={10}>
                                <Text s={12} c={"black"} t={"please_take_image_of_saathi"} b />
                                <View bw={1} bs={"dashed"} br={4} s={16} mb={30} h={200} w={'100%'}
                                    bc={Color.lightGrayColor} c={Color.backgroundColor}
                                >
                                    <Image
                                        source={registerImage ? { uri: registerImage } : require("./../assets-images/image2.jpg")}
                                        resizeMode="contain"
                                        style={{ width: "100%", height: "100%" }}
                                    />
                                    <Touch t={registerImage ? "retake_image" : "take_image"} jc ai h={40} bc={"#F0F0F0"}
                                        style={{ position: "absolute", top: 0, right: 0 }} w={150} c={registerImage ? "red" : "green"}
                                        onPress={() => { setOpenCamera(true) }}
                                    />
                                </View>
                            </View>

                            <View row mb={16} mt={5}>
                                <Touch ai jc h={40} br={4} onPress={() => updateSaathiData()}
                                    s={16} c={Color.themeFontColor} bc={Color.themeColor} b t={"update"}
                                />
                            </View>
                            <View row mb={16} mt={5}>
                                <Touch ai jc h={40} br={4} onPress={() =>  navigation.navigate(PAGES.UPDATESAATHI,{
                                    isfromEditSaathi : false
                                })}
                                    s={16} c={Color.themeFontColor} bc={Color.themeColor} b t={"go_to_viewstaff"}
                                />
                            </View>

                            <View h={20} />

                        </View>
                }


            </ScrollView>
    </View>
      
}

