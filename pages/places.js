import React, { useState, useEffect }  from 'react';
import { Image as RNImageView, FlatList, Dimensions ,BackHandler} from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "../redux/action";
import { View, Text, Touch } from "../ui-kit";
import Header from "../components/header";
import { Color, PAGES } from '../global/util';
import PlacesFilter from "./../components/placesFilter";
import FilterButton from "./../components/filterButton";
import { getPlaces,getAppSettings } from "./../repo/repo";
let { width,height } = Dimensions.get("window");

export default ({ navigation }) => {

    const [mapModal, setMapModal] = useState(false);
    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    const [places, setPlaces] = useState([]);
    const [welcomeMessage,setWelcomeMessage] = useState("");
    let { userInfo,selectedLanguage } = useSelector(state => state.testReducer) || {};

    filterMapView = () => setMapModal(true);

    getPlacesData = async () => {
        let places = await getPlaces(userInfo);
        setPlaces(places);
    }

    useEffect(() => {
        getPlacesData();
        getWelcomeMessageFromSettings(selectedLanguage);
    }, [selectedLanguage]);
   
    
    getWelcomeMessageFromSettings = async (Language)=>{
        let customizedValues = await getAppSettings();
        let local_val = customizedValues.length>0?customizedValues[0].notif_welcome_msg[Language]:""
         
        setWelcomeMessage(local_val);
    
      }

    showPlaceDetail = item => {
        setDataAction({place: item});
        navigation.navigate(PAGES.PLACESDETAILS);
    }

    return (
        <View bc={Color.lightGrayColor} c={"white"} pb={48} h={height}>
            <Header navigation={navigation} headerText={"places"} />
            <View mh={"6%"}  mb={"6%"} w={"90%"} bw={1} bc={"#CCCCCC"}/>
            <View row ph={16} mv={8}>
                <Text s={16} t={["welcome", " "]} />
                <Text s={16} b t={[userInfo.name]} />
            </View>
            <View ph={16} mb={16} bw={1} br={8} mh={16}  pv={8} bc={Color.lightGrayColor}>
                <Text s={14} t={welcomeMessage} />
            </View>
            <View mb={16} mh={16} row ai style={{ justifyContent: "space-between" }}>
                <Text s={16} t={"places_around_you"} /> 
                <FilterButton color={Color.themeColor} onPress={filterMapView} />
            </View>
            
            {
                places.length === 0 ? (
                    <View ph={16} mb={16} bw={1} br={8} mh={16}  pv={8} bc={Color.lightGrayColor}>
                        <View h={300} jc ai mh={16}>
                            <View h={200} w={'100%'} ai>
                                <RNImageView source={require("./../assets/noPlaces.png")} resizeMode="contain" style={{ flex: 1 }} />
                            </View>
                            <Text s={20} b mb={16} t={"no_places_yet"} /> 
                            <Text s={16} mb={16} t={"no_places_message"} />
                        </View>
                    </View>) : (
                    <FlatList
                        data={ places }
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => (
                                <Touch ml={16} mr={16} w={width - 32} row key={index} bw={1} pt={10} mb={10} pb={10} br={4} h={170} boc={Color.lightGrayColor}
                                    onPress={() => {  showPlaceDetail(item); }}>
                                    <View w={"60%"} ph={16}>
                                        <RNImageView source={item.pictures ? { uri: item.pictures } : require("./../assets/icon.png")} resizeMode="cover" style={{ height: 150, width: "100%" }} />                      
                                    </View>
                                    <View row ai>
                                        <Text center s={16} t={item.name.split(" ").join("\n")} />
                                    </View>
                                </Touch>
                            )
                        }
                    />)
            }
            {
                mapModal ? <PlacesFilter headerText={"placesFilter"}
                    onPress={() => setMapModal(false)} /> : null
            }
        </View>
    );
}