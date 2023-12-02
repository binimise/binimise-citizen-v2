import React, {useRef, useEffect, useState}  from 'react';
import { Dimensions, Image, FlatList } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "../redux/action";
import {View, Text, Touch} from "../ui-kit";
import Header from "../components/header";
import { getCheckpoints, updateCheckpoints,updateCheckpointsQrcode } from "./../repo/repo";
import Modal from "./../components/modal";
import * as Location from 'expo-location';
import MapView,{Marker}  from 'react-native-maps';
import { Color, PAGES, PHONENUMBER, APP_CONFIG, USERINFO, AUTHUID, TOKEN } from '../global/util';
import BarScanner from "./../components/barcodeScanner";
const width = Math.round(Dimensions.get('window').width);  
const height = Math.round(Dimensions.get('window').height);  


export default ({ navigation }) => {

    const [checkpoints, setCheckpoints] = useState({});
    const [mapModal, setMapModal] = useState(false);
    const [region, setRegion] = useState(APP_CONFIG.COORDINATES.coords);
    const [selectedCheckPoint, setSelectedCheckpoint] = useState({});
    const [currentLocation, setCurrentLocation] = useState({});
    const [showScanner, setShowScanner] = useState(false);
    const [scannedValue, setScannedValue] = useState("");
    const [selectedCheckpointName,setSelectedCheckpointName] = useState("");
    const [_mapType,setMapType] = useState("hybrid");
    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    let {userInfo} = useSelector(state => state.testReducer) || {};

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
        _getCheckpoints(); 
        _getLocationAsync();
    }, []);

    _getCheckpoints = async () => {
        let checkpoints = await getCheckpoints();
        setCheckpoints(checkpoints);
    } 

    toggleLoading = show => {
        setDataAction({"loading": {show}});
    }

    getScannedValue = scannedValue => {
      
        if(!scannedValue){
            return showErrorModalMsg("incorrect bar code");
        }
        setScannedValue(scannedValue);
    }

    closeModal = () => {
        setShowScanner(false);
        // setScannedValue("");
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

    selectLocationFromMap = async() => {
        setMapModal(false);
        await updateCheckpoints(selectedCheckPoint.id, region.latitude, region.longitude);
        showErrorModalMsg("location_updated");
        // alert("Location Sucessfully Updated..")
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

    saveQrCode = ()=>{
        
        updateCheckpointsQrcode(selectedCheckPoint.id, scannedValue);
        showErrorModalMsg("qr_code_attached");
        // setTimeout(async () => {
        //     alert("")
        // }, 1000);
        
        setScannedValue("");
        // setShowScanner(false);
    }
    
   

    return showScanner ?<BarScanner getScannedValue={getScannedValue} closeModal={closeModal}/>:
        <View c={"#F0F0F0"} w={width} h={"100%"}>
            <Header navigation={navigation} headerText={"updateCheckpoint"} />
           {scannedValue.length>0?
                <View bw={1} bc={Color.lightGrayColor} mt={8} mb={8} br={4} ph={16} mh={16}>
                    <Text ml={2} t={["scanned_val"+"  "+selectedCheckPoint.name+"  "+"is"+scannedValue]} c={Color.themeColor} s={22}/>
                    <Touch h={38} bc={Color.themeColor} center br={4} mb={4}
                        c={Color.themeFontColor} jc ai t={'update_qr'} 
                            onPress={() => {saveQrCode()}}
                    />
                </View>:null}
                <FlatList
                    style={{marginHorizontal : 16, marginTop : 20,marginBottom:20}}
                    data={ checkpoints }
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <View bw={1} bc={Color.lightGrayColor} mt={8} mb={8} br={4} ph={16} key={index.toString()}>
                            <Text  center s={16} t={item.name}/>
                            <View row mt={4}>
                                <Touch h={38} bc={Color.themeColor} w={140} br={4}
                                    c={Color.themeFontColor}  jc ai t={'scan_qr'} 
                                    onPress={() => {setShowScanner(true);
                                               setSelectedCheckpoint(item);
                                               setSelectedCheckpointName(item?.name);
                                    }}>
                                </Touch>
                                <Touch h={38} bc={Color.themeColor} w={140}  br={4}
                                    c={Color.themeFontColor} jc ai t={'update_location'} 
                                    style={{position:"absolute",right:0}}
                                    onPress={() => {setMapModal(true);
                                            setSelectedCheckpoint(item);
                                    }}>
                                </Touch>
                            </View>
                           
                            
                        </View>
                    )}
                />
                {
                    mapModal ? showMapModal() : null
                }
            </View>
        
}