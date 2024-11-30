import React, { useState, useEffect } from 'react';
import { 
    Paper, 
    Typography, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow,
    CircularProgress
} from '@mui/material';
import { fetchTableData } from '../services/api';

const TableDisplay = ({ dbName, tableName }) => {
    const [tableData, setTableData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadTableData = async () => {
            try {
                setLoading(true);
                const data = await fetchTableData(dbName, tableName);
                setTableData(data);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.detail || err.message || 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        loadTableData();
    }, [dbName, tableName]);

    if (loading) {
        return (
            <Paper elevation={3} style={{ padding: '1rem', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper elevation={3} style={{ padding: '1rem', height: '100%', color: 'red' }}>
                <Typography variant="h6">{dbName}: {tableName}</Typography>
                <Typography color="error">Error: {error}</Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={3} style={{ padding: '1rem', height: '100%', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
                {dbName}: {tableName}
            </Typography>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {tableData?.columns.map((column) => (
                                <TableCell key={column.name}>
                                    <Typography variant="subtitle2">
                                        {column.name}
                                        <Typography variant="caption" display="block" color="textSecondary">
                                            {column.type}
                                        </Typography>
                                    </Typography>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableData?.data.map((row, idx) => (
                            <TableRow key={idx}>
                                {tableData.columns.map((column) => (
                                    <TableCell key={column.name}>
                                        {String(row[column.name] ?? '')}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default TableDisplay; 