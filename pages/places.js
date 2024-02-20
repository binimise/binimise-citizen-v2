import React, { useState, useEffect }  from 'react';
import { Image as RNImageView, FlatList, Dimensions ,BackHandler, ScrollView,StyleSheet} from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "../redux/action";
import { View, Text, Touch } from "../ui-kit";
import Header from "../components/header";
import { Color, PAGES } from '../global/util';
import PlacesFilter from "./../components/placesFilter";
import { getPlaces,getAppSettings } from "./../repo/repo";
import Icon from 'react-native-vector-icons/FontAwesome';
import {getDistance, getPreciseDistance} from 'geolib';
import { useNavigationState,useIsFocused } from '@react-navigation/native';
import * as Location from 'expo-location';

export default ({ navigation }) => {

    const [mapModal, setMapModal] = useState(false);
    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    const [places, setPlaces] = useState([]);
    const [welcomeMessage,setWelcomeMessage] = useState("");
    const navigationValue = useNavigationState(state => state);
    const routeName = (navigationValue.routeNames[navigationValue.index]);
    let { userInfo,selectedLanguage } = useSelector(state => state.testReducer) || {};

    useEffect(() => {
        if(routeName === PAGES.PLACES){
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

    filterMapView = () => setMapModal(true);

    const getPlacesData = async () => {
        let places = await getPlaces(userInfo);
        let location = {};
        try{
          location = await Location.getLastKnownPositionAsync({enableHighAccuracy: true});
        }catch(e){}
        places.length>0&&places.map((eachplace,index)=>{
            let pdis = getDistance(
                {latitude: location? location?.coords?.latitude:userInfo.lat, 
                    longitude:location? location?.coords?.longitude:userInfo.long},
                {latitude:eachplace.lat,longitude: eachplace.long},
            );
           
            eachplace.dist =Math.trunc( pdis/1000);
            eachplace.userlat = location?.coords?.latitude ||userInfo.lat;
            eachplace.userlong =location?.coords?.longitude||userInfo.long
        })
        setPlaces(places);
    }

    useEffect(() => {
        getPlacesData();
        getWelcomeMessageFromSettings(selectedLanguage);
    }, [selectedLanguage]);
   
    
    const getWelcomeMessageFromSettings = async (Language)=>{
        let customizedValues = await getAppSettings();
        let local_val = customizedValues.length>0?customizedValues[0].notif_welcome_msg[Language]:""
         
        setWelcomeMessage(local_val);
    
      }
   
    const showPlaceDetail = item => {
        setDataAction({place: item});
        navigation.navigate(PAGES.PLACESDETAILS);
    }

    return (
        <View w={"100%"} h={"100%"}>
            <Header navigation={navigation} headerText={"places"}/>
            <ScrollView>
                {places.length === 0 ? (
                    <View ph={16} mb={16} bw={1} br={8} mh={16} mt={16} pv={8} bc={Color.lightGrayColor}>
                        <View h={300} jc ai mh={16}>
                            <View h={200} w={'100%'} ai>
                                <RNImageView source={require("./../assets/noPlaces.png")} resizeMode="contain" style={{ flex: 1 }} />
                            </View>
                            <Text s={20} b mb={16} t={"no_places_yet"} /> 
                            <Text s={16} mb={16} t={"no_places_message"} />
                        </View>
                    </View>):
                    <View style={styles.placesView}>
                        {places.map((item,index)=>{
                            return <Touch w={"48%"} mb={"4%"} mr={"2%"} br={4} h={200} bc={"white"} key={index.toString()}
                                     onPress={() => { showPlaceDetail(item); }}>
                                <RNImageView 
                                    source={item.pictures ? { uri: item.pictures } : require("./../assets/dehri.png")} 
                                    resizeMode="cover" style={{ height:"75%",width: "100%" }} 
                                /> 
                                <Text t={item.placeName?.[selectedLanguage]} ml={"2%"} b mt={"2%"}/>
                                <View row ai ml={"2%"} mt={"2%"} h={30} mb={"2%"} 
                                    onPress={() => {  showPlaceDetail(item); }}>
                                    <Icon size={20} name={"location-arrow"} /> 
                                    <Text t={item.dist+" "+"km"}/>
                                </View>
                            </Touch>                    
                        })}
                    </View>     
                }
            </ScrollView>
        </View>
    );

}

const styles=StyleSheet.create({
    placesView:{
        display:"flex",
        flexWrap:"wrap",
        flexDirection:"row",
        marginHorizontal:"5%",
        marginTop:"4%",
        width:"90%"
    }
})
