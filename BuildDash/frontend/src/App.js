import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/Layout/DashboardLayout';
import GridLayout from './components/GridLayout';
import Dashboard from './pages/Dashboard';
import LayoutBuilder from './components/LayoutBuilder';
import SavedLayout from './pages/SavedLayout';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tables" element={<GridLayout />} />
          <Route path="/builder" element={<LayoutBuilder isEditing={true} />} />
          <Route path="/layout/:layoutId" element={<SavedLayout isEditing={false} />} />
          <Route path="/layout/:layoutId/edit" element={<SavedLayout isEditing={true} />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
}

export default App;
