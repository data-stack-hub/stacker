import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Typography,
    Tabs,
    Tab,
    Box,
    Switch,
    FormControlLabel,
    Divider,
    FormHelperText
} from '@mui/material';
import { executeCustomQuery, fetchAllTables, getTableMetadata } from '../services/api';

const TabPanel = ({ children, value, index, ...other }) => (
    <div
        role="tabpanel"
        hidden={value !== index}
        {...other}
    >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
);

const WidgetCustomizeDialog = ({ open, onClose, widget, onSave }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [config, setConfig] = useState({});
    const [databases, setDatabases] = useState([]);
    const [selectedDb, setSelectedDb] = useState('');
    const [tables, setTables] = useState([]);
    const [columns, setColumns] = useState([]);

    const generateQueryWithColumn = (operation, column) => {
        if (!config.table || !column) return '';
        
        switch (operation) {
            case 'average':
                return `SELECT AVG(${column}) as average FROM ${config.table}`;
            case 'max':
                return `SELECT MAX(${column}) as max_value FROM ${config.table}`;
            case 'min':
                return `SELECT MIN(${column}) as min_value FROM ${config.table}`;
            case 'sum':
                return `SELECT SUM(${column}) as total_sum FROM ${config.table}`;
            case 'distinct':
                return `SELECT COUNT(DISTINCT ${column}) as unique_count FROM ${config.table}`;
            default:
                return '';
        }
    };

    useEffect(() => {
        if (widget) {
            setConfig(widget.config || {});
            if (widget.config?.database) {
                setSelectedDb(widget.config.database);
                loadTablesForDatabase(widget.config.database);
            }
        }
        loadDatabases();
    }, [widget]);

    const loadDatabases = async () => {
        try {
            const tablesData = await fetchAllTables();
            setDatabases(Object.keys(tablesData));
        } catch (error) {
            console.error('Error loading databases:', error);
        }
    };

    const loadTablesForDatabase = async (dbName) => {
        try {
            const tablesData = await fetchAllTables();
            setTables(tablesData[dbName] || []);
        } catch (error) {
            console.error('Error loading tables:', error);
        }
    };

    const loadColumnsForTable = async (dbName, tableName) => {
        try {
            const metadata = await getTableMetadata(dbName, tableName);
            setColumns(metadata.columns.map(col => col.name));
        } catch (error) {
            console.error('Error loading columns:', error);
        }
    };

    const handleDatabaseChange = async (e) => {
        const dbName = e.target.value;
        setSelectedDb(dbName);
        setConfig({ ...config, database: dbName, table: '', columns: [] });
        await loadTablesForDatabase(dbName);
    };

    const handleTableChange = async (e) => {
        const tableName = e.target.value;
        setConfig({ ...config, table: tableName, columns: [] });
        if (selectedDb && tableName) {
            await loadColumnsForTable(selectedDb, tableName);
        }
    };

    const handleSave = () => {
        onSave(widget.i, config);
        onClose();
    };

    const handleBuiltInQueryChange = (e) => {
        const operation = e.target.value;
        let query = '';

        switch (operation) {
            case 'rowCount':
                query = `SELECT COUNT(*) as total FROM ${config.table}`;
                break;
            case 'dbSize':
                query = `SELECT pg_size_pretty(pg_database_size('${config.database}')) as db_size`;
                break;
            case 'tableSize':
                query = `SELECT pg_size_pretty(pg_total_relation_size('${config.table}')) as table_size`;
                break;
            case 'average':
            case 'max':
            case 'sum':
                // Clear query until column is selected
                query = '';
                break;
            default:
                query = '';
        }

        setConfig({ 
            ...config, 
            builtInQuery: operation,
            query,
            selectedColumn: '' // Reset selected column when changing operation
        });
    };

    const renderTableWidgetSettings = () => (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel>Database</InputLabel>
                        <Select
                            value={config.database || ''}
                            onChange={handleDatabaseChange}
                        >
                            {databases.map(db => (
                                <MenuItem key={db} value={db}>{db}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel>Table</InputLabel>
                        <Select
                            value={config.table || ''}
                            onChange={handleTableChange}
                            disabled={!config.database}
                        >
                            {tables.map(table => (
                                <MenuItem key={table} value={table}>{table}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel>Columns</InputLabel>
                        <Select
                            multiple
                            value={config.columns || []}
                            onChange={(e) => setConfig({ ...config, columns: e.target.value })}
                            disabled={!config.table}
                        >
                            {columns.map(column => (
                                <MenuItem key={column} value={column}>{column}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        type="number"
                        label="Auto-refresh Interval (seconds)"
                        value={config.refreshInterval || ''}
                        onChange={(e) => setConfig({ 
                            ...config, 
                            refreshInterval: parseInt(e.target.value) || 0 
                        })}
                        inputProps={{ min: 0 }}
                        helperText="Set to 0 to disable auto-refresh"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        type="number"
                        label="Page Size"
                        value={config.pageSize || 10}
                        onChange={(e) => setConfig({ 
                            ...config, 
                            pageSize: parseInt(e.target.value) || 10 
                        })}
                        inputProps={{ min: 1 }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={config.pagination || false}
                                onChange={(e) => setConfig({ 
                                    ...config, 
                                    pagination: e.target.checked 
                                })}
                            />
                        }
                        label="Enable Pagination"
                    />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                        Visual Settings
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                </Grid>

                {/* Table Style */}
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel>Table Size</InputLabel>
                        <Select
                            value={config.tableSize || 'small'}
                            onChange={(e) => setConfig({ 
                                ...config, 
                                tableSize: e.target.value 
                            })}
                        >
                            <MenuItem value="small">Small</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel>Table Density</InputLabel>
                        <Select
                            value={config.density || 'standard'}
                            onChange={(e) => setConfig({ 
                                ...config, 
                                density: e.target.value 
                            })}
                        >
                            <MenuItem value="compact">Compact</MenuItem>
                            <MenuItem value="standard">Standard</MenuItem>
                            <MenuItem value="comfortable">Comfortable</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                {/* Header Style */}
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Header Background Color"
                        type="color"
                        value={config.headerBgColor || '#f5f5f5'}
                        onChange={(e) => setConfig({
                            ...config,
                            headerBgColor: e.target.value
                        })}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Header Text Color"
                        type="color"
                        value={config.headerTextColor || '#000000'}
                        onChange={(e) => setConfig({
                            ...config,
                            headerTextColor: e.target.value
                        })}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                {/* Row Style */}
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Row Background Color"
                        type="color"
                        value={config.rowBgColor || '#ffffff'}
                        onChange={(e) => setConfig({
                            ...config,
                            rowBgColor: e.target.value
                        })}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Alternate Row Color"
                        type="color"
                        value={config.alternateRowColor || '#fafafa'}
                        onChange={(e) => setConfig({
                            ...config,
                            alternateRowColor: e.target.value
                        })}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                {/* Border Style */}
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel>Border Style</InputLabel>
                        <Select
                            value={config.borderStyle || 'solid'}
                            onChange={(e) => setConfig({ 
                                ...config, 
                                borderStyle: e.target.value 
                            })}
                        >
                            <MenuItem value="none">None</MenuItem>
                            <MenuItem value="solid">Solid</MenuItem>
                            <MenuItem value="dashed">Dashed</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Border Color"
                        type="color"
                        value={config.borderColor || '#e0e0e0'}
                        onChange={(e) => setConfig({
                            ...config,
                            borderColor: e.target.value
                        })}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                {/* Add this before the border style settings */}
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        type="number"
                        label="Max Height (px)"
                        value={config.maxHeight || 400}
                        onChange={(e) => setConfig({ 
                            ...config, 
                            maxHeight: parseInt(e.target.value) || 400 
                        })}
                        inputProps={{ min: 100, step: 50 }}
                        helperText="Table container height in pixels"
                    />
                </Grid>
            </Grid>
        </>
    );

    const renderChartWidgetSettings = () => (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel>Chart Type</InputLabel>
                        <Select
                            value={config.chartType || 'bar'}
                            onChange={(e) => setConfig({ ...config, chartType: e.target.value })}
                        >
                            <MenuItem value="bar">Bar Chart</MenuItem>
                            <MenuItem value="line">Line Chart</MenuItem>
                            <MenuItem value="pie">Pie Chart</MenuItem>
                            <MenuItem value="doughnut">Doughnut Chart</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Data Query"
                        multiline
                        rows={4}
                        value={config.query || ''}
                        onChange={(e) => setConfig({ ...config, query: e.target.value })}
                        helperText="Enter SQL query for chart data"
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={config.showLegend || false}
                                onChange={(e) => setConfig({ ...config, showLegend: e.target.checked })}
                            />
                        }
                        label="Show Legend"
                    />
                </Grid>
            </Grid>
        </>
    );

    const renderMetricWidgetSettings = () => (
        <>
            <Grid container spacing={2}>
                {/* Database Selection */}
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel>Database</InputLabel>
                        <Select
                            value={config.database || ''}
                            onChange={(e) => {
                                const dbName = e.target.value;
                                setConfig({ 
                                    ...config, 
                                    database: dbName,
                                    table: '', // Clear table when database changes
                                    query: '' // Clear query when database changes
                                });
                                loadTablesForDatabase(dbName);
                            }}
                        >
                            {databases.map(db => (
                                <MenuItem key={db} value={db}>{db}</MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>Select database for the metric query</FormHelperText>
                    </FormControl>
                </Grid>

                {/* Table Selection */}
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel>Table</InputLabel>
                        <Select
                            value={config.table || ''}
                            onChange={(e) => {
                                const tableName = e.target.value;
                                setConfig({ 
                                    ...config, 
                                    table: tableName,
                                    query: '' // Clear query when table changes
                                });
                                if (config.database && tableName) {
                                    loadColumnsForTable(config.database, tableName);
                                }
                            }}
                            disabled={!config.database}
                        >
                            {tables.map(table => (
                                <MenuItem key={table} value={table}>{table}</MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>Select table for the metric query</FormHelperText>
                    </FormControl>
                </Grid>

                {/* Built-in Query Selection */}
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel>Built-in Query</InputLabel>
                        <Select
                            value={config.builtInQuery || ''}
                            onChange={handleBuiltInQueryChange}
                            disabled={!config.database || !config.table}
                        >
                            <MenuItem value="">Custom Query</MenuItem>
                            <MenuItem value="rowCount">Row Count</MenuItem>
                            <MenuItem value="average">Average</MenuItem>
                            <MenuItem value="max">Max</MenuItem>
                            <MenuItem value="sum">Sum</MenuItem>
                            <MenuItem value="dbSize">Database Size</MenuItem>
                            <MenuItem value="tableSize">Table Size</MenuItem>
                        </Select>
                        <FormHelperText>Select a built-in query or write your own</FormHelperText>
                    </FormControl>
                </Grid>

                {/* Column Selection for Aggregate Functions */}
                {['average', 'max', 'min', 'sum', 'distinct'].includes(config.builtInQuery) && (
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Column</InputLabel>
                            <Select
                                value={config.selectedColumn || ''}
                                onChange={(e) => {
                                    const column = e.target.value;
                                    const newQuery = generateQueryWithColumn(config.builtInQuery, column);
                                    setConfig({ 
                                        ...config, 
                                        selectedColumn: column,
                                        query: newQuery
                                    });
                                }}
                            >
                                {columns.map(column => (
                                    <MenuItem key={column} value={column}>{column}</MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>Select column for the operation</FormHelperText>
                        </FormControl>
                    </Grid>
                )}

                {/* Custom Query Input */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Metric Query"
                        multiline
                        rows={4}
                        value={config.query || ''}
                        onChange={(e) => setConfig({ ...config, query: e.target.value })}
                        helperText="Enter SQL query that returns a single value"
                        disabled={!config.database}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">
                        Example: SELECT COUNT(*) as total FROM table_name
                    </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Prefix"
                        value={config.prefix || ''}
                        onChange={(e) => setConfig({ ...config, prefix: e.target.value })}
                        helperText="e.g., $, €, £"
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Suffix"
                        value={config.suffix || ''}
                        onChange={(e) => setConfig({ ...config, suffix: e.target.value })}
                        helperText="e.g., %, pts"
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        type="number"
                        label="Decimal Places"
                        value={config.decimals || 0}
                        onChange={(e) => setConfig({ ...config, decimals: parseInt(e.target.value) || 0 })}
                        inputProps={{ min: 0, max: 10 }}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        type="number"
                        label="Auto-refresh Interval (seconds)"
                        value={config.refreshInterval || ''}
                        onChange={(e) => setConfig({ 
                            ...config, 
                            refreshInterval: parseInt(e.target.value) || 0 
                        })}
                        inputProps={{ min: 0 }}
                        helperText="Set to 0 to disable auto-refresh"
                    />
                </Grid>

                <Grid item xs={12}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={config.showTrend || false}
                                onChange={(e) => setConfig({ ...config, showTrend: e.target.checked })}
                            />
                        }
                        label="Show Trend Indicator"
                    />
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                        Visual Settings
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Font Size"
                        type="number"
                        value={config.fontSize?.replace('rem', '') || 2.5}
                        onChange={(e) => setConfig({ 
                            ...config, 
                            fontSize: `${e.target.value}rem` 
                        })}
                        inputProps={{ step: 0.1, min: 1, max: 5 }}
                        helperText="Value in rem units"
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel>Title Variant</InputLabel>
                        <Select
                            value={config.titleVariant || 'h6'}
                            onChange={(e) => setConfig({ ...config, titleVariant: e.target.value })}
                        >
                            <MenuItem value="h4">Extra Large</MenuItem>
                            <MenuItem value="h5">Large</MenuItem>
                            <MenuItem value="h6">Medium</MenuItem>
                            <MenuItem value="subtitle1">Small</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Text Color"
                        type="color"
                        value={config.textColor || '#000000'}
                        onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Background Color"
                        type="color"
                        value={config.backgroundColor || '#ffffff'}
                        onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                <Grid item xs={12}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={config.showBorder || false}
                                onChange={(e) => setConfig({ ...config, showBorder: e.target.checked })}
                            />
                        }
                        label="Show Border"
                    />
                </Grid>

                {config.showBorder && (
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Border Color"
                            type="color"
                            value={config.borderColor || '#e0e0e0'}
                            onChange={(e) => setConfig({ ...config, borderColor: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                )}
            </Grid>
        </>
    );

    const renderTextWidgetSettings = () => (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Content"
                    multiline
                    rows={4}
                    value={config.content || ''}
                    onChange={(e) => setConfig({ ...config, content: e.target.value })}
                    helperText="Supports markdown formatting"
                />
            </Grid>
            
            {/* Text Styling */}
            <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                    <InputLabel>Text Alignment</InputLabel>
                    <Select
                        value={config.textAlignment || 'left'}
                        onChange={(e) => setConfig({ ...config, textAlignment: e.target.value })}
                    >
                        <MenuItem value="left">Left</MenuItem>
                        <MenuItem value="center">Center</MenuItem>
                        <MenuItem value="right">Right</MenuItem>
                        <MenuItem value="justify">Justify</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                    <InputLabel>Font Size</InputLabel>
                    <Select
                        value={config.fontSize || 'medium'}
                        onChange={(e) => setConfig({ ...config, fontSize: e.target.value })}
                    >
                        <MenuItem value="small">Small</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="large">Large</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            {/* Title Styling */}
            <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                    <InputLabel>Title Variant</InputLabel>
                    <Select
                        value={config.titleVariant || 'h6'}
                        onChange={(e) => setConfig({ ...config, titleVariant: e.target.value })}
                    >
                        <MenuItem value="h4">Extra Large</MenuItem>
                        <MenuItem value="h5">Large</MenuItem>
                        <MenuItem value="h6">Medium</MenuItem>
                        <MenuItem value="subtitle1">Small</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Title Font Weight"
                    type="number"
                    inputProps={{ min: 300, max: 900, step: 100 }}
                    value={config.style?.titleFontWeight || 500}
                    onChange={(e) => setConfig({
                        ...config,
                        style: { ...config.style, titleFontWeight: e.target.value }
                    })}
                />
            </Grid>

            {/* Colors */}
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Text Color"
                    type="color"
                    value={config.textColor || '#000000'}
                    onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>

            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Background Color"
                    type="color"
                    value={config.backgroundColor || '#ffffff'}
                    onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>

            {/* Layout */}
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Padding"
                    type="number"
                    inputProps={{ min: 0, max: 5 }}
                    value={config.padding || 2}
                    onChange={(e) => setConfig({ ...config, padding: Number(e.target.value) })}
                />
            </Grid>

            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Line Height"
                    type="number"
                    inputProps={{ min: 1, max: 3, step: 0.1 }}
                    value={config.style?.lineHeight || 1.5}
                    onChange={(e) => setConfig({
                        ...config,
                        style: { ...config.style, lineHeight: Number(e.target.value) }
                    })}
                />
            </Grid>

            {/* Appearance */}
            <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                    <InputLabel>Elevation</InputLabel>
                    <Select
                        value={config.elevation || 0}
                        onChange={(e) => setConfig({ ...config, elevation: e.target.value })}
                    >
                        {[0, 1, 2, 3, 4, 5].map(value => (
                            <MenuItem key={value} value={value}>
                                {value === 0 ? 'None' : `Level ${value}`}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            {/* Border Options */}
            <Grid item xs={12}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={config.showBorder || false}
                            onChange={(e) => setConfig({ ...config, showBorder: e.target.checked })}
                        />
                    }
                    label="Show Border"
                />
            </Grid>

            {config.showBorder && (
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Border Color"
                        type="color"
                        value={config.borderColor || '#e0e0e0'}
                        onChange={(e) => setConfig({ ...config, borderColor: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>
            )}
        </Grid>
    );

    const renderWidgetSettings = () => {
        switch (config.type) {
            case 'table':
                return renderTableWidgetSettings();
            case 'chart':
                return renderChartWidgetSettings();
            case 'metric':
                return renderMetricWidgetSettings();
            case 'text':
                return renderTextWidgetSettings();
            default:
                return <Typography>Unknown widget type</Typography>;
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Customize {config.type?.charAt(0).toUpperCase() + config.type?.slice(1)} Widget
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Widget Title"
                            value={config.title || ''}
                            onChange={(e) => setConfig({ ...config, title: e.target.value })}
                            margin="normal"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Widget Settings
                        </Typography>
                        {renderWidgetSettings()}
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} color="primary">
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default WidgetCustomizeDialog; 