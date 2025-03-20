// src/hooks/usePlatformIntegrations.ts
import { useCallback, useEffect, useState } from 'react';
import {
  exchangeAuthCode,
  fetchOrdersFromPlatform,
  generateAuthUrl,
  getAllPlatforms,
  getIntegrationConfigs,
  PlatformAuthConfig,
  PlatformInfo,
  removePlatformConfig,
  updatePlatformConfig,
} from '../services/integrations/platformIntegration';
import { SalesChannel } from '../types/salesTypes';

export interface PlatformSyncStatus {
  platform: SalesChannel;
  isSyncing: boolean;
  lastSynced: Date | null;
  error: string | null;
  itemsCount: number | null;
}

export interface UsePlatformIntegrationsReturn {
  platforms: PlatformInfo[];
  syncStatus: Record<SalesChannel, PlatformSyncStatus>;
  isLoading: boolean;
  connectPlatform: (
    platform: SalesChannel,
    config: PlatformAuthConfig
  ) => Promise<void>;
  disconnectPlatform: (platform: SalesChannel) => Promise<void>;
  syncPlatform: (platform: SalesChannel) => Promise<void>;
  getAuthUrl: (
    platform: SalesChannel,
    config: Partial<PlatformAuthConfig>,
    redirectUri: string
  ) => Promise<string>;
  handleAuthCallback: (
    platform: SalesChannel,
    code: string,
    config: Partial<PlatformAuthConfig>
  ) => Promise<boolean>;
  getPlatformConfig: (platform: SalesChannel) => PlatformAuthConfig | undefined;
}

/**
 * Hook to manage platform integrations
 */
export const usePlatformIntegrations = (): UsePlatformIntegrationsReturn => {
  const [platforms, setPlatforms] = useState<PlatformInfo[]>([]);
  const [syncStatus, setSyncStatus] = useState<
    Record<SalesChannel, PlatformSyncStatus>
  >({} as Record<SalesChannel, PlatformSyncStatus>);
  const [isLoading, setIsLoading] = useState(true);
  const [configs, setConfigs] = useState<
    Record<SalesChannel, PlatformAuthConfig>
  >({} as Record<SalesChannel, PlatformAuthConfig>);

  // Load platforms and configs on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get all platforms
        const allPlatforms = getAllPlatforms();
        setPlatforms(allPlatforms);

        // Get integration configs
        const storedConfigs = getIntegrationConfigs();
        setConfigs(storedConfigs as Record<SalesChannel, PlatformAuthConfig>);

        // Initialize sync status
        const initialSyncStatus: Record<SalesChannel, PlatformSyncStatus> =
          {} as Record<SalesChannel, PlatformSyncStatus>;
        allPlatforms.forEach((platform) => {
          initialSyncStatus[platform.key] = {
            platform: platform.key,
            isSyncing: false,
            lastSynced: null,
            error: null,
            itemsCount: null,
          };
        });

        setSyncStatus(initialSyncStatus);
      } catch (error) {
        console.error('Error loading platform integrations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  /**
   * Connect a platform
   */
  const connectPlatform = useCallback(
    async (
      platform: SalesChannel,
      config: PlatformAuthConfig
    ): Promise<void> => {
      try {
        // Update platform config
        const updatedConfigs = updatePlatformConfig(platform, config);
        setConfigs(updatedConfigs as Record<SalesChannel, PlatformAuthConfig>);

        // Update platforms list
        setPlatforms((prev) =>
          prev.map((p) =>
            p.key === platform ? { ...p, isConfigured: true } : p
          )
        );
      } catch (error) {
        console.error(`Error connecting platform ${platform}:`, error);
        throw error;
      }
    },
    []
  );

  /**
   * Disconnect a platform
   */
  const disconnectPlatform = useCallback(
    async (platform: SalesChannel): Promise<void> => {
      try {
        // Remove platform config
        const updatedConfigs = removePlatformConfig(platform);
        setConfigs(updatedConfigs as Record<SalesChannel, PlatformAuthConfig>);

        // Update platforms list
        setPlatforms((prev) =>
          prev.map((p) =>
            p.key === platform ? { ...p, isConfigured: false } : p
          )
        );

        // Reset sync status
        setSyncStatus((prev) => ({
          ...prev,
          [platform]: {
            ...prev[platform],
            lastSynced: null,
            error: null,
            itemsCount: null,
          },
        }));
      } catch (error) {
        console.error(`Error disconnecting platform ${platform}:`, error);
        throw error;
      }
    },
    []
  );

  /**
   * Sync orders from a platform
   */
  const syncPlatform = useCallback(
    async (platform: SalesChannel): Promise<void> => {
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

        // Get config for this platform
        const config = configs[platform];

        // Fetch orders
        const orders = await fetchOrdersFromPlatform(platform, config);

        // In a real implementation, you would save these orders to your database
        console.log(`Synced ${orders.length} orders from ${platform}`);

        // Update sync status to indicate success
        setSyncStatus((prev) => ({
          ...prev,
          [platform]: {
            ...prev[platform],
            isSyncing: false,
            lastSynced: new Date(),
            error: null,
            itemsCount: orders.length,
          },
        }));
      } catch (error) {
        console.error(`Error syncing platform ${platform}:`, error);

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
    },
    [configs]
  );

  /**
   * Generate auth URL for a platform
   */
  const getAuthUrl = useCallback(
    async (
      platform: SalesChannel,
      config: Partial<PlatformAuthConfig>,
      redirectUri: string
    ): Promise<string> => {
      try {
        return await generateAuthUrl(platform, config, redirectUri);
      } catch (error) {
        console.error(`Error generating auth URL for ${platform}:`, error);
        throw error;
      }
    },
    []
  );

  /**
   * Handle OAuth callback
   */
  const handleAuthCallback = useCallback(
    async (
      platform: SalesChannel,
      code: string,
      config: Partial<PlatformAuthConfig>
    ): Promise<boolean> => {
      try {
        // Exchange code for token
        const tokenConfig = await exchangeAuthCode(platform, code, config);

        // Save the token config
        await connectPlatform(platform, tokenConfig);

        return true;
      } catch (error) {
        console.error(`Error handling auth callback for ${platform}:`, error);
        return false;
      }
    },
    [connectPlatform]
  );

  /**
   * Get config for a platform
   */
  const getPlatformConfig = useCallback(
    (platform: SalesChannel): PlatformAuthConfig | undefined => {
      return configs[platform];
    },
    [configs]
  );

  return {
    platforms,
    syncStatus,
    isLoading,
    connectPlatform,
    disconnectPlatform,
    syncPlatform,
    getAuthUrl,
    handleAuthCallback,
    getPlatformConfig,
  };
};

export default usePlatformIntegrations;
