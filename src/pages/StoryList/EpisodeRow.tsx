import React, { useState } from 'react';
import { Button, Stack, Switch, TableCell, TableRow, TextField, Typography } from '@mui/material';
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
    <TableRow
      sx={
        minogashi === 0
          ? { backgroundColor: alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.16 : 0.07) }
          : undefined
      }
    >
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{story.count}</TableCell>
      <TableCell>{subTitle}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{broadcastDate}</TableCell>
      <TableCell sx={{ minWidth: 220 }}>
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
              variant="outlined"
              size="small"
              onClick={handleSaveComment}
              disabled={!commentDirty || saving}
              sx={{ whiteSpace: 'nowrap' }}
            >
              保存
            </Button>
          </Stack>
        ) : (
          <Typography variant="body2" color={comment ? 'text.primary' : 'text.secondary'}>
            {comment ? comment : '（コメントなし）'}
          </Typography>
        )}
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <Switch
            checked={minogashi === 1}
            onChange={(e) => handleToggle(e.target.checked)}
            disabled={!canEdit || saving}
            slotProps={{ input: { 'aria-label': '見逃しチェック' } }}
          />
          <Typography variant="caption" color={minogashi === 0 ? 'error' : 'text.secondary'}>
            {minogashi === 0 ? '見逃し' : '視聴済み'}
          </Typography>
        </Stack>
      </TableCell>
    </TableRow>
  );
};

export default EpisodeRow;
