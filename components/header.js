import React from 'react';
import { Dimensions } from "react-native";
import { View, Text, Touch } from "./../ui-kit";
import { Color,PAGES } from '../global/util';
import Nav from "./nav";
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');  

export default props => {
    let { userInfo} = useSelector(state => state.testReducer) || {};
    return (
        <View w={width} c={props.headerText.length>0?"#009900":"white"} row ai h={60} style={{justifyContent: "space-between"}}>
            <View row ai>
                <Nav c={props.headerText.length>0?"white":"#009900"} bText={props.b_Text} navigation={props.navigation} type={props.type}/>
                <Text c={"white"} s={18} t={props.headerText} b />
               
            </View>
            
            {
               props.searchbar ? props.searchbar() : null
            }
            {
                props.calendarIcon? props.calendarIcon() : null
            }
            {
                props.filter ? props.filter() : null
            }
            {
                props.editIcon ? props.editIcon() : null
            }
            {
                props.picture ? props.picture() :
                    userInfo?.authUid ?
                        <Icon size={28}
                            name={"home"}
                            color={"white"}
                            onPress={() => { props.navigation.navigate(PAGES.HOME) }}
                            style={{ position: "absolute", right: "6%" }} /> : null
            }
            
            
            
            {/* {
                props.history? props.history() : null
            } */}
        </View>
       
    )
}