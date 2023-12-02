import React  from 'react';
import { Dimensions } from "react-native";
import { Color } from "../global/util";
import { setData } from "../redux/action";
import { Text, View, Touch } from "./../ui-kit";
import { useSelector, useDispatch } from "react-redux";

let { width, height } = Dimensions.get('window');

export default () => {

    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));

    let confirmModalInfo = useSelector(state => state.testReducer.confirmModalInfo) || {};
    if(!confirmModalInfo.showModal)
        return null;
    confirmModalInfo.title = confirmModalInfo.title || "please_confirm";
    confirmModalInfo.message = confirmModalInfo.message;
    confirmModalInfo.primaryText = confirmModalInfo.primaryText || "confirm";
    confirmModalInfo.primaryAction = confirmModalInfo.primaryAction ? confirmModalInfo.primaryAction : () => setDataAction({ confirmModalInfo: { showModal : false }});
    confirmModalInfo.secondaryText = confirmModalInfo.secondaryText || "cancel";
    confirmModalInfo.secondaryAction = confirmModalInfo.secondaryAction ? confirmModalInfo.secondaryAction : () => setDataAction({ confirmModalInfo: { showModal : false }});
    return (
        <View a jc ai zi={999} to={0} le={0} h={height} w={width}>
            <View w={width - 48} br={8} c={'white'} jc pa={16} bw={1} bc={Color.themeColor}>
                <Text s={18} b center t={ confirmModalInfo.title } />
                {
                    confirmModalInfo.message ? <Text s={16} center mt={10} t={confirmModalInfo.message} /> : null
                }
                <View row mt={20} mb={5}>
                    <Touch fl={1} jc  h={36} w={'100%'} br={4} mr={8} bc={Color.themeColor}
                         s={14} c={Color.themeFontColor} center t={ confirmModalInfo.primaryText }
                        onPress={confirmModalInfo.primaryAction} />
                    <Touch fl={1} jc h={36} w={'100%'} br={4} bw={1}
                        s={14} c={Color.black} center t={ confirmModalInfo.secondaryText }
                        onPress={confirmModalInfo.secondaryAction} />
                </View>
            </View>
        </View>
    );
}