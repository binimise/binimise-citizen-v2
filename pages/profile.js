import React, {useState, useEffect, useReducer}  from 'react';
import { ScrollView,Switch, Image,StyleSheet,Dimensions,Alert} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import { View, Text, Touch, TextInput, Picker } from "./../ui-kit";
import { Checkbox } from 'react-native-paper';
import * as Location from 'expo-location';
import { addUserData, getAllAreas, getUserData ,getAppSettings,} from "./../repo/repo";
import { Color, PAGES, PHONENUMBER, APP_CONFIG, USERINFO, AUTHUID, TOKEN } from '../global/util';
import MapView,{Marker} from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconF from 'react-native-vector-icons/FontAwesome5';
import Header from "../components/header";
import { useFocusEffect } from '@react-navigation/native';


const initialState = {
    name : "",
    phoneNumber : "",
    userType : "user",
    areaCode : "",
    municipality : APP_CONFIG.MUNICIPALITY_NAME,
    address : "",
    email:"",
    // houseNo:"",
    
}
  
const reducer = (state, { field, value }) => {
    if(field == USERINFO){
      return {
        ...state,
        ...value
      }
    }
    if(field.includes(".")){
      let field2 = field.split(".")[1];
      let field1 = field.split(".")[0];
      let obj = {};
      obj[field1] = state[field1];
      obj[field1] = { ...obj[field1], [field2]: value };
      obj[field1][field2] = value;
      return {
        ...state,
        ...obj
      }
    }
    return {
      ...state,
      [field]: value
    }
}

export default ({ navigation }) => {

    const [state, dispatchStateAction] = useReducer(reducer, initialState);
    const [region, setRegion] = useState(APP_CONFIG.COORDINATES.coords);
    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    let { userInfo, updateUserInfoFlag,selectedLanguage } = useSelector(state => state.testReducer) || {};
    const [updateLocation, setUpdateLocation] = useState({});
    const [isHideMap, setIsHideMap] = useState(true);
    const [isExpandLocation, setIsExpandLocation] = useState(false);
    const [isExpandAlert, setIsExpandAlert] = useState(false);
    const [isExpandWard, setIsExpandWard] = useState(false);
    const [isExpandAssignedTags, setIsExpandAssignedTags] = useState(false);
    const [isExpandTags, setIsExpandTags] = useState(false);
    const [isExpandBox, setIsExpandBox] = useState(false);
    const[userTags,setUserTags] = useState([]);
    const [_mapType,setMapType] = useState("hybrid");
    
    useFocusEffect(
      React.useCallback(()=>{
        __updateLocationFromDb();
      },[])
    )
    useEffect(() => {
      __updateLocationFromDb();
        if(userInfo?.holdingNo){
            house_no= (selectedLanguage=="en"?"Your Householding Number is":"आपका हाउसहोल्डिंग नंबर है")+"    "+ userInfo.holdingNo
            return showErrorModalMsg(house_no);
        }
    }, []);

    __updateLocationFromDb = () => {
        let obj = { latitude: userInfo?.lat, longitude: userInfo?.long, latitudeDelta: 0.01, longitudeDelta: 0.01};
        setRegion(obj);
    }


    formOnChangeText = (field, value) => {
        dispatchStateAction({ field, value });
    }

    getSignUpView = (text, ph, name, value,keyboardType, maxLength,icon,icontext) => {
      return (
        <View mb={12}>
          <Text s={12} t={text} c={"black"} b/>
          <TextInput ml nl={1} ph={ph} pl={16} h={40} bc={'#FFFFFF'}
            k={keyboardType} maxLength={maxLength} bbc={'#F0F0F0'}
            onChangeText={formOnChangeText} name={name}
             w={'100%'} bbw= {1} editable={false} value={value}
          />
        </View>
      )
    }

    toggleAlertSwitch = () => setIsAlertOn(previousState => !previousState);
    toggleNotificationSwitch = () => setIsNotificationOn(previousState => !previousState);

    showLocation = ()=>(
      <View w={"100%"} mb={20} bw={1} bc={'#F0F0F0'}>
        <Touch w={"100%"} boc={"#F0F0F0"}  h={48} bc={"#F8F8F8"} jc onPress={() =>{setIsExpandLocation(false)}}>
          <Text c={Color.themeColor} le={2} s={14}  b lh={18} t={"location"}/>
        </Touch>
        <MapView
          language={"hn"}
          mapType={"hybrid"}
          style={{ alignSelf: 'stretch', height: 120,width:"100%" }}
          initialRegion={region || APP_CONFIG.COORDINATES.coords}
        >
          <Marker coordinate={{ ...region }} draggable />
        </MapView>
      </View>
    )

    _showAlerts = (text1,text2,text3)=>(
      <View row mb={16} mt={20} width={"90%"}>
        <Text s={18} c={"black"} t={text1} b />
        <Switch
          thumbColor={text2? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          style={{position:"absolute",right:0}}
          onValueChange={text3}
          disabled={true}
          value={text2}
        />
      </View>
    )

    showAlerts = ()=>(
      <View w={"100%"} mb={20} bw={1} bc={'#F0F0F0'}>
        <Touch w={"100%"} h={48} boc={"#F0F0F0"} jc bc={"#F8F8F8"} onPress={() =>{setIsExpandAlert(false)}}>
          <Text c={Color.themeColor} le={2} s={14}  b lh={18} t={"alert"}/>
        </Touch>
        {_showAlerts("show_alert",userInfo?.isAlertOn,toggleAlertSwitch)}
        {_showAlerts("show_notification",userInfo?.isNotificationOn,toggleNotificationSwitch)}
      </View>
    )
 
    showAssignedTags = ()=>(
        <View w={"100%"} mb={20} bw={1} bc={'#F0F0F0'}>
          <Touch w={"100%"} h={48} boc={"#F0F0F0"} bc={"#F8F8F8"} jc onPress={() =>{setIsExpandAssignedTags(false)}}>
            <Text le={2} c={Color.themeColor} s={14} b lh={18} t={"assigned_tags"}/>
          </Touch>
          <View mb={12} mt={10}>
            {userInfo?.userTags!=undefined&&userInfo?.userTags.length>0?
              <View  w={"100%"}  c={'#FFFFFF'} bc={"#666666"} row style={{display:"flex",flexWrap: 'wrap'}}> 
                {userInfo.userTags.map((each,index)=>(
                  <Touch key={index} ml={2} boc={'#F0F0F0'} h={30} w={"30.00%"} br={10} bw={2} mt={"2%"}>
                    <Text c={Color.themeColor} center  t={each}/>
                  </Touch>
                ))}
              </View>
            :null}
          </View>
        </View>
    )

    showWards = ()=>(
      <View w={"100%"} mb={20} bw={1} bc={'#F0F0F0'}>
        <Touch w={"100%"} h={48} boc={"#F0F0F0"} bc={"#F8F8F8"} jc onPress={() =>{setIsExpandWard(false)}}>
          <View row>
            <Text c={Color.themeColor} s={14} le={2} b lh={18} t={"ward_details"}/>
          </View>
        </Touch>
        <Text s={24} c={"black"} t={userInfo?.areaCode} b center pa={4} h={40}/>
      </View>
    )

    editIcon = () =>(
      <IconAnt size={24}
        name={"edit"}
        color={"white"}
        style={{position:"absolute",right:"15%"}}
        onPress={()=>{navigation.navigate(PAGES.USERDETAIL)}}
      />
    )


    return ( 
      <View style={styles.container}>
        <Header navigation={navigation} headerText={"userprofile"} editIcon={editIcon}/>
        <ScrollView 
          contentContainerStyle={{ paddingHorizontal: 16,paddingTop:10}}
          showsVerticalScrollIndicator={false}
        >
          <View w={"100%"} h={110} mt={20}>
            <Image 
              source={userInfo?.profile?{ uri:userInfo.profile}:require("./../assets/blankavatar.png")}
              style = {{height:"100%",width:110,borderRadius:30,
              borderWidth:2,borderColor:"black",alignSelf:"center"
              }} resizeMode="cover"
            />
          </View>
          {
            getSignUpView('name', 'firstName_lastName', 'name', userInfo?.name)
          }
          {
            getSignUpView('phoneNumber', '9954672326', 'phoneNumber', userInfo?.phoneNumber, "numeric", 10)
          }
          {
            getSignUpView('emailid', 'email', 'email', userInfo?.email)
          }
          {
            getSignUpView('address', 'm.g. road', 'address', userInfo?.address,"","","crosshairs","Locate Me")
          }
          {showLocation()}
          <View bw={1} w={"100%"}  bc={'#F0F0F0'} mb={20}/>
          {
            showAlerts()
          }
          <View bw={1} w={"100%"}  bc={'#F0F0F0'} mb={20}/>
          {
            showWards()
          }
          <View bw={1} w={"100%"}  bc={'#F0F0F0'} mb={20}/>
          {
            showAssignedTags()
          }
          <View bw={1} w={"100%"}  bc={'#F0F0F0'} mb={20}/>
          <View row w={"100%"}>
            <Checkbox
              status={userInfo?.isPrivate ? 'checked' : 'unchecked'}
              disabled={true}
              onPress={() => {setIsPrivate(!isPrivate);}}
            />
            <Text t={"make_my_profile_private"} mt={8}  c={"#666666"} b />
          </View>
            <View row mb={16} mt={20} width={"90%"}>
              <Touch ai jc h={48} br={4} s={16} b c={Color.themeFontColor} bc={Color.themeColor} 
                onPress={() => {navigation.navigate(PAGES.USERDETAIL)}}
                  t={"editprofile"} 
              />
            </View>
        </ScrollView>
      </View>
            
    )
}


  
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      backgroundColor : "white"
    }
});
  
