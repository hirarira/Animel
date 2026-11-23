import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  LinearProgress,
  Link,
  MenuItem,
  Paper,
  Select,
  Slider,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PeopleIcon from '@mui/icons-material/People';
import LanguageIcon from '@mui/icons-material/Language';
import Header from '../../common/Header';
import { useAuth } from '../../auth/AuthContext';
import { AnimeAbout, AnimeStoryList } from '../../data/AnimeStory';
import { GetAnimeStory, UnauthorizedError } from '../../data/getAnimeStory';
import { AnimeReviewDetail, VIEW_STATUSES, ViewStatus, viewStatusLabel } from '../../data/AnimeDay';
import { GetAnimeDay } from '../../data/getAnimeDay';
import { rankList } from '../WatchAnimeList/Index';
import EpisodeRow from './EpisodeRow';

/** 評価点からランク名を引く（rankList の定義に合わせる） */
function rankNameFor(rate: number): string {
  if (rate > 0) {
    const hit = rankList
      .filter((r) => r.rank > 0 && rate >= r.rank)
      .sort((a, b) => b.rank - a.rank)[0];
    return hit ? hit.name : '問題作';
  }
  const hit = rankList.find((r) => r.rank === rate && r.id !== 10);
  return hit ? hit.name : '未評価';
}

const SEASONS = ['冬', '春', '夏', '秋'] as const;

/** watchDate（例: "2026年秋"）を年と季節に分解する。解釈できない場合は null */
function parseWatchDate(watchDate: string): { year: number; season: string } | null {
  const m = watchDate.match(/(\d{4})年(冬|春|夏|秋)/);
  if (!m) return null;
  return { year: Number(m[1]), season: m[2] };
}

interface ReviewFormProps {
  tid: number;
  review: AnimeReviewDetail | null;
  canEdit: boolean;
  onSave: (options: { rate: number; comment: string; watchDate: string }) => Promise<void>;
}

/** クール設定・評価・コメントの編集フォーム（setAnimeReview） */
const ReviewForm: React.FC<ReviewFormProps> = ({ tid, review, canEdit, onSave }) => {
  const originalWatchDate = review?.watchDate ?? '';
  const parsed = parseWatchDate(originalWatchDate);
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(parsed?.year ?? currentYear);
  const [season, setSeason] = useState<string>(parsed?.season ?? '');
  const [rate, setRate] = useState<number>(review?.rate ?? 0);
  const [comment, setComment] = useState<string>(review?.comment ?? '');
  const [saving, setSaving] = useState(false);

  // 季節が選ばれている時だけ watchDate を組み立て直す（解釈できない既存値はそのまま保持）
  const effectiveWatchDate = season ? `${year}年${season}` : originalWatchDate;
  const dirty =
    effectiveWatchDate !== originalWatchDate || rate !== (review?.rate ?? 0) || comment !== (review?.comment ?? '');

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear + 1; y >= 2000; y--) list.push(y);
    return list;
  }, [currentYear]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ rate, comment, watchDate: effectiveWatchDate });
    } catch {
      // エラーメッセージは親側で表示する
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 5, padding: 2.5, marginBottom: 2 }}>
      <Typography variant="h6" component="h2" sx={{ fontWeight: 700, marginBottom: 0.5 }}>
        クール設定・評価・コメント
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 2 }}>
        視聴時期（クール）、評価、作品コメントを編集します。保存すると公開側の一覧にも反映されます。
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ marginBottom: 2 }}>
        <FormControl size="small" sx={{ minWidth: 130 }} disabled={!canEdit || saving}>
          <InputLabel id={`year-label-${tid}`}>視聴時期（年）</InputLabel>
          <Select
            labelId={`year-label-${tid}`}
            label="視聴時期（年）"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <MenuItem key={y} value={y}>
                {y}年
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', marginBottom: 0.5 }}>
            視聴時期（季節）
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={season || null}
            onChange={(_, value) => value && setSeason(value)}
            disabled={!canEdit || saving}
          >
            {SEASONS.map((s) => (
              <ToggleButton key={s} value={s} sx={{ paddingX: 2 }}>
                {s}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
        {!parsed && originalWatchDate && (
          <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
            現在の視聴時期: {originalWatchDate}（季節を選ぶとクール表記に更新されます）
          </Typography>
        )}
      </Stack>

      <Box sx={{ marginBottom: 2 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', marginBottom: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            評価（0–100）
          </Typography>
          <Chip label={rankNameFor(rate)} size="small" color="primary" variant="outlined" />
        </Stack>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Slider
            value={rate}
            min={0}
            max={100}
            step={1}
            disabled={!canEdit || saving}
            onChange={(_, value) => setRate(value as number)}
            sx={{ flexGrow: 1 }}
          />
          <TextField
            type="number"
            size="small"
            value={rate}
            disabled={!canEdit || saving}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!Number.isNaN(v)) setRate(Math.max(0, Math.min(100, v)));
            }}
            slotProps={{ htmlInput: { min: 0, max: 100, step: 1 } }}
            sx={{ width: 90 }}
          />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          0 は未評価です。詰み・視聴断念などの状態は視聴ステータスで管理します。
        </Typography>
      </Box>

      <TextField
        label="コメント"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        multiline
        minRows={3}
        fullWidth
        disabled={!canEdit || saving}
        sx={{ marginBottom: 2 }}
      />

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Button
          variant={dirty ? 'contained' : 'outlined'}
          onClick={handleSave}
          disabled={!canEdit || !dirty || saving}
          sx={{ borderRadius: 999 }}
        >
          {saving ? '保存中…' : 'クール・評価・コメントを保存'}
        </Button>
        {dirty && (
          <Typography variant="caption" color="text.secondary">
            未保存の変更があります
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};

interface StatusFormProps {
  status: ViewStatus;
  canEdit: boolean;
  onSave: (status: ViewStatus) => Promise<void>;
}

/** 視聴ステータスの選択（setAnimeStatus）。選んだ時点で即保存する */
const StatusForm: React.FC<StatusFormProps> = ({ status, canEdit, onSave }) => {
  const [saving, setSaving] = useState(false);

  const handleChange = async (_: React.MouseEvent<HTMLElement>, value: ViewStatus | null) => {
    if (!value || value === status) return;
    setSaving(true);
    try {
      await onSave(value);
    } catch {
      // エラーメッセージは親側で表示する
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 5, padding: 2.5, marginBottom: 2 }}>
      <Typography variant="h6" component="h2" sx={{ fontWeight: 700, marginBottom: 0.5 }}>
        視聴ステータス
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 2 }}>
        この作品の視聴状態です。選ぶとそのまま保存されます。まとめて振り分け直す場合は管理用の「ステータス別一覧」が便利です。
      </Typography>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={status}
        onChange={handleChange}
        disabled={!canEdit || saving}
        sx={{ flexWrap: 'wrap' }}
      >
        {VIEW_STATUSES.map((s) => (
          <ToggleButton key={s.key} value={s.key} sx={{ paddingX: 2 }}>
            {s.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {saving && (
        <Typography variant="caption" color="text.secondary" sx={{ marginLeft: 1 }}>
          保存中…
        </Typography>
      )}
    </Paper>
  );
};

interface AboutFormProps {
  about: AnimeAbout;
  canEdit: boolean;
  onSave: (options: { hashTag: string; characterURL: string; publicURL: string }) => Promise<void>;
}

/** ハッシュタグ・リンクの編集フォーム（setAnimeAbout） */
const AboutForm: React.FC<AboutFormProps> = ({ about, canEdit, onSave }) => {
  const [hashTag, setHashTag] = useState(about.hashTag ?? '');
  const [publicURL, setPublicURL] = useState(about.publicURL ?? '');
  const [characterURL, setCharacterURL] = useState(about.characterURL ?? '');
  const [saving, setSaving] = useState(false);

  const dirty =
    hashTag !== (about.hashTag ?? '') || publicURL !== (about.publicURL ?? '') || characterURL !== (about.characterURL ?? '');

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ hashTag, characterURL, publicURL });
    } catch {
      // エラーメッセージは親側で表示する
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 5, padding: 2.5, marginBottom: 2 }}>
      <Typography variant="h6" component="h2" sx={{ fontWeight: 700, marginBottom: 0.5 }}>
        ハッシュタグ・リンク
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 2 }}>
        note 投稿用のハッシュタグと、公式サイト／キャラクターページの URL を編集します。キャラクターページがない作品は空欄のままで大丈夫です。
      </Typography>
      <Stack spacing={2} sx={{ marginBottom: 2 }}>
        <TextField label="ハッシュタグ" value={hashTag} onChange={(e) => setHashTag(e.target.value)} fullWidth disabled={!canEdit || saving} />
        <TextField label="公式サイト URL" value={publicURL} onChange={(e) => setPublicURL(e.target.value)} fullWidth disabled={!canEdit || saving} />
        <TextField
          label="キャラクターページ URL"
          value={characterURL}
          onChange={(e) => setCharacterURL(e.target.value)}
          fullWidth
          disabled={!canEdit || saving}
        />
      </Stack>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Button
          variant={dirty ? 'contained' : 'outlined'}
          onClick={handleSave}
          disabled={!canEdit || !dirty || saving}
          sx={{ borderRadius: 999 }}
        >
          {saving ? '保存中…' : 'ハッシュタグ・リンクを保存'}
        </Button>
        {dirty && (
          <Typography variant="caption" color="text.secondary">
            未保存の変更があります
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};

/**
 * アニメ情報更新ページ（SMA の showAnimeStoryList.html の移植先）。
 * 話数リストの編集に加え、クール設定・評価・コメント（setAnimeReview）と
 * ハッシュタグ・リンク（setAnimeAbout）の編集、番組情報の取得を1ページにまとめる。
 * 読み取りは公開。編集は Google サインイン（Bearer 認証）が必要。
 */
const StoryList: React.FC = () => {
  const { tid } = useParams<{ tid: string }>();
  const navigate = useNavigate();
  const { auth, isSignedIn, expireSession } = useAuth();
  const [data, setData] = useState<AnimeStoryList | null>(null);
  const [review, setReview] = useState<AnimeReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  // 再読み込み時に EpisodeRow のローカル状態を最新化するための世代番号
  const [listVersion, setListVersion] = useState(0);

  const storyApi = useMemo(() => new GetAnimeStory(), []);
  const dayApi = useMemo(() => new GetAnimeDay(), []);

  const load = useCallback(async () => {
    if (!tid) return;
    setLoading(true);
    try {
      const [storyResult, reviewResult] = await Promise.all([
        storyApi.getStoryList(tid),
        dayApi.getAnimeReview(tid).catch(() => null),
      ]);
      if (!storyResult || !storyResult.about) {
        setData(null);
        setLoadError('該当するアニメがありません。');
      } else {
        setData(storyResult);
        setReview(reviewResult);
        setLoadError(null);
        setListVersion((v) => v + 1);
      }
    } catch {
      setLoadError('アニメ情報の取得に失敗しました。時間をおいて再試行してください。');
    } finally {
      setLoading(false);
    }
  }, [storyApi, dayApi, tid]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUnauthorized = useCallback(() => {
    expireSession();
    setToast('認証の有効期限が切れました。再度サインインしてから操作してください。');
  }, [expireSession]);

  const guardError = useCallback(
    (e: unknown, fallback: string) => {
      if (e instanceof UnauthorizedError) {
        handleUnauthorized();
      } else {
        setToast(fallback);
      }
    },
    [handleUnauthorized]
  );

  const handleSaveStory = useCallback(
    async (count: number, minogashi: number, comment: string) => {
      if (!auth || !tid) throw new Error('not signed in');
      await storyApi.setAnimeStory(auth.idToken, {
        tid: Number(tid),
        count,
        minogashi,
        comment,
      });
      setToast(`第${count}話を保存しました。`);
    },
    [storyApi, auth, tid]
  );

  const handleSaveReview = useCallback(
    async (options: { rate: number; comment: string; watchDate: string }) => {
      if (!auth || !tid) return;
      try {
        await dayApi.setAnimeReview(auth.idToken, { tid: Number(tid), ...options });
        setReview((prev) => (prev ? { ...prev, ...options } : { tid: Number(tid), title: '', chName: '', url: '', hashTag: '', characterURL: '', publicURL: '', ...options }));
        setToast('クール・評価・コメントを保存しました。');
      } catch (e) {
        guardError(e, 'レビューの保存に失敗しました。時間をおいて再試行してください。');
        throw e;
      }
    },
    [dayApi, auth, tid, guardError]
  );

  const handleSaveStatus = useCallback(
    async (status: ViewStatus) => {
      if (!auth || !tid) return;
      try {
        await dayApi.setAnimeStatus(auth.idToken, { tid: Number(tid), status });
        setReview((prev) =>
          prev
            ? { ...prev, status }
            : {
                tid: Number(tid),
                title: '',
                chName: '',
                url: '',
                hashTag: '',
                characterURL: '',
                publicURL: '',
                watchDate: '',
                rate: 0,
                comment: '',
                status,
              }
        );
        setToast(`視聴ステータスを「${viewStatusLabel(status)}」に変更しました。`);
      } catch (e) {
        guardError(e, 'ステータスの保存に失敗しました。時間をおいて再試行してください。');
        throw e;
      }
    },
    [dayApi, auth, tid, guardError]
  );

  const handleSaveAbout = useCallback(
    async (options: { hashTag: string; characterURL: string; publicURL: string }) => {
      if (!auth || !tid) return;
      try {
        await dayApi.setAnimeAbout(auth.idToken, { tid: Number(tid), ...options });
        setData((prev) => (prev ? { ...prev, about: { ...prev.about, ...options } } : prev));
        setToast('ハッシュタグ・リンクを保存しました。');
      } catch (e) {
        guardError(e, 'リンク情報の保存に失敗しました。時間をおいて再試行してください。');
        throw e;
      }
    },
    [dayApi, auth, tid, guardError]
  );

  const handleFetchNoRegist = async () => {
    if (!auth || !tid) return;
    setFetching(true);
    try {
      const result = await storyApi.getNoRegistStories(auth.idToken, tid);
      setToast(result.comment ? `番組情報を取得しました：${result.comment}` : '番組情報を取得しました。');
      await load();
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        handleUnauthorized();
      } else {
        setToast('番組情報の取得に失敗しました。時間をおいて再試行してください。');
      }
    } finally {
      setFetching(false);
    }
  };

  const about = data?.about;
  const shoboiURL = tid ? `https://cal.syoboi.jp/tid/${tid}` : '';

  const progress = useMemo(() => {
    if (!data) return { watched: 0, aired: 0 };
    const nowSec = Date.now() / 1000;
    const airedStories = data.story.filter((s) => s.stTime > 0 && s.stTime <= nowSec);
    return {
      watched: airedStories.filter((s) => s.minogashi === 1).length,
      aired: airedStories.length,
    };
  }, [data]);

  return (
    <>
      <Header />
      <Box sx={{ margin: '10px', textAlign: 'left', maxWidth: 960, marginX: 'auto', paddingX: 1 }}>
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

        {about && data && (
          <>
            {/* 作品ヘッダー（ヒーローカード） */}
            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 5, padding: 2.5, marginBottom: 2 }}>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 700, marginBottom: 1 }}>
                {about.title}
              </Typography>
              <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', marginBottom: 1.5 }}>
                {about.chName && <Chip label={about.chName} size="small" variant="outlined" />}
                {about.hashTag && <Chip label={about.hashTag} size="small" color="secondary" variant="outlined" />}
                {review && review.rate !== 0 && <Chip label={`評価 ${review.rate}（${rankNameFor(review.rate)}）`} size="small" color="primary" variant="outlined" />}
                {review?.watchDate && <Chip label={review.watchDate} size="small" variant="outlined" />}
                {review && <Chip label={viewStatusLabel(review.status)} size="small" color="info" variant="outlined" />}
              </Stack>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', marginBottom: 2 }}>
                {about.characterURL && (
                  <Button variant="outlined" size="small" startIcon={<PeopleIcon />} component="a" href={about.characterURL} target="_blank" rel="noreferrer" sx={{ borderRadius: 999 }}>
                    キャラクター
                  </Button>
                )}
                {about.publicURL && (
                  <Button variant="outlined" size="small" startIcon={<LanguageIcon />} component="a" href={about.publicURL} target="_blank" rel="noreferrer" sx={{ borderRadius: 999 }}>
                    公式サイト
                  </Button>
                )}
                <Button variant="outlined" size="small" startIcon={<OpenInNewIcon />} component="a" href={shoboiURL} target="_blank" rel="noreferrer" sx={{ borderRadius: 999 }}>
                  しょぼいカレンダー
                </Button>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', marginBottom: 0.75 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  視聴進捗（放送済み）
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {progress.watched} / {progress.aired} 話
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress.aired ? (progress.watched / progress.aired) * 100 : 0}
                sx={{ height: 8, borderRadius: 999 }}
              />
            </Paper>

            {!isSignedIn && (
              <Alert severity="info" sx={{ marginBottom: 2 }}>
                編集するには、右上のボタンから Google サインインが必要です。現在は読み取り専用で表示しています。
              </Alert>
            )}

            <StatusForm
              key={`status-${tid}-${listVersion}`}
              status={(review?.status as ViewStatus | undefined) ?? 'watched'}
              canEdit={isSignedIn}
              onSave={handleSaveStatus}
            />
            <ReviewForm key={`review-${tid}-${listVersion}`} tid={Number(tid)} review={review} canEdit={isSignedIn} onSave={handleSaveReview} />
            <AboutForm key={`about-${tid}-${listVersion}`} about={about} canEdit={isSignedIn} onSave={handleSaveAbout} />

            {/* 話数リスト */}
            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 5, padding: 2.5, marginBottom: 2 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', marginBottom: 0.5, flexWrap: 'wrap' }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 700, flexGrow: 1 }}>
                  話数リスト
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CloudDownloadIcon />}
                  onClick={handleFetchNoRegist}
                  disabled={!isSignedIn || fetching}
                  sx={{ borderRadius: 999 }}
                >
                  {fetching ? '取得中…' : '番組情報を取得（未登録の話数）'}
                </Button>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 2 }}>
                しょぼいカレンダーから未登録の話数を取得して追加できます。各話の視聴済み切替とコメント編集もここで行います。
              </Typography>
              <Stack spacing={1.5}>
                {data.story.map((story) => (
                  <EpisodeRow
                    key={`${story.tid}-${story.count}-v${listVersion}`}
                    story={story}
                    canEdit={isSignedIn}
                    onSave={handleSaveStory}
                    onUnauthorized={handleUnauthorized}
                    onError={setToast}
                  />
                ))}
              </Stack>
            </Paper>

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

export default StoryList;
