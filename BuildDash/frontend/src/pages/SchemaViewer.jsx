import React, { useEffect, useState } from 'react';
import ReactFlow, { 
    Background, 
    Controls,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { fetchSchemaData } from '../services/api'; // Assuming this is correctly set up
import { 
    Box, 
    Typography, 
    CircularProgress, 
    Switch,
    FormControlLabel,
} from '@mui/material';

const SchemaViewer = () => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showColumnTypes, setShowColumnTypes] = useState(true);
    const [showForeignKeys, setShowForeignKeys] = useState(true);

    useEffect(() => {
        const loadSchema = async () => {
            try {
                const data = await fetchSchemaData(); // Fetch schema data from the backend
                console.log("Fetched schema data:", data); // Debug: log the data
                
                const { nodes: schemaNodes, edges: schemaEdges } = processSchemaData(data);
                setNodes(schemaNodes);
                setEdges(schemaEdges);
            } catch (error) {
                console.error('Error loading schema:', error);
            } finally {
                setLoading(false);
            }
        };

        loadSchema();
    }, [showColumnTypes, showForeignKeys]); // Depend on these values to re-fetch the data

    const processSchemaData = (schema) => {
        const nodes = [];
        const edges = [];

        Object.entries(schema).forEach(([dbName, tables]) => {
            Object.entries(tables).forEach(([tableName, tableData]) => {
                const tableId = `${dbName}-${tableName}`;
                const position = { x: Math.random() * 1000, y: Math.random() * 1000 }; // Random position for demo
                
                // Create nodes
                nodes.push({
                    id: tableId,
                    position: position,
                    data: {
                        label: (
                            <div className="table-node">
                                <div className="table-header">
                                    {tableName}
                                </div>
                                <div className="table-columns">
                                    {tableData.columns.map((col, i) => (
                                        <div key={i} className={`table-column ${col.is_primary_key ? 'primary-key' : ''}`}>
                                            <span className="column-name">
                                                {col.is_primary_key && '🔑 '}
                                                {col.name}
                                            </span>
                                            {showColumnTypes && (
                                                <span className="column-type">
                                                    {col.type}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ),
                    },
                    style: {
                        background: '#fff',
                        border: '1px solid #2d3748',
                        borderRadius: '5px',
                        padding: 0,
                        width: 200,
                    }
                });

                // Create edges if showing foreign keys
                if (showForeignKeys && tableData.relationships) {
                    tableData.relationships.forEach((rel) => {
                        edges.push({
                            id: `${tableId}-${rel.to_table}-${rel.from_column}`,
                            source: tableId,
                            target: `${dbName}-${rel.to_table}`,
                            type: 'smoothstep', // Use smoothstep for better curves
                            style: { 
                                stroke: '#4a5568', 
                                strokeWidth: 1,
                            },
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                width: 12,
                                height: 12,
                                color: '#4a5568',
                            },
                        });
                    });
                }
            });
        });

        return { nodes, edges };
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100vh', width: '100vw' }}>
            <Typography variant="h4" gutterBottom>
                Database Schema
            </Typography>
            <Box sx={{ height: 'calc(100vh - 100px)', border: '1px solid #ddd', overflow: 'auto' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    fitView={false} // Disable fit view to allow scrolling
                    minZoom={0.1}
                    maxZoom={2}
                    defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    elementsSelectable={true}
                    panOnScroll={true}
                    zoomOnScroll={true}
                >
                    <Background color="#aaa" gap={20} size={1} variant="dots" />
                    <Controls showInteractive={false} />
                </ReactFlow>
            </Box>

            <style jsx>{`
                .table-node {
                    font-family: 'Roboto', sans-serif;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .table-header {
                    background-color: #2d3748;
                    color: white;
                    padding: 8px 12px;
                    font-weight: bold;
                    border-top-left-radius: 4px;
                    border-top-right-radius: 4px;
                    font-size: 13px;
                    text-align: center;
                }
                .table-columns {
                    padding: 8px 0;
                    max-height: 300px;
                    overflow-y: auto;
                    background-color: white;
                }
                .table-column {
                    padding: 4px 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #e2e8f0;
                    font-size: 12px;
                }
                .column-name {
                    font-weight: 500;
                }
                .column-type {
                    color: #718096;
                    font-size: 0.85em;
                    padding-left: 8px;
                }
                .primary-key {
                    background-color: #f7fafc;
                }
            `}</style>
        </Box>
    );
};

export default SchemaViewer;
