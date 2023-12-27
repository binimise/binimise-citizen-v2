import React from 'react';
import { Dimensions, ActivityIndicator, StatusBar } from 'react-native';
import { Color } from '../global/util';
import { View, Text } from "./../ui-kit";
import { useSelector } from 'react-redux';

let { width, height } = Dimensions.get('window');

export default () => {

        let loading = useSelector(state => state.testReducer.loading) || {};
        console.log("l",loading)
        if(!loading.show)
            return null;
        let message = loading.message || "loading";
        return (
            <View a to={0} le={0} zi={999} jc ai 
                h={height} w={width}
                c = {Color.backgroundModalColor}>
                <View jc ai bw={1} w={200} h={120} c={Color.lightGrayColor}
                    bc={Color.themeColor} br={8}>
                    <ActivityIndicator size="large" color={Color.themeColor} />
                    <Text mt={10} s={18} c={Color.themeColor}  t={message} />
                </View>
            </View>
        );
  }
