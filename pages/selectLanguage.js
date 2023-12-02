import React, { useEffect, useState } from "react";
import { Dimensions, Image,BackHandler,Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from "react-redux";
import { setData } from "./../redux/action";
import { Touch, View, Text } from "./../ui-kit";
import {Color,SELECTEDLANGUAGE,APP_CONFIG,PAGES } from "./../global/util";
import styles from "./../styles/styles";
import {getAppSettings} from "./../repo/repo";
import {useNavigationState} from '@react-navigation/native';
let { width, height } = Dimensions.get("window");



export default selectLanguage = ({ navigation }) => {
  const [showLanguage, setShowLanguage] = useState([]);
  let userInfo = useSelector(state => state.testReducer.userInfo) || {};
  const dispatch = useDispatch();
  const setDataAction = (arg) => dispatch(setData(arg));
  const state = useNavigationState(state => state);
  const routeName = (state.routeNames[state.index]);

  useEffect(() => {
    getLanguagesFromSettings();
  }, []);

  getLanguagesFromSettings = async ()=>{
    let customizedValues = await getAppSettings();
    let local_lang = customizedValues.length>0?customizedValues[0].language:[]
     
    setShowLanguage(local_lang);

  }

  useEffect(() => {

    if(routeName === "SelectLanguage" && !(userInfo?.authUid)){
    const backAction = () => {
      Alert.alert("Hold on!", "Are you sure you want to go back?", [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel"
        },
        { text: "YES", onPress: () => BackHandler.exitApp() }
      ]);
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
        }
  });

  



  setLanguage = (lang) => {
    let obj = {};
    obj[SELECTEDLANGUAGE] = lang;
    obj["languageChangeModalInfo"] = {
      showModal: false,
    };
    setDataAction(obj);
    AsyncStorage.setItem(SELECTEDLANGUAGE, lang);
    (userInfo?.authUid)?navigation.navigate(PAGES.HOME):navigation.navigate(PAGES.LOGINPAGE)
  };

  return (
    <View
      h={height} w={width} c={"#00000066"}  >
      <View h={150} mt={"10%"}>
        <Image
          source={require("./../assets/icon.jpg")}
          resizeMode="contain"
          style={{flex:1,alignSelf:"center" }}
        />
      </View>
      <Text t={APP_CONFIG.MUNICIPALITY_NAME_C}  b c={Color.themeColor} s={18} center />
      <Text t={"municipal_council"} s={10} center />


        <View style={styles.bottomView}>
          <Text s={20} c={"black"} b t={"select_language"} lh={30} to={0} />
          <View row mt={"10%"}>
           
             {showLanguage!=undefined&&showLanguage.length>0?
              showLanguage.filter((item) => item.show).map((item, index) => (
              <Touch
                key={index}
                ml={2}
                bc={"#FFFFFF"}
                boc={"#F0F0F0"}
                fl={0.8}
                br={10}
                bw={2}
                onPress={() => setLanguage(item.language)}
              >
                <Text
                  c={Color.themeColor}
                  center
                  to={10}
                  t={item.displayName}
                />
              </Touch>
            )):null}
          </View>

          <View mt={20} row>
            <Touch
              ai
              center
              onPress={() => {
                (userInfo?.authUid)?navigation.navigate(PAGES.HOME):navigation.navigate(PAGES.LOGINPAGE)
              }}
            >
              <Text s={12} c={Color.themeColor} t={"Skip"} lh={30} />
            </Touch>
          </View>
        </View>

    </View>
  );
};