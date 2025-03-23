// src/pages/MaterialRoutes.tsx
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import InventoryManagement from './InventoryManagement';
import MaterialsManagement from './MaterialsManagement';

const MaterialRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Navigate to='/materials/leather' replace />} />
      <Route path='leather' element={<MaterialsManagement />} />
      <Route path='hardware' element={<MaterialsManagement />} />
      <Route path='supplies' element={<MaterialsManagement />} />
      <Route path='inventory' element={<InventoryManagement />} />
      {/* Add a catch-all route for '/inventory' */}
      <Route path='/inventory' element={<InventoryManagement />} />
    </Routes>
  );
};

export default MaterialRoutes;
