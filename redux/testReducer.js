import { 
    TEST_SAGA,
    UPDATE_DATA
} from "./constants";

let reducer = {
    test : {},

     // errorModal
     errorModalInfo : {
        showModal : false,
        title : "",
        message : "",
        buttonText : "",
        onClose : ""
    },

    // confirmModal
    confirmModalInfo : {
        showModal : false,
        title : "",
        message : "",
        primaryText : "",
        primaryAction : "",
        secondaryText : "",
        secondaryAction : ""
    },
    updateModalInfo : {
        showModal : false,
        title : "",
        message : "",
        primaryText : "",
        primaryAction : "",
        secondaryText : "",
        secondaryAction : ""
    },

    languageChangeModalInfo : {
        showModal : false,
    },

    // carousel
    carouselData : {
        show : false,
        imageList : []
    },

    updateUserInfoFlag : false,

    // loading
    loading : {
        show : false,
        message : ""
    },

    camera : {
        show : false
    },

    sidebar : {
        show : false
    },

    userInfo : {},

    blockedNotifications : [],

    selectedLanguage : "en",

    // camera
    cameraInfo : {
        navigation :undefined,
        show : false,
        imageUrl : "",
        imageRef : "",
        onLoadOp : {}
    },
    
    tokenFromOneSignal : "",

    oneSignalToken:"",
    allSaathiObj:{}
};

export default (state = reducer, action) => {
    switch (action.type) {
        case TEST_SAGA:
            return Object.assign({}, state, { test: action.payload });
        case UPDATE_DATA:
            return { ...state, ...action.data };
        default:
            return state;
    }
};