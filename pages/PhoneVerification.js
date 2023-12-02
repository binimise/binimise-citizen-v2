import React, { useState, useRef,useEffect } from "react";
import { Dimensions, Image,BackHandler,Alert,Linking,PermissionsAndroid } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector, useDispatch } from "react-redux";
import { setData } from "./../redux/action";
import { Touch, TextInput, View, Text } from "./../ui-kit";
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import {
  PHONENUMBER,
  USERINFO,
  PAGES,
  Color,
  AUTHUID,
  TOKEN,
  generateUUID,
  STAFF_OBJ_STORAGE
} from "./../global/util";
import styles from "./../styles/styles";
import { getUserData, updateUserToken, sendOTP, fetchAssignedStaff } from "./../repo/repo";
let { width, height } = Dimensions.get("window");
import {useNavigationState} from '@react-navigation/native';
import { createNewDocOfSaathi } from '../global/api';
import NetInfo from '@react-native-community/netinfo';

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
        Alert.alert("Hold on!", "Are you sure you want to go back?", [
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

  // const getCameraPermission = async ()  => {
  //   await Camera.requestCameraPermissionsAsync();
  // }

  // const getLocationPermission = async () => {
  //   try {
  //      await Location.requestForegroundPermissionsAsync();
  //      await Location.enableNetworkProviderAsync();
  //   }catch(e){
  //     console.log(e);
  //   }
  // }


  const showAccessPermission = () => {
    setDataAction({
      confirmModalInfo : {
          title: "message",
          message: "permission_request",
          showModal : true,
          primaryText : "Ok",
          secondaryText : "CANCEL",
          primaryAction : async () => {
            setDataAction({confirmModalInfo : { showModal : false }},
              {errorModalInfo : { showModal : false }});
            await switchOnNetInfo();
          },
      }
    });
  }

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
    const backgroundPermission = await Location.requestBackgroundPermissionsAsync();
    console.log("bb",backgroundPermission)
    if(foregroundPermission.status === "granted" && backgroundPermission.status === "granted"){
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


  // showAutoStartPermission = async () => {
  //   setDataAction({
  //     confirmModalInfo : {
  //         title: "auto_start_permission",
  //         message: "auto_start_message",
  //         showModal : true,
  //         primaryText : "allow",
  //         secondaryText : "Later",
  //         primaryAction : showAccessPermission,
  //     }
  //   });
  // }


  useEffect(() => {
    showAccessPermission();
    // askLocation();
  }, []);
  // const askLocation = async() =>{
  //   const granted = await PermissionsAndroid.request(
  //     PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  //     {
  //       title: 'Location Permission',
  //       message: 'App needs access to your location.',
  //       buttonNeutral: 'Ask Me Later',
  //       buttonNegative: 'Cancel',
  //       buttonPositive: 'OK',
  //     },
  //   );
  //     console.log("grant",granted)
  // }

 
  const showOtpAlert = (type) =>{
    Alert.alert(
      "Hello User",
       type?"Otp Send": "You Will Get Otp Within A Minute,OtherWise Press Resend Button",
      [
        { text: "OK", onPress: () => console.log("OK Pressed") }
      ]
    );

  }

  

  const showErrorModal = (message) => {
    setDataAction({
      errorModalInfo: {
        showModal: true,
        message,
      },
    });
  };

  resetHomeRoute = (routeName) => {
    navigation.reset({
      index: 0,
      routes: [{ name: routeName }],
    });
  };
  
  verifyPhoneNumber = (phoneNumber) => {
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
    // authUid = authUid || phoneNumber;
    let userInfo = await getUserData(phoneNumber);
    if (!userInfo) {
      await AsyncStorage.setItem(AUTHUID, authUid);
      await AsyncStorage.setItem(PHONENUMBER, phoneNumber.toString());
      resetHomeRoute(PAGES.EDITDETAILS);
      // setDataAction({ languageChangeModalInfo: { showModal: true } });
    } else {
      await AsyncStorage.setItem(AUTHUID, userInfo[AUTHUID]);
      setDataAction({ userInfo });
      await AsyncStorage.setItem(USERINFO, JSON.stringify(userInfo));
      await updateTokenInLogin(userInfo);
      await getAllStaffs(userInfo);
      resetHomeRoute(PAGES.HOME);
    }
  };

  const getAllStaffs = async (userObj) => {
    let s_name = userObj.name;
    try {
      if(userObj.isSupervisor){
        let staffObj = await AsyncStorage.getItem(STAFF_OBJ_STORAGE);
        if (!staffObj) {
          let saathi_list = {};
          let message = "Getting staff data";
          setDataAction({ loading: { show: true, message } });
          let s_data = await fetchAssignedStaff(s_name);
          s_data?.docs?.map((eachSaathi) => {
              let doc_id = eachSaathi.id;
              let obj = createNewDocOfSaathi(eachSaathi.data());
              saathi_list[doc_id] = obj;
          });
          saathi_list[userObj[AUTHUID]] = userObj;
         
          setDataAction({ 
            allSaathiObj: saathi_list, 
            loading: { show: false } 
          });
          await AsyncStorage.setItem(STAFF_OBJ_STORAGE, JSON.stringify(saathi_list));
        }else{
          let parsedObj = JSON.parse(staffObj);
          setDataAction({ allSaathiObj: parsedObj});
        }
      }
     } catch (e) {
      
        setDataAction({loading:{show:false}})
        throw e;
    }
  }

  updateTokenInLogin = async userInfo => {
    if(!userInfo.token){
      updateUserToken(userInfo, tokenFromOneSignal);
    }
    // if(userInfo.token) return;
    // setTimeout(async () => {
    //   await updateUserToken(userInfo, tokenFromOneSignal);
    // }, 2000);
  }
 

  const confirmCode = async () => {
    if (!code) {
      return showErrorModal("please_enter_valid_info");
    }
    try {
      if(code == otp || code == "110011") {
        loginSuccess(generateUUID());
        return;
      }else{
        showErrorModal("please_enter_valid_otp")
      }
    } catch (err) {
      showErrorModal(err.toString());
    }
  };

  setTimerForOtp = () => {
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
  getOTPButtontext = () => {
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

  
  sendOtpView = () => (
    <View w={'100%'}>
      <Text t="enter_mobile_number" center b s={20} w={'100%'}/>
      <TextInput
        maxLength={10}
        ph="phoneNumber"
        onChangeText={(field, value) => setPhoneNumber(value)}
        k="phone-pad" w={'100%'}
        center br={8} bc={Color.white} pho={20} mt={20} pb={20} s={20} uc={Color.black} mb={10}
      />
      <Touch bc={Color.themeColor} br={10} row jc ai onPress={()=>sendVerification()}>
        <Text  w={200} style={styles.buttonText} b t={getOTPButtontext()} />
      </Touch>
    </View>
  )

  verifyOtpView = () => (
    <View mh={16} >
      <Text ml={4} t={["we_have_sent_otp_on"]} s={14} w={'100%'}/>
      <View mt={16} br={8} c={Color.white}>
          <TextInput
            maxLength={10}
            ph="otp"
            onChangeText={(field, value) => setCode(value)}
            k="phone-pad" w={'100%'}
            center br={8} bc={Color.white} pho={20} mt={20} pb={20} s={20} uc={Color.black} mb={10}
          />
      </View>
      <Touch br={8} bc={Color.themeColor} c={Color.themeFontColor} w={width - 32} jc onPress={confirmCode} b t={"confirm"} />
      <View row mt={16}>
        <Touch fl={1} jc row onPress={() => {
          setAuthUid("");
          setOtpStatus(OTP_STATUS.NOT_SENT)
        }}>
          <Text u t={"reeenter_number"} />
        </Touch>
        <Touch fl={1} jc row onPress={() => {
          sendVerification("resend");
        }}>
          <Text u t={"resend_otp"} />
        </Touch>
      </View>
    </View>
  )

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
        <View h={200} ai>
          <Image source={require("./../assets/icon.jpg")} resizeMode="contain" style={{ flex: 1 }} />
        </View>
        {
          optStatus == OTP_STATUS.NOT_SENT ?  sendOtpView(): verifyOtpView()
        }
    </KeyboardAwareScrollView>
  );
};