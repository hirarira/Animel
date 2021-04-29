import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../common/Header";
import { Actions } from "../../reducers/actionns";
import { AppState } from "../../reducers/store";

const ShowMinogashiAnimeTop: React.FC = (()=>{
  const dispatch = useDispatch();
  const loginInfo = useSelector((state: AppState) => { return state.state.loginInfo });

  useEffect(() => {
    console.log(loginInfo);
    dispatch(Actions.updateTestValue(20));
  }, []);

  return (
    <>
      <Header
        isPrivate={true}
      />
      test
    </>
  )
});

export default ShowMinogashiAnimeTop;
