import React  from 'react';
import { Dimensions, Image } from "react-native";
import { useDispatch } from 'react-redux';
import { setData } from "./../redux/action";
import { View, Text, Touch } from "./../ui-kit";
import { Color, PAGES } from '../global/util';
import * as Permissions from 'expo-permissions';
const { width, height } = Dimensions.get('window');  

export default ({ navigation }) => {

    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));

    return <View w={width} h={height} jc ai>
        <View h={200} ai>
          <Image source={require("./../assets/icon.jpg")} resizeMode="contain" style={{ flex: 1 }} />
        </View>
        <View ai>
            <Text b s={16} mb={15} w={300} center t={"we_will_access_your_location"} />
            <Text b s={16} mb={15} w={300} center t={"see_nearby_garbage_vehicles"} />
            <Touch t={"allow_c"} w={width - 32} br={8} jc onPress={async ()=> {
                let { status } = await Permissions.askAsync(Permissions.LOCATION);
                if(status !== "granted"){
                    return setDataAction({
                        errorModalInfo : {
                            showModal : true,
                            title : "alert_c",
                            message : "please_grant_location_permission"
                        }});
                }
                navigation.navigate(PAGES.NOTIFICATIONS);
            }} s={16} c={Color.themeFontColor} bc={Color.themeColor} />
        </View>
    </View>
}