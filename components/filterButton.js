import React, { useState }  from 'react';
import { Text, Touch } from "../ui-kit";
import Icon from 'react-native-vector-icons/FontAwesome';

export default props => {
    return <Touch w={60} h={32} row jc ai br={4} boc={props.color} bw={1} pv={2} onPress={props.onPress}>
            <Icon size={16}
                name={"filter"}
                color={props.color} />
            <Text c={props.color} ml={2} s={14} t={'filter_c'} />
        </Touch>
}