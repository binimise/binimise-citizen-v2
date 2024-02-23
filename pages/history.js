import React, { useState, useEffect }  from 'react';
import { BackHandler,ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "../redux/action";
import { View, Text } from "../ui-kit";
import Header from "../components/header";
import Styles from '../styles/styles';
import {getAcknowledge } from "./../repo/repo";
import {Calendar,LocaleConfig} from 'react-native-calendars';
import {Color,getCurrentDateFmt,getCurrentDate,PAGES} from "./../global/util";
import { useIsFocused,useNavigationState } from '@react-navigation/native';

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




const showTextAndValue = (text,value) =>{
  return <View row ml={10} mt={30}>
  <Text h={20} t={text} b/>
  <Text t={" : "}/>
  <Text h={20} ml={10} t={value}/>
</View>
};

export default ({ navigation }) => {

  const dispatch = useDispatch();
  const setDataAction = (arg) => dispatch(setData(arg));
  let { userInfo, selectedLanguage } = useSelector(state => state.testReducer) || {};
  const [acknowledgeArray, setAcknowledgeArray] = useState([]);
  const [datesObj, setDatesObj] = useState({});
  const [selectedAckObj, setSelectedAckObj] = useState({});
  const navigationValue = useNavigationState(state => state);
  const routeName = (navigationValue.routeNames[navigationValue.index]);
  const isFocus = useIsFocused();
  LocaleConfig.defaultLocale = selectedLanguage;

  const getBackgroundColorOfDate = (eachDoc) => {
    return eachDoc?.segregation ? Color.themeColor : (eachDoc?.acknowledge ? '#F6BE00' :eachDoc?.id?"#4169e1":"#800000")
  }

  useEffect(() => {
    if (routeName === PAGES.HISTORY) {
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

  useEffect(() => {
    if(isFocus){
      getDateAndMonthInHistory(getCurrentDate());
    }
    
    setSelectedAckObj({});
  }, [isFocus]);

  const getDateAndMonthInHistory = (selectedDate) => {
    setSelectedAckObj({});
    let selectedMonth = new Date(selectedDate);
    let currentDate = new Date();
    if (
      selectedMonth.getFullYear() < currentDate.getFullYear() ||
      (selectedMonth.getFullYear() === currentDate.getFullYear() &&
        selectedMonth.getMonth() <= currentDate.getMonth())
    ) {
      let currentMonth = new Date().getMonth() + 1
      let d_arr = [];
      let dt = new Date(selectedDate);
      let month = dt.getMonth() + 1;
      let day = dt.getDate();
      let year = dt.getFullYear();
      let daysInMonth = new Date(year, month, 0).getDate();
      let TotalDays = (currentMonth == month) ? day : daysInMonth;
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
      getSaathiAttendanceData(d_arr);

    } else {
      setAcknowledgeArray([]);
      setDatesObj({});
      setSelectedAckObj({});
    }
  }

  const getSaathiAttendanceData = async (daysInMonth) => {
    try {
      setDataAction({ loading: { show:true,message:"getting_this_month_report" } });
      setAcknowledgeArray([]);
      let Ack_arr = [];
      await Promise.all([...daysInMonth].map((date) => getAcknowledge(date, userInfo?.authUid))).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          Ack_arr.push(doc);
        });
        getDateWiseStatusOfStaff(Ack_arr);
        setAcknowledgeArray(Ack_arr);
      })
        .catch((error) => {
          setDataAction({ loading: { show:false } });
          console.log('Error querying documents:', error);
        });
    } catch (e) {
      setDataAction({ loading: {show:false } });
    }
  }
  
  const getDateWiseStatusOfStaff = (monthlyreport) =>{
    try{
      const obj = {};
      monthlyreport.forEach((elem, i) => {
          obj[elem?.id] = {
              customStyles:{container: {backgroundColor: getBackgroundColorOfDate(elem?.item)},
              text:{color:"white"}}
          }
      })
      setDatesObj(obj);
      setDataAction({ loading: { show:false } });
      // if(monthlyreport?.length>0){
      //   let dateStirng = monthlyreport[monthlyreport.length-1].id ||getCurrentDateFmt();
      //   _onDayPress(dateStirng,monthlyreport);
      // }

    }catch(e){
      setDataAction({ loading: { show:false } });
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

  const _onDayPress = async (s_date,acknowledgeArray) => {
    try{
        let filterdata = acknowledgeArray.find(function (element) {
          return element.id == s_date && element?.item?.id;
      });
     
      if(filterdata?.item){
        let convertedTime = "";
        if(filterdata?.item?.timestamp){
          const date = new Date(filterdata?.item?.timestamp);
          // console.log("date.getMinutes().length",date.getMinutes().length,typeof(date.getMinutes().length))
          let dd = date?.getDate();
          let mm = date?.getMonth()+1;
          let hr = date?.getHours();
          let min = date?.getMinutes();
          dd = dd.toString().length<2? '0' + dd :dd;
          mm = mm.toString().length<2? '0' + mm :mm;
          hr = hr.toString().length<2? '0' + hr :hr;
          min = min.toString().length<2? '0' + min :min;
         
          let yy = date.getFullYear();
          convertedTime = `${dd}-${mm}-${yy} ${hr} : ${min}`;
        }
        filterdata.item.dateId = s_date?.split("-").reverse("").join("-") ||"";
        filterdata.item.c_t = convertedTime;
        setSelectedAckObj(filterdata?.item);
        setDataAction({ "loading": { show:false } });
      }else{
        setDataAction({ "loading": { show:false } });
        let revDate = s_date?.split("-").reverse("").join("-") || getCurrentDateFmt()
        return showErrorModalMsg(["no_data_found"," ",revDate]);
      }
    }catch(e){
      setDataAction({ "loading": { show:false } });
    }
  
  }
  return (
    <View w={"100%"} h={"100%"} c={"white"}>
      <Header navigation={navigation} headerText={"history"} />
      <ScrollView style={{ marginBottom: 20 }}>
        <View mt={10} />
        <Calendar
          onDayPress={(date) => {
            // toggleLoading(true);
            setSelectedAckObj({})
            _onDayPress(date.dateString,acknowledgeArray)
          }}
          onMonthChange={month => { getDateAndMonthInHistory(month.dateString) }}
          markedDates={datesObj}
          markingType={'custom'}
        />
         <View row ml={"4%"} mt={30} >
          <Text h={20} w={20} bc={Color.themeColor} style={{borderRadius:10}}/>
          <Text h={20} ml={10} t={"garbage_collected"}/>
        </View>
        <View row  ml={"4%"} mt={10}>
          <Text h={20} w={20} bc={'#ffa500'} style={{borderRadius:10}}/>
          <Text h={20} ml={10} t={"garbage_segregation"}/>
        </View>
        <View row  ml={"4%"} mt={10}>
          <Text h={20} w={20} bc={"#4169e1"} style={{borderRadius:10}}/>
          <Text h={20} ml={10} t={"garbage_picker_present"}/>
        </View>
        <View row ml={"4%"} mt={10}>
          <Text h={20} w={20} bc={"#800000"} style={{borderRadius:10}}/>
          <Text h={20} ml={10} t={"garbage_picker_absent"}/>
        </View>
        <View mt={10} />
         {Object.keys(selectedAckObj).length === 0?null:
        
        <View style = {Styles.hiistoryView}>
          <Text t={["history_t","  ",selectedAckObj?.dateId]} b s={20} style={{marginLeft:"5%"}} />
          <View mh={"5%"} bw={1} w={"90%"} bc={"#CCCCCC"}/>
                {
                  showTextAndValue("name", selectedAckObj?.name || "N/A")
                }
                {
                  showTextAndValue("phoneNumber", selectedAckObj?.phoneNumber || "N/A")
                }
                {
                  showTextAndValue("area", selectedAckObj?.ward_id || "N/A")
                }
                {
                  showTextAndValue("attended_by", selectedAckObj?.saathiUser?.name || selectedAckObj?.deviceUser?.vehicleName || "N/A")
                }
                {
                  showTextAndValue("time", selectedAckObj?.c_t || "N/A")
                }
                {
                  showTextAndValue("acknowledgement", selectedAckObj?.acknowledge ? selectedAckObj?.acknowledge.toString() : "false")
                }
                {
                  showTextAndValue("segregation", selectedAckObj?.segregation ? selectedAckObj?.segregation.toString() : "false")
                }

        </View>
        
                
        }
       <View h={40}/>
      </ScrollView>
    </View>
  )
  
}
