import React, { useState,useEffect } from 'react';
import { useSelector,useDispatch } from 'react-redux';
import MapView,{Marker} from 'react-native-maps';
import { View,Touch,Text} from "./../ui-kit";
import UserMarker from "./userMarker";
import Header from "../components/header";
import { Color,APP_CONFIG, PAGES } from '../global/util';
import { Linking,Image,Dimensions,StyleSheet, ScrollView,BackHandler } from 'react-native';
import { getCtpt} from "./../repo/repo";
import * as Location from 'expo-location';
import { useNavigationState,useIsFocused } from '@react-navigation/native';
import { setData } from "../redux/action";
let {width,height } = Dimensions.get("window");

export default ({ navigation,route }) => {

  const dispatch = useDispatch();
  const setDataAction = arg => dispatch(setData(arg));
  const [toiletsList, setToiletsList] = useState([]);
  const [_mapType,setMapType] = useState("standard");
  const [liveLocation, setLiveLocation] = useState({});
  const navigationValue = useNavigationState(state => state);
  const routeName = (navigationValue.routeNames[navigationValue.index]);
  let userInfo = useSelector(state => state.testReducer.userInfo) || {};
  let pageHeader = route?.params?.Text || "mapView";
  const isFocus = useIsFocused();

  useEffect(() => {
    if(routeName === PAGES.MAPVIEW){
      const backAction = () => {
        navigation.navigate(PAGES.HOME);
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
    if(isFocus){
      getLiveLocationOfUser();
      getAllToilets();
    }
    
  }, [isFocus]);

  const LocalNullModal = (message, title = "message") =>{
    setDataAction({ 
        errorModalInfo: {
          showModal: true,
          title,
          message ,
          onClose: ()=>getLiveLocationOfUser()
        }
    });
  }

  const showErrorModalMsg = (message) => {
    setDataAction({ 
      errorModalInfo: {
        showModal: true,
        title : "message",
        message,
        onClose: () =>onCloseEvent() // Ask for permissions again
      }
    });
  };

  const onCloseEvent = async(text) =>{
    Linking.openSettings();
    getLiveLocationOfUser();
  }

  const getLiveLocationOfUser = async () => {
    try {
        let providerStatus = await Location.getProviderStatusAsync();
        if (providerStatus.locationServicesEnabled) {
            setDataAction({ 
                errorModalInfo: {
                  showModal: false
                }
            });
            let location = await Location.getLastKnownPositionAsync({enableHighAccuracy: true});
            let lat = location?.coords?.latitude ||APP_CONFIG.COORDINATES.coords.latitude ,
            long = location?.coords?.longitude ||APP_CONFIG.COORDINATES.coords.longitude ;
            setLiveLocation({latitude:lat,longitude:long});
        } else {
            return LocalNullModal("please_switch_location","switch_on_location");
        }
        
    }catch(e){
        showErrorModalMsg("location_permission") ; 
    }
  }


  const getAllToilets = async()=>{
    let _ctpt =await getCtpt();
    getTopThreeToilets(_ctpt);
  }

  const getTopThreeToilets = async(ToiletList)=>{
    if(ToiletList.length>0&&liveLocation){
      for(let i = 0; i<ToiletList.length; i++) {
        let distance = getDistanceFromLatLonInKm(parseInt(liveLocation?.latitude), parseInt(liveLocation?.longitude),
        ToiletList[i].lat,ToiletList[i].long);
        ToiletList[i].distance = distance;
      }
      ToiletList.sort(function(a, b) {
        return a.distance - b.distance
      });
      setToiletsList(ToiletList);
    }else{
      setToiletsList(ToiletList);
    }
  }

  function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1);
    var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;  // distance returned
  }

  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }

 
  const ctptfun = (eachCtpt)=>{
    let imageArr=[eachCtpt.insideImage,eachCtpt.outsideImage];
    eachCtpt.imageArr=imageArr;
    navigation.navigate(PAGES.TOILETDETAILS,{
      selectedCtpt : eachCtpt
    })
  }
 
  
  return <View c={"white"}>
      <Header navigation={navigation} headerText={pageHeader} />
      <View mh={"5%"} w={"90%"} bc={"#CCCCCC"} mt={"5%"}>
        <MapView
          language={"hn"}
          mapType = {_mapType}
          style={{ alignSelf: 'stretch', height: '100%' }}
          region={{ latitude: liveLocation?.latitude||userInfo?.lat || APP_CONFIG.COORDINATES.coords.latitude, 
                    longitude: liveLocation?.longitude||userInfo?.long || APP_CONFIG.COORDINATES.coords.longitude,  
                    latitudeDelta: 0.01, longitudeDelta: 0.01 
                  }}
        >
          {route?.params?.id == "GarbageVan"?<UserMarker userInfo={userInfo} />:null}
          <Marker
            coordinate={{latitude: liveLocation?.latitude||userInfo?.lat || APP_CONFIG.COORDINATES.coords.latitude, 
              longitude: liveLocation?.longitude||userInfo?.long || APP_CONFIG.COORDINATES.coords.longitude
            }} 
          >
            <Image  source={require("./../assets/blueicon.png")}  style = {{height: 40, width:40}}/>
          </Marker>
          
          {route?.params?.id == "Toilets"&&toiletsList.length>0&&toiletsList.map((eachCtpt,index)=>(
            <Marker
              key={index}
              coordinate={{latitude: eachCtpt.lat,longitude: eachCtpt.long}}
              onPress={() => {ctptfun(eachCtpt)}}
              title={eachCtpt.title}
            >
              <Image  source={[0,1,2].includes(index)?require("./../assets/toilet.png"):require("./../assets/toilet-b.png")}
                style = {{height: 24, width:24}}
              />
            </Marker>
          ))}
        </MapView>
          <Touch a ri={10} h={20} to = {20} bc={Color.themeColor} 
              t={"refresh"} br={10} c={Color.white} w={80}
              onPress = {()=>getLiveLocationOfUser()}
          />
        <View style={{ position: "absolute", bottom: "20%", right:10 }}c={"white"} row w={"40%"}>
          <Touch jc ai t={"Map"} h={48} w={"48%"} c={_mapType =="standard"?"green":"black"} onPress={()=>setMapType("standard")}/>
          <View w={1} c={"black"}/>
          <Touch jc ai t={"Satelite"} h={48} w={"50%"}c={_mapType =="hybrid"?"green":"black"} onPress={()=>setMapType("hybrid")}/>
        </View>
      </View>
    </View>
}




const styles = StyleSheet.create({
  bottomView: {
      width: '100%',
      height: "90%",
      backgroundColor: '#fbfbfb',
      position: 'absolute', 
      bottom: 0, 
      borderTopLeftRadius:50,
      borderTopRightRadius:50,
      overflow: 'hidden'
  },
  paginationStyle :{
      position: "relative",
      bottom: 0,
      padding: 0,
      alignItems: "center",
      alignSelf: "center",
      justifyContent: "center",
      paddingVertical: 10
  },
  imageStyle :{
    borderRadius: 6, 
    width: '90%', 
    marginTop: "6%",
     
  },
  boxDotStyle: {
    width: 20,
    height: 4,
    borderRadius: 4,
    marginHorizontal: 0,
    padding: 0,
    margin: 0,
    backgroundColor: "rgba(128, 128, 128, 0.92)"
  }
});