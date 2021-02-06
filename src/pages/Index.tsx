import React from "react";
import { Grid } from '@material-ui/core';
import Header from "../common/Header";

const Index: React.FC = (()=>{
  return (
    <Grid container>
      <Grid item xs={12}>
        <Header />
      </Grid>
      <Grid item xs={12}>
        視聴したアニメリスト
      </Grid>
    </Grid>
  )
});

export default Index;
