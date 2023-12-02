import React, { useEffect } from 'react';
import { StyleSheet, Text, View,BackHandler } from 'react-native';
import WebView from 'react-native-webview';
// import { CustomTabs } from "react-native-custom-tabs";

export default () => {

  //  useEffect(() => {
  //   CustomTabs.openURL('https://iamhere.app/community/deoghar_1624314543470', {
  //     toolbarColor: '#607D8B',
  //     enableUrlBarHiding: true,
  //     showPageTitle: true,
  //     enableDefaultShare: true,
  //     // Specify full animation resource identifier(package:anim/name)
  //     // or only resource name(in case of animation bundled with app).
  //     animations: {
  //       startEnter: 'slide_in_bottom',
  //       startExit: 'slide_out_bottom',
  //       endEnter: 'slide_in_bottom',
  //       endExit: 'slide_out_bottom',
  //     },
  //     // And supports SLIDE and FADE as default animation.
  //     // animations: ANIMATIONS_SLIDE or ANIMATIONS_FADE.
  //     headers: {
  //       'my-custom-header': 'my custom header value'
  //     },
  //     forceCloseOnRedirection: true,
  //   }).catch(err => {
  //     console.error(err)
  //   });
  // })

  return (
    <WebView
      source={{
        uri: 'https://iamhere.app/community/deoghar_1624314543470', //'https://share.iamhere.mobi/ZWNi'
      }}
      style={{ marginTop: 20 }}
    />
  );
}