import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Header from "../../common/Header";
import { Actions } from "../../reducers/actionns";

const ShowMinogashiAnimeTop: React.FC = (()=>{
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("test");
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
