import firebase from "./../repo/firebase";
import { getCurrentDateFmt, APP_CONFIG, AUTHUID,PHONENUMBER, getCurrentDate,getCurrentDateNormalFmt } from "./../global/util";
import CryptoJS from 'crypto-js';
export const HASH = "6fb74b35af6ce0";

const fireStore = firebase().firestore();
const munAraFirestore = fireStore.collection(APP_CONFIG.MUNICIPALITY).doc(APP_CONFIG.MUNICIPALITY_NAME);
const COLLECTIONS = {
    TASKS: "tasks",
    COMPLAINTS : "complaints",
    USERS : "users",
    WARD_USER : "ward_user",
    DEVICE_GEO : "device_geo",
    DEVICES : "devices",
    WARDS : "wards",
    PLACES : "places",
    CHECKPOINT : "checkpoint",
    BROADCAST : "broadcast",
    SUGGESTION : "suggestion",
    VEHICLES: "vehicles",
    REPORTS: "reports",
    FEEDBACK: "feedback",
    SURVEY:"survey",
    TASKPAYMENTS : "task_payments",
    SETTINGS_APP  : "settings_app",
    CTPT :"ctpt",
    ACKNOWLEDGE : "acknowledge",
    SETTINGS_WEB : "settings_web",
    WARD_MANAGER: "ward_manager"

}

const getEncryptedData = (message) => {
    let data = CryptoJS.AES.encrypt(message, HASH).toString();
    return data;
}

const getDecryptedData = (message) => {
    var bytes  = CryptoJS.AES.decrypt(message, HASH);
    let data = bytes.toString(CryptoJS.enc.Utf8);
    return data;
}


const decryptCitizenData = d_user => {
    d_user["name"] = getDecryptedData(d_user["name"]);
    d_user["lat"] = d_user.lat?parseFloat(getDecryptedData(d_user["lat"])):null;
    d_user["long"] = d_user.long?parseFloat(getDecryptedData(d_user["long"])):null;
    d_user["address"] = getDecryptedData(d_user["address"]);
    return d_user;
}

const encryptCitizenData = e_user => {
    e_user["name"] = getEncryptedData(e_user["name"]);
    e_user["lat"] = e_user.lat?getEncryptedData(e_user.lat.toString()):null;
    e_user["long"] = e_user.long?getEncryptedData(e_user.long.toString()):null;
    e_user["address"] = getEncryptedData(e_user["address"]);
    return e_user;
}

const acknowledgeUserRef = (eachDateOfMonth) => {
    // console.log("eachDateofMonth",eachDateOfMonth)
    return munAraFirestore.collection(COLLECTIONS.ACKNOWLEDGE)
        .doc(eachDateOfMonth)
        .collection(COLLECTIONS.ACKNOWLEDGE)
}

const getCtptRef = () => {
    return munAraFirestore.collection(COLLECTIONS.CTPT);
}

const getSettingsRef = () => {
    return munAraFirestore;
}

const getSettingsWebRef = () => {
    return munAraFirestore.collection(COLLECTIONS.SETTINGS_WEB);
}

const getSettingsAppRef = () => {
    return munAraFirestore.collection(COLLECTIONS.SETTINGS_APP);
}

const getComplaintRef = () => {
    return munAraFirestore.collection(COLLECTIONS.COMPLAINTS);
}

const getTasksRef = () => {
    return munAraFirestore.collection(COLLECTIONS.TASKS);
}

const getTaskPaymentsRef = () => {
    return munAraFirestore.collection(COLLECTIONS.TASKPAYMENTS);
}

const getUserRef = () => {
    return munAraFirestore.collection(COLLECTIONS.USERS);
}

const getFeedbackRef = () => {
    return munAraFirestore.collection(COLLECTIONS.FEEDBACK);
}

const getReportRef = () => {
    return munAraFirestore.collection(COLLECTIONS.REPORTS);
}
const getSuggestionRef = () => {
    return munAraFirestore.collection(COLLECTIONS.SUGGESTION);
}

const getWardUserRef = userInfo => {
    return munAraFirestore.collection(COLLECTIONS.USERS).doc(userInfo[AUTHUID]);
}

const getWardsRef = () => {
    return munAraFirestore.collection(COLLECTIONS.WARDS);
}

const getVehicleRef = () => {
    return munAraFirestore.collection(COLLECTIONS.VEHICLES);
}

const getBroadCastsRef = () => {
    return munAraFirestore.collection(COLLECTIONS.BROADCAST);
}

const getPlacesRef = () => {
    // return fireStore.collection(APP_CONFIG.MUNICIPALITY).doc("buxar").collection(COLLECTIONS.PLACES)
    return munAraFirestore.collection(COLLECTIONS.PLACES);
}

const getDeviceGeoRef = () => {
    return munAraFirestore.collection(COLLECTIONS.DEVICE_GEO)
}

const devicesRef = () => {
    return munAraFirestore.collection(COLLECTIONS.DEVICES);
}

const getSurveyRef = () => {
    return munAraFirestore.collection(COLLECTIONS.SURVEY);
}

const driverLocationsInWard = ids => {
    return getDeviceGeoRef()
            .where('date', '==', getCurrentDateFmt())
            .where('imei', 'in', ids)
}

const updateComplaints = (obj,userObj) => {
    let complaintObj = { ...obj,...userObj};
    complaintObj["createdTime"] = new Date();
    let rand = Math.floor(10000 * Math.random());
    let randNumber = APP_CONFIG.MUNICIPALITY_NAME + "-"+ userObj.areaCode.replace("ward-", "") + "-" + new Date().toDateString().split(' ').join('-') + "-" + rand;
    complaintObj["id"] = randNumber;
    complaintObj["typesOfGarbageDump"] = complaintObj.typesOfComplaint;
    // complaintObj["location"] = { latitude, longitude };
    complaintObj["created_date"] = getCurrentDate();
    complaintObj["state"] = "ACTIVE";
    getComplaintRef()
        .doc(randNumber)
        .set(complaintObj)
        .then(() => {})
        .catch(e => {});
}

const updateTasks = (obj, userTaskObj) => {
    let taskObj = { ...userTaskObj, ...obj };
    taskObj["createdTime"] = new Date();
    let rand = Math.floor(10000 * Math.random());
    let randNumber = APP_CONFIG.MUNICIPALITY_NAME + "-"+ userTaskObj.areaCode.replace("ward-", "") + "-" + new Date().toDateString().split(' ').join('-') + "-" + rand;
    taskObj["id"] = randNumber;
    taskObj["taskType"] = "onDemandRequest";
    taskObj["state"] = "ACTIVE";
    taskObj["created_date"] = getCurrentDate();
    getTasksRef()
        .doc(randNumber)
        .set(taskObj)
        .then(() => {})
        .catch(e => {});
}

const updateTaskPayments = (newObj, userInfo ) => {
   
    let taskPaymentObj={...newObj}
 
     taskPaymentObj["address"] = userInfo.address;
     taskPaymentObj["areaCode"] = userInfo.areaCode;
     taskPaymentObj["authUid"] = userInfo.authUid;
     taskPaymentObj["name"] = userInfo.name;
     taskPaymentObj["phoneNumber"] = userInfo.phoneNumber;
     taskPaymentObj["createdTime"] = new Date();
       
     getTaskPaymentsRef()
         .doc(taskPaymentObj.task_id)
         .set(taskPaymentObj, { merge:true })
         .then(() => {})
         .catch(e => {});
 }
 
 
 
 const getTaskPayments = async userInfo => {
     let data = await getTaskPaymentsRef()
                     .where('phoneNumber', '==', userInfo.phoneNumber)
                     .get();
     return data.docs.map(item => Object.assign({}, {id : item.id}, item.data())).sort((a,b) => a.createdTime.seconds < b.createdTime.seconds);
 }

 const getAppSettings = async () => {
    let data = await getSettingsAppRef().doc(APP_CONFIG.MUNICIPALITY_NAME).get();
    return data?.data?.() || {};
}

const getManagerDetails = async (ward_id)=>{
    let data = await getSettingsAppRef()
                    .doc(APP_CONFIG.MUNICIPALITY_NAME)
                    .collection(COLLECTIONS.WARD_MANAGER)
                    .doc(ward_id)
                    .get();
    return data.data()
}
const addAppSettings = async (editedObj,doc_id) => {
    let obj={}
    obj.userlist =editedObj
    await getSettingsAppRef()
    .doc(doc_id)
    .set(obj, { merge:true })
}
const addSuggestion = async (new_sug) => {
    await getSuggestionRef().add(new_sug);
}

const getAllSuggestions = async (userInfo) => {
   
    let data = await getSuggestionRef()
                    .where('phoneNumber', '==', userInfo[PHONENUMBER])
                    .get();
                 
    return data.docs.map(item => Object.assign({}, {id : item.id}, item.data()));
}

const getDevices = async () => {
      let data = await  getDeviceGeoRef()
                        .get();
      return data.docs.map(item => Object.assign({}, {id : item.id}, item.data()));
}

const getSurvey = async () => {
    let data = await  getSurveyRef()
                      .get();
                      if(data.docs.length > 0){
                        return data.docs.map(item => Object.assign({}, {id : item.id}, item.data()));
                    }
       
    return ;
}

const getFeedback = async () => {
    let data = await  getFeedbackRef()
                      .get();
                      if(data.docs.length > 0){
                        return data.docs.map(item => Object.assign({}, {id : item.id}, item.data()));
                    }
    return ;
}



const addFeedbackData = async (feed_doc) => {
    // feed_doc=encryptCitizenData(feed_doc)
    const doc_ref= await getFeedbackRef().add(feed_doc)
    return doc_ref.id;
}


const addObjectsInFeedback = async (eachobj,doc_id) => {
    await getFeedbackRef()
    .doc(doc_id)
    .set(eachobj, { merge:true })
}
const addUserData = async userInfo => {
    try{
        userInfo["fb_uid"] = userInfo[AUTHUID];
        userInfo["ward_id"] = userInfo.ward;
       
        userInfo =encryptCitizenData(userInfo)
        await getUserRef()
        .doc(userInfo[AUTHUID])
        .set(userInfo, { merge:true })
    }catch(e){
        console.log(e);
    }
}

const getUserData = async phoneNumber => {
    let data = await getUserRef()
                    .where('phoneNumber', '==', phoneNumber)
                    .get();
    if(data.docs.length > 0){
        data = data.docs[0].data();
        return decryptCitizenData(data);
    }
    return;
}



// const addUserData = async userInfo => {
//     await getUserRef()
//     .doc(userInfo[AUTHUID])
//     .set(userInfo, { merge:true })
// }

// const getUserData = async phoneNumber => {
//     let data = await getUserRef()
//                     .where('phoneNumber', '==', phoneNumber)
//                     .get();
//     if(data.docs.length > 0){
//         return data.docs[0].data();
//     }
//     return;
// }

const getAllAreas = async () => {
    let data = await getWardsRef().get(); 
    return data.docs;
} 

const getAllVehicles = async () => {
    let data = await getVehicleRef().get(); 
    return data.docs.map(item => Object.assign({}, {id : item.id}, item.data()));
} 

const getVehiclesInWard = async wardId => {
    let data = await getVehicleRef().where("ward_id", "array-contains-any", [wardId]).get();
    return data;
    
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

const updateUserToken = (userInfo, token) => {
    // console.log("userIn",userInfo,"t",token)
    if(!userInfo.isNotificationOn){
        token =""
    }
    getWardUserRef(userInfo)
    .update({token})
    .then(() => {});
}

const updateUserLocationInWard = async (userInfo, lat, long) => {
    getWardUserRef(userInfo)
    .update({ lat, long })
    .then(() => {});
}

const getUserTasks = async userInfo => {
    let data = await getTasksRef()
                    .where('phoneNumber', '==', userInfo.phoneNumber)
                    .where('taskType', '==', "onDemandRequest")
                    .get();
    return data.docs.map(item => Object.assign({}, {id : item.id}, item.data())).sort((a,b) => a.createdTime.seconds < b.createdTime.seconds);
}

const getUserComplaints = async userInfo => {
    
    let data = await getComplaintRef()
                    .where('phoneNumber', '==',userInfo.phoneNumber)
                    .get();
    return  data.docs.map(item => Object.assign({}, {id : item.id}, item.data())).sort((a,b) => a.createdTime.seconds < b.createdTime.seconds);
    
}

const getActiveComplaints = async userInfo => {
    let data = await getComplaintRef()
                    .where('phoneNumber', '==', userInfo.phoneNumber)
                    .where('state', '==', "ACTIVE")
                    .get();
    return data.docs.map(item => Object.assign({}, {id : item.id}, item.data())).sort((a,b) => a.createdTime.seconds < b.createdTime.seconds);
}

const getAssignedComplaints = async userInfo => {
    let data = await getComplaintRef()
                    .where('phoneNumber', '==', userInfo.phoneNumber)
                    .where('state', '==', "ASSIGNED")
                    .get();
    return data.docs.map(item => Object.assign({}, {id : item.id}, item.data())).sort((a,b) => a.createdTime.seconds < b.createdTime.seconds);
}

const getClosedComplaints = async userInfo => {
    let data = await getComplaintRef()
                    .where('phoneNumber', '==', userInfo.phoneNumber)
                    .where('state', '==', "CLOSED")
                    .get();
    return data.docs.map(item => Object.assign({}, {id : item.id}, item.data())).sort((a,b) => a.createdTime.seconds < b.createdTime.seconds);
}


const getVehiclesGeo = async (date,selectedvehicle) => {
    let data = await getReportRef()
                    .where("date", "==", date)
                    // .where("device_id", "==", selectedvehicle)
                    .get();
                
    return data.docs.map(item => Object.assign({}, {id : item.id}, item.data()));
}

const getVehicleGeo = async (date,selectedvehicle) => {
    let data = await getReportRef()
                    .where("date", "==", date)
                    .where("device_id", "==", selectedvehicle)
                    .get();
                
                    return data.docs.map(item => Object.assign({}, {id : item.id}, item.data()));
}

const deleteComplaint = async id => {
    getComplaintRef()
    .doc(id)
    .update({ status: false })
    .then(() => {});
}

const deleteTask = async id => {
    getTasksRef()
    .doc(id)
    .update({ status: false })
    .then(() => {});
}

const getDevicesInWard = async wardId => {
    let data = await devicesRef().get();
    return data.docs.map(item => item.data()).filter(item => {
        if(!item.ward_id) return false;
        if(!Array.isArray(item.ward_id)) return false;
        for(var i = 0 ; i < item.ward_id.length; i++) {
            if(item.ward_id[i] == wardId){
                return true;
            }
        }
        return false;
    });
}

const getNotifications = async (userInfo, blockedNotifications) => {
    let data = await getBroadCastsRef()
                    .where('ward_id', 'array-contains', userInfo.ward)
                    .get();
    return data.docs.map(item => Object.assign({}, {id : item.id}, item.data()))
            .sort((a,b) => a.createdTime < b.createdTime);
}

const getPlaces = async () => {
    let data = await getPlacesRef()
                    .get();
    return data.docs.map(item => Object.assign({}, {id : item.id}, item.data()));
}

const blockNotificationForUser = async (userInfo, notificationId) => {
    await getWardUserRef(userInfo)
    .collection("notifications")
    .doc(notificationId)
    .set({ notificationId });
}

const getUserBlockedNotifications = async userInfo => {
    let data = await getWardUserRef(userInfo)
                    .collection("notifications")
                    .get();
    return data.docs.map(item => item.id);
}

const getSettingsData = async () => {
    
    let data= await getSettingsRef().get()
           .then(async (snapshot) => {
             let arr= snapshot?.data()?.booking_payments
              return arr;
           });
     
     return data
}

const getCheckpointsFromSettings = async () => {
    let data= await getSettingsRef().get()
                .then(async (snapshot) => {
                    let arr= snapshot?.data()?.Checkpoint_Types
                    return arr;
                });
    return data;
}



const sendOTP = async (phoneNumber) => {
    let url = "https://us-central1-binimise-v1.cloudfunctions.net/users_login_otp?";
    url += "phoneNumber="+ phoneNumber + "&mun=" + APP_CONFIG.MUNICIPALITY_NAME_C;
    let data = await fetch(url);
    data = await data.json();
    
    return data;
    
}

const getComplaintsFromSettings = async () => {
    let data= await getSettingsRef().get()
           .then(async (snapshot) => {
             let arr= snapshot?.data()?.Complaint_Types
              return arr;
           });

     return data;
}

// const getComplaintsFromSettings = async (selectedLanguage) => {
//     let data= await getSettingsWebRef().doc("complaints").get()
//     return data.data()?.complaint_types?.[selectedLanguage]
// }

// const getTasksFromSettings = async (selectedLanguage) => {
//     let data= await getSettingsWebRef().doc("tasks").get()
//     return data.data()?.task_types?.[selectedLanguage]
// }

const getTasksFromSettings = async () => {
    let data= await getSettingsRef().get()
        .then(async (snapshot) => {
            let arr= snapshot?.data()?.Task_Types
            return arr;
        });
    return data;
}

const getCtpt = async() => {
    let data = await getCtptRef().get();
    return data.docs.map(item => Object.assign({}, {id : item.id}, item.data()));
}

const updateSaathiWorkDoneImage = async (uid, obj) => {
   await getComplaintRef().doc(uid).set({
        "state": "CLOSED",
        "workDoneImage" : obj,
        "closedDate" : new Date().getTime()
    }, { merge: true }).then(() => {});
}

const getAcknowledge = async(dateString, document) => {
    let obj = {
        id:dateString
    };
    let doc = await acknowledgeUserRef(dateString).doc(document).get();
    obj.item = doc?.data() || {};
    return obj;

}

// export function getMonthlySaathiAttendance(date, id) {
 
//     return db
//       .collection("mun")
//       .doc(window.localStorage.mun)
//       .collection("saathiGeo")
//       .doc(date)
//       .collection("attendance")
      
//       .get();
//   }
const getDoorInfo = async (doorNo) =>{
    let data = await getUserRef().where("DDN_NO", '==', doorNo).get();
    if(data.docs.length > 0){
        data = data.docs[0].data();
        return decryptCitizenData(data);
    }
    return ;
}
export { getUserData, addUserData, getDevicesInWard, blockNotificationForUser, getPlaces, deleteTask,getCtpt,
         getAllAreas, getNotifications, deleteComplaint, getUserBlockedNotifications, getUserTasks, updateTasks,
         updateUserToken, updateUserLocationInWard, updateComplaints, getUserComplaints, driverLocationsInWard,
         addSuggestion,getAllVehicles,getVehiclesGeo,addFeedbackData,getAllSuggestions,getActiveComplaints,getAssignedComplaints,
         getClosedComplaints,getDevices,getSettingsData, getVehicleGeo,getSurvey,updateTaskPayments,getTaskPayments,sendOTP,
         getComplaintsFromSettings,getTasksFromSettings,getAppSettings,addObjectsInFeedback,getFeedback,addAppSettings,
         updateSaathiWorkDoneImage,getAcknowledge,getManagerDetails,getDoorInfo,getVehiclesInWard,getRouteOfVehicle
    }