import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import Header from '../../common/Header';
import ManageNav from './ManageNav';
import { useAuth } from '../../auth/AuthContext';
import { StatusAnimeItem, VIEW_STATUSES, ViewStatus } from '../../data/AnimeDay';
import { GetAnimeDay } from '../../data/getAnimeDay';
import { UnauthorizedError } from '../../data/getAnimeStory';

const SEASON_ORDER: Record<string, number> = { 冬: 0, 春: 1, 夏: 2, 秋: 3 };

/** watchDate（"2026年秋"）を新しい順に並べるための数値キー。解釈できないものは最後尾 */
function watchDateKey(watchDate: string | undefined): number {
  if (!watchDate) return -1;
  const m = watchDate.match(/(\d{4})年(冬|春|夏|秋)/);
  if (!m) return -1;
  return Number(m[1]) * 4 + (SEASON_ORDER[m[2]] ?? 0);
}

function sortItems(items: StatusAnimeItem[]): StatusAnimeItem[] {
  return [...items].sort((a, b) => {
    const byDate = watchDateKey(b.watchDate) - watchDateKey(a.watchDate);
    if (byDate !== 0) return byDate;
    return b.tid - a.tid;
  });
}

/** 1行分が大きくなりすぎないよう、表示は先頭からこの件数まで */
const RENDER_LIMIT = 300;

/**
 * ステータス別一覧ページ。
 * 各ステータスの作品を一覧し、その場でステータスを変更して振り分け直すための画面。
 * 読み取りは公開、変更は Google サインイン（Bearer 認証）が必要。
 */
const ManageStatus: React.FC = () => {
  const navigate = useNavigate();
  const { auth, isSignedIn, expireSession } = useAuth();
  const [lists, setLists] = useState<Partial<Record<ViewStatus, StatusAnimeItem[]>>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<ViewStatus>('watched');
  const [query, setQuery] = useState('');
  const [savingTid, setSavingTid] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const api = useMemo(() => new GetAnimeDay(), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.all(VIEW_STATUSES.map((s) => api.getAnimeByStatus(s.key)));
      const next: Partial<Record<ViewStatus, StatusAnimeItem[]>> = {};
      VIEW_STATUSES.forEach((s, i) => {
        next[s.key] = sortItems(results[i]);
      });
      setLists(next);
      setLoadError(null);
    } catch {
      setLoadError('ステータス別一覧の取得に失敗しました。時間をおいて再試行してください。');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const handleChangeStatus = useCallback(
    async (item: StatusAnimeItem, next: ViewStatus) => {
      if (!auth || next === tab) return;
      setSavingTid(item.tid);
      try {
        await api.setAnimeStatus(auth.token, { tid: item.tid, status: next });
        setLists((prev) => {
          const copy: Partial<Record<ViewStatus, StatusAnimeItem[]>> = { ...prev };
          copy[tab] = (copy[tab] ?? []).filter((a) => a.tid !== item.tid);
          copy[next] = sortItems([...(copy[next] ?? []), { ...item, status: next }]);
          return copy;
        });
        const label = VIEW_STATUSES.find((s) => s.key === next)?.label ?? next;
        setToast(`「${item.title}」を${label}に変更しました。`);
      } catch (e) {
        if (e instanceof UnauthorizedError) {
          expireSession();
          setToast('認証の有効期限が切れました。再度サインインしてから操作してください。');
        } else {
          setToast('ステータスの変更に失敗しました。時間をおいて再試行してください。');
        }
      } finally {
        setSavingTid(null);
      }
    },
    [api, auth, tab, expireSession]
  );

  const currentItems = lists[tab] ?? [];
  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return currentItems;
    return currentItems.filter((a) => a.title.includes(q));
  }, [currentItems, query]);
  const visible = filtered.slice(0, RENDER_LIMIT);

  return (
    <>
      <Header />
      <Box sx={{ margin: '10px', textAlign: 'left', maxWidth: 960, marginX: 'auto', paddingX: 1 }}>
        <ManageNav />
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, marginBottom: 0.5 }}>
          ステータス別一覧
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 2 }}>
          視聴ステータスごとに作品を一覧し、その場で振り分け直すための画面です。視聴済は視聴時期の新しい順に並んでいます。
        </Typography>

        {!isSignedIn && (
          <Alert severity="info" sx={{ marginBottom: 2 }}>
            ステータスの変更には、右上のボタンから Google サインインが必要です。現在は読み取り専用で表示しています。
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
            sx={{ margin: '10px 0' }}
            action={
              <Button color="inherit" size="small" onClick={load}>
                再試行
              </Button>
            }
          >
            {loadError}
          </Alert>
        )}

        {!loading && !loadError && (
          <>
            <Tabs
              value={tab}
              onChange={(_, value) => setTab(value as ViewStatus)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ marginBottom: 2 }}
            >
              {VIEW_STATUSES.map((s) => (
                <Tab key={s.key} value={s.key} label={`${s.label}（${(lists[s.key] ?? []).length}）`} />
              ))}
            </Tabs>

            <TextField
              label="タイトルで絞り込み"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              size="small"
              fullWidth
              sx={{ marginBottom: 2 }}
            />

            <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 1 }}>
              {filtered.length} 件{filtered.length > RENDER_LIMIT ? `（先頭 ${RENDER_LIMIT} 件を表示。絞り込みで探してください）` : ''}
            </Typography>

            <Stack spacing={1}>
              {visible.map((item) => (
                <Paper
                  key={item.tid}
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    flexWrap: 'wrap',
                  }}
                >
                  <Box sx={{ flexGrow: 1, minWidth: 200 }}>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => navigate(`/story/${item.tid}`)}
                    >
                      {item.title}
                    </Typography>
                    <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', marginTop: 0.5 }}>
                      {item.watchDate && <Chip label={item.watchDate} size="small" variant="outlined" />}
                      {typeof item.rate === 'number' && item.rate > 0 && (
                        <Chip label={`評価 ${item.rate}`} size="small" color="primary" variant="outlined" />
                      )}
                      {item.chName && <Chip label={item.chName} size="small" variant="outlined" />}
                    </Stack>
                  </Box>
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <Select
                      value={tab}
                      disabled={!isSignedIn || savingTid === item.tid}
                      onChange={(e) => handleChangeStatus(item, e.target.value as ViewStatus)}
                      aria-label="視聴ステータス"
                    >
                      {VIEW_STATUSES.map((s) => (
                        <MenuItem key={s.key} value={s.key}>
                          {s.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Paper>
              ))}
              {visible.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  該当する作品がありません。
                </Typography>
              )}
            </Stack>
          </>
        )}

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

export default ManageStatus;
