import React, {useState, useEffect}  from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { APP_CONFIG, Color, PAGES,getCurrentDate} from "./../global/util";
import MapView, { Polygon } from 'react-native-maps';
import Header from "../components/header";
import { setData } from "./../redux/action";
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { Dimensions, ScrollView } from "react-native";
import { View, Text, Touch, TextInput, Picker } from "./../ui-kit";
import { getRouteLocation,getCitizensOfSaathi, fetchSaathiAssingedWards } from "../repo/repo";
import Styles from "../styles/styles";
import HouseholdCircle from "./householdCircle";
import HouseholdsOfWard from "./householdsOfWard";
import SaathiRoute from './saathiRoute';
import UserMarker from './userMarker';
import SaathiMarker from './saathiMarker';
import DropDownDiv from '../components/dropdown';
import PieChartDiv from "../charts/piechart";

const attendedYesOrNo = [
  { id:"all",name:"All"},
  { id:"attended",name:"Attended"},
  { id:"not_attended",name:"Not Attended"}
  
]

export default (props) => {

  let { navigation } = props;
  let { userInfo } = useSelector(state => state.testReducer) || {};
  const dispatch = useDispatch();
  const setDataAction = (arg) => dispatch(setData(arg));
  const [middleLocation, setMiddleLocation] = useState({});
  const [routes, setRoutes] = useState([]);
  const [_mapType,setMapType] = useState("standard");
  const [householdsArray,setHouseholdsArray] = useState([]);
  const [AcknowledgeArray,setAcknowledgeArray] = useState([]);
  const [householdsCount,setHouseHoldsCount] = useState([]);
  const [ wardsData,setWardsData] = useState([]);
  const [showHouseholdsOfWard,setShowHouseholdsOfWard ] = useState(false);
  const [ currentLocation,setCurrentLocation] = useState({});
  const [selectedItem,setSelectedItem] = useState({});
  const [ isPickerShow,setIsPickerShow] = useState(false);
  const [selectedValue,setSelectedValue] = useState("All");
  const [piechartObj,setPieChartObj] = useState({})
  const [zoomLevel,setZoomLevel] = useState(0);
  const isFocus = useIsFocused();
  let { height ,width} = Dimensions.get('window');
  
  useEffect(()=>{
    if(isFocus){
      setShowHouseholdsOfWard(false);
      getWardsList();
      getCitizensFromSaathiWards();
      getSaathiRoute();
      
    }
    
  },[isFocus])
 
  const getWardsList = async () => {
    try {

      const jsonValue = await AsyncStorage.getItem("wardsData");
      const storedTime = await AsyncStorage.getItem("wardTimestamp");

      if (jsonValue !== null) {
        const parsedArray = JSON.parse(jsonValue);
        setWardsData(parsedArray);
      }
      let wardTime = 0;
      
      
      if (storedTime !== null) {
        wardTime = parseInt(storedTime, 10);
      } 
      const currentTimestamp = Date.now();
      const timeDifferenceInSeconds = (currentTimestamp - wardTime) / 1000;
      if(timeDifferenceInSeconds>600){
          let temp = [];
          let data = await fetchSaathiAssingedWards(userInfo.ward);
          data?.docs?.map((eachDoc) => {
            let doc = eachDoc.data();
            let latAndlng = [];
          doc.Coordinates?.map((each) => {
            latAndlng.push({
              latitude: each.lat,
              longitude: each.lng
            })
          })
          
          let obj = {};
          obj.latAndlng = latAndlng;
          obj.name = doc.name;
          obj.centerLatAndLng = doc.centerLatAndLng;
          obj.doc_id = eachDoc.id;
          obj.id = doc.id;
          temp.push(obj);
        })
        setWardsData(temp);
        const jsonValue = JSON.stringify(temp);
        if(jsonValue!=null){
          await AsyncStorage.setItem("wardsData", jsonValue);
        }
        
        const timestamp = Date.now();
        await AsyncStorage.setItem("wardTimestamp",timestamp.toString());


      }
    } catch (error) {
      setWardsData([]);
    }
  };
  
  const showErrorModalMsg = (message, title = "message") => {
    setDataAction({ 
        errorModalInfo : {
            showModal : true, title, message
        }
    })
  };
 
  const getCitizensFromSaathiWards = async() => {
    try{
      const jsonValue = await AsyncStorage.getItem("householdsData");
      const AckFromStorage = await AsyncStorage.getItem("acknowledgeData");
      const HAndCFromStorage = await AsyncStorage.getItem("hAndcData");
      const storedTime = await AsyncStorage.getItem("householdsTimestamp");
      if(AckFromStorage!== null){
        const parsedArray = JSON.parse(AckFromStorage);
        setAcknowledgeArray(parsedArray);
      }
      if(HAndCFromStorage !== null){
        const parsedArray = JSON.parse(HAndCFromStorage);
        setHouseholdsArray(parsedArray);
      }
      if (jsonValue !== null) {
        const parsedArray = JSON.parse(jsonValue);
        setHouseHoldsCount(parsedArray);
      }
      let wardTime = 0;
      if (storedTime !== null) {
        wardTime = parseInt(storedTime, 10);
      } 
      const currentTimestamp = Date.now();
      const timeDifferenceInSeconds = (currentTimestamp - wardTime) / 1000;

      if(timeDifferenceInSeconds>600){
        toggleLoading(true);
        let date = getCurrentDate();
        if(userInfo?.ward?.length>0){
          let data = await  getCitizensOfSaathi(userInfo.ward,date);
          setAcknowledgeArray(data?.householdsAckAndCommercialAck);
          setHouseholdsArray(data?.householdsAndCommercial);
          const ackValue = JSON.stringify(data?.householdsAckAndCommercialAck);
          if (ackValue !== null) {
            await AsyncStorage.setItem("acknowledgeData", ackValue);
          }
          const totalValue = JSON.stringify(data?.householdsAndCommercial);
          if(totalValue !== null){
            await AsyncStorage.setItem("hAndcData",totalValue);
          }
          getWardWiseCount(data.householdsAckAndCommercialAck,data.householdsAndCommercial)
        }
        toggleLoading(false);
      }


      
      toggleLoading(false);
    }catch(e){
      console.log("err",e) //showModal here to click agaain
      toggleLoading(false);
    }
    
  }

  const getWardWiseCount = async(AcknowledgedHAndC,TotalHAndC) =>{
    let obj = {};
    AcknowledgedHAndC.forEach((usersDoc) => {
      let ward_id = usersDoc.ward_id;
      if(obj[ward_id] === undefined) {
          obj[ward_id] = { 
              "attendance" : 1,
              "userCount" : 0
          };
      } else {
          obj[ward_id]["attendance"] =obj[ward_id]["attendance"] +1
      }
    });
    
    TotalHAndC.forEach((houseDoc) => {
      let ward_id = houseDoc.ward_id;
      if(obj[ward_id] === undefined) {
          obj[ward_id] = {
              "attendance" :0,
              "userCount" : 1,
          };
      } else {
          obj[ward_id]["userCount"] = obj[ward_id]["userCount"] + 1;
      }
    });
    let result = Object.keys(obj).map(key => ({id: key, value: obj[key]}));
    setHouseHoldsCount(result || []);
    const jsonValue = JSON.stringify(result);
    await AsyncStorage.setItem("householdsData", jsonValue);
    const timestamp = Date.now();
    await AsyncStorage.setItem("householdsTimestamp",timestamp.toString());
   
  }

  
  if(isPickerShow){
    return(
      <View a c={Color.backgroundModalColor} jc ai zi={999} to={0} le={0} h={height} w={width}>
          <View w={width - 24} br={8} c={Color.white} jc pa={16} h={"90%"}>
            <Text t={"select_your_type"} center s={20} />
            <View w={"90%"} bw={0.5} mh={"5%"} bc={"black"} mb={"4%"}/>
            <ScrollView>
              {attendedYesOrNo.map((each,index)=>{
                return  <View key={index} mb={4}>
                <Touch h={40} w={"90%"} mh={"5%"} row key={index} bc={"#F0F8FF"} 
                    ai br={16} onPress={() => {setSelectedValue(each.name)}}
                >
                    <View style={Styles.radioCircle}>
                        {each.name===selectedValue && <View style={Styles.selectedRb} />}
                    </View>
                    <Text center ml={2} s={18} t={each.name} />
                </Touch>
                <View h={1} bw={0.5} bc={"#CCCCCC"} mh={"5%"} w={"90%"}/>
            </View>
              })}
            </ScrollView>
            <View w={"90%"} bw={0.5} mh={"5%"} bc={"black"}/>
              <View row jc>
                <Touch h={40} w={"40%"} jc ai t={"close_c"} mb={4} boc={"#F0F0F0"} bc={"red"}
                  mt={2} mr={10} bw={2} onPress={() =>{{setIsPickerShow(false)}}}/>
                <Touch h={40} w={"40%"} jc ai t={"submit"} mb={4} boc={"#F0F0F0"} bc={"green"}
                  mt={2} bw={2} onPress={() =>{setIsPickerShow(false)}}/>
              </View>
          </View>
      </View>
    )
}

  const toggleLoading = show => {
    setDataAction({"loading": {show}});
  }

  const getSaathiRoute =async() =>{
   
    try{

      const jsonValue = await AsyncStorage.getItem("userRouteData");
      const locationFromStorage = await AsyncStorage.getItem("middleLocation");
      const storedTime = await AsyncStorage.getItem("userTimestamp");
      
      if(locationFromStorage!== null){
        const parsedObj = JSON.parse(locationFromStorage);
        setMiddleLocation(parsedObj);
      }
      if (jsonValue !== null) {
        const parsedArray = JSON.parse(jsonValue);
        setRoutes(parsedArray);
      }
      let wardTime = 0;
      if (storedTime !== null) {
        wardTime = parseInt(storedTime, 10);
      } 
      const currentTimestamp = Date.now();
      const timeDifferenceInSeconds = (currentTimestamp - wardTime) / 1000;
      if(timeDifferenceInSeconds>600){
        let date = getCurrentDate();
      let locationData =  await getRouteLocation(date, userInfo);
      let routes_array = [],cenLat =[],cenLng =[];
      if(!locationData || !locationData.locations){
        routes_array = [];
      }else{
        locationData.locations.forEach((item, index) => {
          cenLat.push(item.lat);
          cenLng.push(item.long);
          routes_array.push({
            latitude : item.lat,
            longitude : item.long,
            status : item.status
          })
        });
      }
      let middle_location = cenLat.length>0&&cenLng.length>0&&getMiddleLocation(cenLat,cenLng) || {};
      setMiddleLocation(middle_location);
      setRoutes(routes_array);
      const jsonValue = JSON.stringify(routes_array);
      if(jsonValue!=null){
        await AsyncStorage.setItem("userRouteData", jsonValue);
      }
      
      const timestamp = Date.now();
      await AsyncStorage.setItem("userTimestamp",timestamp.toString());
      const locationFromBackend = JSON.stringify(middle_location);
      if(locationFromBackend!=null){
        await AsyncStorage.setItem("middleLocation", locationFromBackend);
      }
      

      }
      
    }catch(e){
      console.log(e)
    }
  }

  const getMiddleLocation = (cenLat,cenLng) =>{
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
      if(polyLat){
        return latlng;
      }else{
        return {}
      }
      
  }

  const getCenter = (item) => {
    let coordinateObj = {
        "latitude" : item?.centerLatAndLng?.lat || APP_CONFIG.COORDINATES.coords.latitude,
        "longitude" : item?.centerLatAndLng?.lng || APP_CONFIG.COORDINATES.coords.longitude
    }
    setCurrentLocation(coordinateObj);
 }

  const showHouseholdsInMap = (obj) =>{
    let selected_ward = wardsData.find(item => item.name == obj.id);
    getCenter(selected_ward);
    setSelectedItem(obj);
    setShowHouseholdsOfWard(true);
  }
 
  const closeHouseholdWard = () =>{
    setShowHouseholdsOfWard(false);
    setCurrentLocation({});
    setSelectedItem({})
  }

  const handleMapTypeChange = (newMapType) => {
    setMapType(newMapType);
  };
  const totalCommercialAndAcknowledge = (obj) =>setPieChartObj(obj);
  const valueFromdropdown = (item) => setSelectedValue(item);

  const calculateZoomLevel = (latitudeDelta, longitudeDelta) => {
    const angle = Math.min(latitudeDelta, longitudeDelta);
    return Math.round(Math.log(360 / angle) / Math.LN2);
  };

  const onRegionChangeComplete = (region) => {
    const calculatedZoomLevel = calculateZoomLevel(region.latitudeDelta, region.longitudeDelta);
    setZoomLevel(calculatedZoomLevel);
  };

  return (
    <View>
      <Header navigation={navigation} headerText={"mapView"} />
      <MapView
        language = {"hn"}
        mapType = {_mapType}
        style = {{ alignSelf: 'stretch', height: '100%',position:"relative" }}
        region = {{ 
          latitude: currentLocation?.latitude ||middleLocation?.latitude || APP_CONFIG.COORDINATES.coords.latitude, 
          longitude: currentLocation?.longitude||middleLocation?.longitude || APP_CONFIG.COORDINATES.coords.longitude, 
          // latitudeDelta:  0.010, longitudeDelta: 0.01
          latitudeDelta:  0.01, longitudeDelta: 0.01
        }}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {
          routes.length>0&&
          <SaathiRoute 
            staffObj = {{
              name:userInfo.name||"",
              phoneNumber:userInfo.phoneNumber||"",
              routes:routes
            }}
          />
        }
        {
          userInfo?.ward?.length>0?
          <UserMarker 
            wards = {JSON.parse(JSON.stringify(userInfo.ward))}
            selectedArea = {selectedItem?.id}
          />:null
        }

        {
          userInfo.isSupervisor&&userInfo.saathi_list?.length>0?
          <SaathiMarker 
            saathiList = {JSON.parse(JSON.stringify(userInfo.saathi_list))}
            selectedArea = {selectedItem?.id}
          />:null
        }
        {
          showHouseholdsOfWard?
            <HouseholdsOfWard
              householdsArray = {householdsArray}
              AcknowledgeArray = {AcknowledgeArray}
              selectedItem = {selectedItem}
              selectedValue = {selectedValue}
              pieChartData = {totalCommercialAndAcknowledge}
            />:
            <HouseholdCircle
              householdsCount = {householdsCount}
              wardsData = {wardsData}
              showHouseholdsInMap = {showHouseholdsInMap}
              zoom_level = {zoomLevel}
            />

        }
        
      </MapView>
        {
          showHouseholdsOfWard? 
          <View style={{ position: "absolute", bottom: "10%", right:10 }}c={Color.themeColor} row w={80} br={16}>
            <Touch jc ai t={"back"} w={"100%"} onPress={closeHouseholdWard} c={"white"} h={40} />
          </View>:null
        }
        {
          showHouseholdsOfWard?
          <View style={{ position: "absolute", top: "10%", right:10 }} br={16} w={120} h={48} c={Color.white}>
            <DropDownDiv
              valueFromdropdown = {valueFromdropdown}
            />
          </View>:null
        }
        {
          showHouseholdsOfWard?<PieChartDiv chartdata = {piechartObj}/>:null
        }
       

      <View style={{ position: "absolute", top: "10%", left:10 }} br={16} c={"white"} row w={"40%"}>
        <Touch jc ai t={"Map"} w={"48%"} onPress={()=>handleMapTypeChange("standard")} c={_mapType =="standard"?"green":"black"}/>
        <View w={1} c={"black"}/>
        <Touch jc ai t={"Satelite"} w={"50%"} onPress={()=>handleMapTypeChange("hybrid")} c={_mapType =="hybrid"?"green":"black"}/>
      </View>
    </View>
  );
}