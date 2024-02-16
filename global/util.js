import { Dimensions, StyleSheet } from "react-native";
let { width, height } = Dimensions.get('window');

export const getCurrentDateFmt = () => {
    let date = new Date();
    let dd = date.getDate();
    let mm = date.getMonth();
    mm += 1;
    if(mm < 10) mm = "0" + mm;
    if(dd < 10) dd = "0" + dd;
    let yy = date.getFullYear();
    yy = yy - 2000;
    date = dd + "-" + mm + "-20" + yy;
    return date;
}

export const getCurrentDate = () => {
    let date = new Date();
    let dd = date.getDate();
    let mm = date.getMonth();
    mm += 1;
    if(mm < 10) mm = "0" + mm;
    if(dd < 10) dd = "0" + dd;
    let yy = date.getFullYear();
    yy = yy - 2000;
    date = "20" + yy + "-" + mm + "-" + dd;
    return date;
}

width = Math.round(width);
height = Math.round(height);

// Use iPhone6 as base size which is 375 x 667
const baseWidth = 375;
const baseHeight = 667;

const scaleWidth = width / baseWidth;
const scaleHeight = height / baseHeight;
const scale = Math.min(scaleWidth, scaleHeight);

export const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
}

export const getFont =
    (size) => Math.ceil((size * scale));

export const getHeight = percent => {
    return Math.round((height * percent) / 100);
}

export const getWidth = percent => {
    return Math.round((width * percent) / 100);
}

export const Color = {
    gradientColor1 : "#00cc66",
    gradientColor2 : "#99ff33",
    themeColor : "#4C9A2A",
    themeFontColor : "#fff",
    white : "#fff",
    gray : "gray",
    black : "#000",
    green : "#3cb878",
    backgroundThemeColor : "#eee",
    backgroundModalColor : "rgba(52, 52, 52, 0.6)",
    lightGrayColor : "#bbb",
    red : "red",
    skyBlue : "skyblue",
    blue : "blue"
}

export const Font = {
    themeFont : "monospace"
}

export const viewObj = {
    marginTop : 20, 
    borderWidth: StyleSheet.hairlineWidth, 
    borderRadius : 4,
    marginBottom : 8
  }
  
export const textObj = {
    position : 'absolute',
    top : -8,
    left : 8,
    fontSize : 12,
    backgroundColor : Color.white,
    paddingHorizontal : 2,
    backgroundColor : Color.backgroundThemeColor
  }

export const PAGES = {
    PLACES : "Places",
    NOTIFICATIONS : "Notifications",
    LOGINPAGE : "LoginPage",
    USERDETAIL : "UserDetails",
    REQUESTVEHICLE : "RequestVehicle",
    MAPVIEW : "MapView",
    ADDCOMPLAINT : "AddComplaint",
    ADDREQUESTVEHICLE : "AddRequestVehicle",
    PLACESDETAILS : "PlacesDetails",
    COMPLAINT : "Complaint",
    ABOUTUS : "AboutUs",
    LANGUAGE: "Language",
    LOGOUT: "Logout",
    PERMISSIONS: "Permissions",
    FEEDBACK: "feedback",
    IAMHERE: "iamhere",
    PAYMENT: "payment",
    SUGGESTION: "Suggestion",
    SIGNUPCOMPLETE: "SignUpComplete",
    HOME : "Home",
    CONTACTUS  : "Contactus",
    BOOKING : "Bookings",
    ADDNEWBOOKING : "AddNewBooking",
    PAYMENTRECEIPT : "PaymentReceipt",
    PROFILE: "Profile",
    HISTORY: "History",
    ALERTMODAL: "AlertModal",
    SELECTLANGUAGE : "SelectLanguage",
    SHARE : "Share",
    GARBAGEVAN : "GarbageVan",
    TOILETLOCATOR : "ToiletLocator",
    TOILETDETAILS : "ToiletDetails"
}

export const USERINFO = "userInfo";
export const TOKEN = "token";
export const PHONENUMBER = "phoneNumber";
export const AUTHUID = "authUid";
export const SELECTEDLANGUAGE = "selectedLanguage";
export const APP_VERSION = "1.0"

// prod
export const ONESIGNAL_ID = "fbbe319f-6c8d-4aec-afbf-4d01b9bccc2c"; //needs to changed


export const SHOW_LANGUAGE = [
    {
        displayName : "English",
        language : "en",
        show : true
    },
    {
        displayName : "हिंदी",
        language : "hn",
        show : true
    },
    {
        displayName : "ଓଡ଼ିଆ",
        language : "or",
        show : false
    }
]

export const AboutUsUrl = ""

export const APP_INFO = {
    nagar_nigam_welcomes_you : {
        en : " welcomes ",
        hn : " का स्वागत करते हैं "
    },
    aboutUsText : {
        en : "Chatrapur presents 'Swachh Chatrapur' mobile app to its citizens under Digital India initiative.\n\nThrough this app, citizens can directly connect with the Municipal Council and can avail desired information and services.\n\nThis app will give citizens an early notification about the arrival of garbage vehicles and citizens can also track the vehicle through GPS live feed.\n\nIt gives citizens an easy way to register their complaints with the  Municipal Council and  Municipal Council can provide information to citizens on timely manner.\n\nThis small initiative of Chatrapur  Municipal Council affords to make a big contribution to the civic services.\n\nMake our city clean and beautiful with help of this app. Our city is our home.\n\nMy Chatrapur, Clean Chatrapur.",
        hn : "बक्सर नगर परिषद डिजिटल इंडिया पहल के तहत अपने नागरिकों को 'स्वच्छ बक्सर' मोबाइल ऐप प्रस्तुत करता है।\n\nइस ऐप के माध्यम से, नागरिक सीधे परिषद से जुड़ सकते हैं और वांछित जानकारी और सेवाओं का लाभ उठा सकते हैं।\n\nयह ऐप नागरिकों को जल्द से जल्द कचरा वाहनों के आगमन के बारे में अधिसूचना और नागरिक जीपीएस लाइव फीड के माध्यम से भी वाहन को ट्रैक कर सकते हैं।\n\nयह नागरिकों को परिषद के साथ अपनी शिकायत दर्ज करने का एक आसान तरीका देता है और परिषद नागरिकों को समय पर जानकारी प्रदान कर सकता है।\n\nयह बक्सर नगर परिषद की छोटी सी पहल नागरिक सेवाओं में एक बड़ा योगदान देती है।\n\nइस ऐप की मदद से हमारे शहर को स्वच्छ और सुंदर बनाएं। हमारा शहर हमारा घर है।\n\nमेरा बक्सर, स्वच्छ बक्सर"
    },
    nagar_nigam_c : {
        en : "Chatrapur Municipal Council",
        hn : "बक्सर नगर परिषद"
    },
    notif_default_msg : {
        en : "Welcome !!! \n\n Chatrapur welcomes you.",
        hn : "स्वागत !!! \n\n बक्सर आपका स्वागत करता है।",
        or : "ସ୍ୱାଗତ !!! \ n \ n ଚାଟପୁର ଆପଣଙ୍କୁ ସ୍ୱାଗତ କରୁଛି।"
    }
}

export const APP_CONFIG = {
    MUNICIPALITY_NAME : "chatrapur",
    MUNICIPALITY_NAME_C : "chatrapur",
    MUNICIPALITY_NAME_T : "chatrapur",
    MUNICIPALITY_NAME_Ch: "Chatrapur",
    MUNICIPALITY : "mun",
    COORDINATES : {coords: { latitude: 19.360019102474105, longitude: 84.98701565910743, latitudeDelta: 0.01, longitudeDelta: 0.01}}
}

export const FEATURES = {
    CALL_CENTER: {
        show: false,
        phoneNumber : "18004190608"
    }
}

export const  containsNonSpace = (text) => {
    return /\S/.test(text);
}

export const containsSmallLetters = (str) => {
    let regex = /[a-z]/;
    return regex.test(str);
}

export  const onlyNumbers = (str) => {
    // Use a regular expression to match only numeric characters (0-9)
    return /^\d+$/.test(str);
}