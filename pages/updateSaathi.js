import React, { useState, useEffect } from "react";
import { Dimensions,ScrollView, NativeModules,BackHandler,Alert } from "react-native";
import {View, Text,Touch,TextInput } from "../ui-kit";
import Header from "../components/header";
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import { USERINFO, AUTHUID,Color, PAGES,getImageUrltoBase64,STAFF_OBJ_STORAGE, PHONENUMBER } from '../global/util';
import { Camera,CameraType } from 'expo-camera';
import Icon from 'react-native-vector-icons/AntDesign';
import { getBothStaffAndSupervisor} from "./../repo/repo";
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useIsFocused,useNavigationState} from '@react-navigation/native';
import Styles from "../styles/styles";
import firebase from "./../repo/firebase";
import * as FaceDetector from "expo-face-detector";
import { createNewDocOfSaathi } from '../global/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width, height } = Dimensions.get('window');

const {FaceRecognition} = NativeModules;


export default ({navigation,route}) => {

    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    let { userInfo,allSaathiObj } = useSelector(state => state.testReducer) || {};
    const [searchText,setSearchText] = useState("");
    const [view_message,setViewMessage] = useState("click_on_get_staff_to_getData");
    const [selectedSaathi,setSelectedSaathi] = useState({})
    const [saathiList,setSaathiList] = useState([]);
    const [originalData,setOriginalData] = useState([]);
    const state = useNavigationState(state => state);
    const routeName = (state.routeNames[state.index]);
    const isFocused = useIsFocused();

    useEffect(() => {

        if(routeName === "updateSaathi"){
          const backAction = () => {
            setDataAction({
                confirmModalInfo : {
                    showModal : true,
                    title : "Hold on!",
                    message : "Are you sure you want to go back?",
                    primaryText : "YES",
                    primaryAction : () => {
                        setDataAction({ confirmModalInfo : { showModal: false }});
                        setImageLoadingInAtt(false);
                        navigation.navigate(PAGES.HOME)
                    },
                    secondaryText : "NO",
                    secondaryAction : () => {
                        setDataAction({ confirmModalInfo : { showModal: false }});
                    }
                }
            });
            return true;
          };
          const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
          );
    
          return () => backHandler.remove();
        }
    });

    useEffect(()=>{
        if(isFocused){
            getAllSaathiData(route?.params?.isfromEditSaathi || false);
        }else{
            setSelectedSaathi({});
        }
        
    },[isFocused])

    const isEmptyObject = (obj) => {
        return Object.keys(obj).length === 0;
    }

    const getAllSaathiData  = async(flag)=>{
        try{
            let dataFromStorage = await AsyncStorage.getItem(STAFF_OBJ_STORAGE) || {};
            if(!flag && !isEmptyObject(allSaathiObj)) {  //redux
                
                setViewMessage("getting_staff");
                setDataAction({ loading: { show: true }}); //add text here
                getAssignedSaathis(allSaathiObj,userInfo);
                if(allSaathiObj[userInfo[AUTHUID]]){
                    allSaathiObj[userInfo[AUTHUID]].status = userInfo?.status || false;
                }
                let own_document = allSaathiObj?.[userInfo[AUTHUID]] || {};
                setDataAction({
                    userInfo:own_document
                });
                await AsyncStorage.setItem(USERINFO, JSON.stringify(own_document));
                await AsyncStorage.setItem(STAFF_OBJ_STORAGE, JSON.stringify(allSaathiObj));
            }
            else if(!flag && !isEmptyObject(dataFromStorage)) { //local
                setViewMessage("getting_staff");
                setDataAction({ loading: { show: true }}); //add text here
                let staffObj = JSON.parse(dataFromStorage)|| {};
                if(staffObj[userInfo[AUTHUID]]){
                    staffObj[userInfo[AUTHUID]].status = userInfo?.status || false;
                }
                let own_document = staffObj?.[userInfo[AUTHUID]] || {};
                setDataAction({
                    allSaathiObj: staffObj,
                    userInfo : own_document
                });
                await AsyncStorage.setItem(USERINFO, JSON.stringify(own_document));
                getAssignedSaathis(staffObj,userInfo);

            } else {
                
                setViewMessage("no_data_fetched");
                let message = "getting_staff";
                setDataAction({ loading: { show: true, message } });
                let listFromApi = await getBothStaffAndSupervisor(userInfo);
                let my_details = listFromApi?.[userInfo[AUTHUID]] || {};
                if(!isEmptyObject(listFromApi)){
                    getAssignedSaathis(listFromApi,my_details);
                }
                setDataAction({
                    allSaathiObj: listFromApi,
                    userInfo:my_details
                });
                await AsyncStorage.setItem(USERINFO, JSON.stringify(my_details));
                await AsyncStorage.setItem(STAFF_OBJ_STORAGE, JSON.stringify(listFromApi));
              
                
            }    

        }catch(e){
            setDataAction({loading: { show: false }});
            return showErrorModalMsg("unable_to_fetch_data");
        }
        
    }
 

    const getAssignedSaathis = (totalSaathi,my_list) => {
        
        try {
            let saathi_array = [];
            (my_list?.saathi_list || []).map((eachDoc) => {
                let uId = eachDoc.authUid || eachDoc.id;
                let isSaathiObj = totalSaathi[uId];
                if(isSaathiObj?.authUid || isSaathiObj?.id){
                    saathi_array.push(isSaathiObj);
                }
                
            })

            setSaathiList(saathi_array);
            setOriginalData(saathi_array);
            setDataAction({loading: { show: false } });
        } catch (e) {
            console.log("e", e)
        }

    }

    const getSaathiFromList = (field,value) =>{
        setSearchText(value);
        let textSearch = value.toString().toLowerCase();
        let searchResult = [];
        searchResult = customSearch(originalData, textSearch);
        setSaathiList(searchResult);
    }
    
    const customSearch = ( temp, search) => {
        if (undefined === search || search === "") return temp;
        return temp.filter((searchdata) => {
        //   return Object.values(searchdata).join(" ").toLowerCase().includes(search);
        return searchdata.name.toLowerCase().includes(search);
        });
    }
    
    const onRemoveSearchText = () =>{
        setSearchText("");
        setSaathiList(originalData);
    }

    const  showErrorModalMsg = (message, title = "message") => {
        setDataAction({ 
            loading : { show : false, message: "" },
            errorModalInfo : {
                showModal : true, title, message
            }
        })
    };

    const showSearchBar = () =>{
        return( 
        <View w={"90%"} mh={"5%"} mt={10} row >
            <View br={4} bc={Color.lightGrayColor}  ai row bw={1} pt={4} pb={4} w={"77%"}  mr={"3%"} h={40} mb={8}>
                <TextInput ml nl={1} pl={5} ph={"enter_your_text"}  h={"100%"}
                    onChangeText={getSaathiFromList} 
                    value={searchText}
                />
                <Icon 
                    style={{position:"absolute",right:10}}
                    size={20} 
                    name={"close"}
                    color={Color.red}
                    onPress={onRemoveSearchText}
                />
            </View>
            <Touch 
                t={"refresh"} w={"20%"} bc={Color.themeColor} 
                jc ai c={Color.white} br={4} h={40}
                onPress = {()=>getAllSaathiData(true)}
            />

        </View>
            
        )
    }


    const selectedSaathiId = (saathi) =>{
        setSelectedSaathi(saathi)
    }

    
    const setImageLoadingInAtt = type => {
        setDataAction({ loading: { show : type }});
    }

    return <View w={"100%"} h={"100%"} c={Color.white}>
            <Header navigation={navigation} headerText={"view_staff"} />
            <View mh={"5%"} bw={1} w={"90%"} bc={Color.borderColor} />
            {showSearchBar()}
            <View mh={"5%"} br={8} c={Color.white} h={"80%"} bw={1} pa={4} mb={20}>
                
                <ScrollView>
                    {saathiList.length>0&&saathiList.map((each, index) => {
                        return <View key={index} mb={4} w={"100%"}>
                            <Touch row key={index} bc={"#F0F8FF"}
                                ai br={16} style={{minHeight:40,height:"auto"}}
                                onPress={() => selectedSaathiId(each)}
                            >
                                <View style={Styles.radioCircle} w={"3%"}>
                                    {each.authUid === selectedSaathi?.authUid && <View style={Styles.selectedRb} />}
                                </View>
                                <Text ml={"0.5%"} s={15} t={each.name} w={"30%"} />
                                
                                {
                                    each.isApproved?<View style={Styles.Approved} le={"0.5%"} ri={"1%"} w={"3%"}/> :
                                    <View style={Styles.notApproved} le={"0.5%"} w={"3%"} ri={"1%"} />
                                }
                                <Touch bc={Color.white} br={32} w={"30%"} jc ai h={30}
                                    onPress={() => {
                                        each.authUid !== selectedSaathi?.authUid ? showErrorModalMsg("please_select_staff") :
                                        each?.isApproved ?
                                            navigation.navigate(PAGES.EDITSAATHI, {
                                                selectedSaathiObj: selectedSaathi
                                            }) : showErrorModalMsg("staff_is_not_approved")
                                    }}
                                >
                                    <Text t={"edit"} c={Color.themeColor} />
                                </Touch> 
                                
                                <Touch bc={Color.white} br={32} mh={"2%"} w={"20%"} jc ai h={30}
                                    onPress={() => {
                                        each.authUid !== selectedSaathi?.authUid ? showErrorModalMsg("please_select_staff") :
                                        each?.isApproved ?
                                            navigation.navigate(PAGES.VIEWSAATHI, {
                                                selectedSaathiObj: selectedSaathi
                                            }) : showErrorModalMsg("staff_is_not_approved")
                                    }}
                                >
                                    <Text t={"view"} c={Color.themeColor} />
                                </Touch>
                              
                                                                     
                            </Touch>
                            <View h={1} bw={0.5} bc={Color.borderColor} mh={"5%"} w={"90%"} />
                        </View>
                    })}
                    {saathiList.length<=0&&
                        <Text t={view_message} s={24} center/>}
                
                <View h={40}/>
                </ScrollView>
            </View>
        </View>
      
}

