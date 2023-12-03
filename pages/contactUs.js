import React, { useState,useEffect}  from 'react';
import {ScrollView,Linking,Platform, Image as RNImageView,} from "react-native";
import { useDispatch, useSelector} from 'react-redux';
import { setData } from "../redux/action";
import { View, Text, Touch} from "../ui-kit";
import Header from "../components/header";
import { Color} from '../global/util';
import {getAppSettings,getManagerDetails } from "./../repo/repo";
import IconF from 'react-native-vector-icons/FontAwesome5';
import Icon from 'react-native-vector-icons/FontAwesome';
import email from 'react-native-email';
import { openComposer,openInbox } from "react-native-email-link";
import { useFocusEffect } from '@react-navigation/native';



export default ({ navigation }) => {

    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    const [isHideOtherNumbers,setIsHideOtherNumbers] = useState(true);
    const [isHideWardDetails,setIsHideWardDetails] = useState(true);
    const [contactNumbers,setContactNumbers] = useState([]);
    const [otherNumbers,setOtherNumbers] = useState([]);
    const [wardDetails,setWardDetails] = useState([]);
    const [wardImage,setWardImage] = useState("")
    const [muncipalOfcNum,setMuncipalOfcNum] = useState("");
    const [muncipalOfcMails,setMuncipalOfcMails] = useState([]);
    let {userInfo,selectedLanguage} = useSelector(state => state.testReducer) || {};

    useEffect(() => {
        getContactDetailsFromSettings();
        // getWardMangerDetails()
    }, []);

    // useFocusEffect(
    //     React.useCallback(() => {
    //         // getWardMangerDetails();
    //     }, [])
    // );


    const getWardMangerDetails = async()=>{
        let data = await getManagerDetails(userInfo.ward);
        setWardDetails(data?data.details:[]);
        setWardImage(data?data.image:"")
    }

    const getContactDetailsFromSettings = async ()=>{
        let local_val = await getAppSettings();
        setContactNumbers(local_val?.contacts||[]);
        setOtherNumbers(local_val?.otherContacts||[]);
        setMuncipalOfcNum(local_val?.muncipalOfficeNum||"");
        setMuncipalOfcMails(local_val?.muncipalOfficeMails||"")
    }

    const showHideNumber =(fun,text)=>{
        return(
            <Touch ml={20}  bc={"#F8F8F8"}  h={40} br={2} bw={2} w={"90%"}   boc={"#F0F0F0"}
                   onPress={() =>{fun(false)}}
            >
                <View row mt={6} ml={10}>
                    <Text c={Color.themeColor}  s={14}  b lh={18}   t={text}/>
                    <IconF 
                        size={24}
                        style={{position:"absolute",right:8}}
                        name={"angle-down"}
                        color={"green"} 
                    /> 
                </View>
            </Touch>
        )
    }

    const hideShownData =(fun,text)=>{
        return(
            <Touch  h={40}  onPress={() =>{fun(true)}}>
                <View row mt={6} ml={10}>
                    <Text c={Color.themeColor}  s={14}  b lh={18}   t={text}/>
                    <IconF 
                        size={24}
                        style={{position:"absolute",right:8}}
                        name={"angle-up"}
                        color={"green"} 
                    /> 
                </View>
           </Touch>
        )
    }

    const dialCall = (touchedNum) =>{
     console.log("t",touchedNum)
        let phoneNumber = '';

        if (Platform.OS === 'android') {
          phoneNumber = 'tel:$'+touchedNum;
        }
        else {
          phoneNumber = 'telprompt:$'+touchedNum;
        }
    
        Linking.openURL(phoneNumber);
      };
    
  
    // conso
      handleEmail = () => {
        email(muncipalOfcMails, {
            // Optional additional arguments
            // cc: ['bazzy@moo.com', 'doooo@daaa.com'], // string or array of email addresses
            // bcc: 'mee@mee.com', // string or array of email addresses
            // subject: 'Show how to use',
            // body: 'Some body right here',
            checkCanOpen: false // Call Linking.canOpenURL prior to Linking.openURL
        }).catch(console.error)
        
    }

    handleEmail1 = () => {
        openInbox({
            to: "support@example.com",
            subject: "I have a question",
            body: "Hi, can you help me with...",
          });
      
    }

    return <ScrollView showsVerticalScrollIndicator={false} backgroundColor={"#fbfbfb"}>
            <Header navigation={navigation} headerText={"contact_us"}/>
            <View row mt={20} w={"90%"} mh={"5%"}
                style={{display:"flex",flexWrap: 'wrap',justifyContent:"space-between"}}
            >
                {contactNumbers!=undefined&&contactNumbers.length>0&&
                    contactNumbers.map((each,index)=>{
                    return(
                        <Touch h={58} br={4} w={"48%"} mb={"2%"} bw={2} boc={"#F0F0F0"} bc={"#F8F8F8"}
                           onPress={() => {dialCall(each.phoneNumber)}} key={index}
                        >   
                            <Text t={each.name} c={"#000000"} ml={4} to={3} b/>
                            <View row ai mt={8} ml={4}>
                               <Text s={16} c={"#007235"} u t={each.phoneNumber} ml={4}/>
                               <Icon 
                                    size={20}
                                    name={"phone"}
                                    color={"green"}
                                    style={{position:"absolute",right:4}}
                                /> 
                            </View>
                            
                        </Touch>
                    )
                })}
            </View>
            <View ml={20} mt={20}  bw={1} w={"90%"} mb={20}  bc={"#CCCCCC"}/>
            
            {isHideOtherNumbers?
                showHideNumber(setIsHideOtherNumbers,"other_num"):
                <View br={4} bw={2} w={"90%"} ml={20} bc={"#F0F0F0"} c={"#F8F8F8"}>
                    {
                        hideShownData(setIsHideOtherNumbers,"other_num")
                    }

                    {otherNumbers!=undefined&&otherNumbers.length>0&&
                    otherNumbers.map((each,index)=>{
                        return <Touch row mt={6}  h={20} key={index}onPress={() => {dialCall(each.phoneNumber)}}>
                                <View row fl={1}>
                                    <Text s={14} c={"#000000"} t={each.name} lh={18} ml={9} b/>
                                </View>
                                <View row fl={1}>
                                    <Text s={14} t={" :"+each.phoneNumber}/>
                                </View>
                            </Touch>
                        
                    })}
                    <View h={40}/>
                </View> 
            }
          
          
            {/* <View mt={20}>
                {isHideWardDetails ?
                showHideNumber(setIsHideWardDetails,"ward_d"):
                <View br={4}  bw= {2} w={"90%"} mh={"5%"}  bc={"#F0F0F0"} c={"#F8F8F8"}>
                    {
                        hideShownData(setIsHideWardDetails,"ward_d")
                    }
                    { wardImage?
                        <RNImageView 
                            source={{ uri: wardImage }} 
                            resizeMode="cover" 
                            style={{ height: 150, width: "90%",marginHorizontal:"5%",borderWidth:1 }} 
                        /> :null
                    }
                    
                    
                    {wardDetails!=undefined&&wardDetails.length>0&&
                    wardDetails.map((each,index)=>{
                        return(
                            <Touch row mt={6} h={20} key={index} w={"90%"} mh={"5%"}
                              onPress={() => {dialCall(each.phoneNumber)}}
                            >
                                <Text s={14} c={"#000000"} t={each?.name?.[selectedLanguage]} b/>
                                <Text s={14} t={" :"+each.phoneNumber}/>
                           </Touch>
                        )
                    })}
                    <View h={40}/>
                </View>
            }
            </View> */}
            <Touch jc h={48} br={4} mt={46} mh={"5%"} w={"90%"}
                onPress={() => {dialCall(muncipalOfcNum)}}
                c={Color.themeFontColor} bc={Color.themeColor}  
            >
                <Text b t={(selectedLanguage == "en"?"Call NAC helpline":"एनएसी हेल्पलाइन पर कॉल करें")+"  "+" :"+" "+muncipalOfcNum} s={16} c={"white"} le={10}/>
            </Touch>
       </ScrollView>
}
