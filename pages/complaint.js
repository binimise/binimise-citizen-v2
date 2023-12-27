import React, { useEffect, useState}  from 'react';
import { Dimensions, FlatList, Image,ScrollView,RefreshControl,BackHandler,StyleSheet,TouchableOpacity} from "react-native";
import { useSelector, useDispatch } from 'react-redux';
import { setData } from "./../redux/action";
import { View, Text, Touch,TextInput } from "./../ui-kit";
import { Color, PAGES } from '../global/util';
import Header from "../components/header";
import { getUserComplaints,updateSaathiWorkDoneImage } from "./../repo/repo";
import { useNavigationState,useIsFocused } from '@react-navigation/native';
import Modal from "./../components/modal";
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/FontAwesome5';
import IconF from 'react-native-vector-icons/FontAwesome';
import IconAnt from 'react-native-vector-icons/AntDesign';
const { width, height } = Dimensions.get('window');  

const months =["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]


export default ({ navigation }) => {

    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    const [complaint, setComplaint] = useState({});
    const [activeComplaints, setActiveComplaints] = useState({});
    const [assignedComplaints, setAssignedCompliants] = useState({});
    const [closedComplaints, setClosedCompliants] = useState({});
    let userInfo = useSelector(state => state.testReducer.userInfo) || {};
    const [refreshing, setRefreshing] = useState(false);
    const [comment, setComment] = useState("");
    const [showDoneModal, setShowDoneModal] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [selectedComplaint,setSelectedComplaint] = useState({})
    const isFocused = useIsFocused();
    const navigationValue = useNavigationState(state => state);
    const routeName = (navigationValue.routeNames[navigationValue.index]);
    
    const loadingInComplaint = show => {
      setDataAction({"loading": {show,message:"loading_com"}});
    }
    const errorModal = message => {
      setDataAction({
        errorModalInfo : {
          showModal : true,
          message,
        }
      });
    }

    useEffect(() => {
      if(routeName === PAGES.COMPLAINT){
        const backAction = () => {
          if(showDoneModal){
            setComment("");
            setShowDoneModal(false)
            return true;
          }
          navigation.navigate(PAGES.HOME);
          return true;
        };
        const backHandler = BackHandler.addEventListener(
          "hardwareBackPress",
          backAction
        );
        return () => backHandler.remove();
      }
    });

    useEffect(() => {
      if(isFocused){
        loadingInComplaint(true);
        // setTimeout(() => {
          getComplaintsList();
        // }, 2000);
      }else{
        loadingInComplaint(false);
      }
      
    }, [isFocused]);

    const onRefresh = React.useCallback(() => {
      setRefreshing(true);
      getComplaintsList();
    }, []);

    const getComplaintsList = async () => {
      try{
        loadingInComplaint(true);
        let complaints = await getUserComplaints(userInfo);
        if(complaints){
          let Active = [],Assigned = [],Closed = [];
          (complaints || []).map((item)=>{
            item.show = true;
            if(item.state == "ACTIVE"){
              Active.push(item)
            }
            if(item.state == "ASSIGNED"){
              Assigned.push(item);
            }
            if(item.state == "CLOSED"){
              Closed.push(item);
            }
          })
          setActiveComplaints(Active);
          setAssignedCompliants(Assigned);
          setClosedCompliants(Closed);
          setComplaint(complaints);
        }
        loadingInComplaint(false);
        setRefreshing(false);
      }catch(e){
        console.log("e",e)
      }
    }

    const updateWorkDone = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      let location = await Location.getLastKnownPositionAsync({enableHighAccuracy: true});
      let obj = { imageUrl, comment, lat: location?.coords?.latitude, long: location?.coords?.longitude, date: new Date().getTime() };
      updateSaathiWorkDoneImage(selectedComplaint.id, obj);
      getComplaintsList();
    }

  const _showDoneModal = () => {

    return (
      <Modal>
        <View pa={8}>
          <Text t={selectedComplaint?.typesOfComplaint ||each.typesOfGarbageDump || "N/A"} />
        </View>

        <View pa={8}>
          <TextInput uc={Color.lightGrayColor} ph="comment" nl={4}
            onChangeText={(name, text) => {
              setComment(text);
            }} name={"comment"} to={10} pb={4} />
        </View>
        <View row c={Color.white} mv={8}>
          <Touch jc mb={5} h={36} w={'48%'} br={4} bw={1} mr={8}
            s={14} c={Color.black} b center t={"close_c"}
            onPress={() => {
              setComment("");
              setShowDoneModal(false);
            }} />
          <Touch jc mb={5} h={36} w={'48%'} br={4} bw={1}
            s={14} c={Color.black} b center t={"submit"}
            onPress={e => {
              if (!comment) {
                errorModal("please_enter_comment");
                return;
              }
              setShowDoneModal(false);
              updateWorkDone()
            }} />
        </View>
      </Modal>
    );
  }


  

    return <View  w={width} h={height} c={"white"}>
    <Header navigation={navigation} headerText={"complaint"} />

    <View style={{display:"flex",flexWrap: 'wrap',flexDirection:"row"}} w={'90%'} mt={"10%"} mh={"6%"}>
      <View ai jc c={"blue"} br={6} w={"30%"} h={100}>
        <Text s={22} b c={"white"} t={activeComplaints.length}/>
        <Text t={"active"} s={14} c={"white"}/>
      </View>
      <View  ai jc c={"red"} br={6}  ml={"4%"} w={"30%"} h={100}>
        <Text  t={assignedComplaints.length} b s={22} c={"white"}/>
        <Text t={"assign"} s={14} c={"white"}/>
      </View>
      <View  ai jc c={"#009900"}  br={6} ml={"4%"} w={"30%"} h={100}>
        <Text  t={closedComplaints.length}  b s={22} c={"white"}/>
        <Text t={"close"}  s={14} c={"white"}/>
      </View>
    </View>

    <View row mt={29} mh={"6%"} mb={20} w={"90%"}>
      <Touch ml={2} boc={'green'}  h={30}  bw={1} w={140}  br={6} jc ai t={"new_complaint"} s={16}
        onPress={()=>{navigation.navigate(PAGES.ADDCOMPLAINT)}}  c={Color.themeColor}
      />
    </View>

    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }>
        {complaint.length > 0 && complaint.map((each,index)=>{
            let modifiedDate=""
                  if(each.created_date){
                  let splitdate= each.created_date?.split("-")
                   modifiedDate= splitdate[2]+" "+months[parseInt(splitdate[1])]+" "+splitdate[0]
                  }
                  return(
                     each.show?
                     <Touch mh={"6%"} key={index + "s"} mt={"2%"}  h={40} br={2} bw={2} w={"90%"} boc={"#CCCCCC"} 
                        bc={"#fbfbfb"} onPress={() =>{
                          let obj = JSON.parse(JSON.stringify(complaint));
                          obj[index].show = !obj[index].show;
                          setComplaint(obj);
                        }}
                      >
                        <View row mt={6} ml={10}>
                          <Text s={14}  b lh={18}   t={each.typesOfComplaint ||each.typesOfGarbageDump || "N/A"} />
                          <Icon size={18} 
                            style={{position:"absolute",right:8}}
                            name={"angle-down"}
                            color={"green"} /> 
                        </View>
                    </Touch>:
                    <View key={index} br={4} bw={2}  bc={"#CCCCCC"}  mt={"2%"} mh={"5%"} w={"90%"} style={{display:"flex",flexWrap: 'wrap'}}>
                      <Touch  h={30}   onPress={() =>{
                        let obj = JSON.parse(JSON.stringify(complaint));
                        obj[index].show = !obj[index].show;
                        setComplaint(obj);
                      }}>
                        <View row mt={6} ml={10}>
                         <Text s={14} b lh={18} t={each.typesOfComplaint ||each.typesOfGarbageDump || "N/A"}/>
                         <IconAnt 
                            size={18}
                            color={"red"}
                            name={"closecircle"}
                            style={{position:"absolute",right:"10%"}}
                            onPress={()=>{setSelectedComplaint(each);setShowDoneModal(true);}}
                          />
                          <Icon size={18}
                            style={{position:"absolute",right:"3%"}}
                            name={"angle-up"}
                            color={"green"}
                          /> 
                        </View>
                      </Touch>
                      {each.message?
                    <View ml={10}  mt={8} row w={"90%"}>
                       
                        <Text s={14} le={4}  c={"black"} t={each.message}/>
                    </View>:null}

                    {each.assigneeName?
                    <View ml={10}  mt={8} row w={"90%"}> 
                    <IconAnt size={20}
                           name={"user"}
                           style={{right:"8%"}}/> 
                        <Text s={16}  c={"black"} t={each?.assigneeName?each.assigneeName:"N/A"}/>
                        <Text s={16} le={4} c={"black"} t={" "}/>
                        <Text s={16} le={4} c={"black"} t={each?.assigneePhoneNumber?each.assigneePhoneNumber:""}/>
                        
                    </View>:null}
                    {each.address?
                    <View ml={14}  mt={8} row w={"90%"}>
                        <IconF size={20}
                           name={"map-marker"}
                           style={{right:"8%"}}/> 
                        <Text s={16} c={"black"} t={each.address}/>
                    </View>:null}
                    {each.photo_url?
                    <View ml={10}  mt={8} row w={"90%"} h={200}> 
                   
                    <Image
                       source={{ uri:each.photo_url}}
                      style = {{  height:"100%",width:"100%"}}/>
                    </View>:null}
                
                   
                    <View h={40} ai row w={"100%"}
                      c={each.state === "ACTIVE"?"blue":each.state === "ASSIGNED"?"red":"#009900"} 
                      mt={20}>
                       <Text  s={12} c={"white"}  t={"complaint_date"}/>
                        <Text  s={12} c={"white"}  t={":"}/>
                       <Text  s={12} c={"white"} t={modifiedDate}/>
                       <View row a ri={4}>
                        <Text  s={12} c={"white"}  t={"complaint_no"}/>
                        <Text  s={12} c={"white"}  t={":"}/>
                        <Text  s={12} c={"white"}  t={each.c_id || "unavailable"}/>
                       </View>
                    </View>

                </View>
              
               )})}
                   <View h={40}/>
    </ScrollView>
    { showDoneModal ? _showDoneModal() : null }
            
  </View>
          
   
}
