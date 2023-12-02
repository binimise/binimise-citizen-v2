import React, { useState, useEffect }  from 'react';
import { FlatList, Dimensions,StyleSheet,ScrollView ,Image} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "../redux/action";
import { Color } from "./../global/util";
import { View, Text, Touch, Loading } from "../ui-kit";
import NetInfo from '@react-native-community/netinfo';
import Header from "../components/header";
import { getDailyImages } from "../repo/repo";
import tasks from './tasks';
import { useFocusEffect } from '@react-navigation/native';
let { height, width } = Dimensions.get("window");

export default ({ navigation }) => {

        const [images, setImages] = useState([]);
        const [isFetching, setIsFetching] = useState(false);
        const [isLoading, setIsLoading] = useState(false);
        const [ImageDetails,setImageDetails] = useState({});
        const [isShowImage,setIsShowImage] = useState(false);
        let { userInfo } = useSelector(state => state.testReducer) || {};
    
        getAllImages = async () => {
            let state = await NetInfo.fetch();
            if (!state.isConnected) {
                setIsFetching(false);
                return setDataAction({ errorModalInfo : { showModal : true, message: "you_are_offline" }});
            }
            try{
                let images = await getDailyImages(userInfo);
                images.reverse();
                setImages(images);
            }catch(e){}
            setIsLoading(false);
            setIsFetching(false);     
        }

        onRefresh = () => {
            setIsFetching(true);
            getAllImages();
        }

        useEffect(() => {
            getAllImages();
        }, []);

        useFocusEffect(
            React.useCallback(() => {
                getAllImages();
            }, [])
          );
        
        if(isShowImage){
            return (
              <View style={{height,width}} jc ai>
                <Image
                    source={ImageDetails?.url ? { uri:ImageDetails.url } : require("./../assets/icon.jpg")} 
                     resizeMode={"stretch"} style={{ height:height*(0.90), width:width }} 
                />
                <Touch h={height*(0.05)} mt={height*(0.03)} mb={height*(0.02)} w={200} br={12} jc ai bc={"green"} 
                    s={14} c={Color.white}  t={ "close" } onPress={() => { setIsShowImage(false) }} 
                />
                  
              </View> 
            );
          }
return (
    <View w={"100%"} h={"100%"} c={"white"}>
        <Header navigation={navigation} headerText={"images"} />
        {images.length == 0 ?
            <View ph={16} mb={16} mt={24}>
                <Text s={16} t={["currently_you_donot_have_daily_images"]}/>
            </View>:null
        }
        <ScrollView>
            {!isLoading?
                <View style={styles.placesView}>
                    {images.map((item,index)=>{
                        return <Touch w={"48%"} mb={"4%"} mr={"2%"} br={4} boc={"white"} h={180} key={index.toString()}
                            onPress={()=>{setImageDetails(item),setIsShowImage(true)}}>
                            <Image
                                source={item.url ? { uri: item.url } : require("./../assets/icon.jpg")} 
                                resizeMode={"stretch"} style={{ height: 150, width: "100%" }} 
                            />
                            <Text t={new Date(item.date).toLocaleString()} ml={"2%"} b mt={"2%"}  />
                            
                        </Touch>                    
                    })}
                </View> : <Loading isLoading loadingText={"fetching_images"}/> 
            }
        </ScrollView>
    </View>
);
}



const styles=StyleSheet.create({
    placesView:{
        display:"flex",
        flexWrap:"wrap",
        flexDirection:"row",
        marginHorizontal:"5%",
        marginTop:"4%",
        width:"90%"
    }
})
