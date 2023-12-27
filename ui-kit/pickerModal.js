import React, { useReducer, useState,useEffect } from 'react';
import { FlatList, StyleSheet,ScrollView,TouchableOpacity,Dimensions } from 'react-native';
import { Color } from '../global/util';
import Modal from "react-native-modal";
import View from "./view";
import TextInput from "./textInput";
import Touch from "./touch";
import Text from "./text";
import Seperator from "./seperator";
import Icon from 'react-native-vector-icons/AntDesign';
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
let { height ,width} = Dimensions.get('window');

export default props => {
    let {height_in,items,selectedKey,selectedValue,selectedPicker,isClosedModal,isFromAddRquest,sType} = props;
    const [searchText,setSearchText] = useState("");
    const [arrayList,setArrayList] = useState(props?.items||[]);
    let originalData = props?.items || [];
    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));


    const getDataFromList = (field,value) =>{
      setSearchText(value);
      let textSearch = value.toString().toLowerCase();
      let searchResult = [];
      searchResult = customSearch(originalData, textSearch);
      setArrayList(searchResult);
    }

    const showErrorModalMsg = (message, title = "message") => {
        setDataAction({ 
            errorModalInfo : {
                showModal : true, title, message
            }
        })
    };
  
    const customSearch = ( temp, search) => {
      if (undefined === search || search === "") return temp;
      return temp.filter((searchdata) => {
        return Object.values(searchdata).join(" ").toLowerCase().includes(search);
      });
    }
  
    const onRemoveSearchText = () =>{
      setSearchText("");
      setArrayList(originalData);
    }

    const showSearchBar = () =>{
      return(
          <View br={4} bc={Color.lightGrayColor}  ai row bw={1} pt={4} pb={4} w={"90%"} mt={10} h={40} mh={"5%"} mb={8}>
              <TextInput ml nl={1} pl={5} ph={"enter_your_text"}  h={"100%"}
                  onChangeText={getDataFromList} 
                  value={searchText}
              />
              {searchText?.length>0 &&
                <Icon 
                  style={{position:"absolute",right:10}}
                  size={20} 
                  name={"close"}
                  color={Color.red}
                  onPress={onRemoveSearchText}
              />}
          </View>
      )
    }
    const handleSubmitClick = () =>{
      let message = sType!=null&&sType=="checkpoint"?"please_select_chk_type":"select_your_ward";
      console.log("s",selectedValue);
      if(!selectedValue){
        return showErrorModalMsg(message);
      }
      isClosedModal();
    }

    return (
        <View a c={Color.backgroundModalColor} jc ai zi={999} to={0} le={0} h={height} w={width}>
          
        <View w={width - 24} br={8} c={Color.white} jc pa={16} h={height_in?height_in:"90%"}>
          {/* <Text t={"select_your_type"} center s={20} /> */}
          {showSearchBar()}
          <View w={"90%"} bw={0.5} mh={"5%"} bc={"black"} mb={"4%"}/>
          <ScrollView>
            {arrayList.map((each,index)=>{
              return (
                <View key={index} mb={4}>
                  <Touch h={40} w={"90%"} mh={"5%"} row key={index} bc={"#F0F8FF"} 
                    ai br={16} 
                    onPress={() => {selectedPicker(selectedKey,isFromAddRquest?each.device_id:each.name)}}
                  >
                    <View style={styles.radioCircle}>
                      {isFromAddRquest?
                        each.device_id === selectedValue&& <View style={styles.selectedRb} />:
                        each.name===selectedValue&& <View style={styles.selectedRb} />
                      }
                    </View>
                      <Text center ml={2} s={18} t={each.name} />
                  </Touch>
                  <View h={1} bw={0.5} bc={"#CCCCCC"} mh={"5%"} w={"90%"}/>
                </View>
            )})}
            
          </ScrollView>
          <View w={"90%"} bw={0.5} mh={"5%"} bc={"black"}/>
            <View row jc>
              <Touch h={40} w={"40%"} jc ai t={"close_c"} mb={4} boc={"#F0F0F0"} bc={"red"}
                mt={2} mr={10} bw={2} br={16} onPress={() =>{
                  selectedPicker(selectedKey,"");
                  isClosedModal()}}/>
              <Touch h={40} w={"40%"} jc ai t={"submit"} mb={4} boc={"#F0F0F0"} bc={"green"}
                mt={2} bw={2} onPress={() =>handleSubmitClick()} br={16}/>
            </View>
        </View>
    </View>
    );
}
const styles = StyleSheet.create({
    bottomView: {
     width: '100%',
     height: "85%",
     backgroundColor: '#F0F0F0',
     position: 'absolute', 
       bottom: 0, 
       borderTopLeftRadius:50,
       borderTopRightRadius:50,
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
        pickerContainer: {
         width: "100%",
         alignSelf: 'center',
         backgroundColor:"white"
    },cardStyle :{
        marginVertical:"4%",
        backgroundColor : "white",
        padding : "4%"
        
    },
   
 
 });

// required props - name, itemList, closeSearchModal, selectedItem, show