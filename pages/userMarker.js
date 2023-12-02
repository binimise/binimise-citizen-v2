import React, { useEffect, useState,useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView,{Marker} from 'react-native-maps';
import {Image,Linking} from "react-native";
import { View } from "./../ui-kit";
import { useDispatch, useSelector } from 'react-redux';
import { getVehiclesInWard,getRouteOfVehicle } from "./../repo/repo";
import { PAGES, Color } from "./../global/util";
import Polygon from '../Markers/polygon';
import TrackViewMarker from '../Markers/TVMarker';

 const UserMarker = props => {

    const [driverLocations, setDriverLocations] = useState([]);
    let selectedArea = props?.selectedArea || null;
    
    
    useEffect(() => {
        syncMap(props.wards);
    }, [props.wards]);

    const syncMap = async wardId => {
      const jsonValue = await AsyncStorage.getItem("vehicleRouteData");
      const storedTime = await AsyncStorage.getItem("vehicleTimestamp");
      if (jsonValue !== null) {
        const parsedArray = JSON.parse(jsonValue);
        getWardWiseDriverLocations(parsedArray);
        // setDriverLocations(parsedArray);
      }
      let wardTime = 0;
      if (storedTime !== null) {
        wardTime = parseInt(storedTime, 10);
      } 
      const currentTimestamp = Date.now();
      const timeDifferenceInSeconds = (currentTimestamp - wardTime) / 1000;
      if(timeDifferenceInSeconds>600){
        if(!wardId) return;
        let vehicles = await getVehiclesInWard(wardId);
        let veh_data = [];
        vehicles?.docs?.map(item =>{
          let obj = {};
          obj["name"] =item?.data?.()?.vehicle_name || "",
          obj["phoneNumber"] = item?.data?.()?.phone_num || "",
          obj["device_id"] = item?.data?.()?.device_id
          obj["ward_id"] =  item?.data?.()?.ward_id
          veh_data.push(obj);
        });
        if(veh_data && Array.isArray(veh_data) &&veh_data.length > 0) {
            getDriverLocations(veh_data);
        } else {
            setDriverLocations([]);
        }
      }
        
    }


   const getDriverLocations = async (ids) => {
     try {
       let vehicleArray = [];
       await Promise.all([...ids].map((eachDoc) => getRouteOfVehicle(eachDoc)))
         .then(async(querySnapshot) => {
           querySnapshot.forEach((doc) => {
             vehicleArray.push(doc);
           });
           getWardWiseDriverLocations(vehicleArray);
           const jsonValue = JSON.stringify(vehicleArray);
           if(jsonValue!=null){
            await AsyncStorage.setItem("vehicleRouteData", jsonValue);
           }
            const timestamp = Date.now();
            await AsyncStorage.setItem("vehicleTimestamp",timestamp.toString());
         }).catch((error) => {
           // toggleLoading(false);
           console.log('Error querying documents:', error);
         });
          
      //  setDriverLocations(vehicleArray);
          

     } catch (e) {
       console.log("e", e)
     }


   }

   const getWardWiseDriverLocations = (arr)=>{
    
    let temp = [];
    if(selectedArea){
      temp = arr.length>0&&arr.filter((each)=>each?.ward_id?.includes(selectedArea))
    }else{
      temp = [...arr];
    }
    setDriverLocations(temp);
   }

  


    if (driverLocations == null || driverLocations.length === 0) {
      return null;
    }
   
    return driverLocations.map((item, index) => {
      let veh_routes = item.routes || [];
      let intialLatAndLng = veh_routes.length>0&&veh_routes[0]||{};
      let finalLatAndLng = veh_routes.length>0&&veh_routes[veh_routes.length-1]|| {};
       return <View key={index}>
          {intialLatAndLng?.latitude&&
          <TrackViewMarker
            id = {item.phoneNumber+"intial"}
            coord ={intialLatAndLng}
            name = {item.name}
            phoneNumber = {item.phoneNumber}
            type = "vehicle"
            count = "intial"
          />
          }
          {finalLatAndLng?.latitude&&
          <TrackViewMarker
            id = {item.phoneNumber+"final"}
            coord ={finalLatAndLng}
            name = {item.name}
            phoneNumber = {item.phoneNumber}
            type = "vehicle"
            count = "final"
          />
          }
          
          {
            veh_routes?.length>0&&<Polygon routes = {veh_routes}/>
          }                
        </View>
    })
}

export default UserMarker;