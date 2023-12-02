import React, { useState, useEffect,useReducer }  from 'react';
import lang from "./../localize";
import {Dimensions,StyleSheet,ScrollView,Image,Alert,BackHandler,Linking,Platform} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "../redux/action";
import { View, Text, Touch,TextInput } from "../ui-kit";
import Header from "../components/header";
import { Color,PAGES, USERINFO,ONESIGNAL_ID,AUTHUID,STAFF_OBJ_STORAGE} from '../global/util';
import { updateSaathiImage,getNotifications,updateUserToken,getBothStaffAndSupervisor } from "./../repo/repo";
import Icon from 'react-native-vector-icons/FontAwesome';
import {useIsFocused, useNavigationState} from '@react-navigation/native';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import OneSignal from 'react-native-onesignal';
import NetInfo from '@react-native-community/netinfo';
let {width,height } = Dimensions.get("window");

export default ({ navigation }) => {

  const dispatch = useDispatch();
  const setDataAction = (arg) => dispatch(setData(arg));
  const state = useNavigationState(state => state);
  const routeName = (state.routeNames[state.index]);
  let { userInfo,selectedLanguage} = useSelector(state => state.testReducer) || {};
  const [hasPermission, setHasPermission] = useState(null)
  const [notifications,setNotifications] = useState([])
  const isFocus = useIsFocused();

  const getAllNotifications = async () => {
    let notifications = await userInfo?.ward?.length>0?getNotifications(userInfo):[];
    if(!notifications || !notifications.length){
        notifications = [];
    }
    setNotifications(notifications);
}

  useEffect(() => {
    if(isFocus){
      showAutoStartPermission();
      // getAllNotifications();
      setDataAction({ 
        loading: { show : false }
      })
    }
    getStaffList()
  }, [isFocus])

  const isEmptyObject = (obj) => {
    return Object.keys(obj).length === 0;
}

  const getStaffList = async (flag) => {
    try {
      
        let staffObj = await AsyncStorage.getItem(STAFF_OBJ_STORAGE);
        if (staffObj!=null&&isEmptyObject(staffObj) ||flag) {
          let message = "getting_staff";
          setDataAction({ loading: { show: true, message } });
          let listFromApi = await getBothStaffAndSupervisor(userInfo);
          let my_details = listFromApi?.[userInfo[AUTHUID]] || {};
          setDataAction({
            allSaathiObj: listFromApi,
            userInfo: my_details,
            loading: { show: false }
          });
          await AsyncStorage.setItem(USERINFO, JSON.stringify(my_details));
          await AsyncStorage.setItem(STAFF_OBJ_STORAGE, JSON.stringify(listFromApi));
        } else {
          let parsedObj = JSON.parse(staffObj);
          setDataAction({ allSaathiObj: parsedObj }); //check this
      }      

    } catch (e) {
      setDataAction({ loading: { show: false } })
      // throw e;
    }
  }

  __oneSignalOperations = async () => {
    // OneSignal.setLogLevel(6, 0);
    OneSignal.setAppId(ONESIGNAL_ID);
    const deviceState = await OneSignal.getDeviceState();
    updateTokenInHome(userInfo,deviceState.userId)
  }
  
  updateTokenInHome = async (userInfo,id) => {
    if(!userInfo.token){
      setDataAction({tokenFromOneSignal:id ||""}); 
      updateUserToken(userInfo, id);
    }
  }
 
  const showAutoStartPermission = async () => {
    setDataAction({ 
      errorModalInfo: {
        showModal: false
      }
    });
    await switchOnNetInfo();
  };

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
      await _getLocationAsync();
    }
  };


  const _getLocationAsync = async () => {
    const foregroundPermission = await Location.requestForegroundPermissionsAsync();
    const backgroundPermission = await Location.requestBackgroundPermissionsAsync();
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
    Linking.openSettings();
    await getLocationPermission();
  }
  

  useEffect(() => {

    if(routeName === "Home"){
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

  showCamera = () => {
   setDataAction({ cameraInfo: {
                navigation : navigation,
                show : true , 
                onLoadOp : cameraOnloadOp,
                imageRef : "saathi_task/" + userInfo[AUTHUID] + "/" + new Date().toLocaleDateString().split("/").join("-") + "/" + new Date().getTime() + '.jpg'
    }});
  }

  showNavigationsInHomePage = (icon,text,pageName,left)=>(
    <Touch style={styles.mainCardView} ml={left}
    onPress={() =>{navigation.navigate(pageName)}}>
      <Image source={icon}
        style={{ width: 72, height: 72}} 
      />
      <Text t={text} s={18} center/>
    </Touch>
  )

  const cameraOnloadOp = async (item) => {
    let url = item.url;
    let { status } = await Location.requestForegroundPermissionsAsync();
    let location = await Location.getLastKnownPositionAsync({enableHighAccuracy: true});
    //  await getImageAddress(location)
    let obj = { url, lat: location?.coords?.latitude, long: location?.coords?.longitude, date: new Date().getTime() }
    updateSaathiImage(userInfo, obj);
    
      if(navigation&&item.spotfine){
        navigation.navigate(PAGES.SPOTFINE,{imageUrl:url});
      }
      if(navigation&&!item.spotfine){
        navigation.navigate(PAGES.DAILYIMAGES);
      }
  }
  const showListButton = () => (
    <Touch
      t={"refresh"} w={80} bc={Color.themeColor}
      jc ai c={Color.white} br={8} h={40}
      onPress={()=>getStaffList(true)}
       />
  )
  

 
  return (userInfo.status?
    <View w={"100%"} h={"100%"} c={"#FFFFFF"}>
      <Header navigation={navigation} headerText={""} type={"Home"} hideHomeIcon ={true} showListButton={showListButton}/>
      <Text t={"Welcome"+" "+userInfo.name} mt={"6%"} mb={"4%"} ml={"6%"} c={"#000000"} s={24} lh={32}/>
      {
        userInfo.isSupervisor&&<View w={'90%'} h={"18%"}  mt={"6%"} mh={"5%"} row>
        {
          showNavigationsInHomePage(require("./../assets/AcknowledgeIcon.png"),"acknowledgement",PAGES.ACKNOWLEDGEMENT,0)
        }
         {
          showNavigationsInHomePage(require("./../assets/paymentIcon.png"),"payments",PAGES.PAYMENT,"4%")
        }
      </View> 
      }
      <View w={'90%'} h={"18%"}  mt={"6%"} mh={"5%"} row>
        {
          showNavigationsInHomePage(require("./../assets/ctptIcon.png"),"ctpt",PAGES.CTPTATTENDANCE,0)
        }
        {
          showNavigationsInHomePage(require("./../assets/surveyIcon.png"),"survey",PAGES.SURVEY,"4%")
        }
      </View>
      <View w={'90%'} h={"18%"}  mt={"6%"} mh={"5%"} row>
        {
          showNavigationsInHomePage(require("./../assets/complaintsIcon.png"),"complaints",PAGES.COMPLAINTS,0)
        }
        {
          showNavigationsInHomePage(require("./../assets/bookingsIcon.png"),"bookings",PAGES.TASKS,"4%")
        }
      </View>
      <View style={styles.bottomView}>
        <Touch w={72} h={72} bc={"#DDF3FF"} br={16} jc ai  mt={16}>
          <Icon size={48} name={"home"} style={styles.iconColor}/>
        </Touch>
        <Touch  w={72} h={72} bc={"#DDF3FF"} br={16} jc ai onPress={showCamera}>
          <Icon size={48} name={"camera"}  style={styles.iconColor}/>
        </Touch>
        <Touch w={72} h={72} bc={"#DDF3FF"} br={16} jc ai mt={16}>
          <Icon size={48} name={"bell"}  style={styles.iconColor} />
          <View  style={{position:"absolute",top:10,left:40}} h={20} w={20} c={"red"} br={4}>
          <Text t={notifications.length} center b/>
          </View>
        </Touch>
      </View>
    </View>:
    <View>
     <Header navigation={navigation} headerText={""} hideHomeIcon ={true} showListButton={showListButton}/>
     <View a c={Color.backgroundModalColor} jc ai zi={999} to={60} le={0} h={height} w={width}>
     
     <View w={width - 48} br={8} c={Color.white} jc pa={2} h={80}>
       <Text t={"switch_on_duty"} center b pa={10} s={24}/>
     </View>
   </View>
   </View>
  )


}

const styles = StyleSheet.create({
  
  mainCardView: {
    height: "100%",
    width:"48%",
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "white",
    borderRadius: 15,
    shadowColor: "green",
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomView:{
    flexDirection:"row",
    width:"90%",
    marginHorizontal:"5%",
    position:"absolute",
    bottom:"2%",
    justifyContent: "space-between"
  },
  iconColor:{
   color:"#0091DF"
  },
}); 