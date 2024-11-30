import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, IconButton, Tooltip, Paper } from '@mui/material';
import { Refresh, TrendingUp, TrendingDown } from '@mui/icons-material';
import { executeCustomQuery } from '../../services/api';

const MetricWidget = ({ config }) => {
    const [data, setData] = useState(null);
    const [previousData, setPreviousData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            if (config.database && config.query) {
                const result = await executeCustomQuery(
                    config.database,
                    config.query
                );

                if (result && result.data && result.data.length > 0) {
                    setPreviousData(data); // Store previous value for trend
                    const value = Object.values(result.data[0])[0];
                    setData(value);
                }
                setError(null);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        
        let intervalId;
        if (config.refreshInterval && config.refreshInterval > 0) {
            intervalId = setInterval(loadData, config.refreshInterval * 1000);
        }
        
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [config]);

    const formatValue = (value) => {
        if (value === null || value === undefined) return 'N/A';

        let formattedValue = value;
        
        // Apply number formatting if it's a number
        if (typeof value === 'number') {
            formattedValue = value.toLocaleString(undefined, {
                minimumFractionDigits: config.decimals || 0,
                maximumFractionDigits: config.decimals || 0
            });
        }

        // Add prefix and suffix if configured
        return `${config.prefix || ''}${formattedValue}${config.suffix || ''}`;
    };

    const getTrendIndicator = () => {
        if (!config.showTrend || !previousData || previousData === data) return null;
        
        const trend = data > previousData;
        const TrendIcon = trend ? TrendingUp : TrendingDown;
        const trendColor = trend ? 'success.main' : 'error.main';
        
        return (
            <TrendIcon 
                sx={{ 
                    color: trendColor,
                    ml: 1,
                    verticalAlign: 'middle'
                }} 
            />
        );
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Typography color="error" align="center">
                {error}
            </Typography>
        );
    }

    return (
        <Paper 
            elevation={config.elevation || 0}
            sx={{
                height: '100%',
                backgroundColor: config.backgroundColor || 'background.paper',
                color: config.textColor || 'text.primary',
                p: config.padding || 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                border: config.showBorder ? `1px solid ${config.borderColor || '#e0e0e0'}` : 'none',
            }}
        >
            <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                {config.refreshInterval > 0 && (
                    <Typography variant="caption" color="textSecondary" sx={{ mr: 1 }}>
                        Auto-refresh: {config.refreshInterval}s
                    </Typography>
                )}
                <Tooltip title="Refresh Data">
                    <IconButton onClick={loadData} size="small">
                        <Refresh />
                    </IconButton>
                </Tooltip>
            </Box>

            {config.title && (
                <Typography 
                    variant={config.titleVariant || 'h6'}
                    sx={{ 
                        mb: 2,
                        fontWeight: config.style?.titleFontWeight || 500,
                        textAlign: config.textAlignment || 'center'
                    }}
                >
                    {config.title}
                </Typography>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography 
                    variant="h3" 
                    component="div"
                    sx={{ 
                        fontWeight: 'bold',
                        fontSize: config.fontSize || '2.5rem',
                        textAlign: 'center'
                    }}
                >
                    {formatValue(data)}
                    {getTrendIndicator()}
                </Typography>
            </Box>

            {config.description && (
                <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                        mt: 2,
                        textAlign: config.textAlignment || 'center'
                    }}
                >
                    {config.description}
                </Typography>
            )}
        </Paper>
    );
};

export default MetricWidget; 