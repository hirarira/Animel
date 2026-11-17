import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WatchAnimeList from './pages/WatchAnimeList/Index';

function App() {
  return (
    <div className="App">
      <Router basename={'/Animel'}>
        <Routes>
          <Route path='/' element={<WatchAnimeList />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
