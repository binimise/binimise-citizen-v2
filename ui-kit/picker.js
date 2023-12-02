import React from 'react';
// import { Picker } from 'react-native';
// import {Picker} from '@react-native-picker/picker';
import lang from "./../localize";
import { useSelector } from "react-redux";

export default props => {
    let {s, c, b, t, lh, mt, ml, mb, center, h, w, style, items, onValueChange, selectedValue, ...rest} = props;

    let selectedLanguage = useSelector(state => state.testReducer.selectedLanguage) || "en";

    let st = { 
      ...{
        height : h ? h : 50,
        width : w ? w : '100%'
      }, ...style};


    
    _getLabel = item => {
      if(item?.id.includes("ward ")){
        return lang[selectedLanguage]["ward"] + item.id.replace("ward", "");
      }
      return lang[selectedLanguage][item.id] || item.name
    }

    return (
            <Picker
                selectedValue={selectedValue}
                style={st}
                onValueChange={(item, index) => onValueChange(item, index)}
            >
                {
                    items.
                        map((item, index) => <Picker.Item  itemStyle={{fontSize: 12}} key={index} label={_getLabel(item)} value={item.name} />)
                }
            </Picker>
    );
}