import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import WatchAnimeList from './pages/WatchAnimeList/Index';
import StoryList from './pages/StoryList/Index';
import { AuthProvider } from './auth/AuthContext';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme} defaultMode="system">
      <CssBaseline />
      <AuthProvider>
        <div className="App">
          <Router basename={'/Animel'}>
            <Routes>
              <Route path='/' element={<WatchAnimeList />} />
              <Route path='/story/:tid' element={<StoryList />} />
            </Routes>
          </Router>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
