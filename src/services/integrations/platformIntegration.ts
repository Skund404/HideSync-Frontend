import { Sale, SalesChannel } from '../../types/salesTypes';
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
 * Save integration configs to local storage
 */
export const saveIntegrationConfigs = (configs: IntegrationConfigs): void => {
  localStorage.setItem('hidesync_integrations', JSON.stringify(configs));
};

/**
 * Get integration configs from local storage
 */
export const getIntegrationConfigs = (): IntegrationConfigs => {
  const configs = localStorage.getItem('hidesync_integrations');
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

  // Route to the appropriate platform-specific function
  switch (platform) {
    case SalesChannel.SHOPIFY:
      return fetchShopifyOrders(config, fromDate);
    case SalesChannel.ETSY:
      return fetchEtsyOrders(config, fromDate);
    // Add other platforms as they are implemented
    default:
      throw new Error(`Unsupported platform: ${platform}`);
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

    // Implementation will be added in platform-specific files
    return true;
  } catch (error) {
    console.error('Error updating order fulfillment:', error);
    return false;
  }
};
