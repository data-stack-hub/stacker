// src/components/Dashboard.tsx
// @ts-nocheck
// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import ReactGridLayout from 'react-grid-layout';
import Chart from './Chart';
import './Dashboard.css';  // Assuming you've created this file for styling
import { Button } from '@/components/ui/button';
import httpService from '@/services/httpService';


const Dashboard: React.FC = () => {

  const get_dash = () =>{
    httpService.get('dashboard?uid=eq.main_dash&limit=1').then((res:any)=>{
      console.log(JSON.parse(res.data[0].slug))
      setLayout(JSON.parse(res.data[0].slug))
    })
  }

  useEffect(() => {
    get_dash();  // Get the dashboard data on component mount
  }, []);
const save = () =>{

  httpService.get('/dashboard').then(res=>{
    console.log(res)
  })

  console.log(layout)

  httpService.put('/dashboard', {
    id:1,
slug:layout,
uid: "main_dash",
url: "/",
version: 2

  })
  console.log('saving dashboard')
}

const [layout, setLayout] = useState([
  { i: "a", x: 0, y: 0, w: 1, h: 2, static: true },
  { i: "b", x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 },
  { i: "c", x: 4, y: 0, w: 1, h: 2 },
]);

const onLayoutChange = (newLayout: any) => {
  setLayout(newLayout);
};

  return (
    <>
    <div>
      <Button onClick={save}> save</Button>
    </div>
        <div className="dashboard-container">
      <ReactGridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={100}
        width={1200}
        isDraggable={true}
        isResizable={true}
        useCSSTransforms={true}
        onLayoutChange={onLayoutChange}
      >
        <div key="a" className="dashboard-widget">
          <h3>Widget 1</h3>
          <p>Some content for widget 1...</p>
        </div>
        <div key="b" className="dashboard-widget">
          {/* <Chart title="Sample Chart" data={data} options={options} /> */}
        </div>
        <div key="c" className="dashboard-widget">
          <h3>Widget 3</h3>
          <p>Some content for widget 3...</p>
        </div>
        <div key="d" className="dashboard-widget">
          <h3>Widget 4</h3>
          <p>Some content for widget 4...</p>
        </div>
        <div key="e" className="dashboard-widget">
          <h3>Widget 5</h3>
          <p>Some content for widget 5...</p>
        </div>
      </ReactGridLayout>
    </div>
    </>

  );
};

export default Dashboard;
