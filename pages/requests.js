import React, { useEffect, useState}  from 'react';
import { Dimensions, FlatList, Image as RNImageView} from "react-native";
import { useSelector, useDispatch } from 'react-redux';
import { setData } from "./../redux/action";
import { View, Text, Touch, Image } from "./../ui-kit";
import { Color, PAGES } from '../global/util';
import Header from "../components/header";
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { getUserTasks, deleteTask, updateTasks } from "./../repo/repo";
import Icon from 'react-native-vector-icons/FontAwesome';
const { width, height } = Dimensions.get('window');  

export default ({ navigation }) => {

    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    const [tasks, setTasks] = useState([]);
    const [isFetching, setIsFetching] = useState(false);

    let userInfo = useSelector(state => state.testReducer.userInfo) || {};

    useEffect(() => {
        getTasks();
    }, [isFetching]);

    getTasks = async () => {
        let tasks = await getUserTasks(userInfo);
        setTasks(tasks);
        setIsFetching(false);
    }

    onRefresh = () => {
        setIsFetching(true);
    }

    useFocusEffect(
        React.useCallback(() => {
            getTasks();
        }, [])
    );

    showConfirmModal = () => {
        setDataAction({
            confirmModalInfo : {
                showModal : true,
                primaryText : "request",
                primaryAction : async () => {
                    let location = {};
                    try{
                        location = await Location.getLastKnownPositionAsync({enableHighAccuracy: true});
                    }catch(e){}
                    updateTasks(userInfo, location?.coords?.latitude, location?.coords?.longitude);
                    setDataAction({confirmModalInfo : { showModal : false } });
                    getTasks();
                },
            }
        });
    }

    showDeleteModal = (id) => {
        setDataAction({
            confirmModalInfo : {
                showModal : true,
                primaryText : "delete",
                primaryAction : async () => {
                    deleteTask(id);
                    setDataAction({confirmModalInfo : { showModal : false } });
                    getTasks();
                },
            }
        });
    }

    return <View w={width} h={height}>
        <Header navigation={navigation} headerText={"nagar_nigam_c"} />
        {
            tasks.length === 0 ? (<View h={height - 96} jc ai mh={16}>
                    <View h={200} w={'100%'} ai>
                        <RNImageView source={require("./../assets/noComplaint.png")} resizeMode="contain" style={{ flex: 1 }} />
                    </View>
                    <Text s={20} b mb={16} t={"no_active_requests"} /> 
                    <Text s={16} mb={16} t={"no_requests_message"} />
                    <Touch h={36} jc ai t={"request_vehicle"} c={Color.themeFontColor} w={width/3} bc={Color.themeColor}
                        onPress={() => navigation.navigate(PAGES.ADDREQUESTVEHICLE)} />
                </View>) : (
                <View mt={16} mh={16}>
                    <View mb={16} row ai style={{ justifyContent: "space-between" }}>
                            <Text s={16} t={"your_requests"} /> 
                            <Touch h={36} jc ai t={"request_vehicle"} c={Color.themeFontColor} w={width/3} bc={Color.themeColor}
                                onPress={() => navigation.navigate(PAGES.ADDREQUESTVEHICLE)} />
                    </View>
                    <FlatList
                        data={tasks}
                        onRefresh={onRefresh}
                        refreshing={isFetching}
                        renderItem={({ item, index }) => (
                                <View bw={1} bc={Color.lightGrayColor} mb={20} br={4} ph={16}>
                                    <View row ai style={{justifyContent: "space-between"}} h={36}>
                                        <Text s={14} c={Color.black} t={new Date(item.createdTime.seconds * 1000).toDateString()} />
                                        <Text s={16} b c={Color.themeColor} t={item.state || "ACTIVE"} />
                                    </View>
                                    <View row ai style={{justifyContent: "space-between"}} h={36}>
                                        <Text s={14} c={Color.black} t={item?.selectedWasteType?.id} />
                                        <Touch w={120} h={"100%"} row jc ai boc={Color.themeColor} onPress={() => showDeleteModal(item.id)}
                                            style={{ justifyContent: "flex-end" }}>
                                            <Icon size={16} name={"trash"} color={Color.themeColor} />
                                            <Text u c={Color.themeColor} ml={2} s={14} t={'delete'} />
                                        </Touch>
                                    </View>
                                </View>
                            )
                        }
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>
            )
        }
    </View>
}