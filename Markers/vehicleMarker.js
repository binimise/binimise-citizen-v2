import React from 'react';
import { Linking } from 'react-native';
import { Marker } from 'react-native-maps';
import { View } from '../ui-kit';

const CarPin = ({ coord, id, name, phoneNumber, type, count }) => {

  const dialCall = (touchedNum) => {
    let phoneNumber = '';

    if (Platform.OS === 'android') {
      phoneNumber = 'tel:$' + touchedNum;
    }
    else {
      phoneNumber = 'telprompt:$' + touchedNum;
    }

    Linking.openURL(phoneNumber);
  };

  return (<View>
    {count == "final" &&
      <Marker
        key={id}
        tracksViewChanges={false}
        coordinate={coord}
        title={name}
        description={phoneNumber}
        onCalloutPress={() => dialCall(phoneNumber)}
        icon={{ uri: 'http://maps.google.com/mapfiles/kml/paddle/go.png' }}
      />
    }
    {count == "intial" &&
      <Marker
        key={id}
        tracksViewChanges={false}
        coordinate={coord}
        title={name}
        description={phoneNumber}
        icon={type == "vehicle" && require('./../assets/car.png') ||require('./../assets/saathi.png')}
        onCalloutPress={() => dialCall(phoneNumber)}
      />
    }


  </View>

  );
};

// Use React.memo to memoize the CarPin component
const MemoizedCarPin = React.memo(CarPin);

export default MemoizedCarPin;
