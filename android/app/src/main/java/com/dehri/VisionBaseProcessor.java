package com.dehri;

import android.graphics.Bitmap;

import com.google.android.gms.tasks.Task;

public abstract class VisionBaseProcessor<T> {

    public abstract Task<T> detectInImage(Bitmap bitmap, int rotationDegrees);

    public abstract void stop();
}
