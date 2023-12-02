import React, { useEffect,useState } from "react";
import { Dimensions,FlatList,Linking } from "react-native";
import {View, Text, Touch, TextInput} from "../ui-kit";
import Header from "../components/header";
import * as Location from 'expo-location';
import {setData} from "./../redux/action";
import {useDispatch, useSelector} from 'react-redux';
import { getUsersInWards,getCitizenData,getUserOrCommercialByPhoneNumber, getUserOrCommercialByQrCode } from "./../repo/repo";
import {Color,PAGES } from "../global/util";
import Icon from 'react-native-vector-icons/FontAwesome';
import IconAnt from 'react-native-vector-icons/AntDesign';
import BarScanner from "./../components/barcodeScanner";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";

let {width, height} = Dimensions.get("window");

export default ({navigation}) => {

    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    const [phoneNumber, setPhoneNumber] = useState("");
    const [wardUsers,setWardusers] = useState([]);
    const [showScanner, setShowScanner] = useState(false);
    const [searchByQr, setSearchByQr] = useState(false);
    let {userInfo} = useSelector(state => state.testReducer) || {};
    let isFocused = useIsFocused();

    useEffect(() => {
        if(isFocused){
            usersInWards();
            setPhoneNumber("");
            setSearchByQr(false);
        }
        
    }, [userInfo.status,isFocused]);

    const usersInWards = async () => {
        getWardUser(userInfo);
    }

    const getWardUser = async userInfo => {
        if(!userInfo.status) {
          return showErrorModalInAck("saathi_duty_is_off");
        }
        if(!userInfo?.ward?.length > 0){
            return showErrorModalInAck("no_wards_assigned");
        }
        
        setDataAction({ 
            errorModalInfo: {
              showModal: false
            }
        });
        
        try {
            const foregroundPermission = await Location.requestForegroundPermissionsAsync();
            if(foregroundPermission.status === "granted"){
                toggleLoading(true,"getting_users");
                let location = await Location.getLastKnownPositionAsync({enableHighAccuracy: true}); 
                
                if(location == null){
                    toggleLoading(false);
                    LocalNullModal("please_switch_location","switch_on_location");
                    return ;
                }
                let nearbyUsers = await getUsersInWards(userInfo, location?.coords?.latitude, location?.coords?.longitude);
                let usersOfSaathi = await usersBelongsToSaathi(nearbyUsers); 
                if(usersOfSaathi&&usersOfSaathi.length<=0){
                    showErrorModalInAck("unable_to_find_users") ; //No hh and cm near by
                }
                setWardusers(usersOfSaathi);
                toggleLoading(false);
            }else{
                toggleLoading(false);
                showErrorModalMsg("location_permission") ; 
            }
          
        } catch(err){
          showErrorModalInAck("failed_to_get_location");
          toggleLoading(false);
        }
    }

    

    const LocalNullModal = (message, title = "message") =>{
        setDataAction({ 
            errorModalInfo: {
              showModal: true,
              title,
              message ,
              onClose: () => setTimeout(() => usersInWards(), 2000) // Ask for permissions again
            }
          });
    }

    const showErrorModalMsg = (message, title = "message") => {
        setDataAction({ 
          errorModalInfo: {
            showModal: true,
            title,
            message,
            onClose: () =>onCloseEvent() // Ask for permissions again
          }
        });
    };

    const onCloseEvent = async() =>{
        Linking.openSettings();
        await usersInWards();
    }

    const usersBelongsToSaathi = async (users_list) => {
        let arr = [];
        users_list&&users_list.length>0&&users_list.map((eachDoc)=>{
            if (userInfo?.ward?.length > 0 &&
                userInfo.ward.includes(eachDoc?.ward_id)) {
                arr.push(eachDoc)
            }
        })
        return arr;
    }

    useFocusEffect(
        React.useCallback(()=>{
          setPhoneNumber("");
        },[])
    )


    const showErrorModalInAck = (message, title = "message") => {
        setDataAction({
            errorModalInfo: {
                showModal: true, title, message
            }
        })
    };


    onChangePhoneNumber = (field, value) => {
        setPhoneNumber(value);
    }


    const searchByPhoneNumber = () => {
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
                           onPress={searchUserByNumber} boc={Color.themeColor}>
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

    const toggleLoading = (show,loadingTitle = "loading") => {
        dispatch(setData({"loading": {show,message:loadingTitle}}));
    }

    const searchUserByNumber = async () => {
        try{
            if (phoneNumber?.length != 10) {
                return showErrorModalInAck("please_enter_10_digit_phonenumber");
            }
            toggleLoading(true,"getting_users");
            let _wardUsers = await getUserOrCommercialByPhoneNumber(phoneNumber);
            if (!_wardUsers) {
                setWardusers([]);
                toggleLoading(false);
                showErrorModalInAck("unable_to_find_users");
                setPhoneNumber("");
                getWardUser(userInfo);
            } else {
                let usersOfSaathi = await usersBelongsToSaathi([_wardUsers]);
                if(usersOfSaathi.length<=0){
                   showErrorModalInAck("not_belongs_to_ward");
                   getWardUser(userInfo);
                }
                setWardusers(usersOfSaathi);
                toggleLoading(false);
            }

        }catch(e){
            console.log("e",e)
        }
        
    }

    const searchByQrView = () => {
        return (
            <View mt={16} mb={16} w={"90%"} mh={"5%"} bc={"#F0F0F0"} br={4} bw={1}>
                <Text t={"search_user_qr"}/>
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

 

    const renderItem = ({ item, index } ) =>{
        return (
            <View key={index} pt={4} pb={4} ph={4} row w={"90%"} mh={"5%"}
                style={{ borderBottomWidth : 1, borderColor: Color.lightGrayColor}}
            >
                <View w={"63%"} row ai>
                    {item.isFromCheckpoint?
                        <Icon size = {14} name = {"map-marker"} color={Color.green}/>:
                    item.isFromCommercial?
                        <Icon size = {14} name = {"shopping-bag"} color={Color.green}/>:
                        <Icon size = {14} name = {"users"} color={Color.green}/>
                    }
                    <Text s={14} b t={item?.name} le={10} />
                </View>
                <View w={"35%"} jc ai>
                    <Touch h={30} bc={Color.green}  w={"100%"} br={16} ai jc
                        onPress={() => {
                            navigation.navigate(PAGES.ACKNOWLEDGEFROMCAMERA,{
                                resident_data:item,isfromAck : true
                            })
                        }} 
                    >
                        <Text t ={"Acknowledge"} s={14} center c={Color.white}/>
                    </Touch>
                </View>
            </View>
        )
    }
    const closeModal = () => {
        setShowScanner(false);
    }

    const getScannedValue = async(scannedValue) => {
        try{
            if (!scannedValue) {
                return showErrorModalInAck("incorrect bar code");
            }
            toggleLoading(true,"getting_users");
            let _wardUsers = await getUserOrCommercialByQrCode(scannedValue);
            if (!_wardUsers) {
                setWardusers([]);
                toggleLoading(false);
                showErrorModalInAck("unable_to_find_users");
                setPhoneNumber("");
                getWardUser(userInfo);
            } else {
                let usersOfSaathi = await usersBelongsToSaathi([_wardUsers]);
                if(usersOfSaathi.length<=0){
                   showErrorModalInAck("not_belongs_to_ward");
                   getWardUser(userInfo);
                }
                setWardusers(usersOfSaathi);
                toggleLoading(false);
            }
        }catch(e){
            console.log("e",e)
        }
    }

    return showScanner ? <BarScanner getScannedValue={getScannedValue} closeModal={closeModal}/> :
    <View c={"white"} w={width} h={"100%"}>
        <View row ai c={Color.white} w={"100%"} h={60}>
            <Header headerText={"acknowledgement"} navigation={navigation}/>
        </View>
        {userInfo.status ?
            <View>
                {
                    searchByQr ? searchByPhoneNumber() : searchByQrView()
                }

            </View> :
            <View a c={Color.backgroundModalColor} jc ai zi={999} to={60} le={0} h={height} w={width}>
                <View w={width - 48} br={8} c={Color.white} jc pa={2} h={80}>
                    <Text t={"switch_on_duty"} center b pa={10} s={24}/>
                </View>
            </View>
        }
        {userInfo.status ? 
            <View jc bw={1} br={8} mt={16} ml={16} w={"90%"} bc={Color.lightGrayColor} pt={2} pb={2} mb={20}>
                <FlatList
                    data = {wardUsers}
                    renderItem = {renderItem}
                    keyExtractor = {item => item.phoneNumber} //change id here
                    style = {{maxHeight:"95%",height:"auto"}}
                />     
            </View>: null
        }

    </View>

    


};