import firebase from "@react-native-firebase/app";
import auth from "@react-native-firebase/auth";
import database from "@react-native-firebase/database";
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import remoteConfig from '@react-native-firebase/remote-config';
// import crashlytics from '@react-native-firebase/crashlytics';
import analytics from '@react-native-firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyDGujzrdjwGvcq2FbsdEUV4t_-MYhL9dfQ",
    authDomain: "binimise-v1.firebaseapp.com",
    databaseURL: "https://binimise-v1.firebaseio.com",
    projectId: "binimise-v1",
    storageBucket: "binimise-v1.appspot.com",
    messagingSenderId: "149629247619",
    appId: "1:149629247619:web:c26ab6066e1acf07933bb6",
    measurementId: "G-H51MQTTTHS"
  }

if(!firebase.apps.length)
    firebase.initializeApp(firebaseConfig);

export default () => {
    return {firebase, auth, database, storage, firestore, remoteConfig, analytics};
}