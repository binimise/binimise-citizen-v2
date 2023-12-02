import React from 'react';
import { View, Text } from 'react-native';

const CustomMarker = ({ text }) => {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: 5,
          borderRadius: 5,
        }}
      >
        <Text style={{ color: 'white' }}>{text}</Text>
      </View>
    </View>
  );
};

export default CustomMarker;
