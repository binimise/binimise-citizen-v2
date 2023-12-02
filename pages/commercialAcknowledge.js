import React, { useState } from "react";
import { Dimensions,Keyboard,Image } from "react-native";
import {View, Text, Touch, TextInput} from "../ui-kit";
import Header from "../components/header";
import {setData} from "./../redux/action";
import {useDispatch, useSelector} from 'react-redux';
import { getCommercialByQrCode,getCommercialWardUserData,acknowledgeCommercial,
    acknowledgeWasteSegregationCommercial } from "./../repo/repo";
import {Color,PAGES} from "../global/util";
import BarScanner from "./../components/barcodeScanner";
import IconAnt from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect } from "@react-navigation/native";

let {width, height} = Dimensions.get("window");

export default ({navigation}) => {

    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    let {userInfo} = useSelector(state => state.testReducer) || {};
    const [showScanner, setShowScanner] = useState(false);
    const [searchByQr, setSearchByQr] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [ commercialObj,setCommercialObj ] = useState({});
    const [isSegregated, setIsSegregated] = useState(false);

    setSegregatedTrueInCA = () => {
        setIsSegregated(() => true);
    }
    
    showModal = message => {
        setDataAction({errorModalInfo: {showModal: true, message}});
    }

    isUserApproved = userInfo => {
        return userInfo.isApproved && userInfo.isApproved != "false"
    }

    validateUser = userInfo => {
        if (!isUserApproved(userInfo)) {
            showModal("agent_is_not_approved");
            return 0;
        }
        if (!userInfo.status) {
            showModal("duty_is_off");
            return 0;
        }
        return 1;
    }
    useFocusEffect(
        React.useCallback(()=>{
          setPhoneNumber("");
        },[])
    )
    
        console.log("c",commercialObj)
    const showEModalInCA = (message, title = "message") => {
        setDataAction({
            errorModalInfo: {
                showModal: true, title, message
            }
        })
    };


    onChangePhoneNumber = (field, value) => {
        setPhoneNumber(value);
    }


    const __searchByPhoneNumber = () => {
        return (
            <View mt={16} mb={16} w={"90%"} mh={"5%"} bc={"#F0F0F0"} br={4} bw={1}>
                <Text t={"search_user_by_phoneNumber"}/>
                <View row mb={4}>
                    <View br={4} bc={Color.lightGrayColor} c={"white"} w={width - 80} bw={1} pt={4} pb={4} mb={8}>
                        <Text s={12} ml={16} c={Color.lightGrayColor} t={'search'}/>
                        <TextInput ml nl={1} ph={'9989443788'} pl={16} h={24}
                                   k={"numeric"} maxLength={10} name={"phoneNumber"}
                                   onChangeText={onChangePhoneNumber} value={phoneNumber}
                        />
                    </View>
                    <Touch row jc ai w={40} bw={1} bc={'white'} h={48} ml={2} br={4}
                           onPress={searchCommercialByNumber} boc={Color.themeColor}>
                        <Icon size={22}
                              name={"search"}
                              color={Color.themeColor}
                        />
                    </Touch>
                </View>
                <Text u c={Color.themeColor} t={"donot_have_phoneNumber_press_here"}
                      onPress={() => {
                          setSearchByQr(false);
                      }} mt={4} mb={4}
                />
            </View>
        )
    }

    const __searchByQrViewInCA = () => {
        return (
            <View mt={16} mb={16} w={"90%"} mh={"5%"} bc={"#F0F0F0"} br={4} bw={1}>
                <Text t={"search_commercial_qr"}/>
                <View br={4} bc={Color.lightGrayColor} bw={1} pt={4} pb={4} mb={8}>
                    <Touch h={38} c={Color.black} w={'100%'} ai row jc b={false}
                           onPress={() => {
                               setShowScanner(true)
                           }}
                    >
                        <IconAnt size={18} name={"scan1"}
                                 color={Color.themeColor}
                        />
                        <Text b s={16} t={'scan_qr'} ml={8}/>
                    </Touch>
                </View>
                <Text u t={"search_user_by_phoneNumber"} c={Color.themeColor}
                      onPress={() => {
                          setSearchByQr(true);
                      }} mt={4} mb={4}
                />
            </View>
        )
    }

    const getScannedValue = scannedValue => {
        if (!scannedValue) {
            return showEModalInCA("incorrect bar code");
        }
        searchCommercialByQr(scannedValue);
    }

    const toggleLoadingInCA = show => {
        dispatch(setData({"loading": {show}}));
    }

    const filterCommercial = async (incomingData) => {
        if (incomingData &&userInfo?.ward?.includes(incomingData?.ward_id)) {
                setCommercialObj(incomingData);
                toggleLoadingInCA(false);
        } else {
            toggleLoadingInCA(false);
            return showEModalInCA("not_belongs_to_ward")
        }
    }

    const searchCommercialByQr = async (scannedValue) => {
        toggleLoadingInCA(true);
        let _commercial = await getCommercialByQrCode(scannedValue);
        if (!_commercial) {
            setCommercialObj({});
            setPhoneNumber("");
            toggleLoadingInCA(false);
            return showEModalInCA("unable_to_find_users");
        } else {
            filterCommercial(_commercial);
        }
    }
    const searchCommercialByNumber = async () => {
        console.log("p",phoneNumber)
        if (phoneNumber?.length != 10) {
            return showEModalInCA("please_enter_10_digit_phonenumber");
        }
        Keyboard.dismiss();
        toggleLoadingInCA(true);
        let _commercial = await getCommercialWardUserData(phoneNumber);
        if (!_commercial) {
            setCommercialObj({});
            setPhoneNumber("");
            toggleLoadingInCA(false);
            return showEModalInCA("unable_to_find_users");
        } else {
            filterCommercial(_commercial);
        }
    }

    closeModal = () => {
        setShowScanner(false);
    }

    const _acknowledgeWasteSegregationInCA = async (flag) => {
        try {
            toggleLoadingInCA(true);
            commercialObj.segregate = true;
            await acknowledgeWasteSegregationCommercial(commercialObj, flag, userInfo);
            setCommercialObj({});
            setPhoneNumber("");
            setIsSegregated(() => false);
            showEModalInCA("ack_data_stored");
            setTimeout(() => {
                            setDataAction({ 
                                errorModalInfo : {showModal : false}
                            })
                        }, 1000);
        } catch (err) {
            alert(err);
        }
        toggleLoadingInCA(false);
    }

    if( userInfo.status && commercialObj?.phoneNumber){
        return(
            <View w={"100%"} h={"100%"} c={"black"}>
                <Touch a to={10}  h={60} bc={Color.white} br={32} w={60}  jc ai ml={"5%"}
                    style={{alignSelf:"flex-end"}} onPress={()=>setCommercialObj({})}
                >
                    <IconAnt 
                        size = {36} 
                        name = {"close"} 
                        color = {Color.themeColor}
                    />
                </Touch>

                <View row mh={"5%"} mt={50} mb={4} h={40} ai>
                    <Image source={require("./../assets/blackavatar2.png")}
                       style={{height: 40, width: 40, borderRadius: 16, borderWidth: 1}}
                    />
                    <Text t={commercialObj?.name} ml={12} s={28} c={"white"} center/>
                </View>

                <Text t={"isWasteCollected"} b mh={"5%"} s={18} mt={4} c={"white"}/>
                <View mh={"5%"} w={"90%"} bw={1} bc={"#3E3E3E"}/>
                <View row mh={"5%"} mt={8} w={"90%"}>
                    <Touch w={"48%"} style={{minHeight:120,height:"auto"}} 
                        onPress={setSegregatedTrueInCA}
                    >
                        <Image 
                            source={require("./../assets/acknow-yes.png")}
                            style={{
                               height: 100, width: "100%", borderRadius: 12, borderWidth: 2,
                               borderColor: "green", backgroundColor: "#F8F8F8"
                           }}
                           resizeMode="contain"
                        />
                        <Text t={"yes_c"} center b s={20} c={"white"}/>
                    </Touch>
                    <Touch ml={"4%"} w={"48%"} style={{minHeight:120,height:"auto"}} 
                        onPress={async () => {
                        try {
                            toggleLoadingInCA(true);
                            await acknowledgeCommercial(commercialObj, false, userInfo);
                            setCommercialObj({});
                            setPhoneNumber("");
                            setIsSegregated(() => false);
                            showEModalInCA("ack_data_stored");
                            setTimeout(() => {
                                setDataAction({ 
                                    errorModalInfo : {showModal : false}
                                })
                            }, 1000);
                        } catch (err) {
                            alert(err);
                        }
                        toggleLoadingInCA(false);
                    }}
                    >
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
                    <Touch w={"48%"} style={{minHeight:120,height:"auto"}} 
                        onPress={() => { _acknowledgeWasteSegregationInCA(true);}}
                    >
                        <Image source={require("./../assets/segre-yes.png")}
                               style={{
                                   height: 100, width: "100%", borderRadius: 12, borderWidth: 2,
                                   borderColor: "green", backgroundColor: "#F8F8F8"
                               }}
                               resizeMode="contain"
                        />
                        <Text t={"yes_c"} center b s={20} c={"white"}/>
                    </Touch>
                    <Touch ml={"4%"} w={"48%"} style={{minHeight:120,height:"auto"}} 
                        onPress={() => { _acknowledgeWasteSegregationInCA(false); }}
                    >
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
        </View>

        )
    }

    return showScanner ? <BarScanner getScannedValue={getScannedValue} closeModal={closeModal}/> :
        <View c={"white"} w={width} h={"100%"}>
            <View row ai c={Color.white} w={"100%"} h={60}>
                <Header headerText={"acknowledgement"} navigation={navigation}/>
            </View>
            {
                userInfo.status ?
                    <View>
                        {
                            searchByQr ? __searchByPhoneNumber() : __searchByQrViewInCA()
                        }

                    </View> :
                    <View a c={Color.backgroundModalColor} jc ai zi={999} to={60} le={0} h={height} w={width}>
                        <View w={width - 48} br={8} c={Color.white} jc pa={2} h={80}>
                            <Text t={"switch_on_duty"} center b pa={10} s={24}/>
                        </View>
                    </View>
            }
           

        </View>


};
