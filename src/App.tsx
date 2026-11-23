import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import WatchAnimeList from './pages/WatchAnimeList/Index';
import StoryList from './pages/StoryList/Index';
import ManageToday from './pages/Manage/Today';
import ManageWeek from './pages/Manage/Week';
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
              <Route path='/manage/today' element={<ManageToday />} />
              <Route path='/manage/week' element={<ManageWeek />} />
            </Routes>
          </Router>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
