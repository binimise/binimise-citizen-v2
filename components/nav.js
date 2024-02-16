import React from 'react';
import { Touch, View } from "../ui-kit";
import { Color, PAGES } from '../global/util';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSelector } from 'react-redux';

export default (props) => {
 let _color = props.c || Color.black;
 let { userInfo} = useSelector(state => state.testReducer) || {};
  return (
        <Touch col ai ml={10} pt={2} pb={2} h={36} w={40} br={5}  mb={2} mt={6}
            onPress={()=> {
                if(userInfo?.authUid){
                    if(props?.bText =="gotoComplaints"){
                        props.navigation.navigate(PAGES.COMPLAINT)
                    }else if(props?.bText =="gotoProfile"){
                        props.navigation.navigate(PAGES.PROFILE)
                    }else{
                        props.navigation.openDrawer();
                    }
                }else{
                    console.log("not open")
                }
                
            }}>
           <Icon size={28}
            //    name={props.type== "home" ?"bars":"angle-left"}
                name={"bars"}
               color={_color} /> 
        </Touch>
    );
}