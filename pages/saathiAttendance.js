import React, { useState, useEffect, useReducer} from "react";
import { Image,StyleSheet,Dimensions, ScrollView, NativeModules } from "react-native";
import {View, Text,Touch,TextInput } from "../ui-kit";
import Header from "../components/header";
import NetInfo from '@react-native-community/netinfo';
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import { USERINFO, AUTHUID,Color,generateUUID } from '../global/util';
import { Camera,CameraType } from 'expo-camera';
import Icon from 'react-native-vector-icons/AntDesign';
import { updateUserFaceAttandance,updateSaathiStatus,updateUserLocation,getSaathi,getAttendanceTimings} from "./../repo/repo";
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useIsFocused } from '@react-navigation/native';
import Styles from "../styles/styles";
import * as FaceDetector from "expo-face-detector";
const { width, height } = Dimensions.get('window');

const {FaceRecognition} = NativeModules;

export default ({ navigation }) => {

    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    const [ openCamera,setOpenCamera ] = useState(false);
    const [ inTimeSelfie,setInTimeSelfie ] = useState(true);
    const [type, setType] = useState(CameraType.back);
    const [camera, setCamera] = useState({});
    const [ saathiArray,setSaathiArray] = useState([]);
    const [searchText,setSearchText] = useState("");
    const [selectedSaathi,setSelectedSaathi] = useState({})
    let { userInfo } = useSelector(state => state.testReducer) || {};
    const isFocused = useIsFocused();

    
    useEffect(()=>{
        getSaathiData()
    },[isFocused])

    const getSaathiData = async()=>{
        let data = await getSaathi();
        let saathiList = [];
        data?.docs?.map((eachSaathi)=>{
            let doc = eachSaathi.data();
            let obj ={};
            obj.name = doc.name;
            obj.isApproved = doc.isApproved || false;
            obj.phoneNumber = doc.phoneNumber;
            obj.authUid = eachSaathi.id;
            obj.image = doc.imageUrl || "";
            saathiList.push(obj)
        });
        setSaathiArray(saathiList);
    }

    const isFaceMatched = (base64) => {
        FaceRecognition.RecognizeImage(
            base64
          ).then((data) => {
            if(!data) return alert("No face matched");
            let isGivenPermission = saathiArray.find((eachDoc)=>eachDoc.authUid == data);
            
            if(!isGivenPermission?.isApproved){
                return showErrorModalMsg("staff_is_not_approved")
            }
            if(inTimeSelfie){
                markAttendanceStart(data);
            }else{
                markAttendanceEnd(data);
            }
            
          }).catch((e) => {
            alert("No face matched");
          });
    }

    const showInTimeConfirmModal = ()=>{
        if(!userInfo.status){
            return setDataAction({ errorModalInfo : { showModal : true, message : "duty_is_off" }});
        }
        setOpenCamera(true); 
        setInTimeSelfie(true);
    }

    const showOutTimeConfirmModal = ()=>{
        if(!userInfo.status){
            return setDataAction({ errorModalInfo : { showModal : true, message : "duty_is_off" }});
        }
        setOpenCamera(true); 
        setInTimeSelfie(false);
    }

    const showINANDOUT = () => {
        return <View w={"100%"} h={"100%"} ai>
            <View row mt={"20%"}>
                <View jc ai>
                    <Touch style={Styles.mainCardView}
                        onPress={showInTimeConfirmModal}
                    >
                        <Text t={"IN TIME SELFIE"} s={18} center />
                    </Touch>
                </View>
                <View jc ai>
                    <Touch style={Styles.mainCardView} ml={10}
                        onPress={showOutTimeConfirmModal}
                    >
                        <Text t={"OUT TIME SELFIE"} s={18} center />
                    </Touch>

                </View>
            </View>

        </View>
    }

    const  showErrorModalMsg = (message, title = "message") => {
        setDataAction({ 
            errorModalInfo : {
                showModal : true, title, message
            }
        })
    };

    const setLoadingInAttendance = type => {
        setDataAction({ loading: { show : type }});
      }

    const markAttendanceStart = async (saathiId) => {
        try {   
                if(userInfo.authUid == saathiId) {
                    return alert("Self attendance marked !!!");
                }
                let selectedSaathi = userInfo.saathi_list.find(item => item.id == saathiId)
                let timestamp = new Date().getTime();
                let status = true;
                let source = "Face Detector";
                let statusObj = { timestamp, status, source }
                updateUserFaceAttandance(saathiId, statusObj);
                updateUserLocation(saathiId, true);
                updateSaathiStatus(selectedSaathi, true);
                setInTimeSelfie(false);
                alert(`Attendance is marked for ${selectedSaathi?.name || ""} by ${userInfo?.name || ""}`);
                setLoadingInAttendance(false);
        } catch (error) {
            console.log(error);
        }
    };

    const markAttendanceEnd = async (saathiId) => {
        try {   
                if(userInfo.authUid == saathiId) {
                    return alert("Self attendance marked !!!");
                }
                let selectedSaathi = userInfo.saathi_list.find(item => item.id == saathiId)
                let timestamp = new Date().getTime();
                let status = false;
                let source = "Face Detector";
                let statusObj = { timestamp, status, source }
                updateUserFaceAttandance(saathiId, statusObj);
                updateUserLocation(saathiId, false);
                updateSaathiStatus(selectedSaathi, false);
                setInTimeSelfie(true);
                alert(`Attendance is marked for ${selectedSaathi?.name || ""} by ${userInfo?.name || ""}`);
                setLoadingInAttendance(false);
        } catch (error) {
            console.log(error);
        }
    };

    const checkForFace = async (obj) => {
        try {
          if(obj?.faces?.length){
            let face = obj?.faces[0];
            const leftEyeClosed = face.leftEyeOpenProbability <= 0.4;
            const rightEyeClosed = face.rightEyeOpenProbability <= 0.4;
            console.log(leftEyeClosed, rightEyeClosed, face.yawAngle);
            if (leftEyeClosed && rightEyeClosed) {
              setTimeout(async () => {
                const photo = await camera.takePictureAsync({ quality: 0.1, base64: true });
                isFaceMatched(photo.base64);
                setOpenCamera(false);
                // markAttendanceStart("02d43a0c904d42db83a3e4b9569bc706");
              }, 500)
            }
    
          }
        } catch (error) {
          console.error(error);
        }
      }



    const showCamera = () =>{
        return(
            <Camera
                style={{height}} 
                type={type}
                ratio={"16:9"}
                ref={(ref) => setCamera(ref)}
                onFacesDetected={(e)=>checkForFace(e)}
                faceDetectorSettings={{
                    mode: FaceDetector.FaceDetectorMode.fast,
                    detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
                    runClassifications: FaceDetector.FaceDetectorClassifications.all,
                    minDetectionInterval: 125,
                    tracking: true
                }}
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
            </Camera>

        ) 
        
    }

    return openCamera? showCamera():
        <View w={width} h={height}>
            <Header navigation={navigation} headerText={"attendance"} type={"attendance"}/>
            <View mh={"5%"} bw={1} w={"90%"} bc={Color.borderColor}/>
            {
                showINANDOUT()
            }
            
        </View>
      
}

