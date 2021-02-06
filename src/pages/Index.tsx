import React from "react";
import { Grid } from '@material-ui/core';

const Index: React.FC = (()=>{
  return (
    <Grid container>
      <Grid item xs={12}>
        menu
      </Grid>
      <Grid item xs={12}>
        視聴したアニメリスト
      </Grid>
    </Grid>
  )
});

export default Index;
