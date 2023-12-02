
import React, { useEffect, useState } from 'react';
import { BackHandler, Dimensions, ScrollView, RefreshControl, Image, Linking } from "react-native";
import { View, Touch, Text, Picker, TextInput, Loading } from "./../ui-kit";
import { Color, PAGES, getCurrentDate, APP_CONFIG, getCurrentDateFmt } from '../global/util';
import Header from "../components/header";
// import IconAnt from 'react-native-vector-icons/AntDesign';
// import IconAwesome from 'react-native-vector-icons/FontAwesome';
// import { setData } from "../redux/action";
import MapView,{Marker,Polyline}  from 'react-native-maps';
// import Modal from "./../components/modal";
// import firebase from "./../repo/firebase";
// import { Camera } from 'expo-camera';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused, useNavigationState } from '@react-navigation/native';
import SaathiRoute from './saathiRoute';
let { width, height } = Dimensions.get("window");


export default (props) => {

  let selectedTaskDetails = props?.staffObject || {};
  let { userInfo, selectedLanguage } = useSelector(state => state.testReducer) || {};
  const [middleLocation, setMiddleLocation] = useState({});
  const reversedDate = selectedTaskDetails?.id?.split("-").reverse(" ").join("-")|| "";

  useEffect(() => {
    if (selectedTaskDetails?.cenLat.length > 0 && selectedTaskDetails?.cenLng.length > 0) {
      getMiddleLocation(selectedTaskDetails?.cenLat, selectedTaskDetails?.cenLng);
    }
  }, [selectedTaskDetails?.cenLat.length,selectedTaskDetails?.cenLng.length])

  const getMiddleLocation = (cenLat, cenLng) => {
    let maxLat = cenLat[0];
    let maxLng = cenLng[0];
    for (let i = 1; i < cenLat.length; i++) {
      if (cenLat[i] > maxLat) {
        maxLat = cenLat[i];
      }
    }
    for (let i = 1; i < cenLng.length; i++) {
      if (cenLng[i] > maxLng) {
        maxLng = cenLng[i];
      }
    }
    let minLat = cenLat[0];
    let minLng = cenLng[0];
    for (let i = 1; i < cenLat.length; i++) {
      if (cenLat[i] < minLat) {
        minLat = cenLat[i];
      }
    }
    for (let i = 1; i < cenLng.length; i++) {
      if (cenLng[i] < minLng) {
        minLng = cenLng[i];
      }
    }
    let polyLat = (minLat + maxLat) / 2;
    let polyLng = (minLng + maxLng) / 2;
    let latlng = {
      latitude: polyLat,
      longitude: polyLng,
    };
    if (polyLat) {
      setMiddleLocation(latlng);
    }

  }

  const showDetails = (sText, SValue) => {
    return (
      <View row mt={"2%"}>
        <Text t={sText} b s={16} />
        <Text t={" : "} />
        <Text t={SValue} s={16} />
      </View>
    )
  }

  return (
    <View>
      <View ml={"5%"}>
        <View row>
          <Text t={"history_t"} b s={20} />
          <Text t={reversedDate}  s={20} />
        </View>
        <View h={1} bw={1} bc={"#CCCCCC"} w={"90%"}/>
        {
          showDetails("name", userInfo?.name)
        }
        {
          showDetails("phoneNumber", userInfo?.phoneNumber)
        }
        {
          showDetails("duty_hours", selectedTaskDetails?.runTime)
        }
        {
          showDetails("res_ack",selectedTaskDetails?.res_ack)
        }
        {
          showDetails("res_onBoard",selectedTaskDetails?.households)
        }
        {
          showDetails("com_ack",selectedTaskDetails?.com_ack)
        }
        
        {
          showDetails("com_onBoard",selectedTaskDetails?.commercials)
        }
      </View>
      {selectedTaskDetails?.images?.length > 0 && <View>
        <Text t={"photos"} mt={"4%"} s={14} b mh={"5%"} />
        {/* <View bw={1} bc={"#CCCCCC"} mh={"5%"} w={"90%"} /> */}
        <View w={"90%"} mh={"5%"} mt={10} mb={4}>
          <ScrollView horizontal>
            {selectedTaskDetails.images.map((each, index) => {
              let d = new Date(each.date);
              let m = d.getMinutes();
              let h = d.getHours();
              let time = (h < 10 ? "0" : "") + h.toString() + ":" + (m < 10 ? "0" : "") + m.toString();
              return (
                <View w={200} h={150} mr={10} key={index}>
                  <Text t={time} mb={10} />
                  <Image source={{ uri: each.url }} style={{ width: "100%", height: "100%" }} resizeMode={"stretch"} />
                </View>
              )
            })
            }
          </ScrollView>
        </View>
      </View>}

      <Text t={"route"} mt={"4%"} s={16} b mh={"5%"}/>
      {/* <View bw={1} bc={"#CCCCCC"} mh={"5%"} w={"90%"} /> */}
      <View h={150} w={"90%"} mh={"5%"} mt={5} mb={20}>
        <MapView
          region = {{ 
            latitude: middleLocation?.latitude || APP_CONFIG.COORDINATES.coords.latitude, 
            longitude:  middleLocation?.longitude ||APP_CONFIG.COORDINATES.coords.longitude, 
            latitudeDelta:  0.001, longitudeDelta: 0.001
          }}
          style={{ alignSelf: 'stretch', height: '100%' }}
        >
          {
          <SaathiRoute 
            staffObj = {{
              name:userInfo.name||"",
              phoneNumber:userInfo.phoneNumber||"",
              routes:selectedTaskDetails?.routes
            }}
          />
        }
         
        </MapView>
      </View>


    </View>)

}
