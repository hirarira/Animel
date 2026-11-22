import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Chip, IconButton, Paper, Stack, Switch, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PeopleIcon from '@mui/icons-material/People';
import LanguageIcon from '@mui/icons-material/Language';
import { DayAnimeItem } from '../../data/AnimeDay';
import { copyText, formatBroadcastDateTime, formatBroadcastTime } from '../../data/animeDayUtils';
import { UnauthorizedError } from '../../data/getAnimeStory';

interface Props {
  item: DayAnimeItem;
  /** サインイン済みなら視聴済み切替が可能 */
  canEdit: boolean;
  /** 週ビューなど、日付も併記したい場合に true */
  showDate?: boolean;
  /** 見逃しとして柔らかく色付けする（週ビュー用） */
  missedAccent?: boolean;
  /** 視聴済みの保存処理（親が API 呼び出しと認証を担当）。失敗時は例外を投げる */
  onSaveWatched: (item: DayAnimeItem, minogashi: number) => Promise<void>;
  onUnauthorized: () => void;
  onError: (message: string) => void;
  /** トースト表示用（ハッシュタグコピー時など） */
  notify: (message: string) => void;
}

/**
 * 日単位ビュー共通の作品カード。
 * 時刻・タイトル・話数サブタイ・放送局、ハッシュタグコピー、
 * キャラクター／公式サイトへの即時リンク、視聴済みスイッチを持つ。
 * カード本体のクリックで情報更新ページ（/story/:tid）へ遷移する。
 */
const DayAnimeCard: React.FC<Props> = ({
  item,
  canEdit,
  showDate = false,
  missedAccent = false,
  onSaveWatched,
  onUnauthorized,
  onError,
  notify,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [minogashi, setMinogashi] = useState<number>(item.minogashi);
  const [saving, setSaving] = useState(false);

  const watched = minogashi === 1;
  const alreadyAired = item.stTime > 0 && item.stTime * 1000 <= Date.now();
  const statusLabel = watched ? '視聴済み' : alreadyAired ? '見逃し' : '未視聴';
  const statusColor: 'success' | 'error' | 'default' = watched ? 'success' : alreadyAired ? 'error' : 'default';

  const handleToggle = async (checked: boolean) => {
    const next = checked ? 1 : 0;
    const prev = minogashi;
    setMinogashi(next);
    setSaving(true);
    try {
      await onSaveWatched(item, next);
      notify(checked ? `「${item.title}」第${item.count}話を視聴済みにしました。` : `「${item.title}」第${item.count}話を未視聴に戻しました。`);
    } catch (e) {
      setMinogashi(prev);
      if (e instanceof UnauthorizedError) {
        onUnauthorized();
      } else {
        onError('保存に失敗しました。時間をおいて再試行してください。');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCopyTag = async () => {
    if (!item.hashTag) return;
    const ok = await copyText(item.hashTag);
    notify(ok ? 'ハッシュタグをコピーしました。' : 'コピーに失敗しました。');
  };

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <Paper
      elevation={0}
      onClick={() => navigate(`/story/${item.tid}`)}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 4,
        padding: '12px 16px',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
        '&:hover': { boxShadow: 3, borderColor: 'text.secondary' },
        ...(missedAccent && !watched
          ? { backgroundColor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.14 : 0.08) }
          : {}),
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Box sx={{ minWidth: 64, textAlign: 'center' }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
            {showDate ? formatBroadcastDateTime(item.stTime).split(' ')[1] : formatBroadcastTime(item.stTime)}
          </Typography>
          {showDate && (
            <Typography variant="caption" color="text.secondary">
              {formatBroadcastDateTime(item.stTime).split(' ')[0]}
            </Typography>
          )}
        </Box>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }} noWrap title={item.title}>
            {item.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap title={item.subTitle ?? ''}>
            第{item.count}話{item.subTitle ? ` 「${item.subTitle}」` : ''}
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexWrap: 'wrap', marginTop: 0.5 }}>
            {item.chName && <Chip label={item.chName} size="small" variant="outlined" />}
            {item.hashTag && (
              <>
                <Chip label={item.hashTag} size="small" color="secondary" variant="outlined" sx={{ maxWidth: '100%' }} />
                <Tooltip title="ハッシュタグをコピー">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyTag();
                    }}
                    aria-label="ハッシュタグをコピー"
                    sx={{ padding: 0.25 }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Stack>
        </Box>

        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }} onClick={stop}>
          {item.characterURL && (
            <Tooltip title="キャラクターページを開く">
              <IconButton
                size="small"
                color="primary"
                component="a"
                href={item.characterURL}
                target="_blank"
                rel="noreferrer"
                aria-label="キャラクターページを開く"
              >
                <PeopleIcon />
              </IconButton>
            </Tooltip>
          )}
          {item.publicURL && (
            <Tooltip title="公式サイトを開く">
              <IconButton
                size="small"
                color="primary"
                component="a"
                href={item.publicURL}
                target="_blank"
                rel="noreferrer"
                aria-label="公式サイトを開く"
              >
                <LanguageIcon />
              </IconButton>
            </Tooltip>
          )}
          <Chip label={statusLabel} size="small" color={statusColor} sx={{ minWidth: 64 }} />
          <Switch
            checked={watched}
            onChange={(e) => handleToggle(e.target.checked)}
            disabled={!canEdit || saving}
            slotProps={{ input: { 'aria-label': '視聴済みチェック' } }}
          />
          <OpenInNewIcon fontSize="small" sx={{ color: 'text.disabled' }} />
        </Stack>
      </Stack>
    </Paper>
  );
};

export default DayAnimeCard;
