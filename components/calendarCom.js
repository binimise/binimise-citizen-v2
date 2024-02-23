import React from "react";
import { Dimensions } from "react-native";
import {View,Text} from "../ui-kit";
import {Calendar,LocaleConfig} from 'react-native-calendars';
import { Color } from "../global/util";
import IconAnt from 'react-native-vector-icons/AntDesign';
import { getCurrentDate } from "../global/util";
let { width,height } = Dimensions.get("window");

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

const CalenderCom = (props) => {
    const { show,handleCloseCalendar,handleSelectDate } = props;

    if (!show) return null;

    return <View a w={width} h={height} c={"rgba(52,52,52,0.5)"} jc ai>
        <IconAnt 
                size = {32} 
                color = {Color.red}  
                name = {"closecircle"}
                style = {{marginTop:20,marginBottom:20}}
                onPress = {handleCloseCalendar} 
            />
        <View w={width - 48} c={Color.white}>
            
            <Calendar
                onDayPress={(date) => handleSelectDate(date.dateString)}
                markingType = {'custom'}
                maxDate = {getCurrentDate()}
            />

        </View>

    </View>
}

export default CalenderCom;