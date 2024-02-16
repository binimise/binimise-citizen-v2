import React, { useState, useEffect } from 'react';
import { Dimensions,BackHandler,Image } from "react-native";
import { Color,resizeImage } from "./../global/util";
import { setData } from "./../redux/action";
import { View,Touch } from "./../ui-kit";
import { useSelector, useDispatch } from "react-redux";
import { Camera, CameraType } from 'expo-camera';
import firebase from "./../repo/firebase";
import Icon from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
const { width, height } = Dimensions.get('window');

const touchStyles = {
    position : "absolute",
    justifyContent : "center",
    alignItems : "center",
    width : 60,
    height : 60,
    borderRadius : 32,
    backgroundColor : Color.white
}

export default (props) => {

    const { handleCloseCam, onLoadOp, imageRef } = props;
    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    const [type, setType] = useState(CameraType.back);
    const [camera, setCamera] = useState({});
    const storageRef = firebase().firebase.storage();
    const [showPreview, setShowPreview] = useState(false);
    const [url, setUrl] = useState("");

    useEffect(() => {

        const backAction = () => {
            if (showPreview) {
                setShowPreview(false);
                return true;
            }
            closeCamera();
            return true;
        };
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();

    });

    const setIsLoading = type => {
        setDataAction({ loading: { show: type } });
    }

    const closeCamera = () => {
        handleCloseCam();
        setUrl("");
    }

    const errorModal = message => {
        setDataAction({
            loading: { show: false },
            errorModalInfo: { showModal: true, message },
        });
        closeCamera();
    }

    const saveImage = async () => {
        try {
          setIsLoading(true);
          const reference = storageRef.ref(imageRef);
          await reference.putFile(url);
          let downloadUrl = await reference.getDownloadURL();
          setIsLoading(false);
          onLoadOp(downloadUrl);
          setShowPreview(false);
        } catch(e) {
          errorModal("oops_there_is_an_error_whie_storing_image");
        }
    }

    const takePicture = async () => {
        if (!camera) return;
        try {
            const options = {
                quality: 0.1,
                base64: true
            };
            const photo = await camera.takePictureAsync(options);
            setUrl(photo.uri);
            setShowPreview(true);
        } catch (e) {
            console.log("e", e)
            errorModal("Oops!! there is an error while capturing image");
        }
    }

    if (showPreview) {
        return (
            <View h={"100%"} w={"100%"}>
                <View h={'15%'} w={"100%"}>
                    <Touch style = {touchStyles} to={20} le={20} onPress={() => closeCamera()}>
                        <Icon
                            size={36}
                            name={"arrowleft"}
                        />
                    </Touch>
                </View>
                <Image 
                  source={{ uri: url }} 
                  resizeMode="cover" 
                  style ={{width:"100%",height:"70%"}} 
                />

                <Touch style = {touchStyles} bo={10} le={20} onPress={() =>setShowPreview(false)}>
                    <MaterialIcons
                        size={36}
                        name={"camera-retake-outline"}
                    />
                </Touch>

                <Touch style = {touchStyles} bo={10} ri={20} onPress = {saveImage}>
                    <Icon
                        size={36}
                        name={"checksquareo"}
                    />
                </Touch>

            </View>
        );
    }

    return (
        <Camera
            style={{ height, width }}
            type={type}
            ref={(ref) => setCamera(ref)}
        >
            <Touch style = {touchStyles} to={20} le={20} onPress={() =>closeCamera()}>
                <Icon
                    size={36}
                    name={"arrowleft"}
                />
            </Touch>
            

            <Touch style = {touchStyles} bo={10} le={20}
                onPress={() => {
                    type == CameraType.front ?
                        setType(CameraType.back) :
                        setType(CameraType.front)
                }}
            >
                <MaterialIcons
                    size={36}
                    name={"camera-flip-outline"}
                />
            </Touch>

            <Touch  bo={10} h={60} w={60}
                a jc ai br={32} bc={Color.white}
                style={{ alignSelf: "center" }}
                onPress={() => takePicture()}
            >
                <Icon
                    size={36}
                    name={"camera"}
                />
            </Touch>
        </Camera>

    )

}
