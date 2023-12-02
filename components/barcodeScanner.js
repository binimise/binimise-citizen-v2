import React, { useState, useEffect } from 'react';
import { StyleSheet, Button,Dimensions } from 'react-native';
import { View, Text, Touch } from "./../ui-kit";
import { BarCodeScanner } from 'expo-barcode-scanner';
import Modal from "./modal";
import { Color } from '../global/util';
const width = Math.round(Dimensions.get('window').width);  
const height = Math.round(Dimensions.get('window').height); 

export default props => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    props?.getScannedValue?.(data);
    props?.closeModal?.();
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return(
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
        <Touch bw={1} jc boc={Color.black} c={Color.black} w={'100%'} 
          br={4} h={36} s={16} t={'close'}
          onPress={() => props?.closeModal?.()} 
          style={{position:"absolute",bottom:40}}
        />
    </View>
  )

}

const styles = StyleSheet.create({
  container: {
    width:width,
    height:height,
  },
});