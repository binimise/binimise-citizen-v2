import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Color } from '../global/util';
import View from "./view";
import Text from "./text";

export default props => {
    let {s, c, b, t, lh, mt, ml, mb, center, style, ...rest} = props
    c = c || Color.black;

    let st = { 
      ...{
        color : c,
        fontSize : s,
        lineHeight : lh,
        fontWeight: b ? 'bold' : undefined,
        textAlign : center ? 'center' : undefined,
        marginTop : mt ? mt : undefined,
        marginBottom : mb ? mb : undefined,
        marginLeft : ml ? ml : undefined,
      }, ...style};

    if(!props.isLoading) return false;

    return (
      <View jc ai {...rest} style={st} pt={16}>
          <ActivityIndicator size="large" color={Color.themeColor} />
          {
            props.loadingText ? <Text t={props.loadingText} mt={16} /> : null
          }
      </View>
    );
}