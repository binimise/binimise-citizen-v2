import React, { useEffect, useState } from 'react';
import { setData } from "./../redux/action";
import { Dimensions, ColorPropType } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { Touch } from "./../ui-kit";
import { Color } from '../global/util';
import NetInfo from '@react-native-community/netinfo';
import { updateAgentStatus } from "./../repo/repo";
let { height, width } = Dimensions.get("window");

export default () => {

  const dispatch = useDispatch();
  const setDataAction = (arg) => dispatch(setData(arg));
  let { userInfo } = useSelector(state => state.testReducer) || {};

  const showModal = message => {
    setDataAction({ errorModalInfo: { showModal: true, message } });
  }

  const toggleDutyOnOff = async () => {
    toggleLoading(true);
    if (!userInfo.isApproved || userInfo.isApproved == "false") {
      toggleLoading(false);
      return showModal("agent_is_not_approved");
    }
    let state = await NetInfo.fetch();
    console.log(state);
    if (!state.isConnected) {
      toggleLoading(false);
      return showModal("you_are_offline");
    }
    updateAgentStatus(userInfo, !userInfo?.status);
    userInfo["status"] = !userInfo?.status;
    setDataAction({ userInfo });
    toggleLoading(false);
  }

  const toggleLoading = show => {
    setDataAction({ "loading": { show } });
  }

  return (
    <Touch bc={userInfo?.status ? Color.themeColor : Color.red} t={userInfo?.status ? 'duty_on_c' : 'duty_off_c'}
      c={Color.white} jc w={80} h={40} ml={8} br={8} onPress={toggleDutyOnOff}/>
  );
}