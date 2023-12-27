import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PhoneVerification from "./pages/PhoneVerification";
import MapView from "./pages/MapView";
import GarbageVan from "./pages/garbageVan";
import ToiletLocator from "./pages/toiletLocator";
import UserDetail from "./pages/userDetails";
import Suggestions from "./pages/suggestions";
import AboutUs from "./pages/aboutUs";
import Complaint from "./pages/complaint";
import RequestVehicle from "./pages/requests";
import Notifications from "./pages/notifications";
import Places from "./pages/places";
import FeedBack from "./pages/feedback";
import PlacesDetail from "./pages/placesDetail";
import ToiletDetails from "./pages/toiletDetails";
import AddComplaint from "./pages/addComplaint";
import SignUpComplete from "./pages/signUpComplete.js";
import Home from "./pages/home";
import Iamhere from "./pages/iamhere";
import ContactUs from "./pages/contactUs";
import Bookings from  "./pages/booking";
import AddBooking from  "./pages/addNewBooking";
// import PaymentReceipt from  "./pages/paymentReceipt";
// import Payment from  "./pages/payment";
import Profile from  "./pages/profile";
import History from  "./pages/history";
import SelectLanguage from  "./pages/selectLanguage";
import Share from  "./pages/share";
import { useDispatch,useSelector } from 'react-redux';
import { setData } from "./redux/action";
import OneSignal from 'react-native-onesignal';
import { updateUserToken, getUserData, getUserBlockedNotifications } from "./repo/repo";
import { PAGES, USERINFO, TOKEN, APP_CONFIG, SELECTEDLANGUAGE,ONESIGNAL_ID } from "./global/util";
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import Sidebar from "./components/sidebar";


const Drawer = createDrawerNavigator();

export default () => {

    const [screenType, setScreenType] = useState("");
    const dispatch = useDispatch();
    const setDataAction = arg => dispatch(setData(arg));
    let { tokenFromOneSignal } = useSelector(state => state.testReducer) || {};

   const setLanguage = async () => {
        let selectedLanguage = await AsyncStorage.getItem(SELECTEDLANGUAGE);
        selectedLanguage = selectedLanguage || "en";
        setDataAction({selectedLanguage});
    }
    const oneSignalOperations = async () => {
        // OneSignal.setLogLevel(6, 0);
        OneSignal.setAppId(ONESIGNAL_ID);
        setTimeout(async () => {
            const deviceState = await OneSignal.getDeviceState();

            if(deviceState.userId!=null){
                setDataAction({tokenFromOneSignal:deviceState.userId ||""}); 
                await AsyncStorage.setItem(TOKEN,deviceState.userId);
            }
            
        }, 4000);
      
    }

    useEffect(() => {
        oneSignalOperations();
        getUserInfo();
        setLanguage();
    }, []);


    const getUserInfo = async () => {
        let userInfo = await AsyncStorage.getItem(USERINFO);
        if(!userInfo){
            return setScreenType(PAGES.SELECTLANGUAGE);
        } 
        userInfo = JSON.parse(userInfo);
        userInfo = await getUserData(userInfo?.phoneNumber);
        if(!userInfo){
            return setScreenType(PAGES.SELECTLANGUAGE);
        }
        setDataAction({ userInfo});
        await updateToken(userInfo);
        setScreenType(PAGES.HOME);
        // initApps(userInfo);
        AsyncStorage.setItem(USERINFO, JSON.stringify(userInfo));
       
    }

    initApps = async userInfo => {
        // initCrashlytics(APP_CONFIG.MUNICIPALITY_NAME, userInfo.phoneNumber);
        // initAnalytics(APP_CONFIG.MUNICIPALITY_NAME, userInfo.phoneNumber);
        // setConfig();
    }
    
  

    const updateToken = async userInfo => {
        if(userInfo?.token) return;
        let token = await AsyncStorage.getItem(TOKEN) || tokenFromOneSignal || "";
        userInfo.token = token;
        updateUserToken(userInfo,token);
        setDataAction({ userInfo });
        AsyncStorage.setItem(USERINFO, JSON.stringify(userInfo));
      
    }

    if(!screenType) return null;

    return (
        <NavigationContainer>
            <Drawer.Navigator
                initialRouteName={screenType}
                screenOptions={{
                    activeTintColor: '#e91e63',
                    itemStyle: {marginVertical: 5},
                    headerShown: false,
                    width: 100,
                }}
                drawerContent={(props) => <Sidebar {...props} />}>
                <Drawer.Screen component={Home} name={PAGES.HOME} />
                <Drawer.Screen component={Notifications} name={PAGES.NOTIFICATIONS} />
                <Drawer.Screen 
                component={PhoneVerification} 
                name={PAGES.LOGINPAGE} 
                options={{
                    gestureEnabled: false, // Disable gesture navigation
                    swipeEnabled : false
                }} 
                />
                <Drawer.Screen component={Places} name={PAGES.PLACES} />
                <Drawer.Screen component={PlacesDetail} name={PAGES.PLACESDETAILS} />
                <Drawer.Screen component={MapView} name={PAGES.MAPVIEW} />
                <Drawer.Screen component={GarbageVan} name={PAGES.GARBAGEVAN} />
                <Drawer.Screen component={ToiletLocator} name={PAGES.TOILETLOCATOR} />
                <Drawer.Screen component={ToiletDetails} name={PAGES.TOILETDETAILS} />
                <Drawer.Screen component={UserDetail} name={PAGES.USERDETAIL} />
                <Drawer.Screen component={Suggestions} name={PAGES.SUGGESTION} />
                <Drawer.Screen component={AddComplaint} name={PAGES.ADDCOMPLAINT} />
                <Drawer.Screen component={Complaint} name={PAGES.COMPLAINT} />
                <Drawer.Screen component={AboutUs} name={PAGES.ABOUTUS} />
                <Drawer.Screen component={FeedBack} name={PAGES.FEEDBACK} />
                <Drawer.Screen component={SignUpComplete} name={PAGES.SIGNUPCOMPLETE} />
                <Drawer.Screen component={Iamhere} name={PAGES.IAMHERE} />
                <Drawer.Screen component={ContactUs} name={PAGES.CONTACTUS} />
                <Drawer.Screen component={Bookings} name={PAGES.BOOKING} />
                <Drawer.Screen component={AddBooking} name={PAGES.ADDNEWBOOKING} />
                {/* <Drawer.Screen component={PaymentReceipt} name={PAGES.PAYMENTRECEIPT} /> */}
                <Drawer.Screen component={Profile} name={PAGES.PROFILE} />
                <Drawer.Screen component={History} name={PAGES.HISTORY} />
                <Drawer.Screen component={SelectLanguage} name={PAGES.SELECTLANGUAGE}/>
                <Drawer.Screen component={Share} name={PAGES.SHARE} />

            </Drawer.Navigator>
        </NavigationContainer>
    )
}