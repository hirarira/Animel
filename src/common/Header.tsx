import React from "react";
import { useNavigate } from 'react-router-dom';
import { Alert, AppBar, Button, Divider, IconButton, Menu, MenuItem, Snackbar, Toolbar, Typography, useColorScheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LockIcon from '@mui/icons-material/Lock';
import { useAuth } from '../auth/AuthContext';
import GoogleSignInButton from '../auth/GoogleSignInButton';

// Google サインインは Stage 2 の既読管理パイロットで再導入した。
// サインインは管理操作（書き込み系 API の Bearer 認証）のためだけに使う。
const Header: React.FC = (() => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [accountAnchorEl, setAccountAnchorEl] = React.useState<null | HTMLElement>(null);
  const { mode, systemMode, setMode } = useColorScheme();
  const { auth, isSignedIn, signOut, notice, clearNotice } = useAuth();
  const navigate = useNavigate();
  const resolvedMode = mode === 'system' ? systemMode : mode;
  const isDark = resolvedMode === 'dark';
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
    <AppBar position="sticky">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleClick}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'left' }}>
          視聴したアニメリスト
        </Typography>
        {/* 管理画面への導線は公開一覧とは分ける（モック準拠）。
            未サインイン時は管理導線自体を出さない（ユーザー指示 2026-11-23） */}
        {isSignedIn && (
          <Button
            color="inherit"
            variant="outlined"
            size="small"
            startIcon={<CalendarMonthIcon />}
            endIcon={<LockIcon sx={{ fontSize: 13 }} />}
            onClick={() => navigate('/manage/today')}
            sx={{ borderRadius: 999, marginRight: 1, whiteSpace: 'nowrap' }}
          >
            今日見るアニメ
            <Typography variant="caption" component="span" sx={{ marginLeft: 0.75, opacity: 0.85 }}>
              管理用
            </Typography>
          </Button>
        )}
        <IconButton
          color="inherit"
          aria-label={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
          onClick={() => setMode(isDark ? 'light' : 'dark')}
        >
          {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        {isSignedIn ? (
          <>
            <Button
              color="inherit"
              size="small"
              startIcon={<AccountCircleIcon />}
              onClick={(event) => setAccountAnchorEl(event.currentTarget)}
              sx={{ textTransform: 'none', marginLeft: 1, maxWidth: { xs: 140, sm: 260 } }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {auth?.email}
              </span>
            </Button>
            <Menu
              anchorEl={accountAnchorEl}
              open={Boolean(accountAnchorEl)}
              onClose={() => setAccountAnchorEl(null)}
            >
              <MenuItem
                onClick={() => {
                  setAccountAnchorEl(null);
                  signOut();
                }}
              >
                サインアウト
              </MenuItem>
            </Menu>
          </>
        ) : (
          <span style={{ marginLeft: 8 }}>
            <GoogleSignInButton />
          </span>
        )}
      </Toolbar>
    </AppBar>
    <Menu
      id="menu"
      anchorEl={anchorEl}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleClose}
    >
      {isSignedIn && (
        <>
          <MenuItem onClick={()=>{
            handleClose();
            navigate('/manage/today');
          }}>今日見るアニメ（管理用）</MenuItem>
          <MenuItem onClick={()=>{
            handleClose();
            navigate('/manage/week');
          }}>見逃し（過去1週間）（管理用）</MenuItem>
          <Divider />
        </>
      )}
      <MenuItem onClick={()=>{
        window.location.href = './anime_houshin.pdf';
      }}>アニメ評価方針（PDF）</MenuItem>
      <MenuItem onClick={()=>{
        window.location.href = 'https://pollux.hirarira.net/showAnimeList/public/';
      }}>旧アニメ視聴アプリ</MenuItem>
      <MenuItem onClick={()=>{
        window.location.href = 'https://hirarira.net/';
      }}>TOPに戻る</MenuItem>
      <MenuItem onClick={()=>{
        window.location.href = 'https://twitter.com/hirarira617/';
      }}>Twitterに戻る</MenuItem>
    </Menu>
    <Snackbar
      open={Boolean(notice)}
      autoHideDuration={6000}
      onClose={clearNotice}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert severity="warning" variant="filled" onClose={clearNotice}>
        {notice}
      </Alert>
    </Snackbar>
    </>
  )
});

export default Header;
