import React, { useState, useEffect } from 'react';
import { Dimensions, ScrollView, Image, SafeAreaView } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import { View, Text, Touch } from "./../ui-kit";
import { Color, PAGES, TOKEN,APP_VERSION } from '../global/util';
import { updateUserToken,updateUserStatus } from "./../repo/repo";
import Icon from 'react-native-vector-icons/FontAwesome';
import IconF from 'react-native-vector-icons/FontAwesome5';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
const { height } = Dimensions.get('window'); 




export default ({ navigation }) => {

    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    const [selectedOption, setSelectedOption] = useState(PAGES.TASKS);
    let userInfo = useSelector(state => state.testReducer.userInfo) || {};
    const[isctptShow,setIsCtptShow] = useState(true);
    const[isCheckpointShow,setIsCheckpointShow] = useState(true);
    const[isCommercialShow,setIsCommercialShow] = useState(true);
    const[isUserShow,setIsUserShow] = useState(false);
    const [isAttendanceShow,setIsAttendanceShow] = useState(false)
    const [isPlacesShow,setIsPlacesShow] = useState(true);
    const [isSpotfineshow,setIsSpotfineshow] = useState(true);

    let arrayOfItems = [
        // {id : PAGES.TASKS, name : "assignments", icon : "tasks", type: "fontAwesome",show:userInfo.status?true:false},
        {id : PAGES.USERDETAIL, name : "userprofile", icon : "user", type: "fontAwesome",show:true},
        {id : PAGES.MAPVIEW, name : "mapView", icon : "map-marker", type: "fontAwesome",show:true},
        // {id : PAGES.SAATHIATTENDANCE, name : "attendance", icon : "map-marker", type: "fontAwesome",show:true},
        {id : PAGES.NOTIFICATIONS, name : "notifications", icon : "bell", type: "fontAwesome",show:true},
        {id : PAGES.HISTORY, name : "history", icon : "history", type: "fontAwesome",show:userInfo.status?true:false},
        {id : PAGES.DAILYIMAGES, name : "images", icon : "image", type: "fontAwesome",show:true},
        {id : PAGES.PAYMENT, name : "payments", icon : "rupee", type: "fontAwesome",show:userInfo.status?true:false},
        {id : PAGES.SURVEY, name : "survey", icon : "book", type: "antDesign",show:userInfo.status?true:false},
    ]
    let ctptItems=[
        {id : PAGES.CTPTATTENDANCE, name : "acknow_ctpt", icon : "users", type: "fontAwesome",show:userInfo.status?true:false},
        {id : PAGES.CTPT, name : "boardCtpt", icon : "users", type: "fontAwesome",show:userInfo.status?true:false},
        {id : PAGES.CTPTUPDATE, name : "updatectpt", icon : "users", type: "fontAwesome",show:userInfo.status?true:false},
    ]
    let userItems = [
        {id : PAGES.ACKNOWLEDGEMENT, name : "acknowledgement", icon : "check", type: "antDesign",show:userInfo.status?true:false},
        {id : PAGES.BOARDUSERS, name : "boardUsers", icon : "users", type: "fontAwesome",show:userInfo.status?true:false},
        {id : PAGES.UPDATECITIZEN, name : "updateResident", icon : "user", type: "fontAwesome",show:userInfo.status?true:false},
    ]
    let attendanceItems = [
        // {id : PAGES.SAATHIATTENDANCE, name : "attendance", icon : "map-marker", type: "fontAwesome", show: userInfo.status?true:false},
        {id : PAGES.ONBAORDSAATHI, name : "registartion", icon : "user", type: "fontAwesome",show:userInfo.status?true:false},
        {id : PAGES.UPDATESAATHI, name : "view_staff", icon : "user", type: "fontAwesome",show:userInfo.status?true:false},
        {id : PAGES.SAATHIRPORTS, name : "reports", icon : "user", type: "fontAwesome",show:userInfo.status?true:false},
    ]
    let checkpointItems = [
        {id : PAGES.BOARDCHECKPOINTS, name : "boardCheckpoints", icon : "map-marker", type: "fontAwesome",show:userInfo.status?true:false},
        {id : PAGES.UPDATECHECKPOINT, name : "updateCheckpoint", icon : "certificate", type: "fontAwesome",show:userInfo.status?true:false},
    ]
    let commercialItems = [
        {id : PAGES.COMMERCIALACKNOWLEDGE, name : "acknowledgement", icon : "check", type: "antDesign",show:userInfo.status?true:false},
        {id : PAGES.COMMERCIAL, name : "boardCommercial", icon : "users", type: "fontAwesome",show:userInfo.status?true:false},
        {id : PAGES.UPDATECOMMERCIAL, name : "updateCommercial", icon : "users", type: "fontAwesome",show:userInfo.status?true:false},
    ]
    let placesItems = [
        {id : PAGES.UPDATEPLACES, name : "updatePlace", icon : "th-large", type: "fontAwesome",show:userInfo.status?true:false},
    ]
    let spotfineItems = [
        {id : PAGES.SPOTFINE, name : "post_spotfine", icon : "rupee", type: "fontAwesome",show:true},
        {id : PAGES.ASSIGNEDSPOTFINE, name : "assigned_spotfine", icon : "rupee", type: "fontAwesome",show:true},
    ]
    let arrayOfEndItems = [
        {id : PAGES.FUELMANAGEMENT, name : "fuel_management", icon : "beer", type: "fontAwesome",show:true},
       
        {id : PAGES.LANGUAGE, name : "select_language", icon : "language", type: "fontAwesome",show:true},
        {id : PAGES.ABOUTUS, name : "about_us", icon : "info-circle", type: "fontAwesome",show:true}
    ]
    let logoutItem = [
        {id : PAGES.LOGOUT, name : "logout", icon : "sign-out", type: "fontAwesome",show:true}
    ]

     _onPressSidebar = async (item) => {
        if(item.id == PAGES.LOGOUT) {
            setDataAction({
                confirmModalInfo : {
                    showModal : true,
                    primaryText : "logout",
                    primaryAction : async () => {
                        let token = await AsyncStorage.getItem(TOKEN);
                        AsyncStorage.clear();
                        updateUserToken(userInfo, "");
                        updateUserStatus(userInfo,false)
                        setDataAction({userInfo: {},confirmModalInfo : { showModal : false } });
                        AsyncStorage.setItem(TOKEN, token ||"");
                        navigation.reset({
                            index: 0,
                            routes: [{ name: PAGES.LOGINPAGE }]
                        });
                    },
                }
            });
        } else if(item.id == PAGES.USERDETAIL) {
            setDataAction({ updateUserInfoFlag: true });
            navigation.navigate(item.id);
        } 
        else if(item.id == PAGES.LANGUAGE) {
            setDataAction({languageChangeModalInfo : {
                showModal : true,
            }});
        } 
        else {
            navigation.navigate(item.id);
        }
        navigation.closeDrawer();
        setSelectedOption(item.id);
    }
    openConfirmModal = ()=>{
        setDataAction({ 
            confirmModalInfo : {
                title: "message",
                message: userInfo.isApproved?"switch_on_duty":"switch_on_duty_c",
                showModal : true,
                primaryText : "ok_c",
                primaryAction : async () => {
                  setDataAction({confirmModalInfo : { showModal : false }});
                },
            }
        });
    }

    showSidebarList = (flag,sFlag,text,arrayList,icon,supervisorFlag,eText)=>{
        if(supervisorFlag){
            return(
                flag?
                    <Touch  h={40} bc={"#F8F8F8"} mb={2} jc onPress={()=>sFlag(false)}>
                        <View row>
                            <View w={40} row jc>
                                {eText == "iconMaterial"?
                                  <IconMaterial size={20} name={"toilet"} color={"green"}/> :
                                  <Icon size={20} name={icon} color={"green"}/>
                                }
                            </View>
                            <Text s={16} lh={18} b t={text} c={"green"} mt={4}/>
                            <IconF size={24} name={"angle-down"}  style={{position:"absolute",right:8,color:"green"}}/> 
                        </View>
                    </Touch>
                    :  
                     (<View mb={8}>
                        <Touch  h={40} bc={"#F8F8F8"} mb={2} jc onPress={()=>sFlag(true)}>
                        <View row>
                            <View w={40} row jc>
                                {eText == "iconMaterial"?
                                  <IconMaterial size={20} name={"toilet"} color={"green"}/> :
                                  <Icon size={20} name={icon} color={"green"}/>
                                }
                            </View>
                            <Text s={16} lh={18} b t={text} c={"green"} mt={4}/>
                            <IconF size={24} name={"angle-up"}  style={{position:"absolute",right:8,color:"green"}}/> 
                        </View>
                        </Touch>
                        {
                            arrayList.map((item, index) => ( 
                                <Touch  h={40}key={index}  mb={2} ml={10} jc
                                onPress={() =>item.show? _onPressSidebar(item):openConfirmModal()}>
                                    <View row>
                                        <View w={40} row jc>
                                            <Icon size={20} name={item.icon} color={item.show?"green":"red"}/>
                                        </View>
                                        <Text s={16} lh={18} t={item.name} b c={item.show?"green":"red"} mt={4}/>
                                    </View>
                                </Touch>
                            ))
                        }
                    </View>)
            )

        }
    }
        
    
   
    
    __showArrayEndItems = ()=>(
        arrayOfEndItems.map((item, index) => ( 
            <Touch key={index} h={40} bc={"#F8F8F8"} mb={2} jc
                onPress={() =>item.show? _onPressSidebar(item):openConfirmModal()}>
                <View row>
                    <View w={40} row jc>
                        <Icon size={20} name={item.icon} color={item.show?"green":"red"}/>
                    </View>
                    <Text s={16} lh={18} t={item.name} b c={item.show?"green":"red"} mt={4}/>
                </View>
            </Touch>
        ))
    )

    return <SafeAreaView style={{flex:1}}>
        <View h={240} w={'100%'} pb={40} ai jc>
            <Image source={require("./../assets/icon.jpg")} resizeMode="contain" style={{marginTop:20,height:200,width:"100%"}} />
            <Text s={12} t={"Powered By - Binimise Labs"} /> 
        </View>
        <View row  ai pl={10} c={"#F8F8F8"} w={"100%"} h={40}>
            <Text t ={"app_version"} s={17} b />
            <Text t={APP_VERSION} s={16} b/>
        </View>
        <ScrollView contentContainerStyle={{ }}>
        {
            arrayOfItems.map((item, index) => ( 
                <Touch key={index} h={40} bc={"#F8F8F8"} mb={2} jc
                    onPress={() =>item.show? _onPressSidebar(item):openConfirmModal()}>
                    <View row>
                        <View w={40} row jc>
                            <Icon size={20} name={item.icon} color={item.show?"green":"red"}/>
                        </View>
                        <Text s={16} lh={18} t={item.name} b c={item.show?"green":"red"} mt={4}/>
                    </View>
                </Touch>
            ))
        }
        {
            showSidebarList(isAttendanceShow,setIsAttendanceShow,"saathi_attendance",attendanceItems,"users",userInfo.isSupervisor)
        }
        {
            showSidebarList(isUserShow,setIsUserShow,"household",userItems,"users",true)
        }
        {
            showSidebarList(isctptShow,setIsCtptShow,"ctpt",ctptItems,"toilet",true,"iconMaterial")
        }
        {
            showSidebarList(isCheckpointShow,setIsCheckpointShow,"checkpoint",checkpointItems,"map-marker",true)
        }
        {
            showSidebarList(isCommercialShow,setIsCommercialShow,"commercial",commercialItems,"users",true)
        }
        {
            showSidebarList(isPlacesShow,setIsPlacesShow,"places",placesItems,"th-large",true)
        }
        {
            showSidebarList(isSpotfineshow,setIsSpotfineshow,"spot_fine",spotfineItems,"rupee",true)
        }
        {
            __showArrayEndItems()
        }
        {
            logoutItem.map((item, index) => ( 
                <Touch key={index} h={40} bc={"#F8F8F8"} mb={2} jc style={{position:"absolute",bottom:0}}
                    onPress={() =>item.show? _onPressSidebar(item):openConfirmModal()}>
                    <View row>
                        <View w={40} row jc>
                            <Icon size={20} name={item.icon} color={item.show?"green":"red"}/>
                        </View>
                        <Text s={16} lh={18} t={item.name} b c={item.show?"green":"red"} mt={4}/>
                    </View>
                </Touch>
                  
                )
            )
        }
       
        <View mt={60} bw={1} br={2} bc={"#C9D9D1"}/>
                     
        </ScrollView>       
    </SafeAreaView>
   
}
