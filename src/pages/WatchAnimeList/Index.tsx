import React, { useEffect, useState } from "react";
import { CircularProgress, Grid, makeStyles } from '@material-ui/core';
import Header from "../../common/Header";
import FilterWatchYear from "./FilterWatchYear";
import { GetAnimeReview } from "../../data/getAnimeReview";
import { AnimeReview, Rank } from "../../data/AnimeReview";
import ShowAnimeReview from "./ShowAnimeReview";
import FilterRate from "./FilterRate";
import GoogleLogin from 'react-google-login';
import { GoogleOAuth, GoogleProfile } from "../../type/GoogleOAuth";
import { useDispatch, useSelector } from "react-redux";
import { Actions } from "../../reducers/actionns";
import { AppState } from "../../reducers/store";
import ShowLoginInfo from "../../common/ShowLoginInfo";
import CheckLoginInfo from "../../common/CheckLoginInfo";

export const showMinogashiAnimeURL = 'https://pollux.hirarira.net/showMinogashiAnime/';

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
  },
  inputSection: {
    width: 'calc(100% - 20px)',
    boxShadow: '0 10px 10px 0 rgba(0, 0, 0, 0.5)',
    padding: '10px',
    margin: '10px'
  },
}));

export const rankList: Rank[] = [
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
  {id: 11, rank: -1, name:"評価不能", color: '#bbbbbb'},
  {id: 12, rank: -2, name:"詰み",     color: '#ffffff'},
  {id: 12, rank: -3, name:"視聴断念", color: '#bbbbbb'},
];

const WatchAnimeList: React.FC = (()=>{
  const dispatch = useDispatch();
  const isShowPrivate = useSelector((state: AppState) => state.state.isShowPrivate );
  const [watchYear, setWatchYear] = useState<string>('2021');
  const [watchSeason, setWatchSeason] = useState<string>('');
  const [highRate, setHighRate] = useState<number>(100);
  const [lowRate, setLowRate] = useState<number>(75);
  const [animeReviewList, setAnimeReviewList] = useState<AnimeReview[]>([]);
  const [loading, switchLoading] = useState(false);
  const [GoogleOAuth, setGoogleOAuth] = useState<GoogleOAuth|null>(null);
  const classes = useStyles();
  const getAnimeReview = new GetAnimeReview();
  const googleClientID: string = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";
  const matchOwnerID = process.env.REACT_APP_ALLOW_GOOGLE_ID;

  const setRank = (rank: number) => {
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
    // PrivateModeでは全てを表示する
    if(!isShowPrivate) {
      reviewList = reviewList.filter((review: AnimeReview)=>{
        return review.rate > 0;
      })
    }
    return reviewList;
  }

  const getWatchDate = async () => {
    const path = `${watchYear}年${watchSeason}`;
    switchLoading(true);
    const reviewList: AnimeReview[] = await getAnimeReview.getWatchDate(path);
    setAnimeReviewList(formatReviewData(reviewList));
    switchLoading(false);
  }

  const getRate = async () => {
    switchLoading(true);
    const reviewList: AnimeReview[] = await getAnimeReview.getWatchRate(highRate, lowRate);
    setAnimeReviewList(formatReviewData(reviewList));
    switchLoading(false);
  }

  const getTitile = () => {
    return (
      <>
        <div>ひらたん（<a href="https://twitter.com/hirarira617/">@hirarira617</a>）</div>
        <div>視聴したアニメリスト</div>
      </>
    )
  }

  /** Gooleのログイン機能を使用した際に呼ばれる関数 */
  const responseGoogle = (response: any) => {
    setGoogleOAuth(response);
    dispatch(Actions.updateLoginInfo(response.profileObj));
    localStorage.setItem('googleProfile', JSON.stringify(response.profileObj));
    const isPrivate = response.profileObj.googleId === matchOwnerID;
    dispatch(Actions.switchIsShowPrivate(isPrivate));
  }

  /** 初回アクセス時に名作だけ読み込む */
  useEffect(() => {
    (async ()=>{
      getRate();
    })()
  }, []);

  return (
    <>
      <CheckLoginInfo/>
      <Header
        isPrivate={isShowPrivate}
      />
      <Grid container className={classes.main}>
        <Grid item xs={2} className={classes.title}>
        </Grid>
        <Grid item xs={8} className={classes.title}>
          {getTitile()}
        </Grid>
        <Grid item xs={2} className={classes.title}>
          <div>
            管理用Login
          </div>
          <div>
            <GoogleLogin
              clientId={googleClientID}
              buttonText="Login"
              onSuccess={responseGoogle}
              onFailure={responseGoogle}
              cookiePolicy={'single_host_origin'}
            />
          </div>
        </Grid>
        <Grid item xs={12}>
          <ShowLoginInfo />
        </Grid>
        <Grid item xs={12} className={classes.inputSection}>
          <FilterWatchYear
            watchYear={watchYear}
            watchSeason={watchSeason}
            setWatchYear={setWatchYear}
            setWatchSeason={setWatchSeason}
            getWatchDate={getWatchDate}
          />
          <FilterRate
            lowRate={lowRate}
            highRate={highRate}
            setLowRate={setLowRate}
            setHighRate={setHighRate}
            getRate={getRate}
          />
        </Grid>
        <Grid item xs={12}>
          {loading &&
            <CircularProgress />
          }
          {!loading &&
            <ShowAnimeReview
              reviewList={animeReviewList}
              isPrivateMode={isShowPrivate}
            />
          }
        </Grid>
      </Grid>
    </>
  )
});

export default WatchAnimeList;
