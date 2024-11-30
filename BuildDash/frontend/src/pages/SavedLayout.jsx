import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import LayoutBuilder from '../components/LayoutBuilder';
import { getLayoutByName, getLayoutById } from '../services/api';

const SavedLayout = () => {
    const { layoutId } = useParams();
    const navigate = useNavigate();
    const [layout, setLayout] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadLayout = async () => {
            try {
                setLoading(true);
                let layoutData;
                
                // Try to fetch by ID first, then by name if that fails
                try {
                    layoutData = await getLayoutById(layoutId);
                } catch (idError) {
                    try {
                        layoutData = await getLayoutByName(layoutId);
                    } catch (nameError) {
                        throw new Error('Layout not found');
                    }
                }
                
                setLayout(layoutData);
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadLayout();
    }, [layoutId]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/')}
                    sx={{ mb: 2 }}
                >
                    Back to Home
                </Button>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/')}
                sx={{ mb: 2 }}
            >
                Back to Home
            </Button>
            {layout && (
                <>
                    <Typography variant="h4" gutterBottom>
                        {layout.name}
                    </Typography>
                    <LayoutBuilder
                        initialLayout={layout.layout_config}
                        layoutId={layout.id}
                        layoutName={layout.name}
                    />
                </>
            )}
        </Box>
    );
};

export default SavedLayout; 