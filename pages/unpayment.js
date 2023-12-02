import React, {useState, useEffect}  from 'react';
import { ScrollView,Dimensions,TextInput,BackHandler } from "react-native";
import { useDispatch,useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import { View, Text, Touch,Picker} from "./../ui-kit";
import Header from "../components/header";
import * as Location from 'expo-location';
import {addURpayment ,getSettingsData,addURUser,sendpaymentreceipt} from "./../repo/repo";
import { Color, APP_CONFIG,PAGES,generateUUID } from '../global/util';
import Modal from "../components/modal";
import { useFocusEffect } from '@react-navigation/native';
let { width, height } = Dimensions.get('window');



export default ({ navigation }) => {
  const dispatch = useDispatch();
  const setDataAction = (arg) => dispatch(setData(arg));
  const [MonthType,setMonthType] = useState('');
  const [phoneNumber,setphoneNumber] = useState('');
  const [name,setName] = useState('');
  const [userid,setuserid] = useState('');
  const [payment, setPayment] = useState();
  const[PaymentType,setPaymentType]=useState([]);
  const [scrollview, setScrollView] = useState({});
  const [showPopup, setShowModal] = useState(false);
  let { userInfo } = useSelector(state => state.testReducer) || {};


  useEffect(() => {
      getPaymentsFromSettings();
  }, []);

  getPaymentsFromSettings=async()=>{
      let paymentData=await getSettingsData()
      let paymentArray = [];
      paymentArray[0]={id:"0",name:"--PaymentType--",val:0}
      Object.keys(paymentData).forEach((key) => {
        paymentArray.push({id:key,name: key+"-"+paymentData[key],val:parseInt(paymentData[key])});
      });

      let modifiedPaymentArray= paymentArray.sort(function(a, b) {
        return (a.val)>(b.val)
      });

       setPaymentType(modifiedPaymentArray)
     }


    toggleLoading = show => {
        setDataAction({"loading": {show}});
    }
    
    OnChangeNumber = (value) => {
        setphoneNumber(value);
    }

    onChangeName =(value)=>{
        setName(value);
    }

   OnChangeMonth = async(field, value) => {
       let demo= value.split("-")
        setMonthType(demo[0])
        setPayment(demo[1])
      
    }

    useFocusEffect(
      React.useCallback(() => {
        const onBackPress = () => {
          if (showPopup) {
            setShowModal(false);
            return true;
          } else {
            return false;
          }
        };
  
        BackHandler.addEventListener('hardwareBackPress', onBackPress);
  
        return () =>
          BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      }, [showPopup])
    );
   

    showErrorModalMsg = (message, title = "message") => {
        setDataAction({ 
            errorModalInfo : {
                showModal : true, title, message
            }
        })
    };

    CloseModal =() => {

       setShowModal(false);
       setMonthType("");
       setPayment("")
 
     }

    closeModalView = () => {
      setShowModal(false);
    }
    modalView = () => {
      return (
            <Modal>
                <View mb={8} row style={{ justifyContent: "space-between"}}>
                    <Text b s={16} t={"would_you_like_to_continue?"} />
                </View>
                <View row>
                    <View w={"45%"}>
                        <Touch bc={Color.red}  h={36} c={Color.white} t={"cancel"}  jc ai br={4}
                         onPress={CloseModal} />
                    </View>
                    <View ml={20} w={"45%"}>
                        <Touch bc={Color.themeColor} h={36} c={Color.white} t={"submit"}  jc ai br={4}
                           onPress={updateURUserInfo}
                     /> 
                     </View>
         
                </View>
             </Modal>
   
       )
     }

    showPicker = (key, item) => {
        return (
            <View br={4} bc={Color.black} bw={1} pt={4} pb={4} mb={8} >
                    <Picker h={40} w={"100%"}
                        items={item}
                        selectedValue={MonthType+"-"+payment}
                        onValueChange={(itemValue, itemIndex) => OnChangeMonth(key, itemValue)}
                    />
                </View>
        );
      }

    dateInformation=(j)=>{
           let date = new Date();
           let dd = date.getDate();
           let mon = date.getMonth() + 1;
           let year = date.getFullYear();
           let ToMon=(date.getMonth() + 1+j)>12?(date.getMonth() + 1+j)%12:date.getMonth() + 1+j
           let ToYear=(date.getMonth() + 1+j)>12?date.getFullYear()+1:date.getFullYear()

           if(ToMon==0){
             ToMon= date.getMonth() + 1
            }
           if(mon < 10) mon = "0" + mon;
           if(ToMon < 10) ToMon = "0" + ToMon;
           if(dd < 10) dd = "0" + dd;

           let currentdate= year + "-" + mon + "-" + dd;
           let todate= ToYear+"-"+ToMon+"-"+dd

           let dateobj={}
            dateobj.date=date
            dateobj.dd=dd 
            dateobj.mon =mon 
            dateobj.year=year
            dateobj.ToMon=ToMon
            dateobj.ToYear=ToYear 
            dateobj.currentdate=currentdate
            dateobj.todate=todate

           return dateobj;
    }

    updatePayment=(mm,name,phoneNumber,present_date,payment,j,yy,MonthType,saathi_id)=>{
      let paymentdoc={ }

            paymentdoc.STATUS ="PAID"
            paymentdoc.month =mm
            paymentdoc.name =name
            paymentdoc.paid_amount=(parseInt(payment))/j
            paymentdoc.payment_received_date=present_date
            paymentdoc.phoneNumber=phoneNumber
            paymentdoc.year=yy
            paymentdoc.ward_id="0"
            paymentdoc.areaCode="0"
            paymentdoc.paymenttype=MonthType
            paymentdoc.saathi_id=saathi_id

            return paymentdoc;
    }
    updateCitizen=(name,payment,present_date,todate,MonthType,authUid,phoneNumber,saathi_id)=>{
      let citizendetails={}

           citizendetails.STATUS ="PAID"
           citizendetails.name =name
           citizendetails.paid_amount=(parseInt(payment))
           citizendetails.fromdate=present_date
           citizendetails.Todate=todate
           citizendetails.phoneNumber=phoneNumber
           citizendetails.household_id=authUid||""
           citizendetails.ward_id="0"
           citizendetails.areaCode="0"
           citizendetails.paymenttype=MonthType
           citizendetails.saathi_id=saathi_id

           return citizendetails;
    }

    addUnregisteredUser=(newPaymentArray,name,phoneNumber,location,saathi_id)=>{
      
        let unregisteredcitizen={}
       
          unregisteredcitizen.Paymentsarray=newPaymentArray
          unregisteredcitizen.name =name
          unregisteredcitizen.phoneNumber=phoneNumber
          unregisteredcitizen.usertype="unregistered"
          unregisteredcitizen.lat=location?.coords?.latitude || 0
          unregisteredcitizen.long=location?.coords?.longitude || 0
          unregisteredcitizen.muncipality=APP_CONFIG.MUNICIPALITY_NAME
          unregisteredcitizen.ward_id="0"
          unregisteredcitizen.areaCode="0"
          unregisteredcitizen.saathi_id=saathi_id

        return unregisteredcitizen;
         
    }

    saveUrUserData=async(j)=>{
       
        toggleLoading(true);
        try {

               let reqdata=dateInformation(j)
               let present_date=reqdata.currentdate
               let mm ,yy,extramm,extrayear
               let newPaymentArray=[],paymentdoc_id=[]
            
              for(let i=1;i<=j;i++){
                mm = (new Date().getMonth()+i)>12?(new Date().getMonth()+i)%12:(new Date().getMonth()+i)
                yy  = (new Date().getMonth()+i)>12? (new Date().getFullYear())+1:new Date().getFullYear()
                extramm = ((new Date().getMonth()+i)+1)>12?((new Date().getMonth()+i)+1)%12:((new Date().getMonth()+i)+1)
                extrayear  = ((new Date().getMonth()+i)+1)>12? (new Date().getFullYear())+1:new Date().getFullYear()
              
                  if(extramm==0){
                    extramm= ((new Date().getMonth()+i)+1)-12
                  }
        
                if(mm < 10) mm= "0" + mm; 
                if(extramm < 10) extramm= "0" + extramm; 
                 let payment_doc=updatePayment(mm,name,phoneNumber,present_date,payment,j,yy,MonthType,userInfo.authUid)
                
                 let doc_id= await addURpayment(payment_doc);
                 paymentdoc_id.push(doc_id)
               
                  newPaymentArray.push({
                      paid_amount:(parseInt(payment))/j,
                      month:mm+"-"+yy,
                      date:reqdata.currentdate,
                      validuptodate:reqdata.dd+"-"+extramm+"-"+extrayear,
                      paymenttype:MonthType
      
                  })
          
              }
              let location = {};
       
                location = await Location.getLastKnownPositionAsync({enableHighAccuracy: true});
                let addUser=addUnregisteredUser(newPaymentArray,name,phoneNumber,location,userInfo.authUid)
                let authUid =generateUUID();
                addUser.authUid =authUid 
                addUser.user_id =authUid 
                  await addURUser(addUser);
                 let citizen_doc=updateCitizen(name,payment,present_date,reqdata.todate,MonthType,authUid,phoneNumber,userInfo.authUid)
      
             
                 sendpaymentreceipt(paymentdoc_id,citizen_doc);
                 setMonthType("");
                 setPayment("");
                 setName("");
                 setphoneNumber("");
                 setPaymentArray([]);
                 setuserid("");
        
        
            }catch(err){}
            toggleLoading(false);
    }
      
    updateURUserInfo = () => {
        setShowModal(false)
           let obj = {
              "monthly" : 1,
              "quarterly" : 3,
              "half_yearly": 6,
              "yearly" : 12
           };
         saveUrUserData(obj[MonthType]);
      }

 
  

    return  <ScrollView ref={(c) => setScrollView(c)}>
      <View h={height}>
        <View row ai c={Color.white}  w={"100%"} h={60} >
           <Header navigation={navigation} headerText={"add_user"} />
        </View>
    
        
         { 
            <View pv={8} ph={16} jc>
              {
                  showPicker("paymenttype", PaymentType)
              
              }

              {
                    
                  <View br={4} bc={Color.lightGrayColor} bw={1} pt={4} pb={4} mb={8}>
                    <Text s={12} ml={16} c={Color.lightGrayColor} t={"name"} />
                    <TextInput  multiline numberOfLines={1} height={24} 
                                onChangeText={onChangeName}
                                value={name}
                     />
                  </View>
              }

              {
                  <View br={4} bc={Color.lightGrayColor} bw={1} pt={4} pb={4} mb={8}>
                     <Text s={12} ml={16} c={Color.lightGrayColor} t={"phoneNumber"} />
                     <TextInput  multiline numberOfLines={1} height={24}
                                 keyboardType={"numeric"} 
                                 onChangeText={OnChangeNumber} 
                                 value={phoneNumber}
                    />
                  </View>
              }
               
              <View row mb={16}>
                      <Touch ai jc h={48} br={4} onPress={() => {
                                setShowModal(true);
                        }}
                      s={16} c={Color.themeFontColor}  t={"update"}   bc={Color.themeColor} b/>
                   
              </View>
              <View row mb={16}>
                    <Touch ai jc h={48} br={4} onPress={() => {
                                 navigation.navigate(PAGES.PAYMENT);
                        }}
                     s={16} c={Color.themeFontColor} bc={Color.themeColor} b t={"payment"} />
              </View>
            </View>
       
  
            
        }
        {
          showPopup ? modalView() : null
        } 
     </View>
</ScrollView>
}