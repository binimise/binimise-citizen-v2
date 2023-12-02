import React, {useState, useEffect}  from 'react';
import { ScrollView,Dimensions,Alert,StyleSheet} from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import { View, Text, Touch, TextInput,Picker} from "./../ui-kit";
import {addpayment ,getSettingsData,addHouseholdPayment,sendpaymentreceipt,getLastPaymentDocument} from "./../repo/repo";
import { Color,getCurrentDateFmt, PAGES } from '../global/util';
import styles from '../styles/styles';
import Icon from 'react-native-vector-icons/FontAwesome';
let { width, height } = Dimensions.get('window');



// export default (props) => {
  export default ({ route,navigation }) => {
  // let userDetails = props?.userDetails
  let userDetails =route?.params?.userDetails
  const dispatch = useDispatch();
  const setDataAction = (arg) => dispatch(setData(arg));
  const [picker,  setPicker] = useState('');
  const [payment, setPayment] = useState();
  const [PaymentType, setPaymentType] = useState([]);
  const [ispickerShow,setIsPickerShow] = useState(false);
  const [showPaymentTypeModal,setShowPaymentTypeModal] = useState(false);
  const [isPaymentAddedModal,setIsPaymentAddedModal] = useState(false)
  const [inputPay,setInputPay] = useState("")
  let { userInfo ,selectedLanguage} = useSelector(state => state.testReducer) || {};
  useEffect(() => {
    getPaymentsFromSettings();
  }, []);

  toggleLoading = show => {
    setDataAction({"loading": {show}});
  }

  getNameFromData = (key)=>{
    let m_name=""
    if(selectedLanguage =="en"&&key == "monthly"){
      return m_name = "Monthly"
    }else if(selectedLanguage =="en"&&key == "quarterly"){
      return m_name = "Quarterly"
    }else if(selectedLanguage =="en"&&key == "half_yearly"){
      return m_name = "Half Yearly"
    }else if(selectedLanguage =="en"&&key == "yearly"){
      return m_name = "Yearly"
    }else if(selectedLanguage =="hn"&&key == "monthly"){
      return m_name = "महीने के"
    }else if(selectedLanguage =="hn"&&key == "quarterly"){
      return m_name = "त्रैमासिक"
    }else if(selectedLanguage =="hn"&&key == "half_yearly"){
      return m_name = "अर्धवार्षिक"
    }else if(selectedLanguage =="hn"&&key == "yearly"){
      return m_name = "सालाना"
    }
    return m_name;

  }

  getPaymentsFromSettings=async()=>{
    let paymentData=await getSettingsData()
    let paymentArray = [];
    Object.keys(paymentData).forEach((key) => {
        paymentArray.push({id:key,name: getNameFromData(key)+"  -  "+paymentData[key],val:parseInt(paymentData[key])});
    });
    let modifiedPaymentArray= paymentArray.sort(function(a, b) {
      return (a.val)>(b.val)
    });
    setPaymentType(modifiedPaymentArray)
  }

  if(ispickerShow){
    return(
      <View a c={Color.backgroundModalColor} jc ai zi={999} to={0} le={0} h={height} w={width}>
          <View w={width - 24} br={8} c={Color.white} jc pa={16} h={"90%"}>
            <Text t={"select_your_payment"} center s={20} />
            <View w={"90%"} bw={0.5} mh={"5%"} bc={"black"} mb={"4%"}/>
            <ScrollView>
              {PaymentType.length>0&&PaymentType.map((each,index)=>{
                return  <View key={index} mb={4}>
                <Touch h={40} w={"90%"} mh={"5%"} row key={index} bc={"#F0F8FF"} 
                    ai br={16} onPress={() => {setPicker(each.id);setPayment(each.val)}}
                >
                    <View style={styles.radioCircle}>
                        {each.id===picker && <View style={styles.selectedRb} />}
                    </View>
                    <Text center ml={2} s={18} t={each.name} />
                </Touch>
                <View h={1} bw={0.5} bc={"#CCCCCC"} mh={"5%"} w={"90%"}/>
            </View>
              })}
            </ScrollView>
            <View w={"90%"} bw={0.5} mh={"5%"} bc={"black"}/>
              <View row jc>
                <Touch h={40} w={"40%"} jc ai t={"close_c"} mb={4} boc={"#F0F0F0"} bc={"red"}
                  mt={2} mr={10} bw={2} br={16} onPress={() =>{setIsPickerShow(false)}}/>
                <Touch h={40} w={"40%"} jc ai t={"submit"} mb={4} boc={"#F0F0F0"} bc={"green"}
                  mt={2} bw={2} br={16} onPress={() =>{setIsPickerShow(false)}}/>
              </View>
          </View>
      </View>
    )
  }
  showUserDetailsInView = (text, ph, name, value) => {
    return (
      <View style={styles.cardStyle}>
        <Text s={12} t={text} c={Color.black} b/>
        <TextInput ml nl={1} ph={ph} pl={"4%"} h={40} mb={4}
          editable={false} name={name} tbc={Color.viewColor} 
          bbw= {1} value={value}  bw={1} bc={Color.white}
          style={{fontWeight:'bold',color:"black"}}
        />
      </View>
    )
  }
  _updatePayment=(mm,j,yy,picker,uInfo,id,fixed_pay,advance_pay,due_pay,i)=>{
    let paymentdoc={ }
      paymentdoc.STATUS ="PAID"
      paymentdoc.month =mm
      paymentdoc.name =uInfo.name
      paymentdoc.paid_amount= fixed_pay/j
      paymentdoc.advance_amount= ((i+1) ==j)? advance_pay:0
      paymentdoc.due_amount= ((i+1) ==j)? due_pay:0
      paymentdoc.payment_received_date=getCurrentDateFmt()
      paymentdoc.phoneNumber=uInfo.phoneNumber
      paymentdoc.year=yy
      paymentdoc.household_id=uInfo.authUid
      paymentdoc.ward_id=uInfo.areaCode
      paymentdoc.areaCode=uInfo.areaCode
      paymentdoc.paymenttype=picker
      paymentdoc.saathi_id=id
    return paymentdoc;
  }
     
  _updateCitizen=(uInfo,payment,fromdate,todate,picker,id)=>{
    let citizendetails={}
      citizendetails.STATUS ="PAID"
      citizendetails.name =uInfo.name
      citizendetails.paid_amount=(parseInt(payment))
      citizendetails.fromdate=fromdate
      citizendetails.Todate=todate
      citizendetails.phoneNumber=uInfo.phoneNumber
      citizendetails.household_id=uInfo.authUid
      citizendetails.ward_id=uInfo.areaCode
      citizendetails.areaCode=uInfo.areaCode
      citizendetails.paymenttype=picker
      citizendetails.saathi_id=id

    return citizendetails;
  }
  _updateDuePayment = (mm,userDetails,due_payAmount,yy,picker,userInfo,var_pay)=>{
    let paymentdoc={ }
    paymentdoc.STATUS ="UNPAID"
    paymentdoc.month =mm
    paymentdoc.name =userDetails.name
    paymentdoc.paid_amount=var_pay
    paymentdoc.advance_amount= 0
    paymentdoc.due_amount= due_payAmount
    paymentdoc.payment_received_date=getCurrentDateFmt()
    paymentdoc.phoneNumber=userDetails.phoneNumber
    paymentdoc.year=yy
    paymentdoc.household_id=userDetails.authUid
    paymentdoc.ward_id=userDetails.areaCode
    paymentdoc.areaCode=userDetails.areaCode
    paymentdoc.paymenttype=picker
    paymentdoc.saathi_id=userInfo.authUid

    return paymentdoc

  }

  __getFromDate = (day,Month,Year)=>{
    let  dd = day<10? "0"+day :day
    let month =Month < 10? "0" +Month:Month
    return Year + "-" + month+ "-" + dd
  }

  __getToDate = (day,Month,Year,j)=>{
    let ToMon=(Month+j)>12?(Month+j)%12:Month+j
    let ToYear=(Month+j)>12?Year+1:Year
    if(ToMon==0){ToMon= Month}
    ToMon =ToMon < 10? "0" + ToMon:ToMon
    return ToYear + "-"+ToMon+"-"+"01"
  }

  getLoopMonthAndYear = (Month,Year,i)=>{
    let  l_obj={}
      let mm = (Month+i)>12?(Month+i)%12:(Month+i) 
      let yy  = (Month+i)>12? Year+1:Year    
      let  extramm = ((Month+i)+1)>12?((Month+i)+1)%12:(Month+i)+1   
      let extrayear  = (Month+i)+1>12? Year+1:Year
      if(extramm==0){ extramm= ((Month+i)+1)-12}
      if(mm < 10) mm= "0" + mm;  
      if(extramm < 10) extramm= "0" + extramm; 

      l_obj.mm=mm;
      l_obj.yy=yy
      l_obj.extramm=extramm;
      l_obj.extrayear=extrayear
      return l_obj;
  }
  showErrorModalMsg = (message, title = "message") => {
    setDataAction({ 
      errorModalInfo : {
        showModal : true, title, message
      }
    })
  };
  __saveuserdata=async(j)=>{
    setShowPaymentTypeModal(false);
    toggleLoading(true);
    try {
      let arr =userDetails.Paymentsarray!=undefined&&
      userDetails.Paymentsarray.length>0?userDetails.Paymentsarray:[]
      
      let fixed_pay =0,advance_pay=0,due_pay= 0
      let cPayment=parseInt(payment),cIPayment = parseInt(inputPay)
      let Month,Year,fromdate,todate,day
      if(arr.length<=0){
        day =  new Date().getDate()
        Month = new Date().getMonth()+1;
        Year  = new Date().getFullYear()
        fromdate = __getFromDate(day,Month,Year);
        todate = __getToDate(day,Month,Year,j)
        
      }else{
        let temp =(arr[arr.length-1].month).split("-");
        let i_m = parseInt(temp[0]);
        let i_y  = parseInt(temp[1])
        day =  new Date().getDate()
        Month = (i_m+1)>12?(i_m+1)%12:i_m+1
        Year  = (i_m+1)>12?i_y+1:i_y
        fromdate = __getFromDate(day,Month,Year);
        todate = __getToDate(day,Month,Year,j)
        let advancedoc = await getLastPaymentDocument(userDetails.authUid,i_m,i_y)
        if(advancedoc){
          if(advancedoc.due_amount>0){
            advancedoc.paid_amount = advancedoc.paid_amount+advancedoc.due_amount
            cIPayment= cIPayment -advancedoc.due_amount
            advancedoc.due_amount = 0
            await addpayment(advancedoc);
            let newObj=arr[arr.length-1]
            newObj.paid_amount =newObj.paid_amount+newObj.due_amount
            newObj.due_amount = 0
            arr[arr.length-1] =newObj
          }else  if(advancedoc.advance_amount>=0){
            cIPayment= cIPayment+advancedoc.advance_amount
            advancedoc.advance_amount =0
            await addpayment(advancedoc);
            let newObj=arr[arr.length-1]
             newObj.advance_amount =0
             arr[arr.length-1] =newObj
          }
        }
      }
      if(cPayment == cIPayment){
        fixed_pay = cPayment
        advance_pay = 0
        due_pay = 0
      }else if(cPayment <cIPayment){
        fixed_pay = cPayment;
        advance_pay = cIPayment-cPayment;
        due_pay = 0
      }else if(cPayment >cIPayment&&j>1){
        let eachMonthMoney =cPayment/j
        j=cIPayment/eachMonthMoney
        j=Math.trunc(j )
        fixed_pay = eachMonthMoney*j
        advance_pay = cIPayment%eachMonthMoney
        due_pay = 0
        todate = __getToDate("01",Month,Year,j);
      } else if(cPayment >cIPayment&&j==1){
        console.log("inLessAmount j==1")
        fixed_pay = cIPayment
        advance_pay = 0
        due_pay = cPayment-cIPayment
        todate = __getToDate("01",Month,Year,j);
      }   
      
      let mm ,yy,extramm,extrayear, newPaymentArray=[],paymentdoc_id=[];
      
        for(let i=0;i<j;i++){ 
          let loopData = getLoopMonthAndYear(Month,Year,i)
          mm = loopData.mm
          yy =loopData.yy
          extramm = loopData.extramm
          extrayear =loopData.extrayear
          let payment_doc=_updatePayment(mm,j,yy,picker,userDetails,userInfo.authUid,fixed_pay,advance_pay,due_pay,i)
          let doc_id= await addpayment(payment_doc);
          paymentdoc_id.push(doc_id)

          newPaymentArray.push({
            paid_amount:fixed_pay/j,
            advance_amount : ((i+1) ==j)? advance_pay:0,
            due_amount : ((i+1) ==j)? due_pay:0,
            month:mm+"-"+yy,
            date:getCurrentDateFmt(),
            validuptodate: "01"+"-"+extramm+"-"+extrayear,
            paymenttype:picker
          })

        }
        
        let householddoc={}
        householddoc.user_id=userDetails.authUid
        householddoc.Paymentsarray=arr.concat(newPaymentArray)
        await addHouseholdPayment(householddoc);
        let citizen_doc=_updateCitizen(userDetails,inputPay,fromdate,todate,picker,userInfo.authUid)
        sendpaymentreceipt(paymentdoc_id,citizen_doc);
        toggleLoading(false);
        setPicker("");
        setPayment("");
        setIsPaymentAddedModal(true);
    }catch(err){}
      toggleLoading(false);
  }
  addNewUserPayment = () => {
    let obj = {
      "monthly" : 1,
      "quarterly" : 3,
      "half_yearly": 6,
      "yearly" : 12
    };
    __saveuserdata(obj[picker]);
  }

  if(isPaymentAddedModal){
    return(
      <View a c={Color.black} jc ai zi={999} to={0} le={0} h={height} w={width}>
        <View w={width - 24} br={8} c={Color.white}  h={100}>
          <Text t={"payment_added"} center s={20} mt={8} />
          <View w={width} bw={0.5} bc={Color.black} mb={8}/>
          <View row>
            <Touch h={40} w={"98%"} mh={"1%"} jc ai t={route?.params?.isFromPayment?"go_to_payment":"go_to_ack"} bw={1} br={16} 
              c={Color.white} boc={Color.viewColor} bc={Color.green}
              onPress={() =>{setIsPaymentAddedModal(false);goBackFun()}}
            />
          </View>
        </View>
      </View>
    )
  }

  __showPaymentModal = ()=>{
    return(
      <View a c={Color.black} jc ai zi={999} to={0} le={0} h={height} w={width}>
        <View w={width - 24} br={8} c={Color.white}  h={100}>
          <Text t={"payment_mode"} center s={20} mt={8} />
          <View w={width} bw={0.5} bc={Color.black} mb={8}/>
          <View row >
            <Touch h={40} w={"48%"} ml={"1%"} jc ai t={"upi"} bw={1} br={16} 
                c={Color.white} boc={Color.viewColor} bc={Color.green} mr={"1%"} 
              onPress={() =>{setShowPaymentTypeModal(false)}}
            />
            <Touch h={40} w={"48%"} ml={"1%"} jc ai t={"cash"} bw={1} br={16} 
              c={Color.white} boc={Color.viewColor} bc={Color.green} mr={"1%"}
              onPress={() =>{addNewUserPayment();}}
            />
          </View>
        </View>
      </View>
    )
  }
  showOtpAlert = () =>{
    Alert.alert(
      selectedLanguage == "en"?"Dear User":"प्रिय उपयोगकर्ता",
      selectedLanguage == "en"?"Please Enter Payment":"कृपया भुगतान दर्ज करें",
      [
        { text: "OK", onPress: () => console.log("OK Pressed") }
      ]
    );

  }
  goBackFun = ()=>{
    route?.params?.isFromPayment?
    navigation.navigate(PAGES.PAYMENT,{
      scannedData:userDetails.qrCode,phoneNumber :userDetails.phoneNumber
    }):
    navigation.navigate(PAGES.ACKNOWLEDGEFROMCAMERA,{
      scannedData:userDetails.qrCode,phoneNumber :userDetails.phoneNumber
    })

  }
  
  return !showPaymentTypeModal?
    <View c={Color.viewColor} w={"100%"} h={"100%"}>
      <View w={width} c={Color.green} row ai h={60}>
        <Icon size={36}
          name={"angle-left"}
          color={"white"} 
          style={{marginLeft:"5%"}}
          onPress ={goBackFun}
        />
        <Text s={18} b t={"add_payment"} ml={10} c={Color.white} />
      </View>
      <View mv={"4%"} w={"90%"} mh={"5%"}>
        {
          showUserDetailsInView('name', 'name', 'name', userDetails?.name)
        }
        {
          showUserDetailsInView('phoneNumber', 'phoneNumber', 'phoneNumber',userDetails?.phoneNumber)
        }
        <View  br={4} c={Color.white} bw={1} mb={4}>
          <Text t={"select_your_payment"} b  style={{margin:"2%"}}/>
          <View  w={"100%"} bw={1} bc={Color.borderColor}/>
          <Touch br={4} s={16} w={'90%'} mh={"5%"} mt={"2%"} mb={"2%"} ai jc bc={Color.backgroundColor} bw={1}
            onPress={()=> {setIsPickerShow(true)}} t={payment?getNameFromData(picker)+"-"+payment:"paymenttype"}
          />
        </View>
        <View style={styles.cardStyle}>
          <Text s={12} t={"payment"} c={Color.black} b/>
          <TextInput ml nl={1} ph={"ph"} pl={"4%"} h={40} mb={4}
            name={inputPay} tbc={Color.viewColor} 
            bbw= {1} value={inputPay}  bw={1} bc={Color.white}
            style={{fontWeight:'bold',color:"black"}}
            onChangeText={(field, value) =>setInputPay(value)}
          />
        </View>
        <Touch br={4}  bw={1} bc={Color.green} boc={Color.lightGrayColor} jc ai h={48} w={'100%'}
          onPress={() =>{inputPay?setShowPaymentTypeModal(true):showOtpAlert()}}
           c={Color.white} s={14} b t={"confirm"} mt={10}
        />
        <Touch br={4} bw={1} bc={Color.green} boc={Color.lightGrayColor} jc h={48} w={'100%'}
          // onPress={() =>route?.params?.closePage()} 
          onPress={goBackFun} 
          c={Color.white} s={14} b t={route?.params?.isFromPayment?"go_to_payment":"go_to_ack"}  mt={10}
        />
      </View>
    </View>:__showPaymentModal();
    
};