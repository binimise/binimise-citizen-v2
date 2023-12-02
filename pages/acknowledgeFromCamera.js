import React, {useEffect, useState} from "react";
import {Dimensions, FlatList, Image, StyleSheet,BackHandler,ScrollView} from "react-native";
import {View, Text, Touch} from "../ui-kit";
import {setData} from "./../redux/action";
import {useDispatch, useSelector} from 'react-redux';
import {
    getUserOrCommercialByQrCode,
    acknowledgeUserOrCommercialOrCheckpoint,acknowledgeWasteSegregationUserOrCommercialOrCheckpoint
} from "./../repo/repo";
import {Color, AUTHUID, PAGES} from "../global/util";
import IconAnt from 'react-native-vector-icons/AntDesign';
import AddPayment from './addpayment'
import { useNavigationState,useIsFocused} from '@react-navigation/native';
import PaymentModal from "./paymentModal";

let {width, height} = Dimensions.get("window");

export default ({ route,navigation }) => {
    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    const [wardUsers, setWardusers] = useState({});
    let {userInfo} = useSelector(state => state.testReducer) || {};
    const [isSegregated, setIsSegregated] = useState(false);
    const state = useNavigationState(state => state);
    const routeName = (state.routeNames[state.index]);
    const isFocused = useIsFocused();

    useEffect(() => {
        if(routeName === PAGES.ACKNOWLEDGEFROMCAMERA){
          const backAction = () => {
            if (route?.params?.isfromAck) {
                navigation.navigate(PAGES.ACKNOWLEDGEMENT);
            }else{
                navigation.navigate(PAGES.HOME);
            }
            return true;
          };
          const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
          );
    
          return () => backHandler.remove();
        }
    });
    useEffect(() => {
        if(isFocused){
            if (route?.params?.scannedData) {
                searchUserByQr(route?.params?.scannedData);
            } 
            setWardusers(route?.params?.resident_data)
        }
    }, [isFocused]);

    const __commonArrayData = async (incomingData) => {
        if (incomingData && userInfo?.ward?.length > 0 &&
            userInfo.ward.includes(incomingData?.ward_id)) {
            setWardusers(incomingData);
            toggleLoading(false);
        } else {
            toggleLoading(false);
            return showEModal("not_belongs_to_ward")
        }
    }

    const showErrorModalMsg = (message, title = "message", onClose) => {
        setDataAction({
            errorModalInfo: {
                showModal: true, title, message, onClose
            }
        })
    };

    const searchUserByQr = async (scannedValueFromCam) => {
        toggleLoading(true);
        let _wardUsers = await getUserOrCommercialByQrCode(scannedValueFromCam);
        if (!_wardUsers) {
            setWardusers({});
            toggleLoading(false);
            return showEModal("unable_to_find_users");
        } else {
            __commonArrayData(_wardUsers);

        }
    }

    const closeAcknowledgeFun = () => {
       setDataAction({errorModalInfo: {showModal: false}});
        if (route?.params?.isfromAck) {
            navigation.navigate(PAGES.ACKNOWLEDGEMENT);
        }else{
            navigation.navigate(PAGES.HOME);
        }
    }

    const showEModal = message => {
        setDataAction({errorModalInfo: {showModal: true, message, onClose: closeAcknowledgeFun}});
    }
    showModal = message => {
        setDataAction({errorModalInfo: {showModal: true, message}});
    }

   
    showCloseCamera = () => {
        setDataAction({
            cameraInfo: {
                show: false,
                onLoadOp: "",
                imageRef: "saathi_task/" + userInfo[AUTHUID] + "/" + new Date().toLocaleDateString().split("/").join("-") + "/" + new Date().getTime() + '.jpg'
            }
        });
    }

    const toggleLoading = show => {
        dispatch(setData({"loading": {show}}));
    }

    const _acknowledgeWasteSegregation = async (flag) => {
        try {
            toggleLoading(true);
            wardUsers.segregate = true;
            await acknowledgeWasteSegregationUserOrCommercialOrCheckpoint(wardUsers, flag, userInfo);
            setWardusers({});
            setIsSegregated(() => false);
            showErrorModalMsg("ack_data_stored");
            setTimeout(() => {
                            setDataAction({ 
                                errorModalInfo : {showModal : false}
                            })
                            if (route?.params?.isfromAck) {
                                navigation.navigate(PAGES.ACKNOWLEDGEMENT);
                            }else{
                                navigation.navigate(PAGES.HOME);
                            }
                        }, 1000);
        } catch (err) {
            alert(err);
        }
        toggleLoading(false);
    }

    const setSegregatedTrue = () => {
        setIsSegregated(() => true);
    }
    
    const gobackfromAckFromCamera = ()=>{
        if(route?.params?.isfromAck){
            navigation.navigate(PAGES.ACKNOWLEDGEMENT)
        }else{
            navigation.navigate(PAGES.HOME)
        }
    }

    return userInfo.status && wardUsers?.name ?
        <View w={"100%"} h={"100%"} c={"black"}>
            <Touch a to={10}  h={60} bc={Color.white} br={32} w={60}  jc ai ml={"5%"}
                style={{alignSelf:"flex-end"}} onPress={gobackfromAckFromCamera}
            >
                <IconAnt size={36} 
                    name={"close"} 
                    color={Color.themeColor}
                />
            </Touch>
            <View row mh={"5%"} mt={50} mb={4} h={40} ai>
                <Image source={require("./../assets/blackavatar2.png")}
                       style={{height: 40, width: 40, borderRadius: 16, borderWidth: 1}}
                />
                <Text t={wardUsers?.name} ml={12} s={28} c={"white"} center/>
            </View>
            <Text t={"isWasteCollected"} b mh={"5%"} s={18} mt={4} c={"white"}/>
            <View mh={"5%"} w={"90%"} bw={1} bc={"#3E3E3E"}/>
            <View row mh={"5%"} mt={8} w={"90%"}>
                <Touch w={"48%"} style={{minHeight:120,height:"auto"}} onPress={setSegregatedTrue}>
                    <Image source={require("./../assets/acknow-yes.png")}
                           style={{
                               height: 100, width: "100%", borderRadius: 12, borderWidth: 2,
                               borderColor: "green", backgroundColor: "#F8F8F8"
                           }}
                           resizeMode="contain"
                    />
                    <Text t={"yes_c"} center b s={20} c={"white"}/>
                </Touch>
                <Touch ml={"4%"} w={"48%"} style={{minHeight:120,height:"auto"}} onPress={async () => {
                    try {
                        toggleLoading(true);
                        await acknowledgeUserOrCommercialOrCheckpoint(wardUsers, false, userInfo);
                        setWardusers({});
                        setIsSegregated(() => false);
                        showErrorModalMsg("ack_data_stored");
                        setTimeout(() => {
                            setDataAction({ 
                                errorModalInfo : {showModal : false}
                            })
                            if (route?.params?.isfromAck) {
                                navigation.navigate(PAGES.ACKNOWLEDGEMENT);
                            }else{
                                navigation.navigate(PAGES.HOME);
                            }
                        }, 1000);
                    } catch (err) {
                        alert(err);
                    }
                    toggleLoading(false);
                }}>
                    <Image source={require("./../assets/acknow-no.png")}
                           style={{
                               height: 100, width: "100%", borderRadius: 12, borderWidth: 2,
                               borderColor: "red", backgroundColor: "#F8F8F8"
                           }}
                           resizeMode="contain"
                    />
                    <Text t={"no_c"} center b s={20} c={"white"}/>
                </Touch>
            </View>

            {isSegregated ? <View>
                <Text t={"isWasteSeggregated"} b mh={"5%"} s={18} mt={4} c={"white"}/>
                <View mh={"5%"} w={"90%"} bw={1} bc={"#3E3E3E"}/>

                <View row mh={"5%"} mt={8} w={"90%"}>
                    <Touch w={"48%"} style={{minHeight:120,height:"auto"}} onPress={() => {
                        _acknowledgeWasteSegregation(true);
                    }}>
                        <Image source={require("./../assets/segre-yes.png")}
                               style={{
                                   height: 100, width: "100%", borderRadius: 12, borderWidth: 2,
                                   borderColor: "green", backgroundColor: "#F8F8F8"
                               }}
                               resizeMode="contain"
                        />
                        <Text t={"yes_c"} center b s={20} c={"white"}/>
                    </Touch>
                    <Touch ml={"4%"} w={"48%"} style={{minHeight:120,height:"auto"}} onPress={() => {
                        _acknowledgeWasteSegregation(false);
                    }}>
                        <Image source={require("./../assets/segre-no.png")}
                               style={{
                                   height: 100, width: "100%", borderRadius: 12, borderWidth: 2,
                                   borderColor: "red", backgroundColor: "#F8F8F8"
                               }}
                               resizeMode="contain"
                        />
                        <Text t={"no_c"} center b s={20} c={"white"}/>
                    </Touch>
                </View>
            </View> : null}
            {/* <PaymentModal userData={wardUsers} navigation={navigation}/> */}
        </View>: null


};

