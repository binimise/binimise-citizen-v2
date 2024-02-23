import React from 'react';
import { Image } from 'react-native';
import { Marker } from 'react-native-maps';
import { View } from '../ui-kit';

const CarPin = ({ coord, id, name, phoneNumber,handlePressCallout,index }) => {

  return (
    <Marker
      key = {id+phoneNumber}
      tracksViewChanges = {false}
      coordinate = {coord}
      title = {name}
      description = {phoneNumber}
      onPress = {handlePressCallout}
      image={[0,1,2].includes(index)?
        require("./../assets/toilet.png"):require("./../assets/toilet-b.png")
      }
      width = {10}
      
    />
      
  )
    


  
};

// Use React.memo to memoize the CarPin component
const MemoizedCarPin = React.memo(CarPin);

export default MemoizedCarPin;
