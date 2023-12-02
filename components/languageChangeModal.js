import React  from 'react';
import { Dimensions } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Color } from "../global/util";
import { setData } from "../redux/action";
import { Text, View, Touch } from "./../ui-kit";
import { useSelector, useDispatch } from "react-redux";
import { SELECTEDLANGUAGE, SHOW_LANGUAGE } from "./../global/util";

let { width, height } = Dimensions.get('window');

export default () => {

    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));

    let languageChangeModalInfo = useSelector(state => state.testReducer.languageChangeModalInfo) || {};
    if(!languageChangeModalInfo.showModal)
        return null;

    setLanguage = (lang) => {
        let obj = {};
        obj[SELECTEDLANGUAGE] = lang;
        obj["languageChangeModalInfo"] = {
            showModal : false
        }
        setDataAction(obj);
        AsyncStorage.setItem(SELECTEDLANGUAGE, lang);
    }

    return (
        <View a c={"rgba(52, 52, 52, 0.6)"} jc ai zi={999} to={0} le={0} h={height} w={width}>
            <View w={width - 48} br={8} c={'white'} jc pa={16} bw={1} bc={Color.themeColor}>
                <Text center s={16} b t={"Select Language"} mb={16}/>
                {
                    SHOW_LANGUAGE.filter(item => item.show).map((item, index) => (
                        <Touch key={index} jc ai c={Color.themeFontColor} bc={Color.themeColor} t={item.displayName} mb={16}
                        onPress={() => setLanguage(item.language)} />
                    ))
                }
            </View>
        </View>
    );
}