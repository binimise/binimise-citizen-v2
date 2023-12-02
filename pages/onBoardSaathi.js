import React, { useEffect, useState } from "react";
import { Image, Dimensions, ScrollView, NativeModules,BackHandler } from "react-native";
import { View, Text, Touch, TextInput } from "../ui-kit";
import Header from "../components/header";
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import { APP_CONFIG, AUTHUID, Color, generateUUID, PAGES,USERINFO,STAFF_OBJ_STORAGE } from '../global/util';
import { Camera, CameraType } from 'expo-camera';
import Icon from 'react-native-vector-icons/AntDesign';
import { addUserData, checkSaathiData, updateUserData,getStaffMeta,storeSaathiMetaData } from "./../repo/repo";
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from "./../repo/firebase";
import { useIsFocused,useNavigationState } from "@react-navigation/native";
import Styles from "../styles/styles";
import * as FaceDetector from "expo-face-detector";
import { createNewDocOfSaathi, modifyDocOfStaff } from "../global/api";
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width, height } = Dimensions.get('window');


const {FaceRecognition} = NativeModules;

export default ({ navigation }) => {

    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    const [openCamera, setOpenCamera] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [registerImage, setRegisterImage] = useState("");
    const [type, setType] = useState(CameraType.back);
    const [camera, setCamera] = useState({});
    const [saathiRegObj, setSaathiRegObj] = useState({});
    const [saathiId, setSaathiId] = useState("");
    const storageRef = firebase().firebase.storage();
    const state = useNavigationState(state => state);
    const routeName = (state.routeNames[state.index]);
    let { userInfo } = useSelector(state => state.testReducer) || {};
    const isFoucs = useIsFocused();

    useEffect(() => {
        if (isFoucs) {
            setSaathiId("");
            setSaathiRegObj({});
            setRegisterImage("");
        }

    }, [isFoucs])

    useEffect(() => {
        if(routeName === "onBoardSaathi"){
          const backAction = () => {
            setDataAction({
                confirmModalInfo : {
                    showModal : true,
                    title : "Hold on!",
                    message : "Are you sure you want to go back?",
                    primaryText : "YES",
                    primaryAction : () => {
                        setOpenCamera(false);
                        setDataAction({ confirmModalInfo : { showModal: false },loading:{show: false}});
                        navigation.navigate(PAGES.HOME)
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
    
          return () => backHandler.remove();          
        }
    });

    const formOnChangeBoardSaathi = (field, value) => {
        setSaathiRegObj(Object.assign({}, saathiRegObj, { [field]: value }));
    }



    const showSaathiRegisterView = (text, ph, name, value, keyboardType, maxLength) => {
        return (

            <View style={Styles.cardStyle}>
                <Text s={12} t={text} c={"black"} b />
                <TextInput  nl={1} ph={ph} pl={"4%"} h={40} bc={"white"} bbw={1}
                    onChangeText={formOnChangeBoardSaathi} name={name} tbc={"#F0F0F0"} mb={4}
                    value={value} bw={1} k={keyboardType} maxLength={maxLength}
                />
            </View>
        )
    }

    const showErrorModalMsg = (message, title = "message") => {
        setDataAction({
            errorModalInfo: {
                showModal: true, title, message
            }
        })
    };

    const createNewDocOfStaff = (saathiRegObj, userInfo) => {
        let obj = { ...saathiRegObj };
        obj[AUTHUID] = saathiId;
        obj.isFaceRegistered = true;
        obj.supervisor = {"name":userInfo.name ,"authUid":userInfo[AUTHUID]}
        obj.supervisor_name = userInfo.name || 'Admin';
        obj.imageUrl = registerImage;
        obj.thumbnailUrl = "";
        return obj;
    }

    const containsOnlyNumbers = (str) => {
        // Use a regular expression to match only numeric characters (0-9)
        return /^\d+$/.test(str);
    }
    
    const onBoardedStaff = async () => {
        try {
            if (!saathiRegObj?.userId) {
                return showErrorModalMsg("please_enter_userid")
            }
            if (!saathiRegObj?.name) {
                return showErrorModalMsg("please_enter_name")
            }
            if (!saathiRegObj?.father_name) {
                return showErrorModalMsg("please_enter_father_name")
            }
            if (!saathiRegObj?.phoneNumber) {
                return showErrorModalMsg("please_enter_number")
            }
            if (!containsOnlyNumbers(saathiRegObj?.phoneNumber) || saathiRegObj?.phoneNumber.length != 10) {
                return showErrorModalMsg("please_enter_10_digit_phonenumber")
            }
            if (!registerImage) {
                return showErrorModalMsg("please_enter_image")
            }
            let message = "saving_data";
            setDataAction({ loading: { show: true,message: message } });

            let check_saathi = await checkSaathiData(saathiRegObj.phoneNumber)
            if (check_saathi) {
                setDataAction({ loading: { show: false } });
                return showErrorModalMsg("saathi_exist");
            }
            let dataFromAsync = await AsyncStorage.getItem(STAFF_OBJ_STORAGE); //add cond here
            let objFromAsync = JSON.parse(dataFromAsync) || {};           
            let saathi_obj = createNewDocOfStaff(saathiRegObj, userInfo);
            let docFromApi = createNewDocOfSaathi(saathi_obj);
            let docForMetaData = modifyDocOfStaff(saathi_obj);
            docFromApi["boardedBy"] = userInfo[AUTHUID];

            let temp_array = [...userInfo.saathi_list] || [];
            temp_array.push({
                userId: saathiRegObj.userId,
                id: saathiId,
                authUid : saathiId,
                name: saathiRegObj.name,
                phoneNumber: saathiRegObj.phoneNumber,
                imageUrl : registerImage || ""
            })
            userInfo.saathi_list = [...temp_array];

            objFromAsync[userInfo[AUTHUID]] = {...userInfo};
            objFromAsync[saathiId] = {...docFromApi};
            await addUserData(docFromApi);
            await updateUserData(userInfo); 
            let staffData = await getStaffMeta();
            staffData[docForMetaData.authUid] = docForMetaData;
            await storeSaathiMetaData(staffData);
            setDataAction({ userInfo:userInfo ,allSaathiObj:objFromAsync});
            await AsyncStorage.setItem(USERINFO, JSON.stringify(userInfo));
            await AsyncStorage.setItem(STAFF_OBJ_STORAGE, JSON.stringify(objFromAsync));
            setSaathiId("");
            setSaathiRegObj({});
            setRegisterImage("");
            showErrorModalMsg(`Staff Onboarded by ${userInfo?.name || ""}`)
            setDataAction({ loading: { show: false } });

        } catch (e) {
            setDataAction({ loading: { show: false } });
            showErrorModalMsg("failed_to_store_data");
            console.log("error",e)
        }




    }

    const closeCameraWithModalsInAtt = message => {
        setDataAction({
            loading: { show: false },
            errorModalInfo: { showModal: true, message },
            cameraInfo: { show: false }
        });
    }



    const takeImage = async () => {
        if (!camera) return;
        try {
            const photo = await camera.takePictureAsync({ quality: 0.1, base64: true });
            setOpenCamera(false);

            let saathiUid = generateUUID();
            setDataAction({ loading: { show: true,message:"saving_image" } });
            let imageRef = "saathiImage/" + saathiUid + "/" + new Date().toLocaleDateString().split("/").join("-") + "/" + new Date().getTime() + '.jpg'
            const reference = storageRef.ref(imageRef);
            await reference.putFile(photo.uri);
            let downloadUrl = await reference.getDownloadURL();
            setRegisterImage(downloadUrl);
            setSaathiId(saathiUid);
            setDataAction({ loading: { show: false } });
        } catch (e) {
            closeCameraWithModalsInAtt("error_while_capturing_image");
        }
    }

    const showCamera = () => {
        return (
            <Camera
                style={{height}} 
                type={type}
                ratio={"16:9"}
                ref={(ref) => setCamera(ref)}
            >
                <View a to={10} le={80}>
                    <Text c={Color.red} t={"please_take_imaga_of_face"} s={20} /> 
                </View>
                <Touch a to={20} le={20} h={60} bc={Color.white}
                    br={32} w={60} jc ai onPress={() => setOpenCamera(false)}
                >
                    <Icon
                        size={36}
                        name={"close"}
                        color={Color.themeColor}
                    />
                </Touch>
                <Touch a bo={10} le={20} h={60} bc={Color.white} br={32} w={60} jc ai
                    onPress={() => {
                        type == CameraType.front ?
                        setType(CameraType.back) : setType(CameraType.front)
                    }}
                >
                    <MaterialIcons
                        size={36}
                        name={"camera-flip-outline"}
                        color={Color.themeColor}
                    />
                </Touch>
                 <Touch a bo={10} h={60} bc={Color.white} br={32} w={60} jc ai
                    style={{ alignSelf: "center" }}
                    onPress={() => takeImage()}
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
        <View c={Color.viewColor} w={"100%"} h={"100%"}>
            <Header navigation={navigation} headerText={"registartion"} />
            <View h={1} bw={0.5} bc={Color.borderColor} />
            <ScrollView contentContainerStyle={{ width: "90%", marginHorizontal: "5%" }}>

                <Text t={"onboard_staff"} mb={4} mt={4} b />
                {
                    showSaathiRegisterView('userId', 'Safai Mitra', 'userId', saathiRegObj?.userId)
                }
                {
                    showSaathiRegisterView('name', 'firstName_lastName', 'name', saathiRegObj?.name)
                }
                {
                    showSaathiRegisterView('father_name', 'father_name', 'father_name', saathiRegObj?.father_name)
                }
                {
                    showSaathiRegisterView('phoneNumber', '9954672326', 'phoneNumber', saathiRegObj?.phoneNumber, "numeric", 10)
                }

                <View mt={5}>
                    <Text s={12} c={Color.black} t={"please_take_image_of_saathi"} b />
                    <View bw={1} bs={"dashed"} br={4} s={16} mb={30} h={200} w={'100%'}
                        bc={Color.lightGrayColor} c={Color.backgroundColor}
                    >
                        <Image
                            source={registerImage ? { uri: registerImage } : require("./../assets-images/image2.jpg")}
                            resizeMode="contain"
                            style={{ width: "100%", height: "100%" }}
                        />
                        <Touch t={registerImage ? "retake_image" : "take_image"} jc ai h={40} bc={Color.viewColor}
                            style={{ position: "absolute", top: 0, right: 0 }} w={150} c={registerImage ? Color.red : Color.themeColor}
                            onPress={() => { setOpenCamera(true) }}
                        />
                    </View>
                </View>

                <View row mb={16} mt={5}>
                    <Touch ai jc h={48} br={4} onPress={() => { onBoardedStaff(); }}
                        s={16} c={Color.themeFontColor} bc={Color.themeColor} b t={"submit"}
                    />
                </View>
            </ScrollView>

        </View>



}
