import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { fetchTableData, executeCustomQuery } from '../../services/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const ChartWidget = ({ config }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            let result;

            if (config.query.useCustomQuery && config.query.customQuery) {
                result = await executeCustomQuery(
                    config.query.database,
                    config.query.customQuery,
                    config.query.params || {}
                );
            } else {
                result = await fetchTableData(
                    config.query.database,
                    config.query.table
                );
            }

            setData(result);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();

        if (config.refreshInterval > 0) {
            const interval = setInterval(loadData, config.refreshInterval * 1000);
            return () => clearInterval(interval);
        }
    }, [config]);

    const renderChart = () => {
        if (!data || !data.data || !data.columns) return null;

        const chartData = {
            labels: data.data.map(row => row[config.visualization.xAxis] || ''),
            datasets: [{
                label: config.visualization.yAxis,
                data: data.data.map(row => row[config.visualization.yAxis] || 0),
                backgroundColor: config.visualization.backgroundColor || 'rgba(75, 192, 192, 0.2)',
                borderColor: config.visualization.borderColor || 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: config.title
                }
            }
        };

        switch (config.visualization.chartType) {
            case 'bar':
                return <Bar data={chartData} options={options} />;
            case 'pie':
                return <Pie data={chartData} options={options} />;
            default:
                return <Line data={chartData} options={options} />;
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box sx={{ 
            ...config.style,
            height: '100%',
            position: 'relative'
        }}>
            {renderChart()}
        </Box>
    );
};

export default ChartWidget; 