import React, { useEffect,useState } from "react";
import { Dimensions } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { setData } from "./../redux/action";
import { View,Text,PickerModal,Touch,TextInput } from "../ui-kit";
import { Color, PAGES,getCurrentDateFmt } from "./../global/util";
import Header from "../components/header";
import { getAllVehicles,addFuelQuantity } from "../repo/repo";
let { height, width } = Dimensions.get("window");

export default ({ navigation }) => {

    const [vehicles, setVehicles] = useState([]);
    const [selectedKey,setSelectedKey] = useState("");
    const [selectedValue,setSelectedValue] = useState("");
    const [device_id,setDeviceId] = useState("");
    const [selectedVehicle,setSelectedVehicle] = useState({})
    const [isPickerShow,setIsPickerShow] = useState(false);
    const [fuelQuantity,setFuelQuantity] = useState("")
    const dispatch = useDispatch();
    const setDataAction = (arg) => dispatch(setData(arg));
    let {userInfo} = useSelector(state => state.testReducer) || {};
    

    toggleLoadingInAddQuant = show => {
        setDataAction({"loading": {show}});
    }

    useEffect(() => {
        getVehiclesList(); 
    }, []);

    const getVehiclesList = async () => {
        let vehicleList = await getAllVehicles();
        vehicleList.length>0&&vehicleList.forEach((eachitem)=>{
            eachitem.name = eachitem.vehicle_name;
        })
        setVehicles(vehicleList);
     
    }

    isClosedModal= ()=>{
    setIsPickerShow(false);
    }
   
    selectedPickerData = (key,data)=>{
        setSelectedValue(data);
        let selected_vehicle = vehicles.length>0&&
                                vehicles.find((each_veh)=>each_veh.device_id == data);
        setSelectedVehicle(selected_vehicle);
    }

    const showErrorModal = (message, title = "message") => {
        setDataAction({ 
            errorModalInfo : {
                showModal : true, title, message
            }
        })
    };

    const addFuelRequest = async () => {
        
        try {    
                if(!selectedVehicle?.device_id){
                    return showErrorModal("please_select_vehicle");
                }
                toggleLoadingInAddQuant(true);
                let fuel_req_obj ={};
                fuel_req_obj.device_id = selectedVehicle?.device_id || "";
                fuel_req_obj.vehicle_id = selectedVehicle?.vehicle_id || "";
                fuel_req_obj.vehicle_name = selectedVehicle?.vehicle_name || "";
                fuel_req_obj.fuelQuantity = fuelQuantity?parseInt(fuelQuantity) : 0;
                fuel_req_obj.saathi_id = userInfo.authUid;
                fuel_req_obj.saathi_name = userInfo.name;
                fuel_req_obj.createdTime = new Date();
                fuel_req_obj.date = getCurrentDateFmt();
                fuel_req_obj.isApproved = false;
                
                await addFuelQuantity(fuel_req_obj);
        } catch(err){}
            toggleLoadingInAddQuant(false);
            setFuelQuantity("");
            setSelectedVehicle({});
            showErrorModal("fuel_detail_added_successfully");
            navigation.navigate(PAGES.FUELMANAGEMENT);
    }

    return(
        <View w={width} h={height} c={"#F0F0F0"}>
            <Header navigation={navigation} headerText={"add_request"}/>
            <View h={1} bw={0.5} bc={"#CCCCCC"}/>

            <View c={"white"} w={"90%"} mh={"5%"} mt={20} style={{padding:10}}>
                <Text t={"click_below_v"} b/>
                <Touch br={4} s={16} mv={10}
                    ai jc bc={"#FFFFFF"} bw={1}
                    onPress={()=> {
                    setSelectedKey("device_id");
                    setSelectedValue(device_id);
                    setIsPickerShow(true)}}  
                    t={selectedVehicle?.name ||"select_your_vehicle"}
                />
                <Text t={"fuel_quantity"} b mt ={30}/>
                <TextInput ml nl={1} ph={"en_fuel_quantity"} pl={10} h={40} bc={'#FFFFFF'}
                    onChangeText={(field, value)=>setFuelQuantity(value)} 
                    name={fuelQuantity} w={'100%'} bbw= {2}  k={"numeric"}
                    bbc={'#F0F0F0'} mb={5} value={fuelQuantity}
                   
                />
                <Touch 
                    ai jc h={48} br={4} onPress={addFuelRequest} t={"submit"} mt ={30}
                    s={16} c={Color.themeFontColor} bc={Color.themeColor} b mv={16}
                />
        
    
            </View>
            {isPickerShow&&vehicles.length>0?
                <PickerModal 
                    items={vehicles} 
                    selectedKey ={selectedKey} 
                    selectedValue={selectedValue} 
                    selectedPicker={selectedPickerData}
                    isClosedModal={isClosedModal} 
                    isFromAddRquest = {true}
                />:null}
        </View>

    ) 
                    

                  
            
      
}