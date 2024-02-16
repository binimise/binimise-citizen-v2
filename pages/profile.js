import React, {useState, useEffect, useReducer}  from 'react';
import { ScrollView,Switch, Image,StyleSheet,BackHandler} from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import { View, Text, Touch, TextInput } from "./../ui-kit";
import { Checkbox } from 'react-native-paper';
import { Color, PAGES, PHONENUMBER, APP_CONFIG, USERINFO, AUTHUID, TOKEN } from '../global/util';
import MapView,{Marker} from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconF from 'react-native-vector-icons/FontAwesome5';
import Header from "../components/header";
import { useFocusEffect, useIsFocused,useNavigationState } from '@react-navigation/native';


const initialState = {
    name : "",
    father_name : "",
    phoneNumber : "",
    DDN_NO : "",
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
    let { userInfo } = useSelector(state => state.testReducer) || {};
    const [isExpandLocation, setIsExpandLocation] = useState(false);
    const [isExpandAlert, setIsExpandAlert] = useState(false);
    const [isExpandWard, setIsExpandWard] = useState(false);
    const [isExpandAssignedTags, setIsExpandAssignedTags] = useState(false);
    const [isExpandTags, setIsExpandTags] = useState(false);
    const [isExpandBox, setIsExpandBox] = useState(false);
    const[userTags,setUserTags] = useState([]);
    const [_mapType,setMapType] = useState("hybrid");
    const navigationValue = useNavigationState(state => state);
    const routeName = (navigationValue.routeNames[navigationValue.index]);
    const isFocus = useIsFocused();
    
    useEffect(() => {
      if(routeName === PAGES.PROFILE){
        const backAction = () => {
          if(userInfo?.authUid){
            navigation.navigate(PAGES.HOME);
          }else{
            BackHandler.exitApp();
          }
          return true;
        };
        const backHandler = BackHandler.addEventListener(
          "hardwareBackPress",
          backAction
        );
        return () => backHandler.remove();
      }
  });
    // useEffect(() => {
    //   __updateLocationFromDb();
    //     // if(userInfo?.holdingNo){
    //     //     house_no= (selectedLanguage=="en"?"Your Householding Number is":"आपका हाउसहोल्डिंग नंबर है")+"    "+ userInfo.holdingNo
    //     //     // return showErrorModalMsg(house_no);
    //     // }
    // }, [isFocus]);

    const __updateLocationFromDb = () => {
        let obj = { 
          latitude: userInfo?.lat || APP_CONFIG.COORDINATES.coords.latitude,
          longitude: userInfo?.long || APP_CONFIG.COORDINATES.coords.longitude, 
          latitudeDelta: 0.01, longitudeDelta: 0.01
        };
        setRegion(obj);
    }



    const getProfileView = (text, ph, name, value,keyboardType, maxLength,icon,icontext) => {
      return (
        <View mb={12}>
          <Text s={12} t={text} c={"black"} b/>
          <TextInput ml nl={1} ph={ph} pl={16} h={40} bc={'#FFFFFF'}
            k={keyboardType} maxLength={maxLength} bbc={'#F0F0F0'}
            name={name}
             w={'100%'} bbw= {1} editable={false} value={value}
          />
        </View>
      )
    }

    const toggleAlertSwitch = () => setIsAlertOn(previousState => !previousState);
    const toggleNotificationSwitch = () => setIsNotificationOn(previousState => !previousState);

    const showLocation = ()=>(
      <View w={"100%"} mb={20} bw={1} bc={'#F0F0F0'}>
        <Touch w={"100%"} boc={"#F0F0F0"}  h={48} bc={"#F8F8F8"} jc onPress={() =>{setIsExpandLocation(false)}}>
          <Text c={Color.themeColor} le={2} s={14}  b lh={18} t={"location"}/>
        </Touch>
        <MapView
          ref={ref => (this.mapView = ref)}
          language={"hn"}
          mapType={"hybrid"}
          followUserLocation = {true}
          // showsUserLocation = {true}
          style={{ alignSelf: 'stretch', height: 120,width:"100%" }}
          initialRegion={{
            latitude : userInfo?.lat || APP_CONFIG.COORDINATES.coords.latitude,
            longitude : userInfo?.long || APP_CONFIG.COORDINATES.coords.longitude,
            latitudeDelta: 0.01, longitudeDelta: 0.01
          }}
        >
          <Marker coordinate={{  
            latitude : userInfo?.lat || APP_CONFIG.COORDINATES.coords.latitude,
            longitude : userInfo?.long || APP_CONFIG.COORDINATES.coords.longitude,
            latitudeDelta: 0.01, longitudeDelta: 0.01 }} draggable />
        </MapView>
      </View>
    )

    const _showAlerts = (text1,text2,text3)=>(
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

    const showAlerts = ()=>(
      <View w={"100%"} mb={20} bw={1} bc={'#F0F0F0'}>
        <Touch w={"100%"} h={48} boc={"#F0F0F0"} jc bc={"#F8F8F8"} onPress={() =>{setIsExpandAlert(false)}}>
          <Text c={Color.themeColor} le={2} s={14}  b lh={18} t={"alert"}/>
        </Touch>
        {_showAlerts("show_alert",userInfo?.isAlertOn,toggleAlertSwitch)}
        {_showAlerts("show_notification",userInfo?.isNotificationOn,toggleNotificationSwitch)}
      </View>
    )
 
    const showAssignedTags = ()=>(
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

    const showWards = ()=>(
      <View w={"100%"} mb={20} bw={1} bc={'#F0F0F0'}>
        <Touch w={"100%"} h={48} boc={"#F0F0F0"} bc={"#F8F8F8"} jc onPress={() =>{setIsExpandWard(false)}}>
          <View row>
            <Text c={Color.themeColor} s={14} le={2} b lh={18} t={"ward_details"}/>
          </View>
        </Touch>
        <Text s={24} c={"black"} t={userInfo?.areaCode} b center pa={4} h={40}/>
      </View>
    )

    const editIcon = () =>(
      !userInfo?.DDN_NO&&<IconAnt size={24}
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
              }} resizeMode="stretch"
            />
          </View>
          {
            getProfileView('name', 'firstName_lastName', 'name', userInfo?.name)
          }
           {
            getProfileView('father_name', 'firstName_lastName', 'father_name', userInfo?.father_name)
          }
          {
            getProfileView('phoneNumber', '9954672326', 'phoneNumber', userInfo?.phoneNumber, "numeric", 10)
          }
          {
            getProfileView('d_no', 'ABC12365D32', 'DDN_NO', userInfo?.DDN_NO)
          }
          {
            getProfileView('emailid', 'email', 'email', userInfo?.email)
          }
          {
            getProfileView('address', 'm.g. road', 'address', userInfo?.address,"","","crosshairs","Locate Me")
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
            {!userInfo?.DDN_NO&&<View row mb={16} mt={20} width={"90%"}>
              <Touch ai jc h={48} br={4} s={16} b c={Color.themeFontColor} bc={Color.themeColor} 
                onPress={() => {navigation.navigate(PAGES.USERDETAIL)}}
                  t={"editprofile"} 
              />
            </View>}
        </ScrollView>
      </View>
            
    )
}


  
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor : "white"
    }
});
  
