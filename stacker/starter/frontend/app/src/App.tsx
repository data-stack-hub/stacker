import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

import Stacker from './services/stacker';
import Dashboard from './components/Dashboard';
import { Button } from "./components/ui/button"
import { Slider } from "@/components/ui/slider"




function App() {

  useEffect(() => {

    Stacker.get_data()

  },[]);
  return (
    <div className="App">
     <h1 className="text-3xl font-bold underline">
      Hello world!
    </h1>
    <Button variant="destructive">Button</Button>
    <Slider defaultValue={[33]} max={100} step={1} />


      <Dashboard></Dashboard>
    </div>
  );
}

export default App;
