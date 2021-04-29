import { Grid } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CheckLoginInfo from "../../common/CheckLoginInfo";
import Header from "../../common/Header";
import ShowLoginInfo from "../../common/ShowLoginInfo";

const ShowMinogashiAnimeTop: React.FC = (()=>{
  const dispatch = useDispatch();

  return (
    <>
      <CheckLoginInfo/>
      <Header
        isPrivate={true}
      />
      <Grid container>
        <Grid item xs={12}>
          <ShowLoginInfo />
        </Grid>
      </Grid>
    </>
  )
});

export default ShowMinogashiAnimeTop;
