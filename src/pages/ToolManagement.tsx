// src/pages/ToolManagement.tsx
import React from 'react';
// Change to default import
import ToolManagementView from '@/components/tools/ToolManagementView';
import { ToolProvider } from '@/context/ToolContext';

const ToolManagement: React.FC = () => {
  return (
    <ToolProvider>
      <ToolManagementView />
    </ToolProvider>
  );
};

export default ToolManagement;
