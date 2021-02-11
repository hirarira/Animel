import React, { useState } from "react";
import { Button, Grid, InputLabel, makeStyles } from '@material-ui/core';
import Header from "../../common/Header";
import FilterWatchYear from "./FilterWatchYear";

const useStyles = makeStyles((theme) => ({
  main: {
    margin: '10px',
    width: 'calc(100% - 20px)'
  },
  title: {
    fontSize: '20px'
  },
  section: {
    width: '100%'
  }
}));

const WatchAnimeList: React.FC = (()=>{
  const [watchYear, setWatchYear] = useState('2020');
  const [watchSeason, setWatchSeason] = useState('');
  const [highRate, setHighRate] = useState<number>(100);
  const [lowRate, setLowRate] = useState<number>(0);
  const classes = useStyles();

  return (
    <>
      <Header />
      <Grid container className={classes.main}>
        <Grid item xs={12} className={classes.title}>
          視聴したアニメリスト
        </Grid>
        <Grid item xs={12}>
          <FilterWatchYear
            watchYear={watchYear}
            watchSeason={watchSeason}
            setWatchYear={setWatchYear}
            setWatchSeason={setWatchSeason}
          />
        </Grid>
      </Grid>
    </>
  )
});

export default WatchAnimeList;
