import React,{useEffect,useState} from "react";
import {Image } from "react-native";
import { View } from "../ui-kit";
import { Color } from "./../global/util";
import MapView,{Marker, Polyline} from 'react-native-maps';
import { useSelector } from 'react-redux';
import Polygon from "../Markers/polygon";
import TrackViewMarker from "../Markers/TVMarker";
import axios from "axios";

const strokeColor_Arr = [
  '#7F0000',
  '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
  '#B24112',
  '#E5845C',
  '#238C23',
  '#7F0000'
];

export default (props) => {
  let routes = props?.staffObj?.routes || [];
  let { userInfo } = useSelector(state => state.testReducer) || {};
  const [saathi_routes,setSaathiRoute] = useState([]);
  const [intialLatAndLng,setIntialLatAndLng] = useState({});
  const [finalLatAndLng,setFinalLatAndLng] = useState({});

  const coordinateCache = {}; // Memoization cache

  const snapToRoadBatch = async (coordinateChunks) => {
    const apiKey = 'AIzaSyAllyr9cA3d5Ne740l-fxaTQQN4TKwjEj0'; // Replace with your API key
    const interpolate = true;
    const requests = coordinateChunks.map((chunk) => {
      const path = chunk.map(point => `${point.latitude},${point.longitude}`).join('|');
      const url = `https://roads.googleapis.com/v1/snapToRoads?interpolate=${interpolate}&path=${path}&key=${apiKey}`;
      return axios.get(url);
    });

    try {
      const responses = await Promise.all(requests);
      return responses.map(response => response.data.snappedPoints).flat();
    } catch (error) {
      console.error('Error snapping to road:', error);
      return [];
    }
  };
 

  const splitSaathiRouteCoordinatesInWardHistory = async (saathiCoordinates) => {
    const chunkSize = 50;
    const snappedCoordinates = [];

    try {
      for (let i = 0; i < saathiCoordinates.length; i += chunkSize) {
        const tempArray = saathiCoordinates.slice(i, i + chunkSize);
        const cacheKey = tempArray.map(point => `${point.latitude},${point.longitude}`).join('|'); //doubt

        if (coordinateCache[cacheKey]) {
          snappedCoordinates.push(...coordinateCache[cacheKey]);
        } else {
          const snappedData = await snapToRoadBatch([tempArray]);
          if (snappedData.length > 0) {
            coordinateCache[cacheKey] = snappedData;
            snappedCoordinates.push(...snappedData);
          }
        }
      }
    } catch (error) {
      console.error('Error splitting Saathi route coordinates:', error);
    }
    return snappedCoordinates;
  };

 

  useEffect(() => {
    if(routes.length>0){
      renderSaathiMarkers(routes);
    }
  }, [routes]);

  const renderSaathiMarkers = async (routes) => {
    const response = await splitSaathiRouteCoordinatesInWardHistory(routes);
    if (response.length > 0) {
      setIntialLatAndLng({
        latitude: response[0].location.latitude,
        longitude: response[0].location.longitude,
      });
      setFinalLatAndLng({
        latitude: response[response.length - 1].location.latitude,
        longitude: response[response.length - 1].location.longitude,
      })
      let temp = response.map(point => ({
        latitude: point.location.latitude,
        longitude: point.location.longitude,
      }))
      setSaathiRoute(temp);
    }

  };
  return (
    <View>
      {intialLatAndLng?.latitude &&
        <TrackViewMarker
          id={userInfo.phoneNumber + "intial"}
          coord={intialLatAndLng}
          name={ props?.staffObj?.name ||userInfo.name}
          phoneNumber={props?.staffObj?.phoneNumber ||userInfo.phoneNumber}
          type="staff"
          count="intial"
        />
      }
      {
        finalLatAndLng.latitude &&
        <TrackViewMarker
          id={userInfo.phoneNumber + "final"}
          coord={finalLatAndLng}
          name={ props?.staffObj?.name ||userInfo.name}
          phoneNumber={props?.staffObj?.phoneNumber ||userInfo.phoneNumber}
          type="staff"
          count="final"
        />
      }
      {
        saathi_routes.length>0 && <Polyline
        coordinates = {saathi_routes}
        strokeColor = {"blue"}
        strokeColors = {[
          '#7F0000',
          '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
          '#B24112',
          '#E5845C',
          '#238C23',
          '#7F0000'
      ]}
        strokeWidth = {2}
    />
      }
    </View>

  )



}