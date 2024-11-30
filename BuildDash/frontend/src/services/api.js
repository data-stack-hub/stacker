import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const fetchAllTables = async () => {
    try {
        const response = await axios.get(`${API_URL}/tables`);
        return response.data;
    } catch (error) {
        console.error('Error fetching tables:', error);
        throw error;
    }
};

export const fetchTableData = async (dbName, tableName) => {
    try {
        const response = await axios.get(`${API_URL}/tables/${dbName}/${tableName}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching table data:', error);
        throw error;
    }
};

export const fetchSchemaData = async () => {
    try {
        const response = await axios.get(`${API_URL}/schema`);
        return response.data;
    } catch (error) {
        console.error('Error fetching schema:', error);
        throw error;
    }
};

export const saveLayout = async (layoutData) => {
    try {
        const response = await axios.post(`${API_URL}/layouts`, layoutData);
        return response.data;
    } catch (error) {
        console.error('Error saving layout:', error.response?.data);
        throw error;
    }
};

export const getLayouts = async () => {
    try {
        const response = await axios.get(`${API_URL}/layouts`);
        return response.data;
    } catch (error) {
        console.error('Error fetching layouts:', error);
        throw error;
    }
};

export const getLayoutById = async (layoutId) => {
    try {
        const response = await axios.get(`${API_URL}/layouts/${layoutId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching layout by ID:', error);
        throw error;
    }
};

export const getLayoutByName = async (layoutName) => {
    try {
        const response = await axios.get(`${API_URL}/layouts/name/${layoutName}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching layout by name:', error);
        throw error;
    }
};

export const createLayout = async (layoutData) => {
    try {
        const response = await axios.post(`${API_URL}/layouts`, layoutData);
        return response.data;
    } catch (error) {
        console.error('Error creating layout:', error);
        throw error;
    }
};

export const updateLayout = async (layoutId, layoutData) => {
    try {
        const response = await axios.put(`${API_URL}/layouts/${layoutId}`, layoutData);
        return response.data;
    } catch (error) {
        console.error('Error updating layout:', error);
        throw error;
    }
};

export const deleteLayout = async (layoutId) => {
    try {
        const response = await axios.delete(`${API_URL}/layouts/${layoutId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting layout:', error);
        throw error;
    }
};

export const executeCustomQuery = async (dbName, query, params = {}) => {
    try {
        const response = await axios.post(`${API_URL}/tables/${dbName}/query`, {
            query,
            params
        });
        return response.data;
    } catch (error) {
        console.error('Error executing custom query:', error);
        throw error;
    }
};

export const getTableMetadata = async (dbName, tableName) => {
    try {
        const response = await axios.get(`${API_URL}/tables/${dbName}/${tableName}/metadata`);
        return response.data;
    } catch (error) {
        console.error('Error fetching table metadata:', error);
        throw error;
    }
};

export const getSchema = async () => {
    try {
        const response = await axios.get(`${API_URL}/tables/schema`);
        return response.data;
    } catch (error) {
        console.error('Error fetching schema:', error);
        throw error;
    }
}; 