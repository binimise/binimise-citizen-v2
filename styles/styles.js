import { StyleSheet } from 'react-native';
import {Dimensions} from "react-native";
let {width,height } = Dimensions.get("window");

export default StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#ffffff',
    alignItems: 'center',
    // justifyContent: 'center',
    // paddingHorizontal : 16
  },
  textInput: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    fontSize: 24,
    borderBottomColor: '#7f8c8d33',
    borderBottomWidth: 2,
    marginBottom: 10,
    textAlign: 'center',
  },
  sendVerification: {
    padding: 20,
    backgroundColor: '#3498db',
    borderRadius: 10,
    display : "flex",
    flexDirection : "row",
    justifyContent : "center"
  },
  sendCode: {
    padding: 20,
    backgroundColor: '#9b59b6',
    borderRadius: 10,
  },
  buttonText: {
    textAlign: 'center',
    color: '#ffffff',
  },
  bottomView: {
    width: '100%',
    height: "30%",
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', 
    bottom: 0, 
    borderTopLeftRadius:50,
    borderTopRightRadius:50
  },
  bookingbottomView:{
    width: '100%',
    height: "46%",
    backgroundColor: '#e5e5e5',
    position: 'absolute', 
    bottom: 0, 
    borderTopLeftRadius:50,
    borderTopRightRadius:50,
    overflow: 'hidden'
  },
   _homePaginationStyle :{
    position: "relative",
    bottom: 0,
    padding: 0,
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
    paddingVertical: 10
   },
   homeImageStyle :{
    borderRadius: 6, 
    width: '90%', 
    marginTop: "6%",
    marginHorizontal:"5%"
   
   },
   homeStaffimageStyle:{
     borderRadius: 6, 
     width: width*(0.9), 
     marginTop: "6%",
     marginHorizontal:width*(0.05)
   },
   homeBoxDotStyle: {
     width: 20,
     height: 4,
     borderRadius: 4,
     marginHorizontal: 0,
     padding: 0,
     marginRight: 8,
     backgroundColor: "rgba(128, 128, 128, 0.92)"
   },
   homeMainCardView: {
     height: 90,
     width:"33%",
     alignItems: 'center',
     justifyContent: 'center',
     backgroundColor: "white",
     borderRadius: 15,
     shadowColor: "green",
     shadowOffset: {width: 0, height: 0},
     shadowOpacity: 1,
     shadowRadius: 8,
     elevation: 8,
   },
   edContainer : {
      flex: 1,
      alignItems: "center",
      backgroundColor : "white"
   },
   mapView: {
    width: '100%',
    height: "90%",
    backgroundColor: '#F0F0F0',
    position: 'absolute', 
    bottom: 0, 
    borderTopLeftRadius:10,
    borderTopRightRadius:10,
    overflow: 'hidden'
  },
  radioCircle: {
    marginTop: 4,
    height: 20,
    width: 20,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#808080',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRb: {
    width: 10,
    height: 10,
    borderRadius: 50,
    backgroundColor: '#808080',
  },
  feedBackView : {
    width:"100%",
    backgroundColor: "white",
    borderRadius: 15,
    shadowColor: "green",
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
    padding : 10
  },
  hiistoryView : {
    width:"92%",
    marginHorizontal : "4%",
    backgroundColor: "white",
    borderRadius: 15,
    shadowColor: "green",
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
    padding : 10
  }
  
});