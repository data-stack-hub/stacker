import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';

const Dashboard = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Welcome to Database Dashboard
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
          <Typography variant="h6">Database Overview</Typography>
          {/* Add dashboard widgets here */}
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
          <Typography variant="h6">Recent Activity</Typography>
          {/* Add dashboard widgets here */}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard; 