import React from 'react';
import Text from "./text";
import { TouchableOpacity } from 'react-native';

export default (props) => {
    let {c, h, r, g, t, b, w, a, s, u, gc, center, row, jc, ai,mv, style, bc, boc, bw, br, le, bo, ri, to, ph, mt,mh, mb, ml, mr, pl, pr, pt, fl, pb, pa, ...rest } = props
    c = c || "#4a4a4a";

    let st = { 
        ...{
            flexDirection : row ? "row" : "column",
            position: a ? 'absolute': undefined,
            height : h || 48,
            justifyContent : jc ? 'center' : undefined,
            alignItems : ai ? 'center' : undefined,
            width : w || '100%',
            backgroundColor : bc ? bc : undefined,
            borderWidth : bw ? bw : undefined,
            borderColor : boc ? boc : undefined,
            borderRadius : br ? br : undefined,
            left : le ? le : undefined,
            bottom : bo ? bo : undefined,
            right : ri ? ri : undefined,
            top : to ? to : undefined,
            padding : pa ? pa : undefined,
            paddingHorizontal : ph ? ph : undefined,
            marginTop : mt ? mt : undefined,
            marginBottom : mb ? mb : undefined,
            marginLeft : ml ? ml : undefined,
            marginRight : mr ? mr : undefined,
            paddingLeft : pl ? pl : undefined,
            marginHorizontal : mh ? mh : undefined,
            marginVertical : mv ? mv :undefined,
            paddingRight : pr ? pr : undefined,
            paddingTop : pt ? pt : undefined,
            paddingBottom : pb ? pb : undefined,
            flex : fl ? fl : undefined
        }, ...style};

        return (
            <TouchableOpacity
                {...rest} style={st}
                onPress={props.onPress}
            >
                { t ? <Text w={"100%"}  s={s} c={c} b t={t} center/> : null }
                { props.children }
            </TouchableOpacity>
        )
}