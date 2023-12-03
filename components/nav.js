import React from 'react';
import { Touch, View } from "../ui-kit";
import { Color, PAGES } from '../global/util';
import Icon from 'react-native-vector-icons/FontAwesome';

export default (props) => {
 let _color = props.c || Color.black;
  
  return (
        <Touch col ai ml={10} pt={2} pb={2} h={36} w={40} br={5}  mb={2} mt={6}
            onPress={()=> {
                if(props?.bText =="gotoComplaints"){
                    props.navigation.navigate(PAGES.COMPLAINT)
                }else if(props?.bText =="gotoProfile"){
                    props.navigation.navigate(PAGES.PROFILE)
                }else{
                    props.navigation.openDrawer();
                }
            }}>
           <Icon size={28}
               name={props.type== "home" ?"bars":"angle-left"}
               color={_color} /> 
        </Touch>
    );
}