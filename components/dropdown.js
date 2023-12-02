import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Styles from '../styles/styles';


const attendedYesOrNo = [
    { label:"All",value:"All"},
    { label:"Attended",value:"Attended"},
    { label:"Not Attended",value:"Not Attended"}
]

export default (props) =>{
  const [value, setValue] = useState("All");
  const [isFocus, setIsFocus] = useState(false);



  return (
      <Dropdown
        style = {Styles.dropdown}
        placeholderStyle={Styles.placeholderStyle}
        selectedTextStyle={Styles.selectedTextStyle}
        inputSearchStyle={Styles.inputSearchStyle}
        data={attendedYesOrNo}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder="Select item"
        searchPlaceholder="Search..."
        value={value}
        onChange={item => {
          setValue(item.value);
          props?.valueFromdropdown(item.value)
        }}
      />
  );
};

