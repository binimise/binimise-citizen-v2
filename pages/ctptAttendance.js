import React, {useState, useEffect, useReducer}  from 'react';
import { Dimensions, ScrollView} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import { View, Text, Touch, TextInput, Picker,Image } from "./../ui-kit";
import * as Location from 'expo-location';
import { addCtptAttendance,getCtptByQrcode,getCtpt} from "./../repo/repo";
import { Color, PAGES, APP_CONFIG, USERINFO, AUTHUID} from '../global/util';
import NetInfo from '@react-native-community/netinfo';
import IconAnt from 'react-native-vector-icons/AntDesign';
import { Camera } from 'expo-camera';
import BarScanner from "./../components/barcodeScanner";
import Header from "../components/header";
let { height,width } = Dimensions.get('window');



export default ({ navigation }) => {

    const[ctpt,setCtpt] = useState([]);
    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    const [showScanner, setShowScanner] = useState(false);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [camera, setCamera] = useState({});
    const [scanned, setScanned] = useState(false);
    const [isShowCtpt,setIsShowCtpt] = useState(false);
    const [selectedCtpt,setSelectedCtpt] = useState({});
    const [comment,setComment] = useState("");
    const [photoUrl,setPhotoUrl] = useState("")
    let { userInfo } = useSelector(state => state.testReducer) || {};

    useEffect(()=>{
        getCtptData();
    },[])

    getCtptData = async()=>{
        let _data=await getCtpt();
        setCtpt(_data);
    }

    toggleLoading = show => {
        setDataAction({"loading": {show}});
    }
    
    getScannedValue = scannedValue => {
        if(!scannedValue){
            return showErrorModalMsg("incorrect bar code");
        }
        // setScannedValue(scannedValue);
        searchCtptByQr(scannedValue);
    }
    closeModal = () => {
        setShowScanner(false);
    }
 

    searchCtptByQr = async (scanned_value) => {
        let _ctpt = await getCtptByQrcode(scanned_value);
        if(!_ctpt){
          setCtpt([]);
          return showModal("unable_to_find_ctpt");
        }else{
           setCtpt([_ctpt]);
        }
    }

    // commonArrayData =(incomingData)=>{
    //     let filteredArr = [];
    //     let saathiWards = userInfo?.ward?userInfo.ward:[]
    //     if(incomingData.length>0&&saathiWards.length>0){
    //         for(let i=0;i<incomingData.length;i++){
    //             if(saathiWards.includes(incomingData[i].areaCode)){
    //                 filteredArr.push(incomingData[i])
    //             }
    //         }
    //         setCtpt(filteredArr);
    //     }
    // }

    showErrorModalMsg = (message, title = "message") => {
        setDataAction({ 
            errorModalInfo : {
                showModal : true, title, message
            }
        })
    };

    _updateCtPtAttendance = async () => {
        toggleLoading(true);
        let location = {};
        try{
          location = await Location.getLastKnownPositionAsync({enableHighAccuracy: true});
        }catch(e){}
        let newObj={}
        newObj.name=selectedCtpt.name
        newObj.authUid=selectedCtpt.authUid
        newObj.typeOfToilet=selectedCtpt.typeOfToilet
        newObj.address=selectedCtpt.address
        newObj.areaCode=selectedCtpt.areaCode
        newObj["lat"] =  location?.coords?.latitude ||APP_CONFIG.COORDINATES.coords.latitude
        newObj["long"] =location?.coords?.longitude || APP_CONFIG.COORDINATES.coords.longitude
        newObj.comment=comment
        newObj.photoUrl =photoUrl
        newObj.isImageTaken =photoUrl?true:false
        newObj.createdTime = new Date()
        var authUid = await AsyncStorage.getItem(AUTHUID);
        newObj["attendedBy"] = authUid; 
        
        addCtptAttendance(newObj);
        toggleLoading(false);
        setPhotoUrl("")
        setComment("")
        setIsShowCtpt(false);
        setSelectedCtpt({});
        alert("Details Sucessfully Captured");
    }

    closeModal = () => {
        setShowScanner(false);
    }

    formOnChangeText = (field, value) => {
        setComment(value)
    }

    _showCamera = async () => {
        let state = await NetInfo.fetch();
        if (!state.isConnected) {
            return setDataAction({ errorModalInfo: { showModal: true, message: "you_are_offline" }});
        }
        setDataAction({ cameraInfo: { 
            show : true , 
            onLoadOp : onSaveImage,
            imageRef : "ctptAcknowledge/" + userInfo[AUTHUID] + "/" + new Date().toLocaleDateString().split("/").join("-") + "/" + new Date().getTime() + '.jpg'
        }});
    }

    onSaveImage = async (url) => {
        setPhotoUrl(url);
    }

    closeCamera = ()=>{
        setShowScanner(false);
    }

    if(isShowCtpt){
        return <View c={"white"} w={"100%"} h={"90%"}>
        <Header navigation={navigation} headerText={"acknow_ctpt"}/>
        <View w={"90%"} bw={0.5} mh={"5%"} bc={"black"} mb={"4%"}/>
            <Text t={selectedCtpt.name} center s={20} mb={"10%"}/>
            <View br={4} bc={Color.black} bw={1} pt={4} pb={4} mb={"10%"} w={"90%"} mh={"5%"}>
                <Text s={16} ml={16} c={Color.black} t={"please_enter_your_comment"} />
                <TextInput ml nl={1} ph={"comment"} pl={16} h={24}
                    onChangeText={formOnChangeText} name={comment}
                    value={comment}
                />
            </View>
            {photoUrl?<View bw={1} bc={Color.lightGrayColor} mb={20} br={4} w={"90%"} mh={"5%"}>     
                       <Image uri={photoUrl} resizeMode="stretch" h={200} /> 
                     </View>:null}
            <Touch bw={1} jc boc={Color.lightGrayColor} c={Color.black} w={'90%'} mh={"5%"}mt={"4%"}
                mb={"6%"} br={4} onPress={_showCamera} s={14} t={'please_take_image'}/>
             <View row w={"90%"} mh={"5%"}>
                    <Touch br={4} mr={8} bw={1} boc={Color.lightGrayColor} jc h={48} w={'50%'}
                        onPress={()=>setIsShowCtpt(false)} c={Color.black}
                        s={14}  b t={"cancel"}  />
                    <Touch ai jc h={48} w={'50%'} br={4} onPress={() => {
                        
                            _updateCtPtAttendance();
                        }}
                        s={14} c={Color.themeFontColor} bc={Color.themeColor} b t={"submit"} />
            </View>
        </View>
        
    }
   
   
    return showScanner ?  <BarScanner getScannedValue={getScannedValue} closeModal={closeModal}/>:
        <View c={"#F0F0F0"} w={"100%"} h={"100%"}>
            <Header navigation={navigation} headerText={"acknow_ctpt"}/>
            <View ph={16} pt={16} row>
                <Touch bw={1} boc={Color.themeColor} jc br={4} h={36} ai row mr={4} w={"48%"}
                    onPress={() => {setShowScanner(true);setScanned(false)}}>
                    <IconAnt size={18} name={"scan1"}
                        color={Color.themeColor} />
                    <Text t={"scan_qr"} ml={8} />
                </Touch>
                <Touch bw={1} boc={Color.themeColor} jc ai br={4} h={36} row w={"48%"} onPress={()=>{getCtptData()}}>
                    <IconAnt size={18} name={"reload1"}
                        color={Color.themeColor} />
                        <Text t={"refresh"} ml={8}/>
                </Touch>
            </View> 
            <ScrollView>
            <View jc bw={1} br={8} mt={"10%"} mh={"5%"} w={"90%"} ph={"5%"}  
                bc={Color.lightGrayColor} pt={2} pb={2}>
             
                {ctpt.length>0&&ctpt.map((item,index)=>{
                    return <View key={index} w={"100%"} pt={4} pb={4} style={{ borderBottomWidth : 1, borderColor: Color.lightGrayColor}}>
                     <View w={"100%"} h={30} row>
                       <View w={"60%"} jc>
                         <Text s={14} b t={item?.name}/>
                         {/* <Text s={12} t={item?.address}/> */}
                       </View>
                       <View  w={"40%"} c={Color.blue}>
                         <Touch h={30} s={12} t="acknow_ctpt" w={"100%"} c={Color.white} jc ai onPress={() => {
                           setIsShowCtpt(true),setSelectedCtpt(item);}} 
                         />
                       </View>
                     </View>
                   
                   </View>
                })}
            </View>
            <View h={40}/>
            </ScrollView>
        </View>
    
  
}
