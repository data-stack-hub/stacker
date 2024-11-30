import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    Typography,
    Box,
    CircularProgress,
    Tooltip,
    IconButton
} from '@mui/material';
import { Refresh, Info } from '@mui/icons-material';
import { fetchTableData, executeCustomQuery, getTableMetadata } from '../../services/api';

const TableWidget = ({ config }) => {
    const [data, setData] = useState(null);
    const [metadata, setMetadata] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [error, setError] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            let result;
            
            if (config.database && config.table) {
                result = await fetchTableData(
                    config.database,
                    config.table
                );
                
                // Fetch metadata for column information
                const tableMetadata = await getTableMetadata(
                    config.database,
                    config.table
                );
                setMetadata(tableMetadata);

                // Filter data to only show selected columns if specified
                if (config.columns && config.columns.length > 0) {
                    result = {
                        columns: result.columns.filter(col => 
                            config.columns.includes(col.name)
                        ),
                        data: result.data.map(row => {
                            const filteredRow = {};
                            config.columns.forEach(colName => {
                                filteredRow[colName] = row[colName];
                            });
                            return filteredRow;
                        })
                    };
                }
            }

            if (result) {
                setData(result);
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
        
        // Clear existing interval before setting a new one
        let intervalId;
        if (config.refreshInterval && config.refreshInterval > 0) {
            intervalId = setInterval(loadData, config.refreshInterval * 1000);
        }
        
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [config]); // Dependencies include config to react to refresh interval changes

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    if (!data || !data.columns || !data.data) {
        return <Typography>No data available</Typography>;
    }

    const { pagination = false } = config;
    const rowsPerPage = config.pageSize || 10;

    return (
        <Box sx={{ ...config.style }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                {config.title && (
                    <Typography variant="h6">
                        {config.title}
                    </Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {config.refreshInterval > 0 && (
                        <Typography variant="caption" color="textSecondary">
                            Auto-refresh: {config.refreshInterval}s
                        </Typography>
                    )}
                    <Tooltip title="Refresh Data">
                        <IconButton onClick={loadData} size="small">
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                    {metadata && (
                        <Tooltip title={`Table: ${config.database}.${config.table}`}>
                            <IconButton size="small">
                                <Info />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </Box>
            
            <TableContainer 
                component={Paper}
                sx={{
                    border: config.borderStyle !== 'none' ? `1px ${config.borderStyle} ${config.borderColor}` : 'none',
                    maxHeight: config.maxHeight || 400,
                    overflow: 'auto',
                    '&::-webkit-scrollbar': {
                        width: '8px',
                        height: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: '#f1f1f1',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#888',
                        borderRadius: '4px',
                        '&:hover': {
                            backgroundColor: '#555',
                        },
                    },
                }}
            >
                <Table 
                    size={config.tableSize || 'small'}
                    stickyHeader
                    sx={{
                        '& .MuiTableHead-root .MuiTableCell-root': {
                            backgroundColor: config.headerBgColor || '#f5f5f5',
                            color: config.headerTextColor || 'inherit',
                            position: 'sticky',
                            top: 0,
                            zIndex: 1,
                        },
                        '& .MuiTableBody-root .MuiTableRow-root': {
                            backgroundColor: config.rowBgColor || 'inherit',
                            '&:nth-of-type(odd)': {
                                backgroundColor: config.alternateRowColor || 'inherit'
                            }
                        },
                        '& .MuiTableCell-root': {
                            padding: config.density === 'compact' ? '6px 16px' : 
                                     config.density === 'comfortable' ? '16px 16px' : 
                                     '12px 16px'
                        }
                    }}
                >
                    <TableHead>
                        <TableRow>
                            {data.columns.map((column) => (
                                <TableCell 
                                    key={column.name}
                                    sx={{
                                        fontWeight: metadata?.columns.find(
                                            c => c.name === column.name
                                        )?.is_primary_key ? 'bold' : 'normal'
                                    }}
                                >
                                    <Tooltip 
                                        title={`Type: ${column.type}${
                                            metadata?.columns.find(
                                                c => c.name === column.name
                                            )?.is_primary_key ? ' (Primary Key)' : ''
                                        }`}
                                    >
                                        <span>{column.name}</span>
                                    </Tooltip>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.data
                            .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                            .map((row, idx) => (
                                <TableRow key={idx}>
                                    {data.columns.map((column) => (
                                        <TableCell key={column.name}>
                                            {String(row[column.name] ?? '')}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {pagination && (
                <TablePagination
                    component="div"
                    count={data.data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPageOptions={[rowsPerPage]}
                />
            )}
        </Box>
    );
};

export default TableWidget; 