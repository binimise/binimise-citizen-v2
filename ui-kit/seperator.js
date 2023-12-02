import React  from 'react';
import { StyleSheet } from "react-native";
import View from "./view";
import { Color } from '../global/util';

export default () => <View mt={4} bc={Color.black} bw={StyleSheet.hairlineWidth} />;