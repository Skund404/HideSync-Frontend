// src/components/documentation/contextual/ContextHelpProvider.tsx

import React, { createContext, useContext, useState } from 'react';
import { useDocumentation } from '../../../context/DocumentationContext';
import { DocumentationResource } from '../../../types/documentationTypes';

interface ContextHelpState {
  isHelpVisible: boolean;
  currentContextKey: string | null;
  helpResources: DocumentationResource[];
}

interface ContextHelpContextProps extends ContextHelpState {
  showHelp: (contextKey: string) => void;
  hideHelp: () => void;
  getContextualHelp: (contextKey: string) => Promise<DocumentationResource[]>;
}

const ContextHelpContext = createContext<ContextHelpContextProps | undefined>(
  undefined
);

export const ContextHelpProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { getContextualHelp } = useDocumentation();
  const [state, setState] = useState<ContextHelpState>({
    isHelpVisible: false,
    currentContextKey: null,
    helpResources: [],
  });

  const showHelp = async (contextKey: string) => {
    try {
      // Fetch contextual help resources for this key
      const resources = await getContextualHelp(contextKey);

      setState({
        isHelpVisible: true,
        currentContextKey: contextKey,
        helpResources: resources,
      });
    } catch (error) {
      console.error('Error fetching contextual help:', error);
    }
  };

  const hideHelp = () => {
    setState((prev) => ({
      ...prev,
      isHelpVisible: false,
    }));
  };

  return (
    <ContextHelpContext.Provider
      value={{
        ...state,
        showHelp,
        hideHelp,
        getContextualHelp,
      }}
    >
      {children}
    </ContextHelpContext.Provider>
  );
};

export const useContextHelp = () => {
  const context = useContext(ContextHelpContext);
  if (context === undefined) {
    throw new Error('useContextHelp must be used within a ContextHelpProvider');
  }
  return context;
};
