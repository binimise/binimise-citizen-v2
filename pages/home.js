import React, { useState, useEffect}  from 'react';
import { SliderBox } from "react-native-image-slider-box";
import {Dimensions,StyleSheet,ScrollView,Image,Alert,BackHandler,Linking} from "react-native";
import { useSelector,useDispatch } from 'react-redux';
import { View,Text,Touch} from "../ui-kit";
import Header from "../components/header";
import styles from "../styles/styles"
import {getPlaces,getAppSettings,updateUserToken} from "./../repo/repo";
import Icon from 'react-native-vector-icons/FontAwesome';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import {useIsFocused, useNavigationState} from '@react-navigation/native';
import * as Location from 'expo-location';
import NetInfo from '@react-native-community/netinfo';
import { Camera } from 'expo-camera';
import { SwiperFlatList } from 'react-native-swiper-flatlist';
let {width,height } = Dimensions.get("window");
import { PAGES,ONESIGNAL_ID, APP_CONFIG,TOKEN } from "../global/util";
import OneSignal from 'react-native-onesignal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setData } from "../redux/action";
import {getDistance } from 'geolib';

export default ({ navigation }) => {
  const [arrayOfPlaces, setArrayOfPlaces] = useState([]);
  const [placeImages, setPlaceImages] = useState([]);
  const [imageIndex,setImageIndex] = useState(0);
  const [officersImages,setOfficersImages] = useState([]);
  const state = useNavigationState(state => state);
  const routeName = (state.routeNames[state.index]);
  const dispatch = useDispatch();
  const setDataAction = arg => dispatch(setData(arg));
  let { userInfo,selectedLanguage } = useSelector(state => state.testReducer) || {};
  const focusInHome = useIsFocused();

  useEffect(() => {
    if(routeName === "Home"){
      const backAction = () => {
      setDataAction({ 
        confirmModalInfo : {
            showModal : true,
            title : "message",
            message : "confirm_to_exit",
            primaryAction : () =>{
                setDataAction({confirmModalInfo:{showModal: false}})
                BackHandler.exitApp();
            }
        }
    })
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
    getPlacesData();
    getDynamicAppSettings();
    if(!userInfo.token){
      oneSignalOperations();
    }
  }, []);

  useEffect(() => {
    getPlacesData();
    
  }, [selectedLanguage]);

  useEffect(()=>{
    if(focusInHome){
      setDataAction({
        "loading": { show:false },
        errorModalInfo : { showModal : false },
        confirmModalInfo : { showModal : false }
      })
    }
    switchOnNetInfo();
  },[focusInHome])

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
      await checkGPSStatus();
    }
  };
  const LocalNullModal = (message, title = "message") =>{
    setDataAction({ 
        errorModalInfo: {
          showModal: true,
          title,
          message ,
          onClose: ()=>checkGPSStatus()
        }
    });
  }

  const checkGPSStatus = async () => {
    let providerStatus = await Location.getProviderStatusAsync();
    if (providerStatus.locationServicesEnabled) {
      await getLocationPermission();
    } else {
      LocalNullModal("please_switch_location","switch_on_location");
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

  const oneSignalOperations = async () => {
    OneSignal.setAppId(ONESIGNAL_ID);
    setTimeout(async () => {
        const deviceState = await OneSignal.getDeviceState();
        if(deviceState.userId!=null){
          setDataAction({tokenFromOneSignal:deviceState.userId ||""}); 
          await AsyncStorage.setItem(TOKEN,deviceState.userId);
          updateTokenInHome(userInfo,deviceState.userId);
        }
        
    }, 4000);
  
  }
  
  const updateTokenInHome = async (userInfo,id) => {
    userInfo.token = id;
    setDataAction({tokenFromOneSignal:id ||""},{userInfo}); 
    updateUserToken(userInfo, id);
  }

  const getPlacesData = async () => {
    let places = await getPlaces();
    let placesImages=[];
    let temp = [];
    let location = {};
    try{
      location = await Location.getLastKnownPositionAsync({enableHighAccuracy: true});
    }catch(e){}
    places.length>0&&places.map((eachplace,index)=>{
      if(eachplace.pictures!=""){
        let newObj = {};
        let pdis = getDistance(
          {latitude: location? location?.coords?.latitude:userInfo.lat, 
              longitude:location? location?.coords?.longitude:userInfo.long},
          {latitude:eachplace.lat,longitude: eachplace.long},
        );
     
        newObj.dist = Math.trunc( pdis/1000);
        newObj.userlat = location?.coords?.latitude ||userInfo.lat;
        newObj.userlong =location?.coords?.longitude||userInfo.long;
        newObj.pictures = eachplace.pictures ;
        newObj.address = eachplace.address || "N/A";
        newObj.description = eachplace.description || "N/A";
        newObj.id = eachplace.id;
        newObj.name = eachplace.name;
        newObj.placeAddress = eachplace.placeAddress;
        newObj.placeDescription = eachplace.placeDescription;
        newObj.placeName = eachplace.placeName;
        newObj.type = eachplace.type;
        newObj.ward_id = eachplace.ward_id;
        temp.push(newObj);
        placesImages.push(eachplace.pictures);
      }
        
        
    })
    setArrayOfPlaces(temp);
    setPlaceImages(placesImages)
  }


  const getDynamicAppSettings = async() => {
    let customizedValues = await getAppSettings();
    let loc_images = customizedValues?.aboutUs || [];
    setOfficersImages(loc_images);
  }

  const picture = () =>(
    userInfo.profile? 
      <Touch mt={6} mr={20} h={32} w={34} onPress={()=>{navigation.navigate(PAGES.PROFILE)}}>   
        <Image source={{ uri:userInfo.profile}}
          style = {{height: 32,marginRight: 20,width:34,borderRadius:12,borderColor:"#CCCCCC"}}
          resizeMode="stretch"
        />
      </Touch>:
      <Touch mt={6} mr={20} h={32} w={34} onPress={()=>{navigation.navigate(PAGES.PROFILE)}}>   
        <Image source={require("./../assets/blankavatar.png")}
          style = {{height: 32,marginRight: 20, width:34,borderRadius:12,borderWidth:1,
          borderColor:"green",backgroundColor:"#F8F8F8",color:"black"}}
        />
    </Touch>  
  )

  const showNavigationsInHomePage = (text,iconName,pageName)=>(
    <Touch style={styles.homeMainCardView} onPress={() =>{navigation.navigate(pageName)}} mb={10}>
      <Icon size={30} name={iconName} color={"green"} /> 
      <Text t={text} c={"green"} center/>
    </Touch>
  )

  const showPlaceDetailFromHome = index => {
    setDataAction({place: arrayOfPlaces[index]});
    navigation.navigate(PAGES.PLACESDETAILS);
  }

  return(  
    <ScrollView backgroundColor={"white"} style={{width:"100%"}}>
      <Header navigation={navigation} headerText={""} type={"home"}  picture={picture}/>
      <View ml={20}  bw={1} w={"90%"}   bc={"#CCCCCC"}/>
      {arrayOfPlaces.length>0 && placeImages.length>0?
        <View w={width}>
          <SliderBox
            images={placeImages}
            currentImageEmitter={index => setImageIndex(index)}
            onCurrentImagePressed={index =>  showPlaceDetailFromHome(index)}
            sliderBoxHeight={200}
            dotColor="green"
            inactiveDotColor="#90A4AE"
            paginationBoxStyle={styles._homePaginationStyle}
            ImageComponentStyle={styles.homeImageStyle}
            dotStyle={styles.homeBoxDotStyle}
          />
            <View c={"#007235"} w={"64%"} h={40} jc 
              style={{position:"absolute",right:(width*5.2)/100,bottom:40}}
            >  
              <Text t={arrayOfPlaces[imageIndex]?.placeName[selectedLanguage]} b center c={"#FFFFFF"}/>
            </View>
        </View>:null
      }
     
      {officersImages.length>0&&<SwiperFlatList
        autoplay
        autoplayDelay={3}
        index={0}
        autoplayLoop
        showPagination
        style={styles.homeStaffimageStyle}
        paginationStyle={styles._homePaginationStyle}
        paginationStyleItem ={styles.homeBoxDotStyle}
        paginationActiveColor ="green"
        data={officersImages}
        renderItem={({ item }) =>  
          <View row c={"#F0F8FF"} bc={"#F0F0F0"}>
            <View w={(width*(0.9))*0.65} jc  pl={10} style={{minHeight:120,height:"auto"}}>
              <Text b t={item.name[selectedLanguage]+","} />
              <Text t={item.designation[selectedLanguage]} />
            </View>
            <Touch  w={(width*(0.9))*0.35} style={{minHeight:120,height:"auto"}} onPress={()=>navigation.navigate(PAGES.ABOUTUS)}>
              <Image source={{ uri: item.image}} style={{position:"absolute",right:0,height:"100%",
                width : width*(0.25)}} resizeMode={"stretch"}/>
            </Touch>
          </View>
        }/>
      }

      <View br={4} h={120} bw={2} w={"90%"} mh={"5%"} mt={"8%"} bc={"#F0F0F0"} c={"#B6BC5C"}ai row>
        <Text s={20} c={"#FFFFFF"} w={"55%"} ml={"6%"} t={"home_message"}/>
        <Image source={require("./../assets/deogharhomepageimage.png")} 
          style={{position:"absolute",right:8}}resizeMode="cover"/>
      </View>
      <View style={{display:"flex",flexWrap: 'wrap',flexDirection:"row",justifyContent: 'space-around'}} w={'90%'} mt={"10%"} mh={"5%"}>
        {
          showNavigationsInHomePage("notifications","volume-up",PAGES.NOTIFICATIONS)
        }
        {
          showNavigationsInHomePage("complaint","edit",PAGES.COMPLAINT)
        }
        {  
          showNavigationsInHomePage("booking","file-text-o",PAGES.BOOKING)
        }
        <Touch style={styles.homeMainCardView}
          onPress={() =>{navigation.navigate(PAGES.MAPVIEW,{
            Text:"garbageVan",id:"GarbageVan"
        })}}>
          <Icon size={30} name={"truck"} color={"green"}/> 
          <Text t={"track_garbageVan"} c={"green"} style={{alignSelf:"center"}}/>
        </Touch>
        <Touch style={styles.homeMainCardView} onPress={() =>{navigation.navigate(PAGES.MAPVIEW,{
            Text:"toilets",id:"Toilets"
        })}}  bc={"blue"}>
        
          <IconMaterial size={40} name={"toilet"} color={"green"}/> 
          <Text t={"toilet_Locator"} c={"green"}/>
        </Touch>
        {  
          showNavigationsInHomePage("select_language","language",PAGES.SELECTLANGUAGE)
        }
        {
          showNavigationsInHomePage("contact_us","address-book-o",PAGES.CONTACTUS)
        }
        {   
          showNavigationsInHomePage("history","history",PAGES.HISTORY)
        }
        {   
          showNavigationsInHomePage("places","th-large",PAGES.PLACES)
        }
      </View>
      <View h={30}/>
    </ScrollView>
  )
}
