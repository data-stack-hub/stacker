import React from 'react';
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import { TableChart, Dashboard, Schema, Build } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const drawerWidth = 240;

const DashboardLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Database Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem button component={Link} to="/">
              <ListItemIcon><Dashboard /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button component={Link} to="/tables">
              <ListItemIcon><TableChart /></ListItemIcon>
              <ListItemText primary="Database Tables" />
            </ListItem>
            <ListItem button component={Link} to="/builder">
              <ListItemIcon><Build /></ListItemIcon>
              <ListItemText primary="Layout Builder" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout; 