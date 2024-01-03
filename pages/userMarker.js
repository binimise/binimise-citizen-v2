import React, { useEffect, useState } from 'react';
import MapView,{Marker} from 'react-native-maps';
import {Image} from "react-native";
import { View,Text } from "./../ui-kit";
import { APP_CONFIG } from '../global/util';
import { getDevicesInWard, driverLocationsInWard } from "./../repo/repo";

export default props => {

    const [driverLocations, setDriverLocations] = useState([]);
    const [driverDetails, setDriverDetails] = useState([]);
    const [deviceList, setDeviceList] = useState([]);

    useEffect(() => {
        syncMap(props.userInfo.ward);
    }, [props.userInfo.ward]);

    const syncMap = async wardId => {
        if(!wardId) return;
        let devices = await getDevicesInWard(wardId);
        setDeviceList(devices);
        let ids = devices.map(item => item.id);
        if(ids && Array.isArray(ids) && ids.length > 0) {
            getDriverLocations(ids);
        } else {
            setDriverLocations([]);
        }
      }
    
    const getDriverLocations = async (ids) => {
        driverLocationsInWard(ids).
        onSnapshot(data => {
            data = data.docs || [];
            data = data.map(item => item.data());
            setDriverLocations(data);
        });
    }


    
    if(driverLocations == null || driverLocations.length === 0)
        return null;

    const getTitleOfVehicle = (item) =>{
        let title = deviceList.find((eachDoc) =>eachDoc.id === item.imei);
        return title?.vehicle_name || "N/A";
    }

    const getPhnNumOfVehicle = (item) =>{
        let title = deviceList.find((eachDoc) =>eachDoc.id === item.imei);
        return title?.phone_num|| "N/A";
    }
    
    return ( <View> 
        {
            driverLocations
            .map((item, index) => (
                <View key={index}>
                    <Marker
                        coordinate={{
                            latitude: item?.geo?.latitude || APP_CONFIG.COORDINATES.coords.latitude, 
                            longitude: item?.geo?.longitude || APP_CONFIG.COORDINATES.coords.latitude
                        }}
                        tracksViewChanges = {false}
                        title = {getTitleOfVehicle(item)}
                        description = {getPhnNumOfVehicle(item)}
                    >

                        <Image source={require('./../assets-images/car.webp')} style={{ width: 30, height: 30 }} />
                    </Marker>
                </View>)
            )
        }
    </View>
    );
}