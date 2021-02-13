import React, { useState } from "react";
import { AppBar, Grid, IconButton, makeStyles, Menu, MenuItem, Toolbar, Typography } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';

const useStyles = makeStyles((theme) => ({
  section: {
  },
}));

const Header: React.FC = (()=>{
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const classes = useStyles();
  return (
    <>
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleClick}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6">
          Menu
        </Typography>
      </Toolbar>
    </AppBar>
    <Menu
      id="menu"
      anchorEl={anchorEl}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleClose}
      className={classes.section}
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
