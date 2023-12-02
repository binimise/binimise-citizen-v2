package com.binimisevendor;

import android.annotation.SuppressLint;
import android.graphics.Bitmap;
import android.graphics.Matrix;
import android.graphics.Rect;
import android.util.Log;
import android.util.Pair;

import androidx.annotation.NonNull;

import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.face.Face;
import com.google.mlkit.vision.face.FaceDetection;
import com.google.mlkit.vision.face.FaceDetector;
import com.google.mlkit.vision.face.FaceDetectorOptions;

import org.tensorflow.lite.Interpreter;
import org.tensorflow.lite.support.common.ops.NormalizeOp;
import org.tensorflow.lite.support.image.ImageProcessor;
import org.tensorflow.lite.support.image.TensorImage;
import org.tensorflow.lite.support.image.ops.ResizeOp;

import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class FaceRecognitionProcessor extends VisionBaseProcessor<List<Face>> {

    class Person {
        public String name;
        public float[] faceVector;

        public Person(String name, float[] faceVector) {
            this.name = name;
            this.faceVector = faceVector;
        }
    }

    public interface FaceRecognitionCallback {
        void onFaceRecognised(Face face, float probability, String name);
        void onFaceDetected(Face face, Bitmap faceBitmap, float[] vector);

        void onFailure(String msg);
    }

    public static final String TAG = "FaceRecognitionProcessor";

    // Input image size for our facenet model
    private static final int FACENET_INPUT_IMAGE_SIZE = 112;

    private final FaceDetector detector;
    private final Interpreter faceNetModelInterpreter;
    private final ImageProcessor faceNetImageProcessor;
    private final FaceRecognitionCallback callback;


    List<Person> recognisedFaceList = new ArrayList();

    public FaceRecognitionProcessor(Interpreter faceNetModelInterpreter,
                                    FaceRecognitionCallback callback) {
        this.callback = callback;
        // initialize processors
        this.faceNetModelInterpreter = faceNetModelInterpreter;
        faceNetImageProcessor = new ImageProcessor.Builder()
                .add(new ResizeOp(FACENET_INPUT_IMAGE_SIZE, FACENET_INPUT_IMAGE_SIZE, ResizeOp.ResizeMethod.BILINEAR))
                .add(new NormalizeOp(0f, 255f))
                .build();

        FaceDetectorOptions faceDetectorOptions = new FaceDetectorOptions.Builder()
                .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_ACCURATE)
                .setClassificationMode(FaceDetectorOptions.CLASSIFICATION_MODE_NONE)
                // to ensure we don't count and analyse same person again
                .enableTracking()
                .build();
        detector = FaceDetection.getClient(faceDetectorOptions);
    }

    public Task<List<Face>> detectInImage(Bitmap bitmap, int rotationDegrees) {
        InputImage inputImage = InputImage.fromBitmap(bitmap, rotationDegrees);

        // In order to correctly display the face bounds, the orientation of the analyzed
        // image and that of the viewfinder have to match. Which is why the dimensions of
        // the analyzed image are reversed if its rotation information is 90 or 270.
//        boolean reverseDimens = rotationDegrees == 90 || rotationDegrees == 270;
//        int width=bitmap.getWidth();
//        int height = bitmap.getHeight();
//        if (reverseDimens) {
//            width = bitmap.getHeight();
//            height =  imageProxy.getWidth();
//        } else {
//            width = imageProxy.getWidth();
//            height = imageProxy.getHeight();
//        }
        return detector.process(inputImage)
                .addOnSuccessListener(new OnSuccessListener<List<Face>>() {
                    @SuppressLint("LongLogTag")
                    @Override
                    public void onSuccess(List<Face> faces) {
//                        graphicOverlay.clear();
                        Log.d(TAG, "onSuccess: ");
                        for (Face face : faces) {
//                            FaceGraphic faceGraphic = new FaceGraphic(graphicOverlay, face, false, width, height);
                            Log.d(TAG, "face found, id: " + face.getTrackingId());
//                            if (activity != null) {
//                                activity.setTestImage(cropToBBox(bitmap, face.getBoundingBox(), rotation));
//                            }
                            // now we have a face, so we can use that to analyse age and gender
                            Bitmap faceBitmap = cropToBBox(bitmap, face.getBoundingBox(), rotationDegrees);

                            if (faceBitmap == null) {
                                Log.d(TAG,"GraphicOverlay" + "Face bitmap null");
                                if (callback != null) {
                                    callback.onFailure("Failure");
                                }
                                return;
                            }

                            TensorImage tensorImage = TensorImage.fromBitmap(faceBitmap);
                            ByteBuffer faceNetByteBuffer = faceNetImageProcessor.process(tensorImage).getBuffer();
                            float[][] faceOutputArray = new float[1][192];
                            faceNetModelInterpreter.run(faceNetByteBuffer, faceOutputArray);

//                            Log.d(TAG, "output array: " + Arrays.deepToString(faceOutputArray));

                            if (callback != null) {
                                Log.d(TAG, "callback not null" + recognisedFaceList.isEmpty());
                                callback.onFaceDetected(face, faceBitmap, faceOutputArray[0]);
                                if (!recognisedFaceList.isEmpty()) {
                                    Pair<String, Float> result = findNearestFace(faceOutputArray[0]);
                                    // if distance is within confidence
                                    if (result.second < 1.0f) {
//                                        faceGraphic.name = result.first;
                                        callback.onFaceRecognised(face, result.second, result.first);
                                    }
                                }
                            }

//                            graphicOverlay.add(faceGraphic);
                        }
                    }
                })
                .addOnFailureListener(new OnFailureListener() {
                    @SuppressLint("LongLogTag")
                    @Override
                    public void onFailure(@NonNull Exception e) {
                        // intentionally left empty
                        Log.e(TAG, "onFailure: ",e );
                    }
                });
    }

    // looks for the nearest vector in the dataset (using L2 norm)
    // and returns the pair <name, distance>
    private Pair<String, Float> findNearestFace(float[] vector) {

        Pair<String, Float> ret = null;
        for (Person person : recognisedFaceList) {
            final String name = person.name;
            final float[] knownVector = person.faceVector;

            float distance = 0;
            for (int i = 0; i < vector.length; i++) {
                float diff = vector[i] - knownVector[i];
                distance += diff*diff;
            }
            distance = (float) Math.sqrt(distance);
            if (ret == null || distance < ret.second) {
                ret = new Pair<>(name, distance);
            }
        }

        return ret;

    }

    public void stop() {
        detector.close();
    }

    private Bitmap cropToBBox(Bitmap image, Rect boundingBox, int rotation) {
        int shift = 0;
        if (rotation != 0) {
            Matrix matrix = new Matrix();
            matrix.postRotate(rotation);
            image = Bitmap.createBitmap(image, 0, 0, image.getWidth(), image.getHeight(), matrix, true);
        }
        if (boundingBox.top >= 0 && boundingBox.bottom <= image.getHeight()
                && boundingBox.top + boundingBox.height() <= image.getHeight()
                && boundingBox.left >= 0
                && boundingBox.left + boundingBox.width() <= image.getWidth()) {
            return Bitmap.createBitmap(
                    image,
                    boundingBox.left,
                    boundingBox.top + shift,
                    boundingBox.width(),
                    boundingBox.height()
            );
        } else return null;
    }

    public void registerFace(String input, float[] tempVector) {
        recognisedFaceList.add(new Person(input, tempVector));
    }
}
