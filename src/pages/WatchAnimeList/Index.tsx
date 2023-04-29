import React, { useEffect, useState } from "react";
import { Button, CircularProgress, Grid, makeStyles } from '@material-ui/core';
import Header from "../../common/Header";
import FilterWatchYear from "./FilterWatchYear";
import { GetAnimeReview } from "../../data/getAnimeReview";
import { AnimeReview, Rank } from "../../data/AnimeReview";
import ShowAnimeReview from "./ShowAnimeReview";
import FilterRate from "./FilterRate";
import GoogleLogin from 'react-google-login';
import { GoogleOAuth, GoogleProfile } from "../../type/GoogleOAuth";
import { useLocation } from "react-router-dom";

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
  {id: 12, rank: -4, name:"未評価",   color: '#ffffff'},
];

const WatchAnimeList: React.FC = (()=>{
  const location = useLocation();
  // デフォルト表示年月
  const defaultYear = '2022';
  const [watchYear, setWatchYear] = useState<string>(defaultYear);
  const [watchSeason, setWatchSeason] = useState<string>('');
  const [highRate, setHighRate] = useState<number>(100);
  const [lowRate, setLowRate] = useState<number>(75);
  const [animeReviewList, setAnimeReviewList] = useState<AnimeReview[]>([]);
  const [loading, switchLoading] = useState(false);
  const [isPrivateMode, switchPrivateMode] = useState(false);
  // ログイン情報
  const [loginInfo, setLoginInfo] = useState<GoogleOAuth|null>(null);
  const [googleProfile, setGoogleProfile] = useState<GoogleProfile|null>(null);
  // 全件取得中か
  const [getAllFlag, setGetAllFlag] = useState<boolean>(false);
  const [params, setParams] = useState<URLSearchParams|undefined>(undefined);
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
    // 評価を定める
    reviewList = reviewList.map((review: AnimeReview)=>{
      const setRate = Number(review.rate? review.rate: -4);
      return {
        ...review,
        rate: setRate,
        rank: setRank(setRate)
      }
    })
    // 評価順に並び替える
    reviewList = reviewList.sort((a: AnimeReview, b: AnimeReview)=>{
      if(a.rate > b.rate) {
        return -1;
      }
      if(a.rate < b.rate) {
        return 1;
      }
      return 0;
    })
    // 0点以下を切り捨てる
    // PrivateModeでは全てを表示する
    if(!isPrivateMode) {
      reviewList = reviewList.filter((review: AnimeReview)=>{
        return review.rate > 0 || review.rate === -4;
      })
    }
    // 標準偏差を求める
    // 1点以上のアニメの数を求める
    const targetAnimeList = reviewList.filter((x)=>{ return x.rate > 0 });
    const targetAnimeNum = targetAnimeList.length;
    // 平均点を求める
    const average = targetAnimeList.reduce((a, x) => { return a + x.rate }, 0)/targetAnimeNum;
    // 偏差を求める
    const deviationList = targetAnimeList.map((x)=>{ return Math.pow(x.rate - average, 2) });
    // 標準偏差
    const standardDeviation = Math.sqrt( deviationList.reduce((a, x) => { return a + x }, 0)/targetAnimeNum );
    // 偏差値を求める
    reviewList.map((x)=>{
      if(x.rate > 0) {
        x.deviation = (x.rate - average)/standardDeviation*10+50;
        x.deviation = Math.round(x.deviation*100)/100;
      }
    });
    return reviewList;
  }

  const getWatchDate = async (year: string = watchYear, season: string = watchSeason) => {
    const path = `${year}年${season}`;
    switchLoading(true);
    const reviewList: AnimeReview[] = await getAnimeReview.getWatchDate(path);
    setAnimeReviewList(formatReviewData(reviewList));
    switchLoading(false);
    setGetAllFlag(false);
  }

  const getRate = async (high: number, low: number) => {
    switchLoading(true);
    const reviewList: AnimeReview[] = await getAnimeReview.getWatchRate(high, low);
    setAnimeReviewList(formatReviewData(reviewList));
    switchLoading(false);
    setGetAllFlag(false);
  }

  const getAll = async () => {
    switchLoading(true);
    const reviewList: AnimeReview[] = await getAnimeReview.getAll();
    setAnimeReviewList(formatReviewData(reviewList));
    switchLoading(false);
    setGetAllFlag(true);
  }

  const getTitile = () => {
    return (
      <>
        <div>ひらたん（<a href="https://twitter.com/hirarira617/">@hirarira617</a>）</div>
        <div>視聴したアニメリスト</div>
      </>
    )
  }

  const responseGoogle = (response: any) => {
    setLoginInfo(response)
    setGoogleProfile(response.profileObj);
    localStorage.setItem('googleProfile', JSON.stringify(response.profileObj));
    const isPrivate = response.profileObj.googleId === matchOwnerID;
    switchPrivateMode(isPrivate);
  }

  const getLoginInfo = () => {
    if(googleProfile === null) {
      return null;
    }
    return (
      <>
        <div><img src={googleProfile.imageUrl} width="32" height="32" /></div>
        <div>あなたは{googleProfile.name}でログインをしています</div>
        <div>{googleProfile.email}</div>
        <div>GoogleID: {googleProfile.googleId}</div>
      </>
    )
  }

  useEffect(() => {
    // LocalStorageからログイン情報を抽出する
    const googleProfileStr: string | null = localStorage.getItem("googleProfile");
    if(googleProfileStr) {
      const googleProfile: GoogleProfile = JSON.parse(googleProfileStr);
      setGoogleProfile(googleProfile);
      const isPrivate = googleProfile.googleId === matchOwnerID;
      switchPrivateMode(isPrivate);
    }
    const tmpParams = new URLSearchParams(location.search);
    const year = tmpParams.get('year');
    const season = tmpParams.get('season');
    if(year !== null && season !== null) {
      setWatchYear(year);
      setWatchSeason(season);
      getWatchDate(year, season);
      console.log("aaaaa");
    }
    else {
      /** 初回アクセス時に名作だけ読み込む */
      getRate(highRate, lowRate);
    }
    /** クエリパラメータを保持しておく */
    setParams(tmpParams);
  }, [])

  return (
    <>
      <Header
        isPrivate={isPrivateMode}
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
          {getLoginInfo()}
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
          <Grid container justify="center" alignItems="center">
            <Grid item xs={8}>
              全てのアニメを取得する
            </Grid>
            <Grid item xs={4}>
              <Button variant="contained" color="default" onClick={getAll}>
                取得する
              </Button>
            </Grid>
          </Grid>
          { isPrivateMode &&
            <Grid container justify="center" alignItems="center">
              <Grid item xs={8}>
                未評価アニメを取得する
              </Grid>
              <Grid item xs={4}>
                <Button variant="contained" color="default" onClick={()=>{
                  getRate(0, -10);
                }}>
                  取得する
                </Button>
              </Grid>
            </Grid>
          }
        </Grid>
        <Grid item xs={12}>
          {loading &&
            <CircularProgress />
          }
          {!loading &&
            <ShowAnimeReview
              reviewList={animeReviewList}
              isPrivateMode={isPrivateMode}
              getAllFlag={getAllFlag}
            />
          }
        </Grid>
      </Grid>
    </>
  )
});

export default WatchAnimeList;
