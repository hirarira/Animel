import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import WatchAnimeList from './pages/WatchAnimeList/Index';

function App() {
  return (
    <div className="App">
      <Router>
        <Route exact path='/' component={WatchAnimeList}/>
      </Router>
    </div>
  );
}

export default App;
