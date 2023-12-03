import React, { useState,useEffect } from 'react';
import { useSelector } from 'react-redux';
import MapView,{Marker} from 'react-native-maps';
import { View,Touch,Text} from "./../ui-kit";
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from "../components/header";
import { Color,APP_CONFIG } from '../global/util';
import { Linking,Image,Dimensions,StyleSheet, ScrollView } from 'react-native';
import { getCtpt} from "./../repo/repo";
import { SliderBox } from "react-native-image-slider-box";
import * as Location from 'expo-location';
let {width,height } = Dimensions.get("window");

export default ({ navigation }) => {

  const [mapModal, setMapModal] = useState(false);
  const [toiletsList, setToiletsList] = useState([]);
  const [topToiletList,setTopToiletList] = useState([]);
  const [selectedCtpt,setSelectedCtpt] = useState({});
  const [_mapType,setMapType] = useState("standard");
  const [liveLocation, setLiveLocation] = useState({});
  let userInfo = useSelector(state => state.testReducer.userInfo) || {};

  useEffect(() => {
    getAllToilets();
  }, []);

  getAllToilets = async()=>{
    let _ctpt =await getCtpt();
   
    getTopThreeToilets(_ctpt);
  }

  const getTopThreeToilets = async(ToiletList)=>{
    let location = await Location.getLastKnownPositionAsync({enableHighAccuracy: true});
    let lat = location?.coords?.latitude ||APP_CONFIG.COORDINATES.coords.latitude ,
    long = location?.coords?.longitude ||APP_CONFIG.COORDINATES.coords.longitude ;
    setLiveLocation({latitude:lat,longitude:long})

    if(ToiletList.length>0){
      for(let i = 0; i<ToiletList.length; i++) {
        let distance = getDistanceFromLatLonInKm(parseInt(lat), parseInt(long),
        ToiletList[i].lat,ToiletList[i].long);
        ToiletList[i].distance = distance;
      }
      ToiletList.sort(function(a, b) {
        return a.distance - b.distance
      });
      setToiletsList(ToiletList);
    }else{
      setToiletsList(ToiletList);
    }
  }

  function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1);
    var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;  // distance returned
 }
 function deg2rad(deg) {
    return deg * (Math.PI/180)
 }

  showDetails = (iconName,textvalue,_size) =>{
    return(
      <View row mt={"2%"}>
        <Icon size={_size} name={iconName} style={{alignSelf:"center"}}/> 
        <Text t={textvalue} style={{left:"8%"}} s={16}/>
      </View>
    )
  }
 
  ctptfun = (eachCtpt)=>{
    let imageArr=[eachCtpt.insideImage,eachCtpt.outsideImage];
    eachCtpt.imageArr=imageArr
    setSelectedCtpt(eachCtpt);
    setMapModal(true);
  }
 
  
  return mapModal? <View h={"100%"} w={"100%"} c={"#CCCCCC"}>
    <View style={styles.bottomView}>
      <Text t={selectedCtpt?.name} center mt={"4%"} s={24} b/>

      <Text t={"address"}  mt={"4%"} s={24} b mh={"5%"}/>
      <View bw={1} bc={"#CCCCCC"} mh={"5%"} w={"90%"}/>
      <View mt={10} w={"90%"} mh={"5%"}>
        {
          showDetails("home",selectedCtpt.address,24)
        }
        {
          showDetails("phone",selectedCtpt.contactNo,20)
        }
      </View>

      <Text t={"photos"}  mt={"4%"} s={24} b  mh={"6%"}/>
      <View  bw={1} bc={"#CCCCCC"}  mh={"5%"} w={"90%"}/>
      <View w={width}>
        <SliderBox
          images={selectedCtpt.imageArr}
          currentImageEmitter={index => console.log(index)}
          sliderBoxHeight={200}
          dotColor="green"
          inactiveDotColor="#90A4AE"
          paginationBoxStyle={styles.paginationStyle}
          ImageComponentStyle={styles.imageStyle}
          dotStyle={styles.boxDotStyle}
        />
      </View>
   
      <Text t={"navigation"}  mt={"4%"} s={24} b mh={"6%"}/>
      <View  bw={1} bc={"#CCCCCC"} mh={"6%"} w={"90%"}/>
      <View row w={"90%"} mh ={"5%"} mt={10}>
        <Touch w={"48%"} h={40} onPress={()=>{setMapModal(false)}} bc={"red"} t={"_close"} jc ai />
        <Touch  w={"48%"} h={40} onPress={()=>{
          Linking.openURL(`https://www.google.com/maps/dir/?api=1&origin=` +userInfo.lat+`,` + 
          userInfo.long +`&destination=` +selectedCtpt.lat +`,` +selectedCtpt.long+`&travelmode=driving`)}}  
          t={"view_n"} jc ai bc={"green"}  ml={"2%"}
        />
      </View>
    </View>
  </View>: 
    <View c={"white"}>
      <Header navigation={navigation} headerText={"toilets"} />
      <View mh={"5%"} w={"90%"} bc={"#CCCCCC"} mt={"5%"}>
        <MapView
          language={"hn"}
          mapType = {_mapType}
          style={{ alignSelf: 'stretch', height: '100%' }}
          region={{ latitude: liveLocation?.latitude||APP_CONFIG.COORDINATES.coords.latitude|| userInfo?.lat , 
                    longitude: liveLocation?.longitude||APP_CONFIG.COORDINATES.coords.longitude|| userInfo?.long,  
                    latitudeDelta: 0.01, longitudeDelta: 0.01 
                  }}
         
        >
          <Marker
            coordinate={{latitude: liveLocation?.latitude||APP_CONFIG.COORDINATES.coords.latitude||userInfo?.lat,
              longitude: liveLocation?.longitude||APP_CONFIG.COORDINATES.coords.longitude|| userInfo?.long}} 
          >
            <Image  source={require("./../assets/blueicon.png")}  style = {{height: 40, width:40}}/>
          </Marker>
          
          {toiletsList.length>0&&toiletsList.map((eachCtpt,index)=>{
            return <Marker
              key={index}
              coordinate={{latitude: eachCtpt.lat,longitude: eachCtpt.long}}
              onPress={() => {ctptfun(eachCtpt)}}
              title={eachCtpt.title}
            >
              <Image  source={[0,1,2].includes(index)?require("./../assets/toilet.png"):require("./../assets/toilet-b.png")}
                style = {{height: 24, width:24}}
              />
            </Marker>
            })}
        </MapView>
        <View style={{ position: "absolute", bottom: "20%", right:10 }}c={"white"} row w={"40%"}>
          <Touch jc ai t={"Map"} h={48} w={"48%"} c={_mapType =="standard"?"green":"black"} onPress={()=>setMapType("standard")}/>
          <View w={1} c={"black"}/>
          <Touch jc ai t={"Satelite"} h={48} w={"50%"}c={_mapType =="hybrid"?"green":"black"} onPress={()=>setMapType("hybrid")}/>
        </View>
      </View>
    </View>
}




const styles = StyleSheet.create({
  bottomView: {
      width: '100%',
      height: "90%",
      backgroundColor: '#fbfbfb',
      position: 'absolute', 
      bottom: 0, 
      borderTopLeftRadius:50,
      borderTopRightRadius:50,
      overflow: 'hidden'
  },
  paginationStyle :{
      position: "relative",
      bottom: 0,
      padding: 0,
      alignItems: "center",
      alignSelf: "center",
      justifyContent: "center",
      paddingVertical: 10
  },
  imageStyle :{
    borderRadius: 6, 
    width: '90%', 
    marginTop: "6%",
     
  },
  boxDotStyle: {
    width: 20,
    height: 4,
    borderRadius: 4,
    marginHorizontal: 0,
    padding: 0,
    margin: 0,
    backgroundColor: "rgba(128, 128, 128, 0.92)"
  }
});