import React, { useEffect, useState } from 'react';
import {
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Typography,
    Box,
    Paper,
    Tooltip
} from '@mui/material';
import { Delete, Edit, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getLayouts, deleteLayout } from '../services/api';

const LayoutList = () => {
    const [layouts, setLayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const loadLayouts = async () => {
        try {
            setLoading(true);
            const data = await getLayouts();
            setLayouts(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLayouts();
    }, []);

    const handleDelete = async (id) => {
        try {
            await deleteLayout(id);
            await loadLayouts(); // Refresh the list
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return <Typography>Loading layouts...</Typography>;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <Paper sx={{ mt: 2, p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Saved Layouts
            </Typography>
            <List>
                {layouts.map((layout) => (
                    <ListItem key={layout.id} divider>
                        <ListItemText
                            primary={layout.name}
                            secondary={`Last updated: ${new Date(layout.updated_at).toLocaleString()}`}
                        />
                        <ListItemSecondaryAction>
                            <Tooltip title="View">
                                <IconButton
                                    edge="end"
                                    onClick={() => navigate(`/layout/${layout.name}`)}
                                >
                                    <Visibility />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                                <IconButton
                                    edge="end"
                                    onClick={() => navigate(`/layout/${layout.name}/edit`)}
                                >
                                    <Edit />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                                <IconButton
                                    edge="end"
                                    onClick={() => handleDelete(layout.id)}
                                >
                                    <Delete />
                                </IconButton>
                            </Tooltip>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
                {layouts.length === 0 && (
                    <Typography variant="body2" sx={{ p: 2, textAlign: 'center' }}>
                        No saved layouts found
                    </Typography>
                )}
            </List>
        </Paper>
    );
};

export default LayoutList; 