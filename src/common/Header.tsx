import React from "react";
import { AppBar, Grid, IconButton, Toolbar, Typography } from '@material-ui/core';

const Header: React.FC = (()=>{
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu">
        </IconButton>
        <Typography variant="h6">
          Menu
        </Typography>
      </Toolbar>
    </AppBar>
  )
});

export default Header;
