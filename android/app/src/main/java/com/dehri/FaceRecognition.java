package com.dehri;

import android.annotation.SuppressLint;
import android.provider.Settings;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactApplicationContext;

import com.facebook.react.bridge.ReactMethod;

public class FaceRecognition extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    ReactImageProcessUtils reactImageProcessUtils;

    String eventType = "store"; // "store" or "recognize"
    FaceRecognition(ReactApplicationContext context) {
        super(context);
        reactContext = context;
        reactImageProcessUtils = new ReactImageProcessUtils(context.getApplicationContext());
    }

    @NonNull
    @Override
    public String getName() {
        return "FaceRecognition";
    }

    @ReactMethod
    public void StoreImage(String uniqueId, String base64, Promise response) {
        try {
            reactImageProcessUtils.setPromise(response);
            reactImageProcessUtils.setFaceImage(uniqueId, base64);
        } catch (Exception e) {
            response.reject("Error", e);
        }
    }

    @ReactMethod
    public void RecognizeImage(String base64, Promise response) {
        try {
            reactImageProcessUtils.setRecognitionPromise(response);
            reactImageProcessUtils.recognizeFaceImage(base64);
        } catch (Exception e) {
            response.reject("Error", e);
        }
    }



    @ReactMethod
    public void getPhoneID(Promise response) {
        try {
            @SuppressLint("HardwareIds") String id = Settings.Secure.getString(reactContext.getContentResolver(), Settings.Secure.ANDROID_ID);
            response.resolve(id);
        } catch (Exception e) {
            response.reject("Error", e);
        }
    }
}