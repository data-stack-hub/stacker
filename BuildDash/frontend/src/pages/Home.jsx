import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LayoutList from '../components/LayoutList';

const Home = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Dashboard Layouts</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/builder')}
                >
                    Create New Layout
                </Button>
            </Box>
            <LayoutList />
        </Box>
    );
};

export default Home; 