import React, { useState, useEffect }  from 'react';
import { FlatList, Dimensions, Linking, Image as RnImageView ,BackHandler} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import { View, Text, Touch, Loading, Image } from "./../ui-kit";
import Header from "../components/header";
import Modal from "./../components/modal";
import { Color, generateUUID, TOKEN, FEATURES,PAGES } from '../global/util';
import { getNotifications } from "./../repo/repo";
import { useFocusEffect,useNavigationState } from '@react-navigation/native';
let { height } = Dimensions.get("window");

export default ({ navigation }) => {

    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    const [notifications, setNotifications] = useState([]);
    const [showNotifModal, setShowNotifModal] = useState(false);
    const [notification, setNotification] = useState({});
    const [isFetching, setIsFetching] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigationValue = useNavigationState(state => state);
    const routeName = (navigationValue.routeNames[navigationValue.index]);
    let { userInfo, blockedNotifications } = useSelector(state => state.testReducer) || {};
    
    useEffect(() => {
        if(routeName === PAGES.NOTIFICATIONS){
          const backAction = () => {
            navigation.navigate(PAGES.HOME);
            return true;
          };
          const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
          );
          return () => backHandler.remove();
        }
    });

    const getAllNotifications = async () => {
        let notifications = await userInfo?.ward?.length>0?getNotifications(userInfo):[];
        if(!notifications || !notifications.length){
            notifications = [];
            notifications.push({
                message : "notif_default_msg",
                id : generateUUID()
            });
        }
        setNotifications(notifications);
        setIsFetching(false);
        setIsLoading(false);
    }

    useEffect(() => {
        if(notifications.length == 0){
            setIsLoading(true);
        }
        getAllNotifications();
    }, [isFetching]);

    onRefresh = () => {
        setIsFetching(true);
    }

    useFocusEffect(
        React.useCallback(() => {
            getAllNotifications();
        }, [])
    );


    notifModal = () => {
        return (
            <Modal closeModal={_closeNotifModal}>
                <View pa={8}>
                    <Text t={notification.message} />
                </View>
                {
                    notification?.picture ? <View mt={16}>
                        <Image uri={notification?.picture} resizeMode="contain" h={200} /> 
                    </View> : null
                }
                <View row c={Color.white}>
                    <Touch fl={1} jc mt={20} mb={5} h={36} w={'100%'} br={4} mr={8} bc={Color.themeColor}
                        s={14} c={Color.themeFontColor} b center t={ "close_c" }
                        onPress={e => setShowNotifModal(false)} />
                </View>
            </Modal>
        );
    }

    _showNotifModal = (item) => {
        setNotification(item);
        setShowNotifModal(true);
    }

    _closeNotifModal = () => {
        setShowNotifModal(false);
    }

    return <View>
        <Header navigation={navigation} headerText={"notifications"} />
        <View ml={20} bw={1} w={"90%"} bc={"#CCCCCC"}/>
            <View row ph={16} mv={8}>
                <Text s={18} t={["welcome", " "]} />
                <Text s={18} b t={[userInfo.name]} />
            </View>
            <View ph={16} mb={16} bw={1} br={8} mh={16}  pv={8} bc={Color.lightGrayColor}>
                <Text t={["notif_welcome_msg"]} />
            </View>
            <View ph={16} mb={14}>
                <Text s={18} t={["your_notifications"]} />
            </View>
            {
                !isLoading ? <FlatList
                    style={{marginHorizontal : 16, height: height - 220}}
                    data={ notifications }
                    keyExtractor={(item, index) => index.toString()}
                    onRefresh={() => onRefresh()}
                    refreshing={isFetching}
                    renderItem={({ item, index }) => (
                            <View key={index} bw={1} mb={20} br={4} bc={Color.lightGrayColor}>
                                {
                                    (item?.date && !showNotifModal) ? <Touch h={36} br={4} onPress={() => _showNotifModal(item)}>
                                        <View row c={Color.themeColor} h={36} ai ph={16}>
                                            <Text t={item?.date} b />
                                        </View>
                                    </Touch> : null
                                }
                                {
                                    item?.picture ? <View mt={16}>
                                        <Image uri={item?.picture.toString()} resizeMode="contain" h={200} /> 
                                    </View> : null
                                }
                                <View pl={16} pv={8}>
                                    <Text t={item.message} />
                                </View>
                            </View>
                        )
                    }
                /> : <Loading isLoading loadingText={"fetching_notification"}/>
            }
            <View mb={180} />
            { showNotifModal ? notifModal() : null }
    </View>
}