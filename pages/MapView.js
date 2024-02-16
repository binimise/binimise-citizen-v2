import React, { useState,useEffect } from 'react';
import { useSelector,useDispatch } from 'react-redux';
import MapView,{Marker} from 'react-native-maps';
import { View,Touch,Text} from "./../ui-kit";
import UserMarker from "./userMarker";
import Header from "../components/header";
import { Color,APP_CONFIG, PAGES } from '../global/util';
import { Image,Dimensions,BackHandler } from 'react-native';
import { getCtpt} from "./../repo/repo";
import * as Location from 'expo-location';
import { useNavigationState,useIsFocused } from '@react-navigation/native';
import { setData } from "../redux/action";
import IconAnt from 'react-native-vector-icons/AntDesign';
import TrackViewMarker from '../Markers/TVMarker';


export default ({ navigation,route }) => {

  const dispatch = useDispatch();
  const setDataAction = arg => dispatch(setData(arg));
  const [toiletsList, setToiletsList] = useState([]);
  const [_mapType,setMapType] = useState("standard");
  const [liveLocation, setLiveLocation] = useState({});
  const navigationValue = useNavigationState(state => state);
  const routeName = (navigationValue.routeNames[navigationValue.index]);
  let userInfo = useSelector(state => state.testReducer.userInfo) || {};
  let { loading } = useSelector(state => state.testReducer) || {};
  let pageHeader = route?.params?.Text || "mapView";
  const isFocus = useIsFocused();

  useEffect(() => {
    if(routeName === PAGES.MAPVIEW){
      const backAction = () => {
        if(loading.show){
          loaderInMapview(false);
          return true;
        }
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

  const loaderInMapview = (show,message) => {
    setDataAction({"loading": {show,message}});
  }

  useEffect(() => {
    getLiveLocationOfUser(true);
    getAllToilets();
  }, []);

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
      }
    });
  };

  const getLiveLocationOfUser = async (flag) => {
    let providerStatus = await Location.getProviderStatusAsync();
    if (providerStatus.locationServicesEnabled) {
        setDataAction({
            errorModalInfo: {
                showModal: false
            }
        });
        loaderInMapview(true,"fetching_location");

        try {
            let location = await Promise.race([
                Location.getLastKnownPositionAsync({ enableHighAccuracy: false }),
                new Promise((resolve, reject) => {
                    setTimeout(() => reject(new Error('Location request timed out')), 2000);
                })
            ]);
            if (!location) {
                location = await Promise.race([
                    Location.getCurrentPositionAsync({ enableHighAccuracy: false }),
                    new Promise((resolve, reject) => {
                        setTimeout(() => reject(new Error('Current location request timed out')), 3000);
                    })
                ]);

                if (!location) {
                    showErrorModalMsg("unable_to_fetch_exact_location");
                    return;
                }
            }

            loaderInMapview(false);
            let lat = location?.coords?.latitude ||APP_CONFIG.COORDINATES.coords.latitude ,
            long = location?.coords?.longitude ||APP_CONFIG.COORDINATES.coords.longitude ;
            setLiveLocation({latitude:lat,longitude:long});
        } catch (e) {
            loaderInMapview(false);
            showErrorModalMsg("unable_to_fetch_exact_location");
        }
    } else {
      return LocalNullModal("please_switch_location","switch_on_location");
      
    }

  }


  const getAllToilets = async() => {
    let _ctpt = await getCtpt();
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
    let R = 6371; // Radius of the earth in km
    let dLat = deg2rad(lat2-lat1);  // deg2rad below
    let dLon = deg2rad(lon2-lon1);
    let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    let d = R * c; // Distance in km
    return d;  // distance returned
  }

  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }

 
  const onMarkerPressed = (eachCtpt)=>{
    console.log("c")
    let imageArr = [eachCtpt.insideImage,eachCtpt.outsideImage];
    eachCtpt.imageArr = imageArr;
    navigation.navigate(PAGES.TOILETDETAILS,{
      selectedCtpt : eachCtpt
    })
  }
 
  
  return <View c={Color.white}>
      <Header navigation={navigation} headerText={pageHeader} />
      <View mh={"5%"} w={"90%"} mt={"3%"}>

        <View c={"#CCCCCC"} w={"100%"} pa={4} mb={4}>
          <Text 
            t = {"please_select_location_by_clicking"} 
            b c= {Color.themeColor} h={"3%"} s={14}
          />
        </View>
        
       
        
        <MapView
          language = {"hn"}
          mapType = {_mapType}
          style = {{ alignSelf: 'stretch', height: '95%' }}
          region = {{ 
            latitude: liveLocation?.latitude||userInfo?.lat || APP_CONFIG.COORDINATES.coords.latitude, 
            longitude: liveLocation?.longitude||userInfo?.long || APP_CONFIG.COORDINATES.coords.longitude,  
            latitudeDelta: 0.01, longitudeDelta: 0.01 
          }}
        >
           
          <UserMarker userInfo={userInfo} />
          <Marker
            coordinate={{
              latitude: liveLocation?.latitude||userInfo?.lat || APP_CONFIG.COORDINATES.coords.latitude, 
              longitude: liveLocation?.longitude||userInfo?.long || APP_CONFIG.COORDINATES.coords.longitude
            }} 
          >
            <Image  source={require("./../assets/blueicon.png")}  style = {{height: 40, width:40}}/>
          </Marker>
          
          {route?.params?.id == "Toilets"&&
            toiletsList.length>0&&toiletsList.map((eachCtpt,index)=>(
              <TrackViewMarker
                index = {index}
                id = {index}
                coord ={{latitude: eachCtpt.lat,longitude: eachCtpt.long}}
                name = {eachCtpt.title}
                phoneNumber = {eachCtpt.contactNo || "N/A"}
                handlePressCallout = {() =>onMarkerPressed(eachCtpt)}
              />
          ))}
        </MapView>

        <Touch a bo = {"20%"} le ={20} onPress = {()=>getLiveLocationOfUser()}>
          <Image 
            source={require("./../assets/currentLocation.webp")} 
            style={{ width: 50, height: 50 }} 
          />
        </Touch>

        <View a to={60} w={100} ml = {"5%"} h={40} c={Color.white} row br={16}jc ai>
          <Text t={userInfo?.ward} c={Color.themeColor} b/>
        </View>
        {
            route?.params?.id == "Toilets" && 
            <Touch 
              a ri={10} bc={Color.themeColor} jc ai 
              br={10} h={40} row w={80} to = {60}
              onPress = {()=>getAllToilets()}
            >
              <IconAnt 
                size = {18} 
                name = {"reload1"}
                color = {Color.white} 
              />
              <Text t = {"refresh"} ml = {8} c = {Color.white}/>
            </Touch>
        }

        <View a bo={'20%'} ri={10} c={Color.white} row w={"40%"} br={16}>
          <Touch 
            jc ai t={"map"} h={48} w={"48%"} 
            c = {_mapType =="standard"?Color.themeColor:Color.black} 
            onPress={()=>setMapType("standard")}
          />
          <View w={1} c={Color.black}/>
          <Touch 
            jc ai t={"satelite"} h={48} w={"50%"}
            c={_mapType =="hybrid"?Color.themeColor:Color.black} 
            onPress={()=>setMapType("hybrid")}
          />
        </View>

      </View>
    </View>
}
