import React from 'react';
import { View } from 'react-native';

export default (props) => {
    let { c, a, row, jc, ai, h, w, pv, style, mh, le, mv, bo, ri, to, fl, mt, mb, ml, mr, ma, pl, pr, pt, pb, ph, zi, pa, br, bw, bc, ...rest} = props

    let st = { 
        ...{
          position : a ? 'absolute' : undefined, 
          backgroundColor : c,
          flexDirection : row ? "row" : "column",
          justifyContent : jc ? "center" : undefined,
          alignItems : ai ? "center" : undefined,
          height : h ? h : undefined,
          width : w ? w : undefined,
          flex : fl ? fl : undefined,
          left : le ? le : undefined,
          bottom : bo ? bo : undefined,
          right : ri ? ri : undefined,
          top : to ? to : undefined,
          marginTop : mt ? mt : undefined,
          marginBottom : mb ? mb : undefined,
          marginLeft : ml ? ml : undefined,
          marginRight : mr ? mr : undefined,
          marginHorizontal : mh ? mh : undefined,
          marginVertical : mv ? mv : undefined,
          margin : ma ? ma : undefined,
          padding : pa ? pa : undefined,
          paddingLeft : pl ? pl : undefined,
          paddingRight : pr ? pr : undefined,
          paddingTop : pt ? pt : undefined,
          paddingBottom : pb ? pb : undefined,
          paddingHorizontal : ph ? ph : undefined,
          paddingVertical : pv ? pv : undefined,
          zIndex : zi ? zi : undefined,
          borderWidth : bw ? bw : undefined,
          borderRadius : br ? br : undefined,
          borderColor : bc ? bc : undefined
        }, ...style};

    return (
      <View {...rest} style={st}>
          {props.children}
      </View>
    );
}