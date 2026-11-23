import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Box,
  Button,
  CircularProgress,
  IconButton,
  LinearProgress,
  Paper,
  Popover,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickerDay, PickerDayProps } from '@mui/x-date-pickers/PickerDay';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ja';
import Header from '../../common/Header';
import { useAuth } from '../../auth/AuthContext';
import { DayAnimeItem } from '../../data/AnimeDay';
import { GetAnimeDay } from '../../data/getAnimeDay';
import { GetAnimeStory } from '../../data/getAnimeStory';
import {
  animeDayLabelOf,
  animeDayRangeMs,
  copyText,
  currentAnimeDayLabel,
  formatDayLabel,
  shiftDayLabel,
} from '../../data/animeDayUtils';
import DayAnimeCard from './DayAnimeCard';
import ManageNav from './ManageNav';

/**
 * 今日ビュー（日にち単位の管理画面）。
 * 日の境界は 05:00 JST（SMA の anyAnime と同じ convention）。
 * 読み取りは公開、視聴済みの切替は Google サインイン（Bearer 認証）が必要。
 */
const Today: React.FC = () => {
  const { auth, isSignedIn, expireSession } = useAuth();
  const [label, setLabel] = useState<string>(() => currentAnimeDayLabel());
  const [items, setItems] = useState<DayAnimeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [calAnchor, setCalAnchor] = useState<HTMLElement | null>(null);
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());

  const dayApi = useMemo(() => new GetAnimeDay(), []);
  const storyApi = useMemo(() => new GetAnimeStory(), []);

  const load = useCallback(
    async (target: string) => {
      setLoading(true);
      try {
        const { start, end } = animeDayRangeMs(target);
        const result = await dayApi.getAnimeAnyDay(start, end);
        const sorted = [...result].sort((a, b) => a.stTime - b.stTime);
        setItems(sorted);
        setLoadError(null);
      } catch {
        setLoadError('アニメ情報の取得に失敗しました。時間をおいて再試行してください。');
      } finally {
        setLoading(false);
      }
    },
    [dayApi]
  );

  useEffect(() => {
    load(label);
  }, [load, label]);

  // カレンダーのドット表示用に、表示中の月にある放送日を集める
  const loadMonthDots = useCallback(
    async (month: Dayjs) => {
      try {
        const first = month.startOf('month').format('YYYY-MM-DD');
        const last = month.endOf('month').format('YYYY-MM-DD');
        const start = animeDayRangeMs(first).start;
        const end = animeDayRangeMs(last).end;
        const result = await dayApi.getAnimeAnyDay(start, end);
        setHighlighted(new Set(result.map((i) => animeDayLabelOf(i.stTime))));
      } catch {
        // ドットは補助表示なので失敗しても黙る
      }
    },
    [dayApi]
  );

  useEffect(() => {
    if (calAnchor) {
      loadMonthDots(dayjs(label));
    }
  }, [calAnchor, label, loadMonthDots]);

  const handleUnauthorized = useCallback(() => {
    expireSession();
    setToast('認証の有効期限が切れました。再度サインインしてから操作してください。');
  }, [expireSession]);

  const handleSaveWatched = useCallback(
    async (item: DayAnimeItem, minogashi: number) => {
      if (!auth) throw new Error('not signed in');
      await storyApi.setAnimeStory(auth.token, {
        tid: item.tid,
        count: item.count,
        minogashi,
        comment: item.comment ?? '',
      });
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, minogashi } : i)));
    },
    [storyApi, auth]
  );

  // note のタグは作品タイトルそのまま（SNS 用ハッシュタグとは別物）。
  // 投稿時に1つずつ貼れるよう、コピー用は改行区切りにする。
  const bulkTitles = useMemo(() => {
    const seen = new Set<number>();
    const titles: string[] = [];
    for (const item of items) {
      if (!seen.has(item.tid)) {
        seen.add(item.tid);
        titles.push(item.title);
      }
    }
    return titles;
  }, [items]);

  const watchedCount = items.filter((i) => i.minogashi === 1).length;
  const isToday = label === currentAnimeDayLabel();

  const CalendarDay = useCallback(
    (props: PickerDayProps) => {
      const dayLabel = props.day.format('YYYY-MM-DD');
      const hasBroadcast = !props.outsideCurrentMonth && highlighted.has(dayLabel);
      return (
        <Badge variant="dot" color="secondary" invisible={!hasBroadcast}>
          <PickerDay {...props} />
        </Badge>
      );
    },
    [highlighted]
  );

  return (
    <>
      <Header />
      <Box sx={{ margin: '10px', textAlign: 'left', maxWidth: 960, marginX: 'auto', paddingX: 1 }}>
        <ManageNav />

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', marginBottom: 1.5, flexWrap: 'wrap' }}>
          <Tooltip title="前日">
            <IconButton onClick={() => setLabel((l) => shiftDayLabel(l, -1))} aria-label="前日">
              <ChevronLeftIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            {formatDayLabel(label)}
          </Typography>
          {isToday && (
            <Typography variant="caption" sx={{ backgroundColor: 'secondary.main', color: 'secondary.contrastText', borderRadius: 999, padding: '2px 10px', fontWeight: 700 }}>
              今日
            </Typography>
          )}
          <Tooltip title="翌日">
            <IconButton onClick={() => setLabel((l) => shiftDayLabel(l, 1))} aria-label="翌日">
              <ChevronRightIcon />
            </IconButton>
          </Tooltip>
          <Box sx={{ flexGrow: 1 }} />
          {!isToday && (
            <Button size="small" variant="text" onClick={() => setLabel(currentAnimeDayLabel())}>
              今日へ
            </Button>
          )}
          <Button
            size="small"
            variant="outlined"
            startIcon={<CalendarMonthIcon />}
            onClick={(e) => setCalAnchor(e.currentTarget)}
            sx={{ borderRadius: 999 }}
          >
            カレンダー
          </Button>
          <Popover
            open={Boolean(calAnchor)}
            anchorEl={calAnchor}
            onClose={() => setCalAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
              <DateCalendar
                value={dayjs(label)}
                onChange={(value: Dayjs | null) => {
                  if (value) {
                    setLabel(value.format('YYYY-MM-DD'));
                    setCalAnchor(null);
                  }
                }}
                onMonthChange={(month: Dayjs) => loadMonthDots(month)}
                slots={{ day: CalendarDay }}
                showDaysOutsideCurrentMonth
                fixedWeekNumber={6}
              />
            </LocalizationProvider>
          </Popover>
        </Stack>

        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4, padding: '12px 16px', marginBottom: 2 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', marginBottom: 0.75 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              視聴進捗
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {watchedCount} / {items.length} 話
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Typography variant="caption" color="text.secondary">
              日の区切りは朝5時（深夜帯は前日分）
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={items.length ? (watchedCount / items.length) * 100 : 0}
            sx={{ height: 8, borderRadius: 999 }}
          />
          {bulkTitles.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', marginTop: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                note投稿用・この日のタイトル
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, wordBreak: 'break-all', flexGrow: 1, minWidth: 200 }}>
                {bulkTitles.join(' / ')}
              </Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<ContentCopyIcon />}
                onClick={async () => {
                  const ok = await copyText(bulkTitles.join('\n'));
                  setToast(ok ? 'タイトルをまとめてコピーしました。' : 'コピーに失敗しました。');
                }}
                sx={{ borderRadius: 999 }}
              >
                まとめてコピー
              </Button>
            </Stack>
          )}
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
              <Button color="inherit" size="small" onClick={() => load(label)}>
                再試行
              </Button>
            }
          >
            {loadError}
          </Alert>
        )}

        {!loading && !loadError && items.length === 0 && (
          <Paper elevation={0} sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 4, padding: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">この日の放送はありません。</Typography>
          </Paper>
        )}

        <Stack spacing={1.5}>
          {items.map((item) => (
            <DayAnimeCard
              key={item.id}
              item={item}
              canEdit={isSignedIn}
              onSaveWatched={handleSaveWatched}
              onUnauthorized={handleUnauthorized}
              onError={setToast}
              notify={setToast}
            />
          ))}
        </Stack>

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

export default Today;
