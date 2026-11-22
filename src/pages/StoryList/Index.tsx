import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import Header from '../../common/Header';
import { useAuth } from '../../auth/AuthContext';
import { AnimeStoryList } from '../../data/AnimeStory';
import { GetAnimeStory, UnauthorizedError } from '../../data/getAnimeStory';
import EpisodeRow from './EpisodeRow';

interface Notice {
  severity: 'success' | 'error' | 'info';
  text: string;
}

/**
 * 既読管理ページ（SMA の showAnimeStoryList.html の Animel 移植パイロット）。
 * 読み取りは公開。編集は Google サインイン（Bearer 認証）が必要。
 * 移行期間中は従来の SMA ページと並行運用する。
 */
const StoryList: React.FC = () => {
  const { tid } = useParams<{ tid: string }>();
  const navigate = useNavigate();
  const { auth, isSignedIn, expireSession } = useAuth();
  const [data, setData] = useState<AnimeStoryList | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [fetching, setFetching] = useState(false);
  // 再読み込み時に EpisodeRow のローカル状態を最新化するための世代番号
  const [listVersion, setListVersion] = useState(0);

  const api = React.useMemo(() => new GetAnimeStory(), []);

  const load = useCallback(async () => {
    if (!tid) return;
    setLoading(true);
    try {
      const result = await api.getStoryList(tid);
      if (!result || !result.about) {
        setData(null);
        setLoadError('該当するアニメがありません。');
      } else {
        setData(result);
        setLoadError(null);
        setListVersion((v) => v + 1);
      }
    } catch {
      setLoadError('話数リストの取得に失敗しました。時間をおいて再試行してください。');
    } finally {
      setLoading(false);
    }
  }, [api, tid]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUnauthorized = useCallback(() => {
    expireSession();
    setNotice({
      severity: 'error',
      text: '認証の有効期限が切れました。再度サインインしてから操作してください。',
    });
  }, [expireSession]);

  const handleSave = useCallback(
    async (count: number, minogashi: number, comment: string) => {
      if (!auth || !tid) throw new Error('not signed in');
      await api.setAnimeStory(auth.idToken, {
        tid: Number(tid),
        count,
        minogashi,
        comment,
      });
      setNotice({ severity: 'success', text: `第${count}話を保存しました。` });
    },
    [api, auth, tid]
  );

  const handleFetchNoRegist = async () => {
    if (!auth || !tid) return;
    setFetching(true);
    try {
      const result = await api.getNoRegistStories(auth.idToken, tid);
      setNotice({
        severity: result.status === 'ok' ? 'success' : 'error',
        text: result.comment ? `未登録の話数を取得しました：${result.comment}` : '未登録の話数を取得しました。',
      });
      await load();
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        handleUnauthorized();
      } else {
        setNotice({ severity: 'error', text: '未登録の話数の取得に失敗しました。時間をおいて再試行してください。' });
      }
    } finally {
      setFetching(false);
    }
  };

  const about = data?.about;
  const shoboiURL = tid ? `https://cal.syoboi.jp/tid/${tid}` : '';

  return (
    <>
      <Header />
      <Box sx={{ margin: '10px', textAlign: 'left' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ marginBottom: 1 }}>
          一覧に戻る
        </Button>

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

        {about && (
          <>
            <Typography variant="h5" component="h1" sx={{ margin: '8px 0' }}>
              {about.title}：各話リスト
            </Typography>

            <TableContainer component={Paper} sx={{ margin: '10px 0' }}>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ whiteSpace: 'nowrap', width: 140 }}>放送局</TableCell>
                    <TableCell>{about.chName}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>ハッシュタグ</TableCell>
                    <TableCell>{about.hashTag}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>公式サイト</TableCell>
                    <TableCell>
                      {about.publicURL ? (
                        <Link href={about.publicURL} target="_blank" rel="noreferrer">
                          公式サイト
                        </Link>
                      ) : (
                        '（未登録）'
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>しょぼいカレンダー</TableCell>
                    <TableCell>
                      <Link href={shoboiURL} target="_blank" rel="noreferrer">
                        しょぼいカレンダーで開く
                      </Link>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {!isSignedIn && (
              <Alert severity="info" sx={{ margin: '10px 0' }}>
                編集するには、右上のボタンから Google サインインが必要です。現在は読み取り専用で表示しています。
              </Alert>
            )}

            {notice && (
              <Alert severity={notice.severity} sx={{ margin: '10px 0' }} onClose={() => setNotice(null)}>
                {notice.text}
              </Alert>
            )}

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', margin: '14px 0 8px' }}>
              <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                各話リスト
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<CloudDownloadIcon />}
                onClick={handleFetchNoRegist}
                disabled={!isSignedIn || fetching}
              >
                {fetching ? '取得中…' : '未登録の話数を取得'}
              </Button>
            </Stack>

            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>回</TableCell>
                    <TableCell>サブタイ</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>放送日</TableCell>
                    <TableCell>コメント</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>見逃しチェック</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.story.map((story) => (
                    <EpisodeRow
                      key={`${story.tid}-${story.count}-v${listVersion}`}
                      story={story}
                      canEdit={isSignedIn}
                      onSave={handleSave}
                      onUnauthorized={handleUnauthorized}
                      onError={(message) => setNotice({ severity: 'error', text: message })}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="body2" color="text.secondary" sx={{ margin: '12px 0' }}>
              従来の管理ページでも同じデータを編集できます：
              <Link
                href={`https://pollux.hirarira.net/showMinogashiAnime/showAnimeStoryList.html?tid=${tid}`}
                target="_blank"
                rel="noreferrer"
                sx={{ marginLeft: 1 }}
              >
                SMA の既読管理ページ
              </Link>
            </Typography>
          </>
        )}
      </Box>
    </>
  );
};

export default StoryList;
