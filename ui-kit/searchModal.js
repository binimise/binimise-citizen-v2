import React, { useReducer, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Color } from '../global/util';
import Modal from "react-native-modal";
import View from "./view";
import TextInput from "./textInput";
import Touch from "./touch";
import Text from "./text";
import Seperator from "./seperator";

export default props => {

    const [searchText, setSearchText] = useState("");

    return (
        <Modal isVisible={props.show} style={{ marginVertical : '10%' }}>
            <View fl={1} c={'#fff'} pl={16} pr={16} pt={16}>
                <View bc={'#000'} bw={StyleSheet.hairlineWidth} h={48} jc>
                    <TextInput ph="eg. purnea" name={'search'} value={searchText} pl={8}
                        onChangeText={(name, searchText) => {
                            setSearchText(searchText);
                        }}/>
                </View>
                <FlatList
                    data={props.itemList.filter(item => item.name.toLowerCase().includes(searchText && searchText.toLowerCase()))}
                    renderItem={({ item, index }) => (
                        <Touch key={index} h={36}
                        onPress={() => {
                            props.closeSearchModal(props.name);
                            props.selectedItem(props.name, item);
                        }}>
                            <Text t={item.name} />
                            <Seperator />
                        </Touch>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                />
                <Touch g bc={Color.themeColor} w={'100%'} mb={16} br={4}
                    onPress={() => props.closeSearchModal(props.name)} s={16} c={"#fff"} t={'CLOSE'}/>
            </View>
        </Modal>
    );
}

// required props - name, itemList, closeSearchModal, selectedItem, show