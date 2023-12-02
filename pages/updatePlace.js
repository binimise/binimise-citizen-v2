import React, {useRef, useEffect, useState}  from 'react';
import { Dimensions, Image, FlatList } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "../redux/action";
import {View, Text, Touch} from "../ui-kit";
import Header from "../components/header";
import { getPlaces, updatePlaces } from "./../repo/repo";
import Modal from "./../components/modal";
import * as Location from 'expo-location';
import MapView,{Marker} from 'react-native-maps';
import { Color, PAGES, PHONENUMBER, APP_CONFIG, USERINFO, AUTHUID, TOKEN } from '../global/util';
import IconAnt from 'react-native-vector-icons/AntDesign';
const width = Math.round(Dimensions.get('window').width);  
const height = Math.round(Dimensions.get('window').height);  


export default ({ navigation }) => {

    const [checkpoints, setCheckpoints] = useState({});
    const [mapModal, setMapModal] = useState(false);
    const [region, setRegion] = useState(APP_CONFIG.COORDINATES.coords);
    const [selectedCheckPoint, setSelectedCheckpoint] = useState({});
    const [currentLocation, setCurrentLocation] = useState({});
    let { userInfo } = useSelector(state => state.testReducer) || {};
    const [_mapType,setMapType] = useState("hybrid")

    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));

    _getLocationAsync = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if(status !== "granted"){
            return showModal("please_grant_location_permission_c");
        }
        toggleLoading(true);
        getCurrentLocation();
        toggleLoading(false);
      };

    useEffect(() => {
        _getPlaces(); 
        _getLocationAsync();
    }, []);

    _getPlaces = async () => {
        let checkpoints = await getPlaces();
        setCheckpoints(checkpoints);
    } 

    toggleLoading = show => {
        setDataAction({"loading": {show}});
    }

    getCurrentLocation = async () => {
        try {
            await Location.enableNetworkProviderAsync().then().catch(_ => null);
            let location = await Location.getLastKnownPositionAsync({enableHighAccuracy: true});
            setCurrentLocation(location.coords);
            // setRegion(location.coords);
            return location.coords;
        }catch(e){
            showErrorModalMsg("error_in_getting_current_location");
        }
    }

    showErrorModalMsg = (message, title = "message") => {
        setDataAction({ 
            errorModalInfo : {
                showModal : true, title, message
            }
        })
    };

    selectLocationFromMap = () => {
        setMapModal(false);
        updatePlaces(selectedCheckPoint.id, region.latitude, region.longitude);
        showErrorModalMsg("location_updated");
    }
    
    showMapModal = () => (
        <Modal>
            <View row>
                <Text center b s={16} t="mapView"  w={"50%"}/> 
                <Touch s={16} c={"red"}  t={"close_m"} w={"50%"} onPress={()=>setMapModal(false)}  ai />
            </View>
           
            <View>
                <MapView
                        mapType={_mapType}
                        style={{height: height-200 }}
                        ref={ref => (this.mapView = ref)}
                        zoomEnabled={true}
                        followUserLocation={true}
                        showsUserLocation={true}
                        initialRegion={region || APP_CONFIG.COORDINATES.coords}
                        onRegionChangeComplete={region => setRegion({ ...region, latitudeDelta: 0.01, longitudeDelta: 0.01 })}>
                            <Marker coordinate={{ ...region }} draggable />
                </MapView>
                    <Touch style={{ position: "absolute", bottom: 30, left: 10 }} onPress={async () => {
                        let location = await getCurrentLocation();
                        setRegion({ ...location, latitudeDelta: 0.01, longitudeDelta: 0.01 });
                        this.mapView.animateToRegion({ ...location, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 2000);
                    }}>
                        <Image source={require("./../assets/currentLocation.webp")} style={{ width: 50, height: 50 }} />
                    </Touch>
                    <View style={{ position: "absolute", bottom: 30, right:10 }}c={"white"} row w={"40%"}>
                    <Touch jc ai t={"Map"} w={"48%"} onPress={()=>setMapType("standard")} c={_mapType =="standard"?"green":"black"}/>
                    <View w={1} c={"black"}/>
                    <Touch jc ai t={"Satelite"} w={"50%"} onPress={()=>setMapType("hybrid")} c={_mapType =="hybrid"?"green":"black"}/>
                </View>
                </View>
                <Touch jc bc={Color.themeColor} c={Color.themeFontColor} w={'100%'} br={4} mt={10}
                    onPress={selectLocationFromMap} s={16} t={'select_location_from_map'}/>
        </Modal>
     
    )
    //  console.log("u",userInfo.status)
    return <View style={{ }}>
        <Header navigation={navigation} headerText={"updatePlace"} />
        {userInfo.status?
        <FlatList
            style={{marginHorizontal : 16, marginTop : 20}}
            data={ checkpoints }
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
                    <View row ai bw={1} bc={Color.lightGrayColor}
                        style={{ justifyContent: "space-between" }}
                        mt={8} mb={8} br={4} ph={16}>
                        <Text s={16} t={item.name}/>
                        <Touch h={38} bc={Color.themeColor} w={100} c={Color.themeFontColor} 
                            br={4} jc ai t={'update_location'} onPress={() => { 
                                setMapModal(true);
                                setSelectedCheckpoint(item);
                            }}>
                        </Touch>
                    </View>
                )
            }
        />:
        <View a c={Color.backgroundModalColor} jc ai zi={999} to={60} le={0} h={height} w={width}>
            <View w={width - 48} br={8} c={Color.white} jc pa={2} h={80}>
            <Text t={"switch_on_duty"} center b pa={10} s={24}/>
            </View>
        </View>
        }
        {
            mapModal ? showMapModal() : null
        }
    </View>
}