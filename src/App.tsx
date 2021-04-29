import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import WatchAnimeList from './pages/WatchAnimeList/Index';
import ShowMinogashiAnimeTop from './pages/ShowMinogashiAnime/Index';

function App() {
  return (
    <div className="App">
      <Router basename={'/Animel'}>
        <Route exact path='/' component={WatchAnimeList}/>
        <Route exact path='/showMinogashiAnime' component={ShowMinogashiAnimeTop}/>
      </Router>
    </div>
  );
}

export default App;
