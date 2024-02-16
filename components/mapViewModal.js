import React, {useState, useEffect }  from 'react';
import { Dimensions, Image,Linking } from "react-native";
import { View, Text, Touch } from "./../ui-kit";
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import * as Location from 'expo-location';
import Modal from "./../components/modal";
import { Color,APP_CONFIG } from '../global/util';
import MapView,{Marker} from 'react-native-maps';
import Styles from '../styles/styles';
let { height ,width} = Dimensions.get('window');

export default (props) => {

    const { handleLocationSelected,handleMapClose } = props;
    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    const [mapCoordinates,setMapCoordiantes] = useState({...props?.intialCoordinates});
    const [typeOfMap,setTypeOfMap] = useState("hybrid");
    const [showSubmitButton,setShowSubmitButton] = useState(false);

    useEffect(() =>{
        checkGPSStatus();
    },[])

    const loaderInMapview = (show,message) => {
        setDataAction({"loading": {show,message}});
    }

    const checkGPSStatus = async () => {
        let providerStatus = await Location.getProviderStatusAsync();
        if (providerStatus.locationServicesEnabled) {
            setDataAction({ 
                errorModalInfo: {
                  showModal: false
                }
            });
            // await getCurrentLocation();
        } else {
          LocalNullModal("please_switch_location","switch_on_location");
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

    const getCurrentLocation = async () => {
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
                    setShowSubmitButton(false);
                    location = await Promise.race([
                        Location.getCurrentPositionAsync({ enableHighAccuracy: false }),
                        new Promise((resolve, reject) => {
                            setTimeout(() => reject(new Error('Current location request timed out')), 3000);
                        })
                    ]);

                    if (!location) {
                        loaderInMapview(false);
                        showErrorModalMsg("unable_to_fetch_exact_location");
                        return;
                    }
                }

                setShowSubmitButton(true);
                loaderInMapview(false);
                return location?.coords;
            } catch (e) {
                loaderInMapview(false);
                showErrorModalMsg("unable_to_fetch_exact_location");
            }
        } else {
            LocalNullModal("please_switch_location", "switch_on_location");
        }

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
    
  
   console.log("mapCor",mapCoordinates)

    return <View style={Styles.mapView}>
            {/* <View row>
                <Text center b s={16} t="mapView" w={"50%"} />
                <Touch s={16} c={"red"} t={"close_m"} w={"50%"} onPress={() => handleMapClose()} ai />
            </View> */}
            
            <Text t = {"please_select_location_by_clicking"} b c= {Color.themeColor} h={"3%"} s={14} mh={"2%"}/>
            <View >
                <MapView
                    style={{height: "97%",width: '100%'}}
                    ref = {ref => (this.mapView = ref)}
                    mapType = {typeOfMap}
                    zoomEnabled = {true}
                    followUserLocation = {true}
                    // showsUserLocation = {true}
                    initialRegion = {{ 
                        latitude : mapCoordinates?.latitude || APP_CONFIG.COORDINATES.coords.latitude,
                        longitude : mapCoordinates?.longitude || APP_CONFIG.COORDINATES.coords.longitude, 
                        latitudeDelta: 0.01, longitudeDelta: 0.01 
                    }}
                    onRegionChangeComplete = {region => setMapCoordiantes({ ...region, latitudeDelta: 0.01, longitudeDelta: 0.01 })}
                >
                    <Marker coordinate={{ ...mapCoordinates }} draggable />
                </MapView>
                <Touch style={{ position: "absolute", bottom: 80, left: 10 }} onPress={async () => {
                    let location = await getCurrentLocation();
                    let latitude = location?.latitude ||mapCoordinates?.latitude || APP_CONFIG.COORDINATES.coords.latitude;
                    let longitude = location?.longitude || mapCoordinates?.longitude ||APP_CONFIG.COORDINATES.coords.longitude;
                   
                    setMapCoordiantes({ latitude,longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
                    this.mapView.animateToRegion({latitude,longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 2000);
                }}>
                    <Image source={require("./../assets/currentLocation.webp")} style={{ width: 50, height: 50 }} />
                </Touch>
                <View style={{ position: "absolute", bottom: 80, right: 10 }} c={"white"} row w={"40%"} br={16}>
                    <Touch jc ai t={"map"} w={"48%"} onPress={() => setTypeOfMap("standard")} c={typeOfMap == "standard" ? "green" : "black"} />
                    <View w={1} c={"black"} />
                    <Touch jc ai t={"satelite"} w={"50%"} onPress={() => setTypeOfMap("hybrid")} c={typeOfMap == "hybrid" ? "green" : "black"} />
                </View>
            </View>
            {showSubmitButton && 
            <Touch jc bc={Color.themeColor}  a h={48} style={{bottom:10}}
                c={Color.themeFontColor} w={'80%'} br={4} ml={40} 
                onPress={() =>{ setShowSubmitButton(false);
                    handleLocationSelected(mapCoordinates)}
                } s={16} t={'save'}
            />}
        </View>
  
}