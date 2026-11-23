import React, { useState } from 'react';
import { Avatar, Box, Button, Chip, Paper, Stack, Switch, TextField, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { AnimeStory } from '../../data/AnimeStory';
import { UnauthorizedError } from '../../data/getAnimeStory';

interface Props {
  story: AnimeStory;
  /** サインイン済みなら編集可能 */
  canEdit: boolean;
  /** 保存処理（親が API 呼び出しと認証を担当）。失敗時は例外を投げる */
  onSave: (count: number, minogashi: number, comment: string) => Promise<void>;
  onUnauthorized: () => void;
  onError: (message: string) => void;
}

/**
 * 各話カード（モックの現代風デザインに合わせたカード型）。
 * 話数バッジ・サブタイ・放送日・状態チップ＋スイッチ・コメント編集を持つ。
 * 保存ボタンは変更がある時だけ目立つ（contained）表示にする。
 */
const EpisodeRow: React.FC<Props> = ({ story, canEdit, onSave, onUnauthorized, onError }) => {
  const theme = useTheme();
  const [minogashi, setMinogashi] = useState<number>(story.minogashi);
  const [comment, setComment] = useState<string>(story.comment ?? '');
  const [savedComment, setSavedComment] = useState<string>(story.comment ?? '');
  const [saving, setSaving] = useState(false);

  const broadcastDate = story.stTime
    ? (() => {
        const d = new Date(story.stTime * 1000);
        return `${d.getMonth() + 1}/${d.getDate()}`;
      })()
    : '';
  const subTitle = story.subTitle ? story.subTitle : '（サブタイなし）';
  const commentDirty = comment !== savedComment;
  const watched = minogashi === 1;

  const handleFailure = (e: unknown, rollback: () => void) => {
    rollback();
    if (e instanceof UnauthorizedError) {
      onUnauthorized();
    } else {
      onError('保存に失敗しました。時間をおいて再試行してください。');
    }
  };

  const handleToggle = async (checked: boolean) => {
    const next = checked ? 1 : 0;
    const prev = minogashi;
    setMinogashi(next);
    setSaving(true);
    try {
      // setAnimeStory は comment も上書きするため、現在のコメントも一緒に送る
      await onSave(story.count, next, comment);
      setSavedComment(comment);
    } catch (e) {
      handleFailure(e, () => setMinogashi(prev));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveComment = async () => {
    setSaving(true);
    try {
      await onSave(story.count, minogashi, comment);
      setSavedComment(comment);
    } catch (e) {
      handleFailure(e, () => {});
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 4,
        padding: '12px 16px',
        ...(!watched
          ? { backgroundColor: alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.13 : 0.05) }
          : {}),
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <Avatar
          sx={{
            width: 38,
            height: 38,
            fontSize: 15,
            fontWeight: 700,
            bgcolor: watched ? 'primary.main' : 'action.disabledBackground',
            color: watched ? 'primary.contrastText' : 'text.secondary',
            flexShrink: 0,
          }}
        >
          {story.count}
        </Avatar>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {subTitle}
            </Typography>
            {broadcastDate && (
              <Typography variant="caption" color="text.secondary">
                {broadcastDate} 放送
              </Typography>
            )}
            <Chip label={watched ? '視聴済み' : '見逃し'} size="small" color={watched ? 'success' : 'error'} />
          </Stack>

          <Box sx={{ marginTop: 1 }}>
            {canEdit ? (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                <TextField
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  size="small"
                  multiline
                  maxRows={4}
                  fullWidth
                  placeholder="コメント"
                  disabled={saving}
                />
                <Button
                  variant={commentDirty ? 'contained' : 'outlined'}
                  size="small"
                  onClick={handleSaveComment}
                  disabled={!commentDirty || saving}
                  sx={{ whiteSpace: 'nowrap', borderRadius: 999 }}
                >
                  保存
                </Button>
              </Stack>
            ) : (
              <Typography variant="body2" color={comment ? 'text.primary' : 'text.secondary'}>
                {comment ? comment : '（コメントなし）'}
              </Typography>
            )}
          </Box>
        </Box>

        <Switch
          checked={watched}
          onChange={(e) => handleToggle(e.target.checked)}
          disabled={!canEdit || saving}
          slotProps={{ input: { 'aria-label': '見逃しチェック' } }}
          sx={{ flexShrink: 0 }}
        />
      </Stack>
    </Paper>
  );
};

export default EpisodeRow;
