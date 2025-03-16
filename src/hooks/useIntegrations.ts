import { useCallback, useEffect, useState } from 'react';
import {
  exchangeEtsyAuthCode,
  getEtsyAuthUrl,
} from '../services/integrations/etsyIntegration';
import {
  getAllPlatforms,
  getConfiguredPlatforms,
  getIntegrationConfigs,
  getPlatformInfo,
  IntegrationConfigs,
  isPlatformConfigured,
  PlatformAuthConfig,
  PlatformInfo,
  removePlatformConfig,
  updatePlatformConfig,
} from '../services/integrations/platformIntegration';
import {
  exchangeShopifyAuthCode,
  getShopifyAuthUrl,
} from '../services/integrations/shopifyIntegration';
import { SalesChannel } from '../types/salesTypes';

/**
 * Hook for managing marketplace integrations
 */
export function useIntegrations() {
  const [configs, setConfigs] = useState<IntegrationConfigs>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configuredPlatforms, setConfiguredPlatforms] = useState<
    SalesChannel[]
  >([]);
  const [platforms, setPlatforms] = useState<PlatformInfo[]>([]);

  // Load initial configurations
  useEffect(() => {
    try {
      const savedConfigs = getIntegrationConfigs();
      setConfigs(savedConfigs);
      setConfiguredPlatforms(getConfiguredPlatforms());
      setPlatforms(getAllPlatforms());
      setLoading(false);
    } catch (err) {
      setError('Failed to load integration configurations');
      setLoading(false);
    }
  }, []);

  /**
   * Update a platform's configuration
   */
  const updateConfig = useCallback(
    (platform: SalesChannel, config: PlatformAuthConfig) => {
      try {
        const updatedConfigs = updatePlatformConfig(platform, config);
        setConfigs(updatedConfigs);
        setConfiguredPlatforms(getConfiguredPlatforms());
        setPlatforms(getAllPlatforms());
        return true;
      } catch (err) {
        setError(`Failed to update ${platform} configuration`);
        return false;
      }
    },
    []
  );

  /**
   * Remove a platform's configuration
   */
  const removeConfig = useCallback((platform: SalesChannel) => {
    try {
      const updatedConfigs = removePlatformConfig(platform);
      setConfigs(updatedConfigs);
      setConfiguredPlatforms(getConfiguredPlatforms());
      setPlatforms(getAllPlatforms());
      return true;
    } catch (err) {
      setError(`Failed to remove ${platform} configuration`);
      return false;
    }
  }, []);

  /**
   * Check if a platform is configured
   */
  const isConfigured = useCallback((platform: SalesChannel) => {
    return isPlatformConfigured(platform);
  }, []);

  /**
   * Get authorization URL for a platform's OAuth flow
   */
  const getAuthUrl = useCallback(
    (platform: SalesChannel, configParams: any): string => {
      switch (platform) {
        case SalesChannel.SHOPIFY:
          return getShopifyAuthUrl(
            configParams.shopName,
            configParams.apiKey,
            configParams.redirectUri,
            configParams.scopes || ['read_orders', 'write_orders']
          );
        case SalesChannel.ETSY:
          return getEtsyAuthUrl(
            configParams.apiKey,
            configParams.redirectUri,
            configParams.scopes || ['transactions_r', 'transactions_w']
          );
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
    },
    []
  );

  /**
   * Process OAuth callback for a platform
   */
  const processAuthCallback = useCallback(
    async (
      platform: SalesChannel,
      code: string,
      configParams: any
    ): Promise<boolean> => {
      try {
        setLoading(true);
        let config: PlatformAuthConfig;

        switch (platform) {
          case SalesChannel.SHOPIFY:
            config = await exchangeShopifyAuthCode(
              configParams.shopName,
              configParams.apiKey,
              configParams.apiSecret,
              code
            );
            break;
          case SalesChannel.ETSY:
            config = await exchangeEtsyAuthCode(
              configParams.apiKey,
              configParams.apiSecret,
              code,
              configParams.redirectUri
            );
            break;
          default:
            throw new Error(`Unsupported platform: ${platform}`);
        }

        // Update the config for this platform
        const success = updateConfig(platform, config);
        setLoading(false);
        return success;
      } catch (err) {
        setError(`Failed to process ${platform} authentication`);
        setLoading(false);
        return false;
      }
    },
    [updateConfig]
  );

  /**
   * Get info about a specific platform
   */
  const getPlatform = useCallback((platform: SalesChannel): PlatformInfo => {
    return getPlatformInfo(platform);
  }, []);

  return {
    configs,
    loading,
    error,
    configuredPlatforms,
    platforms,
    updateConfig,
    removeConfig,
    isConfigured,
    getAuthUrl,
    processAuthCallback,
    getPlatform,
  };
}
