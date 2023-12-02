// export const HOST = "http://192.168.31.16:5000";
import { APP_CONFIG } from "./util";
export const HOST = "https://aqueous-woodland-65692.herokuapp.com";


export const createNewDocOfSaathi = (staffObj) =>{
    let obj = {};
    
    
    obj["address"] = staffObj.address || "";
    obj["areaCode"] = staffObj.ward || [];
    obj["authUid"] = staffObj.authUid || "";
    obj["id"] = staffObj.userId || staffObj.id || "";
    obj["imageUrl"] = staffObj.imageUrl || ""; //there imageUrl
    obj["isApproved"] = staffObj.isApproved || false;
    obj["isFaceRegistered"] = staffObj.isFaceRegistered || false;
    obj["isSupervisor"] = staffObj.isSupervisor || false;
    obj["landmark"] = staffObj.landmark || "";
    obj["municipality"] = APP_CONFIG.MUNICIPALITY_NAME;
    obj["name"] = staffObj.name || "";
    obj["phoneNumber"] = staffObj.phoneNumber || "";
    obj["saathi_list"] = staffObj.saathi_list || [];
    obj["staffType"] = staffObj.staffType || "Agency";
    obj["status"] = staffObj.status || false;
    obj["supervisor"] = staffObj.supervisor || {};
    obj["supervisor_name"] = staffObj.supervisor_name || "Admin";
    obj["thumbnailUrl"] = staffObj.thumbnailUrl || ""; //change it later
    obj["userId"] = staffObj.userId || staffObj.id;
    obj["userType"] = "saathi";
    obj["ward"] = staffObj.ward || [];
    obj["email"] = staffObj.email || "";
    obj["father_name"] = staffObj.father_name || "";
    return obj;
}

export const modifyDocOfStaff = (staffObj) =>{
    let obj = {};
    
    obj["name"] = staffObj.name || null;
    obj["phoneNumber"] = staffObj.phoneNumber || null;
    obj["userId"] = staffObj.userId || staffObj.id || null;
    obj["staffType"] = staffObj.staffType || "Agency";
    obj["authUid"] = staffObj.authUid;
    obj["isApproved"] = (staffObj.isApproved || false).toString();
    obj["isSupervisor"] = (staffObj.isSupervisor || false).toString();
    obj["supervisor"] = staffObj.supervisor || {};
    obj["supervisor_name"] = staffObj.supervisor_name || "Admin";
    obj["imageUrl"] = staffObj.imageUrl || ""; //there imageUrl
    obj["thumbnailUrl"] = staffObj.thumbnailUrl || "";
    obj["wards"] =  staffObj.ward || []
   
   
    return obj;
}