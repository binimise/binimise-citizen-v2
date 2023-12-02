import React, {useState, useEffect, useReducer}  from 'react';
import {  Image, StyleSheet } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import { View, Text, Touch} from "./../ui-kit";
import { Color, PAGES} from '../global/util';
import styles from './../styles/styles';



export default ({ navigation }) => {
    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    let userInfo = useSelector(state => state.testReducer.userInfo) || {};
    
   return (
          
        <View style={styles.container}  c={ '#FFFFFF'} >   
      
            <View  mt={115} ml={20}> 
              <Text t={"Congrats!"} c={Color.themeColor} center s={30} />
              <Text  t={userInfo?.authUid?"update_account":"create_account"} s={12} center />
              <View h={200} mt={70}>
                <Image 
                  source={require("./../assets/sucesspageimage.png")} 
                  resizeMode="contain" 
                  style={{ flex: 1}} 
                />
              </View>
              <View row mt={16} ml={12} mr={20}>

                <Touch ai jc h={48} br={4} onPress={() => {navigation.navigate(PAGES.HOME)}}
                    s={16} c={Color.themeFontColor}  bc={Color.themeColor} b t={"Proceed"} 
                />
              </View>
            </View>
        </View> 
    )
}
           
  

