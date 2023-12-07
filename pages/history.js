import React, { useState, useEffect }  from 'react';
import { BackHandler,Alert,ScrollView ,Dimensions} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "../redux/action";
import { View, Text, Touch } from "../ui-kit";
import Header from "../components/header";

import {getAcknowledge,getVehicleGeo } from "./../repo/repo";
import {Calendar,LocaleConfig} from 'react-native-calendars';
import {Color,getCurrentDateFmt,getCurrentDate} from "./../global/util";
import { useFocusEffect } from '@react-navigation/native';
const { width, height } = Dimensions.get('window');  
import IconAnt from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/FontAwesome5';

LocaleConfig.locales["en"] = {
    monthNames: ["January","February","March","April","May","June","July","August","September","October","November","December"],
    monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept","Oct","Nov", "Dec"],
    dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
   dayNamesShort: ["sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"],
   today: "Today",
   };

LocaleConfig.locales["hn"] = {
  monthNames: ["जनवरी","फरवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितम्बर","अक्टूबर","नवम्बर","दिसम्बर"],
  monthNamesShort: ["जन","फर","मा","अ","म","जू","जुला","अग","सित","अक्टू","नव","दिस"],
  dayNames: ["रविवार", "सोमवार", "मंगलवार", "बुधवार ", "गुरुवार", "शुक्रवार", "शनिवार"],
  dayNamesShort: ["रवि", "सोम", "मंग", "बुध ", "गुरु", "शुक्र", "शनि"],
  today: "आज",
};

LocaleConfig.locales["or"] = {
  monthNames: ["ଜାନୁଆରୀ","ଫେବୃଆରୀ","ମାର୍ଚ୍ଚ","ଅପ୍ରେଲ","ମଇ","ଜୁନ","ଜୁଲାଇ","ଅଗଷ୍ଟ","ସେପ୍ଟେମ୍ବର","ଅକ୍ଟୋବର","ନଭେମ୍ବର","ଡିସେମ୍ବର"],
  monthNamesShort: ["ଜାନୁ","ଫେବ","ମାର୍","ଅପ୍ର","ମଇ","ଜୁନ","ଜୁଲ","ଅଗଷ୍ଟ","ସେପ୍ଟ","ଅକ୍ଟୋ","ନଭେ","ଡିସେ"],
  dayNames: ["ରବିବାର", "ସୋମବାର", "ମଙ୍ଗଳବାର", "ବୁଧବାର", "ଗୁରୁବାର", "ଶୁକ୍ରବାର", "ଶନିବାର"],
  dayNamesShort: ["ରବି", "ସୋମ", "ମଙ୍ଗ", "ବୁଧ", "ଗୁରୁ", "ଶୁକ୍ର", "ଶନି"],
  today: "ଆଜ",
};

export default ({ navigation }) => {

    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    const [isShowCalendar,setIsShowCalendar] = useState(true);
    const [day,setDay] =useState("");
    const [deviceGeo,setDeviceGeo] = useState("");
    const [vehicles, setVehicles] = useState([]);
    const [vehicleHistory,setVehicleHistory] = useState([]);
    const [index,setIndex] =useState(0);
    const [isMapShow, setIsMapShow] = useState(false);
    const [date,setDate]=useState("")
    const [allDaysOfMonth,setAllDaysofMonth] = useState([]);
    const [routes, setroutes] = useState([]);
    let { userInfo,selectedLanguage } = useSelector(state => state.testReducer) || {};
    const [saathiMonthlyAttendance,setSaathiMonthlyAttendance] = useState([])
    const [remainingDatesOfMonth,setRemainingDatesOfMonth] = useState([])
    const [acknowledgeArray,setAcknowledgeArray] = useState([]);
    const [datesObj,setDatesObj] = useState({});
    const [selectedAckObj,setSelectedAckObj] = useState({})
    LocaleConfig.defaultLocale = selectedLanguage;


    useEffect(() => {
        // getSaathiAttendanceData(getCurrentDate())
        getDateAndMonthInHistory(getCurrentDate())
    }, []);

    const getDateAndMonthInHistory = (selectedDate)=>{
      let currentMonth = new Date().getMonth()+1
      let d_arr = [];
      let dt = new Date(selectedDate);
      let month = dt.getMonth() + 1;
      let day = dt.getDate();
      let year = dt.getFullYear();
      let daysInMonth = new Date(year, month, 0).getDate();
      let TotalDays= (currentMonth == month)?day:daysInMonth;
      for (let i = 1; i <= TotalDays; i++) {
        if (i.toString().length < 2) {
          i = "0" + i;
        }
        if (month.toString().length < 2) {
          month = "0" + month;
        }
        let d = (year + "-" + month + "-" + i).toString();
        d_arr.push(d)
      }
      setAllDaysofMonth(d_arr);
      getSaathiAttendanceData(d_arr)
    }
     

  const getSaathiAttendanceData =async(daysInMonth) =>{
    try{
      toggleLoading(true);
      setAcknowledgeArray([]);
      let Ack_arr=[]
      for (let i = 0; i < daysInMonth.length; i++) {
        let d= daysInMonth[i]
        await getAcknowledge(d,userInfo?.authUid).then((querySnapshot) => {
          let queryData=querySnapshot.data()
          if(queryData?.acknowledge && !queryData?.segregation){
            queryData.d=d;queryData.type ="Ack"
            Ack_arr.push(queryData);
          }else if(queryData?.acknowledge &&queryData?.segregation){
            queryData.d=d;queryData.type ="seg"
            Ack_arr.push(queryData);
          }else{
            Ack_arr.push({d:d,type:"rem"})
          }
        });
      }
      const obj = {}
      Ack_arr.forEach((elem, i) => {
        if(elem.type=="rem"){
          obj[elem.d] = {customStyles:{container: {backgroundColor: '#800000'},text:{color:"black"}}}
        }else if(elem.type=="Ack"){
          obj[elem.d] = {customStyles:{container: {backgroundColor: '#F6BE00'},text:{color:"black"}}}
        }else if(elem.type=="seg"){
          obj[elem.d] = {customStyles:{container: {backgroundColor: 'green'},text:{color:"black"}}}
        }
      })
      setAcknowledgeArray(Ack_arr);
      setDatesObj(obj);
      toggleLoading(false);
    }catch(e){
      console.log(e)
    }
  }

  const toggleLoading = show => {
    setDataAction({"loading": {show}});
  }

  const showErrorModalMsg = (message, title = "message") => {
    setDataAction({ 
      errorModalInfo : {
        showModal : true, title, message
      }
    })
  };

  const _onDayPress = async (da) => {

    try{
        let filterdata = acknowledgeArray.find(function (element) {
          return element.d == da.dateString&&element.id;
      });
      if(filterdata){
        let c_t=  new Date(filterdata?.time_stamp?.seconds).toLocaleString();
        // console.log("y",c_t.getUTCFullYear(),"m",c_t.getUTCMonth(),"d",c_t.getUTCDate(),"t",c_t.getUTCHours(),c_t.getUTCMinutes())
        filterdata.c_t =c_t;
        setSelectedAckObj(filterdata);
        setIsShowCalendar(false);
      }else{
        return showErrorModalMsg("no_data_found");
      }
    }catch(e){console.log(e)}
  
  }

    const calendarIcon =()=>(
     <IconAnt size={24}
        name={"calendar"}
        color={"white"}
        style={{position:"absolute",right:"15%"}}
        onPress={()=>{setIsShowCalendar(true)}}
      /> 
    )

  return <View c={"white"} h={height} w={width}>
    <Header navigation={navigation} headerText={"history"}/>
    {isShowCalendar?<View>
        <Calendar
          onDayPress={_onDayPress}
          onMonthChange={month => {  getDateAndMonthInHistory(month.dateString)}}
          markedDates={datesObj}
          markingType={'custom'}
        />
        <View row ml={10} mt={30}>
          <Text h={20} w={20} bc={"green"}/>
          <Text h={20} ml={10} t={"garbage_collected"}/>
        </View>
        <View row ml={10} mt={10}>
          <Text h={20} w={20} bc={"#F6BE00"}/>
          <Text h={20} ml={10} t={"garbage_segregation"}/>
        </View>
        <View row ml={10} mt={10}>
          <Text h={20} w={20} bc={"#800000"}/>
          <Text h={20} ml={10} t={"garbage_picker_absent"}/>
        </View>
      </View>:
      <View w={"90%"} bw={1} h={"100%"} ml={10} mt={10} mb={10}>
        <View row ml={10} mt={30}>
          <Text h={20} t={"name"} b/>
          <Text t={" : "}/>
          <Text h={20} ml={10} t={selectedAckObj?.name}/>
        </View>
        <View row ml={10} mt={30}>
          <Text h={20} t={"phoneNumber"} b/>
          <Text t={" : "}/>
          <Text h={20} ml={10} t={selectedAckObj?.phoneNumber}/>
        </View>
        <View row ml={10} mt={30}>
          <Text h={20} t={"area"} b/>
          <Text t={" : "}/>
          <Text h={20} ml={10} t={selectedAckObj?.ward_id}/>
        </View>
        <View row ml={10} mt={30}>
          <Text h={20} t={"attended_by"} b/>
          <Text t={" : "}/>
          <Text h={20} ml={10} t={selectedAckObj?.saathiUser?.name}/>
        </View>
        <View row ml={10} mt={30}>
          <Text h={20} t={"time"} b/>
          <Text t={" : "}/>
          <Text h={20} ml={10} t={selectedAckObj?.c_t}/>
        </View>
        <View row ml={10} mt={30}>
          <Text h={20} t={"acknowledgement"} b/>
          <Text t={" : "}/>
          <Text h={20} ml={10} t={selectedAckObj?.acknowledge?selectedAckObj?.acknowledge.toString():"false"}/>
        </View>
        <View row ml={10} mt={30}>
          <Text h={20} t={"segregation"} b/>
          <Text t={" : "}/>
          <Text h={20} ml={10} t={ selectedAckObj?.segregation?selectedAckObj?.segregation.toString():"false"}/>
        </View>
        <Touch jc bc={Color.themeColor} h={48} mt={20} c={Color.themeFontColor} 
           w={"90%"}  br={4} mh={10} s={16} t={'go_to_c'} onPress={()=>{setIsShowCalendar(true)}} 
        />
       
      </View>}
  </View>
  
}
