// src/components/Dashboard.tsx
// @ts-nocheck
// src/components/Dashboard.tsx
import React from 'react';
import ReactGridLayout from 'react-grid-layout';
import Chart from './Chart';
import './Dashboard.css';  // Assuming you've created this file for styling

const Dashboard: React.FC = () => {
  const layout = [
    { i: 'a', x: 0, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
    { i: 'b', x: 4, y: 0, w: 6, h: 3, minW: 2, minH: 2 },
    { i: 'c', x: 0, y: 3, w: 2, h: 3, minW: 2, minH: 2 },
    { i: 'd', x: 2, y: 3, w: 2, h: 3, minW: 2, minH: 2 },
    { i: 'e', x: 4, y: 3, w: 4, h: 3, minW: 2, minH: 2 },
  ];

  // Sample data for the uPlot chart
  const data = [
    [1, 2, 3, 4, 5],  // x-axis data (time or categories)
    [1, 2, 3, 4, 5],  // First data series
    [5, 4, 3, 2, 1],  // Second data series
  ];

  // uPlot chart options
  const options: uPlot.Options = {


    series: [
      { label: 'Series 1', stroke: 'blue', width: 2 },
      { label: 'Series 2', stroke: 'red', width: 2 },
    ],
    axes: [
      { stroke: '#333', grid: { stroke: '#ddd' }, ticks: { stroke: '#333' } },
      { stroke: '#333', grid: { stroke: '#ddd' }, ticks: { stroke: '#333' }, side: 1 },
    ],
  };

  return (
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
      >
        <div key="a" className="dashboard-widget">
          <h3>Widget 1</h3>
          <p>Some content for widget 1...</p>
        </div>
        <div key="b" className="dashboard-widget">
          <Chart title="Sample Chart" data={data} options={options} />
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
  );
};

export default Dashboard;
