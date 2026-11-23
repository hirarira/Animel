import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Grid, Skeleton, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import Header from "../../common/Header";
import { GetAnimeReview } from "../../data/getAnimeReview";
import { AnimeReview, Rank } from "../../data/AnimeReview";
import AnimeGrid from "./AnimeGrid";
import AnimeCards from "./AnimeCards";
import AnimeDetailDrawer from "./AnimeDetailDrawer";
import FilterBar, { FilterMode } from "./FilterBar";
import { loadThumbnailMap, ThumbnailMap } from "./thumbnail";
import { useLocation } from "react-router-dom";

const styles = {
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
}

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
  {id: 13, rank: -3, name:"視聴断念", color: '#bbbbbb'},
  {id: 14, rank: -4, name:"未評価",   color: '#ffffff'},
];

const WatchAnimeList: React.FC = (()=>{
  const location = useLocation();
  // デフォルト表示年は現在の年（旧: '2024' 固定）
  const defaultYear = String(new Date().getFullYear());
  const [watchYear, setWatchYear] = useState<string>(defaultYear);
  const [watchSeason, setWatchSeason] = useState<string>('');
  const [highRate, setHighRate] = useState<number>(100);
  const [lowRate, setLowRate] = useState<number>(75);
  const [animeReviewList, setAnimeReviewList] = useState<AnimeReview[]>([]);
  const [loading, switchLoading] = useState(false);
  // 全件取得中か
  const [getAllFlag, setGetAllFlag] = useState<boolean>(false);
  // 絞り込みモード（期間 / 評価 / 全件）
  const [mode, setMode] = useState<FilterMode>('rate');
  // タイトル検索（取得済みデータへの絞り込み）
  const [searchText, setSearchText] = useState<string>('');
  // 一覧の表示形式（グリッド / カード）
  const [view, setView] = useState<'grid' | 'cards'>('grid');
  // 詳細ドロワーで表示中のアニメ
  const [selected, setSelected] = useState<AnimeReview | null>(null);
  // 取得エラー
  const [error, setError] = useState<string | null>(null);
  // サムネイル対応表（外部JSONから読み込み）
  const [thumbnails, setThumbnails] = useState<ThumbnailMap>(new Map());
  const getAnimeReview = new GetAnimeReview();

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
    // 0点以下を切り捨てる（未評価の -4 は表示する）
    // ※旧ログイン時のPrivateMode（全件表示）は、ログイン機能撤去に伴い廃止
    reviewList = reviewList.filter((review: AnimeReview)=>{
      return review.rate > 0 || review.rate === -4;
    })
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
    try {
      const reviewList: AnimeReview[] = await getAnimeReview.getWatchDate(path);
      setAnimeReviewList(formatReviewData(reviewList));
      setError(null);
    } catch {
      setError('アニメデータの取得に失敗しました。時間をおいて再試行してください。');
    } finally {
      switchLoading(false);
    }
    setGetAllFlag(false);
  }

  const getRate = async (high: number, low: number) => {
    switchLoading(true);
    try {
      const reviewList: AnimeReview[] = await getAnimeReview.getWatchRate(high, low);
      setAnimeReviewList(formatReviewData(reviewList));
      setError(null);
    } catch {
      setError('アニメデータの取得に失敗しました。時間をおいて再試行してください。');
    } finally {
      switchLoading(false);
    }
    setGetAllFlag(false);
  }

  const getAll = async () => {
    switchLoading(true);
    try {
      const reviewList: AnimeReview[] = await getAnimeReview.getAll();
      setAnimeReviewList(formatReviewData(reviewList));
      setError(null);
    } catch {
      setError('アニメデータの取得に失敗しました。時間をおいて再試行してください。');
    } finally {
      switchLoading(false);
    }
    setGetAllFlag(true);
  }

  const getSearch = async () => {
    const query = searchText.trim();
    if (query.length < 2) {
      setError('検索は2文字以上で入力してください。');
      return;
    }
    switchLoading(true);
    try {
      const reviewList: AnimeReview[] = await getAnimeReview.searchAnime(query);
      setAnimeReviewList(formatReviewData(reviewList));
      setError(null);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : 'アニメデータの取得に失敗しました。時間をおいて再試行してください。');
    } finally {
      switchLoading(false);
    }
    setGetAllFlag(true);
  };

  const handleModeChange = (newMode: FilterMode) => {
    setMode(newMode);
    if (newMode === 'period') {
      getWatchDate();
    } else if (newMode === 'rate') {
      getRate(highRate, lowRate);
    } else if (newMode === 'all') {
      getAll();
    }
    // 'search' は入力待ち（Enter / 検索ボタンで getSearch を実行）
  };

  const handleYearChange = (year: string) => {
    setWatchYear(year);
    getWatchDate(year, watchSeason);
  };

  const handleSeasonChange = (season: string) => {
    setWatchSeason(season);
    getWatchDate(watchYear, season);
  };

  const handleRateRangeChange = (range: [number, number]) => {
    setLowRate(range[0]);
    setHighRate(range[1]);
  };

  const handleRateRangeCommit = (range: [number, number]) => {
    getRate(range[1], range[0]);
  };

  const handleRankSelect = (range: [number, number]) => {
    setMode('rate');
    handleRateRangeChange(range);
    getRate(range[1], range[0]);
  };

  // タイトル検索で絞り込んだ表示用リスト
  // （search モードではサーバー側で絞り込み済みなので、そのまま表示する）
  const displayList = useMemo(() => {
    if (mode === 'search') return animeReviewList;
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return animeReviewList;
    return animeReviewList.filter((review) => review.title.toLowerCase().includes(keyword));
  }, [animeReviewList, searchText, mode]);

  const getTitile = () => {
    return (
      <>
        <div>ひらりん（<a href="https://twitter.com/hirarira617/">@hirarira617</a>）</div>
        <div>視聴したアニメリスト</div>
      </>
    )
  }

  useEffect(() => {
    loadThumbnailMap().then(setThumbnails);
  }, []);

  useEffect(() => {
    const tmpParams = new URLSearchParams(location.search);
    const year = tmpParams.get('year');
    const season = tmpParams.get('season');
    if(year !== null && season !== null) {
      setWatchYear(year);
      setWatchSeason(season);
      setMode('period');
      getWatchDate(year, season);
    }
    else {
      /** 初回アクセス時に名作だけ読み込む */
      getRate(highRate, lowRate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Header />
      <Grid container style={styles.main}>
        <Grid size={2} style={styles.title}>
        </Grid>
        <Grid size={8} style={styles.title}>
          {getTitile()}
        </Grid>
        <Grid size={2} style={styles.title}>
        </Grid>
        <Grid size={12}>
          <FilterBar
            mode={mode}
            onModeChange={handleModeChange}
            watchYear={watchYear}
            watchSeason={watchSeason}
            onYearChange={handleYearChange}
            onSeasonChange={handleSeasonChange}
            rateRange={[lowRate, highRate]}
            onRateRangeChange={handleRateRangeChange}
            onRateRangeCommit={handleRateRangeCommit}
            onRankSelect={handleRankSelect}
            searchText={searchText}
            onSearchTextChange={setSearchText}
            onSearchSubmit={getSearch}
            resultCount={displayList.length}
            totalCount={animeReviewList.length}
          />
        </Grid>

        <Grid size={12}>
          <Stack direction="row" sx={{ justifyContent: 'flex-end', margin: '0 10px 8px' }}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={view}
              onChange={(_, value: 'grid' | 'cards' | null) => {
                if (value) setView(value);
              }}
              aria-label="表示形式"
            >
              <ToggleButton value="grid" aria-label="グリッド表示">
                <ViewListIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="cards" aria-label="カード表示">
                <ViewModuleIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {error && (
            <Alert
              severity="error"
              sx={{ margin: '0 10px 10px', textAlign: 'left' }}
              action={
                <Button color="inherit" size="small" onClick={() => { if (mode === 'search') { getSearch(); } else { handleModeChange(mode); } }}>
                  再試行
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          {view === 'grid' && (
            <AnimeGrid
              reviewList={displayList}
              getAllFlag={getAllFlag}
              loading={loading}
              onSelect={setSelected}
              thumbnails={thumbnails}
            />
          )}
          {view === 'cards' && loading && (
            <Stack spacing={2} sx={{ margin: '0 10px' }}>
              <Skeleton variant="rounded" height={120} />
              <Skeleton variant="rounded" height={120} />
              <Skeleton variant="rounded" height={120} />
            </Stack>
          )}
          {view === 'cards' && !loading && (
            <AnimeCards reviewList={displayList} onSelect={setSelected} thumbnails={thumbnails} />
          )}
        </Grid>
      </Grid>
      <AnimeDetailDrawer review={selected} onClose={() => setSelected(null)} thumbnails={thumbnails} />
    </>
  )
});

export default WatchAnimeList;
