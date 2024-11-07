import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

import Stacker from './services/stacker';
import Dashboard from './components/Dashboard';

function App() {

  useEffect(() => {

    Stacker.get_data()

  },[]);
  return (
    <div className="App">
      <Dashboard></Dashboard>
    </div>
  );
}

export default App;
