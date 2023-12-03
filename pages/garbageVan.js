import React, { useState,useEffect } from 'react';
import { useSelector } from 'react-redux';
import MapView,{Marker} from 'react-native-maps';
import { View,Touch,Text} from "./../ui-kit";
import UserMarker from "./userMarker";
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from "../components/header";
import { Image } from 'react-native';
import { APP_CONFIG } from '../global/util';

export default ({ navigation }) => {
  const [_mapType,setMapType] = useState("standard")
  let userInfo = useSelector(state => state.testReducer.userInfo) || {};

  return  <View c={"white"}>
      <Header navigation={navigation} headerText={"garbageVan"} />
      <View mh={"5%"} w={"90%"} bc={"#CCCCCC"} mv={"5%"}>
        <MapView
          language={"hn"}
          mapType = {_mapType}
          style={{ alignSelf: 'stretch', height: '100%'}}
          region={{ latitude: userInfo?.lat || APP_CONFIG.COORDINATES.coords.latitude, longitude: userInfo?.long || APP_CONFIG.COORDINATES.coords.longitude,  latitudeDelta: 0.01, longitudeDelta: 0.01 }}
         
        >
          <UserMarker userInfo={userInfo} />
          <Marker
            coordinate={{latitude: userInfo?.lat || APP_CONFIG.COORDINATES.coords.latitude,longitude: userInfo?.long || APP_CONFIG.COORDINATES.coords.longitude}} 
          >
            <Image  source={require("./../assets/blueicon.png")}  style = {{height: 40, width:40}}/>
          </Marker>
        </MapView>
        <View style={{ position: "absolute", bottom: "20%", right:10 }}c={"white"} row w={"40%"}>
          <Touch jc ai t={"Map"} h={48} w={"48%"} c={_mapType =="standard"?"green":"black"} 
          onPress={()=>setMapType("standard")}/>
          <View w={1} c={"black"}/>
          <Touch jc ai t={"Satelite"} h={48} w={"50%"}  c={_mapType =="hybrid"?"green":"black"} 
          onPress={()=>setMapType("hybrid")}/>
        </View>
      </View>
    </View>
}

