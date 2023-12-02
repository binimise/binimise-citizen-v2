import React, {useState, useEffect}  from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { APP_CONFIG } from "./../global/util";
import MapView,{Marker}  from 'react-native-maps';
import Header from "../components/header";
import * as Location from 'expo-location';
import { setData } from "./../redux/action";
import { useFocusEffect } from '@react-navigation/native';
import { Image } from "react-native";
import { View, Touch } from "./../ui-kit";
import { getTaskAndComplaints } from "../repo/repo";


export default (props) => {

  let { navigation } = props;
  let { userInfo } = useSelector(state => state.testReducer) || {};
  const dispatch = useDispatch();
  const setDataAction = (arg) => dispatch(setData(arg));
  const [currentLocation, setCurrentLocation] = useState({});
  const [_mapType,setMapType] = useState("standard");
  const [assignedTasks,setAssignedTasks] = useState([]);
  
  useEffect(()=>{
    if(!props?.route?.params?.location){
      _getLocationAsync();
      getAllTasksOfSaathi()
    }
  },[])


  const getAllTasksOfSaathi = async () => {
    let tasks = await getTaskAndComplaints(userInfo);
      if(!tasks.length){
        tasks = [];
      }
    setAssignedTasks(tasks);
  }
 

  const updateLocationAsync = () => {
    if(props?.route?.params?.location){
      setAssignedTasks([])
      _getLocationAsync();
      setAssignedTasks([props?.route?.params?.location])
    }else  {
      getAllTasksOfSaathi()
    }
    
  }
  
  const _getLocationAsync = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if(status !== "granted"){
        return showErrorModalMsg("please_grant_location_permission_c");
    }
    try {
        let location = await Location.getLastKnownPositionAsync({enableHighAccuracy: true});
        setCurrentLocation({ ...location?.coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
    }catch(e){
        showErrorModalMsg("error_in_getting_current_location");
    }
  };

  const showErrorModalMsg = (message, title = "message") => {
    setDataAction({ 
        errorModalInfo : {
            showModal : true, title, message
        }
    })
  };

  useFocusEffect(
    React.useCallback(() => {
      updateLocationAsync()
    }, [])
  );


  return (
    <View>
      <Header navigation={navigation} headerText={props?.route?.params?.header || "tasks"} />
      <MapView
        language={"hn"}
        mapType={_mapType}
        style={{ alignSelf: 'stretch', height: '100%' }}
        region={
          { latitude: currentLocation?.latitude || APP_CONFIG.COORDINATES.coords.latitude, 
            longitude: currentLocation?.longitude || APP_CONFIG.COORDINATES.coords.longitude, 
            latitudeDelta: 0.01, longitudeDelta: 0.01
          }
        }
      
      >
        <Marker
          coordinate={
            { latitude: currentLocation?.latitude || APP_CONFIG.COORDINATES.coords.latitude, 
              longitude: currentLocation?.longitude || APP_CONFIG.COORDINATES.coords.longitude
            }
          } 
        />
         {assignedTasks.length>0&&assignedTasks.map((eachTask,index)=>{
            let title= eachTask?.type == "complaint"?eachTask?.typesOfComplaint :eachTask?.selectedWasteType?.name
            return <Marker
              key={index}
              coordinate={
                { latitude: eachTask?.location?.latitude || APP_CONFIG.COORDINATES.coords.latitude, 
                  longitude: eachTask?.location?.longitude || APP_CONFIG.COORDINATES.coords.longitude
                }
              }
              title={title}
            >
              <Image  source={eachTask?.t_id?require("./../assets/task-active.png"):require("./../assets/complain-red.png")}
                style = {{height: 24, width:24}}
              />
            </Marker>
          })}
      </MapView>
      <View style={{ position: "absolute", bottom: "10%", right:10 }}c={"white"} row w={"40%"}>
        <Touch jc ai t={"Map"} w={"48%"} onPress={()=>setMapType("standard")} c={_mapType =="standard"?"green":"black"}/>
        <View w={1} c={"black"}/>
        <Touch jc ai t={"Satelite"} w={"50%"} onPress={()=>setMapType("hybrid")} c={_mapType =="hybrid"?"green":"black"}/>
      </View>
    </View>
  );
}