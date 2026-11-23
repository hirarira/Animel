import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import Header from '../../common/Header';
import { useAuth } from '../../auth/AuthContext';
import { DayAnimeItem } from '../../data/AnimeDay';
import { GetAnimeDay } from '../../data/getAnimeDay';
import { GetAnimeStory } from '../../data/getAnimeStory';
import { animeDayLabelOf, animeDayRangeMs, currentAnimeDayLabel, formatDayLabel, shiftDayLabel } from '../../data/animeDayUtils';
import DayAnimeCard from './DayAnimeCard';
import ManageNav from './ManageNav';

/**
 * 過去1週間の見逃し一覧（SMA の minogashi.html 相当）。
 * 未視聴の話を日付ごとに並べ、その場で視聴済みにできる。
 * 進捗は「過去1週間に放送された全話数」を母数にして計算する。
 */
const Week: React.FC = () => {
  const { auth, isSignedIn, expireSession } = useAuth();
  const [items, setItems] = useState<DayAnimeItem[]>([]);
  const [totalAired, setTotalAired] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const dayApi = useMemo(() => new GetAnimeDay(), []);
  const storyApi = useMemo(() => new GetAnimeStory(), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // 進捗の母数：過去1週間（アニメ日ベースで7日前の05:00〜現在）に放送された全話数
      const weekStartLabel = shiftDayLabel(currentAnimeDayLabel(), -7);
      const weekStart = animeDayRangeMs(weekStartLabel).start;
      const [missed, all] = await Promise.all([
        dayApi.getWeekMinogashiAnime(),
        dayApi.getAnimeAnyDay(weekStart, Date.now()),
      ]);
      setItems([...missed].sort((a, b) => a.stTime - b.stTime));
      setTotalAired(all.length);
      setLoadError(null);
    } catch {
      setLoadError('見逃し一覧の取得に失敗しました。時間をおいて再試行してください。');
    } finally {
      setLoading(false);
    }
  }, [dayApi]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUnauthorized = useCallback(() => {
    expireSession();
    setToast('認証の有効期限が切れました。再度サインインしてから操作してください。');
  }, [expireSession]);

  const handleSaveWatched = useCallback(
    async (item: DayAnimeItem, minogashi: number) => {
      if (!auth) throw new Error('not signed in');
      await storyApi.setAnimeStory(auth.idToken, {
        tid: item.tid,
        count: item.count,
        minogashi,
        comment: item.comment ?? '',
      });
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, minogashi } : i)));
    },
    [storyApi, auth]
  );

  // 日付（アニメ日）ごとにグループ化し、新しい日付から並べる
  const groups = useMemo(() => {
    const map = new Map<string, DayAnimeItem[]>();
    for (const item of items) {
      const key = animeDayLabelOf(item.stTime);
      const arr = map.get(key) ?? [];
      arr.push(item);
      map.set(key, arr);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [items]);

  const remaining = items.filter((i) => i.minogashi === 0).length;
  const watchedInRange = Math.max(totalAired - remaining, 0);

  return (
    <>
      <Header />
      <Box sx={{ margin: '10px', textAlign: 'left', maxWidth: 960, marginX: 'auto', paddingX: 1 }}>
        <ManageNav />

        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, marginBottom: 0.5 }}>
          過去1週間の見逃し
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 2 }}>
          過去1週間に放送されてまだ見ていない話の一覧です。その場で視聴済みにでき、カードからは情報更新ページにも行けます。
        </Typography>

        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4, padding: '12px 16px', marginBottom: 2 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', marginBottom: 0.75 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              週の消化進捗
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalAired > 0 ? `残り ${remaining} 件 / 全 ${totalAired} 話` : `残り ${remaining} 件`}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={totalAired > 0 ? (watchedInRange / totalAired) * 100 : 0}
            sx={{ height: 8, borderRadius: 999 }}
          />
        </Paper>

        {!isSignedIn && (
          <Alert severity="info" sx={{ marginBottom: 2 }}>
            編集するには、右上のボタンから Google サインインが必要です。現在は読み取り専用で表示しています。
          </Alert>
        )}

        {loading && (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', margin: '16px 0' }}>
            <CircularProgress size={20} />
            <Typography variant="body2">読み込み中…</Typography>
          </Stack>
        )}

        {loadError && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={load}>
                再試行
              </Button>
            }
          >
            {loadError}
          </Alert>
        )}

        {!loading && !loadError && items.length === 0 && (
          <Paper elevation={0} sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 4, padding: 4, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 700, marginBottom: 0.5 }}>過去1週間の見逃しはありません</Typography>
            <Typography variant="body2" color="text.secondary">
              放送済みの話はすべて視聴済みです。
            </Typography>
          </Paper>
        )}

        {groups.map(([dayLabel, dayItems]) => (
          <Box key={dayLabel} sx={{ marginBottom: 3 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', marginBottom: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {formatDayLabel(dayLabel)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dayItems.filter((i) => i.minogashi === 0).length} 件の見逃し
              </Typography>
            </Stack>
            <Stack spacing={1.5}>
              {dayItems.map((item) => (
                <DayAnimeCard
                  key={item.id}
                  item={item}
                  canEdit={isSignedIn}
                  missedAccent
                  onSaveWatched={handleSaveWatched}
                  onUnauthorized={handleUnauthorized}
                  onError={setToast}
                  notify={setToast}
                />
              ))}
            </Stack>
          </Box>
        ))}

        <Snackbar
          open={Boolean(toast)}
          autoHideDuration={3500}
          onClose={() => setToast(null)}
          message={toast ?? ''}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Box>
    </>
  );
};

export default Week;
