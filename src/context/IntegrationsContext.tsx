// src/context/IntegrationsContext.tsx
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  fetchOrdersFromPlatform,
  getIntegrationConfigs,
  IntegrationConfigs,
  PlatformAuthConfig,
  removePlatformConfig,
  updatePlatformConfig,
} from '../services/integrations/platformIntegration';
import { SalesChannel } from '../types/salesTypes';
import { decryptData, encryptData } from '../utils/securityHelpers';

// Define the shape of our context
interface IntegrationsContextType {
  configs: IntegrationConfigs;
  isLoading: boolean;
  syncStatus: Record<
    SalesChannel,
    {
      isSyncing: boolean;
      lastSynced: Date | null;
      error: string | null;
    }
  >;
  connectPlatform: (
    platform: SalesChannel,
    config: PlatformAuthConfig
  ) => Promise<void>;
  disconnectPlatform: (platform: SalesChannel) => Promise<void>;
  syncPlatform: (platform: SalesChannel) => Promise<void>;
  generateAuthUrl: (
    platform: SalesChannel,
    redirectUri: string
  ) => string | null;
  handleAuthCallback: (
    platform: SalesChannel,
    code: string,
    state?: string
  ) => Promise<boolean>;
}

// Create the initial context value
const initialContext: IntegrationsContextType = {
  configs: {},
  isLoading: true,
  syncStatus: {} as Record<
    SalesChannel,
    {
      isSyncing: boolean;
      lastSynced: Date | null;
      error: string | null;
    }
  >,
  connectPlatform: async () => {},
  disconnectPlatform: async () => {},
  syncPlatform: async () => {},
  generateAuthUrl: () => null,
  handleAuthCallback: async () => false,
};

// Create the context
const IntegrationsContext =
  createContext<IntegrationsContextType>(initialContext);

// Create a provider component
export const IntegrationsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [configs, setConfigs] = useState<IntegrationConfigs>({});
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<
    Record<
      SalesChannel,
      {
        isSyncing: boolean;
        lastSynced: Date | null;
        error: string | null;
      }
    >
  >(
    {} as Record<
      SalesChannel,
      {
        isSyncing: boolean;
        lastSynced: Date | null;
        error: string | null;
      }
    >
  );

  // Initialize the context
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        // Load configs from storage
        const storedConfigs = getIntegrationConfigs();

        // Decrypt sensitive data
        const decryptedConfigs: IntegrationConfigs = {};
        for (const [platform, config] of Object.entries(storedConfigs)) {
          if (config) {
            const decryptedConfig = { ...config };

            // Decrypt sensitive fields
            if (config.accessToken) {
              decryptedConfig.accessToken = decryptData(config.accessToken);
            }
            if (config.refreshToken) {
              decryptedConfig.refreshToken = decryptData(config.refreshToken);
            }
            if (config.apiSecret) {
              decryptedConfig.apiSecret = decryptData(config.apiSecret);
            }

            decryptedConfigs[platform as SalesChannel] = decryptedConfig;
          }
        }

        setConfigs(decryptedConfigs);

        // Initialize sync status for each configured platform
        const initialSyncStatus: Record<
          SalesChannel,
          {
            isSyncing: boolean;
            lastSynced: Date | null;
            error: string | null;
          }
        > = {} as Record<
          SalesChannel,
          {
            isSyncing: boolean;
            lastSynced: Date | null;
            error: string | null;
          }
        >;

        Object.keys(decryptedConfigs).forEach((platform) => {
          initialSyncStatus[platform as SalesChannel] = {
            isSyncing: false,
            lastSynced: null,
            error: null,
          };
        });

        setSyncStatus(initialSyncStatus);
      } catch (error) {
        console.error('Error loading integration configs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfigs();
  }, []);

  // Connect a platform
  const connectPlatform = async (
    platform: SalesChannel,
    config: PlatformAuthConfig
  ) => {
    try {
      // Encrypt sensitive data before storing
      const encryptedConfig = { ...config };

      if (config.accessToken) {
        encryptedConfig.accessToken = encryptData(config.accessToken);
      }
      if (config.refreshToken) {
        encryptedConfig.refreshToken = encryptData(config.refreshToken);
      }
      if (config.apiSecret) {
        encryptedConfig.apiSecret = encryptData(config.apiSecret);
      }

      // Update the platform config
      updatePlatformConfig(platform, encryptedConfig);

      // Update the state with the decrypted version
      setConfigs((prev) => ({
        ...prev,
        [platform]: config,
      }));

      // Initialize sync status for the platform
      setSyncStatus((prev) => ({
        ...prev,
        [platform]: {
          isSyncing: false,
          lastSynced: null,
          error: null,
        },
      }));
    } catch (error) {
      console.error(`Error connecting ${platform}:`, error);
      throw error;
    }
  };

  // Disconnect a platform
  const disconnectPlatform = async (platform: SalesChannel) => {
    try {
      // Remove the platform config
      removePlatformConfig(platform);

      // Update the state
      setConfigs((prev) => {
        const newConfigs = { ...prev };
        delete newConfigs[platform];
        return newConfigs;
      });

      // Update sync status
      setSyncStatus((prev) => {
        const newStatus = { ...prev };
        delete newStatus[platform];
        return newStatus;
      });
    } catch (error) {
      console.error(`Error disconnecting ${platform}:`, error);
      throw error;
    }
  };

  // Sync a platform
  const syncPlatform = async (platform: SalesChannel) => {
    try {
      // Update sync status to indicate syncing
      setSyncStatus((prev) => ({
        ...prev,
        [platform]: {
          ...prev[platform],
          isSyncing: true,
          error: null,
        },
      }));

      // Get the config for this platform
      const config = configs[platform];

      if (!config) {
        throw new Error(`No configuration found for ${platform}`);
      }

      // Fetch orders from the platform
      // In a real implementation, you would save these orders to your database
      const orders = await fetchOrdersFromPlatform(platform, config);

      console.log(`Synced ${orders.length} orders from ${platform}`);

      // Update sync status to indicate success
      setSyncStatus((prev) => ({
        ...prev,
        [platform]: {
          isSyncing: false,
          lastSynced: new Date(),
          error: null,
        },
      }));
    } catch (error) {
      console.error(`Error syncing ${platform}:`, error);

      // Update sync status to indicate error
      setSyncStatus((prev) => ({
        ...prev,
        [platform]: {
          ...prev[platform],
          isSyncing: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }));

      throw error;
    }
  };

  // Generate an OAuth URL for a platform
  const generateAuthUrl = (
    platform: SalesChannel,
    redirectUri: string
  ): string | null => {
    // This would be implemented for each platform
    // For now, returning null as a placeholder
    return null;
  };

  // Handle OAuth callback
  const handleAuthCallback = async (
    platform: SalesChannel,
    code: string,
    state?: string
  ): Promise<boolean> => {
    // This would be implemented for each platform
    // For now, returning false as a placeholder
    return false;
  };

  // Create the context value
  const contextValue: IntegrationsContextType = {
    configs,
    isLoading,
    syncStatus,
    connectPlatform,
    disconnectPlatform,
    syncPlatform,
    generateAuthUrl,
    handleAuthCallback,
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
