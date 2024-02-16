import React, { useEffect, useState } from 'react';
import MapView,{Marker} from 'react-native-maps';
import {Image} from "react-native";
import { View,Text } from "./../ui-kit";
import { APP_CONFIG } from '../global/util';
import { getVehiclesInWard,getRouteOfVehicle } from "./../repo/repo";
import Polygon from '../Markers/polygon';
import VehicleMarker from '../Markers/vehicleMarker';

export default props => {

    const [driverLocations, setDriverLocations] = useState([]);
    const [driverDetails, setDriverDetails] = useState([]);
    const [deviceList, setDeviceList] = useState([]);

    useEffect(() => {
        syncMap(props.userInfo.ward);
    }, [props.userInfo.ward]);

    const syncMap = async wardId => {
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
    
    const getDriverLocations = async (ids) => {
        try {
          let vehicleArray = [];
          await Promise.all([...ids].map((eachDoc) => getRouteOfVehicle(eachDoc)))
            .then(async(querySnapshot) => {
              querySnapshot.forEach((doc) => {
                vehicleArray.push(doc);
              });
              setDriverLocations(vehicleArray);
            }).catch((error) => {
              // toggleLoading(false);
              setDriverLocations([]);
              console.log('Error querying documents:', error);
            });
             
         //  setDriverLocations(vehicleArray);
             
   
        } catch (e) {
          console.log("e", e)
        }
    }

    // const getWardWiseDriverLocations = (arr)=>{
    
    //     let temp = [];
    //     if(selectedArea){
    //       temp = arr.length>0&&arr.filter((each)=>each?.ward_id?.includes(selectedArea))
    //     }else{
    //       temp = [...arr];
    //     }
    //     setDriverLocations(temp);
    // }

    
    if(driverLocations == null || driverLocations.length === 0)
        return null;

    
    return driverLocations.map((item, index) => {
        let veh_routes = item.routes || [];
        let intialLatAndLng = veh_routes.length>0&&veh_routes[0]||{};
        let finalLatAndLng = veh_routes.length>0&&veh_routes[veh_routes.length-1]|| {};
         return <View key={index}>
            {intialLatAndLng?.latitude&&
            <VehicleMarker
              id = {item.phoneNumber+"intial"}
              coord ={intialLatAndLng}
              name = {item.name}
              phoneNumber = {item.phoneNumber}
              type = "vehicle"
              count = "intial"
            />
            }
            {finalLatAndLng?.latitude&&
            <VehicleMarker
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