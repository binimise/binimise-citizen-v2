import React, { useState,useEffect } from "react";
import { Image,Dimensions,ScrollView } from "react-native";
import {View, Text,Touch,TextInput } from "../ui-kit";
import Header from "../components/header";
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import {AUTHUID,Color, PAGES } from '../global/util';
import { Camera,CameraType } from 'expo-camera';
import {useIsFocused, useNavigationState} from '@react-navigation/native';
import Styles from "../styles/styles";
import StaffComAndTasks from "./staffComAndTasks";
const { width, height } = Dimensions.get('window');

export default ({navigation,route}) => {

    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    const [selectedSaathi,setSelectedSaathi] = useState({});
    const [registerImage,setRegisterImage] = useState("");
    const isFocus = useIsFocused();

    useEffect(()=>{
        if(isFocus){
            setSelectedSaathi(route?.params?.selectedSaathiObj||{});
            setRegisterImage(route?.params?.selectedSaathiObj?.imageUrl||"")
        }

    },[isFocus])


    const showDetailsOfViewStaff = (text, ph,value) => {
        return (
            
            <View style={Styles.cardStyle}>
                <Text s={12} t={text} c={"black"} b/>
                <TextInput ml nl={1} ph={ph} pl={"4%"} h={40} bc={Color.white} 
                    tbc={Color.viewColor} mb={4}  bbw= {1} value={value} bw={1}
                    editable = {false}  style = {{fontWeight:"bold",color:"black"}}
                      
                    
                />
          </View>
        )
    }

    

    return  <View w={width} h={height} c={Color.viewColor}>
            <Header navigation={navigation} headerText={"staff_details"} />
            <View mh={"5%"} bw={1} w={"90%"} bc={Color.borderColor} />

            <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
                {
                    
                        <View>
                            <Text t={"staff_details"} mb={4} mt={8} b />
                            <View mt = {10}>
                                <Text s={12} c={"black"} t={"mapView"} b/>
                                <StaffComAndTasks staffData = {selectedSaathi}/>
                            </View>
                            {
                                showDetailsOfViewStaff('userId', 'Safai Mitra',selectedSaathi?.userId)
                            }
                            
                            {
                                showDetailsOfViewStaff('name', 'firstName_lastName', selectedSaathi?.name)
                            }
                            {
                                showDetailsOfViewStaff('father_name', 'Safai Mitra',selectedSaathi?.father_name)
                            }

                            {
                                showDetailsOfViewStaff('phoneNumber', '9954672326',selectedSaathi?.phoneNumber)
                            }
                            {
                                showDetailsOfViewStaff('area', '', selectedSaathi?.ward?.join())
                            }
                            {/* {
                                showDetailsOfViewStaff('email', '', selectedSaathi?.email)
                            }
                            {
                                showDetailsOfViewStaff('address', '',selectedSaathi?.address)
                            }
                            {
                                showDetailsOfViewStaff('landmark', '',selectedSaathi?.landmark)
                            } */}
                            {
                                showDetailsOfViewStaff('status', '', (selectedSaathi?.isApproved|| false).toString())
                            }
            
                            {
                                showDetailsOfViewStaff('supervisor_name', '', selectedSaathi?.supervisor_name|| "Admin")
                            }
                            <View mt={10}>
                                <Text s={12} c={"black"} t={"image"} b />
                                <View bw={1} bs={"dashed"} br={4} s={16} mb={30} h={200} w={'100%'}
                                    bc={Color.lightGrayColor} c={Color.backgroundColor}
                                >
                                    <Image
                                        source={registerImage ? { uri: registerImage } : require("./../assets-images/image2.jpg")}
                                        resizeMode="contain"
                                        style={{ width: "100%", height: "100%" }}
                                    />
                                </View>
                            </View>
                           
                            <View row mb={16} mt={5}>
                                <Touch ai jc h={40} br={4} onPress={() =>  navigation.navigate(PAGES.UPDATESAATHI)}
                                    s={16} c={Color.themeFontColor} bc={Color.themeColor} b t={"go_to_viewstaff"}
                                />
                            </View>
                           
                            <View h={20} />
                            

                        </View>
                }


            </ScrollView>
    </View>
      
}

