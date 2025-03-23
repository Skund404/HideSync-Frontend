// src/context/IntegrationsContext.tsx
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { SalesChannel } from '../types/salesTypes';
import {
  PlatformIntegration,
  SyncEvent,
  getIntegrations,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  syncOrders,
  generateAuthUrl,
  exchangeAuthCode,
  testIntegrationConnection,
  OAuthConfig,
} from '../services/integrations/integration-service';
import { ApiError } from '../services/api-client';

// Define the shape of our context
interface IntegrationsContextType {
  integrations: PlatformIntegration[];
  isLoading: boolean;
  error: string | null;
  syncStatus: Record<
    string,
    {
      isSyncing: boolean;
      lastSynced: Date | null;
      error: string | null;
    }
  >;
  connectPlatform: (
    platform: SalesChannel,
    config: Partial<PlatformIntegration>
  ) => Promise<PlatformIntegration | null>;
  disconnectPlatform: (integrationId: string) => Promise<boolean>;
  syncPlatform: (integrationId: string) => Promise<void>;
  generateAuthUrl: (
    platform: SalesChannel,
    redirectUri: string,
    scopes: string[]
  ) => Promise<string | null>;
  handleAuthCallback: (
    platform: SalesChannel,
    code: string,
    redirectUri: string
  ) => Promise<boolean>;
  testConnection: (integrationId: string) => Promise<boolean>;
  refreshIntegrations: () => Promise<void>;
}

// Create the initial context value
const initialContext: IntegrationsContextType = {
  integrations: [],
  isLoading: true,
  error: null,
  syncStatus: {},
  connectPlatform: async () => null,
  disconnectPlatform: async () => false,
  syncPlatform: async () => {},
  generateAuthUrl: async () => null,
  handleAuthCallback: async () => false,
  testConnection: async () => false,
  refreshIntegrations: async () => {},
};

// Create the context
const IntegrationsContext =
  createContext<IntegrationsContextType>(initialContext);

// Create a provider component
export const IntegrationsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [integrations, setIntegrations] = useState<PlatformIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<
    Record<
      string,
      {
        isSyncing: boolean;
        lastSynced: Date | null;
        error: string | null;
      }
    >
  >({});

  // Initialize the context
  useEffect(() => {
    loadIntegrations();
  }, []);

  // Load integrations from the API
  const loadIntegrations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const fetchedIntegrations = await getIntegrations();
      setIntegrations(fetchedIntegrations);

      // Initialize sync status for each integration
      const initialSyncStatus: Record<
        string,
        {
          isSyncing: boolean;
          lastSynced: Date | null;
          error: string | null;
        }
      > = {};

      fetchedIntegrations.forEach((integration) => {
        initialSyncStatus[integration.id] = {
          isSyncing: false,
          lastSynced: integration.lastSyncAt || null,
          error: null,
        };
      });

      setSyncStatus(initialSyncStatus);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load integrations');
      console.error('Error loading integrations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh integrations data
  const refreshIntegrations = async () => {
    await loadIntegrations();
  };

  // Connect a platform
  const connectPlatform = async (
    platform: SalesChannel,
    config: Partial<PlatformIntegration>
  ): Promise<PlatformIntegration | null> => {
    try {
      setError(null);
      
      // Ensure the platform field is set
      const integrationData: Partial<PlatformIntegration> = {
        ...config,
        platform,
        active: true,
      };
      
      // Create the integration
      const newIntegration = await createIntegration(integrationData);
      
      // Update the state
      setIntegrations((prev) => [...prev, newIntegration]);

      // Initialize sync status for the new integration
      setSyncStatus((prev) => ({
        ...prev,
        [newIntegration.id]: {
          isSyncing: false,
          lastSynced: null,
          error: null,
        },
      }));

      return newIntegration;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || `Error connecting ${platform}`);
      console.error(`Error connecting ${platform}:`, err);
      return null;
    }
  };

  // Disconnect a platform
  const disconnectPlatform = async (integrationId: string): Promise<boolean> => {
    try {
      setError(null);
      
      // Delete the integration
      await deleteIntegration(integrationId);
      
      // Update the state
      setIntegrations((prev) => 
        prev.filter((integration) => integration.id !== integrationId)
      );

      // Update sync status
      setSyncStatus((prev) => {
        const newStatus = { ...prev };
        delete newStatus[integrationId];
        return newStatus;
      });

      return true;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || `Error disconnecting integration ${integrationId}`);
      console.error(`Error disconnecting integration ${integrationId}:`, err);
      return false;
    }
  };

  // Sync a platform
  const syncPlatform = async (integrationId: string) => {
    try {
      // Update sync status to indicate syncing
      setSyncStatus((prev) => ({
        ...prev,
        [integrationId]: {
          ...prev[integrationId],
          isSyncing: true,
          error: null,
        },
      }));

      // Sync orders from the platform
      const syncEvent = await syncOrders(integrationId);

      // Update the integration's lastSyncAt in state
      setIntegrations((prev) =>
        prev.map((integration) =>
          integration.id === integrationId
            ? { ...integration, lastSyncAt: syncEvent.created_at }
            : integration
        )
      );

      // Update sync status to indicate success
      setSyncStatus((prev) => ({
        ...prev,
        [integrationId]: {
          isSyncing: false,
          lastSynced: syncEvent.created_at,
          error: null,
        },
      }));

      console.log(`Synced ${syncEvent.items_processed} orders from integration ${integrationId}`);
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || `Error syncing integration ${integrationId}`;
      
      // Update sync status to indicate error
      setSyncStatus((prev) => ({
        ...prev,
        [integrationId]: {
          ...prev[integrationId],
          isSyncing: false,
          error: errorMessage,
        },
      }));

      console.error(`Error syncing integration ${integrationId}:`, err);
    }
  };

  // Generate an OAuth URL for a platform
  const generatePlatformAuthUrl = async (
    platform: SalesChannel,
    redirectUri: string,
    scopes: string[]
  ): Promise<string | null> => {
    try {
      setError(null);
      
      const config: OAuthConfig = {
        platform,
        clientId: '', // Will be retrieved from backend
        clientSecret: '', // Will be retrieved from backend
        redirectUri,
        scopes,
        state: platform, // Use platform as state
      };
      
      const url = await generateAuthUrl(config);
      return url;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || `Error generating auth URL for ${platform}`);
      console.error(`Error generating auth URL for ${platform}:`, err);
      return null;
    }
  };

  // Handle OAuth callback
  const handleAuthCallback = async (
    platform: SalesChannel,
    code: string,
    redirectUri: string
  ): Promise<boolean> => {
    try {
      setError(null);
      
      // Exchange auth code for access token
      const integration = await exchangeAuthCode(platform, code, redirectUri);
      
      // Update integrations list
      setIntegrations((prev) => [...prev, integration]);
      
      // Initialize sync status for the new integration
      setSyncStatus((prev) => ({
        ...prev,
        [integration.id]: {
          isSyncing: false,
          lastSynced: integration.lastSyncAt || null,
          error: null,
        },
      }));

      return true;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || `Error completing authentication for ${platform}`);
      console.error(`Error handling auth callback for ${platform}:`, err);
      return false;
    }
  };

  // Test connection to a platform
  const testConnection = async (integrationId: string): Promise<boolean> => {
    try {
      setError(null);
      return await testIntegrationConnection(integrationId);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || `Error testing connection for integration ${integrationId}`);
      console.error(`Error testing connection for integration ${integrationId}:`, err);
      return false;
    }
  };

  // Create the context value
  const contextValue: IntegrationsContextType = {
    integrations,
    isLoading,
    error,
    syncStatus,
    connectPlatform,
    disconnectPlatform,
    syncPlatform,
    generateAuthUrl: generatePlatformAuthUrl,
    handleAuthCallback,
    testConnection,
    refreshIntegrations,
  };

  return (
    <IntegrationsContext.Provider value={contextValue}>
      {children}
    </IntegrationsContext.Provider>
  );
};

// Create a custom hook to use the context
export const useIntegrations = () => useContext(IntegrationsContext);

export default IntegrationsContext;