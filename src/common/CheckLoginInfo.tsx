import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Actions } from "../reducers/actionns";
import { AppState } from "../reducers/store";
import { GoogleProfile } from "../type/GoogleOAuth";
const matchOwnerID = process.env.REACT_APP_ALLOW_GOOGLE_ID;

const CheckLoginInfo: React.FC = (()=>{
  const dispatch = useDispatch();
  const loginInfo = useSelector((state: AppState) => { return state.state.loginInfo });
  useEffect(() => {
    if(loginInfo === null) {
      // LocalStorageからログイン情報を抽出する
      const googleProfileStr: string | null = localStorage.getItem("googleProfile");
      if(googleProfileStr) {
        const googleProfile: GoogleProfile = JSON.parse(googleProfileStr);
        dispatch(Actions.updateLoginInfo(googleProfile));
        const isPrivate = googleProfile.googleId === matchOwnerID;
        dispatch(Actions.switchIsShowPrivate(isPrivate));
      }
    }
  }, []);
  return null;
});

export default CheckLoginInfo;