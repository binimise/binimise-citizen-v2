import React, {useState, useEffect}  from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {Color, APP_CONFIG } from '../global/util';
import MapView,{Marker}  from 'react-native-maps';
import Header from "../components/header";
import * as Location from 'expo-location';
import { setData } from "./../redux/action";
import { useFocusEffect } from '@react-navigation/native';
import { Image } from "react-native";
import { View, Touch,Text } from "./../ui-kit";
import Styles from "../styles/styles";
import { getTaskAndComplaints } from "../repo/repo";


const getTaskIcon = (taskState) =>{
  if (taskState =="ACTIVE"){
    return <Image source={require("./../assets/task-active.png")} style = {{height: 24, width:24}}/>
  } else if (taskState == "ASSIGNED") {
    return <Image source={require("./../assets/task-assigned.png")} style = {{height: 24, width:24}}/>
  } else if (taskState == "CLOSED") {
    return <Image source={require("./../assets/task-done.png")} style = {{height: 24, width:24}}/>
  }
};
const getComplaintIcon = (complainState) =>{
  if (["ACTIVE","",undefined].includes(complainState)){
    return <Image source={require("./../assets/complain-red.png")} style = {{height: 24, width:24}}/>
  } else if (["ASSIGNED","ASSSIGNED"].includes(complainState)) {
    return <Image source={require("./../assets/complain-yellow.png")} style = {{height: 24, width:24}}/>
  } else if (["CLOSED","DONE"].includes(complainState)) {
    return <Image source={require("./../assets/complain-blue.png")} style = {{height: 24, width:24}}/>
  } else if (complainState === "PENDING") {
    return <Image source={require("./../assets/complain-green.png")} style = {{height: 24, width:24}}/>
  }
};
export default (props) => {

  const dispatch = useDispatch();
  const setDataAction = (arg) => dispatch(setData(arg));
  const [currentLocation, setCurrentLocation] = useState({});
  const [_mapType,setMapType] = useState("standard");
  const [assignedTasks,setAssignedTasks] = useState([]);
  
  useEffect(()=>{
    if(props?.staffData?.authUid){
      _getLocationAsync();
      getAllTasksOfSaathi(props?.staffData);
    }
  },[props?.staffData])


  const getAllTasksOfSaathi = async (s_data) => {
    let tasks = await getTaskAndComplaints(s_data);
      if(!tasks.length){
        tasks = [];
      }
    setAssignedTasks(tasks);
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

  const getTitleOfIcon = (each_task) =>{
    return each_task?.type == "complaint"?each_task?.typesOfGarbageDump :each_task?.selectedWasteType?.name
  }

  return (
    <View bw={1} bs={"dashed"} br={4} s={16} mb={30}
      bc={Color.lightGrayColor} c={Color.backgroundColor}
    >
      <MapView
        language={"hn"}
        mapType={_mapType}
        style={{ alignSelf: 'stretch', height: 300 }}
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
           
            return <Marker
              key={index}
              coordinate={
                { latitude: eachTask?.location?.latitude || APP_CONFIG.COORDINATES.coords.latitude, 
                  longitude: eachTask?.location?.longitude || APP_CONFIG.COORDINATES.coords.longitude
                }
              }
              title = {getTitleOfIcon(eachTask)}
            >
              {eachTask?.t_id?getTaskIcon(eachTask.state):getComplaintIcon(eachTask.state)}
              
            </Marker>
          })}
      </MapView>
      {assignedTasks.length>0&&<View style={Styles.cardStyle}>
        <Text s={14} t={"assigned_tasks"} c={"black"} b/>
        {assignedTasks.map((eachTask,index)=>{
          let t_type = eachTask?.selectedWasteType?.name || eachTask?.typesOfGarbageDump || "N/A";
          return <View row key ={index}>
               <Text s={13} t={`${t_type} :`}ml={4} c={"black"} b/>
               <Text s={13} t={eachTask.type} ml={4} c={"black"}/>
          </View>
        })}
      </View>
      }
      
    </View>
  );
}