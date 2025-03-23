// src/services/integrations/amazonIntegration.ts
import axios, { AxiosResponse } from 'axios';
import crypto from 'crypto';
import {
  CustomerSource,
  CustomerStatus,
  CustomerTier,
  PaymentStatus,
  SaleStatus,
} from '../../types/enums';
import {
  Address,
  Customer,
  FulfillmentStatus,
  Sale,
  SalesChannel,
  SalesItem,
} from '../../types/salesTypes';
import { apiClient } from '../api-client';
import { getCacheItem, hasCacheItem, setCacheItem } from '../caching-service';
import { PlatformAuthConfig } from './platformIntegration';

// Constants for Amazon SP-API
const LWA_ENDPOINT = 'https://api.amazon.com/auth/o2/token';

// Regions mapping
const REGION_ENDPOINTS = {
  na: 'https://sellingpartnerapi-na.amazon.com',
  eu: 'https://sellingpartnerapi-eu.amazon.com',
  fe: 'https://sellingpartnerapi-fe.amazon.com',
};

// Cache TTLs in milliseconds
const CACHE_TTL = {
  ORDERS: 15 * 60 * 1000, // 15 minutes for orders list
  ORDER: 30 * 60 * 1000, // 30 minutes for single order
  ORDER_ITEMS: 60 * 60 * 1000, // 60 minutes for order items
  CUSTOMER_MAPPING: 24 * 60 * 60 * 1000, // 24 hours for customer mappings
  ORDER_MAPPING: 24 * 60 * 60 * 1000, // 24 hours for order mappings
};

// Max retries for API calls
const MAX_RETRIES = 3;

// Retry delay in milliseconds
const RETRY_DELAY = 1000;

/**
 * Interface for customer mapping
 */
interface CustomerMapping {
  amazonCustomerId: string;
  internalCustomerId: number;
  email: string;
  lastSyncedAt: string;
}

/**
 * Interface for order mapping
 */
interface OrderMapping {
  amazonOrderId: string;
  internalOrderId: number;
  lastSyncedAt: string;
}

/**
 * Amazon SP-API order response structure
 */
interface AmazonOrderResponse {
  payload: {
    Orders: AmazonOrder[];
    NextToken?: string;
  };
  errors?: Array<{
    code: string;
    message: string;
    details?: string;
  }>;
}

/**
 * Amazon SP-API order item response structure
 */
interface AmazonOrderItemsResponse {
  payload: {
    OrderItems: AmazonOrderItem[];
    NextToken?: string;
  };
  errors?: Array<{
    code: string;
    message: string;
    details?: string;
  }>;
}

/**
 * Amazon SP-API order structure
 */
interface AmazonOrder {
  AmazonOrderId: string;
  PurchaseDate: string;
  LastUpdateDate: string;
  OrderStatus: string;
  FulfillmentChannel: string;
  NumberOfItemsShipped: number;
  NumberOfItemsUnshipped: number;
  PaymentMethod?: string;
  PaymentMethodDetails?: string[];
  MarketplaceId: string;
  BuyerInfo?: {
    BuyerEmail?: string;
    BuyerName?: string;
    BuyerCounty?: string;
    BuyerTaxInfo?: {
      TaxingRegion: string;
      TaxClassifications: Array<{
        Name: string;
        Value: string;
      }>;
    };
    PurchaseOrderNumber?: string;
  };
  OrderTotal?: {
    Amount: string;
    CurrencyCode: string;
  };
  ShippingAddress?: AmazonAddress;
  ShipmentServiceLevelCategory?: string;
  OrderType?: string;
  EarliestShipDate?: string;
  LatestShipDate?: string;
  EarliestDeliveryDate?: string;
  LatestDeliveryDate?: string;
  IsBusinessOrder?: boolean;
  IsPrime?: boolean;
  IsPremiumOrder?: boolean;
  IsGlobalExpressEnabled?: boolean;
}

/**
 * Amazon address structure
 */
interface AmazonAddress {
  Name: string;
  AddressLine1?: string;
  AddressLine2?: string;
  AddressLine3?: string;
  City?: string;
  County?: string;
  District?: string;
  StateOrRegion?: string;
  PostalCode?: string;
  CountryCode?: string;
  Phone?: string;
}

/**
 * Amazon order item structure
 */
interface AmazonOrderItem {
  ASIN: string;
  SellerSKU?: string;
  OrderItemId: string;
  Title: string;
  QuantityOrdered: number;
  QuantityShipped: number;
  ProductInfo?: {
    NumberOfItems?: number;
  };
  PointsGranted?: {
    PointsNumber: number;
    PointsMonetaryValue: {
      Amount: string;
      CurrencyCode: string;
    };
  };
  ItemPrice?: {
    Amount: string;
    CurrencyCode: string;
  };
  ShippingPrice?: {
    Amount: string;
    CurrencyCode: string;
  };
  ItemTax?: {
    Amount: string;
    CurrencyCode: string;
  };
  ShippingTax?: {
    Amount: string;
    CurrencyCode: string;
  };
  ShippingDiscount?: {
    Amount: string;
    CurrencyCode: string;
  };
  ShippingDiscountTax?: {
    Amount: string;
    CurrencyCode: string;
  };
  PromotionDiscount?: {
    Amount: string;
    CurrencyCode: string;
  };
  PromotionDiscountTax?: {
    Amount: string;
    CurrencyCode: string;
  };
  PromotionIds?: string[];
  CODFee?: {
    Amount: string;
    CurrencyCode: string;
  };
  CODFeeDiscount?: {
    Amount: string;
    CurrencyCode: string;
  };
  IsGift?: boolean;
  ConditionNote?: string;
  ConditionId?: string;
  ConditionSubtypeId?: string;
  ScheduledDeliveryStartDate?: string;
  ScheduledDeliveryEndDate?: string;
  PriceDesignation?: string;
  IsTransparency?: boolean;
  SerialNumberRequired?: boolean;
}

/**
 * Response from the LWA token endpoint
 */
interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Inventory item response
 */
interface AmazonInventoryResponse {
  payload: {
    inventory: {
      [sku: string]: {
        ASIN: string;
        totalQuantity: number;
        condition: string;
        // other inventory fields would be here
      };
    };
    granularity: string;
    NextToken?: string;
  };
  errors?: Array<{
    code: string;
    message: string;
    details?: string;
  }>;
}

/**
 * API request metrics tracking
 */
interface AmazonApiMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  rateLimitedRequests: number;
  averageResponseTime: number;
  lastRequestTime: Date;
  requestsByEndpoint: Record<string, number>;
  errorsByEndpoint: Record<string, number>;
}

/**
 * Custom error class for Amazon API errors
 */
class AmazonApiError extends Error {
  status?: number;
  code?: string;
  retryable: boolean;
  originalError?: any;

  constructor(
    message: string,
    options: {
      status?: number;
      code?: string;
      retryable?: boolean;
      originalError?: any;
    } = {}
  ) {
    super(message);
    this.name = 'AmazonApiError';
    this.status = options.status;
    this.code = options.code;
    this.retryable = options.retryable !== undefined ? options.retryable : true;
    this.originalError = options.originalError;
  }
}

/**
 * Circuit breaker for Amazon API calls
 */
class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private isOpen: boolean = false;
  private readonly threshold: number;
  private readonly resetTimeout: number;

  constructor(threshold: number = 5, resetTimeoutMs: number = 60000) {
    this.threshold = threshold;
    this.resetTimeout = resetTimeoutMs;
  }

  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen) {
      // Check if circuit should be half-open
      const now = Date.now();
      if (now - this.lastFailureTime > this.resetTimeout) {
        this.isOpen = false; // Reset to half-open
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      return this.handleError(error, fn);
    }
  }

  private async handleError<T>(error: any, fn: () => Promise<T>): Promise<T> {
    this.recordFailure();

    // If error is retryable and circuit isn't open, attempt retry with backoff
    if (!(error instanceof AmazonApiError) || error.retryable) {
      // Attempt retry if we haven't tripped the breaker
      if (!this.isOpen) {
        const backoffDelay = Math.min(1000 * Math.pow(2, this.failures), 30000);
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        return fn();
      }
    }

    throw error;
  }

  private recordSuccess(): void {
    this.failures = 0;
    this.isOpen = false;
  }

  private recordFailure(): void {
    this.failures += 1;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.isOpen = true;
    }
  }
}

/**
 * Amazon API client with token refresh and proper SP-API integration
 */
class AmazonApiClient {
  private config: PlatformAuthConfig;
  private axiosInstance: ReturnType<typeof axios.create>;
  private circuitBreaker: CircuitBreaker;
  private metrics: AmazonApiMetrics;

  /**
   * Create a new Amazon API client
   * @param config The platform auth config
   */
  constructor(config: PlatformAuthConfig) {
    this.config = config;
    this.circuitBreaker = new CircuitBreaker();

    // Initialize metrics
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rateLimitedRequests: 0,
      averageResponseTime: 0,
      lastRequestTime: new Date(),
      requestsByEndpoint: {},
      errorsByEndpoint: {},
    };

    // Create axios instance with base configuration
    this.axiosInstance = axios.create({
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'HideSync/1.0.0 (Language=JavaScript)',
      },
      timeout: 30000, // 30 second timeout
    });

    // Add interceptor to handle token refresh
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Track request metrics
        this.metrics.totalRequests++;
        this.metrics.lastRequestTime = new Date();

        const endpoint = this.getEndpointFromUrl(config.url || '');
        this.metrics.requestsByEndpoint[endpoint] =
          (this.metrics.requestsByEndpoint[endpoint] || 0) + 1;

        // Ensure we have a valid token
        const validConfig = await this.ensureValidToken();

        // Set authorization header with the valid token
        config.headers.Authorization = `Bearer ${validConfig.accessToken}`;

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for better error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Track successful request
        this.metrics.successfulRequests++;
        return response;
      },
      (error) => {
        // Track failed request
        this.metrics.failedRequests++;

        const endpoint = this.getEndpointFromUrl(error.config?.url || '');
        this.metrics.errorsByEndpoint[endpoint] =
          (this.metrics.errorsByEndpoint[endpoint] || 0) + 1;

        // Handle rate limiting
        if (error.response?.status === 429) {
          this.metrics.rateLimitedRequests++;

          // Extract retry-after if available
          const retryAfter = parseInt(
            error.response.headers['retry-after'] || '5',
            10
          );

          return Promise.reject(
            new AmazonApiError(
              `Rate limited by Amazon SP-API. Retry after ${retryAfter} seconds.`,
              {
                status: 429,
                code: 'RATE_LIMITED',
                retryable: true,
                originalError: error,
              }
            )
          );
        }

        // Handle authentication errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          return Promise.reject(
            new AmazonApiError(
              `Authentication error: ${
                error.response.data?.errors?.[0]?.message || error.message
              }`,
              {
                status: error.response.status,
                code: 'AUTH_ERROR',
                retryable: false,
                originalError: error,
              }
            )
          );
        }

        // Handle other errors
        return Promise.reject(
          new AmazonApiError(
            `Amazon API error: ${
              error.response?.data?.errors?.[0]?.message || error.message
            }`,
            {
              status: error.response?.status,
              code: error.response?.data?.errors?.[0]?.code || 'API_ERROR',
              retryable:
                error.response?.status >= 500 || error.response?.status === 0,
              originalError: error,
            }
          )
        );
      }
    );
  }

  /**
   * Get endpoint name from URL for metrics tracking
   */
  private getEndpointFromUrl(url: string): string {
    const parts = url.split('/');

    // Try to extract a meaningful endpoint name
    for (let i = parts.length - 1; i >= 0; i--) {
      if (
        parts[i] === 'orders' ||
        parts[i] === 'inventories' ||
        parts[i] === 'shipments' ||
        parts[i] === 'products'
      ) {
        return `${parts[i]}${parts[i + 1] ? `/${parts[i + 1]}` : ''}`;
      }
    }

    return url.split('?')[0];
  }

  /**
   * Get metrics for this client instance
   */
  public getMetrics(): AmazonApiMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  public resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rateLimitedRequests: 0,
      averageResponseTime: 0,
      lastRequestTime: new Date(),
      requestsByEndpoint: {},
      errorsByEndpoint: {},
    };
  }

  /**
   * Get base URL for the configured region
   */
  private getBaseUrl(): string {
    const region = this.config.region || 'na';
    return (
      REGION_ENDPOINTS[region as keyof typeof REGION_ENDPOINTS] ||
      REGION_ENDPOINTS.na
    );
  }

  /**
   * Ensure we have a valid token, refreshing if necessary
   */
  private async ensureValidToken(): Promise<PlatformAuthConfig> {
    const cacheKey = `amazon:token:${this.config.apiKey || ''}`;
    let currentConfig = { ...this.config };

    // Check if token is expired or about to expire (within 5 minutes)
    const fiveMinutes = 5 * 60 * 1000;
    const needsRefresh =
      !currentConfig.expiresAt ||
      currentConfig.expiresAt <= Date.now() + fiveMinutes;

    if (needsRefresh) {
      try {
        // Refresh the token
        const tokenResponse = await this.refreshToken();

        // Update config with new token data
        currentConfig = {
          ...currentConfig,
          accessToken: tokenResponse.access_token,
          refreshToken:
            tokenResponse.refresh_token || currentConfig.refreshToken,
          expiresAt: Date.now() + tokenResponse.expires_in * 1000,
        };

        // Cache the updated config
        setCacheItem(cacheKey, currentConfig);

        // Update instance config
        this.config = currentConfig;
      } catch (error) {
        console.error('Error refreshing Amazon token:', error);
        throw new AmazonApiError(
          `Amazon token refresh failed: ${(error as Error).message}`,
          {
            code: 'TOKEN_REFRESH_FAILED',
            retryable: false,
            originalError: error,
          }
        );
      }
    }

    return currentConfig;
  }

  /**
   * Refresh the access token using the refresh token
   */
  private async refreshToken(): Promise<TokenResponse> {
    try {
      // Check if refresh token exists
      if (!this.config.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response: AxiosResponse<TokenResponse> = await axios.post(
        LWA_ENDPOINT,
        {
          grant_type: 'refresh_token',
          refresh_token: this.config.refreshToken,
          client_id: this.config.apiKey,
          client_secret: this.config.apiSecret,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error in token refresh:', error);
      throw new AmazonApiError(
        `Token refresh failed: ${(error as Error).message}`,
        {
          code: 'TOKEN_REFRESH_FAILED',
          retryable: false,
          originalError: error,
        }
      );
    }
  }

  /**
   * Make a request to the Amazon SP-API with retry and circuit breaker
   * @param method HTTP method
   * @param endpoint API endpoint (without base URL)
   * @param params Optional query parameters
   * @param data Optional request body
   */
  public async request<T>(
    method: string,
    endpoint: string,
    params?: Record<string, any>,
    data?: any
  ): Promise<T> {
    return this.circuitBreaker.execute(async () => {
      try {
        const url = `${this.getBaseUrl()}${endpoint}`;
        const startTime = Date.now();

        const response = await this.axiosInstance.request<T>({
          method,
          url,
          params,
          data,
        });

        // Update average response time
        const responseTime = Date.now() - startTime;
        this.metrics.averageResponseTime =
          (this.metrics.averageResponseTime *
            (this.metrics.successfulRequests - 1) +
            responseTime) /
          this.metrics.successfulRequests;

        return response.data;
      } catch (error) {
        // Let the interceptor handle the error transformation
        throw error;
      }
    });
  }

  /**
   * Get orders from Amazon with retry logic
   * @param createdAfter Optional date to filter orders created after
   * @param nextToken Optional pagination token
   */
  public async getOrders(
    createdAfter?: Date,
    nextToken?: string
  ): Promise<AmazonOrderResponse> {
    const params: Record<string, any> = {
      MarketplaceIds: this.config.marketplaceId || 'ATVPDKIKX0DER', // Default to US marketplace
    };

    if (createdAfter) {
      params.CreatedAfter = createdAfter.toISOString();
    }

    if (nextToken) {
      params.NextToken = nextToken;
    }

    return this.request<AmazonOrderResponse>(
      'GET',
      `/orders/v0/orders`,
      params
    );
  }

  /**
   * Get order items for a specific order
   * @param orderId Amazon order ID
   * @param nextToken Optional pagination token
   */
  public async getOrderItems(
    orderId: string,
    nextToken?: string
  ): Promise<AmazonOrderItemsResponse> {
    const params: Record<string, any> = {};

    if (nextToken) {
      params.NextToken = nextToken;
    }

    return this.request<AmazonOrderItemsResponse>(
      'GET',
      `/orders/v0/orders/${orderId}/orderItems`,
      params
    );
  }

  /**
   * Update order status with shipping information
   * @param orderId Amazon order ID
   * @param trackingNumber Shipping tracking number
   * @param carrierCode Shipping carrier code
   */
  public async updateOrderShipment(
    orderId: string,
    trackingNumber: string,
    carrierCode: string
  ): Promise<any> {
    return this.request(
      'POST',
      `/orders/v0/orders/${orderId}/shipment`,
      undefined,
      {
        trackingNumber,
        carrierCode,
        shippingDate: new Date().toISOString(),
      }
    );
  }

  /**
   * Get inventory for seller SKUs
   * @param skus List of seller SKUs to query
   * @param nextToken Optional pagination token
   */
  public async getInventory(
    skus?: string[],
    nextToken?: string
  ): Promise<AmazonInventoryResponse> {
    const params: Record<string, any> = {
      MarketplaceIds: this.config.marketplaceId || 'ATVPDKIKX0DER',
      details: true,
      granularityType: 'Marketplace',
    };

    if (skus && skus.length > 0) {
      params.sellerSkus = skus;
    }

    if (nextToken) {
      params.NextToken = nextToken;
    }

    return this.request<AmazonInventoryResponse>(
      'GET',
      '/fba/inventory/v1/inventories',
      params
    );
  }
}

/**
 * Cache keys for different Amazon integration data types
 */
const cacheKeys = {
  customer: (email: string) => `amazon:customer:${email}`,
  customerMapping: (amazonId: string) => `amazon:customerMapping:${amazonId}`,
  orderMapping: (amazonOrderId: string) =>
    `amazon:orderMapping:${amazonOrderId}`,
  order: (amazonOrderId: string) => `amazon:order:${amazonOrderId}`,
  orderItems: (amazonOrderId: string) => `amazon:orderItems:${amazonOrderId}`,
  ordersList: (marketplaceId: string, fromDate?: string) =>
    `amazon:ordersList:${marketplaceId}${fromDate ? `:${fromDate}` : ''}`,
};

/**
 * Parse a string to a float with proper error handling
 * @param value String value to convert
 * @param defaultValue Default value if conversion fails
 */
const parseFloat = (value?: string, defaultValue: number = 0): number => {
  if (!value) return defaultValue;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Find a customer by email or create if not found
 */
const findOrCreateCustomerByEmail = async (
  email: string,
  name: string,
  phone?: string
): Promise<number> => {
  const cacheKey = cacheKeys.customer(email);

  // Check cache first
  if (hasCacheItem(cacheKey)) {
    return getCacheItem<number>(cacheKey) || 0;
  }

  try {
    // Try to find customer by email
    const response = await apiClient.get<Customer[]>('/customers', {
      params: { email },
    });

    if (response.data && response.data.length > 0) {
      // Customer exists
      const customerId = response.data[0].id;

      // Cache the ID
      setCacheItem(cacheKey, customerId, CACHE_TTL.CUSTOMER_MAPPING);

      return customerId;
    }

    // Customer doesn't exist, create new one
    const newCustomer = {
      name,
      email,
      phone: phone || '',
      status: CustomerStatus.ACTIVE,
      tier: CustomerTier.STANDARD,
      source: CustomerSource.MARKETPLACE,
    };

    // Note: we log a debug message here instead of using the unused variable
    // This helps with troubleshooting while keeping linter happy
    console.debug('Creating new customer:', email);

    const createResult = await apiClient.post<Customer>(
      '/customers',
      newCustomer
    );
    const newCustomerId = createResult.data.id;

    // Cache the new ID
    setCacheItem(cacheKey, newCustomerId, CACHE_TTL.CUSTOMER_MAPPING);

    return newCustomerId;
  } catch (error) {
    console.error('Error finding/creating customer by email:', error);
    throw new Error(
      `Failed to find or create customer: ${(error as Error).message}`
    );
  }
};

/**
 * Save customer mapping to track relationship between Amazon and internal customer IDs
 */
const saveCustomerMapping = async (
  amazonCustomerId: string,
  internalCustomerId: number,
  email: string
): Promise<void> => {
  try {
    const mapping: CustomerMapping = {
      amazonCustomerId,
      internalCustomerId,
      email,
      lastSyncedAt: new Date().toISOString(),
    };

    // Save mapping in the database
    await apiClient.post('/integration-mappings/customers', mapping);

    // Cache the mapping
    const cacheKey = cacheKeys.customerMapping(amazonCustomerId);
    setCacheItem(cacheKey, internalCustomerId, CACHE_TTL.CUSTOMER_MAPPING);
  } catch (error) {
    console.error('Error saving customer mapping:', error);
    // Continue execution - mapping will be retried next time
  }
};

/**
 * Get customer mapping by Amazon customer ID
 */
const getCustomerMappingId = async (
  amazonCustomerId: string
): Promise<number | null> => {
  const cacheKey = cacheKeys.customerMapping(amazonCustomerId);

  // Check cache first
  if (hasCacheItem(cacheKey)) {
    return getCacheItem<number>(cacheKey) || null;
  }

  try {
    // Try to find mapping in database
    const response = await apiClient.get<CustomerMapping[]>(
      '/integration-mappings/customers',
      {
        params: { amazonCustomerId },
      }
    );

    if (response.data && response.data.length > 0) {
      const internalId = response.data[0].internalCustomerId;

      // Cache the mapping
      setCacheItem(cacheKey, internalId, CACHE_TTL.CUSTOMER_MAPPING);

      return internalId;
    }

    return null;
  } catch (error) {
    console.error('Error getting customer mapping:', error);
    return null;
  }
};

/**
 * Find or create a customer from Amazon buyer info
 */
const findOrCreateCustomer = async (
  buyerInfo?: AmazonOrder['BuyerInfo']
): Promise<Customer> => {
  if (!buyerInfo || !buyerInfo.BuyerEmail) {
    // Create a placeholder customer for orders without buyer info
    return {
      id: 0, // Special ID for anonymous customer
      name: 'Amazon Customer',
      email: 'anonymous@marketplace.amazon.com',
      phone: '',
      status: CustomerStatus.ACTIVE,
      tier: CustomerTier.STANDARD,
      source: CustomerSource.MARKETPLACE,
    };
  }

  const email = buyerInfo.BuyerEmail;

  try {
    // First check for existing mapping
    const mappedId = await getCustomerMappingId(email);
    if (mappedId !== null) {
      // We found a mapping, get the customer details
      const response = await apiClient.get<Customer>(`/customers/${mappedId}`);
      return response.data;
    }

    // No mapping found, try to find by email or create new
    const customerId = await findOrCreateCustomerByEmail(
      email,
      buyerInfo.BuyerName || 'Amazon Customer',
      undefined // Phone will be set from shipping address if available
    );

    // Create mapping for future lookups
    await saveCustomerMapping(email, customerId, email);

    // Get full customer data
    const customerResponse = await apiClient.get<Customer>(
      `/customers/${customerId}`
    );
    return customerResponse.data;
  } catch (error) {
    console.error('Error finding or creating customer:', error);

    // Return a temporary customer object with error flag
    return {
      id: -1, // Negative ID indicates error
      name: buyerInfo.BuyerName || 'Amazon Customer',
      email: buyerInfo.BuyerEmail,
      phone: '',
      status: CustomerStatus.ACTIVE,
      tier: CustomerTier.STANDARD,
      source: CustomerSource.MARKETPLACE,
    };
  }
};

/**
 * Save order mapping to track relationship between Amazon and internal order IDs
 */
const saveOrderMapping = async (
  amazonOrderId: string,
  internalOrderId: number
): Promise<void> => {
  try {
    const mapping: OrderMapping = {
      amazonOrderId,
      internalOrderId,
      lastSyncedAt: new Date().toISOString(),
    };

    // Save mapping in the database
    await apiClient.post('/integration-mappings/orders', mapping);

    // Cache the mapping
    const cacheKey = cacheKeys.orderMapping(amazonOrderId);
    setCacheItem(cacheKey, internalOrderId, CACHE_TTL.ORDER_MAPPING);
  } catch (error) {
    console.error('Error saving order mapping:', error);
    // Continue execution - mapping will be retried next time
  }
};

/**
 * Get order mapping by Amazon order ID
 */
const getOrderMappingId = async (
  amazonOrderId: string
): Promise<number | null> => {
  const cacheKey = cacheKeys.orderMapping(amazonOrderId);

  // Check cache first
  if (hasCacheItem(cacheKey)) {
    return getCacheItem<number>(cacheKey) || null;
  }

  try {
    // Try to find mapping in database
    const response = await apiClient.get<OrderMapping[]>(
      '/integration-mappings/orders',
      {
        params: { amazonOrderId },
      }
    );

    if (response.data && response.data.length > 0) {
      const internalId = response.data[0].internalOrderId;

      // Cache the mapping
      setCacheItem(cacheKey, internalId, CACHE_TTL.ORDER_MAPPING);

      return internalId;
    }

    return null;
  } catch (error) {
    console.error('Error getting order mapping:', error);
    return null;
  }
};

/**
 * Generate a sale ID from Amazon order ID
 */
const generateSaleId = (amazonOrderId: string): number => {
  // Create a deterministic but unique ID from the Amazon order ID
  // This uses a hash function to get a numeric ID within INT range
  const hash = crypto.createHash('md5').update(amazonOrderId).digest('hex');
  return parseInt(hash.substring(0, 8), 16);
};

/**
 * Convert Amazon address to HideSync address
 */
const convertAddress = (amazonAddress?: AmazonAddress): Address | undefined => {
  if (!amazonAddress || !amazonAddress.AddressLine1) return undefined;

  return {
    street: [
      amazonAddress.AddressLine1,
      amazonAddress.AddressLine2,
      amazonAddress.AddressLine3,
    ]
      .filter(Boolean)
      .join(', '),
    city: amazonAddress.City || '',
    state: amazonAddress.StateOrRegion || '',
    postalCode: amazonAddress.PostalCode || '',
    country: amazonAddress.CountryCode || '',
  };
};

/**
 * Map Amazon order status to HideSync sale status
 */
const mapSaleStatus = (status: string): SaleStatus => {
  switch (status) {
    case 'Pending':
      return SaleStatus.INQUIRY;
    case 'Unshipped':
      return SaleStatus.CONFIRMED;
    case 'PartiallyShipped':
      return SaleStatus.IN_PROGRESS;
    case 'Shipped':
      return SaleStatus.SHIPPED;
    case 'Canceled':
      return SaleStatus.CANCELLED;
    case 'Unfulfillable':
      return SaleStatus.ON_HOLD;
    default:
      return SaleStatus.INQUIRY;
  }
};

/**
 * Map Amazon payment status to HideSync payment status
 */
const mapPaymentStatus = (order: AmazonOrder): PaymentStatus => {
  if (order.OrderStatus === 'Canceled') {
    return PaymentStatus.CANCELLED;
  }

  if (order.PaymentMethod === 'COD') {
    return PaymentStatus.PENDING;
  }

  return PaymentStatus.PAID; // Amazon typically holds payment until shipping
};

/**
 * Map Amazon fulfillment status to HideSync fulfillment status
 */
const mapFulfillmentStatus = (order: AmazonOrder): FulfillmentStatus => {
  if (order.OrderStatus === 'Canceled') {
    return FulfillmentStatus.CANCELLED;
  }

  if (order.NumberOfItemsShipped === 0) {
    return FulfillmentStatus.PENDING;
  } else if (
    order.NumberOfItemsShipped <
    order.NumberOfItemsUnshipped + order.NumberOfItemsShipped
  ) {
    return FulfillmentStatus.READY_TO_SHIP;
  } else {
    return FulfillmentStatus.SHIPPED;
  }
};

/**
 * Convert Amazon order with items to HideSync Sale
 */
const convertAmazonOrderToSale = async (
  amazonOrder: AmazonOrder,
  orderItems: AmazonOrderItem[]
): Promise<Sale> => {
  // Find or create customer
  const customer = await findOrCreateCustomer(amazonOrder.BuyerInfo);

  // If we have a shipping address with phone, update the customer if needed
  if (amazonOrder.ShippingAddress?.Phone && customer.id > 0) {
    const phone = amazonOrder.ShippingAddress.Phone;

    try {
      // Only update if phone is not set or different
      if (!customer.phone || customer.phone !== phone) {
        await apiClient.patch(`/customers/${customer.id}`, { phone });
        customer.phone = phone; // Update our local copy
      }
    } catch (error) {
      console.warn(
        `Failed to update customer phone for ID ${customer.id}:`,
        error
      );
      // Continue execution - this is not critical
    }
  }

  // Convert order items
  const items: SalesItem[] = orderItems.map((item) => ({
    id: parseInt(item.OrderItemId.slice(-8), 16), // Generate a temporary ID from the order item ID
    name: item.Title,
    sku: item.SellerSKU || item.ASIN,
    price: parseFloat(item.ItemPrice?.Amount),
    quantity: item.QuantityOrdered,
    type: 'PRODUCT',
    notes: item.ConditionNote,
  }));

  // Calculate totals
  const total = parseFloat(amazonOrder.OrderTotal?.Amount);

  // Calculate shipping and taxes from order items
  let shipping = 0;
  let taxes = 0;

  for (const item of orderItems) {
    shipping += parseFloat(item.ShippingPrice?.Amount);

    // Add item tax
    taxes += parseFloat(item.ItemTax?.Amount);

    // Add shipping tax
    taxes += parseFloat(item.ShippingTax?.Amount);
  }

  // Calculate platform fees (Amazon takes approximately 15% as fees)
  const platformFees = Math.round(total * 0.15 * 100) / 100;

  // Calculate subtotal based on available data
  const subtotal = total - taxes - shipping;

  // Gather additional info for tags
  const tags: string[] = [];
  if (amazonOrder.IsPrime) tags.push('prime');
  if (amazonOrder.MarketplaceId)
    tags.push(`marketplace:${amazonOrder.MarketplaceId}`);
  if (amazonOrder.OrderType) tags.push(`type:${amazonOrder.OrderType}`);
  if (amazonOrder.IsBusinessOrder) tags.push('business');

  // Determine the sale ID - either from mapping or generate a new one
  let saleId: number;
  const existingId = await getOrderMappingId(amazonOrder.AmazonOrderId);

  if (existingId !== null) {
    saleId = existingId;
  } else {
    // Generate a new ID
    saleId = generateSaleId(amazonOrder.AmazonOrderId);

    // Save the mapping for future reference
    await saveOrderMapping(amazonOrder.AmazonOrderId, saleId);
  }

  return {
    id: saleId,
    customer,
    createdAt: amazonOrder.PurchaseDate,
    status: mapSaleStatus(amazonOrder.OrderStatus),
    paymentStatus: mapPaymentStatus(amazonOrder),
    fulfillmentStatus: mapFulfillmentStatus(amazonOrder),
    total, // Keep for backward compatibility
    totalAmount: total,
    subtotal,
    taxes,
    shipping,
    platformFees,
    netRevenue: total - platformFees,
    depositAmount: total, // Amazon payments are typically paid in full
    balanceDue: 0, // No balance due for Amazon orders
    items,
    channel: SalesChannel.AMAZON,
    marketplaceData: {
      externalOrderId: amazonOrder.AmazonOrderId,
      platform: SalesChannel.AMAZON,
      orderUrl: `https://sellercentral.amazon.com/orders-v3/order/${amazonOrder.AmazonOrderId}`,
      platformFees,
    },
    shippingAddress: convertAddress(amazonOrder.ShippingAddress),
    shippingMethod: amazonOrder.ShipmentServiceLevelCategory,
    communications: [],
    tags,
  };
};

/**
 * Fetch all orders with pagination and concurrency control
 */
const fetchAllOrders = async (
  client: AmazonApiClient,
  fromDate?: Date,
  concurrencyLimit: number = 5
): Promise<AmazonOrder[]> => {
  let allOrders: AmazonOrder[] = [];
  let nextToken: string | undefined = undefined;

  // Fetch orders in batches with pagination
  do {
    // Fetch the next page of orders
    const response: AmazonOrderResponse = await client.getOrders(
      fromDate,
      nextToken
    );

    // Handle API errors
    if (response.errors && response.errors.length > 0) {
      throw new Error(`Amazon API Error: ${response.errors[0].message}`);
    }

    // Add orders to the list
    if (response.payload.Orders && response.payload.Orders.length > 0) {
      allOrders = [...allOrders, ...response.payload.Orders];
    }

    // Update nextToken for pagination
    nextToken = response.payload.NextToken;
  } while (nextToken);

  return allOrders;
};

/**
 * Fetch all order items for an order with pagination and caching
 */
const fetchOrderItems = async (
  client: AmazonApiClient,
  orderId: string
): Promise<AmazonOrderItem[]> => {
  const cacheKey = cacheKeys.orderItems(orderId);

  // Check cache first
  if (hasCacheItem(cacheKey)) {
    return getCacheItem<AmazonOrderItem[]>(cacheKey) || [];
  }

  let allItems: AmazonOrderItem[] = [];
  let nextToken: string | undefined = undefined;

  try {
    do {
      // Fetch the next page of order items
      const response: AmazonOrderItemsResponse = await client.getOrderItems(
        orderId,
        nextToken
      );

      // Handle API errors
      if (response.errors && response.errors.length > 0) {
        throw new Error(`Amazon API Error: ${response.errors[0].message}`);
      }

      // Add items to the list
      if (
        response.payload.OrderItems &&
        response.payload.OrderItems.length > 0
      ) {
        allItems = [...allItems, ...response.payload.OrderItems];
      }

      // Update nextToken for pagination
      nextToken = response.payload.NextToken;
    } while (nextToken);

    // Cache the items for future use
    setCacheItem(cacheKey, allItems, CACHE_TTL.ORDER_ITEMS);

    return allItems;
  } catch (error) {
    console.error(`Error fetching order items for order ${orderId}:`, error);
    throw error;
  }
};

/**
 * Process orders in parallel with controlled concurrency
 */
const processOrdersConcurrently = async (
  client: AmazonApiClient,
  orders: AmazonOrder[],
  concurrencyLimit: number = 5
): Promise<Sale[]> => {
  const sales: Sale[] = [];

  // Process orders in batches to control concurrency
  for (let i = 0; i < orders.length; i += concurrencyLimit) {
    const batch = orders.slice(i, i + concurrencyLimit);

    try {
      // Process batch concurrently
      const batchPromises = batch.map(async (order) => {
        try {
          // Fetch order items
          const items = await fetchOrderItems(client, order.AmazonOrderId);

          // Convert to HideSync Sale
          return await convertAmazonOrderToSale(order, items);
        } catch (error) {
          console.error(
            `Error processing order ${order.AmazonOrderId}:`,
            error
          );
          return null;
        }
      });

      // Wait for all orders in batch to be processed
      const batchResults = await Promise.all(batchPromises);

      // Add successful results to sales array
      sales.push(...batchResults.filter((sale): sale is Sale => sale !== null));

      // Implement a small delay between batches to prevent rate limiting
      if (i + concurrencyLimit < orders.length) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    } catch (error) {
      console.error(`Error processing batch starting at index ${i}:`, error);
      // Continue with next batch rather than failing completely
    }
  }

  return sales;
};

/**
 * Fetch orders from Amazon
 * @param config The platform auth config
 * @param fromDate Optional date to fetch orders from
 */
export const fetchAmazonOrders = async (
  config: PlatformAuthConfig,
  fromDate?: Date,
  options?: {
    concurrencyLimit?: number;
    forceRefresh?: boolean;
  }
): Promise<Sale[]> => {
  const concurrencyLimit = options?.concurrencyLimit || 5;
  const forceRefresh = options?.forceRefresh || false;

  console.log('Fetching Amazon orders with config:', {
    ...config,
    accessToken: config.accessToken ? '***REDACTED***' : undefined,
    refreshToken: config.refreshToken ? '***REDACTED***' : undefined,
    apiSecret: config.apiSecret ? '***REDACTED***' : undefined,
  });

  if (fromDate) {
    console.log('From date:', fromDate);
  }

  try {
    // Check cache first (if not forcing refresh and not using date filter)
    if (!forceRefresh && !fromDate) {
      const cacheKey = cacheKeys.ordersList(config.marketplaceId || '');
      if (hasCacheItem(cacheKey)) {
        console.log('Using cached Amazon orders');
        return getCacheItem<Sale[]>(cacheKey) || [];
      }
    }

    // Create Amazon API client
    const client = new AmazonApiClient(config);

    // Fetch all orders with pagination
    const orders = await fetchAllOrders(client, fromDate);
    console.log(`Found ${orders.length} Amazon orders`);

    // Process orders in parallel with concurrency control
    const sales = await processOrdersConcurrently(
      client,
      orders,
      concurrencyLimit
    );
    console.log(`Processed ${sales.length} Amazon orders into sales`);

    // Cache results if not using date filter and not forcing refresh
    if (!fromDate && !forceRefresh) {
      const cacheKey = cacheKeys.ordersList(config.marketplaceId || '');
      setCacheItem(cacheKey, sales, CACHE_TTL.ORDERS);
    }

    // Log metrics
    console.log('Amazon API metrics:', client.getMetrics());

    return sales;
  } catch (error) {
    if (error instanceof AmazonApiError) {
      console.error('Amazon API error:', {
        message: error.message,
        code: error.code,
        status: error.status,
        retryable: error.retryable,
      });
    } else {
      console.error('Error fetching Amazon orders:', error);
    }

    throw new Error(
      `Failed to fetch Amazon orders: ${(error as Error).message}`
    );
  }
};

/**
 * Update fulfillment status in Amazon
 * @param orderId Amazon order ID
 * @param trackingNumber Tracking number
 * @param shippingProvider Shipping provider
 * @param config Platform auth config
 */
export const updateAmazonFulfillment = async (
  orderId: string,
  trackingNumber: string,
  shippingProvider: string,
  config: PlatformAuthConfig
): Promise<boolean> => {
  try {
    console.log('Updating Amazon fulfillment for order:', orderId);
    console.log('Tracking number:', trackingNumber);
    console.log('Shipping provider:', shippingProvider);

    // Create Amazon API client
    const client = new AmazonApiClient(config);

    // Update shipment in Amazon with retry
    let attempts = 0;
    let success = false;

    while (attempts < MAX_RETRIES && !success) {
      try {
        await client.updateOrderShipment(
          orderId,
          trackingNumber,
          shippingProvider
        );
        success = true;
      } catch (error) {
        attempts++;

        // Only retry if error is retryable
        if (error instanceof AmazonApiError && !error.retryable) {
          throw error;
        }

        if (attempts < MAX_RETRIES) {
          const delay = RETRY_DELAY * Math.pow(2, attempts - 1);
          console.log(
            `Retrying fulfillment update in ${delay}ms (attempt ${
              attempts + 1
            }/${MAX_RETRIES})`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }

    // Invalidate cache for this order
    const orderCacheKey = cacheKeys.order(orderId);
    if (hasCacheItem(orderCacheKey)) {
      setCacheItem(orderCacheKey, null);
    }

    // Also invalidate the orders list cache
    const ordersListCacheKey = cacheKeys.ordersList(config.marketplaceId || '');
    if (hasCacheItem(ordersListCacheKey)) {
      setCacheItem(ordersListCacheKey, null);
    }

    return true;
  } catch (error) {
    console.error('Error updating Amazon fulfillment:', error);
    throw new Error(
      `Failed to update Amazon fulfillment: ${(error as Error).message}`
    );
  }
};

/**
 * Generate authorization URL for Amazon SP-API OAuth flow
 */
export const getAmazonAuthUrl = (
  clientId: string,
  redirectUri: string,
  state: string
): string => {
  const encodedRedirectUri = encodeURIComponent(redirectUri);
  const encodedState = encodeURIComponent(state);

  return `https://sellercentral.amazon.com/apps/authorize/consent?application_id=${clientId}&redirect_uri=${encodedRedirectUri}&state=${encodedState}`;
};

/**
 * Exchange authorization code for Amazon LWA access token (OAuth flow)
 */
export const exchangeAmazonAuthCode = async (
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUri: string
): Promise<PlatformAuthConfig> => {
  try {
    console.log('Exchanging auth code for Amazon access token');

    const response: AxiosResponse<TokenResponse> = await axios.post(
      LWA_ENDPOINT,
      {
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // Build the configuration object
    return {
      apiKey: clientId,
      apiSecret: clientSecret,
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresAt: Date.now() + response.data.expires_in * 1000,
      region: 'na', // Default to North America
      scopes: [
        'sellingpartnerapi:orders_read',
        'sellingpartnerapi:orders_write',
      ],
    };
  } catch (error) {
    console.error('Error exchanging Amazon auth code:', error);
    throw new Error(
      `Failed to exchange Amazon auth code: ${(error as Error).message}`
    );
  }
};
