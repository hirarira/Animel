import React from "react";
import { AppBar, IconButton, Menu, MenuItem, Toolbar, Typography, useColorScheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

// ログイン機能と管理ページ（showMinogashiAnime）へのリンクは Phase 1 で撤去済み。
const Header: React.FC = (() => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { mode, systemMode, setMode } = useColorScheme();
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
        <IconButton
          color="inherit"
          aria-label={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
          onClick={() => setMode(isDark ? 'light' : 'dark')}
        >
          {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>
    <Menu
      id="menu"
      anchorEl={anchorEl}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleClose}
    >
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
    </>
  )
});

export default Header;
