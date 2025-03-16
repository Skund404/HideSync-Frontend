// src/components/documentation/contextual/ContextHelpIntegration.tsx

import React from 'react';
import ContextHelpModal from './ContextHelpModal';
import { ContextHelpProvider } from './ContextHelpProvider';

/**
 * This component integrates all contextual help components.
 * It should be wrapped around the main application to provide
 * context-sensitive help throughout the app.
 */
const ContextHelpIntegration: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ContextHelpProvider>
      {children}
      {/* The modal is always included but only shown when triggered */}
      <ContextHelpModal />
    </ContextHelpProvider>
  );
};

export default ContextHelpIntegration;
