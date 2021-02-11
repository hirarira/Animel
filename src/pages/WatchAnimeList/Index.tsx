import React, { useState } from "react";
import { Grid, makeStyles } from '@material-ui/core';
import Header from "../../common/Header";
import FilterWatchYear from "./FilterWatchYear";
import { GetAnimeReview } from "../../data/getAnimeReview";
import { AnimeReview } from "../../data/AnimeReview";

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
  const [watchYear, setWatchYear] = useState<string>('2020');
  const [watchSeason, setWatchSeason] = useState<string>('');
  const [highRate, setHighRate] = useState<number>(100);
  const [lowRate, setLowRate] = useState<number>(0);
  const [animeReviewList, setAnimeReviewList] = useState<AnimeReview[]>([])
  const classes = useStyles();
  const getAnimeReview = new GetAnimeReview();

  const getWatchDate = async () => {
    const path = `${watchYear}年${watchSeason}`;
    const reviewList: AnimeReview[] = await getAnimeReview.getWatchDate(path);
    setAnimeReviewList(reviewList);
  }

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
            getWatchDate={getWatchDate}
          />
        </Grid>
      </Grid>
    </>
  )
});

export default WatchAnimeList;
