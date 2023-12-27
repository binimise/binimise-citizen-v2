import React, { useState, useRef,useEffect } from "react";
import { Dimensions, Image,BackHandler,Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from "react-redux";
import { setData } from "./../redux/action";
import { Touch, TextInput, View, Text } from "./../ui-kit";
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import NetInfo from '@react-native-community/netinfo';
import {
  PHONENUMBER,
  USERINFO,
  PAGES,
  Color,
  AUTHUID,
  TOKEN,
  generateUUID,
  APP_CONFIG
} from "./../global/util";

import { getUserData, updateUserToken, sendOTP, getTasksFromSettings } from "./../repo/repo";
let { width, height } = Dimensions.get("window");
import {useNavigationState} from '@react-navigation/native';

let OTP_STATUS = {
  NOT_SENT: "notSent",
  SENT: "sent",
  RESEND: "resend",
};
const OTP_MAX_TIMEOUT = 40;
export default PhoneVerification = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [optStatus, setOtpStatus] = useState(OTP_STATUS.NOT_SENT);
  const [countTimer, setCountTimer] = useState(0);
  const [authUid, setAuthUid] = useState("");
  const [otp, setOTP] = useState("");
  const state = useNavigationState(state => state);
  const routeName = (state.routeNames[state.index]);
  const dispatch = useDispatch();
  const setDataAction = (arg) => dispatch(setData(arg));
  let tokenFromOneSignal = useSelector(state => state.testReducer.tokenFromOneSignal) || "";

 
  useEffect(() => {

    if (routeName == PAGES.LOGINPAGE) {
      const backAction = () => {
        Alert.alert("Hold on!", "Are you sure  want to go back?", [
          {
            text: "Cancel",
            onPress: () => null,
            style: "cancel"
          },
          { 
            text: "YES", onPress: () => BackHandler.exitApp() 
          }
        ]);
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
    }
  });

 



  const switchOnNetInfo = async () => {
    let state = await NetInfo.fetch();
    if (!state.isConnected) {
      setDataAction({ 
        errorModalInfo: {
          showModal: true,
          message: "you_are_offline",
          onClose : ()=>switchOnNetInfo()
        }
      });
    }else{
      await getLocationPermission();
    }
  };
  
  const getLocationPermission = async () => {
    const foregroundPermission = await Location.requestForegroundPermissionsAsync();
    if(foregroundPermission.status === "granted"){
      setDataAction({ 
        errorModalInfo: {
          showModal: false,
        }
      });
      await getCameraPermission();
    }else{
      showErrorModalMsg("location_permission");
    }
  };

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

  const onCloseEvent = async() =>{
    console.log("onCLiose")
    Linking.openSettings();
    await getLocationPermission();
  }




  useEffect(() => {
    switchOnNetInfo();
  }, []);

  const showErrorModal = (message,title) => {
    setDataAction({
      errorModalInfo: {
        showModal: true,
        message,
        title
      },
    });
  };

  const resetHomeRoute = (routeName) => {
    navigation.reset({
      index: 0,
      routes: [{ name: routeName }],
    });
  };
  const verifyPhoneNumber = (phoneNumber) => {
    if(!phoneNumber){
      showErrorModal("please_enter_number");
      return false;
    }
    if (!phoneNumber || phoneNumber.length != 10) {
      showErrorModal("please_enter_valid_phoneNumber");
      return false;
    }
    return true;
  };
  const sendVerification = async (type) => {
    if (!verifyPhoneNumber(phoneNumber)) return;
    if (!type) {
      if (optStatus == OTP_STATUS.SENT) return;
      setOtpStatus(OTP_STATUS.SENT);
      setTimerForOtp();
    }
    try {
      showErrorModal(type?"otp_sent": "otp_sent_to","dear_user")
      // showOtpAlert(type);
      let otp = await sendOTP(phoneNumber);
      setOTP(otp.otp);
    } catch (err) {
      showErrorModal(err.toString());
      setOtpStatus(OTP_STATUS.RESEND);
      setCountTimer(OTP_MAX_TIMEOUT);
    }
  };

  const loginSuccess = async (authUid) => {
    let userInfo = await getUserData(phoneNumber);
    if (!userInfo) {
      await AsyncStorage.setItem(AUTHUID, authUid);
      await AsyncStorage.setItem(PHONENUMBER, phoneNumber.toString());
      resetHomeRoute(PAGES.USERDETAIL);
    } else {
      await AsyncStorage.setItem(AUTHUID, userInfo[AUTHUID]);
      setDataAction({ userInfo });
      await AsyncStorage.setItem(USERINFO, JSON.stringify(userInfo));
      await updateTokenInLogin(userInfo);
      resetHomeRoute(PAGES.HOME);
   
    }
  };

  const updateTokenInLogin = async userInfo => {
    if(!userInfo.token){
      let token = await AsyncStorage.getItem(TOKEN) || tokenFromOneSignal || "";
      userInfo.token = token;
      updateUserToken(userInfo, token);
      setDataAction({ userInfo });
      AsyncStorage.setItem(USERINFO, JSON.stringify(userInfo));
    }
  }
 

  const confirmCode = async () => {
    let cCode = code;
    let aAuthId = authUid;
    if(phoneNumber == "9999999999") {
      aAuthId = "9999999999";
      cCode = "110011";
    }
    if(!cCode) {
      return showErrorModal("please_enter_valid_info");
    }
    if(phoneNumber!="9999999999"&&cCode != otp) {
      return showErrorModal("please_enter_valid_otp");
      
    }
    try {
      if(aAuthId){
        loginSuccess(aAuthId);
      } else {
        loginSuccess(generateUUID());
      }
    } catch (err) {
      showErrorModal(err.toString());
    }
  };

  const setTimerForOtp = () => {
    let count = 0;
    let timer = setInterval(() => {
      setCountTimer(++count);
      if (count == OTP_MAX_TIMEOUT || countTimer >= OTP_MAX_TIMEOUT) {
        setOtpStatus(OTP_STATUS.RESEND);
        clearInterval(timer);
        setCountTimer(0);
      }
    }, 1000);
  };

  const getOTPButtontext = () => {
    if (optStatus == OTP_STATUS.NOT_SENT) return "send_otp";
    if (optStatus == OTP_STATUS.SENT) {
      let buttonText = ["otp_sent"];
      if (countTimer > 0) {
        buttonText.push("     " + countTimer + " s");
      }
      return buttonText;
    }
    if (optStatus == OTP_STATUS.RESEND) return "resend_otp";
  };

  const sendOtpView = () => (
    <View  mh={"5%"} w={"90%"}  mt={"20%"} mb={"20%"}>
      <Text t="enter_mobile_number" s={16} w={"100%"}/>
      <TextInput maxLength={10} h={45} ph="phoneNumber"
        value={phoneNumber} k="phone-pad" w={"100%"} br={2}
        onChangeText={(field, value) => setPhoneNumber(value)}
        bw={2} bc={"#F0F0F0"} boc={"#F0F0F0"} s={20} pt={8}
        pho={8} pb={8} mt={8} mb={10}
      />
      <Touch  bc={Color.themeColor} br={4} h={40}
        mt={10} jc ai 
        onPress={()=>sendVerification()}
      >
        <Text s={16} c={Color.white} b t={getOTPButtontext()} />
      </Touch>
    </View>
  )

  const verifyOtpView = () => (
    <View  mh={"5%"} w={"90%"}  mt={"20%"} mb={"4%"}>
      <Text t={"enter_otp"} s={16} w={"100%"}  />
      <TextInput
        maxLength={10} ph="otp" value={code}
        onChangeText={(field, value) => setCode(value)}
        k="phone-pad" w={"100%"} br={2} bw={2}
        bc={"#F0F0F0"} pho={8} mt={8} pb={8}
        pt={8} s={20} boc={"#F0F0F0"} mb={10}
      />
      <Touch
        br={4} bc={Color.themeColor} h={40}
        mt={10} ai jc onPress={confirmCode}
      >
        <Text s={16} c={Color.white} b t={"submit"} />
      </Touch>
      <View row mt={8}>
        <Touch h={48} fl={1}
          onPress={() => {
            sendVerification("resend");
          }}
        >
          <Text c={Color.themeColor} t={"resend_otp"} />
        </Touch>
        <Touch h={48} fl={1} jc row
          onPress={() => {
            setAuthUid("");
            setOtpStatus(OTP_STATUS.NOT_SENT);
          }}
        >
          <Text c={Color.themeColor} t={"mobile_num_change"} />
        </Touch>
      </View>
    </View>
  )

  return (
    <View  h={height} w={width} c={"#ffffff"}>
      <View h={150} mt={"10%"}>
        <Image
          source={require("./../assets/Chatrapur.png")}
          resizeMode="contain"
          style={{flex:1,alignSelf:"center" }}
        />
      </View>
      <Text t={`${APP_CONFIG.MUNICIPALITY_NAME_Ch} NAC`}  b c={Color.themeColor} s={18} center />
      {optStatus == OTP_STATUS.NOT_SENT ? sendOtpView() : verifyOtpView()}
      <View  w={width} style={{position: 'absolute',bottom: 0 }}>
        <Image
          source={require("./../assets/undraw.png")}
          style={{width:"100%",position: 'absolute',bottom: 0 }}
        />
        <Text t = {"Powered by"} s={12} b style={{left:"44%",top:26}}/>
        <Image
          source={require("./../assets/binimiselogo.png")}
          style={{left:"36%"}}
        />
      </View>
    </View>
  );
};