import React, { useEffect, useState,useCallback}  from 'react';
import { Dimensions, FlatList, Image,ScrollView,StyleSheet,RefreshControl,BackHandler} from "react-native";
import { useSelector, useDispatch } from 'react-redux';
import { setData } from "./../redux/action";
import { View, Text, Touch } from "./../ui-kit";
import { Color, PAGES } from '../global/util';
import Header from "../components/header";
import { useFocusEffect,useIsFocused } from '@react-navigation/native';
import IconF from 'react-native-vector-icons/FontAwesome';
import IconAnt from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { getUserTasks,getTaskPayments} from "./../repo/repo";
import styles from "./../styles/styles";

const months =["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
export default ({ navigation }) => {
   
  const dispatch = useDispatch();
  const setDataAction = (arg) => dispatch(setData(arg));
  const [isViewDetails,setIsViewDetails] = useState(false);
  const [bookings,setBookings] =useState([]);
  const [index,setIndex] = useState(0);
  const [displayDate,setDisplayDate] =useState("");
  const [isShowMonthPicker,setIsShowMonthPicker] = useState(false);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [monthDates, setMonthDates] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  let userInfo = useSelector(state => state.testReducer.userInfo) || {};
  const isFocusedBooking = useIsFocused();

  useEffect(() => {
    if(isFocusedBooking){
      loadingInBooking(true);
      setTimeout(() => {
        getDateAndMonth();
      }, 2000);
    }
  }, [isFocusedBooking]);

  const loadingInBooking = show => {
    setDataAction({"loading": {show:show,message:"loading_book"}});
  }
    
  const getDateAndMonth = ()=>{
    let CurrentDate =new Date();
    let CurrentMonth =CurrentDate.getMonth();
    let CurrentYear =CurrentDate.getFullYear();
    let CombinedMonthAndYear=months[CurrentMonth]+","+CurrentYear;
    setMonth(CurrentMonth);
    setYear(CurrentYear);
    setDisplayDate(CombinedMonthAndYear);
    getAllDaysOfMonth(CurrentMonth,CurrentYear);
  }

  const getAllDaysOfMonth =(selectedMonth,selectedYear)=>{
    let totalNoDays =new Date(selectedYear,selectedMonth+1, 0).getDate();
    let mm =selectedMonth+1,allDatesOfMonth=[],i
    mm =mm<10? "0"+mm:mm
    for(i=1;i<=totalNoDays;i++){
     i =i<10? "0"+i:i
      allDatesOfMonth.push(selectedYear+"-"+mm+"-"+i)
    }
    setMonthDates(allDatesOfMonth);
    getMonthWiseBookings(allDatesOfMonth);
  }

  const getMonthWiseBookings =async(allDatesOfMonth)=>{
    let filteredBookings=[]
    let bookings = await getUserTasks(userInfo);
          //  console.log("bb",bookings)
    bookings.length>0&&bookings.map((item)=>{
      if(allDatesOfMonth.includes(item.created_date)){
        filteredBookings.push(item)
      }
    })
    setBookings(filteredBookings);
    setRefreshing(false);
    loadingInBooking(false);
  }

  const onIncrementMonth =(Count)=>{
    if(Count>11){
        let indexOfNewMonth=Count-11;
        let increasedYear=year+1
        let CombinedMonthAndYear=months[indexOfNewMonth-1]+","+increasedYear;
        setMonth(indexOfNewMonth-1);
        setYear(increasedYear);
        setDisplayDate(CombinedMonthAndYear)
        getAllDaysOfMonth(indexOfNewMonth-1,increasedYear) 
    }else{
      let CombinedMonthAndYear=months[Count]+","+year;
        setMonth(Count);
        setDisplayDate(CombinedMonthAndYear)
        getAllDaysOfMonth(Count,year) 
    }
  }

  const onDecrementMonth=(decreasedCount)=>{
      if(decreasedCount<0){
       let indexOfNewMonth=decreasedCount+12;
       let decreasedYear=year-1
       let CombinedMonthAndYear=months[indexOfNewMonth]+","+decreasedYear;
       setMonth(indexOfNewMonth);
       setYear(decreasedYear);
       setDisplayDate(CombinedMonthAndYear)
       getAllDaysOfMonth(indexOfNewMonth,decreasedYear) 
      }else{
     
       let CombinedMonthAndYear=months[decreasedCount]+","+year;
       setMonth(decreasedCount);
       setDisplayDate(CombinedMonthAndYear)
       getAllDaysOfMonth(decreasedCount,year) 
       }
  }

  const showTaskList =(displaytext,value,mt)=>{
  return(
    <View row mt={mt}>
      <Text s={14}  c={"#000000"} t={displaytext}/>
      <Text s={14}  c={"#000000"} t={":"}  a ri={200}/>
      <Text s={14}   a  ri={20} t={value} />
    </View>
  )
  }

  const showTaskDetails =(text,value,text1,value1)=>{
    return(
      <View row mt={10} ml={2}>
              <View row>
               <Text t={text}/>
               <Text t={" : "}/>
               <Text t={value}/>
              </View>
              <View row a ri={4}>
               <Text t={text1}/>
               <Text t={" : "}/>
               <Text t={value1}/>
              </View>
      </View>
    )
  }
  
  const onRefresh = React.useCallback(() => {
      setRefreshing(true);
      getDateAndMonth();
  }, []);

  
  // useFocusEffect(
  //     React.useCallback(() => {
  //       setTimeout(() => {
  //         getDateAndMonth()
  //     }, 5000);
  //     }, [])
  // );
   
  
  return <View c={"white"} h={"100%"} W={"100%"}>
    <Header navigation={navigation} headerText={"booking"}/>
    <View row mt={29} mh={"5%"} w={"90%"}>
      <Touch boc={'green'} h={30} bw={1} w={"40%"} br={6} 
        onPress={()=>{navigation.navigate(PAGES.ADDNEWBOOKING)}}
      >
        <Text c={Color.themeColor} s={16} center ai t={"new_booking"}/>
      </Touch>
      <View row a ri={2} h={30}>
        <Icon size={28} name={"angle-left"}
          color={Color.themeColor}
          onPress={()=>{onDecrementMonth(month-1)}} 
        /> 
        <Text t={displayDate} s={22} mh={6}/>
        <Icon size={28} name={"angle-right"}
          color={Color.themeColor}
          onPress={()=>{onIncrementMonth(month+1)}}
        /> 
      </View>
    </View>
    <ScrollView 
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }>
        {Array.isArray(bookings)?
          bookings.map((each, index)=>{
            let bookedDate= each.created_date.split("-").reverse().join("/")
            let bookedForDate =!each.bookingFor?"unavailable":each.bookingFor
            let task_id =!each.t_id?"unavailable":each.t_id
            let tasktype =!each.taskType?"unavailable" :each.taskType
            let state_type =!each.state?"ACTIVE":each.state

            return <Touch key={index} mh={"2%"} w={"96%"} h={120} mt={40} br={2} bw={2} 
                      boc={"#CCCCCC"} bc={"#fbfbfb"}  
                      onPress ={()=>{setIsViewDetails(true);setIndex(index);}}
                    >
                      <View row pa={10}>
                        <Text t={each?.selectedWasteType?.name || "N/A"} b/>
                        <Text t={state_type} a c={"white"} center w={140} to={10} ri={4} style={{borderRadius:10}}
                          bc={ state_type === "ACTIVE"?"orange": state_type === "ASSIGNED"?"green":"#888888"} 
                        />
                      </View>
                      <View bw={1} w={"100%"} bc={"#CCCCCC"}/>
                      {
                        showTaskDetails("tId",task_id,"taskType",each?.selectedWasteType?.name || N/A)
                      }
                      {
                        showTaskDetails("bookedOn",bookedDate,"bookedFor",bookedForDate)
                      }
                    </Touch>
          }):null
        }
        <View h={40}/>
      </ScrollView>
      {isViewDetails? 
        <View a c={'#00000066'} jc ai h={"100%"}  w={"100%"}>
          <View style={styles.bookingbottomView}>
            <View mt={20} mb={20}>
              <Text s={20} c={"black"} b  center t={bookings[index].selectedWasteType.name}/>
            </View>
            <View mt={20} ml={40}>
              {
                showTaskList("full_name",userInfo.name,0)
              }
              {
                showTaskList("mobile_num",userInfo.phoneNumber,8)
              }
              {
                showTaskList("emailid",userInfo.email,8)
              }
              {
                showTaskList("requestType",bookings[index].selectedWasteType.name,8)
              }
              {
                showTaskList("bookedOn",bookings[index].created_date.split("-").reverse().join("/"),8)
              }
              {
                showTaskList("bookedFor",bookings[index].bookingFor?bookings[index].bookingFor:"unavailable",8)
              }
              {
                showTaskList("assignedTo",bookings[index].assigneeName?bookings[index].assigneeName:"unavailable",8)
              }
            </View>
            <IconAnt size={32}
              color={"red"}
              name={"closecircle"}
              style={{position:"absolute",top:18,right:16}}
              onPress={()=>{setIsViewDetails(false)}} 
            />
            <View h={40}/>
          </View>    
        </View> :null 
      } 
    </View>
}
