import React, { useEffect, useState,useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView,{Marker} from 'react-native-maps';
import {Image,Linking} from "react-native";
import { View } from "./../ui-kit";
import { getRouteOfStaff } from "./../repo/repo";
import { PAGES, Color,getCurrentDate,AUTHUID,STAFF_OBJ_STORAGE } from "./../global/util";
import Polygon from '../Markers/polygon';
import TrackViewMarker from "../Markers/TVMarker";
import SaathiRoute from './saathiRoute';

 const SaathiMarker = (props) => {

    const [saathiLocations, setSaathiLocations] = useState([]);
    let selectedArea = props?.selectedArea || null;
    
    
    useEffect(() => {
        syncMap(props.saathiList);
    }, [props.saathiList]);

    const syncMap = async saathiList => {
      let staffArrFromAsync ;
      const staffObj = await AsyncStorage.getItem(STAFF_OBJ_STORAGE);
      const jsonValue = await AsyncStorage.getItem("saathiMarkerData");
      const storedTime = await AsyncStorage.getItem("saathiTimestamp");
      if (staffObj !== null) {
        const parsed_array = JSON.parse(staffObj);
        staffArrFromAsync = parsed_array;
      }
      if (jsonValue !== null) {
        const parsedArray = JSON.parse(jsonValue);
        getWardWiseSaathiLocations(parsedArray);
        // setSaathiLocations(parsedArray);
      }
      let wardTime = 0;
      if (storedTime !== null) {
        wardTime = parseInt(storedTime, 10);
      } 
      const currentTimestamp = Date.now();
      const timeDifferenceInSeconds = (currentTimestamp - wardTime) / 1000;
      if(timeDifferenceInSeconds>600){
        if(!saathiList) return;
        let saathiArray = [];
        await Promise.all([...saathiList].map((eachDoc)=>getRouteOfStaff(getCurrentDate(),eachDoc)))
        .then(async(querySnapshot) => {
          querySnapshot.forEach((doc) => {
            if(staffArrFromAsync!=null&&
                staffArrFromAsync[doc.authUid]?.phoneNumber == doc.phoneNumber){
              doc.ward_id = staffArrFromAsync[doc.authUid].ward || [];
            }
            saathiArray.push(doc)
          });
          getWardWiseSaathiLocations(saathiArray);
          const jsonValue = JSON.stringify(saathiArray);
          if(jsonValue!=null){
            await AsyncStorage.setItem("saathiMarkerData", jsonValue);
          }
          const timestamp = Date.now();
         await AsyncStorage.setItem("saathiTimestamp",timestamp.toString());  
        }).catch((error) => {
          // toggleLoading(false);
          console.log('Error querying documents:', error);
        });
             
        
      }
      }

      const getWardWiseSaathiLocations = (arr)=>{
        let temp = [];
        if(selectedArea){
          temp = arr.length>0&&arr.filter((each)=>each?.ward_id?.includes(selectedArea))
        }else{
          temp = [...arr];
        }
        setSaathiLocations(temp);
      }

      if (saathiLocations.length > 0) {
        return saathiLocations.map((saathi, index) => {
          if (saathi.routes.length > 0) {
            return <SaathiRoute key={index} staffObj={saathi} />;
          }
          return null;
        });
      }
}

export default SaathiMarker;