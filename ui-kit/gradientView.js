import React from 'react';
import View from "./view";
import { Color } from '../global/util';

export default props => {

    let {w, h, flex, v, jc} = props;
    return (
            <View h={36} w={'100%'} c={Color.themeColor} jc ai>
                {props.children}
            </View>
    );
  }
