import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal : 16
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
  notApproved: {
    width: 20,
    height: 20,
    borderRadius: 50,
    backgroundColor: "#FF5733",
  },
  Approved: {
    width: 20,
    height: 20,
    borderRadius: 50,
    backgroundColor: "#4C9A2A",
  },
  rectangle: {
    marginTop: 4,
    height: 20,
    width: 20,
    borderWidth: 2,
    borderColor: '#808080',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRectangle: {
    width: 20,
    height: 20,
    backgroundColor: 'green',
  },
  pickerContainer: {
    width: "90%",
    marginLeft :10,
    borderRadius: 2,
    borderWidth : 2,
    alignSelf: 'center',
    backgroundColor:"white",
  },
  element: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    width :40,
    height : 40,
    borderWidth: 1,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardStyle :{
    marginVertical:"2%",
    backgroundColor : "white",
    padding : "2%"
  },
  mainCardView: {
    height: 120,
    width: 150,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "white",
    borderRadius: 25,
    shadowColor: "green",
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  }, // used in attendance
  dropdown:{
    margin:10
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 16,
    marginLeft:5
  },
  selectedTextStyle: {
    fontSize: 16,
    marginLeft:5
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

