import React, { useState, useEffect }  from 'react';
import { Dimensions,ScrollView } from "react-native";
import { Color, PAGES } from "./../global/util";
import { View, Text, Touch,PickerModal } from "../ui-kit";
import Header from "../components/header";
import { getFuelRequest } from '../repo/repo';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useIsFocused } from '@react-navigation/native';
let { height, width } = Dimensions.get("window");

const AppOrNotApp = [
  {id:"approved",name :"Approved" },
  {id:"notApproved",name :"Not Approved"}
]

export default ({ navigation }) => {

  const [ fuelRequstList,setFuelRequestList ] = useState([]);
  const [ isApprovedModal,setIsApprovedModal ] = useState(false);
  const [ selectedValue,setSelectedValue ] = useState("");
  const isFocused = useIsFocused();

  useEffect(()=>{
    getFuelRequestData();
  },[isFocused])

  const  getFuelRequestData = async(selected_key)=>{
    let fuel_list = await getFuelRequest(selected_key);
    fuel_list.length>0&&fuel_list.forEach((eachitem)=>{
      eachitem.show = true;
    })
    setFuelRequestList(fuel_list);
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

  isClosedFilterModal = ()=>{
    setIsApprovedModal(false);
  }
   
  selectedPickerData = (key,data)=>{
    setSelectedValue(data);
    let selected_key = (data == "Approved")? true: false;
    getFuelRequestData(selected_key);
  }

  return <View w={width} h={height} c={Color.white}>
    <Header navigation={navigation} headerText={"fuel_management"}/>
    <View h={1} bw={0.5} bc={"#CCCCCC"}/>
    <View mh ={"5%"} w ={"90%"} mt={29}>
      <Touch  
        row jc ai w={140} h={30} br={6} bw={1}  s={18} pv={2}
        boc={Color.themeColor} c={Color.themeColor} 
        onPress = {()=>setIsApprovedModal(true)}
      >
        <Icon 
          size={16}
          name={"filter"}
          color={Color.themeColor} 
        />
        <Text c={Color.themeColor} ml={2} b t={selectedValue?selectedValue:"all"} />
      </Touch>

      <Touch 
        row jc ai w={140} h={30} br={6} bw={1} s={14} t={"new_request"}
        boc={Color.themeColor} c={Color.themeColor} style = {{position:"absolute",right:0}}
        onPress = {()=>navigation.navigate(PAGES.ADDFUELREQUEST)}
      />
    </View>
    
    <ScrollView>
      {Array.isArray(fuelRequstList)?
        fuelRequstList.map((each, index)=>{
        let bookedDate= each.date.split("-").reverse().join("/");
          return (
            <Touch 
              key={index} mh={"5%"} w={"90%"} h={120} mt={40} 
              br={2} bw={2} boc={"#CCCCCC"} bc={"#fbfbfb"}  
            >
              <View row pa={10}>
                <Text t={each?.vehicle_name} b/>
                <Text t={each?.isApproved ? "Approved":"Not Approved"} a c={"white"} 
                  center w={140} to={10} ri={4} style={{borderRadius:10}}
                  bc={ each?.isApproved?"green":"#888888"} 
                />
              </View>
              <View bw={1} w={"100%"} bc={"#CCCCCC"}/>
              {
                showTaskDetails("vehicle_id",each.vehicle_id,"date",bookedDate)
              }
              {
                showTaskDetails("quantity",each.fuelQuantity,"saathi",each?.saathi_name)
              }
            </Touch>
          )}):null
      }
      <View h={40}/>
    </ScrollView>
    {isApprovedModal&&
        <PickerModal 
          items = {AppOrNotApp}
          selectedValue = {selectedValue} 
          selectedPicker = {selectedPickerData}
          isClosedModal = {isClosedFilterModal}
          height_in = {250}
        />
    }
            
  </View>
          
   
}
