import React, { useState, useEffect }  from 'react';
import { BackHandler,Alert,ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "../redux/action";
import { View, Text} from "../ui-kit";
import Header from "../components/header";
import { PAGES, Color,getCurrentDate, AUTHUID, getCurrentDateFmt } from "./../global/util";
import { getAttendance, getAllDetailsofStaff } from "./../repo/repo";
import Modal from "../components/modal";
import {Calendar,LocaleConfig} from 'react-native-calendars';
import { useIsFocused,useNavigationState } from '@react-navigation/native';
import HistoryDetails from './historyDetails';

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


export default ({ route,navigation }) => {

    let { userInfo ,selectedLanguage} = useSelector(state => state.testReducer) || {};
    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    const [day, setDay] = useState({});
    const [allDaysOfMonth,setAllDaysofMonth] = useState([]);
    const [acknowledgeArray,setAcknowledgeArray] = useState([]);
    const [datesObj,setDatesObj] = useState({});
    const [selectedStaffObj,setSelectedStaffObj] = useState({})
    const isFocus = useIsFocused();
    const state = useNavigationState(state => state);
    const routeName = (state.routeNames[state.index]);
    LocaleConfig.defaultLocale = selectedLanguage;

    useEffect(() => {

        if(routeName === "HISTORY"){
          const backAction = () => {
            Alert.alert("Hold on!", "Are you sure you want to go back?", [
              {
                text: "Cancel",
                onPress: () => null,
                style: "cancel"
              },
              { 
                text: "YES", onPress: () => {toggleLoading(false);navigation.navigate(PAGES.HOME)}
              }
            ]);
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
        if(isFocus && !route?.params?.isFromHistoryDetails){
            getDateAndMonthInHistory(getCurrentDate());
        }
        
    }, [isFocus,route?.params?.isFromHistoryDetails]);

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

    const getDateAndMonthInHistory = (selectedDate)=>{
        let selected_month_num = new Date(selectedDate).getMonth();
        let current_month_num = new Date().getMonth()+1;
        
        if(current_month_num>=selected_month_num+1){
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
            getSaathiAttendanceData(d_arr);

        }else{
            setAcknowledgeArray([]);
            setDatesObj({});
        }
    }

    const getSaathiAttendanceData =async(daysInMonth) =>{
        try{
            toggleLoading(true);
            setAcknowledgeArray([]);
            let Ack_arr=[];
            await Promise.all([...daysInMonth].map((date)=>getAttendance(date,userInfo))).then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    Ack_arr.push(doc);
                  });
                  getDateWiseStatusOfStaff(Ack_arr);
                  setAcknowledgeArray(Ack_arr);
                // toggleLoading(false);
              })
              .catch((error) => {
                toggleLoading(false);
                console.log('Error querying documents:', error);
            });
           
            
        }catch(e){
            console.log(e)
            toggleLoading(false);
        }
    }
    
    const getDateWiseStatusOfStaff = (monthlyreport) =>{
      try{
        const obj = {}
        monthlyreport.forEach((elem, i) => {
                if(elem.status.length==0){
                    obj[elem.id] = {customStyles:{container: {backgroundColor: '#800000'},text:{color:"black"}}}
                }else {
                    obj[elem.id] = {customStyles:{container: {backgroundColor: 'green'},text:{color:"black"}}}
                }
            })
            setDatesObj(obj);
            if(monthlyreport.length>0){
                let dateStirng = monthlyreport[monthlyreport.length-1].id ||getCurrentDateFmt();
                  onSelectDate(dateStirng,monthlyreport)
            }

      }catch(e){
        toggleLoading(false);
        console.log("e",e)
      }
    }

    
    const getRunTimeOfSaathi = (saathiDuty)=>{
        let dutyHours ;
        let total = 0;
        for (let i = 0; i < saathiDuty.length; i++) {
         
          if (saathiDuty[i].status == true) {
            let dutyon = new Date(saathiDuty[i].timestamp);
            let hrs = dutyon.getHours();
            let mins = dutyon.getMinutes();
            let ton = hrs * 60 + mins;
            let netTime;
            if (saathiDuty[i + 1]) {
              let dutyoff = new Date(saathiDuty[i + 1].timestamp);
              let hrsoff = dutyoff.getHours();
              let minsoff = dutyoff.getMinutes();
              let toff = hrsoff * 60 + minsoff;
              netTime = toff - ton;
            } else {
              let dutyDate = new Date(saathiDuty[0].timestamp);
              let dDate = dutyDate.getDate();
              let now = new Date();
              let date = now.getDate();

              if (date == dDate) {
                let hrsoff = now.getHours();
                let minsoff = now.getMinutes();
                let toff = hrsoff * 60 + minsoff;
                netTime = toff - ton;
              }
              if (date !== dDate) {
                // console.log("hi date")
                let hrsoff = now.getHours();
                let minsoff = now.getMinutes();
                let toff = hrsoff * 60 + minsoff;
                netTime = 24 * 60 - ton;
              }
            }
            total = total + netTime;
            let m = total % 60;
            let h = (total - m) / 60;
            dutyHours =(h < 10 ? "0" : "") +h.toString() +"H" +":" +(m < 10 ? "0" : "") +m.toString() +"M";
            
          }
        }
        return dutyHours;

    }

    const onSelectDate = async (selected_date,monthlyreport) => {
        try{
            let filterdata = monthlyreport.length>0&&monthlyreport.find((eachDoc)=> {
                return eachDoc.id == selected_date &&eachDoc.status.length >0;
            });
            // console.log("filterd",filterdata)
            if(filterdata?.status?.length>0){
                let staffObj = {};
                let runTime = getRunTimeOfSaathi(filterdata.status);
                let staff_info = await getAllDetailsofStaff(userInfo[AUTHUID],filterdata.id);
                
                let routes = [],cenLat=[],cenLng=[];
                staff_info.locations.length>0&&staff_info.locations.map((item)=>{
                    cenLat.push(item.lat);
                    cenLng.push(item.long);
                    routes.push({
                            latitude : item.lat,
                            longitude : item.long,
                            status : item.status
                    })
                })
                staffObj = {...staff_info};
                staffObj["id"] = filterdata.id;
                staffObj["runTime"] = runTime;
                staffObj["routes"] = routes;
                staffObj["cenLat"] = cenLat;
                staffObj["cenLng"] = cenLng
                delete staffObj.locations;
                setSelectedStaffObj(staffObj);
                toggleLoading(false);
            }else{
                toggleLoading(false);
                setSelectedStaffObj({});
                return showErrorModalMsg("no_data_found");
            }
        }catch(e){
          toggleLoading(false);
            console.log(e)
        }
    }


    return (
        <View w={"100%"} h={"100%"} c={Color.white}>
            <Header navigation={navigation} headerText={"history"} />
            <ScrollView style={{marginBottom:20}}>
            <View mt={10}/>
            <Calendar
                onDayPress={(date)=>{toggleLoading(true);onSelectDate(date.dateString,acknowledgeArray)}}
                onMonthChange={month => { getDateAndMonthInHistory(month.dateString)}}
                markedDates={datesObj}
                markingType={'custom'}
            />
            <View mt={10}/>
            {
                Object.keys(selectedStaffObj).length === 0?
                null:<HistoryDetails staffObject = {selectedStaffObj}/>
            }
            </ScrollView>
       </View>
    )
}

