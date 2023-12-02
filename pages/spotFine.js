import React, { useState, useEffect } from 'react';
import { Dimensions, Image } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import { View, Text, Touch, TextInput, PickerModal } from "./../ui-kit";
import Header from "../components/header";
import * as Location from 'expo-location';
import { getAllAreas, updateSpotFine } from "./../repo/repo";
import { Color, APP_CONFIG, AUTHUID, generateUUID, PAGES } from '../global/util';
import NetInfo from '@react-native-community/netinfo';
import { useIsFocused } from '@react-navigation/native';
const { width, height } = Dimensions.get("window");




export default ({ navigation, route }) => {


    const [region, setRegion] = useState(APP_CONFIG.COORDINATES.coords);
    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    const [comment, setComment] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [areas, setAreas] = useState([]);
    const isFocus = useIsFocused();
    const [isPickerShow, setIsPickerShow] = useState(false);
    const [selectedArray, setSelectedArray] = useState([]);
    const [selectedKey, setSelectedKey] = useState("");
    const [selectedValue, setSelectedValue] = useState("");
    const [areaCode, setAreaCode] = useState("");
    let { userInfo } = useSelector(state => state.testReducer) || {};

    useEffect(() => {
        if (isFocus) {
            _getLocationAsync();
            setImageUrl(route?.params?.imageUrl || "");
        }
        getAreasList()

    }, [isFocus]);

    const sortArrayList = (arr =[]) =>{
        arr.sort((a, b) => {
            const idA = parseInt(a.id.split(" ")[1]);
            const idB = parseInt(b.id.split(" ")[1]);
            return idA - idB;
          });
        return arr;
    }

    const getAreasList = async () => {

        let areaList = await getAllAreas();
        let modifiedArrayList = []
        areaList.map((eachitem) => {
            let obj = { "id": eachitem.data().id, "name": eachitem.data().name }
            modifiedArrayList.push(obj);
        })
        let sortedlist = sortArrayList(modifiedArrayList);
        setAreas(sortedlist);
    }

    const toggleLoading = show => {
        setDataAction({ "loading": { show } });
    }


    const _getLocationAsync = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync(); //await Permissions.askAsync(Permissions.LOCATION);
        if (status !== "granted") {
            return showErrorModalMsg("please_grant_location_permission_c");
        }
        toggleLoading(true);
        try {
            let location = await Location.getLastKnownPositionAsync({ enableHighAccuracy: true });
            setRegion({ ...location.coords });
        } catch (e) {
            showErrorModalMsg("error_in_getting_current_location");
        }
        toggleLoading(false);
    };

    const showErrorModalMsg = (message, title = "message") => {
        setDataAction({
            errorModalInfo: {
                showModal: true, title, message
            }
        })
    };


    const submitSoptFineInfo = async () => {
        try {
            
            if (!imageUrl) {
                return showErrorModalMsg("please_upload_image")
            }
            if (!areaCode) {
                return showErrorModalMsg("please_select_area")
            }
            if (!comment) {
                return showErrorModalMsg("please_enter_comment")
            }
            
            toggleLoading(true);
            let obj = {};
            obj.name = userInfo.name;
            obj.phoneNumber = userInfo.phoneNumber;
            obj.authUid = generateUUID()
            obj.comment = comment;
            obj.imageUrl = imageUrl;
            obj.location = region;
            obj.timeStamp = new Date();
            obj.updatedBy = userInfo[AUTHUID];
            obj.areaCode = areaCode;
            obj.ward = areaCode;
            obj.state = "ACTIVE";
            updateSpotFine(obj);
            toggleLoading(false);
            showErrorModalMsg("data_updated");
            setComment("");
            setImageUrl("");
            setAreaCode("");
            setSelectedKey("");
            setSelectedValue("");
            navigation.navigate(PAGES.HOME)
        } catch (e) {
            console.log("e", e)
        }
    }

    const showCameraOfSpotFine = async () => {
        let state = await NetInfo.fetch();
        if (!state.isConnected) {
            return setDataAction({ errorModalInfo: { showModal: true, message: "you_are_offline" } });
        }
        setDataAction({
            cameraInfo: {
                show: true,
                onLoadOp: spotFineImageOnLoad,
                imageRef: "spotFine/" + userInfo[AUTHUID] + "/" + new Date().toLocaleDateString().split("/").join("-") + "/" + new Date().getTime() + '.jpg'
            }
        });
    }


    const spotFineImageOnLoad = async (url) => {
        setImageUrl(url)
    }

    const isClosedModal= ()=>{
        setIsPickerShow(false);
    }
   
    const selectedPickerData = (key,data)=>{
         setSelectedValue(data);
         setAreaCode(data);
    }


    return <View c={Color.viewColor} w={width} h={height}>
        <Header navigation={navigation} headerText={"post_spotfine"} />
        <View>
            <Image
                source={imageUrl ? { uri: imageUrl } : require("./../assets-images/image2.jpg")}
                resizeMode="stretch"
                style={{ width: width, height: (height * 0.5) }}
            />
            {!imageUrl&&
            <Touch t={"take_image"} jc ai h={40} bc={"#F0F0F0"}
                style={{ position: "absolute", top: 2, right: 2 }} w={150} c={imageUrl ? "red" : "green"}
                onPress={() => { showCameraOfSpotFine() }}
            />}
        </View>

        <View mv={10} ml={"2%"}>
            <Text t={"click_below"} b />
            <Touch br={4} s={16} w={'96%'} ai jc bc={"#FFFFFF"} bw={1}
                onPress={() => {
                    setSelectedArray(areas);
                    setSelectedKey("areaCode");
                    setSelectedValue(areaCode);
                    setIsPickerShow(true)
                }}
                t={areaCode ? areaCode : "select_your_ward"}
            />
        </View>

        <View mv={10} ml={"2%"} w={"96%"} h={80}>
            <Text s={12} t={"comment"} c={"black"} b />
            <View br={2} bw={1}>
                <TextInput ml nl={1} w={'100%'} h={"100%"}
                    bc={Color.white}
                    onChangeText={(field, value) => setComment(value)} name={"comment"} tbc={Color.viewColor} mb={4}
                    value={comment} bw={1}
                />
            </View>

        </View>
        <Touch ai jc h={48} w={'90%'} mh={"5%"} mt={20} br={4} onPress={() => {
            submitSoptFineInfo();
        }}
            s={14} c={Color.themeFontColor} bc={Color.themeColor} b t={"submit"} />

        {isPickerShow && selectedArray.length > 0 ?
            <PickerModal
                items={selectedArray}
                selectedKey={selectedKey}
                selectedValue={selectedValue}
                selectedPicker={selectedPickerData}
                isClosedModal={isClosedModal}
            /> : null}


    </View>

}
