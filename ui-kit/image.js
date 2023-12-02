import React from 'react';
import { Image } from 'react-native';
import Touch from "./touch";

export default (props) => {
    let { t, w, h, a, r, br, style, uri, onPress, ...rest} = props

    let st = { 
      ...{
        width : w ? w : undefined,
        height : h ? h : undefined,
        position : a ? 'absolute' : undefined,
        top : t ? t : undefined,
        right : r ? r : undefined,
        borderRadius : br ? br : undefined
      }, ...style};

    if (onPress) 
      return <Touch a w={w} h={h} to={t} ri={r} onPress={onPress}>
        <Image {...rest} style={{ width : '100%', height: '100%'}} source={{ uri }} />
      </Touch>

    return (
      <Image {...rest} style={st} source={{ uri }} />
    );
}