import firebase from "./../repo/firebase";

let analytics = firebase().analytics();
analytics.setAnalyticsCollectionEnabled(true);

let userInfo = {
    name : "",
    phoneNumber : ""
}

const logEvent = (key, obj) => {
    analytics.logEvent(key, obj);
}

const initAnalytics = (name, phoneNumber) => {
    userInfo.name = name;
    userInfo.phoneNumber = phoneNumber;
}

export { logEvent, initAnalytics }