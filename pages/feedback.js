import React, { useState, useEffect,useReducer }  from 'react';
import lang from "./../localize";
import {Dimensions,StyleSheet,TouchableOpacity,Alert,BackHandler, KeyboardAvoidingView,ScrollView} from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "../redux/action";
import { View, Text, Touch,TextInput } from "../ui-kit";
import Header from "../components/header";
import { APP_CONFIG, Color,PAGES} from '../global/util';
import { addFeedbackData} from "./../repo/repo";
import { useNavigationState } from '@react-navigation/native';
let {width } = Dimensions.get("window");
import Styles from '../styles/styles';
const Array = [
	{en: 'Yes',hn:"हाँ",or:"ହଁ"},
	{en: 'No',hn:"नहीं",or:"ନା"}
];



export default ({ navigation }) => {
    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    const[value1,setValue1] = useState("");
    const[value2,setValue2] = useState("");
    const[value3,setValue3] = useState("");
    const[value4,setValue4] = useState("");
    const[number,setNumber] = useState("");
    const navigationValue = useNavigationState(state => state);
    const routeName = (navigationValue.routeNames[navigationValue.index]);
    let { userInfo } = useSelector(state => state.testReducer) || {};
    let selectedLanguage = useSelector(state => state.testReducer.selectedLanguage) || "en";   
    
    const showFeedbackQuestions = (value,setValue,text) => {
        return(
            // <View  ph={16} bw={1} pv={8} bc={Color.lightGrayColor} w={"100%"}>
            <View style = {Styles.feedBackView} mb={5}> 
                <Text s={14} c={Color.black} mb={5} t={text} />
                {Array.map((res,index) => {
                    let selectedTxt = res[selectedLanguage];
                    return (
                        <View key={index} row>
                            <TouchableOpacity
                                style = {Styles.radioCircle}
                                onPress={() => {setValue(selectedTxt)}}>
                                {value === selectedTxt && <View style={Styles.selectedRb} />}
                            </TouchableOpacity>
                            <Text mt={4} ml={2} s={14} t={selectedTxt} />
                        </View>
                    );
                })}
            </View>
        )
    }
    
    const showErrorModal = (message,title) => {
        setDataAction({
          errorModalInfo: {
            showModal: true,
            message,
            title
          },
        });
    };

    useEffect(() => {
        if(routeName === PAGES.FEEDBACK){
          const backAction = () => {
            navigation.navigate(PAGES.HOME);
            return true;
          };
          const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
          );
          return () => backHandler.remove();
        }
      });
    
    const toggleLoading = show => {
        setDataAction({"loading": {show}});
    }

    const _updatedata=(data)=>{
        data.question = lang[selectedLanguage][data.question]
        return data;
    }

    const updateUserFeedback = async () => {
        try {
            toggleLoading(true);
            let _feedbackArray = [];
            if(!value1 || !value2 || !value3 || !value4){
                toggleLoading(false);
                return  showErrorModal("please_select_all","dear_user");
            }
            if(!number){
                toggleLoading(false);
                return  showErrorModal("please_enter_age","dear_user");
            }
            let arr=[{question:"segregated_waste_throw",val:value1},
                     {question:"searching_nearest_publicToilet",val:value2},
                     {question:"neighbourhood_area",val:value3},
                     {question:"home_composting",val:value4},
                     {question:"your_age",val:number}
                ]
    
            for(let i=0;i<arr.length;i++){
                    let updateddata= _updatedata(arr[i])
                    _feedbackArray.push(updateddata)
            }
            let f_obj={
                name:userInfo.name,
                phoneNumber:userInfo.phoneNumber,
                municipality : APP_CONFIG.MUNICIPALITY_NAME_Ch,
                areaCode :userInfo.areaCode,
                authUid:userInfo.authUid,
                address:userInfo.address,
                feedbackArray:_feedbackArray,
                createdTime:new Date()
            }
            
            await addFeedbackData(f_obj);
            setValue1("");
            setValue2("");
            setValue3("");
            setValue4("");
            setNumber("");
            toggleLoading(false);
            showErrorModal("your_feedback_submitted","dear_user");
            
        } catch(err){
            console.log(err);
        }
    }

    return <KeyboardAvoidingView enabled
        style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
        behavior={Platform.OS == "ios" ? "padding" : "height"}>
        <Header navigation={navigation} headerText={'feedback'} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: "5%",marginTop:"5%" }}>

            {showFeedbackQuestions(value1, setValue1, ['segregated_waste_throw'])}

            {showFeedbackQuestions(value2, setValue2, ['searching_nearest_publicToilet'])}

            {showFeedbackQuestions(value3, setValue3, ['neighbourhood_area'])}

            {showFeedbackQuestions(value4, setValue4, ['home_composting'])}

            {/* <View ph={16} bw={1} pv={8} bc={Color.lightGrayColor}> */}
            <View style = {Styles.feedBackView} mb={15}>
                <Text s={14} mb={10} t={["your_age"]} />
                <View br={4} bc={Color.lightGrayColor} bw={1} pt={4} pb={4} mb={8}>
                    <Text s={12} ml={16} c={Color.lightGrayColor} t={"age"} />
                    <TextInput ml nl={4} pl={16} h={24}
                        onChangeText={(field, value) => setNumber(value)}
                        value={number} k={"numeric"} maxLength={2}
                    />
                </View>

            </View>
            <View row w={"100%"} mt={10}>
                <Touch ai jc h={48} br={4} w={"100%"} onPress={updateUserFeedback}
                    s={16} c={Color.themeFontColor} bc={Color.themeColor} b t={"submit"} />
            </View>

        </ScrollView>

    </KeyboardAvoidingView>

}
