import React, {useState, useEffect, useReducer}  from 'react';
import { ScrollView, KeyboardAvoidingView,BackHandler } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import { View, Text, Touch, TextInput, Picker } from "./../ui-kit";
import Header from "../components/header";
import { addSuggestion,getAllSuggestions} from "./../repo/repo";
import { Color, PAGES,getCurrentDate } from '../global/util';
import { useFocusEffect } from '@react-navigation/native';


export default ({ navigation }) => {

    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    let { userInfo} = useSelector(state => state.testReducer) || {};
    const [suggestion, setSuggestion] = useState('');
    const [suggestionList,setSuggestionList]= useState([]);  

    const toggleLoading = show => {
        setDataAction({"loading": {show}});
    }

    useEffect(() => {
        _getSuggestions(); 
       
    }, []);

    const _getSuggestions = async () => {
        try{
            toggleLoading(true);
            let suggestion = await getAllSuggestions(userInfo);
            setSuggestionList(suggestion);
            toggleLoading(false);
        }catch(e){
            console.log("e",e)
        }
        
    }
    
    const showErrorModalMsg = (message, title = "message") => {
        setDataAction({ 
            errorModalInfo : {
                showModal : true, title, message
            }
        })
    };

    const updateSuggestion = async () => {   
        try {  
            toggleLoading(true);
            let newSug ={};
            newSug["address"] = userInfo.address || "";
            newSug["areaCode"] = userInfo.areaCode || "";
            newSug["authUid"] = userInfo.authUid;
            newSug["name"] = userInfo.name;
            newSug["phoneNumber"] = userInfo.phoneNumber || "";
            newSug["created_date"] = getCurrentDate();
            newSug["suggestion"] = suggestion;
            if(!suggestion){
                toggleLoading(false);
                return showErrorModalMsg("please_enter_suggerstion");
            }  
            await addSuggestion(newSug);            
            setSuggestion("");
            _getSuggestions();
        } catch(err){
            console.log("err",err)
        }
        
    }
   

    return (
     <KeyboardAvoidingView enabled
        style={{ flex: 1, flexDirection: 'column',justifyContent: 'center',backgroundColor:"white"}}
        behavior={Platform.OS == "ios" ? "padding" : "height"}>    
        <Header navigation={navigation} headerText={"suggestion"} /> 
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
            <Text s={16} b t={"enter_your_suggestion"} mb={16} mt={24} />
            <View br={4} bc={Color.lightGrayColor} bw={1} pt={4} pb={4} mb={8}>
                <Text s={12} ml={16} c={Color.lightGrayColor} t={"suggestion"} />
                <TextInput ml nl={4}  pl={16}
                    onChangeText={ (field, value)=>setSuggestion(value)}
                    value={suggestion}
                />       
            </View>
            <View row mb={16}>
                <Touch ai jc h={48} br={4} onPress={updateSuggestion }    
                    s={16} c={Color.themeFontColor} bc={Color.themeColor} b t={"submit"} />
            </View>
            {
                suggestionList.length>0&&suggestionList.map((item, index) =>{
                    
                    return(  
                            <View key={index}  ph={8} pv={8} mt={8} br={4} bw={1} mr={2} >
                            
                                <View row>
                                    <View row>
                                     <View w={'50%'}>
                                        <Text b t={"suggestion"}  />
                                        <Text t={item.suggestion}  />
                                     </View>
                                     <View w={'50%'} mr={120}>
                                        <Text  b t={"date"} />
                                        <Text t={item.created_date} />
                                     </View>
                                  
                                    </View>
                                </View>
                           </View>
                    )
      
                })
            }
     
        </ScrollView>
    </KeyboardAvoidingView>
    )
}