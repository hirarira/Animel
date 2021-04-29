import React from "react";
import { useSelector } from "react-redux";
import { AppState } from "../reducers/store";

const ShowLoginInfo: React.FC = (() => {
  const loginInfo = useSelector((state: AppState) => state.state.loginInfo );
  if(!loginInfo || loginInfo === null) {
    return null;
  }
  return (
    <>
      <div><img src={loginInfo.imageUrl} width="32" height="32" /></div>
      <div>あなたは{loginInfo.name}でログインをしています</div>
      <div>{loginInfo.email}</div>
      <div>GoogleID: {loginInfo.googleId}</div>
    </>
  )
});

export default ShowLoginInfo;
