import React, { useEffect, useState } from "react";
import { Dimensions, Image, Share} from "react-native";
import { View, Text,Touch} from "./../ui-kit";
import {Color,APP_CONFIG} from "./../global/util";
let { width, height } = Dimensions.get("window");

export default PhoneVerification = ({ navigation }) => {

  let _message = "Hey, I'm using Swacch Deoghar Citizen application.This application helps us to keep our city clean. You can also Download this application from google play store  https://play.google.com/store/apps/details?id=com.deoghar"

  const onShare = async () => {
    try {
      const result = await Share.share({
        message:_message
        
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };



  return (
    <View  h={height} w={width} c={"#ffffff"}>
      <View h={150} mt={"10%"}>
        <Image source={require("./../assets/icon.jpg")} resizeMode="contain"
          style={{flex:1,alignSelf:"center" }}
        />
      </View>
      <Text t={APP_CONFIG.MUNICIPALITY_NAME} b c={Color.themeColor} s={18} center/>
      <Text t={"municipal_corporation"} s={10} center/>
      <Touch ai jc h={40} br={4} style={{alignSelf:"center"}}
        c={Color.themeFontColor} bc={Color.themeColor} mt={10}
        w={"40%"}  onPress={() => {onShare()}}  s={20} t={"share app"}
      />

      <View w={width} style={{position: 'absolute',bottom: 0}}>
        <Image
          source={require("./../assets/undraw.png")}
          style={{width:"100%",position: 'absolute',bottom: 0 }}
        />
          <Text t={"Powered by"} s={12} b style={{left:"44%",top:26}}/>
          <Image source={require("./../assets/binimiselogo.png")} style={{left:"36%"}}/>
      </View>
    </View>
  );
};