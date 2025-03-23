// src/components/documentation/contextual/ContextHelpProvider.tsx
import { getContextualHelp } from '@/services/documentation-service';
import { DocumentationResource } from '@/types/documentationTypes';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface ContextHelpState {
  isVisible: boolean;
  contextKey: string | null;
  targetSelector: string;
  position: 'top' | 'right' | 'bottom' | 'left';
  resources: DocumentationResource[];
  loading: boolean;
  error: string | null;
  recentlyViewed: string[];
}

export interface ContextHelpContextType {
  showHelp: (
    contextKey: string,
    targetSelector?: string,
    position?: 'top' | 'right' | 'bottom' | 'left'
  ) => void;
  closeHelp: () => void;
  resources: DocumentationResource[];
  loading: boolean;
  error: string | null;
  recentlyViewed: string[];
}

const initialState: ContextHelpState = {
  isVisible: false,
  contextKey: null,
  targetSelector: 'body',
  position: 'right',
  resources: [],
  loading: false,
  error: null,
  recentlyViewed: [],
};

const ContextHelpContext = createContext<ContextHelpContextType | undefined>(
  undefined
);

export const useContextHelp = (): ContextHelpContextType => {
  const context = useContext(ContextHelpContext);
  if (!context) {
    throw new Error('useContextHelp must be used within a ContextHelpProvider');
  }
  return context;
};

interface ContextHelpProviderProps {
  children: ReactNode;
  maxRecentlyViewed?: number;
}

export const ContextHelpProvider: React.FC<ContextHelpProviderProps> = ({
  children,
  maxRecentlyViewed = 5,
}) => {
  const [helpState, setHelpState] = useState<ContextHelpState>(initialState);

  const loadContextualHelp = useCallback(
    async (key: string) => {
      setHelpState((prevState) => ({
        ...prevState,
        loading: true,
        error: null,
      }));

      try {
        const resources = await getContextualHelp(key);
        setHelpState((prevState) => {
          const recentlyViewed = [
            key,
            ...prevState.recentlyViewed.filter((k) => k !== key),
          ].slice(0, maxRecentlyViewed);
          return {
            ...prevState,
            resources,
            loading: false,
            error: null,
            recentlyViewed,
          };
        });
      } catch (error: any) {
        setHelpState((prevState) => ({
          ...prevState,
          loading: false,
          error: error.message || 'Failed to load contextual help',
        }));
      }
    },
    [maxRecentlyViewed]
  );

  const showHelp = useCallback(
    (
      contextKey: string,
      targetSelector: string = 'body',
      position: 'top' | 'right' | 'bottom' | 'left' = 'right'
    ) => {
      setHelpState((prevState) => ({
        ...prevState,
        isVisible: true,
        contextKey,
        targetSelector,
        position,
      }));
      loadContextualHelp(contextKey);
    },
    [loadContextualHelp]
  );

  const closeHelp = useCallback(() => {
    setHelpState((prevState) => ({ ...prevState, isVisible: false }));
  }, []);

  // Load user's recently viewed help from localStorage on mount
  useEffect(() => {
    try {
      const storedRecent = localStorage.getItem('contextHelpRecentlyViewed');
      if (storedRecent) {
        const parsed = JSON.parse(storedRecent);
        if (Array.isArray(parsed)) {
          setHelpState((prev) => ({ ...prev, recentlyViewed: parsed }));
        }
      }
    } catch (err) {
      console.error(
        'Failed to load recently viewed help from localStorage:',
        err
      );
    }
  }, []);

  // Save recently viewed to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(
        'contextHelpRecentlyViewed',
        JSON.stringify(helpState.recentlyViewed)
      );
    } catch (err) {
      console.error(
        'Failed to save recently viewed help to localStorage:',
        err
      );
    }
  }, [helpState.recentlyViewed]);

  return (
    <ContextHelpContext.Provider
      value={{
        showHelp,
        closeHelp,
        resources: helpState.resources,
        loading: helpState.loading,
        error: helpState.error,
        recentlyViewed: helpState.recentlyViewed,
      }}
    >
      {children}
      {/*  The overlay can be rendered conditionally within the provider or in the parent component, but not both */}
      {/* {helpState.isVisible && (
        <ContextHelpOverlay
          targetSelector={helpState.targetSelector}
          contextKey={helpState.contextKey}
          position={helpState.position}
          isVisible={helpState.isVisible}
          onClose={closeHelp}
          resources={helpState.resources}
          loading={helpState.loading}
          error={helpState.error}
        />
      )} */}
    </ContextHelpContext.Provider>
  );
};

export default ContextHelpProvider;
