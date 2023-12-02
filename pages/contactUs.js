import React, {useRef, useEffect}  from 'react';
import { Dimensions, StatusBar, Animated } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "../redux/action";
import {View, Text, Touch} from "../ui-kit";
import Header from "../components/nav";
const width = Math.round(Dimensions.get('window').width);  
const height = Math.round(Dimensions.get('window').height);  


export default props => {


    // const dispatch = useDispatch()
    // const setDataAction = (arg) => dispatch(setData(arg))

    // let sidebar = useSelector(state => state.testReducer.sidebar) || [];
    // if(!sidebar.show)
    //   return null;

    return <View mt={StatusBar.currentHeight}>
        <Header />
        <View jc ai h={'100%'}>
            <Text t={'This is CONTACT US page'} />
        </View>
    </View>
}