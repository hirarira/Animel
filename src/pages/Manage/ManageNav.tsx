import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HistoryIcon from '@mui/icons-material/History';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ListIcon from '@mui/icons-material/List';
import ApiIcon from '@mui/icons-material/Api';

/**
 * 管理画面共通のサブナビゲーション。
 * 公開側（クール単位の一覧）とは導線を分け、管理用であることが分かる見た目にする。
 */
const ManageNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isToday = location.pathname.startsWith('/manage/today');
  const isWeek = location.pathname.startsWith('/manage/week');
  const isStatus = location.pathname.startsWith('/manage/status');

  return (
    <Box
      sx={{
        border: '1.5px dashed',
        borderColor: 'divider',
        borderRadius: 4,
        padding: '10px 14px',
        marginBottom: 2,
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', marginRight: 1 }}>
          <LockIcon fontSize="small" color="action" />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
            管理用・サインイン必須
          </Typography>
        </Stack>
        <Button
          variant={isToday ? 'contained' : 'outlined'}
          size="small"
          startIcon={<CalendarMonthIcon />}
          onClick={() => navigate('/manage/today')}
          sx={{ borderRadius: 999 }}
        >
          今日見るアニメ
        </Button>
        <Button
          variant={isWeek ? 'contained' : 'outlined'}
          size="small"
          startIcon={<HistoryIcon />}
          onClick={() => navigate('/manage/week')}
          sx={{ borderRadius: 999 }}
        >
          見逃し（過去1週間）
        </Button>
        <Button
          variant={isStatus ? 'contained' : 'outlined'}
          size="small"
          startIcon={<ChecklistIcon />}
          onClick={() => navigate('/manage/status')}
          sx={{ borderRadius: 999 }}
        >
          ステータス別一覧
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ApiIcon />}
          component="a"
          href="https://pollux.hirarira.net/showMinogashiAnime/apidocs/"
          target="_blank"
          rel="noreferrer"
          sx={{ borderRadius: 999 }}
        >
          APIドキュメント
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="text"
          size="small"
          startIcon={<ListIcon />}
          onClick={() => navigate('/')}
          sx={{ borderRadius: 999 }}
        >
          アニメリストに戻る
        </Button>
      </Stack>
    </Box>
  );
};

export default ManageNav;
