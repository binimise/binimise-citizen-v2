import React, {useState, useEffect}  from 'react';
import { ScrollView, KeyboardAvoidingView,StyleSheet,Alert, Dimensions,BackHandler} from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import { View, Text, Touch, TextInput, Picker } from "./../ui-kit";
import * as Location from 'expo-location';
import Modal from "./../components/modal";
import {updateTasks,getTasksFromSettings } from "./../repo/repo";
import { Color, PAGES,getCurrentDate,TOKEN,AUTHUID,APP_CONFIG} from '../global/util';
import IconAnt from 'react-native-vector-icons/AntDesign';
import {Calendar} from 'react-native-calendars';
import {useNavigationState} from '@react-navigation/native';
let {height,width} = Dimensions.get("window")



export default ({ navigation }) => {

  const[isConfirmPayment,setIsConfirmPayment] =useState(false);
  const dispatch = useDispatch();
  const setDataAction = (arg) => dispatch(setData(arg));
  // let userInfo = useSelector(state => state.testReducer.userInfo) || {};
  const [selectedWasteType, setSelectedWasteType] = useState({});
  const [isCalendarShow, setIsCalendarShow] = useState(false);
  const [day, setDay] = useState();
  const [bookingType,setBookingType] =useState();
  const [bookingObj, setBookingObj] = useState({});
  const [typesOfRequestVehicle,setTypesOfRequestVehicle] = useState([]);
  const [isBookingListShow,setIsBookingListShow] = useState(false);
  const navigationValue = useNavigationState(state => state);
  const routeName = (navigationValue.routeNames[navigationValue.index]);
  let { userInfo,selectedLanguage} = useSelector(state => state.testReducer) || {};
 
  useEffect(() => {
    if(routeName === "AddNewBooking"){
      const backAction = () => {
        navigation.navigate(PAGES.BOOKING)
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );
      return () => backHandler.remove();
    }
  });

  useEffect(() => {
    setBookingObj(Object.assign({}, bookingObj, {name:userInfo.name, phoneNumber : userInfo.phoneNumber }));
    getTasksSetting();
     
  }, []);

  const getTasksSetting = async() => {
    let tasksData = await getTasksFromSettings();
    let tasksArray = [];
    (tasksData || []).map((key) => {
      tasksArray.push({name :key,id:key});
    });
    setTypesOfRequestVehicle(tasksArray);
  }


  const onDayPress = async (day) => {
      let date=day.dateString.split("-")
      let d=date[2]+"/"+date[1]+"/"+date[0]
      setDay(d);
      setIsCalendarShow(false)
  }

  if(isBookingListShow){
    return(
      <View a c={Color.backgroundModalColor} jc ai zi={999} to={0} le={0} h={height} w={width}>
          <View w={width - 48} br={8} c={Color.white} jc pa={16} h={"80%"}>
            <Text t={"select_type"} center s={20} />
            <View w={"90%"} bw={0.5} mh={"5%"} bc={"black"} mb={"4%"}/>
            <ScrollView>
              {typesOfRequestVehicle.length>0&&typesOfRequestVehicle.map((each,index)=>{
                return(
                  <Touch h={40} w={"90%"} ml={"5%"} row key={index} ai
                    onPress={() => {setSelectedWasteType(each);  setBookingType(each.name);}}>
                    <View style={styles.radioCircle}>
                      {each.name===selectedWasteType?.name && <View style={styles.selectedRb} />}
                    </View>
                    <Text center ml={2} s={18} t={each.name} />
                  </Touch>
                )
              })}
            </ScrollView>
            <View w={"90%"} bw={0.5} mh={"5%"} bc={"black"}/>
              <View row jc>
                <Touch h={40} w={"40%"} jc ai t={"close_c"} mb={4} boc={"#F0F0F0"} bc={"red"}
                  mt={2} mr={10} bw={2} br={8} onPress={() =>{setIsBookingListShow(false)}}/>
                <Touch h={40} w={"40%"} jc ai t={"submit"} mb={4} boc={"#F0F0F0"} bc={"green"}
                  mt={2} bw={2} br={8} onPress={() =>{setIsBookingListShow(false)}}/>
              </View>
          </View>
      </View>
    )
  }
  const toggleLoadingInNewB = show => {
        setDataAction({"loading": {show}});
  }
   
  const formOnChangeTask = (field, value) => setBookingObj(Object.assign({}, bookingObj, {[field] : value}));

  const showErrorModalMsg = (message, title = "message") => {
      setDataAction({ 
        errorModalInfo : {
          showModal : true, title, message
        }
      })
  };

  const newBookingObjForUser = ({userInfo}) => {
    let _userObj={}
    _userObj[TOKEN] =userInfo[TOKEN] ||"";
    _userObj[AUTHUID] = userInfo[AUTHUID] || "";
    _userObj["areaCode"] = userInfo.areaCode;
    _userObj["ward"] = userInfo.areaCode;
    _userObj["ward_id"] = userInfo.areaCode;
    _userObj["name"] = userInfo.name ;
    _userObj["address"] = userInfo.address ||"";
    _userObj["phoneNumber"] = userInfo.phoneNumber ;
    _userObj["municipality"] = userInfo.municipality  || "buguda";
    return _userObj;
  }

  const addNewTask = async () => {
      setIsConfirmPayment(false);
      toggleLoadingInNewB(true);
      bookingObj["bookingFor"] = day;
      bookingObj["selectedWasteType"] = selectedWasteType;
  
      let location = {};
      try{
        location = await Location.getLastKnownPositionAsync({enableHighAccuracy: true});
        
      }catch(e){}
      bookingObj["location"] = { latitude : location?.coords?.latitude ||19.0840319, longitude : location?.coords?.longitude || 82.0222439 }
      let __userObj = newBookingObjForUser({ userInfo });
      updateTasks(bookingObj, __userObj);
      toggleLoadingInNewB(false);
      errorModal("we_shall_contact_you_soon_T");
      setSelectedWasteType({});
      setDay("");
      setBookingObj(Object.assign({}, bookingObj, {selectedWasteType:null,bookingFor:"" }));
      navigation.navigate(PAGES.BOOKING);
  }

  const errorModal = message => {
      setDataAction({
        errorModalInfo : {
          showModal : true,
          message,
        }
      });
  }

   
  const showBookingDetais = (text, ph, name, value,flag) => {
      return (
        <View  mb={12} w={"90%"} ml={20}>
          <Text s={12} c={"#666666"} t={text}/>
            <TextInput ml nl={1} ph={ph} pl={16} pt={2} h={40} bc={'#FFFFFF'} 
              editable={false} w={'100%'} value={value} name={name}
              onChangeText={formOnChangeTask} style={{color:"black"}}
            />
        </View>
      )
  }

  const showCalendar = () =>(
    <View a c={Color.backgroundModalColor} jc ai zi={999} to={0} le={0} h={height} w={width}>
      <IconAnt size={32} color={"red"}  name={"closecircle"}
        style={{marginTop:20}}
        onPress={()=>{setIsCalendarShow(false)}} 
      />
      <View w={width - 48} br={8} c={Color.white} jc pa={16} mt={20}>
        <Text center b s={16} mb={14} t="Calendar"/>
        <Calendar
          onDayPress={onDayPress}
          monthFormat={'dd - MM - yyyy'}
          minDate={getCurrentDate()}
          onMonthChange={(month) => {console.log('month changed', month)}}
        />  
      </View>
    </View>
  )
      
  const showConfirmDetails =(displaytext,value,mt)=>{
    return(
      <View row mt={mt}>
        <Text s={14}  c={"#000000"} t={displaytext}/>
        <Text s={14}  c={"#000000"} t={":"} a ri={200}/>
        <Text s={14} a  ri={20} t={value}/>
      </View>
  
    )
  }


  return (
    <KeyboardAvoidingView enabled
      style={{ flex: 1, flexDirection: 'column',justifyContent: 'center',backgroundColor:'#00000066'}}
      behavior={Platform.OS == "ios" ? "padding" : "height"}
    >
      <View style={styles.bottomView1}>   
        <Text center s={18} b mb={16} mt={40} t={"create_new_booking"}/> 
        {
          showBookingDetais('name', 'Name', 'name', bookingObj.name,false)
        }

        {
          showBookingDetais('phoneNumber', '70226299999', 'phoneNumber', bookingObj.phoneNumber,false)
        }

        <View w={"90%"} mt={10} ml={20}>
          <Text s={12}c={"#666666"} t={'booking_type'}/>
          <Touch br={4} s={16} w={'100%'}  mt={"2%"} mb={"2%"} ai jc h={48}
            bc={"#FFFFFF"} bw={1} onPress={()=> {setIsBookingListShow(true)}}
          t={selectedWasteType?.name!=undefined?selectedWasteType?.name:"select_task"}/>
        </View>

         <View w={"90%"} mt={10} ml={20}>
          <Text s={12} c={"#666666"} t={'booking_date'}/>
          <View row mt={4} pa={10} br={2}bw={2} h={48} c={'#FFFFFF'} bc={"#F0F0F0"}>
            <Text t={day} jc/>
            <IconAnt size={24} name={"calendar"}
              style={{position:"absolute",right:0,top:10}}
              onPress={()=>{setIsCalendarShow(true)}} 
            />
          </View>
        </View>
        <View row mt={10} w={"90%"} mh={"5%"}>
          <Touch ai jc h={48} br={8} w={"49%"} t={"cancel"} mr={"2%"}
            s={16} c={Color.themeFontColor} bc={"red"} b
            onPress={() => {
              setSelectedWasteType({});
              setDay("");
              setBookingObj(Object.assign({}, bookingObj, {selectedWasteType:null,bookingFor:"" }))
              navigation.navigate(PAGES.BOOKING);
            }}
          />
         <Touch ai jc h={48} br={8} w={"49%"} t={"confirm"} 
            s={16} c={Color.themeFontColor} bc={Color.themeColor} b
            onPress={() => {
              if(!selectedWasteType.id){
                return errorModal("please_select_waste_type");
              }
              if(!day ){
                return errorModal("please_select_bookingDate");
              }
              setIsConfirmPayment(true);
            }}
          />
        </View>

      </View>

      {isConfirmPayment?
        <View a c={"#00000066"} jc ai h={"100%"} w={"100%"}>
          <View style={styles.bottomView}>
            <View mt={20} mb={20}>
              <Text s={20} c={"black"} b  center t={"booking_confirmation"}/>
            </View>
            <View mt={20} ml={"5%"}>
              {
                showConfirmDetails("full_name",userInfo.name,0)
              }
              {
                showConfirmDetails("mobile_num",userInfo.phoneNumber,8)
              }
              {
                showConfirmDetails("emailid",userInfo.email,8)
              }
              {
                showConfirmDetails("req_veh",bookingType,8)
              }
              {
                showConfirmDetails("bookedFor",day,8)
              }
            </View>

            <Touch ai jc h={48} br={4} w={"90%"} ml={20} mt={10}  t={"proceed"} 
              s={16} c={Color.themeFontColor} bc={Color.themeColor} b
              onPress={() => {addNewTask()}}
            />
            <View mb={20}/>

            <IconAnt size={32} color={"red"}  name={"closecircle"}
              style={{position:"absolute",top:18,right:16}}
              onPress={()=>{setIsConfirmPayment(false)}} 
            />
          </View>
        </View>
      :null}

      {
        isCalendarShow ? showCalendar() : null
      }
    </KeyboardAvoidingView>
    
    )
}

const styles = StyleSheet.create({
     bottomView: {
        width: '100%',
        height: 300,
        backgroundColor: '#F0F0F0',
        position: 'absolute', 
        bottom: 0, 
        borderTopLeftRadius:50,
        borderTopRightRadius:50,
        overflow: 'hidden'
      },
      bottomView1: {
        width: '100%',
        height: "70%",
        backgroundColor: '#F0F0F0',
        position: 'absolute', 
        bottom: 0, 
        borderTopLeftRadius:50,
        borderTopRightRadius:50,
        overflow: 'hidden'
      },
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
  