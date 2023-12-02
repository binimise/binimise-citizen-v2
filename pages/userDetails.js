import React, {useState, useEffect, useReducer}  from 'react';
import { ScrollView, KeyboardAvoidingView, Image, Dimensions } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import { View, Text, Touch, TextInput } from "./../ui-kit";
import Header from "../components/header";
import { updateUserData, addUserData, updateUserToken} from "./../repo/repo";
import { Color, PAGES, PHONENUMBER, APP_CONFIG, USERINFO, AUTHUID, TOKEN } from '../global/util';
const width = Math.round(Dimensions.get('window').width);  
const height = Math.round(Dimensions.get('window').height);
import { useIsFocused } from '@react-navigation/native';


export default ({ navigation }) => {
    const [userEditObj, setUserEditObj] = useState({});
    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    let userInfo = useSelector(state => state.testReducer.userInfo) || {};
    const isFocus = useIsFocused();

    useEffect(() => {
        if(isFocus){
            setUserEditObj({...userInfo});
        }
        
    }, [isFocus])

    useEffect(() => {
        setFormPhoneNumber();
    }, [])
   
    setFormPhoneNumber = async () => {
        let phoneNumber = await AsyncStorage.getItem(PHONENUMBER);
        if(phoneNumber) {
            formOnChangeText(PHONENUMBER, phoneNumber);
        }
    }

    const toggleLoading = show => {
      dispatch(setData({"loading": {show}}));
    }
    
    const formOnChangeText = (field, value) => {
        setUserEditObj(Object.assign({}, userEditObj, {[field] : value}));
    }

    const showNonEditableInUserDetails = (text, ph,value) => {
        return (
            <View br={4} bc={Color.lightGrayColor} bw={1} pt={4} pb={4} mb={8}>
                <Text s={12} ml={16}  t={text} b />
                <TextInput ml nl={1} ph={ph} pl={16}
                    value={value} editable={false} 
                    style = {{fontWeight:"bold",color:"black",height:"auto",minHeight:30}}
                />
            </View>
        )
    }

    const getStaffOfSupervisor = () =>{
        const arr = [];
        userEditObj?.saathi_list.length>0&&
            userEditObj.saathi_list.map((eachDoc)=>{
                arr.push(eachDoc.name)
        })
        return arr.length>0?arr.join():""
    }

    
    return <View c={Color.white} w={"100%"} h={"100%"}>
        <Header navigation={navigation} headerText={"userprofile"} />
        
       
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
            <View row ai jc>
                <View bc={Color.black} mt={24} mb={24} h={120} w={120}>
                    <Image source={require("./../assets/icon.jpg")} style={{ flex:1, width: undefined, height: undefined }} />
                </View>
            </View>
            {
                showNonEditableInUserDetails('userId', 'Safai Mitra',userEditObj?.userId)
            }
            {
                showNonEditableInUserDetails('name', 'firstName_lastName',userEditObj?.name)
            }
             {
                showNonEditableInUserDetails('father_name', '',userEditObj?.father_name)
            }
            {
                showNonEditableInUserDetails('phoneNumber', '9954672326', userEditObj?.phoneNumber)
            }
            {
                showNonEditableInUserDetails('area', '', userEditObj?.ward?.join())
            }
            {
                showNonEditableInUserDetails('email', '', userEditObj?.email)
            }
            {
                showNonEditableInUserDetails('address', '',userEditObj?.address)
            }
            {
                showNonEditableInUserDetails('landmark', '',userEditObj?.landmark)
            }
            {
                showNonEditableInUserDetails('status', '', (userEditObj?.isApproved|| false).toString())
            }
            {
                showNonEditableInUserDetails('issupervisor', '', (userEditObj?.isSupervisor||false).toString())
            }
            
            {
                showNonEditableInUserDetails('supervisor_name', '', userEditObj?.supervisor_name|| "admin")
            }

            {
                userEditObj?.isSupervisor&&showNonEditableInUserDetails('staff', '', getStaffOfSupervisor())
            }
            {
                showNonEditableInUserDetails('type', '', userEditObj?.type|| "")
            }
            
            <View mt={10}>
                <Text s={12} c={"black"} t={"image"} b />
                <View bw={1} bs={"dashed"} br={4} s={16} mb={30} h={120} w={'100%'}
                    bc={Color.lightGrayColor} c={Color.backgroundColor}
                >
                    <Image
                        source={userEditObj.imageUrl ? { uri: userEditObj.imageUrl} : require("./../assets-images/image2.jpg")}
                        resizeMode="contain"
                        style={{ width: "100%", height: "100%" }}
                    />
                </View>
            </View>
            <View row mb={16}>
            <Touch ai jc h={48} br={4} onPress={() => {
                        // updateUserInfo();
                        navigation.navigate(PAGES.EDITDETAILS)
                    }}
                    s={16} c={Color.themeFontColor} bc={Color.themeColor} b t={"editprofile"} />
            </View>
        </ScrollView>
        
    </View>
}