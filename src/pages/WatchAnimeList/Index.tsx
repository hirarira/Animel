import React, { useState } from "react";
import { Grid, makeStyles } from '@material-ui/core';
import Header from "../../common/Header";
import FilterWatchYear from "./FilterWatchYear";
import { GetAnimeReview } from "../../data/getAnimeReview";
import { AnimeReview, Rank } from "../../data/AnimeReview";
import ShowAnimeReview from "./ShowAnimeReview";

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

  const setRank = (rank: number) => {
    const rankList: Rank[] = [
      {id: 0,  rank: 90, name:"神作",     color: '#b1dfbb'},
      {id: 1,  rank: 80, name:"秀作",     color: '#ffe8a1'},
      {id: 2,  rank: 75, name:"名作",     color: '#9fcdff'},
      {id: 3,  rank: 70, name:"佳作",     color: '#f1b0b7'},
      {id: 4,  rank: 60, name:"良作",     color: '#b1dfbb'},
      {id: 5,  rank: 55, name:"準良作",   color: '#abdde5'},
      {id: 6,  rank: 50, name:"凡作",     color: '#3cb371'},
      {id: 7,  rank: 40, name:"微妙作",   color: '#c0c0c0'},
      {id: 8,  rank: 30, name:"駄作",     color: '#a9a9a9'},
      {id: 9,  rank: 1,  name:"問題作",   color: '#ff7f50'},
      {id: 10, rank: 0,  name:"未評価",   color: '#ffffff'},
      {id: 11, rank: -1, name:"評価不能", color: '#ffffff'},
      {id: 12, rank: -2, name:"詰み",     color: '#ffffff'},
      {id: 12, rank: -3, name:"視聴断念", color: '#ffffff'},
    ];
    for(let i=0; i<rankList.length; i++){
      if(rank >= rankList[i].rank){
        return rankList[i];
      }
    }
    return rankList.slice(-1)[0];
  }

  const formatReviewData = (reviewList: AnimeReview[]): AnimeReview[] => {
    // 評価順に並び替える
    reviewList.sort((a: AnimeReview, b: AnimeReview)=>{
      if(a.rate > b.rate) {
        return -1;
      }
      if(a.rate < b.rate) {
        return 1;
      }
      return 0;
    })
    reviewList = reviewList.map((review: AnimeReview)=>{
      return {
        ...review,
        rank: setRank(Number(review.rate))
      }
    })
    // 0点以下を切り捨てる
    reviewList = reviewList.filter((review: AnimeReview)=>{
      return review.rate > 0;
    })
    return reviewList;
  }

  const getWatchDate = async () => {
    const path = `${watchYear}年${watchSeason}`;
    const reviewList: AnimeReview[] = await getAnimeReview.getWatchDate(path);
    setAnimeReviewList(formatReviewData(reviewList));
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
        <Grid item xs={12}>
          <ShowAnimeReview
            reviewList={animeReviewList}
          />
        </Grid>
      </Grid>
    </>
  )
});

export default WatchAnimeList;
