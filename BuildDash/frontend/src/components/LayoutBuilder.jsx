import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Grid,
    Alert,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import RGL, { WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { 
    Settings, 
    Add,
    TableChart,
    BarChart,
    Numbers,
    TextFields,
    Delete
} from '@mui/icons-material';
import { createLayout, updateLayout } from '../services/api';
import LayoutList from './LayoutList';
import WidgetCustomizeDialog from './WidgetCustomizeDialog';
import TableWidget from './widgets/TableWidget';
import ChartWidget from './widgets/ChartWidget';
import MetricWidget from './widgets/MetricWidget';
import TextWidget from './widgets/TextWidget';

const ReactGridLayout = WidthProvider(RGL);

const WIDGET_TYPES = [
    { 
        type: 'table', 
        label: 'Table Widget', 
        icon: <TableChart />,
        defaultSize: { w: 6, h: 4 },
        defaultConfig: {
            title: 'New Table Widget',
            query: {},
            visualization: {},
            style: {}
        }
    },
    { 
        type: 'chart', 
        label: 'Chart Widget', 
        icon: <BarChart />,
        defaultSize: { w: 4, h: 4 },
        defaultConfig: {
            title: 'New Chart Widget',
            query: {},
            visualization: { type: 'bar' },
            style: {}
        }
    },
    { 
        type: 'metric', 
        label: 'Metric Widget', 
        icon: <Numbers />,
        defaultSize: { w: 2, h: 2 },
        defaultConfig: {
            title: 'New Metric Widget',
            query: {},
            visualization: {},
            style: {}
        }
    },
    { 
        type: 'text', 
        label: 'Text Widget', 
        icon: <TextFields />,
        defaultSize: { w: 3, h: 2 },
        defaultConfig: {
            title: 'New Text Widget',
            content: 'Enter your text here',
            style: {}
        }
    }
];

const LayoutBuilder = ({ initialLayout = [], layoutId, layoutName, isEditing = false }) => {
    const [layout, setLayout] = useState(initialLayout);
    const [widgets, setWidgets] = useState([]);
    const [name, setName] = useState(layoutName || '');
    const [selectedWidget, setSelectedWidget] = useState(null);
    const [customizeDialogOpen, setCustomizeDialogOpen] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [addMenuAnchor, setAddMenuAnchor] = useState(null);

    useEffect(() => {
        if (initialLayout && initialLayout.length > 0) {
            setLayout(initialLayout);
            // Convert layout config to widgets
            const initialWidgets = initialLayout.map(item => ({
                i: item.i,
                config: item.config || {
                    type: 'table',
                    title: 'New Widget',
                    query: {},
                    visualization: {},
                    style: {}
                }
            }));
            setWidgets(initialWidgets);
        }
    }, [initialLayout]);

    const handleLayoutChange = (newLayout) => {
        setLayout(newLayout);
    };

    const handleAddMenuClick = (event) => {
        setAddMenuAnchor(event.currentTarget);
    };

    const handleAddMenuClose = () => {
        setAddMenuAnchor(null);
    };

    const addNewWidget = (widgetType) => {
        const selectedType = WIDGET_TYPES.find(w => w.type === widgetType);
        const newWidgetId = `widget-${Date.now()}`;
        
        const newWidget = {
            i: newWidgetId,
            config: {
                type: widgetType,
                ...selectedType.defaultConfig
            }
        };

        setWidgets([...widgets, newWidget]);
        setLayout([
            ...layout,
            {
                i: newWidgetId,
                x: 0,
                y: Infinity,
                ...selectedType.defaultSize
            }
        ]);
        
        handleAddMenuClose();
    };

    const handleCustomizeWidget = (widgetId) => {
        const widget = widgets.find(w => w.i === widgetId);
        setSelectedWidget(widget);
        setCustomizeDialogOpen(true);
    };

    const handleSaveWidgetCustomization = (widgetId, config) => {
        setWidgets(widgets.map(widget => 
            widget.i === widgetId ? { ...widget, config } : widget
        ));
        setCustomizeDialogOpen(false);
    };

    const handleSave = async () => {
        try {
            const layoutConfig = layout.map(item => {
                const widget = widgets.find(w => w.i === item.i);
                return {
                    ...item,
                    config: widget.config
                };
            });

            if (layoutId) {
                await updateLayout(layoutId, {
                    name,
                    layout_config: layoutConfig
                });
                setSuccess('Layout updated successfully');
            } else {
                await createLayout({
                    name,
                    layout_config: layoutConfig
                });
                setSuccess('Layout saved successfully');
            }
            setError('');
        } catch (err) {
            setError(err.message);
            setSuccess('');
        }
    };

    const handleDeleteWidget = (widgetId) => {
        setWidgets(widgets.filter(w => w.i !== widgetId));
        setLayout(layout.filter(l => l.i !== widgetId));
    };

    const renderWidget = (item) => {
        const widget = widgets.find(w => w.i === item.i);
        if (!widget || !widget.config) return null;

        switch (widget.config.type) {
            case 'chart':
                return <ChartWidget config={widget.config} />;
            case 'metric':
                return <MetricWidget config={widget.config} />;
            case 'text':
                return <TextWidget config={widget.config} />;
            default:
                return <TableWidget config={widget.config} />;
        }
    };

    return (
        <Box sx={{ mt: 2 }}>
            {isEditing && (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Layout Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={handleAddMenuClick}
                        >
                            Add Widget
                        </Button>
                        <Menu
                            anchorEl={addMenuAnchor}
                            open={Boolean(addMenuAnchor)}
                            onClose={handleAddMenuClose}
                        >
                            {WIDGET_TYPES.map((widget) => (
                                <MenuItem 
                                    key={widget.type}
                                    onClick={() => addNewWidget(widget.type)}
                                >
                                    <ListItemIcon>
                                        {widget.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={widget.label} />
                                </MenuItem>
                            ))}
                        </Menu>
                    </Grid>
                </Grid>
            )}

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Paper sx={{ p: 2 }}>
                <ReactGridLayout
                    className="layout"
                    layout={layout}
                    cols={12}
                    rowHeight={30}
                    onLayoutChange={handleLayoutChange}
                    isDraggable={isEditing}
                    isResizable={isEditing}
                    draggableHandle=".drag-handle"
                >
                    {layout.map((item) => (
                        <div key={item.i}>
                            <Paper
                                sx={{
                                    height: '100%',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {isEditing && (
                                    <Box
                                        className="drag-handle"
                                        sx={{
                                            p: 1,
                                            cursor: 'move',
                                            borderBottom: '1px solid #eee',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Typography variant="subtitle2">
                                            {widgets.find(w => w.i === item.i)?.config?.title || 'Widget'}
                                        </Typography>
                                        <Box>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleCustomizeWidget(item.i)}
                                            >
                                                <Settings />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteWidget(item.i)}
                                                color="error"
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                )}
                                <Box sx={{ p: 1, height: isEditing ? 'calc(100% - 48px)' : '100%' }}>
                                    {renderWidget(item)}
                                </Box>
                            </Paper>
                        </div>
                    ))}
                </ReactGridLayout>
            </Paper>

            {isEditing && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                    >
                        Save Layout
                    </Button>
                </Box>
            )}

            <WidgetCustomizeDialog
                open={customizeDialogOpen}
                onClose={() => setCustomizeDialogOpen(false)}
                widget={selectedWidget}
                onSave={handleSaveWidgetCustomization}
            />
        </Box>
    );
};

export default LayoutBuilder; 