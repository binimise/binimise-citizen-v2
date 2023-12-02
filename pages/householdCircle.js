import React,{useMemo} from "react";
import { ImageBackground } from "react-native";
import { APP_CONFIG } from "../global/util";
import { Text,View } from "../ui-kit";
import MapView, { Polygon,Marker } from 'react-native-maps';
import CustomMarker from './CustomMarker';

const getMemoizedWardsCoordinates = (wardsData) => {
    let wardVsCoordinates = {};
    return (wardId) => {
        if (!wardId)
            return [APP_CONFIG.COORDINATES.coords.latitude, APP_CONFIG.COORDINATES.coords.longitude];
        if (wardVsCoordinates[wardId])
            return wardVsCoordinates[wardId];
        let ward = wardsData.find(each => each.name == wardId)
        let lat = ward?.centerLatAndLng?.lat || APP_CONFIG.COORDINATES.coords.latitude
        let lng = ward?.centerLatAndLng?.lng || APP_CONFIG.COORDINATES.coords.longitude
        wardVsCoordinates[wardId] = [lat, lng];
        return wardVsCoordinates[wardId];
    }
}

const getFillColor = (item) =>{
    const attendancePercentage = (item.value?.attendance/item.value?.userCount)*100;
    if(attendancePercentage>=80){
        return "rgba(43,186, 0, 0.4)"; //"#2bba00";
    }else if(attendancePercentage>=60){
        return "rgba(163,254, 0, 0.4)";         //"#a3fe00";
    }else if(attendancePercentage>=40){
        return  "rgba(254,244, 0, 0.4)";  //"#fef400";

    }else if(attendancePercentage>=20){
        return "rgba(255,166, 0, 0.4)"; //"#ffa600";
    }else{
        return "rgba(254,0, 0, 0.4)"; //"#fe0000";
    }     
}

export default (props) => {

    const householdCircles = useMemo(() => props?.householdsCount || [], [
        props?.householdsCount,
      ]);
    let memoizedWardsCoordinates = getMemoizedWardsCoordinates(props?.wardsData);
 
    return (
        householdCircles.length > 0 &&
        householdCircles.map((item, index) => {
            let [latitude, longitude] = memoizedWardsCoordinates(item.id);
            let coordinateObj = { latitude, longitude };
            let wardNum = item?.id?.replace('ward ', '');
            let householdCount = item.value?.attendance + "/" + item.value?.userCount;
            let obj = props?.wardsData?.find((each) => each.id == item.id);
                if(obj?.latAndlng?.length>0){
                    return (
                        <View key ={index} style={{position:"relative"}}>
                            <Polygon
                                key={index}
                                coordinates={obj?.latAndlng}
                                fillColor={getFillColor(item)}
                                strokeColor="rgba(0, 0, 0, 0.5)"
                                strokeWidth={2}
                                
                                // tappable = {true}
                                
                            />
                            {
                                props?.zoom_level < 14 ? <Marker
                                    tracksViewChanges={false}
                                    coordinate={coordinateObj}
                                    onPress={() => props?.showHouseholdsInMap(item)}
                                    title = {`W-${wardNum}: ${householdCount}`}
                                /> : <Marker
                                    tracksViewChanges={false}
                                    coordinate={coordinateObj}
                                    onPress={() => props?.showHouseholdsInMap(item)}
                                >
                                    <Text t={`W-${wardNum}:`} />
                                    <Text t={householdCount} />

                                </Marker>
                            }
                            
                        </View>
                    )
                }
               
            
            
        })
    )
}

// export default (props) => {

//     let householdCircles = props?.householdsCount || [];
//     let memoizedWardsCoordinates = getMemoizedWardsCoordinates(props?.wardsData);
//     return (
//         householdCircles.length > 0 &&
//         householdCircles.map((item, index) => {
//             let [latitude, longitude] = memoizedWardsCoordinates(item.id);
//             let coordinateObj = { latitude, longitude };
//             let wardNum = item?.id?.replace('ward ', '');
//             let householdCount = item.value?.attendance + "/" + item.value?.userCount;
//             return (
//                 <MapView.Marker
//                     key={index}
//                     coordinate={{latitude: coordinateObj.latitude,longitude: coordinateObj.longitude}}
//                     onPress={() => props?.showHouseholdsInMap(item)}
//                 >
//                     <ImageBackground
//                         source={require("./../assets/redCircle.png")}
//                         style={{ width: 80, height: 80, justifyContent: "center", alignItems: "center" }}

//                     >
//                         <Text t={`W-${wardNum}:`} />
//                         <Text t={householdCount} />
//                     </ImageBackground>

//                 </MapView.Marker>
//             )
//         })
//     )
// }