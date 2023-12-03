import React, { useState, useRef } from 'react';
import { Dimensions, Image } from 'react-native';
import { useDispatch } from 'react-redux';
import { setData } from "./../redux/action";
import Header from "../components/header";
import { Touch, TextInput, View, Text} from "./../ui-kit"
import { PHONENUMBER, USERINFO, PAGES, Color, AUTHUID, TOKEN } from "./../global/util"
import firebase from "./../repo/firebase";
import styles from './../styles/styles';
import { getUserData, updateUserToken } from "./../repo/repo";
let { width, height } = Dimensions.get('window');
import IconAnt from 'react-native-vector-icons/AntDesign';


export default PhoneVerification = (props) => {

  let { navigation } = props;
  const dispatch = useDispatch()
  const setDataAction = (arg) => dispatch(setData(arg));

 
 


  return (
    <View style={styles.container} c={'#ffffff'}>
      <Header navigation={navigation} headerText={" New Booking"} />
                 <View   bw={1} w={"90%"}   bc={"#CCCCCC"} mb={40}/>
     
        <IconAnt size={60}
                color={"green"}
                name={"checkcircle"}
                style={{marginBottom:20}}
                onPress={()=>{setImageModal(false)}}  />
     
      <Text t={"Payment Done"} c={Color.themeColor}  s={18} center/>
      <Text t={"The transaction made by you is sucessfully completed"} s={14}  center/>
      <View mt={20}  c={"#fbfbfb"} w={"90%"} h={170}>
                <View  row pt={8}>
                 <Text s={14} le={8} c={"#000000"} t={"Amount"}   />
                 <Text s={14}  c={"#000000"} t={":"} to={8}  a ri={200}  />
                 <Text s={14}   a  ri={10} to={8} t={props?.route?.params?.amount}  />
                </View>
                <View  row  mt={8}>
                 <Text s={14} le={8} c={"#000000"} t={"Mobile Number"}   />
                 <Text s={14}  c={"#000000"} t={":"}  a ri={200} />
                 <Text s={14}   a ri={10} t={props?.route?.params?.mobileNumber}  />
                </View>
                <View  row  mt={8}>
                 <Text s={14} le={8} c={"#000000"} t={"Order ID"}   />
                 <Text s={14}  c={"#000000"} t={":"}  a ri={200}  />
                 <Text s={14}    a  ri={10}  t={"12345612347655378"}  />
                </View>
                <View  row  mt={8}>
                 <Text s={14} le={8} c={"#000000"} t={"Date & Time"}   />
                 <Text s={14}  c={"#000000"} t={":"}  a ri={200}  />
                 <Text s={14}   a  ri={10}   t={props?.route?.params?.date}  />
                </View>
                <View  row  mt={8}>
                 <Text s={14} le={8} c={"#000000"} t={"Payment Method"}   />
                 <Text s={14}  c={"#000000"} t={":"}  a ri={200}  />
                 <Text s={14}   a  ri={10}  t={"UPI"}  />
                </View>
               
                 
                
     </View>
     <View  mt={20} w={"90%"} >
     <Touch ai jc h={48} br={4}   onPress={() => {
                  navigation.navigate(PAGES.PAYMENTRECEIPT)
              }}
              s={16} c={Color.themeFontColor} bc={Color.themeColor} b t={"Download Receipt"} />
              
     </View>

           
       
      
      
    </View>
  );
};