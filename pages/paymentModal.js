import React, {useEffect, useState} from "react";
import {Dimensions, FlatList, Image, StyleSheet,BackHandler} from "react-native";
import {View, Text, Touch} from "../ui-kit";
import {setData} from "./../redux/action";
import {useDispatch, useSelector} from 'react-redux';
import { getHouseholdPaymentById } from "./../repo/repo";
import { PAGES } from "../global/util";
import AddPayment from './addpayment'
import {useNavigationState} from '@react-navigation/native';

let {width, height} = Dimensions.get("window");

export default (props) => {
    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    let {userInfo} = useSelector(state => state.testReducer) || {};
    const [isAddPayment, setAddpayment] = useState(false);
    const [mUsersData,setMUsersData] = useState({})
    const state = useNavigationState(state => state);
    const routeName = (state.routeNames[state.index]);
    let userPaymentData = props?.userData || {}

   
    useEffect(() => {
        getPaymentArray(userPaymentData);
    }, [userPaymentData]);

    convertPayment = (data) => {
        let date = new Date()
        let mon = date.getMonth() + 1;
        if (mon < 10) mon = "0" + mon;
        let totalMonths = data.Paymentsarray != undefined ? data.Paymentsarray : []
        let pay = 0
        if (totalMonths.length > 0 && totalMonths[0].month) {

            let lastmonth = totalMonths[totalMonths.length - 1].month.split("-")
            let due_amount = totalMonths[totalMonths.length - 1].due_amount
            let advance_amount = totalMonths[totalMonths.length - 1].advance_amount

            let l_y = parseInt(lastmonth[1]) * 12
            let l_m = parseInt(lastmonth[0])
            let p_y = (date.getFullYear()) * 12
            let p_m = date.getMonth() + 1
            let Count = (l_y + l_m) - (p_y + p_m)
            pay = (Count) * 30
            if (due_amount > 0) {
                pay = pay - due_amount
            } else if (advance_amount > 0) {
                pay = pay + advance_amount
            }

        }
        data.pay = pay;
        return data;
    }
   
    getPaymentArray = async (userPaymentData) => {
        let p_array = await getHouseholdPaymentById(userPaymentData.authUid);
        userPaymentData.Paymentsarray = p_array ? p_array : []
        let returndata = convertPayment(userPaymentData);
        setMUsersData(returndata);
    }


    return <Touch a bo={50} bw={1} boc={"green"} w={"90%"} mh={"5%"} h={120}
                   bc={"white"} br={8} 
                   onPress={() => props?.navigation.navigate(PAGES.ADDPAYMENT,{
                            userDetails:mUsersData
                           })
                }
            >
                <Text t={"payments"} b ml={10} s={20}/>
                <View w={"100%"} bw={1} bc={"#3E3E3E"}/>
                <View row ml={10}>
                    <Text t={"waste"} b s={18}/>
                    <Text t={" : "} b s={18}/>
                </View>
                <View row ml={50} ai>
                    <Text t={mUsersData?.pay <= 0 ? "pending_amount" : "advance_amount"} s={18} b/>
                    <Text t={" : "} s={16}/>
                    <Text t={mUsersData?.pay < 0 ? -(mUsersData?.pay) : mUsersData?.pay}
                          c={mUsersData?.pay < 0 ? "red" : "green"} h={50} w={50} s={16}
                    />
                </View>
            </Touch>


};

