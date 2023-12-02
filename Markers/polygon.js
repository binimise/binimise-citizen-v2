import React  from "react";
import {Polyline} from 'react-native-maps';
import { Color } from "../global/util";

const strokeColor_Arr = [
    '#7F0000',
    '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
    '#B24112',
    '#E5845C',
    '#238C23',
    '#7F0000'
];

export default (props) =>{
    let routes = props?.routes || [];
    let strk_clr = props?.fromStaff?"blue":Color.themeColor
   return <Polyline
            coordinates = {routes}
            strokeColor = {strk_clr}
            strokeColors = {strokeColor_Arr}
            strokeWidth = {2}
        />
}