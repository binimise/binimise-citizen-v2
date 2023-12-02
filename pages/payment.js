import React, {useState, useEffect}  from 'react';
import { ScrollView,Dimensions,Alert} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import { View, Text, Touch, TextInput,Picker} from "./../ui-kit";
import Header from "../components/header";
import * as Location from 'expo-location';
import {addpayment ,getSettingsData,addHousehold,sendpaymentreceipt,getHouseholdData,getHouseholdPaymentById,
  getUserByQrCode, getUsersNearby,getHouseholdDataByName,getHouseholdDataById,getUserData,getCitizenData} from "./../repo/repo";
import { Color,PAGES } from '../global/util';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconAnt from 'react-native-vector-icons/AntDesign';
import BarScanner from "./../components/barcodeScanner";
import AddPayment from './addpayment';
let { width, height } = Dimensions.get('window');



export default ({ navigation }) => {

  const dispatch = useDispatch();
  const setDataAction = (arg) => dispatch(setData(arg));
  const [searchByName, setSearchByName] = useState(false);
  const [picker,  setPicker] = useState('');
  const [usersData,  setUsersData] = useState({});
  const [payment, setPayment] = useState();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [householdname, setHouseholdname] = useState("");
  const [scrollview, setScrollView] = useState({});
  const [showScanner, setShowScanner] = useState(false);
  const [index, setIndex] = useState(false);
  const [PaymentType, setPaymentType] = useState([]);
  const [saathiWards, setSaathiWards] = useState([]);
  const [scannedValue, setScannedValue] = useState("");
  const [searchByUserQr, setSearchByUserQr] = useState(false);
  const [isViewAddPayment,setIsViewAddpayment] = useState(false);
  let { userInfo } = useSelector(state => state.testReducer) || {};

 

  closePaymentPage = ()=>{
    setIsViewAddpayment(false);
    __getUserDetailsFromHousehold(usersData);
    
  }
  getScannedValue = scannedValue => {
    if(!scannedValue){
        return showErrorModalInPayment("incorrect bar code");
    }   
    setScannedValue(scannedValue);
    __searchUserByQr(scannedValue);
  }

  __searchUserByQr = async (scannedValue) => {
    toggleLoading(true);
    let _wardUsers = await getUserByQrCode(scannedValue);
    if(!_wardUsers){
      setUsersData({});
      toggleLoading(false);
      return showErrorModalInPayment("unable_to_find_users");
    }else{
      __getUserDetailsFromHousehold(_wardUsers);
    }
  }
  __getUserDetailsFromHousehold = async(Users)=>{
    let data = await getHouseholdDataById(Users.authUid);
    let p_array = await getHouseholdPaymentById(Users.authUid);
    if(data){
      data.Paymentsarray = p_array?p_array:[]
    }
    await commonArrayData(data);
  }

  commonArrayData =async (incomingData)=>{
    if(incomingData&&userInfo?.ward?.length>0&&userInfo.ward.includes(incomingData?.areaCode))
    {
      let data=  await getUserPaymentDetails(incomingData);
      setUsersData(data);
      toggleLoading(false);
    }else{
      setUsersData({});
      toggleLoading(false);
      return showErrorModalInPayment("not_belongs_to_ward")
    }
  }

  getUserPaymentDetails = (userData) => {
    let date = new Date()
    let mon = date.getMonth() + 1;
    if(mon < 10) mon = "0" + mon;
    let totalMonths=userData.Paymentsarray!=undefined?userData.Paymentsarray:[]
    let pay =0
    if(totalMonths.length>0&&totalMonths[0].month)
    {
      let lastmonth= totalMonths[totalMonths.length-1].month.split("-")
      let due_amount = totalMonths[totalMonths.length-1].due_amount
      let advance_amount = totalMonths[totalMonths.length-1].advance_amount
     
      let l_y = parseInt(lastmonth[1])*12
      let l_m = parseInt(lastmonth[0])
      let p_y = (date.getFullYear())*12
      let p_m = date.getMonth()+1
      let Count = (l_y+l_m)-(p_y+p_m)
      pay = (Count)*30    
      if(due_amount>0){
        pay = pay-due_amount
      }else if(advance_amount>0){
        pay =pay+advance_amount
      }

    }
    userData.pay =pay
    return userData;
  }  


  closeModal = () => {
    setShowScanner(false);
  }


  useEffect(() => {
    // getPaymentsFromSettings();
    getSaathiData();
  }, [userInfo.status]);


  getSaathiData = async()=>{
    let SaathiData = await getUserData(userInfo.phoneNumber);
    setSaathiWards(SaathiData?.ward?SaathiData.ward:[])
  }


  toggleLoading = show => {
    setDataAction({"loading": {show}});
  }
    
  onChangeMobileNumber = (field, value) => {
    setPhoneNumber(value)
  }


  showErrorModalInPayment = (message, title = "message") => {
    setDataAction({ 
      errorModalInfo : {
        showModal : true, title, message
      }
    })
  };


  searchUser = async () => {
    if(phoneNumber.length != 10){
      return showErrorModalInPayment("please_enter_10_digit_phonenumber");
    }
    toggleLoading(true);
      let _wardUsers = await getCitizenData(phoneNumber);
      if(!_wardUsers){
        setUsersData({});
        toggleLoading(false);
        return showErrorModalInPayment("unable_to_find_users");
      }else{
        __getUserDetailsFromHousehold(_wardUsers);
        
      }
    }
    
  searchByPhone = () => {
    return (
      <View mt={16} mb={16} w={"90%"} mh={"5%"} bc={"#F0F0F0"} br={4} bw={1}>
        <Text t={"search_user_by_phoneNumber"}/>
        <View row mb={4}>
          <View br={4} bc={Color.lightGrayColor} c={"white"} w={width - 80} bw={1} pt={4} pb={4} mb={8}>
            <Text s={12} ml={16} c={Color.lightGrayColor} t={'search'} />
            <TextInput ml nl={1} ph={'9989443788'} pl={16} h={24}
              k={"numeric"} maxLength={10} name={"phoneNumber"}
              onChangeText={onChangeMobileNumber} value={phoneNumber}
            />
          </View>
          <Touch row jc ai w={40} bw={1}bc={'white'} h={48} ml={2} br={4}
            onPress={ searchUser } boc={Color.themeColor}>
            <Icon size={22}
              name={"search"}
              color={Color.themeColor} 
            />
          </Touch>
        </View>
        <Text u c={Color.themeColor} t={"donot_have_phoneNumber_press_here"}
          onPress={() => {setSearchByUserQr(false);}} mt={4} mb={4}
        />
      </View>
    )
  }
  searchByQrView = () => {
    return (
      <View mt={16} mb={16} w={"90%"} mh={"5%"} bc={"#F0F0F0"} br={4} bw={1}>
        <Text t={"search_user_qr"}/>
        <View br={4} bc={Color.lightGrayColor} bw={1} pt={4} pb={4} mb={8}>
          <Touch h={38} c={Color.black} w={'100%'} ai row jc b={false}
            onPress={() => {setShowScanner(true)}}
          >
            <IconAnt size={18} name={"scan1"}
              color={Color.themeColor} 
            />
            <Text b s={16} t={'scan_qr'} ml={8}/>
          </Touch>
        </View>
        <Text u t={"search_user_by_phoneNumber"} c={Color.themeColor}
          onPress={() => {setSearchByUserQr(true);}} mt={4} mb={4}
        />
      </View>
    )
  }
  if(isViewAddPayment){
    return <AddPayment userDetails={usersData} closePage={closePaymentPage} isFromPayment={true}/>
  }

  return showScanner ? <BarScanner getScannedValue={getScannedValue} closeModal={closeModal} /> :
    <View c={"white"} w={width} h={"100%"}>
      <View row ai c={Color.white}  w={"100%"} h={60}>
        <Header headerText={"payments"} navigation={navigation} />
      </View>
      {userInfo.status ?
        <View>
          {
            searchByUserQr ? searchByPhone(): searchByQrView()
          }
          {usersData?.phoneNumber?
           <Touch mt={50} bw={1} boc={"green"} w={"90%"} mh={"5%"} h={120} 
              bc={"white"} br={8} 
              // onPress={()=>setIsViewAddpayment(true)}
            > 
              <View row ml={10}>
                <Text t={"waste"}  b  s={20}/>
                <Text t={" : "}  b  s={20}/>
              </View>
              <View w={"100%"} bw={1} bc={"#3E3E3E"}/>
              
              <View row ma={10}> 
                <Text t={usersData?.pay<=0?"pending_amount":"advance_amount"} s={18} b/>
                <Text t={" : "} s={18} b/>
                <Text t={usersData?.pay<0?-(usersData?.pay):usersData?.pay}
                  c={usersData?.pay<0?"red":"green"}  s={18} b
                />
              </View>
            </Touch>
          :null}
        </View> :
        <View a c={Color.backgroundModalColor} jc ai zi={999} to={60} le={0} h={height} w={width}>
          <View w={width - 48} br={8} c={Color.white} jc pa={2} h={80}>
            <Text t={"switch_on_duty"} center b pa={10} s={24}/>
          </View>
        </View>
      }
       
    </View>

  
};

