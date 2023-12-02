import React, { useState, useEffect }  from 'react';
import { FlatList, Dimensions, Image as ImageRNView,Linking } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setData } from "../redux/action";
import { View, Text, Touch, Loading, Image, TextInput } from "../ui-kit";
import Header from "../components/header";
import Modal from "../components/modal";
import * as Location from 'expo-location';
import { Color, TOKEN, PAGES,APP_CONFIG } from '../global/util';
import { getComplaints, updateUserToken, updateSaathiNotMyWork,getAppSettings, updateSaathiWorkDoneImage } from "../repo/repo";
import { useFocusEffect } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/AntDesign';
import IconAwesome from 'react-native-vector-icons/FontAwesome';
let { height,width } = Dimensions.get("window");

const WORK_STATUS_DONE = "DONE";
const WORK_STATUS_NOT_MY_WORK = "NOT_MY_WORK";

export default ({ navigation }) => {

    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));

    const [complaints, setComplaints] = useState([]);
    const [showNotifModalC, setShowNotifModalC] = useState(false);
    const [complaint, setComplaint] = useState({});
    const [isFetching, setIsFetching] = useState(false);
    const [comment, setComment] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [welcomeText, setWelcomeText] = useState("");
    const [showCommentModalC, setShowCommentModalC] = useState(false);
    const [showDoneModalC, setshowDoneModalCC] = useState(false);
    const [showPriorModalC, setShowPriorModalC] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [imagePUrl, setImagePUrl] = useState("");
    const [commentP, setCommentP] = useState("");
    const [complaint_address,setComplaintAddress] = useState("");
    const [saathiLocation,setSaathiLocation] = useState({});
    const [complaintLocation,setComplaintLocation] = useState({});

    let { userInfo } = useSelector(state => state.testReducer) || {};
    let selectedLanguage = useSelector(state => state.testReducer.selectedLanguage) || "en";
    let tokenFromOneSignal = useSelector(state => state.testReducer.tokenFromOneSignal) || "";

    getDynamicDataFromSettings = async (Language)=>{
        let customizedValues = await getAppSettings();
        let local_des = customizedValues.length>0?customizedValues[0]?.notif_default_msg?.[Language]:""
         
        setWelcomeText(local_des);
    
      }

    const getAllComplaints = async () => {
        let state = await NetInfo.fetch();
        if (!state.isConnected) {
            let message =  "you_are_offline"
            return setDataAction({ 
                    errorModalInfo : { 
                        showModal : true, message, onClose : getAllComplaints
                    }
                });
        }
        let complaints = await getComplaints(userInfo);
        if(!complaints.length){
            complaints = [];
        }
        setComplaints(complaints);
        setIsFetching(false);
        setIsLoading(false);
        setDataAction({ errorModalInfo : { showModal : false }});
        checkLocationSync();
    }


    getLocationPermission = async () => {
        try {
           await Location.requestForegroundPermissionsAsync();
           await Location.enableNetworkProviderAsync();
        }catch(e){
          console.log(e);
        }
      }

    checkLocationSync = async () => {
        let isBackgroundSyncAvailable = await Location.isBackgroundLocationAvailableAsync();
        if(!isBackgroundSyncAvailable) {
            setDataAction({ 
                confirmModalInfo : {
                    title: "message",
                    message: "location_request",
                    showModal : true,
                    primaryText : "allow",
                    primaryAction : async () => {
                      setDataAction({confirmModalInfo : { showModal : false }});
                      await getLocationPermission();
                    },
                }
            });
        }
    }


    useEffect(() => {
        if(complaints.length == 0){
            setIsLoading(true);
        }
        getAllComplaints();
        updateToken();
    }, [isFetching]);
    
    useEffect(() => {
        getDynamicDataFromSettings(selectedLanguage);
    }, [selectedLanguage]);

    getSaathiCurrentLocationInComplaints = async()=>{
        let saathi_loc = {};
        try{
            saathi_loc = await Location.getCurrentPositionAsync({enableHighAccuracy: true});
        }catch(e){}
        let saathi_lat = saathi_loc? saathi_loc?.coords?.latitude:userInfo.lat
        let saathi_long = saathi_loc? saathi_loc?.coords?.longitude:userInfo.long
        setSaathiLocation({saathi_lat,saathi_long});
    }
    updateToken = async () => {
        if(userInfo.token) return;
        updateUserToken(userInfo, tokenFromOneSignal);
    }

    onRefresh = () => {
        setIsFetching(true);
        getAllComplaints();
    }

    useFocusEffect(
        React.useCallback(() => {
            getAllComplaints();
        }, [])
    );
    // useFocusEffect(
    //     React.useCallback(() => {
    //         setShowNotifModalC(false);
    //     }, [])
    // );

    viewComplaintInMap = () => {
        setShowNotifModalC(false);
        setDataAction({ selectedComplaint: complaint });
        navigation.navigate(PAGES.MAPVIEW, {
            location: complaint
        });
    }

    _updateComplaintStatus = (state) => {
        if(!userInfo.status){
            return setDataAction({ errorModalInfo : { showModal : true, message : "duty_is_off" }});
        }
        if(state == WORK_STATUS_DONE){
            updateWorkDone();
        } else if(state == WORK_STATUS_NOT_MY_WORK){
            updateNotMyWork();
        }
        setComment("");
        // NetInfo.fetch().done(async (s) => {
            // if(s.isConnected) {
                
            // } else {
                // return setDataAction({ 
                //     errorModalInfo : { 
                //         showModal : true,
                //         message : "you_are_offline",
                //     }
                // });
            // }
        // });
    }
    
    const getAddressOfCurrentLocation= async(item)=>{
        let lat = item?.location?.latitude ||APP_CONFIG.COORDINATES.coords.latitude 
        let long = item?.location?.longitude ||APP_CONFIG.COORDINATES.coords.longitude 
        let complaint_address ="";
        await Location.reverseGeocodeAsync({latitude: lat,longitude: long}).
          then(result => {
            let address = result[0]
            let city= address?.city || ""
            let district = address?.region || ""
            let country= address?.country || ""
            let name=address?.name || ""
            let postalCode=address?.postalCode || ""
            complaint_address =  name+", "+city+", "+district+","+postalCode+", "+country
          });
          setComplaintAddress(complaint_address);
    };
 
    complaintModal = () => {
        return (
            <View a c={Color.backgroundModalColor} ai zi={999} to={0} le={0} h={height} w={width}>
            <View w={width - 48} br={8} c={Color.white} jc pa={16} mt={10}>
                <View row pa={8} style={{justifyContent:"space-between"}}>
                    <Text t={"state"} />
                    <Text b t={complaint.state} />
                </View>
                <View row pa={8} style={{justifyContent:"space-between"}}>
                    <Text t={"complaint_type"} />
                    <Text b t={complaint.taskType || complaint?.selectedWasteType?.name || complaint.typesOfGarbageDump || ""} />
                </View>
                <View row pa={8} style={{justifyContent:"space-between"}}>
                    <Text t={"raised_by"} />
                    <Text b t={complaint.name || ""} />
                </View>
                <View row pa={8} style={{justifyContent:"space-between"}}>
                    <Text t={"phoneNumber"} />
                    <Text b t={complaint.phoneNumber || ""} />
                </View>
                <View pa={8} style={{justifyContent:"space-between"}}>
                    <Text t={"message"} />
                    <View ph={4} pv={8} mt={4} br={4} bw={1} bc={Color.lightGrayColor}>
                        <Text t={complaint.comment || "N/A"} />
                    </View>
                </View>
                <View  pa={8} style={{justifyContent:"space-between"}}>
                    <Text t={"address"} />
                    <View ph={4} pv={8} mt={4} br={4} bw={1} bc={Color.lightGrayColor}>
                    <Text b t={complaint_address || "N/A"} />
                    </View>
                </View>
                {
                    complaint?.photo_url ? <View mt={10}>
                        <Image uri={complaint?.photo_url} resizeMode="cover" h={120} /> 
                    </View> : null
                }
                <View row c={Color.white}>
                    <Touch jc mt={10} h={36} w={'100%'} br={4} bc={Color.themeColor}
                        s={14} c={Color.themeFontColor} b center t={ "prior_to_work" }
                        onPress={e => {
                            setShowNotifModalC(false);
                            setShowPriorModalC(true);
                        }} />
                </View>
                <View row c={Color.white}>
                    <Touch jc mt={10} h={36} w={'48%'} br={4} mr={8} bc={Color.themeColor}
                        s={14} c={Color.themeFontColor} b center t={ "show_navigation" }
                        onPress={()=> Linking.openURL(`https://www.google.com/maps/dir/?api=1&origin=` +
                                saathiLocation?.saathi_lat+`,` +saathiLocation?.saathi_long +`&destination=` +
                                complaintLocation?.complaint_lat +`,` +complaintLocation?.complaint_long+
                                `&travelmode=driving`)} 
                        />
                    <Touch jc mt={10} h={36} w={'48%'} br={4} mr={8} bc={Color.themeColor}
                        s={14} c={Color.themeFontColor} b center t={ "done" }
                        onPress={e => {
                            setShowNotifModalC(false);
                            setshowDoneModalCC(true);
                        }} />
                </View>
                <View row c={Color.white} mt={8} mb={8}>
                    <Touch jc mt={10} mb={5} h={36} w={'48%'} br={4} bw={1} mr={8}
                        s={14} c={Color.black} b center t={ "not_my_work" }
                        onPress={() => {
                            setShowNotifModalC(false);
                            setShowCommentModalC(true);
                        }} />
                    <Touch jc mt={10} mb={5} h={36} w={'48%'} br={4} bw={1}
                        s={14} c={Color.black} b center t={ "close" }
                        onPress={e => setShowNotifModalC(false)} />
                </View>
            </View>
        </View>
       
        );
    }

    _showNotifModalC = async(item) => {
        let complaint_lat = item?.location?.latitude ||APP_CONFIG.COORDINATES.coords.latitude 
        let complaint_long = item?.location?.longitude ||APP_CONFIG.COORDINATES.coords.longitude 
        setComplaintLocation({complaint_lat,complaint_long});
        setComplaint(item);
        await getAddressOfCurrentLocation(item);
        setShowNotifModalC(true);
        await getSaathiCurrentLocationInComplaints();
    }

    _showNotMyWorkModalC = () => {
        return (
            <Modal>
                <View pa={8}>
                    <Text t={"please_enter_your_comment"} />
                </View>
                <View>
                    <TextInput uc={Color.lightGrayColor} ph="remarks" nl={4}
                    onChangeText={(name, text) => {
                        setComment(text);
                    }} name={"comment"} to={10} pb={4} />
                </View>
                <View row c={Color.white} mv={8}>
                    <Touch jc mt={20} mb={5} h={36} w={'48%'} br={4} bw={1} mr={8}
                        s={14} c={Color.black} b center t={ "close" }
                        onPress={() => {
                            setComment("");
                            setShowCommentModalC(false);
                        }} />
                    <Touch jc mt={20} mb={5} h={36} w={'48%'} br={4} bw={1}
                        s={14} c={Color.black} b center t={ "submit" }
                        onPress={e => {
                            setShowCommentModalC(false);
                            _updateComplaintStatus(WORK_STATUS_NOT_MY_WORK);
                        }} />
                </View>
            </Modal>
        );
    }

    updateWorkDone = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        let location = await Location.getLastKnownPositionAsync({enableHighAccuracy: true});
        let obj1={imagePUrl,commentP,lat: location?.coords?.latitude, long: location?.coords?.longitude, date: new Date().getTime()}
        let obj = { imageUrl, comment,lat: location?.coords?.latitude, long: location?.coords?.longitude, date: new Date().getTime() };
        updateSaathiWorkDoneImage(complaint.id, obj, complaint.type,obj1);
        setImageUrl("");
        setComment("")
        setImagePUrl("");
        setCommentP("")
        getAllComplaints();
    }

    updateNotMyWork = async () => {
        let obj = { imageUrl, comment, date: new Date().getTime() };
        updateSaathiNotMyWork(complaint.id, obj, complaint.type);
        getAllComplaints();
    }

    cameraOnload = async (url) => {
        setImageUrl(url);
    }
    cameraOnloadP = async (url) =>{
        setImagePUrl(url)
    }

    _showDoneModalC = () => {
        return (
            <Modal>
                <View pa={8}>
                    <Text t={"please_enter_your_comment"} />
                </View>
                {
                    imageUrl ? <View mt={16}>
                        <Image uri={imageUrl} resizeMode="contain" h={200} /> 
                    </View> : null
                }
                <View pv={16} row jc>
                    <Touch bw={1} br={4} s={16} row ai jc boc={Color.black}
                    w={200} h={36} onPress={()=> {
                        setDataAction({ cameraInfo: { 
                            show : true , 
                            onLoadOp : cameraOnload,
                            imageRef : "word_done/" + new Date().toLocaleDateString().split("/").join("-") + "/" + new Date().getTime() + '.jpg'
                        }});
                    }}>
                        <IconAwesome size={18}
                            name={"camera"}
                            color={Color.themeColor} /> 
                        <Text ml={8} t={imageUrl ? "edit_picture" : "take_picture"} />
                    </Touch>
                </View>
                <View pa={8}>
                    <TextInput  uc={Color.lightGrayColor} ph="remarks" nl={4}
                    onChangeText={(name, text) => {
                        setComment(text);
                    }} name={"comment"} to={10} pb={4} />
                </View>
                <View row c={Color.white} mv={8}>
                    <Touch jc mb={5} h={36} w={'48%'} br={4} bw={1} mr={8}
                        s={14} c={Color.black} b center t={ "close" }
                        onPress={() => {
                            setComment("");
                            setshowDoneModalCC(false);
                        }} />
                    <Touch jc mb={5} h={36} w={'48%'} br={4} bw={1}
                        s={14} c={Color.black} b center t={ "submit" }
                        onPress={e => {
                            setshowDoneModalCC(false);
                            _updateComplaintStatus(WORK_STATUS_DONE);
                        }} />
                </View>
            </Modal>
        );
    }
    _showPriorModalC = () =>{
        return (
            <Modal>
                <View pa={8}>
                    <Text t={"please_enter_your_comment"} />
                </View>
                {
                    imagePUrl ? <View mt={16}>
                        <Image uri={imagePUrl} resizeMode="contain" h={200} /> 
                    </View> : null
                }
                <View pv={16} row jc>
                    <Touch bw={1} br={4} s={16} row ai jc boc={Color.black}
                    w={200} h={36} onPress={()=> {
                        setDataAction({ cameraInfo: { 
                            show : true , 
                            onLoadOp : cameraOnloadP,
                            imageRef : "prior_to_work/" + new Date().toLocaleDateString().split("/").join("-") + "/" + new Date().getTime() + '.jpg'
                        }});
                    }}>
                        <IconAwesome size={18}
                            name={"camera"}
                            color={Color.themeColor} /> 
                        <Text ml={8} t={imagePUrl ? "edit_picture" : "take_picture"} />
                    </Touch>
                </View>
                <View pa={8}>
                    <TextInput  uc={Color.lightGrayColor} ph="remarks" nl={4}
                    onChangeText={(name, text) => {
                        setCommentP(text);
                    }} name={"comment"} to={10} pb={4} />
                </View>
                <View row c={Color.white} mv={8}>
                    <Touch jc mb={5} h={36} w={'48%'} br={4} bw={1} mr={8}
                        s={14} c={Color.black} b center t={ "close" }
                        onPress={() => {
                            setShowPriorModalC(false);
                            setShowNotifModalC(true);
                        }} />
                    <Touch jc mb={5} h={36} w={'48%'} br={4} bw={1}
                        s={14} c={Color.black} b center t={ "submit" }
                        onPress={e => {
                            setShowPriorModalC(false);
                            setShowNotifModalC(true);
                        }} />
                </View>
            </Modal>
        );

    }

    _closeNotifModal = () => {
        setShowNotifModalC(false);
    }
     
    showModal = message => {
        setDataAction({ errorModalInfo : { showModal : true, message } });
      }
    
    

    return (
        <View>
            <Header navigation={navigation} headerText={"complaints"} />
            {userInfo.status?
            <View>
                <View ph={16} mv={8}>
                    <Text s={18} t={["welcome", " ", userInfo.name]} />
                </View>
                <View ph={16} mb={16} bw={1} br={8} mh={16}  pv={8}>
                    <Text t={ welcomeText } />
                </View>
                {complaints.length == 0?
                    <View ph={16} mb={16}>
                        <Text s={16} t={["currently_you_donot_have_any_assignments"]} />
                    </View>:null
                }
                {
                    !isLoading ? <FlatList
                        style={{marginHorizontal : 16, height: height - 220}}
                        data={ complaints }
                        keyExtractor={(item, index) => index.toString()}
                        onRefresh={() => onRefresh()}
                        refreshing={isFetching}
                        renderItem={({ item, index }) => (
                            <View bw={1} bc={Color.lightGrayColor} mb={20} br={4} ph={16}>
                                        <View row ai style={{justifyContent: "space-between"}} h={36}>
                                            <Text s={14} c={Color.black} t={new Date(item.createdTime.seconds * 1000).toDateString()} />
                                            <Text s={16} b c={Color.themeColor} t={item.state || "ACTIVE"} />
                                        </View>
                                        <View row ai style={{justifyContent: "space-between"}} h={36}>
                                            <Text s={14} c={Color.black} t={item.selectedWasteType?.name || item.typesOfGarbageDump || ""} />
                                            <Touch w={120} h={"100%"} row jc ai boc={Color.themeColor} 
                                                onPress={() => _showNotifModalC(item)}
                                                style={{ justifyContent: "flex-end" }}>
                                                <Icon size={16} name={"eye"} color={Color.themeColor} />
                                                <Text u c={Color.themeColor} ml={2} s={14} t={'view_more'} />
                                            </Touch>
                                        </View>
                                    </View>
                                )
                            }
                        /> : <Loading isLoading loadingText={"fetching_tasks"}/>
                    }
                    <View mb={180} />
                    { showNotifModalC ? complaintModal() : null }
                    { showCommentModalC ? _showNotMyWorkModalC() : null }
                    { showDoneModalC ? _showDoneModalC() : null }
                    { showPriorModalC ? _showPriorModalC(): null }
            </View>:
            <View a c={Color.backgroundModalColor} jc ai zi={999} to={60} le={0} h={height} w={width}>
                <View w={width - 48} br={8} c={Color.white} jc pa={2} h={80}>
                    <Text t={userInfo.isApproved?"switch_on_duty":"switch_on_duty_c"} center b pa={10} s={18}/>
                </View>
            </View>}
        </View>
    )
}