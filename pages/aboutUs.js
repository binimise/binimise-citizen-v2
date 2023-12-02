import React, { useEffect, useState } from "react";
import { Image, ScrollView} from "react-native";
import { useSelector } from "react-redux";
import {View, Text} from "../ui-kit";
import Header from "../components/header";
import { ABOUTUS} from '../global/util';
import {getAppSettings} from "./../repo/repo";

export default ({ navigation }) => {

  const [description,setDescription] = useState("");
  const [officersImages,setOfficersImages] = useState([]);
  let selectedLanguage = useSelector(state => state.testReducer.selectedLanguage) || {};
  

  useEffect(() => {
    getDynamicDataFromSettings(selectedLanguage);
  }, [selectedLanguage]);

  getDynamicDataFromSettings = async (Language)=>{
    let customizedValues = await getAppSettings();
    let local_des = customizedValues.length>0?customizedValues[0].aboutUsSaathiText[selectedLanguage]:""
    let loc_images = customizedValues.length>0?customizedValues[0].aboutUs:[]
     
    setDescription(local_des);
    setOfficersImages(loc_images);

  }
 

  

  return  <ScrollView backgroundColor={"#F8F8F8"}>
            <Header navigation={navigation} headerText={"about_us"} type={"about_us"}/>
            <View mh={"5%"} bw={1} w={"90%"} bc={"#CCCCCC"}/>
            <View  mh={"5%"}  w={"90%"} mt={20}>
              <Text s={14} lh={30} t={description}/>
            </View>
            <View mh={"5%"} w={"90%"} mt={10} bw={1} bc={"#CCCCCC"}/>
            {
              officersImages!=undefined&&officersImages.length>0?
               officersImages.map((eachprofile, index)=>(
                <View w={'90%'} mh={"5%"} mt={10} key={index}>
                  <View row style={{minHeight:120,height:"auto"}}>
                    <View w={"68%"} jc>
                      <Text s={16} b ml={10} t={eachprofile.name[selectedLanguage]+","}/>
                      <Text s={16}  ml={10} t={eachprofile.designation[selectedLanguage]}/>
                    </View>
                    {!eachprofile.image?null:
                      <Image 
                        source={{ uri:eachprofile.image}}
                        style = {{ position:"absolute",right:0,height :"100%",width:"32%",
                          borderRadius:4,borderWidth:1,borderColor:"green"
                        }}
                        resizeMode="contain"
                      />
                    }
                  </View>
                  <View mt={10} bw={1} bc={"#CCCCCC"}/>
                </View>
              )):null
            }
            <View mb={20}/>
  </ScrollView>
}