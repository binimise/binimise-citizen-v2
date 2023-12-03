import React, { useState,useEffect } from 'react';
import { useSelector } from 'react-redux';
import { View,Touch,Text} from "./../ui-kit";
import Icon from 'react-native-vector-icons/FontAwesome';
import { PAGES } from '../global/util';
import { Linking,Dimensions,StyleSheet,BackHandler } from 'react-native';
import { SliderBox } from "react-native-image-slider-box";
import {useNavigationState} from '@react-navigation/native';
let {width,height } = Dimensions.get("window");

export default ({ navigation,route }) => {
  let _selectedCtpt = route?.params?.selectedCtpt || {};
  const navigationValue = useNavigationState(state => state);
  const routeName = (navigationValue.routeNames[navigationValue.index]);
  let userInfo = useSelector(state => state.testReducer.userInfo) || {};

  useEffect(() => {
    if(routeName === PAGES.TOILETDETAILS){
      const backAction = () => {
        navigation.navigate(PAGES.MAPVIEW,{
          Text:"toilets",id:"Toilets"
      })
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );
      return () => backHandler.remove();
    }
  });


  showDetails = (iconName,textvalue,_size) =>{
    return(
      <View row mt={"2%"}>
        <Icon size={_size} name={iconName} style={{alignSelf:"center"}}/> 
        <Text t={textvalue} style={{left:"8%"}} s={16}/>
      </View>
    )
  }
 
  return  <View h={"100%"} w={"100%"} c={"#CCCCCC"}>
    <View style={styles.bottomView}>
      <Text t={_selectedCtpt?.name} center mt={"4%"} s={24} b/>

      <Text t={"address"}  mt={"4%"} s={24} b mh={"5%"}/>
      <View bw={1} bc={"#CCCCCC"} mh={"5%"} w={"90%"}/>
      <View mt={10} w={"90%"} mh={"5%"}>
        {
          showDetails("home",_selectedCtpt.address,24)
        }
        {
          showDetails("phone",_selectedCtpt.contactNo,20)
        }
      </View>

      <Text t={"photos"}  mt={"4%"} s={24} b  mh={"6%"}/>
      <View  bw={1} bc={"#CCCCCC"}  mh={"5%"} w={"90%"}/>
      <View w={width}>
        <SliderBox
          images={_selectedCtpt.imageArr}
          currentImageEmitter={index => console.log(index)}
          sliderBoxHeight={200}
          dotColor="green"
          inactiveDotColor="#90A4AE"
          paginationBoxStyle={styles.paginationStyle}
          ImageComponentStyle={styles.imageStyle}
          dotStyle={styles.boxDotStyle}
        />
      </View>
   
      <Text t={"navigation"}  mt={"4%"} s={24} b mh={"6%"}/>
      <View  bw={1} bc={"#CCCCCC"} mh={"6%"} w={"90%"}/>
      <View row w={"90%"} mh ={"5%"} mt={10}>
        <Touch w={"48%"} h={40} br={8} onPress={()=>{navigation.navigate(PAGES.MAPVIEW,{
                Text:"toilets",id:"Toilets"
            })}} bc={"red"} t={"_close"} jc ai />
        <Touch  w={"48%"} h={40} br={8} onPress={()=>{
          Linking.openURL(`https://www.google.com/maps/dir/?api=1&origin=` +userInfo.lat+`,` + 
          userInfo.long +`&destination=` +_selectedCtpt.lat +`,` +_selectedCtpt.long+`&travelmode=driving`)}}  
          t={"view_n"} jc ai bc={"green"}  ml={"2%"}
        />
      </View>
    </View>
  </View>
}

const styles = StyleSheet.create({
  bottomView: {
      width: '100%',
      height: "90%",
      backgroundColor: '#fbfbfb',
      position: 'absolute', 
      bottom: 0, 
      borderTopLeftRadius:50,
      borderTopRightRadius:50,
      overflow: 'hidden'
  },
  paginationStyle :{
      position: "relative",
      bottom: 0,
      padding: 0,
      alignItems: "center",
      alignSelf: "center",
      justifyContent: "center",
      paddingVertical: 10
  },
  imageStyle :{
    borderRadius: 6, 
    width: '90%', 
    marginTop: "6%",
     
  },
  boxDotStyle: {
    width: 20,
    height: 4,
    borderRadius: 4,
    marginHorizontal: 0,
    padding: 0,
    margin: 0,
    backgroundColor: "rgba(128, 128, 128, 0.92)"
  }
});