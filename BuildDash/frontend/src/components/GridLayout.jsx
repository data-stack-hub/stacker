import React, { useState, useEffect } from 'react';
import RGL, { WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { fetchAllTables } from '../services/api';
import TableDisplay from './TableDisplay';
import { Typography } from '@mui/material';

const ReactGridLayout = WidthProvider(RGL);

const GridLayout = () => {
    const [tables, setTables] = useState({});
    const [layout, setLayout] = useState([]);

    useEffect(() => {
        const loadTables = async () => {
            try {
                const data = await fetchAllTables();
                setTables(data);
                
                // Create layout for each table
                let newLayout = [];
                let y = 0;
                
                Object.entries(data).forEach(([dbName, tableList]) => {
                    tableList.forEach((table, index) => {
                        newLayout.push({
                            i: `${dbName}-${table}`,
                            x: index % 2,
                            y: y,
                            w: 1,
                            h: 1,
                            minW: 1,
                            minH: 1
                        });
                        y += 1;
                    });
                });
                
                setLayout(newLayout);
            } catch (error) {
                console.error('Error loading tables:', error);
            }
        };

        loadTables();
    }, []);

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Database Tables
            </Typography>
            <ReactGridLayout
                className="layout"
                layout={layout}
                cols={2}
                rowHeight={300}
                width={1200}
            >
                {Object.entries(tables).map(([dbName, tableList]) =>
                    tableList.map(table => (
                        <div key={`${dbName}-${table}`}>
                            <TableDisplay
                                dbName={dbName}
                                tableName={table}
                            />
                        </div>
                    ))
                )}
            </ReactGridLayout>
        </div>
    );
};

export default GridLayout; 