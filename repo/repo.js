import firebase from "./../repo/firebase";
import { APP_CONFIG, AUTHUID, PHONENUMBER, QRCODE, getCurrentDateFmt, generateUUID,getCurrentDateNormalFmt } from "./../global/util";
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
const USER_LOCATION_SYNC = "userLocationSync";
import CryptoJS from 'crypto-js';
import { createNewDocOfSaathi } from '../global/api';
export const HASH = "6fb74b35af6ce0";


const TASK_FETCH_LOCATION = 'TASK_FETCH_LOCATION';
var arr ;
TaskManager.defineTask(TASK_FETCH_LOCATION, async ({ data: { locations }, error }) => {
    try {
        if (error) return;
        arr = await AsyncStorage.getItem(USER_LOCATION_SYNC);
        if(!arr || arr == "[]") {
            arr = [];
        } else {
            arr = JSON.parse(arr);
        }
        let location = await getCurrentAsyncLocation();
        location.status = "ON";
        arr.push(location);
        let state = await NetInfo.fetch();
        if(state.isConnected) {
            try {
                let userId = await AsyncStorage.getItem(AUTHUID);
                if(userId!=null){
                    let obj = {[AUTHUID]: userId};
                    updateAgentLocation(obj, arr);
                }                
            } catch(e){
                console.log("ee",e)
                // alert("e " + e.toString())
            }
            arr = [];
        }
        await AsyncStorage.setItem(USER_LOCATION_SYNC, JSON.stringify(arr));
    } catch(e) {
        console.log("e",e)
        // alert(e);
    }
  });

const getCurrentAsyncLocation = async () => {
    let location = {};
    try{
        location = await Location.getCurrentPositionAsync({enableHighAccuracy: true});
        location = location?.coords;
    } catch(e) {
        alert("Error in getting location due to ", e.toString());
    }
    return {
        lat : location.latitude,
        long : location.longitude,
        time : new Date().getTime()
    }
}

const updateOffLocation = async () => {
    try {
        let userId = await AsyncStorage.getItem(AUTHUID);
        let obj = {[AUTHUID]: userId};
        let location = await getCurrentAsyncLocation();
        location.status = "OFF";
        let arr = [location];
        updateAgentLocation(obj, arr);
    } catch(e){
        console.log(e.toString())
    }
}
  
const syncBackgroundLocation = () => {
    Location.startLocationUpdatesAsync(TASK_FETCH_LOCATION, {
        accuracy: Location.Accuracy.Highest,
        showsBackgroundLocationIndicator: true,
        distanceInterval: 1, // minimum change (in meters) betweens updates for "0" interval updated correctly
        deferredUpdatesInterval: 10 * 1000, // minimum interval (in milliseconds) between updates
        // foregroundService is how you get the task to be updated as often as would be if the app was open
        foregroundService: {
          notificationTitle: 'Using your location',
          notificationBody: 'To turn off, go back to the app and switch your duty off',
        },
      });
    //   storeBackgroundLocationOfSaathi();
}
const storeBackgroundLocationOfSaathi = async() =>{
        try {
                let userId = await AsyncStorage.getItem(AUTHUID);
                let obj = {[AUTHUID]: userId};
                let location = await getCurrentAsyncLocation();
                location.status = "ON";
                let arr = [location];
                updateAgentLocation(obj, arr);
            } catch(e){
                console.log("e " + e.toString())
            }
    
}

const stopSyncBackgroundLocation = () => {
    Location.hasStartedLocationUpdatesAsync(TASK_FETCH_LOCATION).then((value) => {
        if (value) {
          Location.stopLocationUpdatesAsync(TASK_FETCH_LOCATION);
          updateOffLocation();
        }
      });
}

const fireStore = firebase().firestore();
const munAraFirestore = fireStore.collection(APP_CONFIG.MUNICIPALITY).doc(APP_CONFIG.MUNICIPALITY_NAME);
const COLLECTIONS = {
    PLACES : "places",
    COMPLAINTS : "complaints",
    SAATHI : "saathi",
    USERS : "users",
    WARD_USER : "ward_user",
    DEVICE_GEO : "device_geo",
    DEVICES : "devices",
    WARDS : "wards",
    TASKS : "tasks",
    ACKNOWLEDGE : "acknowledge",
    COMMERCIALACK : "commercialAck",
    COMMERCIALS : "commercials",
    ATTENDANCE : "attendance",
    CONFIG : "saathi-config",
    CHECKPOINT : "checkpoints",
    SAATHGEO : "saathiGeo",
    IMAGES : "images",
    CTPT : "ctpt",
    SETTINGS_APP  : "settings_app",
    PAYMENTS :"payments",
    HOUSEHOLDS: "households",
    URHOUSEHOLDS: "URUser",
    ONBOARD : "onboard",
    SURVEY:"survey",
    BROADCAST : "broadcast",
    CTPTATTENDANCE :"ctpt_attendance",
    PAYMENTSARRAY : "paymentsarray",
    VEHICLES : "vehicles",
    FUELMANAGEMENT : "fuel_management",
    GEOHASHCOMMERCIALS : "geohashCommercials",
    CHECKPOINTACK : "checkpoint_ack",
    ATTENDANCETIME : "attendance_time",
    SPOTFINE : "spot_fine",
    PENDINGATTENDANCE: "pendingAttendance",
    SAATHISMETA : "saathis_meta",
}

const getSaathiMetaRef = () =>{
    return munAraFirestore.collection(COLLECTIONS.SAATHISMETA).doc("saathisMeta");
}

const getSpotFineRef = () =>{
    return munAraFirestore.collection(COLLECTIONS.SPOTFINE);
}

const devicesRef = () => {
    return munAraFirestore.collection(COLLECTIONS.DEVICES);
}

const getDeviceGeoRef = () => {
    return munAraFirestore.collection(COLLECTIONS.DEVICE_GEO)
}

const updateSpotFine = (obj) =>{
    return getSpotFineRef().add(obj);
}

const getSpotFine = async (staffObj) => {
    let data = await getSpotFineRef().where('assignee', '==', staffObj[AUTHUID]).where('state', '==', "ASSIGNED").get();
    return data?.docs?.map(item => Object.assign({}, {id : item.id, type: "spotfine"}, item.data())) || [];
}
const getBroadCastsRef = () => {
//    return  fireStore.collection(APP_CONFIG.MUNICIPALITY).doc("buxar").collection(COLLECTIONS.BROADCAST)
    return munAraFirestore.collection(COLLECTIONS.BROADCAST);
   
}
const getCtptAttendanceRef = () => {
    return munAraFirestore.collection(COLLECTIONS.CTPTATTENDANCE);
  
}

const getEncryptedData = (message) => {
    let data = CryptoJS.AES.encrypt(message, HASH).toString();
    // console.log(data);
    return data;
}

const getDecryptedData = (message) => {
    var bytes  = CryptoJS.AES.decrypt(message, HASH);
    let data = bytes.toString(CryptoJS.enc.Utf8);
    // console.log(data);
    return data;
}
const acknowledgeCheckpointRef = (uid) =>{
    return munAraFirestore.collection(COLLECTIONS.ACKNOWLEDGE)
        .doc(getCurrentDateFmt())
        .collection(COLLECTIONS.CHECKPOINTACK)
        .doc(uid);
}

const getSettingsRef = () => {
    return munAraFirestore;
}
const getSettingsAppRef = () => {
    return munAraFirestore.collection(COLLECTIONS.SETTINGS_APP);
}

const getCheckpointRef = () => {
    return munAraFirestore.collection(COLLECTIONS.CHECKPOINT);
}

const getFuelQuantityRef = () => {
    return munAraFirestore.collection(COLLECTIONS.FUELMANAGEMENT);
}

const getPlaceRef = () => {
    return munAraFirestore.collection(COLLECTIONS.PLACES);
}

const getCtptRef = () => {
    return munAraFirestore.collection(COLLECTIONS.CTPT);
}

const getVehicleRef = () => {
    return munAraFirestore.collection(COLLECTIONS.VEHICLES);
}

const getHouseholdRef = () => {
    return munAraFirestore.collection(COLLECTIONS.HOUSEHOLDS);
}

const getHouseholdPaymentsRef = () => {
    return munAraFirestore.collection(COLLECTIONS.PAYMENTSARRAY);
}

const getURHouseholdRef = () => {
    return munAraFirestore.collection(COLLECTIONS.URHOUSEHOLDS);
}

const getCommercialRef = () => {
    return munAraFirestore.collection(COLLECTIONS.COMMERCIALS);
}

const getGeohashCommercialRef = () => {
    return munAraFirestore.collection(COLLECTIONS.GEOHASHCOMMERCIALS);
}

const getSurveyRef = () => {
    return munAraFirestore.collection(COLLECTIONS.SURVEY);
}

const getConfigRef = () => {
    return munAraFirestore.collection(COLLECTIONS.CONFIG)
        .doc("welcomeText");
}

const getAttendanceRefOfSaathi = (dateString, userInfo) => {
    return munAraFirestore.collection(COLLECTIONS.SAATHGEO)
        .doc(dateString)
        .collection(COLLECTIONS.ATTENDANCE)
        .doc(userInfo.id)
}

const getAttendanceRef = (dateString, userInfo) => {
    return munAraFirestore.collection(COLLECTIONS.SAATHGEO)
        .doc(dateString)
        .collection(COLLECTIONS.ATTENDANCE)
        .doc(userInfo[AUTHUID])
}


const getLocationHistoryRef = (dateString, userInfo) => {
    return munAraFirestore.collection(COLLECTIONS.SAATHGEO)
        .doc(dateString)
        .collection(COLLECTIONS.SAATHI)
        .doc(userInfo[AUTHUID])
}


const getSaathiImageRef = (userInfo) => {
    return munAraFirestore.collection(COLLECTIONS.SAATHGEO)
        .doc(getCurrentDateFmt())
        .collection(COLLECTIONS.IMAGES)
        .doc(userInfo[AUTHUID])
}

const getSaathiAllImageRef = (date,userInfo) => {
    return munAraFirestore.collection(COLLECTIONS.SAATHGEO)
        .doc(date)
        .collection(COLLECTIONS.IMAGES)
        .doc(userInfo[AUTHUID])
}

const getPaymentRef = () => {
    return munAraFirestore.collection(COLLECTIONS.PAYMENTS);
}

const getSaathiRef = () => {
    return munAraFirestore.collection(COLLECTIONS.SAATHI);
}

const getCitizenRef = () => {
    return munAraFirestore.collection(COLLECTIONS.USERS);
}

const getUserRef = () => {
    return munAraFirestore.collection(COLLECTIONS.USERS);
}

const getWardsRef = () => {
    return munAraFirestore.collection(COLLECTIONS.WARDS);
}

const tasksRef = () => {
    return munAraFirestore.collection(COLLECTIONS.TASKS);
}

const comlaintsRef = () => {
    return munAraFirestore.collection(COLLECTIONS.COMPLAINTS);
}

const acknowledgedUserRef = () => {
    return munAraFirestore.collection(COLLECTIONS.ACKNOWLEDGE).doc(getCurrentDateFmt()).collection(COLLECTIONS.ACKNOWLEDGE);
}



const getOnBoardResidentsRef = () => {
    return munAraFirestore.collection(COLLECTIONS.ONBOARD);
}

const acknowledgeUserRef = uid => {
    return munAraFirestore.collection(COLLECTIONS.ACKNOWLEDGE)
        .doc(getCurrentDateFmt())
        .collection(COLLECTIONS.ACKNOWLEDGE)
        .doc(uid);
}

const acknowledgeCommercialRef = uid => {
    return munAraFirestore.collection(COLLECTIONS.ACKNOWLEDGE)
        .doc(getCurrentDateFmt())
        .collection(COLLECTIONS.COMMERCIALACK)
        .doc(uid);
}
//used
// const addpayment = async obj => {
//     const doc_ref= await getPaymentRef().add(obj)
//     return doc_ref.id;
// }
const addpayment = async obj => {
    let id =obj.household_id+"-"+obj.month+"-"+obj.year
    obj.id =id
    getPaymentRef()
    .doc(id)
    .set(obj)
    .then(() => {});

    return id;
}

const acknowledgeCustomizedUserRef = (date) => {
    return munAraFirestore.collection(COLLECTIONS.ACKNOWLEDGE)
        .doc(date)
        .collection(COLLECTIONS.ACKNOWLEDGE)
}

const acknowledgeCustomizedCommercialRef = (date) => {
    return munAraFirestore.collection(COLLECTIONS.ACKNOWLEDGE)
        .doc(date)
        .collection(COLLECTIONS.COMMERCIALACK)
}

const addURpayment = async obj => {
   const doc_ref= await getPaymentRef().add(obj)
   return doc_ref.id;
   
}

const addHousehold = async obj1 => {
    await getHouseholdRef()
    .doc(obj1.user_id)
    .set(obj1, { merge:true })
}

const addHouseholdPayment = async (pObj) =>{
    await getHouseholdPaymentsRef()
        .doc(pObj.user_id)
        .set(pObj, { merge:true })
}

const addCtptAttendance = async(object)=>{
   
    await getCtptAttendanceRef()
    .doc(getCurrentDateFmt())
    .collection("ctpt_attendance")
    .doc(object.authUid)
    .set(object, { merge:true })
}

const addURUser = async obj1 => {
    obj1=encryptCitizenData(obj1)
     await getHouseholdRef().doc(obj1.user_id).set(obj1, { merge:true })

}

const updateURUser = async (obj1,userid) => {
    await getURHouseholdRef().doc(userid).set(obj1,{merge:true})
    

}

const addUserData = async userInfo => {
    await getSaathiRef()
    .doc(userInfo[AUTHUID])
    .set(userInfo, { merge:true })
}

const updateUserData = async userInfo => {
    getSaathiRef()
    .doc(userInfo[AUTHUID])
    .set(userInfo,{ merge:true })
    .then(() => {});
}

const deleteStaff = async (id) =>{
   return  getSaathiRef()
    .doc(id)
    .delete()
}

const uploadSaathiImage = async (saathiObj) => {
    let uid = saathiObj.authUid || saathiObj.id; 
    getSaathiRef()
    .doc(uid)
    .set(saathiObj,{ merge:true })
    .then(() => {});
}
const updateSupervisorOfSaathi = async(obj) =>{
    getSaathiRef()
    .doc(obj.uId)
    .update({ 
        supervisor:obj.supervisor ||{},
        supervisor_name:obj.supervisor_name 
    }).then(() => {});
}

const updateSaathiStatus = (saathiId, status) => {
    let newObj = {};
    newObj["status"] = status;
    newObj["authUid"] = saathiId;
    getSaathiRef()
    .doc(newObj.authUid)
    .set(newObj,{ merge:true })
    .then(() => {});
}

//using
const getUserData = async phoneNumber => {
    let data = await getSaathiRef().where(PHONENUMBER, '==', phoneNumber).get();
    if(data.docs.length > 0){
        return data.docs[0].data();
    }
    return;
}

const decryptCitizenData = d_user => {
    d_user["name"] = getDecryptedData(d_user["name"]);
    d_user["lat"] = d_user.lat?parseFloat(getDecryptedData(d_user["lat"])):null;
    d_user["long"] = d_user.long?parseFloat(getDecryptedData(d_user["long"])):null;
    d_user["address"] = getDecryptedData(d_user["address"]);
    d_user["aadharNumber"] = getDecryptedData(d_user.aadharNumber?d_user.aadharNumber:"");
    return d_user;
}

const encryptCitizenData = e_user => {
    e_user["name"] = getEncryptedData(e_user["name"]);
    e_user["lat"] = getEncryptedData(e_user.lat?e_user.lat.toString():"19.0840319");
    e_user["long"] = getEncryptedData(e_user.long?e_user.long.toString():"82.0222439");
    e_user["address"] = getEncryptedData(e_user["address"]);
    e_user["aadharNumber"] = getEncryptedData(e_user.aadharNumber?e_user.aadharNumber:"");
    return e_user;
}
const checkUsersData = async phoneNumber => {
    let data = await getUserRef().where(PHONENUMBER, '==', phoneNumber).get();
    if(data.docs.length > 0){
        return data.docs[0].data();
    }
    return;
}

const checkSaathiData = async phoneNumber => {
    let data = await getSaathiRef().where(PHONENUMBER, '==', phoneNumber).get();
    if(data.docs.length > 0){
        return data.docs[0].data();
    }
    return;
}
//used
const getCitizenData = async phoneNumber => {
let data = await getCitizenRef().where(PHONENUMBER, 'in', [phoneNumber, parseInt(phoneNumber)]).get();
    if(data.docs.length > 0){
        let authUid = data.docs[0].id;
        data = data.docs[0].data();
        if(data && data.phoneNumber){
            data.phoneNumber = data.phoneNumber.toString();
            // data.areaCode = data.ward.toLowerCase().toString();
            data.areaCode = data?.ward_id?data.ward_id.toLowerCase().toString():data.areaCode;
            data[AUTHUID] = authUid;
        }
        return decryptCitizenData(data);
    }
    return;
}

const getCitizenDataByName = async name => {
    let data = await getCitizenRef().where("name", '==', name).get();
    if(data.docs.length > 0){
        let authUid = data.docs[0].id;
        data = data.docs[0].data();
        if(data && data.phoneNumber){
            data.phoneNumber = data.phoneNumber.toString();
            data.areaCode = data?.ward_id?data.ward_id.toLowerCase().toString():data.areaCode;
            data[AUTHUID] = authUid;
        }
        return decryptCitizenData(data);
    }
    return;
}
//used
const updateCitizenData = async userInfo => {
    userInfo = encryptCitizenData(userInfo);
    getCitizenRef()
    .doc(userInfo[AUTHUID])
    .update(userInfo)
    .then(() => {});
}
//used
// const getAttendance = async (dateString, userInfo) => {
//     let data = await getAttendanceRef(dateString, userInfo).get();
//     return data.data();
// }
const getAttendance = async(dateString, document) => {
    let obj ={
        id:dateString
    };
    let doc = await getAttendanceRef(dateString, document).get();
    obj.status = doc?.data()?.status || [];
    return obj;

}

const getAttendanceOfSaathi = async(dateString, userInfo) => {
    return getAttendanceRefOfSaathi(dateString, userInfo).get()
}
const getRouteLocation = async (dateString, userInfo) => {
   
    let data = await getLocationHistoryRef(dateString, userInfo).get();
    data = data.data();
    return data;
}

const changeLatAndLng = (staff_locations) =>{
    let routes_array = [];
    staff_locations.forEach((item, index) => {
        routes_array.push({
            latitude : item.lat,
            longitude : item.long,
            status : item.status,
            time:item.time
        })
    });
    return routes_array;
    
}

const getRoutesOfVehicles = (vehicleHistory) =>{
    let routes_array = [];
    vehicleHistory.forEach((item, index) => {
      if(item?._latitude){
        routes_array.push({
          latitude :item?._latitude,
          longitude : item?._longitude,
          // time:item.time
      })
      }
        
    });
    return routes_array;
    
}
const getRouteOfStaff = async(dateString, staff_obj) => {
    let obj ={
        name: staff_obj.name || "",
        phoneNumber: staff_obj.phoneNumber || "",
        authUid : staff_obj.authUid || staff_obj.id,
    };
    let data = await getLocationHistoryRef(dateString, staff_obj).get();
    obj["location"] = {...data?.data()?.currentLocation||{}};
    obj["routes"] = data?.data()?.locations?.length>0&&changeLatAndLng(data?.data()?.locations)||[];

    return obj;

}

const getEachDriverLocation = (id) =>{
    return getDeviceGeoRef()
    .where('date', '==', getCurrentDateNormalFmt())
    .where('imei', '==', id)
}

const getRouteOfVehicle = async(vehicleInfo) => {
    let obj ={
        name: vehicleInfo.name || "",
        phoneNumber: vehicleInfo.phoneNumber || "",
        ward_id : vehicleInfo.ward_id || []
    };
    let data = await getEachDriverLocation(vehicleInfo.device_id).get();
    data?.docs?.map((eachDoc)=>{
        obj["geo"] = {...eachDoc?.data?.()?.geo || {}};
        obj["routes"] = eachDoc?.data?.()?.history?.length>0&&
                        getRoutesOfVehicles(eachDoc?.data()?.history)||[];
    })
    
    return obj;

}

const getWardUserRef = userInfo => {
    return munAraFirestore.collection(COLLECTIONS.SAATHI).doc(userInfo[AUTHUID]);
}

const getTaskUidRef = uid => {
    return munAraFirestore.collection(COLLECTIONS.TASKS).doc(uid);
}

const getComplaintUidRef = uid => {
    return munAraFirestore.collection(COLLECTIONS.COMPLAINTS).doc(uid);
}

const getAllAreas = async () => {
    let data = await getWardsRef().get(); 
    return data.docs;
} 

const fetchWardsData = async () => {
    let data = await getWardsRef().get();
    return data;
}

const fetchSaathiAssingedWards = async(wards)=>{
    let data ;
    if(wards?.length>=1&&wards?.length<=10){
        data = await getWardsRef().where("name","in",wards).get();
    }else{
        data = await getWardsRef().get();
    }
    return data;
}
const getUserLocation = async userInfo => {
    let data = await getWardUserRef(userInfo).get(); 
    return data.data();
}

const updateUserLocationInWard = async (userInfo, lat, long) => {
    getWardUserRef(userInfo).update({ lat, long }).then(() => {});
}
//used
const getUsersInWards = async (userInfo, lat, long) => {
    let url = "https://us-central1-binimise-v1.cloudfunctions.net/getLocalUsers?";
    url += "lat=" + lat + "&long=" + long + "&mun=" + encodeURIComponent(APP_CONFIG.MUNICIPALITY_NAME);

    if (userInfo.ward && userInfo.ward.length > 0) {
        userInfo.ward.forEach(wardValue => {
            url += "&ward=" + encodeURIComponent(wardValue);
        });
    }
 
    let data = await fetch(url);
    data = await data.json();
   return data;
}
//used
const getUsersNearby = async (userInfo, lat, long) => {
    let url = "https://us-central1-binimise-v1.cloudfunctions.net/getPaymentsHouseholds?";
    url += "lat="+ lat +"&long=" + long + "&mun=" + APP_CONFIG.MUNICIPALITY_NAME;
    let data = await fetch(url);
    data = await data.json();
    return data;
}
//used
const sendpaymentreceipt = async (returndata,obj3) => {
    let url = "https://us-central1-binimise-v1.cloudfunctions.net/paymentsReceipts?";
    url += "docs="+ returndata + "&name="+ obj3.name+"&paid_amount="+ obj3.paid_amount+ "&fromdate="+ obj3.fromdate+"&Todate="+ obj3.Todate+
    "&phoneNumber="+ obj3.phoneNumber+"&household_id="+ obj3.household_id+ "&paymenttype="+ obj3.paymenttype+"&mun=" + APP_CONFIG.MUNICIPALITY_NAME
    let data = await fetch(url);
}
//used
const updateUserToken = (userInfo, token) => {
    getWardUserRef(userInfo).update({token}).then(() => {});
}
const updateUserStatus = (userInfo, flag) => {
    getWardUserRef(userInfo).update({status:flag}).then(() => {});
}
const updateLogOutFlag = (userInfo, flag) => {
    getWardUserRef(userInfo).update({shouldLogout:flag}).then(() => {});
}

const updateSelfDocument = (userInfo) =>{
    getWardUserRef(userInfo)
    .update({
        token:"",
        status: false,
        shouldLogout:false
    }).then(() => {});
}

const updateAppVerionOfStaff = (saathiObj,version) =>{
   
    getWardUserRef(saathiObj).update({appMetadata: {"version" :version}}).then(() => {});
}

const updateTaskStatus = async (uid, obj) => {
    let state = await NetInfo.fetch();
    if (state.isConnected) {
        getTaskUidRef(uid).set({...obj}, {merge: true}).then(() => {});
    } else {
        alert("You are offline !!!")
    }
}
//used
const updateSaathiImage = async (userInfo, obj) => {
    let state = await NetInfo.fetch();
    if (state.isConnected) {
        getSaathiImageRef(userInfo).set({
            images: firebase().firestore.FieldValue.arrayUnion(obj)
        }, { merge:true }).then(() => {}).catch(() => {});
    } else{
        alert("You are offline !!!")
    }
}

const getTasks = async (userInfo) => {
    let data = await tasksRef().where('assignee', '==', userInfo[AUTHUID]).where('state', '==', "ASSIGNED").get();
    return data.docs.map(item => Object.assign({}, {id : item.id, type: "task"}, item.data())) || [];
}

const getComplaints = async (userInfo) => {
    let data = await comlaintsRef().where('assignee', '==', userInfo[AUTHUID]).where('state', '==', "ASSIGNED").get();
    return data.docs.map(item => Object.assign({}, {id : item.id, type: "complaint"}, item.data())) || [];
}
//used
const getTaskAndComplaints = async (userInfo) => {
    let tasks = await getTasks(userInfo);
    let complaints = await getComplaints(userInfo);
    return [...tasks, ...complaints];
}

const acknowledgeUserOrCommercial = async (userInfo, flag, saathiUser) => {
   
    let id = userInfo.user_id?userInfo.user_id:userInfo.authUid
    let objF = {
        "segregation" : false,
        "acknowledge" : flag,
        "saathiUser"  : {
            name: saathiUser?.name,
            authId: saathiUser?.authUid,
            userId: saathiUser?.userId
        },
        "id" :id,
        "user_id" :id,
        "name": userInfo.name,
        "phoneNumber": userInfo.phoneNumber,
        "ward_id": userInfo.ward_id,
        "time_stamp" : new Date(),
        "timestamp" : new Date().getTime(),
        "segregate" : 0
    };
    if(userInfo.isFromCommercials){
        objF["shop_name"] = userInfo.shopName || ""
    }
    for(let k in objF){
        if(objF[k] === undefined||objF[k] === null){
            delete objF[k];
        }
    }
    if(userInfo.isFromCommercials){
        return acknowledgeCommercialRef(id).set(objF);
    }else{
        return acknowledgeUserRef(id).set(objF);
    }
    
}

const acknowledgeWasteSegregationUserOrCommercial = async (userInfo, flag, saathiUser) => {
    
    let id = userInfo?.user_id ? userInfo?.user_id : userInfo?.authUid
    let obj = {
        "segregation" : flag,
        "acknowledge" : true,
        "saathiUser"  : {
            name: saathiUser?.name,
            authId: saathiUser?.authUid,
            userId: saathiUser?.userId
        },
        "id" :id,
        "user_id" :id,
        "name": userInfo.name,
        "phoneNumber": userInfo.phoneNumber,
        "ward_id": userInfo.ward_id,
        "time_stamp" : new Date(),
        "timestamp" : new Date().getTime(),
        "segregate": flag ? 1 : 0
    };
    for(let k in obj){
        if(obj[k] === undefined || obj[k] === null){
            delete obj[k];
        }
    }
    if(userInfo.isFromCommercials){
        obj["shop_name"] = userInfo.shopName || ""
    }
    if(userInfo.isFromCommercials){
        return acknowledgeCommercialRef(id).set(obj);
    }else{
        return acknowledgeUserRef(id).set(obj);
    }
}

const acknowledgeUserOrCommercialOrCheckpoint = async (userInfo, flag, saathiUser) => {

    // storeBackgroundLocationOfSaathi();
    let id = userInfo.user_id?userInfo.user_id:userInfo.authUid;
    let objF = {
        "segregation" : false,
        "acknowledge" : flag,
        "saathiUser"  : {
            name: saathiUser?.name,
            authId: saathiUser?.authUid,
            userId: saathiUser?.userId
        },
        "id" :id,
        "user_id" :id,
        "name": userInfo.name,
        "phoneNumber": userInfo.phoneNumber || "",
        "ward_id": userInfo.ward_id,
        "time_stamp" : new Date(),
        "timestamp" : new Date().getTime(),
        "segregate" : 0
    };
    if(userInfo.isFromCommercial){
        objF["shop_name"] = userInfo.shopName || ""
    }

    if(userInfo.isFromCheckpoint){
        objF["type"] = userInfo.type || ""
    }

    for(let k in objF){
        if(objF[k] === undefined||objF[k] === null){
            delete objF[k];
        }
    }

    if(userInfo.isFromCommercial){
        return acknowledgeCommercialRef(id).set(objF);
    }else if(userInfo.isFromCheckpoint){
        return acknowledgeCheckpointRef(id).set(objF)
    }else{
        return acknowledgeUserRef(id).set(objF);
    }
    
}

const acknowledgeWasteSegregationUserOrCommercialOrCheckpoint = async (userInfo, flag, saathiUser) => {
    // storeBackgroundLocationOfSaathi(); //add again
    let id = userInfo?.user_id ? userInfo?.user_id : userInfo?.authUid
    let obj = {
        "segregation" : flag,
        "acknowledge" : true,
        "saathiUser"  : {
            name: saathiUser?.name,
            authId: saathiUser?.authUid,
            userId: saathiUser?.userId
        },
        "id" :id,
        "user_id" :id,
        "name": userInfo.name,
        "phoneNumber": userInfo.phoneNumber || "",
        "ward_id": userInfo.ward_id,
        "time_stamp" : new Date(),
        "timestamp" : new Date().getTime(),
        "segregate": flag ? 1 : 0
    };
    for(let k in obj){
        if(obj[k] === undefined || obj[k] === null){
            delete obj[k];
        }
    }
    if(userInfo.isFromCommercial){
        obj["shop_name"] = userInfo.shopName || ""
    }
    if(userInfo.isFromCheckpoint){
        obj["type"] = userInfo.type || ""
    }
    if(userInfo.isFromCommercial){
        return acknowledgeCommercialRef(id).set(obj);
    }else if(userInfo.isFromCheckpoint){
        return acknowledgeCheckpointRef(id).set(obj)
    }else{
        return acknowledgeUserRef(id).set(obj);
    }
}

const acknowledgeCommercial = async (userInfo, flag, saathiUser) => {
    
    let id = userInfo.user_id?userInfo.user_id:userInfo.authUid
    let objF = {
        "segregation" : false,
        "acknowledge" : flag,
        "saathiUser"  : {
            name: saathiUser?.name,
            authId: saathiUser?.authUid,
            userId: saathiUser?.userId
        },
        "id" :id,
        "user_id" :id,
        "name": userInfo.name,
        "shop_name": userInfo.shopName,
        "phoneNumber": userInfo.phoneNumber,
        "ward_id": userInfo.ward_id,
        "time_stamp" : new Date(),
        "timestamp" : new Date().getTime(),
        "segregate" : 0
    };
    for(let k in objF){
        if(objF[k] === undefined||objF[k] === null){
            delete objF[k];
        }
    }
    return acknowledgeCommercialRef(id).set(objF);
}

const acknowledgeWasteSegregationCommercial = async (userInfo, flag, saathiUser) => {
   
    let id = userInfo?.user_id ? userInfo?.user_id : userInfo?.authUid
    let obj = {
        "segregation" : flag,
        "acknowledge" : true,
        "saathiUser"  : {
            name: saathiUser?.name,
            authId: saathiUser?.authUid,
            userId: saathiUser?.userId
        },
        "id" :id,
        "user_id" :id,
        "name": userInfo.name,
        "shop_name": userInfo.shopName,
        "phoneNumber": userInfo.phoneNumber,
        "ward_id": userInfo.ward_id,
        "time_stamp" : new Date(),
        "timestamp" : new Date().getTime(),
        "segregate": flag ? 1 : 0
    };
    for(let k in obj){
        if(obj[k] === undefined || obj[k] === null){
            delete obj[k];
        }
    }
    return acknowledgeCommercialRef(id).set(obj); 
}


const acknowledgeUser = async (userInfo, flag, saathiUser) => {
   
    let id = userInfo.user_id?userInfo.user_id:userInfo.authUid
    let objF = {
        "segregation" : false,
        "acknowledge" : flag,
        "saathiUser"  : {
            name: saathiUser?.name,
            authId: saathiUser?.authUid,
            userId: saathiUser?.userId
        },
        "id" :id,
        "user_id" :id,
        "name": userInfo.name,
        "phoneNumber": userInfo.phoneNumber,
        "ward_id": userInfo.ward_id,
        "time_stamp" : new Date(),
        "timestamp" : new Date().getTime(),
        "segregate" : 0
    };
    for(let k in objF){
        if(objF[k] === undefined||objF[k] === null){
            delete objF[k];
        }
    }
    return acknowledgeUserRef(id).set(objF);
}


const acknowledgeWasteSegregationUser = async (userInfo, flag, saathiUser) => {
   
    let id = userInfo?.user_id ? userInfo?.user_id : userInfo?.authUid
    let obj = {
        "segregation" : flag,
        "acknowledge" : true,
        "saathiUser"  : {
            name: saathiUser?.name,
            authId: saathiUser?.authUid,
            userId: saathiUser?.userId
        },
        "id" :id,
        "user_id" :id,
        "name": userInfo.name,
        "phoneNumber": userInfo.phoneNumber,
        "ward_id": userInfo.ward_id,
        "time_stamp" : new Date(),
        "timestamp" : new Date().getTime(),
        "segregate": flag ? 1 : 0
    };
    for(let k in obj){
        if(obj[k] === undefined || obj[k] === null){
            delete obj[k];
        }
    }
    return acknowledgeUserRef(id).set(obj); //.then(() => {}).catch(() => {});
}

const updateCtPt = userInfo => {
   
    userInfo["lat"] = userInfo.latitude;
    userInfo["long"] = userInfo.longitude;
    userInfo["ward"] = "ward " + userInfo.ward;
    userInfo["date"] = getCurrentDateFmt();
    userInfo["createdTime"] = new Date();
    delete userInfo.latitude;
    delete userInfo.longitude;
    let authUid = generateUUID();
    userInfo.areaCode = userInfo.ward;
    return getCtptRef().doc(authUid).set({
        ...userInfo, authUid
    }).then(() => {});
}


const onBoardUsers = b_user => {
   
    b_user["lat"] =  b_user.latitude;
    b_user["long"] =  b_user.longitude;
    b_user["ward"] = "ward " + b_user.ward;
    b_user["date"] = getCurrentDateFmt();
    b_user["createdTime"] = new Date();
    delete  b_user.latitude;
    delete  b_user.longitude;
    let authUid = generateUUID();
    b_user.areaCode =  b_user.ward;
    b_user = encryptCitizenData(b_user);
    // b_user["holdingNo"] = b_user.holdingNo;
    
    return getUserRef().doc(authUid).set({
        ... b_user, authUid
    }).then(() => {});
}


//used
const getWardUserData = async phoneNumber => {
    let data = await getUserRef().where(PHONENUMBER, '==', phoneNumber).get();
    if(data.docs.length > 0){
        return data.docs[0].data();
    }
}

const updateAgentStatus = (userInfo, status) => {
    if(status){
        syncBackgroundLocation();
    } else{
        stopSyncBackgroundLocation();
    }
    getWardUserRef(userInfo).update({status}).then(() => {});
    let timestamp = new Date().getTime();
    getAttendanceRef(getCurrentDateFmt(), userInfo).set({
        status: firebase().firestore.FieldValue.arrayUnion({ status, timestamp })
    }, { merge:true });
}

const updateAgentLocationHistory = (userInfo, locations) => {
    getLocationHistoryRef(getCurrentDateFmt(), userInfo).set({
        locations: firebase().firestore.FieldValue.arrayUnion(...locations)
      }, { merge:true }).then(() => {}).catch(() => {});
}

const updateAgentCurrentLocation = (userInfo, location) => {
    getLocationHistoryRef(getCurrentDateFmt(), userInfo).set({
        currentLocation: location
      }, { merge:true }).then(() => {}).catch(() => {});
}

const updateAgentLocation = (userInfo, locations) => {
    updateAgentLocationHistory(userInfo, locations);
    updateAgentCurrentLocation(userInfo, locations.pop());
}

const getAcknowledgedUser = async () => {
    let data = await acknowledgedUserRef().get();
    return data.docs.map(item => Object.assign({}, {id : item.id}, item.data()));
}

const getWelcomeText = async () => {
    let data = await getConfigRef().get();
    return data.data();
}

const getUserByQrCode = async code => {
    let data = await getUserRef().where(QRCODE, '==', code).get();
    if(data.docs.length > 0){
        return decryptCitizenData(data.docs[0].data());
    }
}
const getCommercialByQrCode = async code =>{
    let data = await getCommercialRef().where(QRCODE, '==', code).get();
    if(data.docs.length > 0){
        return data.docs[0].data();
    }
}
const getUserOrCommercialByQrCode = async code =>{
    let data = await getUserRef().where(QRCODE, '==', code).get();
    if(data.docs.length > 0){
        let citizen = decryptCitizenData(data.docs[0].data());
        citizen.isFromUsers = true;
        citizen.isFromCommercials = false;
        return citizen;
    }else{
        let c_data = await getCommercialRef().where(QRCODE, '==', code).get();
       
        if(c_data.docs.length > 0){
            let commercial = c_data.docs[0].data();
            commercial.isFromCommercials = true;
            commercial.isFromUsers = false;
            return commercial;
        }
    }

}

const getUserOrCommercialByPhoneNumber = async code =>{
    let data = await getHouseholdRef().where("phoneNumber", '==', code).get();
    if(data.docs.length > 0){
        let citizen = decryptCitizenData(data.docs[0].data());
        citizen.isFromUsers = true;
        citizen.isFromCommercial = false;
        return citizen;
    }else{
        let c_data = await getGeohashCommercialRef().where("phoneNumber", '==', code).get();
       
        if(c_data.docs.length > 0){
            let commercial = c_data.docs[0].data();
            commercial.isFromCommercial = true;
            commercial.isFromUsers = false;
            return commercial;
        }
    }

}
const getCtptByQrcode = async code => {
    let data = await getCtptRef().where(QRCODE, '==', code).get();
    if(data.docs.length > 0){
        return data.docs[0].data();
    }
}
//used
const getDailyImages = async (userInfo) => {
    let data = await getSaathiImageRef(userInfo).get();
    data = data.data();
    if(!data || !data.images) return [];
    return data.images;
}
const fetchSaathiImage =async(date,userInfo)=> {
    let data = await getSaathiAllImageRef(date,userInfo).get();
    data = data.data();
    if(!data || !data.images) return [];
    return data.images;
    
  }

const updateSaathiWorkDoneImage = async (uid, obj, type,obj1) => {
    
    let ref = {};
    if(type == "complaint") {
        ref = getComplaintUidRef(uid);
    } else if(type == "spotfine"){
        ref = getSpotFineRef().doc(uid);
       
    }else{
        ref = getTaskUidRef(uid);
    }
    ref.set({
        "state": "CLOSED",
        "workDoneImage" : obj,
        "priorToWork"  : obj1,
        "closedDate" : new Date().getTime()
    }, { merge: true }).then(() => {});
}

const updateSaathiNotMyWork = async (uid, obj, type) => {
    
    let ref = {};
    if(type == "complaint") {
        ref = getComplaintUidRef(uid);
    } else if( type == "spotfine") {
        ref = getSpotFineRef().doc(uid);
    }else{
        ref = getTaskUidRef(uid);
    }
    ref.set({
        "state": "ACTIVE",
        "notMyWork" : obj,
        "closedDate" : new Date().getTime()
    }, { merge: true }).then(() => {});
}

 const getOnBoardResidentsQuestions = async () => {
    let data = await  getOnBoardResidentsRef().get();
        if(data.docs.length > 0){
            return data.docs.map(item => Object.assign({}, {id : item.id}, item.data()));
    }
    ctpreturn ;
}

const getSurvey = async (userInfo) => {
    let data = await  getSurveyRef().where('assignedTo', 'in', [userInfo.phoneNumber, "all"]).get();
        if(data.docs.length > 0){
            return data.docs.map(item => Object.assign({}, {id : item.id}, item.data()));
        }
    return ;
}
const addSurvey = async uInfo => {
    const doc_ref = await getSurveyRef().doc(uInfo.survey_id)
    .collection("survey_response")
    .add(uInfo)
    return doc_ref
}

const addObjectInSurvey = async (eachobj,doc_id,uInfo) => {
    await getSurveyRef().doc(uInfo.survey_id)
    .collection("survey_response")
    .doc(doc_id)
    .set(eachobj, { merge:true })
}
//used
const getHouseholdData = async phoneNumber => {
    let data = await getHouseholdRef().where(PHONENUMBER, 'in', [phoneNumber, parseInt(phoneNumber)]).get();
    if(data.docs.length > 0){
        let authUid = data.docs[0].id;
        data = data.docs[0].data();
        if(data && data.phoneNumber){
            data.phoneNumber = data.phoneNumber.toString();
            data.areaCode = data?.ward_id?data.ward_id.toLowerCase().toString():data.areaCode;
            data[AUTHUID] = authUid;
        }
      
        return  decryptCitizenData(data)
    }
    return;
}
//used
const getHouseholdDataByName = async name => {
   let data = await getHouseholdRef().where("name", '==', name).get();
    if(data.docs.length > 0){
        let authUid = data.docs[0].id;
        data = data.docs[0].data();
        if(data && data.phoneNumber){
            data.phoneNumber = data.phoneNumber.toString();
            data.areaCode = data?.ward_id?data.ward_id.toLowerCase().toString():data.areaCode;
            data[AUTHUID] = authUid;
        }
        return decryptCitizenData(data);
    }
    return;
}

//using
const getHouseholdDataById = async id=> {
   let data = await getHouseholdRef().where("user_id", '==', id).get();
    if(data.docs.length > 0){
        let authUid = data.docs[0].id;
        data = data.docs[0].data();
        if(data && data.phoneNumber){
            data.phoneNumber = data.phoneNumber.toString();
            data.areaCode = data?.ward_id?data.ward_id.toLowerCase().toString():data.areaCode;
            data[AUTHUID] = authUid;
        }
        return decryptCitizenData(data);
    }
    return;
}

const getHouseholdPaymentById = async id=> {
    let data = await getHouseholdPaymentsRef().where("user_id", '==', id).get();
    if(data?.docs.length > 0){
        data = data.docs[0].data()?.Paymentsarray;
        return data;
    }
    return;
}

const getLastPaymentDocument = async (id,month,year)=> {
    month =month< 10? "0" +month:month
    let d_id  =id+"-"+month+"-"+year
    let data = await getPaymentRef().doc(d_id).get();
    return data.data()
}

//used
const getSettingsData = async () => {
    let data= await getSettingsRef().get().then(async (snapshot) => {
                let arr= snapshot?.data()?.payments
                return arr;
           });
    return data;
}
//used
const getCheckpoints = async () => {
    let data = await getCheckpointRef().get();
    return data.docs.map(item => Object.assign({}, {id : item.id}, item.data()));
}
const getCheckpointByQr = async scannedValue => {
    let data = await getCheckpointRef().where(QRCODE, '==', scannedValue).get();
    if(data.docs.length > 0){
        return data.docs[0].data();
    }
}

const updateCheckpoints = async (uid, lat, lng) => {
    getCheckpointRef().doc(uid).set({ lat, lng }, { merge: true });
}

const updateCheckpointsQrcode = async (uid,scannedValue) => {
    getCheckpointRef().doc(uid).set({ qrCode:scannedValue }, { merge: true });
}

const updateCtpt = async (uid, lat, long) => {
    // console.log("u",uid,"l",lat,"ln",lng)
    getCtptRef().doc(uid).set({ lat, long }, { merge: true });
}

const updateCtptQrcode = async (uid,scannedValue) => {
    // console.log("u",uid,"l",scannedValue)
    getCtptRef().doc(uid).set({ qrCode:scannedValue }, { merge: true });
}

//used
const onBoardCheckpoint = objectType => {
    
    return getCheckpointRef().add(objectType);
}
//used
const getCheckpointsFromSettings = async () => {
    let data= await getSettingsRef().get()
                .then(async (snapshot) => {
                    let arr= snapshot?.data()?.Checkpoint_Types
                    return arr;
                });
    return data;
}
//used
const getPlaces = async () => {
    let data = await getPlaceRef().get();
    return data.docs.map(item => Object.assign({}, {id : item.id}, item.data()));
}

const updatePlaces = async (uid, lat, long) => {
    getPlaceRef().doc(uid).set({ lat, long }, { merge: true });
}
//used
const onBoardCommercialUsers = com_Info => {
    
    com_Info["lat"] = com_Info.latitude;
    com_Info["long"] = com_Info.longitude;
    com_Info["isCommercial"] = true;
    // com_Info["aadharNumber"] =getEncryptedData("aadharNumber")
    com_Info["date"] = getCurrentDateFmt();
    com_Info["createdTime"] = new Date();
    delete com_Info.latitude;
    delete com_Info.longitude;
    let authUid = generateUUID();
    com_Info.areaCode = com_Info.ward;
    return getCommercialRef().doc(authUid).set({
        ...com_Info, authUid
    }).then(() => {});
}
const getCommercialWardUserData = async phoneNumber => {
    let data = await getCommercialRef().where(PHONENUMBER, '==', phoneNumber).get();
    if(data.docs.length > 0){
        return data.docs[0].data();
    }
}

const sendOTP = async (phoneNumber) => {
    let url = "https://us-central1-binimise-v1.cloudfunctions.net/users_login_otp?";
    url += "phoneNumber="+ phoneNumber + "&mun=" + APP_CONFIG.MUNICIPALITY_NAME;
    let data = await fetch(url);
    data = await data.json();
    return data;
}

//using
const getAppSettings = async () => {
    let data = await getSettingsAppRef().get();
    return data.docs.map(item => Object.assign({}, {id : item.id}, item.data()));
}
//used
const getNotifications = async (userInfo) => {
    let data= await getBroadCastsRef().where('ward_id', 'array-contains-any',userInfo.ward).get()
    return data.docs.map(item =>Object.assign({}, {id : item.id}, item.data()))
        .sort((a,b) => a.createdTime.seconds < b.createdTime.seconds);
} 

const getCtpt = async()=>{
    let data = await getCtptRef().get()
    return data.docs.map(item =>Object.assign({}, {id : item.id}, item.data()))
}

const getAllVehicles = async () => {
    let data = await getVehicleRef().get(); 
    return data.docs.map(item => Object.assign({}, {id : item.id}, item.data()));
}

const addFuelQuantity = objectType => {
    return getFuelQuantityRef().add(objectType);
}

const getFuelRequest = async (filter_value) => {
    let data ;
    if(filter_value!=undefined){
        data = await getFuelQuantityRef().where("isApproved", '==', filter_value).get();
    }else{
        data = await getFuelQuantityRef().get(); 
    }
    return data?.docs?.map(item => Object.assign({}, {id : item.id}, item.data()));
}

const householdOnboardCount = async (saathi_id,date)=> {
    let data = await getUserRef()
                .where("boardedBy", '==', saathi_id)
                .where("date", '==', date)
                .get();
    let count = data?.docs?.length || 0;
    return count;
}

const commercialOnboardCount = async (saathi_id,date)=> {
    let data = await getCommercialRef()
                .where("boardedBy", '==', saathi_id)
                .where("date", '==', date)
                .get();
    let count = data?.docs?.length || 0;
    return count;
}

const householdAckCount = async (saathi_id,date)=> {
    let data = await acknowledgeCustomizedUserRef(date).get();
    let  temp = [];
    data?.docs?.map((each)=>{
        let doc = each.data();
        if(doc.saathiUser?.authId == saathi_id){
            temp.push(each)
        }
    })
    let count = temp?.length || 0;
    return count;
}

const commercialAckCount = async (saathi_id,date)=> {
    let data = await acknowledgeCustomizedCommercialRef(date).get();
    let  temp = [];
    data?.docs?.map((each)=>{
        let doc = each.data();
        if(doc.saathiUser?.authId == saathi_id){
            temp.push(each)
        }
    })
    let count = temp?.length || 0;
    return count;
}

const getCitizensOfWards = async (wards) => {
    let citizens_temp = [];
    let data = await getCitizenRef().where("ward_id", "in", wards).get();

    data?.docs?.map((eachDoc)=>{
        let item =  decryptCitizenData(eachDoc.data());
        citizens_temp.push(item);
    })
    return citizens_temp;
}

const getCommercialsOfWards = async (wards) => {
    let commercial_temp = [];
    let data = await getCommercialRef().where("ward_id", "in", wards).get();
    data?.docs?.map((eachDoc)=>{
        let item =  eachDoc.data();
        commercial_temp.push(item);
    })
    return commercial_temp;
}

const  getAckCitizensOfWards = async (wards,date) => {
    let citizens_temp = [];
    let data = await acknowledgeCustomizedUserRef(date).where("ward_id", "in", wards).get();

    data?.docs?.map((eachDoc)=>{
        let item = eachDoc.data();
        citizens_temp.push(item);
    })
    return citizens_temp;
}

const getAckCommercialsOfWards = async (wards,date) => {
    let commercial_temp = [];
    let data = await acknowledgeCustomizedCommercialRef(date).where("ward_id", "in", wards).get();
    data?.docs?.map((eachDoc)=>{
        let item =  eachDoc.data();
        commercial_temp.push(item);
    })
    return commercial_temp;
}

const getCitizensOfSaathi = async (wards,date) =>{
    let data = {};
    try{
        const [residents, commercials,residentAck,commercialAck] = await Promise.all([
                getCitizensOfWards(wards),
                getCommercialsOfWards(wards),
                getAckCitizensOfWards(wards,date),
                getAckCommercialsOfWards(wards,date),
        ]);
   
        data.householdsAndCommercial = [...residents,...commercials];
        data.householdsAckAndCommercialAck = [...residentAck,...commercialAck];
        return data;
    }catch(e){
        return data;
    }
}

const getAllDetailsofStaff = async(authUid,date) =>{
    let obj = {[AUTHUID]: authUid};
    let data = {};
    try{
        const [households, commercials,householdAck,commercialAck,route,images_list] = await Promise.all([
                householdOnboardCount(authUid,date),
                commercialOnboardCount(authUid,date),
                householdAckCount(authUid,date),
                commercialAckCount(authUid,date),
                getRouteLocation(date,obj),
                fetchSaathiImage(date,obj)
        ]);
        
        data["households"] = households;
        data["commercials"] = commercials;
        data["res_ack"] = householdAck;
        data["com_ack"] = commercialAck;
        data["locations"] = route?.locations || [];
        data["images"] = images_list || []
        return data;
    }catch(e){
        return data;
    }
}

const getSaathi = ()=>{
    return getSaathiRef().get()
}

const fetchAssignedStaff = async (name) =>{
    return getSaathiRef()
    .where("supervisor_name","==",name)
    .get();
    
}

const getBothStaffAndSupervisor = async(s_obj) => {
    let saathiList = {};
    let ph_num = s_obj.phoneNumber;
    let s_name = s_obj.name;
    try {
        const [my_details,data] = await Promise.all([
            getUserData(ph_num),
            fetchAssignedStaff(s_name)
        ]);
        data?.docs?.map((eachSaathi) => {
            let doc_id = eachSaathi.id;
            let obj =  createNewDocOfSaathi(eachSaathi.data());
            saathiList[doc_id] = obj;
        });
        saathiList[my_details[AUTHUID]] = my_details;
        return saathiList;
    } catch (e) {
        return saathiList;
    }

} 



const fetchUserDetails = async (saathi_Obj) =>{
    return getSaathiRef()
    .where(PHONENUMBER,"==",saathi_Obj[PHONENUMBER])
    .get();
    
}

const getPendingAttendanceRef = () => {
    return munAraFirestore.collection(COLLECTIONS.SAATHGEO)
        .doc(getCurrentDateFmt())
        .collection(COLLECTIONS.PENDINGATTENDANCE)
}

const storeAttendaceOfStaff = (obj) =>{
    return getPendingAttendanceRef().add(obj);
}
const getFaceAttendanceRef = (dateString, saathiId) => {
    return munAraFirestore.collection(COLLECTIONS.SAATHGEO)
        .doc(dateString)
        .collection(COLLECTIONS.ATTENDANCE)
        .doc(saathiId)
}

const updateUserFaceAttandance =(saathiId,statusObj) =>{
    
    getFaceAttendanceRef(getCurrentDateFmt(), saathiId).set({
        status: firebase().firestore.FieldValue.arrayUnion(statusObj)
    }, { merge:true });
};

const getFaceAttendance = async(id) => {
    let attendanceArray = await getFaceAttendanceRef(getCurrentDateFmt(),id).get();
    return attendanceArray?.data()?.status || [];
    
}
const getPendingAttendance = async(id) =>{
    let temp = [];
    try{
        
        let pending_att = await getPendingAttendanceRef().where(AUTHUID,"==",id).get();
        pending_att?.docs?.map((eachDoc)=>{
            if(eachDoc.data().attendanceType){
                temp.push(eachDoc.data().attendanceType);
            }
            
        })
        return temp;
    }catch(e){
        return temp;
        console.log("E",e)
    }
   
}
const updateUserLocation = async (saathiId,statusObj)=>{
    let state = await NetInfo.fetch();
    if (state.isConnected) {
        var arr = await AsyncStorage.getItem(USER_LOCATION_SYNC);
        if(!arr || arr == "[]")
            arr = [];
        else
            arr = JSON.parse(arr);
        let location = await getCurrentAsyncLocation();
        location.status = statusObj?"ON":"OFF";
        arr.push(location);
        if(state.isConnected) {
            try {
                let obj = {[AUTHUID]: saathiId};
                updateAgentLocation(obj, arr);
            } catch(e){
                console.log("e " + e.toString())
            }
            arr = [];
        }
        await AsyncStorage.setItem(USER_LOCATION_SYNC, JSON.stringify(arr));
    }
}

const getAttendanceTimings = async () =>{
    let temp = [];
    let data = await getSettingsAppRef()
        .doc(APP_CONFIG.MUNICIPALITY_NAME)
        .collection(COLLECTIONS.ATTENDANCETIME)
        .get()
    data?.docs?.map((eachDoc)=>temp.push(eachDoc.data()));
    return temp;
}

const getDevicesInWard = async wardId => {
    let data = await devicesRef().where("ward_id", "array-contains-any", wardId).get();
    return data;
    
}

const getVehiclesInWard = async wardId => {
    let data = await getVehicleRef().where("ward_id", "array-contains-any", wardId).get();
    return data;
    
}
const getVehiclesOfDevices = (ids) =>{
    return getVehicleRef()
        .where("device_id","in",ids)
    
}
const getVehicleAndGeo = async (ids) =>{
    let data = {};
    try{
        const [geo, vehicles] = await Promise.all([
                driverLocationsInWard(ids).get(),
                getVehiclesOfDevices(ids).get()
        ]);
   
        data.location = geo;
        data.vehicles = vehicles;
        return data;
    }catch(e){
        return data;
    }
}
const driverLocationsInWard = ids => {
    return getDeviceGeoRef()
            .where('date', '==', getCurrentDateNormalFmt())
            .where('imei', 'in', ids)
}

const getAppUpdateVersion = async () => { 
    let temp = await getSettingsRef().get();
    return temp?.data();
}

const createSaathiThumbnail = async(imageUrl, authID) => {
    let returnedUrl = "";
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("apy-token", "APY0Bv3kyJRXa5fnNbBxTzGSTHFxFoWpveEMQbRlqrYiA3zlpw5fOgCK6awfstx9L1nakOLqhsY17T");

    let raw = JSON.stringify({
        "url": imageUrl
    });

    let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    const storageRef = firebase().firebase.storage();
    console.log("imageUrl",imageUrl)
    try {
        if (imageUrl) {
            const response = await fetch("https://api.apyhub.com/generate/image/thumbnail/url/file?url=" + encodeURIComponent(imageUrl) + "&width=100&height=100", requestOptions);

            if (response.status === 429) {
                // Too Many Requests - Implement rate limiting or retry logic here
                console.log("Too Many Requests.");
                return;
            }

            const buffer = await response.arrayBuffer();

            if (!buffer) {
                return;
            }

            // const base64 = Buffer.from(new Uint8Array(buffer)).toString('base64');
            // const base64 = RNFetchBlob.fs.base64.encode(new Uint8Array(buffer));
            const base64 = RNFetchBlob.base64.encode(new Uint8Array(buffer));
            console.log("base64",base64)
            const imageRef = "saathiThumbnailImage/" + authID + "/" + new Date().getTime() + '.jpg';
            const reference = storageRef.ref(imageRef);
            await reference.putString(base64, 'base64', { contentType: 'image/jpeg' });
            const downloadUrl = await reference.getDownloadURL();
            console.log("DOlwnloadUrl",downloadUrl)

            returnedUrl = downloadUrl;
        } else {
            console.log("Image not available for ID " + authID);
        }
    } catch (error) {
        console.log('Error uploading image:', error);
    }

    return returnedUrl;
}

const modifySaathiThumbnail = async(imageUrl, authID) => {
    try {
        await deleteSaathiThumbnail(authID);

        let data = await createSaathiThumbnail(imageUrl, authID);
        return data || imageUrl;
    } catch (error) {
        console.error("Error:", error);
        return imageUrl;
    }
}

export async function deleteSaathiThumbnail(authID) {
    console.log("AUTHIDIN D",authID);
    // const storageRef = firebase.storage().ref();
    const storageRef = firebase().firebase.storage();
    const folderRef = storageRef.ref("saathiThumbnailImage/" + authID);
    console.log("FolderRef",folderRef);

    try {
        const res = await folderRef.listAll();

        if (res.items.length > 0) {
            const promises = res.items.map(async (item) => await item.delete());
            await Promise.all(promises);
        }
    
    } catch (error) {
        console.log('Error checking folder or deleting files:', error);
    }
}

const  getStaffMeta = async() =>{
    let staff_doc = await getSaathiMetaRef().get();
    
    return staff_doc&&staff_doc.data()&& staff_doc.data().data || {};
}

const storeSaathiMetaData = async(saathiObj) =>{
    return getSaathiMetaRef().update({data:saathiObj});
}

export { 
        getWelcomeText, updateUserData, getUserData, addUserData, getUserLocation, updateTaskStatus, acknowledgeUser, acknowledgeWasteSegregationUser, getAcknowledgedUser,
        getAllAreas, getTasks, updateUserToken, updateUserLocationInWard, getUsersInWards, updateAgentStatus, onBoardUsers, getWardUserData, getUserByQrCode, updateSaathiImage,
        getDailyImages, syncBackgroundLocation, updateSaathiWorkDoneImage, updateSaathiNotMyWork, getTaskAndComplaints, getAttendance, getRouteLocation, getCitizenData, 
        updateCitizenData, getCitizenDataByName,getOnBoardResidentsQuestions,getSurvey,addSurvey,getHouseholdData,getHouseholdDataByName,addObjectInSurvey,
        checkUsersData,getCheckpoints,updateCheckpoints,getCheckpointsFromSettings,onBoardCheckpoint,updateCheckpointsQrcode,updateCtPt,getPlaces,updatePlaces,
        onBoardCommercialUsers,getCommercialWardUserData,getUsersNearby,getSettingsData,addpayment,addHousehold,sendpaymentreceipt,addURpayment, addURUser,
        getHouseholdDataById, updateURUser,sendOTP,getAppSettings,getNotifications,getCtptByQrcode,addCtptAttendance,getCtpt,updateCtpt,
        updateCtptQrcode,getCheckpointByQr,updateUserStatus,fetchSaathiImage,getCommercialByQrCode,getHouseholdPaymentById,getSaathi,getStaffMeta,storeSaathiMetaData,
        addHouseholdPayment,getComplaints,getLastPaymentDocument,getAllVehicles,addFuelQuantity,getFuelRequest,acknowledgeCommercial,driverLocationsInWard,
        acknowledgeWasteSegregationCommercial,getUserOrCommercialByQrCode,acknowledgeUserOrCommercial,getCitizensOfSaathi,fetchWardsData,deleteStaff,fetchAssignedStaff,fetchUserDetails,
        acknowledgeWasteSegregationUserOrCommercial,householdOnboardCount,commercialOnboardCount,householdAckCount,commercialAckCount,uploadSaathiImage,getAllDetailsofStaff,
        getFaceAttendance,updateUserFaceAttandance,updateUserLocation,getUserOrCommercialByPhoneNumber,acknowledgeUserOrCommercialOrCheckpoint,getDevicesInWard,getVehicleAndGeo,
        acknowledgeWasteSegregationUserOrCommercialOrCheckpoint,checkSaathiData,getAttendanceOfSaathi, updateSaathiStatus,getAttendanceTimings,updateSpotFine,fetchSaathiAssingedWards,getRouteOfStaff,
        getVehiclesInWard,getRouteOfVehicle,storeAttendaceOfStaff,updateLogOutFlag,getAppUpdateVersion,updateAppVerionOfStaff,updateSelfDocument,createSaathiThumbnail,modifySaathiThumbnail,updateSupervisorOfSaathi,
        getBothStaffAndSupervisor,getPendingAttendance,getSpotFine
       
}