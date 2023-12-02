import React from 'react';
import { TextInput } from 'react-native';
import lang from "./../localize";
import { useSelector, useDispatch } from "react-redux";

export default (props) => {
  let { ml, s, maxLength, mb, w, center, bbc, br, bc, bbw, nl, uc, pt, pl, pho, ph, h, mt, pb, style, name, value, k, onChangeText, ...rest} = props;

  let selectedLanguage = useSelector(state => state.testReducer.selectedLanguage) || "en";

  let st = { 
    ...{
      paddingLeft : pl ? pl : undefined,
      height : h ? h : undefined,
      marginTop : mt ? mt : undefined,
      marginBottom : mb ? mb : undefined,
      paddingBottom : pb ? pb : undefined,
      paddingTop : pt ? pt : undefined,
      paddingHorizontal : pho ? pho : undefined,
      fontSize : s ? s : undefined,
      borderBottomColor : bbc ? bbc : undefined,
      borderBottomWidth : bbw ? bbw : undefined,
      backgroundColor : bc ? bc : undefined,
      textAlign : center ? "center" : undefined,
      borderRadius : br ? br : undefined,
      width : w ? w : undefined,
    }, ...style};

  let placeholder = lang[selectedLanguage][ph] || ph;
  return (
    <TextInput  
      maxLength={ maxLength ? maxLength : undefined}
      multiline = {ml ? ml : undefined}
      numberOfLines={nl ? nl : undefined}
      underlineColorAndroid={uc ? uc : undefined}
      style={st}
      keyboardType={k ? k : undefined}
      placeholder={placeholder ? placeholder : undefined}
      onChangeText={text => onChangeText ? onChangeText(name, text) : null}
      value={value}  {...rest} />
  );
}