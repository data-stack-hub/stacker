// src/components/Chart.tsx
import React, { useRef, useEffect, useState } from 'react';
import uPlot from 'uplot';

interface ChartProps {
  title: string;
  data: any;
  options: uPlot.Options;
}

const Chart: React.FC<ChartProps> = ({ title, data, options }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [chart, setChart] = useState<uPlot | null>(null);

  // Initialize chart on mount
  useEffect(() => {
    if (chartRef.current) {
      const newChart = new uPlot(options, data, chartRef.current);
      setChart(newChart);

      return () => {
        newChart.destroy();
      };
    }
  }, [data, options]);

  // Resize chart whenever the parent container resizes
  useEffect(() => {
    if (chart && chartRef.current) {
      const resizeChart = () => {
        const { width, height } = chartRef.current!.getBoundingClientRect();
        chart.setSize({ width, height });
      };

      // Initial resize
      resizeChart();

      // Listen for window resize events
      window.addEventListener('resize', resizeChart);

      return () => {
        window.removeEventListener('resize', resizeChart);
      };
    }
  }, [chart]);

  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <div ref={chartRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

export default Chart;
