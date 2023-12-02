import React  from 'react';
import { Dimensions, StatusBar } from "react-native";
import { Color } from "./../global/util";
import { setData } from "./../redux/action";
import { View, Text, Touch } from "./../ui-kit";
import { useSelector, useDispatch } from "react-redux";

const { width, height } = Dimensions.get('window');

export default () => {

        const dispatch = useDispatch();
        const setDataAction = (arg) => dispatch(setData(arg));

        let errorModalInfo = useSelector(state => state.testReducer.errorModalInfo) || {};
        if(!errorModalInfo.showModal)
            return null;
        errorModalInfo.title = errorModalInfo.title || "alert_c";
        errorModalInfo.message = errorModalInfo.message || "";
        errorModalInfo.buttonText = errorModalInfo.buttonText || "ok_c";
        errorModalInfo.onClose = errorModalInfo.onClose ? errorModalInfo.onClose : () => setDataAction({ errorModalInfo: { showModal : false }});
        return (
            <View a c={Color.backgroundModalColor} jc ai zi={999} to={0} le={0} h={height} w={width}>
                <View w={width - 48} br={8} c={Color.white} jc pa={16}>
                    <Text center s={18} b t={errorModalInfo.title} />
                    <Text center s={16} mt={10} t={ errorModalInfo.message } />
                    <Touch mt={20} mb={5} h={36} w={'100%'} br={4} jc
                        onPress={errorModalInfo.onClose} bc={Color.themeColor}
                        s={14} c={Color.white} t={ errorModalInfo.buttonText } />
                </View>
            </View>
        );
}