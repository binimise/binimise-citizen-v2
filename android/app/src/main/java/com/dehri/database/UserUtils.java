package com.dehri.database;

import android.content.Context;

import androidx.room.Room;


import com.dehri.ConverterFloatToString;

import java.util.List;
import java.util.Random;

public class UserUtils {
    private static UserDatabase db;

    public static void initDatabase(Context context) {
        db = Room.databaseBuilder(context,
                        UserDatabase.class, "user_info_database")
                .allowMainThreadQueries().build();
    }

    public static List<User> getAllUsers() {
        UserDao userDao = db.userDao();
        return userDao.getAll();
    }

    public static void addUser(String name, float[] tempVector) {

        User user = new User();
        user.firstName = name;
        user.tempVector = ConverterFloatToString.JSONArrayfromFloatArray(tempVector);
        user.uid = new Random().nextInt();
        db.userDao().insertAll(user);
    }
}
