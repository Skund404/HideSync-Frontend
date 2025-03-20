// src/pages/MaterialRoutes.tsx
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import InventoryManagement from './InventoryManagement';
import MaterialsManagement from './MaterialsManagement';

const MaterialRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Ensure inventory is declared first or in a separate route if needed */}
      <Route path='inventory' element={<InventoryManagement />} />
      {/* Dynamic route for material types */}
      <Route path=':materialType' element={<MaterialsManagement />} />
    </Routes>
  );
};

export default MaterialRoutes;
