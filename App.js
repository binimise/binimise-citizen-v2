import React, { useEffect } from 'react';
// import { AsyncStorage } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from "./components/loading";
import ConfirmModal from "./components/confirmModal";
import ErrorModal from "./components/ErrorModal";
import { Provider } from "react-redux";
import store from "./store";
import LanguageChangeModal from "./components/languageChangeModal";
import * as Updates from 'expo-updates';
import Route from "./route";

export default () => {

  const updateOperations = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        // ... notify user of update ...
        Updates.reloadAsync();
      }
    } catch (e) {
      // alert(e);
    }
  }

  useEffect(() => {
    // oneSignalOperations();
    updateOperations();
  }, []);

  return (
    <Provider store={store}>
      <Route />
      <Loading />
      <ConfirmModal />
      <ErrorModal />
      <LanguageChangeModal />
    </Provider>
  );
}