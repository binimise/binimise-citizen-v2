import { Dimensions, StyleSheet } from "react-native";
let { width, height } = Dimensions.get('window');

export const getCurrentDateFmt = () => {
    let date = new Date();
    let dd = date.getDate();
    let mm = date.getMonth() + 1;
    let yy = date.getFullYear();
    if(mm < 10) mm = "0" + mm;
    if(dd < 10) dd = "0" + dd;
    return yy + "-" + mm + "-" + dd;
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

export const getCurrentDateNormalFmt = () => {
    let date = new Date();
    let dd = date.getDate();
    let mm = date.getMonth() + 1;
    let yy = date.getFullYear();
    if(mm < 10) mm = "0" + mm;
    if(dd < 10) dd = "0" + dd;
    return dd + "-" + mm + "-" + yy;
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
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
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
    green : "green",
    red : "#FF5733",
    blue : "#528AAE",
    yellow: "#FFFF00",
    backgroundThemeColor : "#eee",
    backgroundModalColor : "rgba(52, 52, 52, 0.6)",
    lightGrayColor : "#bbb",
    orange: "#FFA500",
    viewColor : "#F0F0F0",
    borderColor : "#CCCCCC",
    backgroundColor : "#FFFFFF"
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
  }

export const PAGES = {
    TASKS : "Tasks",
    CTPT : "CTPT",
    NOTIFICATIONS : "Notifications",
    DAILYIMAGES : "DailyImages",
    HISTORY : "HISTORY",
    ACKNOWLEDGEMENT : "Acknowledgement",
    BOARDUSERS : "BoardUsers",
    LOGINPAGE : "LoginPage",
    USERDETAIL : "UserDetails",
    UPDATECITIZEN : "UpdateCitizen",
    UPDATEPLACES : "UpdatePlace",
    MAPVIEW : "MapView",
    ABOUTUS : "AboutUs",
    LANGUAGE: "Language",
    LOGOUT: "Logout",
    PERMISSIONS: "Permissions",
    SURVEY : "Survey",
    PAYMENT : "Payment",
    UNPAYMENT : "UNPayment",
    BOARDCHECKPOINTS : "BoardCheckpoints",
    UPDATECHECKPOINT : "UpdateCheckpoint",
    ACKNOWLEDGEFROMCAMERA : "AcknowledgeFromCamera",
    HOME : "Home",
    COMMERCIAL:"Comercial",
    CTPTATTENDANCE :"CtptAttendance",
    CTPTUPDATE :"CtptUpdate",
    HISTORYDETAILS : "HistoryDetails",
    EDITDETAILS : "EditDetails",
    UPDATECOMMERCIAL : "UpdateCommercial",
    ADDPAYMENT : "AddPayment",
    COMPLAINTS : "Complaints",
    FUELMANAGEMENT : "FuelManagement",
    ADDFUELREQUEST : "AddFuelRequest",
    COMMERCIALACKNOWLEDGE : "commercialAcknowledge",
    COMANDTASKMAPVIEW : "comAndtaskMapView",
    SAATHIATTENDANCE : "saathiAttendance",
    ONBAORDSAATHI : "onBoardSaathi",
    UPDATESAATHI : "updateSaathi",
    SAATHIRPORTS : "saathiReports",
    EDITSAATHI : "editSaathi",
    VIEWSAATHI : "viewSaathi",
    SPOTFINE : "spotFine",
    ASSIGNEDSPOTFINE : "assignedSpotfine"

}

export const USERINFO = "userInfo";
export const TOKEN = "token";
export const PHONENUMBER = "phoneNumber";
export const AUTHUID = "authUid";
export const QRCODE = "qrCode";
export const SELECTEDLANGUAGE = "selectedLanguage";
export const APP_VERSION = "1.0.2"; //as per build.gradle
export const STAFF_OBJ_STORAGE = "staffObjFromStorage";


// prod
export const ONESIGNAL_ID = "c3957b64-dbd6-4f8d-aaea-46d7aad6f3b8";

export const APP_INFO = {
    nagar_nigam_welcomes_you : {
        en : " welcomes ",
        or : "ଚିକିଟି ବିଜ୍ଞାପିତ ଅଞ୍ଚଳ ପରିଷଦ  ଆପଣଙ୍କୁ ସ୍ୱାଗତ କରୁଛି "
    },
    aboutUsText : {
        en : "Jagdalpur presents 'Swachh Jagdalpur' mobile app to its citizens under Digital India initiative.\n\nThrough this app, citizens can directly connect with the NAC and can avail desired information and services.\n\nThis app will give citizens an early notification about the arrival of garbage vehicles and citizens can also track the vehicle through GPS live feed.\n\nIt gives citizens an easy way to register their complaints with the NAC and NAC can provide information to citizens on timely manner.\n\nThis small initiative of Jagdalpur NAC affords to make a big contribution to the civic services.\n\nMake our city clean and beautiful with help of this app. Our city is our home.\n\nMy Jagdalpur, Clean Jagdalpur.",
        or : "ଚିକିଟି ଏନ.ଏ.ସି ଡିଜିଟାଲ୍ ଇଣ୍ଡିଆ ପଦକ୍ଷେପ ଅନୁଯାୟୀ ଏହାର ନାଗରିକମାନଙ୍କୁ 'ସ୍ୱଚ୍ଛ ଚିକିଟି' ମୋବାଇଲ୍ ଆପ୍ ଉପସ୍ଥାପନ କରେ।\n\nଏହି ଆପ୍ ମାଧ୍ୟମରେ ନାଗରିକମାନେ ସିଧାସଳଖ ଏନ.ଏ.ସି ସହିତ ସଂଯୋଗ କରିପାରିବେ ଏବଂ ଆବଶ୍ୟକୀୟ ସୂଚନା ଓ ସେବା ପାଇପାରିବେ।\n\nଏହି ଆପ୍ ନାଗରିକମାନଙ୍କୁ ଅଳିଆ ଗାଡିର ଆଗମନ ବିଷୟରେ ଶୀଘ୍ର ବିଜ୍ଞପ୍ତି ଦେବ ଏବଂ ନାଗରିକମାନେ ଜିପିଏସ୍ ଲାଇଭ୍ ଫିଡ୍ ମାଧ୍ୟମରେ ଗାଡିକୁ ମଧ୍ୟ ଟ୍ରାକ୍ କରିପାରିବେ।\n\nଚିକିଟି ବାସୀ ସେମାନଙ୍କ ଅଭିଯୋଗକୁ ଆପ୍ ମାଧ୍ୟମରେ ଏନ.ଏ.ସିରେ ପଞ୍ଜିକରଣ କରିପାରିବେ ଏବଂ ଠିକ ସମୟରେ ନାଗରିକମାନଙ୍କୁ ସୂଚନା ପ୍ରଦାନ କରାଯାଇପାରିବ ।\n\nଏନ.ଏ.ସିର ଏହି ଛୋଟ ପଦକ୍ଷେପ ନାଗରିକ ସେବାରେ ଏକ ବଡ଼ ଅବଦାନ ପ୍ରଦାନ କରିଥାଏ।\n\nଏହି ଆପ୍ ମାଧ୍ୟମରେ ଆମ ସହରକୁ ସଫା ଏବଂ ସୁନ୍ଦର ରଖିବା । ଆମ ସହର ଆମର ଘର। \n\nମୋର ଚିକିଟି, ପରିଷ୍କାର ଚିକିଟି ।"
    },
    nagar_nigam_c : {
        en : "Jagdalpur NAC",
        or : "ଚିକିଟି ବିଜ୍ଞାପିତ ଅଞ୍ଚଳ ପରିଷଦ"
    },
    notif_default_msg : {
        en : "Welcome !!! \n\n Jagdalpur welcomes you.",
        or : "ଚାରିଆଡେ ଅଳିଆ ପକାନ୍ତୁ ନାହିଁ । ଡଷ୍ଟବିନ ବ୍ୟବହାର କରନ୍ତୁ । ଆମ ସହର ଆମର ଘର । ପରିଷ୍କାର ସହର, ପରିଷ୍କାର ଘର |"
    }
}

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
];

export const InTimeVSOutTime = [
    { 
        id:"inTime",
        name:"IN TIME" 
    },
    { 
        id: "outTime",
        name:"OUT TIME" 
    }
];


export const APP_CONFIG = {
    MUNICIPALITY_NAME : "jagdalpur",
    MUNICIPALITY_NAME_C : "Jagdalpur",
    MUNICIPALITY_NAME_T : "Jagdalpur",
    MUNICIPALITY : "mun",
    COORDINATES : {coords: { latitude: 19.0840319, longitude: 82.0222439, latitudeDelta: 0.01, longitudeDelta: 0.01}}
}
