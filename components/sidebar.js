import React  from 'react';
import { Dimensions, ScrollView, Image, SafeAreaView,BackHandler,Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import { View, Text, Touch } from "./../ui-kit";
import { Color, PAGES, TOKEN,APP_VERSION } from '../global/util';
import { updateUserToken } from "./../repo/repo";
import Icon from 'react-native-vector-icons/FontAwesome';
import IconF from 'react-native-vector-icons/FontAwesome5';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
const { height } = Dimensions.get('window');  

let arrayOfItems = [
    {id : PAGES.PLACES, name : "places", icon : "th-large", type: "fontAwesome"},
    {id : PAGES.MAPVIEW, name : "mapView", icon : "map-o", type: "fontAwesome"},
    {id : PAGES.TOILETLOCATOR, name : "toilets", icon :"toilet",type:"MaterialCommunityIcons"},
    // {id : PAGES.GARBAGEVAN, name : "garbageVan" ,icon :"truck" ,type: "fontAwesome"},
    {id : PAGES.SUGGESTION, name : "suggestion", icon : "vcard-o", type: "fontAwesome"},
    {id : PAGES.BOOKING, name : "booking", icon : "file-text-o", type: "fontAwesome"},
    {id : PAGES.HISTORY, name : "history", icon : "history", type: "fontAwesome"},
    {id : PAGES.COMPLAINT, name : "complaint", icon : "edit", type: "fontAwesome"},
    {id : PAGES.NOTIFICATIONS, name : "notifications", icon : "bell", type: "fontAwesome"},
    // {id : PAGES.REQUESTVEHICLE, name : "request_vehicle", icon : "truck", type: "fontAwesome"},
    {id : PAGES.PROFILE, name : "userprofile", icon : "edit", type: "fontAwesome"},
    {id : PAGES.FEEDBACK, name : "feedback", icon : "edit", type: "fontAwesome"},
    {id : PAGES.ABOUTUS, name : "about_us", icon : "info-circle", type: "fontAwesome"},
    // {id : PAGES.IAMHERE, name : "iamhere", icon : "info-circle", type: "fontAwesome"},
    // {id : PAGES.PAYMENT, name : "payment", icon : "info-circle", type: "fontAwesome"},
    {id : PAGES.CONTACTUS, name : "contact_us", icon : "address-book-o", type: "fontAwesome"},
    {id : PAGES.SELECTLANGUAGE, name : "select_language", icon : "language", type: "fontAwesome"},
    // {id : PAGES.SHARE, name : "share", icon : "share-alt", type: "fontAwesome"}
  
]

let logoutItem=  {id : PAGES.LOGOUT, name : "logout", icon : "sign-out", type: "fontAwesome"}

export default ({ navigation }) => {

    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    // let userInfo = useSelector(state => state.testReducer.userInfo) || {};
    let { userInfo,selectedLanguage} = useSelector(state => state.testReducer) || {};

    
    const _onPressSidebar = async (item) => {
        if(item.id == PAGES.LOGOUT) {
            setDataAction({
                confirmModalInfo : {
                    showModal : true,
                    primaryText : "logout",
                    primaryAction : async () => {
                        let token = await AsyncStorage.getItem(TOKEN);
                        AsyncStorage.clear();
                        updateUserToken(userInfo, "");
                        setDataAction({userInfo: {},confirmModalInfo : { showModal : false } });
                        AsyncStorage.setItem(TOKEN, token);
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
        } else if(item.id == PAGES.TOILETLOCATOR) {
            navigation.navigate(PAGES.MAPVIEW,{
                Text:"toilets",id:"Toilets"
            })
        } else if(item.id == PAGES.GARBAGEVAN) {
            navigation.navigate(PAGES.MAPVIEW,{
                Text:"garbageVan",id:"GarbageVan"
            })
        } 
        else {
            navigation.navigate(item.id);
        }
        navigation.closeDrawer();
    }

    const showErrorModalMsg = (message, title = "message") => {
        
    };

    const exitFromApp = ()=>{
        setDataAction({ 
            confirmModalInfo : {
                showModal : true,
                title : "message",
                message : "confirm_to_exit",
                primaryAction : () =>{
                    setDataAction({confirmModalInfo:{showModal: false}})
                    navigation.closeDrawer();
                    navigation.navigate(PAGES.HOME);
                    BackHandler.exitApp();
                }
            }
        })
      
    }

    return <SafeAreaView style={{ flex : 1}}>
        <View h={240} w={'100%'} pb={40} ai jc>
            <Image source={require("./../assets/Chatrapur.png")} resizeMode="contain" style={{marginTop:20,height:200,width:"100%"}} />
            <Text s={12} t={"Powered By - Binimise Labs"} /> 
        </View>
        <View row  ai pl={10} c={"#F8F8F8"} w={"100%"} h={40}>
            <Text t ={"app_version"} s={17} b />
            <Text t={APP_VERSION} s={16} b/>
        </View>

        <ScrollView contentContainerStyle={{ }}>
            {
                arrayOfItems.map((item, index) => ( 
                    // <Touch key={index} jc c={Color.black} h={36} onPress={() => _onPressSidebar(item)}>
                    <Touch key={index} h={40} bc={"#F8F8F8"} mb={2} jc onPress={() =>_onPressSidebar(item)}>
                        <View row>
                            <View w={40} row jc>
                                {
                                    item.id != PAGES.TOILETLOCATOR ? 
                                        <Icon size={18}
                                            name={item.icon} 
                                            style={{paddingTop:2}}
                                            color={Color.themeColor} 
                                        /> : <IconMaterial size={18}
                                                name={item.icon}
                                                style={{paddingTop:2}}
                                                color={Color.themeColor} 
                                        />
                                }
                            </View>
                            <Text s={16} t={item.name} c={"green"} b/>
                        </View>
                    </Touch>
                ))
            }
            <Touch  jc  bc={"#F8F8F8"} h={40} mt={60} mb={2} onPress={() => exitFromApp()}>
                <View row>
                    <View w={40} row jc ai>
                        <Icon size={18}
                            name={logoutItem.icon}
                            color={Color.themeColor} 
                        /> 
                    </View>
                    <Text s={16} t={"exit_app"}  c={"green"} b/>
                </View>
            </Touch>
            <View  bw={1} br={2} bc={"#C9D9D1"}/>
            <Touch  jc bc={"#F8F8F8"} h={40} onPress={() => _onPressSidebar(logoutItem)}>
                <View row>
                    <View w={40} row jc ai>
                        <Icon size={18}
                            name={logoutItem.icon}
                            color={Color.themeColor} 
                        /> 
                    </View>
                    <Text s={16} t={logoutItem.name}  c={"green"} b/>
                </View>
            </Touch>
        </ScrollView>
    </SafeAreaView>
}