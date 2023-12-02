import React from 'react';
import { Touch, View } from "../ui-kit";
import { Color , PAGES } from '../global/util';
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "../redux/action";
import DutyStatus from "./../components/dutyStatus";
import Icon from 'react-native-vector-icons/FontAwesome';

export default (props) => {

 let color = props.c || Color.black;
 const dispatch = useDispatch();
const setDataAction = (arg) => dispatch(setData(arg));
 let { userInfo } = useSelector(state => state.testReducer) || {};
 
  

  return (
        <Touch col ai ml={16} pt={2} pb={2} mt={8} h={40} w={40} br={5} mr={8} style={{justifyContent: 'space-around'}}
            onPress={props.navigation.openDrawer}>
            <View w={32} h={2} c={color}/>
            <View w={32} h={2} c={color}/>
            <View w={32} h={2} c={color}/>
        </Touch>
    //     <Touch col ai ml={10} pt={2} pb={2} h={36} w={40} br={5}  mb={2} mt={6}
    //     onPress={()=> {
    //         if(props?.bText =="HistoryDetails"){
    //             props.navigation.navigate(PAGES.HISTORY)
    //         }else{
    //             props.navigation.openDrawer();
    //         }
    //     }}>
    //    <Icon size={36}
    //        name={props.type== "Home" ?"bars":"angle-left"}
    //        color={"green"} /> 
    // </Touch>
       
    );
}