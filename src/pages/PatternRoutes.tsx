// src/pages/PatternRoutes.tsx
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PatternDetailPage from './PatternDetailPage';
import PatternManagement from './PatternManagement';
import PatternFormPage from './PatternFormPage';
import PatternDebug from './PatternDebug';

const PatternRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path='/' element={<PatternManagement />} />
      <Route path='/new' element={<PatternFormPage />} />
      <Route path='/edit/:id' element={<PatternFormPage />} />
      <Route path='/:id' element={<PatternDetailPage />} />
      <Route path='/debug' element={<PatternDebug />} />
    </Routes>
  );
};

export default PatternRoutes;