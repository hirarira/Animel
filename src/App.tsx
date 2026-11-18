import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import WatchAnimeList from './pages/WatchAnimeList/Index';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme} defaultMode="system">
      <CssBaseline />
      <div className="App">
        <Router basename={'/Animel'}>
          <Routes>
            <Route path='/' element={<WatchAnimeList />} />
          </Routes>
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;
