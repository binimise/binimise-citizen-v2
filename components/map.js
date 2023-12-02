import React,{useEffect,useState} from "react";
import { Image } from "react-native";
import MapView,{Marker} from "react-native-maps";
import Modal from "./modal";
import { View,Text,Touch } from "../ui-kit";
import { APP_CONFIG } from "../global/util";
import * as Location from 'expo-location';


export default (props) => {

    const [mapType,setMapType] = useState("hybrid");
    const [region, setRegion] = useState(APP_CONFIG.COORDINATES.coords);

    const getCurrentLocation = async () => {
        try {
            await Location.enableNetworkProviderAsync().then().catch(_ => null);
            let location = await Location.getLastKnownPositionAsync({enableHighAccuracy: true});
            return location.coords;
        }catch(e){
            showErrorModalMsg("error_in_getting_current_location");
        }
    }

    return <Modal closeModal = {props.closeMapModal()}> 
    <View row>
        <Text center b s={16} t="mapView"  w={"50%"}/> 
        <Touch s={16} c={"red"}  t={"close_map"} w={"50%"} onPress={props.closeMapModal()}  ai />
    </View>
    <View>
        <MapView
            ref={ref => (this.mapView = ref)}
            mapType={mapType}
            style={{height: height-200 }}
            zoomEnabled={true}
            followUserLocation={true}
            showsUserLocation={true}
            initialRegion={region || APP_CONFIG.COORDINATES.coords} //change here
            onRegionChangeComplete={region => setRegion({ ...region, latitudeDelta: 0.01, longitudeDelta: 0.01 })}>
                <Marker coordinate={{ ...region }}/>
        </MapView>

        <Touch style={{ position: "absolute", bottom: 30, left: 10 }} onPress={async () => {
            let location = await getCurrentLocation();
            setRegion({ ...location, latitudeDelta: 0.01, longitudeDelta: 0.01 });
            this.mapView.animateToRegion({ ...location, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 2000);
        }}>
            <Image source={require("./../assets/currentLocation.webp")} style={{ width: 50, height: 50 }} />
        </Touch>

        <View style={{ position: "absolute", bottom: 30, right:10 }}c={"white"} row w={"40%"}>
            <Touch jc ai t={"Map"} w={"48%"} onPress={()=>setMapType("standard")} c={mapType =="standard"?"green":"black"}/>
            <View w={1} c={"black"}/>
            <Touch jc ai t={"Satelite"} w={"50%"} onPress={()=>setMapType("hybrid")} c={mapType =="hybrid"?"green":"black"}/>
        </View>

    </View>

    <Touch jc bc={Color.themeColor} c={Color.themeFontColor} w={'100%'} br={4} mt={10}
        onPress={props?.selectLocationFromMap(region)} s={16} t={'select_location_from_map'}
    />
</Modal>
}

//selectLocationFromMap
//onCLose