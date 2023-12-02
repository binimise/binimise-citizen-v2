import React, { useEffect, useState,useMemo,useRef } from "react";
import { Image } from "react-native";
import { View,Touch,Text } from "../ui-kit";
import MapView,{Marker} from 'react-native-maps';



export default (props) => {

    const [houseHoldsAttendance, setHouseHoldsAttendance] = useState([]);
    const houseHoldsAttendanceRef = useRef([]);
    const wardwise_households = useMemo(() => props?.householdsArray || [], [
        props.householdsArray,
      ]);
      const wardwise_ack = useMemo(() => props?.AcknowledgeArray || [], [
        props.AcknowledgeArray,
      ]);
      const item = props?.selectedItem?.id;
      const selectedValue = props?.selectedValue;
      
    useEffect(() => {
        
        getHouseholdAttendances()
    }, [getHouseholdAttendances])

    const getHouseholdAttendances = () => {
        let acks = [], households = [],ackCount =0,segCount=0;
        wardwise_households.map((each) => {
            if (each.ward_id == item) {
                households.push(each)
            }
        }
        )
       
        wardwise_ack.map((each) => {
            if (each.ward_id == item) {
                acks.push(each)
            }
        }
        )
        let ackObj = {};
        let houseObj = {};
        let arr = [];
        acks.forEach((usersDoc) => {
            ackObj[usersDoc.user_id] = usersDoc;
        });
        households.forEach((houseDoc) => {
            houseObj[houseDoc.authUid] = houseDoc;
        });

        for (const key in houseObj) {
            let house = houseObj[key];
            let obj = {
                latitude: house.lat,
                longitude: house.long,
                name: house.name,
                area: houseObj[key].ward_id,
                phoneNumber: houseObj[key].phoneNumber
            };
            if (ackObj[key]) {
                obj["attendance"] = "yes";
                obj["attended"] = ackObj[key]?.saathiUser?.name || ackObj[key]?.deviceUser?.vehicleName;
                obj["type"] = ackObj[key]?.saathiUser?.name ? "Staff":"Vehicle"
                obj["user_id"] = ackObj[key].user_id;
                obj["acknowledge"] = ackObj[key].acknowledge || null;
                obj["segregation"] = ackObj[key].segregation || null;
            } else {
                obj["attendance"] = "no";
                obj["attended"] = "N/A";
                obj["type"] = "N/A";
                obj["saathiName"] = "N/A";
            }
            if(obj.acknowledge){
                ackCount = ackCount+1;
            }
            if(obj.segregation){
                segCount = segCount+1;
            }
            arr.push(obj);
            houseHoldsAttendanceRef.current = arr;
            setHouseHoldsAttendance(arr);
            let piechartObj = {
                notAttended:(households.length -acks.length),
                attended:acks.length,
                acknowledgeCount:ackCount,
                segregationCount:segCount
            }
            props?.pieChartData(piechartObj);
        }

    }
   
    return ( 
        houseHoldsAttendanceRef.current.length > 0 &&
        houseHoldsAttendanceRef.current.map((item, index) => {
            
            const coordinateObj = {
                latitude: item.latitude,
                longitude: item.longitude,
            };
            if(selectedValue == "Attended"&&item["attendance"] == "yes"){
                return (
                    <Marker 
                        coordinate={coordinateObj} 
                        key={index} 
                        tracksViewChanges= {false}
                        title={item.name+"-"+item.phoneNumber}
                        description={item.attended+"-"+item.type}
                        // onPress={() => setSelectedMarker(marker)}
                    >
                        {
                            item.segregation != null && item.segregation == true ?
                                <Image
                                    source={require("./../acknowledge-images/green1-Home.png")}
                                    style={{ width: 10, height: 10 }}
                                /> :
                                (item.segregation != null && item.segregation == false) ?
                                    <Image
                                        source={require("./../assets/redCircle.png")}
                                        style={{ width: 10, height: 10 }}
                                    /> :
                                    (item.acknowledge != null && item.acknowledge == true) ?
                                        <Image
                                            source={require("./../acknowledge-images/ack_yes.png")}
                                            style={{ width: 10, height: 10 }}
                                        /> : (item.acknowledge != null && item.acknowledge == false) ?
                                                <Image
                                                    source={require("./../acknowledge-images/ack_no.png")}
                                                    style={{ width: 10, height: 10 }}
                                                /> : (item.attendance == "yes") ? <Image
                                                    source={require("./../acknowledge-images/blueHome.png")}
                                                    style={{ width: 10, height: 10 }}
                                                /> : <Image
                                                    source={require("./../acknowledge-images/orangeHome.png")}
                                                    style={{ width: 10, height: 10 }}
                                                />
    
    
    
                        }
    
    
                    </Marker>
                )
            }
            else if(selectedValue == "Not Attended"&&item["attendance"] == "no"){
                return (
                    <Marker 
                        coordinate={coordinateObj} 
                        key={index} 
                        tracksViewChanges= {false}
                        title={item.name+"-"+item.phoneNumber}
                        description={item.attended+"-"+item.type}
                        // onPress={() => setSelectedMarker(marker)}
                    >
                        {
                            item.segregation != null && item.segregation == true ?
                                <Image
                                    source={require("./../acknowledge-images/green1-Home.png")}
                                    style={{ width: 10, height: 10 }}
                                /> :
                                (item.segregation != null && item.segregation == false) ?
                                    <Image
                                        source={require("./../assets/redCircle.png")}
                                        style={{ width: 10, height: 10 }}
                                    /> :
                                    (item.acknowledge != null && item.acknowledge == true) ?
                                        <Image
                                            source={require("./../acknowledge-images/ack_yes.png")}
                                            style={{ width: 10, height: 10 }}
                                        /> : (item.acknowledge != null && item.acknowledge == false) ?
                                                <Image
                                                    source={require("./../acknowledge-images/ack_no.png")}
                                                    style={{ width: 10, height: 10 }}
                                                /> : (item.attendance == "yes") ? <Image
                                                    source={require("./../acknowledge-images/blueHome.png")}
                                                    style={{ width: 10, height: 10 }}
                                                /> : <Image
                                                    source={require("./../acknowledge-images/orangeHome.png")}
                                                    style={{ width: 10, height: 10 }}
                                                />
    
    
    
                        }
    
    
                    </Marker>
                )
            }
            else if(selectedValue == "All"||selectedValue == ""){
                return (
                    <Marker 
                        coordinate={coordinateObj} 
                        key={index} 
                        tracksViewChanges= {false}
                        title={item.name+"-"+item.phoneNumber}
                        description={item.attended+"-"+item.type}
                        // onPress={() => setSelectedMarker(marker)}
                    >
                        {
                            item.segregation != null && item.segregation == true ?
                                <Image
                                    source={require("./../acknowledge-images/green1-Home.png")}
                                    style={{ width: 10, height: 10 }}
                                /> :
                                (item.segregation != null && item.segregation == false) ?
                                    <Image
                                        source={require("./../assets/redCircle.png")}
                                        style={{ width: 10, height: 10 }}
                                    /> :
                                    (item.acknowledge != null && item.acknowledge == true) ?
                                        <Image
                                            source={require("./../acknowledge-images/ack_yes.png")}
                                            style={{ width: 10, height: 10 }}
                                        /> : (item.acknowledge != null && item.acknowledge == false) ?
                                                <Image
                                                    source={require("./../acknowledge-images/ack_no.png")}
                                                    style={{ width: 10, height: 10 }}
                                                /> : (item.attendance == "yes") ? <Image
                                                    source={require("./../acknowledge-images/blueHome.png")}
                                                    style={{ width: 10, height: 10 }}
                                                /> : <Image
                                                    source={require("./../acknowledge-images/orangeHome.png")}
                                                    style={{ width: 10, height: 10 }}
                                                />
    
    
    
                        }
    
    
                    </Marker>
                )
            }
                
            
           
        })

       
       
    )
}