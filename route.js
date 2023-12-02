import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PhoneVerification from "./pages/PhoneVerification";
import MapView from "./pages/MapView";
import UserDetail from "./pages/userDetails";
import EditDetails from './pages/editDetails';
import UpdateCitizen from "./pages/updateCitizen";
import UpdateCheckpoint from "./pages/updateCheckpoint";
import UpdatePlace from "./pages/updatePlace";
import AboutUs from "./pages/aboutUs";
import Survey from "./pages/survey";
import Tasks from "./pages/tasks";
import Complaints from './pages/complaints';
import Notifications from "./pages/notifications";
import BoardCheckpoints from "./pages/boardCheckpoints"
import History from "./pages/history";
import Home from "./pages/home";
import Acknowledgement from "./pages/acknowledgement";
import AcknowledgeFromCamera from "./pages/acknowledgeFromCamera";
import Payment from "./pages/payment";
import UnPayment from "./pages/unpayment";
import BoardUsers from "./pages/boardUsers";
import Ctpt from "./pages/ctpt";
import Comercial from "./pages/commercial"
import CommercialAcknowledge from './pages/commercialAcknowledge';
import UpdateCommercial from "./pages/updateCommercial"
import CtptAttendance from './pages/ctptAttendance'
import UpdateCtpt from './pages/updateCtpt'
import DailyImages from "./pages/dailyImages";
// import HistoryDetails from './pages/historyDetails';
import AddPayment from './pages/addpayment';
import FuelManagement from './pages/fuelManagement';
import AddFuelRequest from './Fuel-Management/addFuelRequest';
import ComplaintAndTaskMapView from "./pages/comAndtaskMapView";
import SaathiAttendance from "./pages/saathiAttendance";
import OnboardSaathi from './pages/onBoardSaathi';
import UpdateSaathi from './pages/updateSaathi';
import SaathiReports from './pages/saathiReports';
import EditSaathi from './pages/editSaathi';
import ViewSaathi from './pages/viewSaathi';
import SpotFine from './pages/spotFine';
import AssignedSpotfine from './pages/assignedSpotfine';
import { useDispatch } from 'react-redux';
import { setData } from "./redux/action";
import OneSignal from 'react-native-onesignal';
import { updateUserToken, getUserData,syncBackgroundLocation } from "./repo/repo";
import { PAGES, USERINFO, TOKEN, SELECTEDLANGUAGE, ONESIGNAL_ID, AUTHUID } from "./global/util";
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import Sidebar from "./components/sidebar";

const Drawer = createDrawerNavigator();

export default () => {

    const [screenType, setScreenType] = useState("");
    const dispatch = useDispatch();
    const setDataAction = arg => dispatch(setData(arg));
    const [oneSignalToken,setOneSignalToken] = useState("");

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
            setOneSignalToken(deviceState.userId);

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
            return setScreenType(PAGES.LOGINPAGE);
        } 
        userInfo = JSON.parse(userInfo);
        userInfo = await getUserData(userInfo?.phoneNumber);        
        if(!userInfo){
            return setScreenType(PAGES.LOGINPAGE);
        }
        setDataAction({ userInfo, loading: { show: false } });
        if(userInfo[AUTHUID]){
            await AsyncStorage.setItem(AUTHUID, userInfo[AUTHUID]);
        }
        setScreenType(PAGES.HOME);
        // initApps(userInfo);
        AsyncStorage.setItem(USERINFO, JSON.stringify(userInfo));
        if(userInfo.status){
            syncBackgroundLocation()
        }
        // updateToken(userInfo);
    }

    initApps = async userInfo => {
        // initCrashlytics(APP_CONFIG.MUNICIPALITY_NAME, userInfo.phoneNumber);
        // initAnalytics(APP_CONFIG.MUNICIPALITY_NAME, userInfo.phoneNumber);
        // setConfig();
    }
    
    getBlockedNotifications = async userInfo => {
        let blockedNotifications = await getUserBlockedNotifications(userInfo);
        setDataAction({ blockedNotifications })
    }

    // updateToken = async userInfo => {
    //     if(userInfo.token) return;
    //     setTimeout(async () => {
    //         // let token = await AsyncStorage.getItem(TOKEN);
    //         updateUserToken(userInfo,oneSignalToken);
    //     }, 2000);
    // }

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
                <Drawer.Screen component={MapView} name={PAGES.MAPVIEW} />
                <Drawer.Screen component={Tasks} name={PAGES.TASKS} />
                <Drawer.Screen component={Complaints} name={PAGES.COMPLAINTS} />
                <Drawer.Screen component={BoardUsers} name={PAGES.BOARDUSERS} />
                <Drawer.Screen 
                    component={PhoneVerification} 
                    name={PAGES.LOGINPAGE} 
                    options={{
                        gestureEnabled: false, // Disable gesture navigation
                        swipeEnabled : false
                    }}
                />
                <Drawer.Screen component={History} name={PAGES.HISTORY} />
                {/* <Drawer.Screen component={HistoryDetails} name={PAGES.HISTORYDETAILS} /> */}
                <Drawer.Screen component={Survey} name={PAGES.SURVEY} />
                <Drawer.Screen component={Notifications} name={PAGES.NOTIFICATIONS} />
                <Drawer.Screen component={DailyImages} name={PAGES.DAILYIMAGES} />
                <Drawer.Screen component={UserDetail} name={PAGES.USERDETAIL} />
                <Drawer.Screen component={EditDetails} name={PAGES.EDITDETAILS} />
                <Drawer.Screen component={Ctpt} name={PAGES.CTPT} />
                <Drawer.Screen component={BoardCheckpoints} name={PAGES.BOARDCHECKPOINTS} />
                <Drawer.Screen component={Acknowledgement} name={PAGES.ACKNOWLEDGEMENT} />
                <Drawer.Screen component={AcknowledgeFromCamera} name={PAGES.ACKNOWLEDGEFROMCAMERA} />
                <Drawer.Screen component={Payment} name={PAGES.PAYMENT} />
                <Drawer.Screen component={UnPayment} name={PAGES.UNPAYMENT} />
                <Drawer.Screen component={AboutUs} name={PAGES.ABOUTUS} />
                <Drawer.Screen component={UpdateCitizen} name={PAGES.UPDATECITIZEN} />
                <Drawer.Screen component={UpdateCheckpoint} name={PAGES.UPDATECHECKPOINT} />
                <Drawer.Screen component={UpdatePlace} name={PAGES.UPDATEPLACES} /> 
                <Drawer.Screen component={Comercial} name={PAGES.COMMERCIAL} /> 
                <Drawer.Screen component={UpdateCommercial} name={PAGES.UPDATECOMMERCIAL} /> 
                <Drawer.Screen component={CtptAttendance} name={PAGES.CTPTATTENDANCE} /> 
                <Drawer.Screen component={UpdateCtpt} name={PAGES.CTPTUPDATE} /> 
                <Drawer.Screen component={AddPayment} name={PAGES.ADDPAYMENT} /> 
                <Drawer.Screen component={FuelManagement} name={PAGES.FUELMANAGEMENT} /> 
                <Drawer.Screen component={AddFuelRequest} name={PAGES.ADDFUELREQUEST} /> 
                <Drawer.Screen component={CommercialAcknowledge} name={PAGES.COMMERCIALACKNOWLEDGE}/>
                <Drawer.Screen component={ComplaintAndTaskMapView} name={PAGES.COMANDTASKMAPVIEW}/>
                <Drawer.Screen component={SaathiAttendance} name={PAGES.SAATHIATTENDANCE}/>
                <Drawer.Screen component={OnboardSaathi} name={PAGES.ONBAORDSAATHI}/>
                <Drawer.Screen component={UpdateSaathi} name={PAGES.UPDATESAATHI}/>
                <Drawer.Screen component={SaathiReports} name={PAGES.SAATHIRPORTS}/> 
                <Drawer.Screen component={EditSaathi} name={PAGES.EDITSAATHI}/>
                <Drawer.Screen component={ViewSaathi} name={PAGES.VIEWSAATHI}/>
                <Drawer.Screen component={SpotFine} name={PAGES.SPOTFINE}/>
                <Drawer.Screen component={AssignedSpotfine} name={PAGES.ASSIGNEDSPOTFINE}/>
                 
            </Drawer.Navigator>
        </NavigationContainer>
    )
}