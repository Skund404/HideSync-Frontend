// src/services/integrations/platformIntegration.ts
import { Sale, SalesChannel } from '../../types/salesTypes';
import { secureLocalStorage } from '../../utils/securityHelpers';
import { fetchAmazonOrders } from './amazonIntegration';
import { fetchEbayOrders } from './ebayIntegration';
import { fetchEtsyOrders } from './etsyIntegration';
import { fetchShopifyOrders } from './shopifyIntegration';

/**
 * Configuration parameters for platform authentication
 */
export interface PlatformAuthConfig {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  shopName?: string; // For Shopify
  storeId?: string; // For Etsy, Amazon, etc.
  endpoint?: string; // Custom endpoint
  redirectUri?: string;
  scopes?: string[];
  expiresAt?: number; // Token expiration timestamp
  region?: string; // For Amazon
  [key: string]: any; // Other platform-specific parameters
}

/**
 * Storage structure for integration configurations
 */
export interface IntegrationConfigs {
  [SalesChannel.SHOPIFY]?: PlatformAuthConfig;
  [SalesChannel.ETSY]?: PlatformAuthConfig;
  [SalesChannel.AMAZON]?: PlatformAuthConfig;
  [SalesChannel.EBAY]?: PlatformAuthConfig;
  [SalesChannel.DIRECT]?: PlatformAuthConfig;
  [SalesChannel.WHOLESALE]?: PlatformAuthConfig;
  [SalesChannel.CUSTOM_ORDER]?: PlatformAuthConfig;
  [key: string]: PlatformAuthConfig | undefined;
}

/**
 * Syncing result structure
 */
export interface SyncResult {
  ordersAdded: number;
  ordersUpdated: number;
  errors: Array<{ message: string; platform: string }>;
}

/**
 * Platform-specific order data
 */
export interface PlatformOrderData {
  externalId: string;
  platformName: SalesChannel;
  orderData: any; // Raw platform-specific order data
}

/**
 * Local storage key for integration configs
 * In production, this would be in a secure database
 */
const STORAGE_KEY = 'hidesync_integrations';

/**
 * Save integration configs to secure storage
 */
export const saveIntegrationConfigs = (configs: IntegrationConfigs): void => {
  secureLocalStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
};

/**
 * Get integration configs from secure storage
 */
export const getIntegrationConfigs = (): IntegrationConfigs => {
  const configs = secureLocalStorage.getItem(STORAGE_KEY);
  return configs ? JSON.parse(configs) : {};
};

/**
 * Update a platform configuration
 */
export const updatePlatformConfig = (
  platform: SalesChannel,
  config: PlatformAuthConfig
): IntegrationConfigs => {
  const configs = getIntegrationConfigs();
  configs[platform] = config;
  saveIntegrationConfigs(configs);
  return configs;
};

/**
 * Remove a platform configuration
 */
export const removePlatformConfig = (
  platform: SalesChannel
): IntegrationConfigs => {
  const configs = getIntegrationConfigs();
  delete configs[platform];
  saveIntegrationConfigs(configs);
  return configs;
};

/**
 * Generic function to fetch orders from a platform
 */
export const fetchOrdersFromPlatform = async (
  platform: SalesChannel,
  config?: PlatformAuthConfig,
  fromDate?: Date
): Promise<Sale[]> => {
  // If no config provided, try to get from stored configs
  if (!config) {
    const configs = getIntegrationConfigs();
    config = configs[platform];

    if (!config) {
      throw new Error(`No configuration found for platform: ${platform}`);
    }
  }

  // Check if token is expired
  if (config.expiresAt && config.expiresAt < Date.now()) {
    // Token is expired, need to refresh
    // In a real implementation, this would call a refresh token function
    console.warn(`Token for ${platform} is expired. Refresh required.`);
    throw new Error(
      `Token for ${platform} is expired. Please reconnect the platform.`
    );
  }

  // Route to the appropriate platform-specific function
  try {
    switch (platform) {
      case SalesChannel.SHOPIFY:
        return fetchShopifyOrders(config, fromDate);
      case SalesChannel.ETSY:
        return fetchEtsyOrders(config, fromDate);
      case SalesChannel.AMAZON:
        return fetchAmazonOrders(config, fromDate);
      case SalesChannel.EBAY:
        return fetchEbayOrders(config, fromDate);
      // Add other platforms as they are implemented
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  } catch (error) {
    console.error(`Error fetching orders from ${platform}:`, error);
    throw new Error(
      `Failed to fetch orders from ${platform}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};

/**
 * Check if platform is configured
 */
export const isPlatformConfigured = (platform: SalesChannel): boolean => {
  const configs = getIntegrationConfigs();
  return !!configs[platform];
};

/**
 * Get list of configured platforms
 */
export const getConfiguredPlatforms = (): SalesChannel[] => {
  const configs = getIntegrationConfigs();
  return Object.keys(configs) as SalesChannel[];
};

/**
 * Get platform display information
 */
export interface PlatformInfo {
  key: SalesChannel;
  name: string;
  description: string;
  icon: string;
  color: string;
  url: string;
  docUrl: string;
  isConfigured: boolean;
}

export const getPlatformInfo = (platform: SalesChannel): PlatformInfo => {
  const isConfigured = isPlatformConfigured(platform);

  switch (platform) {
    case SalesChannel.SHOPIFY:
      return {
        key: platform,
        name: 'Shopify',
        description:
          'Connect your Shopify store to automatically import orders',
        icon: '🛍️',
        color: '#96bf48',
        url: 'https://shopify.com',
        docUrl: 'https://shopify.dev/docs/admin-api',
        isConfigured,
      };
    case SalesChannel.ETSY:
      return {
        key: platform,
        name: 'Etsy',
        description: 'Connect your Etsy shop to automatically import orders',
        icon: '🧶',
        color: '#f56400',
        url: 'https://etsy.com',
        docUrl: 'https://developers.etsy.com/documentation/',
        isConfigured,
      };
    case SalesChannel.AMAZON:
      return {
        key: platform,
        name: 'Amazon',
        description: 'Connect your Amazon seller account to import orders',
        icon: '📦',
        color: '#ff9900',
        url: 'https://sellercentral.amazon.com',
        docUrl: 'https://developer-docs.amazon.com/sp-api/',
        isConfigured,
      };
    case SalesChannel.EBAY:
      return {
        key: platform,
        name: 'eBay',
        description: 'Connect your eBay seller account to import orders',
        icon: '🏷️',
        color: '#e53238',
        url: 'https://ebay.com',
        docUrl: 'https://developer.ebay.com/develop/apis',
        isConfigured,
      };
    case SalesChannel.DIRECT:
      return {
        key: platform,
        name: 'Direct Sales',
        description: 'Manage orders from direct customer interactions',
        icon: '🤝',
        color: '#34d399',
        url: '',
        docUrl: '',
        isConfigured: true, // Direct sales is always configured
      };
    case SalesChannel.WHOLESALE:
      return {
        key: platform,
        name: 'Wholesale',
        description: 'Manage wholesale orders from business customers',
        icon: '🏭',
        color: '#818cf8',
        url: '',
        docUrl: '',
        isConfigured: true, // Wholesale is always configured
      };
    case SalesChannel.CUSTOM_ORDER:
      return {
        key: platform,
        name: 'Custom Orders',
        description: 'Manage custom order requests and commissions',
        icon: '✨',
        color: '#f59e0b',
        url: '',
        docUrl: '',
        isConfigured: true, // Custom orders is always configured
      };
    default:
      return {
        key: platform,
        name: platform,
        description: 'Connect to import orders',
        icon: '🛒',
        color: '#6b7280',
        url: '',
        docUrl: '',
        isConfigured,
      };
  }
};

/**
 * Get all available platforms with their info
 */
export const getAllPlatforms = (): PlatformInfo[] => {
  return Object.values(SalesChannel).map((platform) =>
    getPlatformInfo(platform)
  );
};

/**
 * Update order fulfillment in marketplace
 */
export const updateOrderFulfillment = async (
  sale: Sale,
  trackingNumber: string,
  shippingProvider: string
): Promise<boolean> => {
  if (!sale.marketplaceData) {
    // If this is not a marketplace order, no need to update external systems
    return true;
  }

  try {
    const configs = getIntegrationConfigs();
    const config = configs[sale.marketplaceData.platform];

    if (!config) {
      throw new Error(
        `No configuration found for platform: ${sale.marketplaceData.platform}`
      );
    }

    // Route to the appropriate platform-specific function
    switch (sale.marketplaceData.platform) {
      case SalesChannel.SHOPIFY:
        // Import and call the shopify update function
        const { updateShopifyFulfillment } = await import(
          './shopifyIntegration'
        );
        return updateShopifyFulfillment(
          sale.marketplaceData.externalOrderId,
          trackingNumber,
          shippingProvider,
          config
        );
      case SalesChannel.ETSY:
        // Import and call the etsy update function
        const { updateEtsyFulfillment } = await import('./etsyIntegration');
        return updateEtsyFulfillment(
          sale.marketplaceData.externalOrderId,
          trackingNumber,
          shippingProvider,
          config
        );
      case SalesChannel.AMAZON:
        // Import and call the amazon update function
        const { updateAmazonFulfillment } = await import('./amazonIntegration');
        return updateAmazonFulfillment(
          sale.marketplaceData.externalOrderId,
          trackingNumber,
          shippingProvider,
          config
        );
      case SalesChannel.EBAY:
        // Import and call the ebay update function
        const { updateEbayFulfillment } = await import('./ebayIntegration');
        return updateEbayFulfillment(
          sale.marketplaceData.externalOrderId,
          trackingNumber,
          shippingProvider,
          config
        );
      default:
        throw new Error(
          `Unsupported platform: ${sale.marketplaceData.platform}`
        );
    }
  } catch (error) {
    console.error('Error updating order fulfillment:', error);
    return false;
  }
};

/**
 * Generate authorization URL for platform OAuth flow
 */
export const generateAuthUrl = async (
  platform: SalesChannel,
  config: Partial<PlatformAuthConfig>,
  redirectUri: string
): Promise<string> => {
  try {
    switch (platform) {
      case SalesChannel.SHOPIFY:
        const { getShopifyAuthUrl } = await import('./shopifyIntegration');
        return getShopifyAuthUrl(
          config.shopName || '',
          config.apiKey || '',
          redirectUri,
          config.scopes || ['read_orders', 'write_orders']
        );
      case SalesChannel.ETSY:
        const { getEtsyAuthUrl } = await import('./etsyIntegration');
        return getEtsyAuthUrl(
          config.apiKey || '',
          redirectUri,
          config.scopes || ['transactions_r', 'transactions_w']
        );
      case SalesChannel.AMAZON:
        const { getAmazonAuthUrl } = await import('./amazonIntegration');
        return getAmazonAuthUrl(
          config.apiKey || '',
          redirectUri,
          platform // Use platform as state parameter
        );
      case SalesChannel.EBAY:
        const { getEbayAuthUrl } = await import('./ebayIntegration');
        return getEbayAuthUrl(
          config.apiKey || '',
          redirectUri,
          config.scopes || [
            'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
          ]
        );
      default:
        throw new Error(
          `Auth URL generation not implemented for platform: ${platform}`
        );
    }
  } catch (error) {
    console.error(`Error generating auth URL for ${platform}:`, error);
    throw error;
  }
};

/**
 * Exchange authorization code for access token (OAuth flow)
 */
export const exchangeAuthCode = async (
  platform: SalesChannel,
  code: string,
  config: Partial<PlatformAuthConfig>
): Promise<PlatformAuthConfig> => {
  try {
    switch (platform) {
      case SalesChannel.SHOPIFY:
        const { exchangeShopifyAuthCode } = await import(
          './shopifyIntegration'
        );
        return exchangeShopifyAuthCode(
          config.shopName || '',
          config.apiKey || '',
          config.apiSecret || '',
          code
        );
      case SalesChannel.ETSY:
        const { exchangeEtsyAuthCode } = await import('./etsyIntegration');
        return exchangeEtsyAuthCode(
          config.apiKey || '',
          config.apiSecret || '',
          code,
          config.redirectUri || ''
        );
      case SalesChannel.AMAZON:
        const { exchangeAmazonAuthCode } = await import('./amazonIntegration');
        return exchangeAmazonAuthCode(
          config.apiKey || '',
          config.apiSecret || '',
          code,
          config.redirectUri || ''
        );
      case SalesChannel.EBAY:
        const { exchangeEbayAuthCode } = await import('./ebayIntegration');
        return exchangeEbayAuthCode(
          config.apiKey || '',
          config.apiSecret || '',
          code,
          config.redirectUri || ''
        );
      default:
        throw new Error(
          `Auth code exchange not implemented for platform: ${platform}`
        );
    }
  } catch (error) {
    console.error(`Error exchanging auth code for ${platform}:`, error);
    throw error;
  }
};
