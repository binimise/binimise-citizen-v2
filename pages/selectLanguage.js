import React, { useEffect, useState } from "react";
import { Dimensions, Image,BackHandler,Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from "react-redux";
import { setData } from "./../redux/action";
import { Touch, View, Text } from "./../ui-kit";
import {
  Color,
  SELECTEDLANGUAGE,
  SHOW_LANGUAGE,
  APP_CONFIG,
  PAGES,
} from "./../global/util";
import styles from "./../styles/styles";
import {getAppSettings} from "./../repo/repo";
import {useNavigationState} from '@react-navigation/native';
let { width, height } = Dimensions.get("window");



export default PhoneVerification = ({ navigation }) => {

  const [showLanguage, setShowLanguage] = useState([]);
  let userInfo = useSelector(state => state.testReducer.userInfo) || {};
  const dispatch = useDispatch();
  const setDataAction = (arg) => dispatch(setData(arg));
  const state = useNavigationState(state => state);
  const routeName = (state.routeNames[state.index]);
  let { selectedLanguage } = useSelector(state => state.testReducer) || {};

  useEffect(() => {
    getLanguagesFromSettings();
  }, []);

  const getLanguagesFromSettings = async ()=>{
    let customizedValues = await getAppSettings();
    let local_lang = customizedValues?.language||[];
    setShowLanguage(local_lang);

  }

  useEffect(() => {
    if(routeName === PAGES.SELECTLANGUAGE){
      const backAction = () => {
        if(userInfo?.authUid){
          navigation.navigate(PAGES.HOME);
          return true;
        }
        BackHandler.exitApp();
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );
      return () => backHandler.remove();
    }
  });

  const getMuncipalityName = (selLang) =>{
    if(selLang == "en"){
      return `${APP_CONFIG.MUNICIPALITY_NAME_Ch} NAC`;
    }else if(selLang === "hn"){
      return "छत्रपुर एनएसी";
    }else if(selLang === "or"){
      return "ଚାଟପୁର NAC";
    }else{
      return `${APP_CONFIG.MUNICIPALITY_NAME_Ch} NAC`;
    }
    
  }

  const setLanguage = (lang) => {
    console.log("l", lang);
    let obj = {};
    obj[SELECTEDLANGUAGE] = lang;
    obj["languageChangeModalInfo"] = {
      showModal: false,
    };
    setDataAction(obj);
    AsyncStorage.setItem(SELECTEDLANGUAGE, lang);
    navigation.navigate(userInfo?.authUid?PAGES.HOME:PAGES.LOGINPAGE)
    // (userInfo?.authUid)?navigation.navigate(PAGES.HOME):navigation.navigate(PAGES.LOGINPAGE)
  };

  return (
    <View h={height} w={width} c={"white"}>
      <View h={200} mt={"40%"}>
        <Image
          source={require("./../assets/Chatrapur.png")}
          resizeMode="contain"
          style={{flex:1,alignSelf:"center" }}
        />
      </View>
      <Text t={getMuncipalityName(selectedLanguage)}  b c={Color.themeColor} s={18} center />
      {/* <Text t={"nam"} s={10} center/> */}

      <View style={styles.bottomView}>
        <Text s={20} c={"black"} b t={"select_language"} lh={30} to={0}/>
        <View row mt={"10%"}>
          {showLanguage!=undefined&&showLanguage.length>0?
            showLanguage.filter((item) => item.show).map((item, index) => (
            <Touch key={index} ml={2} bc={"#FFFFFF"} 
              fl={0.8} br={10} bw={2} h={48} boc={"#F0F0F0"}
              onPress={() => setLanguage(item.language)}
              jc ai
            >
              <Text c={Color.themeColor} 
                 t={item.displayName}
              />
            </Touch>
          )):null}
        </View>

        <View mt={20} row>
          <Touch h={48} ai center
            onPress={() => { navigation.navigate(userInfo?.authUid?PAGES.HOME:PAGES.LOGINPAGE)
            }}
          >
            <Text s={12} c={Color.themeColor} t={"skip"} lh={30} />
          </Touch>
        </View>
      </View>
    </View>
  );
};