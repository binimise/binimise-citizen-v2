import React, { useEffect, useState } from 'react';
import { Image as RNImageView,BackHandler,Dimensions,Linking,ScrollView} from "react-native";
import { useSelector } from 'react-redux';
import { View, Touch, Text } from "../ui-kit";
import Header from "../components/header";
import FilterButton from "../components/filterButton";
import { APP_CONFIG, Color, PAGES } from '../global/util';
import Icon from 'react-native-vector-icons/FontAwesome';
import MapView,{Marker} from 'react-native-maps';
let { width,height } = Dimensions.get("window");
import {useNavigationState} from '@react-navigation/native';


export default ({ navigation }) => {

  const [mapModal, setMapModal] = useState(false);
  const navigationValue = useNavigationState(state => state);
  const routeName = (navigationValue.routeNames[navigationValue.index]);
  let place = useSelector(state => state.testReducer.place) || {};
  let { userInfo,selectedLanguage } = useSelector(state => state.testReducer) || {};
 
  useEffect(() => {
    if(routeName === "PlacesDetails"){
      const backAction = () => {
        navigation.navigate(PAGES.PLACES)
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );
      return () => backHandler.remove();
    }
  });


  return (
    <View h={"100%"} w={"100%"}>
      <ScrollView>
        <View h={250}>
          <RNImageView 
            source={place.pictures ? { uri: place.pictures } : require("./../assets/dehri.png")}
            style={{ height: "100%" }} 
            />
          <Text b s={24} t={place?.placeName?.[selectedLanguage]} a bo={14} ml={30}  c={"white"}/>
          <Touch ml={10} a h={48}
            onPress={()=> {navigation.navigate(PAGES.PLACES)}}
          >
            <Icon size={34}
              name={"angle-left"}
              color={"white"} 
            /> 
          </Touch>
        </View>
        <View w={"92%"} mb={"4%"} mr={"2%"} br={4} c={"white"} mh={"4%"} mt={"6%"}>
          <Touch row ai ml={"4%"} mt={"2%"} h={30} mb={"2%"} 
            onPress={() => { Linking.openURL(`https://www.google.com/maps/dir/?api=1&origin=` +place.userlat+`,` + 
            place.userlong +`&destination=` +place.lat +`,` +place.long+`&travelmode=driving`)}} 
          >
            <Icon size={20} name={"location-arrow"} /> 
            <Text t={place.dist+" "+"km"} ml={"2%"}/>
          </Touch>
          <View row ai ml={"4%"} mt={"4%"}  mb={"2%"} w={"94%"}>
            <Icon size={20} name={"external-link"} /> 
            <Text t={place?.address || "N/A"} ml={"2%"} />
          </View>
        </View> 

        <View w={"92%"} mb={"4%"} mr={"2%"} br={4} c={"white"} mh={"4%"} mt={"6%"}>
          <Text t={"description"} ml={"6%"} mt={"4%"} mb={"2%"} b/>
          <View  bw={1}  bc={"#CCCCCC"}  mb={"4%"}/>
          <Text t={place.description || "N/A"} ml={"6%"} mb={"2%"}/>
        </View>

        <View w={"92%"} mb={"4%"} mr={"2%"} br={4} c={"white"} mh={"4%"} mt={"6%"}>
          <Text t={"mapView"} ml={"6%"} mt={"4%"} mb={"2%"} b/>
          <MapView
            language={"hn"}
            style={{ alignSelf: 'cover', height: 200,width:"92%",marginHorizontal:"4%" }}
            region={{ latitude: place.lat || APP_CONFIG.COORDINATES.coords.latitude,
                longitude: place.long|| APP_CONFIG.COORDINATES.coords.longitude,  
                latitudeDelta: 0.01, longitudeDelta: 0.01 }}
          >
            <Marker
              coordinate={{latitude: place.lat || APP_CONFIG.COORDINATES.coords.latitude,
                longitude: place.long|| APP_CONFIG.COORDINATES.coords.longitude
              }} 
            >
            <RNImageView 
                source={place.pictures ? { uri: place.pictures } : require("./../assets/dehri.png")} 
              // source={place.pictures ? { uri: place.pictures } : require("./../assets/icon.jpg")} 
                style={{ height: 40, width: 40,borderRadius:20,borderColor:"red",borderWidth:2 }} 
            /> 
            {/* <Image  source={require("./../assets/blueicon.png")}  style = {{height: 40, width:40}}/> */}
          </Marker>
          </MapView>
          <View row>
            <Touch row ai h={30} mb={"2%"} w={"25%"} ml={"71%"} mr={"4%"}
              onPress={() => { Linking.openURL(`https://www.google.com/maps/dir/?api=1&origin=` +place.userlat+`,` + 
              place.userlong +`&destination=` +place.lat +`,` +place.long+`&travelmode=driving`)}} t={"navigation"}/>
            

          </View>
         
        </View> 

      </ScrollView>
    </View>
  );
 
}