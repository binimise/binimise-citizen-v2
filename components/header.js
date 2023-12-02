import React, { useState } from 'react';
import { Dimensions } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "../redux/action";
import { View, Text, Touch ,Loading} from "./../ui-kit";
import { Color,PAGES , AUTHUID} from '../global/util';
import Nav from "./nav";
import DutyStatus from "./../components/dutyStatus";
import Icon from 'react-native-vector-icons/FontAwesome';
import { updateSaathiImage } from "./../repo/repo";
import * as Location from 'expo-location';
import NetInfo from '@react-native-community/netinfo';
const { height, width } = Dimensions.get('window'); 

export default props => {
    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));

    let { userInfo } = useSelector(state => state.testReducer) || {};

    showCamera = async () => {
        let state = await NetInfo.fetch();
        if (!state.isConnected) {
            return setDataAction({ errorModalInfo: { showModal: true, message: "you_are_offline" }});
        }
        setDataAction({ cameraInfo: { 
            show : true , 
            onLoadOp : cameraOnloadOp,
            imageRef : "saathi_task/" + userInfo[AUTHUID] + "/" + new Date().toLocaleDateString().split("/").join("-") + "/" + new Date().getTime() + '.jpg'
        }});
    }

    cameraOnloadOp = async (url) => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        let location = await Location.getLastKnownPositionAsync({enableHighAccuracy: true});
        let obj = { url, lat: location?.coords?.latitude, long: location?.coords?.longitude, date: new Date().getTime() }
        updateSaathiImage(userInfo, obj);
        if(props.navigation){
            props.navigation.navigate(PAGES.DAILYIMAGES);
        }
    }

    return (
        <View w={width} c={"Color.white"} row ai h={60} pr={64} style={{ justifyContent: "space-between" }}>
            <View w={props?.hideHomeIcon? width*0.4:width*0.6} row ai>
                <Nav navigation={props.navigation}  bText={props.b_Text} type={props.type}/>
                <Text s={18} b t={props.headerText} />
            </View>
            <View row ai w={props?.hideHomeIcon? width*0.6:width*0.4}  pr={16} style={{ justifyContent: "flex-end" }}>
                {
                    props.calendarIcon? props.calendarIcon() : null
                }
                {
                    props?.hideHomeIcon ? props.showListButton() :
                     <Icon size={33} onPress={() => props.navigation.navigate(PAGES.HOME)}
                        name={"home"}
                        color={Color.themeColor} />
                }               
                <DutyStatus />
            </View>
        </View>
    )
}