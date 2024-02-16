import React, { useEffect, useState,useCallback}  from 'react';
import { Dimensions, FlatList, Image,ScrollView,StyleSheet,RefreshControl,BackHandler} from "react-native";
import { useSelector, useDispatch } from 'react-redux';
import { setData } from "./../redux/action";
import { View, Text, Touch } from "./../ui-kit";
import { Color, PAGES } from '../global/util';
import Header from "../components/header";
import { useNavigationState,useIsFocused } from '@react-navigation/native';
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
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  let userInfo = useSelector(state => state.testReducer.userInfo) || {};
  const isFocusedBooking = useIsFocused();
  const navigationValue = useNavigationState(state => state);
  const routeName = (navigationValue.routeNames[navigationValue.index]);
  const [originalData,setOriginalData] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [closedTasks, setClosedTasks] = useState([]);

  const loadingInBooking = show => {
    setDataAction({"loading": {show:show,message:"loading_book"}});
  }
    
  useEffect(() => {
    if(routeName === PAGES.BOOKING){
      const backAction = () => {
        if(isViewDetails){
          setIsViewDetails(false);
          return true;
        }
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
    if(isFocusedBooking){
      loadingInBooking(true);
      // setTimeout(() => {
        getDateAndMonth();
      // }, 2000);
    }else{
      loadingInBooking(false);
    }
  }, [isFocusedBooking]);

 
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
    getMonthWiseBookings(allDatesOfMonth);
  }

  const getMonthWiseBookings =async(allDatesOfMonth)=>{
    let filteredBookings = [],Active = [],Assigned = [],Closed = [];
    let bookings = await getUserTasks(userInfo);
          //  console.log("bb",bookings)
    bookings.length>0&&bookings.map((item)=>{
      if(allDatesOfMonth.includes(item.created_date)){
        filteredBookings.push(item)
      }
      if(item.state == "ACTIVE"){
        Active.push(item)
      }
      if(item.state == "ASSIGNED"){
        Assigned.push(item);
      }
      if(item.state == "CLOSED"){
        Closed.push(item);
      }
    })
    setBookings(filteredBookings);
    setOriginalData(filteredBookings);
    setActiveTasks(Active);
    setAssignedTasks(Assigned);
    setClosedTasks(Closed);
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
   
  const getSelectedTasks = (type) =>{
    if(type === "ALL"){
      setBookings(originalData);
      return;
    }
    let temp = [];
    originalData.map((eachDoc)=>{
      if(eachDoc.state === type){
        temp.push(eachDoc);
      }
    });
    setBookings(temp || []);
  }

  const showTouchBar = (touchColor,selectedType,taskCount,text) => {
    return (
        <Touch ai jc bc = {touchColor} br = {6} w = {"24%"} h = {100}
          onPress={() => getSelectedTasks(selectedType)}
        >
          <Text 
            s = {22} b c = {Color.white}
            t = {taskCount}
          />
          <Text t = {text} s = {14} c = {Color.white} />
        </Touch>
    )
  }
  
  return (
    <View c = {Color.white} h = {"100%"} w = {"100%"}>
      <Header navigation = {navigation} headerText = {"booking"}/>
      

      <View 
        style={{ display: "flex", flexWrap: 'wrap', flexDirection: "row" }} 
        w = {'90%'} mt = {"10%"} mh = {"5%"}
      >
        {
          showTouchBar(Color.skyBlue,"ALL",(originalData.length || 0),"all")
        }
        {
          showTouchBar(Color.blue,"ACTIVE",(activeTasks.length || 0),"active")
        }
        {
          showTouchBar(Color.red,"ASSIGNED",(assignedTasks.length || 0),"assign")
        }
        {
          showTouchBar("#009900","CLOSED",(closedTasks.length || 0),"close")
        }
      </View>

      <View row mt={29} mh={"5%"} w={"90%"}>
        <Touch boc={Color.themeColor} h={30} bw={1} w={"40%"} br={6}
          onPress={() => { navigation.navigate(PAGES.ADDNEWBOOKING) }}
        >
          <Text c={Color.themeColor} s={16} center ai t={"new_booking"} />
        </Touch>
        <View row a ri={2} h={30}>
          <Icon size={28} name={"angle-left"}
            color={Color.themeColor}
            onPress={() => { onDecrementMonth(month - 1) }}
          />
          <Text t={displayDate} s={22} mh={6} />
          <Icon size={28} name={"angle-right"}
            color={Color.themeColor}
            onPress={() => { onIncrementMonth(month + 1) }}
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
        {Array.isArray(bookings) ?
          bookings.map((each, index) => {
            let bookedDate = each.created_date.split("-").reverse().join("/")
            let bookedForDate = !each.bookingFor ? "N/A" : each.bookingFor
            let task_id = !each.t_id ? "N/A" : each.t_id
            let tasktype = !each.taskType ? "N/A" : each.taskType
            let state_type = !each.state ? "ACTIVE" : each.state

            return <Touch key={index} mh={"2%"} w={"96%"} h={120} mt={40} br={2} bw={2}
              boc={"#CCCCCC"} bc={"#fbfbfb"}
              onPress={() => { setIsViewDetails(true); setIndex(index); }}
            >
              <View row pa={10}>
                <Text t={each?.selectedWasteType?.name || "N/A"} b />
                <Text t={state_type} a c={"white"} center w={140} to={10} ri={4} style={{ borderRadius: 10 }}
                  bc={state_type === "ACTIVE" ? "blue" : state_type === "ASSIGNED" ? "red" : "#009900"}
                />
              </View>
              <View bw={1} w={"100%"} bc={"#CCCCCC"} />
              {
                showTaskDetails("tId", task_id, "taskType", each?.selectedWasteType?.name || N / A)
              }
              {
                showTaskDetails("bookedOn", bookedDate, "bookedFor", bookedForDate)
              }
            </Touch>
          }) : null
        }
        <View h={40} />
      </ScrollView>
      {isViewDetails ?
        <View a c={'#00000066'} jc ai h={"100%"} w={"100%"}>
          <View style={styles.bookingbottomView}>
            <View mt={20} mb={20}>
              <Text s={20} c={"black"} b center t={bookings[index].t_id || "N/A"} />
            </View>
            <View mt={20} ml={40}>
              {
                showTaskList("full_name", userInfo.name, 0)
              }
              {
                showTaskList("mobile_num", userInfo.phoneNumber, 8)
              }
              {
                showTaskList("req_veh", bookings[index]?.selectedWasteType?.name || "N/A", 8)
              }
              {
                showTaskList("bookedOn", bookings[index]?.created_date?.split("-").reverse().join("/"), 8)
              }
              {
                showTaskList("bookedFor", bookings[index]?.bookingFor || "N/A", 8)
              }
              {
                showTaskList("assignedTo", bookings[index]?.assigneeName || "N/A", 8)
              }
            </View>
            <IconAnt size={32}
              color={"red"}
              name={"closecircle"}
              style={{ position: "absolute", top: 18, right: 16 }}
              onPress={() => { setIsViewDetails(false) }}
            />
            <View h={40} />
          </View>
        </View> : null
      }
    </View>

  ) 
  
}
