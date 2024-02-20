package com.dehri;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import android.util.Log;


import com.facebook.react.bridge.Promise;
import com.dehri.database.User;
import com.dehri.database.UserUtils;
import com.google.mlkit.vision.face.Face;

import org.tensorflow.lite.Interpreter;
import org.tensorflow.lite.support.common.FileUtil;

import java.io.IOException;
import java.util.List;

public class ReactImageProcessUtils {
    private Promise mPromise;

    private Promise recognitionPromise;

    public ReactImageProcessUtils(Context context) {
        setProcessor(context);
        UserUtils.initDatabase(context);
        fetchAllUsers();
    }

    public static final String TAG = "FaceRecognitionProcessor";
    private Interpreter faceNetInterpreter;
    private FaceRecognitionProcessor faceRecognitionProcessor;

    //    private Face face;
//    private Bitmap faceBitmap;
//    private float[] faceVector;
//    protected PreviewView previewView;
//    protected GraphicOverlay graphicOverlay;
    //    private VisionBaseProcessor processor;
    private FaceRecognitionProcessor.FaceRecognitionCallback faceReconizationCallBack = new FaceRecognitionProcessor.FaceRecognitionCallback() {
        @SuppressLint("LongLogTag")
        @Override
        public void onFaceRecognised(Face face, float probability, String name) {
            Log.d(TAG, "onFaceRecognised:probability " + probability);
            Log.d(TAG, "onFaceRecognised:name " + name);
            Log.d(TAG, "onFaceRecognised:tracking id " + face.getTrackingId());
            Log.d(TAG, "onFaceRecognised:face " + face);
            if(recognitionPromise != null) {
                recognitionPromise.resolve(name);
                recognitionPromise = null;
            }
        }

        @Override
        public void onFaceDetected(Face face, Bitmap faceBitmap, float[] vector) {
//            ReactImageProcessUtils.this.face = face;
//            ReactImageProcessUtils.this.faceBitmap = faceBitmap;
//            ReactImageProcessUtils.this.faceVector = faceVector;
//            String name = UUID.randomUUID().toString();
            Log.d(TAG, "onFaceDetected:name " + mFaceDetectionName);
            Log.d(TAG, "onFaceDetected:face " + face);
            if(mPromise != null) {
                registerFace(mFaceDetectionName, vector);
                mPromise.resolve("Success");
                mPromise = null;
                mFaceDetectionName = "";
            }
        }

        @Override
        public void onFailure(String msg) {
//            ReactImageProcessUtils.this.face = face;
//            ReactImageProcessUtils.this.faceBitmap = faceBitmap;
//            ReactImageProcessUtils.this.faceVector = faceVector;
//            String name = UUID.randomUUID().toString();
            Log.d(TAG, "Failure");
            if(mPromise != null) {
                mPromise.reject("Fail", msg);
            }
            if(recognitionPromise != null) {
                recognitionPromise.reject("Fail", msg);
            }
        }
    };
    private String mFaceDetectionName;

    private void setProcessor(Context context) {
        try {
            faceNetInterpreter = new Interpreter(FileUtil.loadMappedFile(context, "mobile_face_net.tflite"), new Interpreter.Options());
        } catch (IOException e) {
            e.printStackTrace();
        }

        faceRecognitionProcessor = new FaceRecognitionProcessor(faceNetInterpreter, faceReconizationCallBack);
//        faceRecognitionProcessor.activity = this;
//        return faceRecognitionProcessor;
    }


    public void registerFace(String input, float[] tempVector) {
        faceRecognitionProcessor.registerFace(input, tempVector);
        UserUtils.addUser(input, tempVector);
    }

    /**
     * The face detector provides face bounds whose coordinates, width and height depend on the
     * preview's width and height, which is guaranteed to be available after the preview starts
     * streaming.
     */
    public void setFaceDetector(String name, Bitmap bitmap) {
        Log.d(TAG, "setFaceDetector: " + name);
        mFaceDetectionName = name;
        faceRecognitionProcessor.detectInImage(bitmap, 0);
    }

    public void setFaceImage(String name, String encodedImage) {
        byte[] decodedString = Base64.decode(encodedImage, Base64.DEFAULT);
        Bitmap decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
        Log.d(TAG, "setFaceImage: " + name);
        mFaceDetectionName = name;
        faceRecognitionProcessor.detectInImage(decodedByte, 0);
    }

    public void recognizeFaceImage(String encodedImage) {
        byte[] decodedString = Base64.decode(encodedImage, Base64.DEFAULT);
        Bitmap decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
        Log.d(TAG, "recognizeFaceImage: ");
        faceRecognitionProcessor.detectInImage(decodedByte, 0);
    }

    private void fetchAllUsers() {
//        new Thread(new Runnable() {
//            @Override
//            public void run() {
//
//            }
//        }).start();
        List<User> users = UserUtils.getAllUsers();
        if (users != null) {
            for (int i = 0; i < users.size(); i++) {
                Log.d(TAG, "FirstName: " + users.get(i).firstName);
                faceRecognitionProcessor.registerFace(users.get(i).firstName,
                        ConverterFloatToString.JSONArrayToFloatArray(users.get(i).tempVector));
            }
        }
    }

    public void setPromise(Promise response) {
        mPromise = response;
    }

    public void setRecognitionPromise(Promise response) {
        recognitionPromise = response;
    }
}
