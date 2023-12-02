import React from 'react';
import { Text } from 'react-native';
import { Color, APP_INFO } from '../global/util';
import lang from "./../localize";
import { useSelector } from "react-redux";

export default (props) => {
    let {s, a, c, b, t, u, bc, lh, to, ri, mt, mr, ml, mh,mb, w, center, style, ...rest} = props
    c = c || Color.black;

    let selectedLanguage = useSelector(state => state.testReducer.selectedLanguage) || "en";

    let st = { 
      ...{
        color : c,
        fontSize : s,
        lineHeight : lh,
        fontWeight: b ? 'bold' : undefined,
        textAlign : center ? 'center' : undefined,
        marginTop : mt ? mt : undefined,
        marginBottom : mb ? mb : undefined,
        marginRight : mr ? mr : undefined,
        marginHorizontal : mh ? mh : undefined,
        marginLeft : ml ? ml : undefined,
        width : w ? w : undefined,
        top: to ? to : undefined,
        right: ri ? ri : undefined,
        backgroundColor : bc ? bc : undefined,
        position: a ? "absolute" : undefined,
        textDecorationLine: u ? 'underline' : undefined,
      }, ...style};

    if(Array.isArray(t)){
      let str = "";
      for(let index = 0; index < t.length; index++){
        let item = t[index];
        str += (lang[selectedLanguage][item] || (APP_INFO[item] ? APP_INFO[item][selectedLanguage] : undefined) || item);
      }
      t = str;
    }


    return (
      <Text {...rest} style={st}>
          {lang[selectedLanguage][t] || (APP_INFO[t]? APP_INFO[t][selectedLanguage] : undefined) || t}
      </Text>
    );
}