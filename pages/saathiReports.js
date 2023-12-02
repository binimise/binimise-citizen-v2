import React, { useState, useEffect, useReducer } from "react";
import { Image, StyleSheet, Dimensions, ScrollView,BackHandler } from "react-native";
import { View, Text, Touch, TextInput } from "../ui-kit";
import Header from "../components/header";
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import { Color,getCurrentDateFmt,PAGES } from '../global/util';
import { getAttendanceOfSaathi } from "./../repo/repo";
import { useIsFocused,useNavigationState } from '@react-navigation/native';
import Styles from "../styles/styles";
import { Calendar, LocaleConfig } from 'react-native-calendars';
import IconAnt from 'react-native-vector-icons/AntDesign';
let { width } = Dimensions.get("window");


export default ({ navigation }) => {

    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    let { userInfo } = useSelector(state => state.testReducer) || {};
    const [attendedSaathis, setAttendedSaathis] = useState([]);
    const [isShowList, setIsShowList] = useState(false);
    const state = useNavigationState(state => state);
    const routeName = (state.routeNames[state.index]);
    const isFocused = useIsFocused();

  
    useEffect(()=>{
        if (isFocused) {
            getAttendaceOfEachSaathi(getCurrentDateFmt());
        } 
        setIsShowList(false);
    },[isFocused])

    useEffect(() => {

        if(routeName === "saathiReports"){
          const backAction = () => {
            setDataAction({
                confirmModalInfo : {
                    showModal : true,
                    title : "Hold on!",
                    message : "Are you sure you want to go back?",
                    primaryText : "YES",
                    primaryAction : () => {
                        setDataAction({ 
                            confirmModalInfo : { showModal: false }
                        });
                        setAttendedSaathis([]);
                        toggleLoading(false);
                        setIsShowList(false);
                        navigation.navigate(PAGES.HOME)
                    },
                    secondaryText : "NO",
                    secondaryAction : () => {
                        setDataAction({ confirmModalInfo : { showModal: false }});
                    }
                }
            });
            return true;
          };
          const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
          );
    
          return () => backHandler.remove();
        }
    });

    const toggleLoading = show => {
        setDataAction({ "loading": { show } });
    }

    const getAttendaceOfEachSaathi = async (date) => {
        try {
            toggleLoading(true);
            let arr_length = userInfo?.saathi_list?.length || 0;
            if(arr_length === 0){
                toggleLoading(false);
                return showErrorModalMsg("no_staff_assign");
            }
            let i;
            let Ack_arr = [];
            for (i = 0; i < arr_length; i++) {
                let querySnapshot = await getAttendanceOfSaathi(date, userInfo?.saathi_list[i])
                let queryData = querySnapshot?.data?.()?.status || [];

                let runTime = "", onTime = "", offTime = "";
                if (queryData.length > 0) {
                    runTime = getRunTimeOfSaathi(queryData);
                    onTime = getDutyOnTime(queryData);
                    offTime = getDutyOffTime(queryData);
                }
                let obj = { "name": userInfo?.saathi_list[i].name,
                            "phoneNumber":userInfo?.saathi_list[i].phoneNumber,
                     "runTime": runTime, "onTime": onTime, "offTime": offTime }
                Ack_arr.push(obj);


            }
            setAttendedSaathis(Ack_arr);
            toggleLoading(false);
            // if(Ack_arr.length>0){
            //     setIsShowList(false);
            // }            


        } catch (e) {
            console.log("e", e)
        }

    }

    const getDutyOnTime = (saathi_status) => {
        let dutyon = new Date(saathi_status[0].timestamp);
        let hrs = dutyon.getHours();
        let mins = dutyon.getMinutes();
        return hrs + ":" + mins;
    }
    const getDutyOffTime = (saathi_status) => {
        if (saathi_status.length > 1 && saathi_status[saathi_status.length - 1].status == false) {
            let dutyoff = new Date(saathi_status[saathi_status.length - 1].timestamp);
            let hrs = dutyoff.getHours();
            let mins = dutyoff.getMinutes();
            return hrs + ":" + mins;
        }
        return " ";

    }

    const getRunTimeOfSaathi = (saathiDuty) => {
        let onTIme
        let dutyHours;
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
                dutyHours = (h < 10 ? "0" : "") + h.toString() + "H" + ":" + (m < 10 ? "0" : "") + m.toString() + "M";

            }
        }
        return dutyHours;

    }


    const showErrorModalMsg = (message, title = "message") => {
        setDataAction({
            errorModalInfo: {
                showModal: true, title, message
            }
        })
    };

    const onDayPress = async (date) => {setIsShowList(false);getAttendaceOfEachSaathi(date.dateString)};

    const isOnline = (saathi) => {
        if(!saathi.onTime) return false;
        if(["00:00", "", " "].includes(saathi.offTime)) return true;
        return false;
    }

    const isPresent = (saathi) => {
        if(!saathi.onTime) return false;
        return true;
    }

  

    const calendarIcon =()=>(
        <IconAnt size={30}
           name={"calendar"}
           color ={Color.themeColor}
           style={{right:10}}
           onPress={()=>{setIsShowList(true);setAttendedSaathis([])}}
         /> 
       )


    return <View>
        <Header navigation={navigation} headerText={"reports"} calendarIcon = {calendarIcon}/>
        {isShowList ? <View>
            <View mt={100} />
            <Calendar
                maxDate = {getCurrentDateFmt()}
                onDayPress = {onDayPress}
                markingType = {'custom'}
            />
        </View> :
            <View w={"100%"} h={"100%"} style={{position:"relative"}}>
                {/* <IconAnt 
                    size={40} 
                    name={"calendar"}  
                    style={{position:"absolute",right:"5%",color:"green"}}
                    onPress={() => setIsShowList(true)}
                />  */}
                    
                {/* <Touch jc ai w={"90%"} mh={"5%"} mt={20} onPress={() => setIsShowList(false)} bc={Color.themeColor} br={16} >
                    <Text t={"close"} s={18} c={"white"} b />
                </Touch> */}
                 <Text t={"staff_reports"} ml={"5%"} b/>
                <ScrollView style={{marginVertical:20}}>
                    
                    {attendedSaathis.length > 0 && attendedSaathis.map((each, index) => {
                        return <View style={Styles.cardStyle} w={"90%"} mh={"5%"} key={index}>
                            <View row mb={4}>
                                <Text s={18} t={"name"} c={"black"} b />
                                <Text s={18} t={" :"} c={"black"} b />
                                <Text s={18} t={each.name} c={"black"} />
                            </View>
                            <View row mb={4}>
                                <Text s={18} t={"phoneNumber"} c={"black"} b />
                                <Text s={18} t={" :"} c={"black"} b />
                                <Text s={18} t={each.phoneNumber} c={"black"} />
                            </View>
                            {
                                each.onTime ? <><View row mb={4}>
                                    <Text s={18} t={"duty_on"} c={"black"} b />
                                    <Text s={18} t={" :"} c={"black"} b />
                                    <Text s={18} t={each.onTime} c={"black"} />
                                </View>
                                <View row mb={4}>
                                    <Text s={18} t={"duty_off"} c={"black"} b />
                                    <Text s={18} t={" :"} c={"black"} b />
                                    <Text s={18} t={each.offTime} c={"black"} />
                                </View>
                                <View row mb={4}>
                                    <Text s={18} t={"total_hours"} c={"black"} b />
                                    <Text s={18} t={" :"} c={"black"} b />
                                    <Text s={18} t={each.runTime} c={"black"} />
                                </View></> : null
                            }
                            <View row mb={4}>
                                <Text s={18} t={"current_status"} c={"black"} b />
                                <Text s={18} t={" :"} c={"black"} b />
                                <Text s={18} t={isOnline(each) ? " Online" : " Offline"} c={isOnline(each) ? "green" : "red"} />
                            </View>
                            <View row mb={4}>
                                <Text s={18} t={"attendance"} c={"black"} b />
                                <Text s={18} t={" :"} c={"black"} b />
                                <Text s={18} t={isPresent(each) ? " Present" : " Absent"} c={isPresent(each) ? "green" : "red"} />
                            </View>
                        </View>
                    })}
                </ScrollView>
                <View h={100} />
            </View>



        }

    </View>

}

