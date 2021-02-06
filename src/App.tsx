import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Index from './pages/Index';

function App() {
  return (
    <div className="App">
      <Router>
        <Route exact path='/' component={Index}/>
      </Router>
    </div>
  );
}

export default App;
