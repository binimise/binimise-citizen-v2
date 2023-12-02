import React  from 'react';
import { Dimensions } from "react-native";
import { Color } from "./../global/util";
import { View } from "./../ui-kit";

const { width, height } = Dimensions.get('window');

export default props => {

    return (
            <View a c={Color.backgroundModalColor} jc ai zi={999} to={0} le={0} h={height} w={width}>
                <View w={width - 48} br={8} c={Color.white} jc pa={16}>
                    { props.children }
                </View>
            </View>
        );
}