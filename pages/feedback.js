import React, { useState, useEffect,useReducer }  from 'react';
import lang from "./../localize";
import {Dimensions,StyleSheet,TouchableOpacity,Alert} from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "../redux/action";
import { View, Text, Touch,TextInput } from "../ui-kit";
import Header from "../components/header";
import { Color} from '../global/util';
import { addFeedbackData} from "./../repo/repo";
let {width } = Dimensions.get("window");
const Array = [
	{
		key: 'yes',
		text: 'Yes',
	},
	{
		key: 'no',
		text: 'No',
	}
	
];

const showFeedbackQuestions = (value,setValue,text) => {
    return(
        <View  ph={16} bw={1} pv={8} bc={Color.lightGrayColor}>
            <Text s={14} c={Color.black} mb={10} t={text} />
            {Array.map(res => {
                return (
                    <View key={res.key} row>
                        <TouchableOpacity
                            style = {styles.radioCircle}
                            onPress={() => {setValue(res.key)}}>
                            {value === res.key && <View style={styles.selectedRb} />}
                        </TouchableOpacity>
                        <Text mt={4} ml={2} s={14} t={[res.text]} />
                    </View>
                );
            })}
        </View>
    )
}

export default ({ navigation }) => {
    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    const[value1,setValue1] = useState("no");
    const[value2,setValue2] = useState("no");
    const[value3,setValue3] = useState("no");
    const[value4,setValue4] = useState("no");
    const[number,setNumber] = useState("");
    let { userInfo } = useSelector(state => state.testReducer) || {};
    let selectedLanguage = useSelector(state => state.testReducer.selectedLanguage) || "en";     
  
    const showErrorModal = (message,title) => {
        setDataAction({
          errorModalInfo: {
            showModal: true,
            message,
            title
          },
        });
    };
    
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
                municipality :"buguda",
                areaCode :userInfo.areaCode,
                authUid:userInfo.authUid,
                address:userInfo.address,
                feedbackArray:_feedbackArray,
                createdTime:new Date()
            }
            
            await addFeedbackData(f_obj);
            setValue1("no");
            setValue2("no");
            setValue3("no");
            setValue4("no");
            setNumber("");
            toggleLoading(false);
            showErrorModal("your_feedback_submitted","dear_user")
            
        } catch(err){
            console.log(err);
        }
    }
    
    return (
        <View bc={Color.lightGrayColor}>
            <Header navigation={navigation} headerText={"feedback"} />

            {
                showFeedbackQuestions(value1,setValue1,["segregated_waste_throw"])
            }

            {
               showFeedbackQuestions(value2,setValue2,["searching_nearest_publicToilet"])
            }

            {
               showFeedbackQuestions(value3,setValue3,["neighbourhood_area"])
            }
            {
               showFeedbackQuestions(value4,setValue4,["home_composting"])
            }

            <View ph={16} bw={1}   pv={8} bc={Color.lightGrayColor}>
                <Text s={14}  mb={10} t={["your_age"]} />
                <View br={4} bc={Color.lightGrayColor} bw={1} pt={4} pb={4} mb={8}>
                    <Text s={12} ml={16} c={Color.lightGrayColor} t={"age"} />
                    <TextInput ml nl={4}  pl={16} h={24}
                       onChangeText={ (field, value)=>setNumber(value)}
                       value={number}
                    /> 
                </View>
            
            </View>
            <View row>
                <Touch ai jc h={48} br={4} w={width} onPress={updateUserFeedback}
                        s={16} c={Color.themeFontColor} bc={Color.themeColor} b t={"submit"} />
            </View>
           
           
        </View>
    );
}
const styles = StyleSheet.create({
	
	radioCircle: {
        marginTop: 4,
		height: 20,
		width: 20,
		borderRadius: 70,
		borderWidth: 2,
		borderColor: '#808080',
		alignItems: 'center',
		justifyContent: 'center',
	},
	selectedRb: {
		width: 10,
		height: 10,
		borderRadius: 50,
		backgroundColor: '#808080',
    }
   
});