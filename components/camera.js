import React, { useState,useEffect }  from 'react';
import { Dimensions, Image,ImageBackground, StyleSheet,Button} from "react-native";
import { Color,APP_CONFIG,PAGES,AUTHUID } from "./../global/util";
import { setData } from "./../redux/action";
import { View, Text, Touch } from "./../ui-kit";
import { useSelector, useDispatch } from "react-redux";
import { Camera,CameraType } from 'expo-camera';
import * as Location from 'expo-location';
import { BarCodeScanner } from 'expo-barcode-scanner';
import firebase from "./../repo/firebase";
import Icon from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import AcknowledgeFromCamera from '../pages/acknowledgeFromCamera';
import ViewShot from 'react-native-view-shot';
import MapView ,{Marker}  from 'react-native-maps';
import {getUserData,getUserByQrCode,getHouseholdDataById} from "./../repo/repo";
import * as ImageManipulator from 'expo-image-manipulator';
const { width, height } = Dimensions.get('window');
// import { useNavigation } from '@react-navigation/native';

export default () => {

  const dispatch = useDispatch();
  const setDataAction = (arg) => dispatch(setData(arg));
  const [type, setType] = useState(CameraType.back);
  const [hasPermission, setHasPermission] = useState(null);
  const [camera, setCamera] = useState({});
  const storageRef = firebase().firebase.storage();
  const [showPreview, setShowPreview] = useState(false);
  const [url, setUrl] = useState("");
  const [scanned, setScanned] = useState(false);
  const [scanResult,setScanResult] = useState("")
  let { userInfo } = useSelector(state => state.testReducer) || {};
  let cameraInfo = useSelector(state => state.testReducer.cameraInfo) || {};
  const [addressValue,setAddressValue] = useState({});
  const [saathiWards, setSaathiWards] = useState([]);
  const [wardUsers, setWardusers] = useState([]);
  const viewShot = React.useRef();

  // useEffect(() => {
  //   (async () => {
  //     const { status } = await BarCodeScanner.requestPermissionsAsync();
  //     setHasPermission(status === 'granted');
  //   })();
   
  // }, []);

  if(!cameraInfo.show)
    return null;
        
  setIsLoading = type => {
    setDataAction({ loading: { show : type }});
  }

  const closeCamera = () => {
    setDataAction({ cameraInfo: { show : false }});
  }

  closeCameraWithModals = message => {
    setDataAction({ 
      loading: { show : false },
      errorModalInfo: { showModal: true, message },
      cameraInfo: { show: false }
    });
  }

  const resizeImage = async (uri) => {
    const resizedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 200, height: 300 } }], // Adjust width and height as needed
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG } // Adjust compression and format
    );
    return  resizedImage.uri;
  };
 
  const saveImage = async (flag) => {
    viewShot.current.capture().then(async(uri) => {
      
      try {
        let urlFromRS =  await resizeImage(uri);
        closeCamera();
        setIsLoading(true);
        const reference = storageRef.ref(cameraInfo.imageRef);
        reference.putFile(urlFromRS).then(()=> {
          reference.getDownloadURL().then(url => {
            setIsLoading(false);
            let temp = cameraInfo?.navigation?{url:url,spotfine:flag}:url;
            cameraInfo.onLoadOp(temp);
            setDataAction({cameraInfo : {onLoadOp : url,spotfine:false}},
              { errorModalInfo: { showModal : flag, message: "image_loaded_successfully" }});                 
          }).catch((error) => { 
            setIsLoading(false); 
          });
        }).catch(() => {
          setIsLoading(false);
        });
        setUrl("");
        setShowPreview(false);
      } catch(e) {
        closeCameraWithModals("Oops!! there is an error while saving image");
      }
      }),
      (error) => console.error("Oops, snapshot failed", error);
    
  }

  const getImageDetails = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission denied');
        return;
      }

      let location = await Location.getLastKnownPositionAsync({ enableHighAccuracy: true });
      let lat = location?.coords?.latitude || APP_CONFIG.COORDINATES.coords.latitude;
      let long = location?.coords?.longitude || APP_CONFIG.COORDINATES.coords.longitude;


      let result = await Location.reverseGeocodeAsync({ latitude: lat, longitude: long });
      if (result && result.length > 0) {
        let address = result[0];
        address.timestamp = location?.timestamp;
        address.latitude = lat;
        address.longitude = long;
        setAddressValue(address);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setDataAction({loading:{show:false}});
    }
  };


  const takePicture = async () => {
    if (!camera) return;
      try {
        const photo = await camera.takePictureAsync({ quality: 0.1,base64: true });
        setDataAction({loading:{show:true,message:"getting_address_of_current_location"}})
        setUrl(photo.uri);
        getImageDetails();
        setDataAction({loading:{show:false}})
        setShowPreview(true);
      } catch(e) {
        closeCameraWithModals("Oops!! there is an error while capturing image");
      }
  }

  if(showPreview){
    let d = new Date(addressValue?.timestamp);
    let result1 = d.toString();
    let city = addressValue?.city || "",
      district = addressValue?.region || "",
      country = addressValue?.country || "",
      name  = addressValue?.name || "",
      postalCode = addressValue?.postalCode || "",
      _lat = addressValue?.latitude,
      _long = addressValue.longitude
        
    return (
      <View style={{height,width}}>
        <ViewShot
          ref = {viewShot}
          options={{ format: "png", quality: 0.1 }}
        >
          <View h={cameraInfo?.navigation?height*(0.82):height*(0.9)} w={width}>
            <ImageBackground source={{ uri: url }} resizeMode="cover" style={{ flex: 1 }}>
              <View style={styles.viewstyle}>
                <View row>
                  {_lat&&_long&&<MapView
                    mapType={"hybrid"}
                    region={{ latitude: _lat , longitude: _long, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }}
                    style={{ width:"30%", height: '100%'}}
                  >
                    <Marker coordinate={{latitude:_lat,longitude:_long}} />
                  </MapView>}
                  <View ph={6} w={"70%"}>
                    <Text t={name+", "+city+", "} style={styles.TextStyle}/>
                    <Text t={district+"  "+postalCode+", "+country} style={styles.TextStyle}/>
                    <Text t={"Lat"+"  "+_lat} style={styles.TextStyle}/>
                    <Text t={"Long"+"  "+_long} style={styles.TextStyle}/>
                    <Text t={result1} style={styles.TextStyle}/>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </View>
        </ViewShot>
        {cameraInfo.navigation&&
        <Touch jc h={height*(0.06)} mt={height*(0.02)} mh={"2%"} w={'96%'} br={4} bw={1}
            s={14} c={Color.white} center t={"spot_fine"} bc={Color.themeColor}
            onPress={()=>saveImage(true)} 
          />}
        <View row c={Color.white}  h={height*(0.10)} jc ai>
          <Touch jc h={36} w={'48%'} br={4} bw={1} mr={8}
            s={14} c={Color.black} center t={ "close" }
            onPress={() => { setShowPreview(false); }} 
          />
          <Touch jc h={36} w={'48%'} br={4} bw={1}
            s={14} c={Color.black} center t={ "submit" }
            onPress={()=>saveImage(false)} 
          />
        </View>
      </View> 
    );
  }

  const handleBarCodeScanned = ({ type, data }) => {
    // setScanResult(data);
    // setScanned(true);
    if(cameraInfo.navigation){
        setDataAction({
          cameraInfo: {
            show: false,
            onLoadOp: "",
            imageRef: "saathi_task/" + userInfo[AUTHUID] + "/" + new Date().toLocaleDateString().split("/").join("-") + "/" + new Date().getTime() + '.jpg'
          }
        });
        cameraInfo.navigation.navigate(PAGES.ACKNOWLEDGEFROMCAMERA,{
          scannedData:data
      })
     }
    
  };


  closeScanner = ()=>{
    setScanned(false);
  }

  return  userInfo.status?
      <Camera
        style={{height,width}} 
        type={type}
        ref={(ref) => setCamera(ref)}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        barCodeScannerSettings={{ barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr] }}
      >
        <Touch a to={20} le={20} h={60} bc={Color.white} 
          br={32} w={60} jc ai onPress={()=>closeCamera()}
        >
          <Icon size={36} 
            name={"close"}
            color={Color.themeColor} 
            // onPress={closeCamera}
          />
        </Touch>
        <Touch a bo={10} le={20} h={60} bc={Color.white} br={32} w={60} jc ai  
          onPress={()=>{type == CameraType.front?setType(CameraType.back):setType(CameraType.front)}}
        >
          <MaterialIcons size={36}
            name={"camera-flip-outline"}
            color={Color.themeColor} 
          />
        </Touch>
        <Touch a bo={10}  h={60} bc={Color.white} br={32} w={60}  jc ai
           style={{alignSelf:"center"}} onPress={()=>takePicture()}
        >
          <Icon size={36} 
            name={"camera"} 
            color={Color.themeColor} 
            // onPress={takePicture}
          />
        </Touch>
      </Camera>:
      <View a c={Color.backgroundModalColor} jc ai zi={999} to={60} le={0} h={height} w={width}>
        <View w={width - 48} br={8} c={Color.white} jc pa={2} h={80}>
          <Text t={"switch_on_duty"} center b pa={10} s={24}/>
        </View>
      </View>
}

const styles = StyleSheet.create({
  viewstyle:{
    width:"100%",
    backgroundColor:"black",
    position:"absolute",
    opacity:0.7,
    bottom:0,
  },
  TextStyle:{
    fontSize:14,
    color:"white",
  }
});