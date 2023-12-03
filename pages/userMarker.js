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
            mergeData(data)
            // setDriverLocations(data);
        });
    }

    const mergeData = (data)=>{
        let mergedArr = [],locations=[]
        deviceList.length>0&&deviceList.map((eachDevice)=>{
            data.map((eachData)=>{
                if(eachDevice.id === eachData.imei){
                    let obj={}
                    obj.vehicle_name = eachDevice.vehicle_name
                    obj.phone_num = eachDevice.phone_num
                    obj.geo =eachData.geo
                    mergedArr.push(obj);
                    locations.push(eachData.geo);
                }
            })
        })
        setDriverLocations(locations);
        setDriverDetails(mergedArr);
    }
    
    if(driverLocations == null || driverLocations.length === 0)
        return null;

    return ( <View> 
        {
            driverLocations
            .map((item, index) => (
                <View key={index}>
                    <Marker
                        coordinate={{
                            latitude: item?._latitude || APP_CONFIG.COORDINATES.coords.latitude, 
                            longitude: item?._longitude || APP_CONFIG.COORDINATES.coords.latitude
                        }}
                        title={driverDetails[index]?.vehicle_name}
                        description={driverDetails[index]?.phone_num}
                    >

                        <Image source={require('./../assets-images/car.webp')} style={{ width: 30, height: 30 }} />
                    </Marker>
                </View>)
            )
        }
    </View>
    );
}