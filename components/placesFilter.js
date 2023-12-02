import React, { useState }  from 'react';
import { View, Text, Touch } from "../ui-kit";
import { Color } from '../global/util';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from "./../components/modal";

let filtersArray = [
    { id : "vehicles", name : "vehicles", icon: "bus", type: "fontAwesome"},
    { id : "places", name : "places", icon: "th-large", type: "fontAwesome" },
    { id : "park", name : "park", icon: "tree", type: "fontAwesome" },
    { id : "hospital", name : "hospital", icon: "medkit", type: "fontAwesome" },
    { id : "dumping_point", name : "dumping_point", icon: "trash", type: "fontAwesome" },
    { id : "toilet", name : "toilet", icon: "toilet", type: "materialCommunityIcon" }
  ]

export default props => {
    return <Modal>
        <Text center b s={16} mb={14} t={props.headerText} />
        {
          filtersArray.map(item => (
            <Touch h={48} key={item.id} w={"100%"}
              onPress={props.onPress}
              style={{borderBottomWidth: 1, borderColor: Color.lightGrayColor}}>
              <View row h={48} ai>
                <View w={60} row jc ai>
                    {
                      item.type == "fontAwesome" ? <Icon size={18}
                        name={item.icon}
                        color={Color.themeColor} /> : <IconMaterial size={18}
                        name={item.icon}
                        color={Color.themeColor} />
                    }
                </View>
                <Text s={16} c={Color.themeColor} t={item.name} />
              </View>
            </Touch>
          ))
        }
    </Modal>
}