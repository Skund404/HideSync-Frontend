// src/pages/PatternRoutes.tsx
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PatternDetailPage from './PatternDetailPage';
import PatternManagement from './PatternManagement';

const PatternRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path='/' element={<PatternManagement />} />
      <Route path='/:id' element={<PatternDetailPage />} />
    </Routes>
  );
};

export default PatternRoutes;
