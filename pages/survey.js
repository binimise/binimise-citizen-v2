import React, { useState, useEffect }  from 'react';
import { FlatList, Dimensions, Image as ImageRNView } from "react-native";
import { setData } from "../redux/action";
import { View, Text, Touch, Loading, Image, TextInput } from "../ui-kit";
import Header from "../components/header";
import { useDispatch, useSelector } from 'react-redux';
import { Color } from "./../global/util";
let { height, width } = Dimensions.get("window");

export default ({ navigation }) =>{
    let { userInfo } = useSelector(state => state.testReducer) || {};
  return(
        <View>
            <Header navigation={navigation} headerText={"survey"} />
            {userInfo.status?
            
            <View ph={16} mb={16} mt={24}>
                <Text s={16} t={["work_in_progress"]} />
            </View>:
            <View a c={Color.backgroundModalColor} jc ai zi={999} to={60} le={0} h={height} w={width}>
                    <View w={width - 48} br={8} c={Color.white} jc pa={2} h={80}>
                        <Text t={"switch_on_duty"} center b pa={10} s={24}/>
                    </View>
                </View>}        
        </View>
)
}