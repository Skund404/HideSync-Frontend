// src/services/integrations/etsyIntegration.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';
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

// Define constants
const ETSY_API_URL = 'https://openapi.etsy.com/v3';
const ETSY_AUTH_URL = 'https://www.etsy.com/oauth/connect';
const ETSY_TOKEN_URL = 'https://api.etsy.com/v3/public/oauth/token';

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

// Default concurrency limit
const DEFAULT_CONCURRENCY = 5;

/**
 * Cache keys for different Etsy data types
 */
const cacheKeys = {
  order: (orderId: string) => `etsy:order:${orderId}`,
  ordersList: (shopId: string, fromDate?: string) =>
    `etsy:ordersList:${shopId}${fromDate ? `:${fromDate}` : ''}`,
  customerMapping: (etsyBuyerId: string) =>
    `etsy:customerMapping:${etsyBuyerId}`,
  orderMapping: (etsyOrderId: string) => `etsy:orderMapping:${etsyOrderId}`,
};

/**
 * Etsy API response interfaces
 */

// Etsy receipts/orders response
interface EtsyReceiptsResponse {
  count: number;
  results: EtsyReceipt[];
  pagination: {
    next_page?: string;
    effective_limit: number;
    effective_offset: number;
  };
}

// Etsy receipt/order
interface EtsyReceipt {
  receipt_id: number;
  order_id: number;
  shop_id: number;
  buyer_user_id: number;
  receipt_type: number;
  seller_user_id: number;
  seller_email: string;
  buyer_email: string;
  create_timestamp: number;
  created_timestamp: number;
  update_timestamp: number;
  updated_timestamp: number;
  is_gift: boolean;
  gift_message?: string;
  grandtotal: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  subtotal: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  total_tax: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  total_vat: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  total_shipping: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  total_price: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  shipping_address?: EtsyAddress;
  buyer_address?: EtsyAddress;
  status: 'open' | 'paid' | 'completed' | 'canceled';
  was_paid: boolean;
  was_shipped: boolean;
  message_from_buyer?: string;
  message_from_seller?: string;
  is_ready_for_pickup?: boolean;
  is_digital?: boolean;
  needs_gift_wrap?: boolean;
  gift_wrap_price?: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  transactions: EtsyTransaction[];
}

// Etsy address
interface EtsyAddress {
  receipt_shipping_address_id?: number;
  name?: string;
  first_line: string;
  second_line?: string;
  city: string;
  state?: string;
  zip: string;
  formatted_address?: string;
  country_iso?: string;
  country_name?: string;
  phone?: string;
}

// Etsy transaction
interface EtsyTransaction {
  transaction_id: number;
  title: string;
  description: string;
  seller_user_id: number;
  buyer_user_id: number;
  create_timestamp: number;
  created_timestamp: number;
  paid_timestamp?: number;
  shipped_timestamp?: number;
  quantity: number;
  listing_id: number;
  receipt_id: number;
  is_digital: boolean;
  file_data?: string;
  listing_image_id?: number;
  product_id?: number;
  sku?: string;
  price: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  shipping_cost?: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  tracking_code?: string;
  carrier_name?: string;
  variations?: Array<{
    property_id: number;
    value_id: number;
    formatted_name: string;
    formatted_value: string;
  }>;
}

// Etsy shop receipt (used for shipping updates)
interface EtsyShopReceiptUpdate {
  was_shipped: boolean;
  carrier_name?: string;
  tracking_code?: string;
}

// Etsy token response
interface EtsyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

// Etsy buyer
interface EtsyBuyer {
  user_id: number;
  login_name?: string;
  primary_email?: string;
  first_name?: string;
  last_name?: string;
}

/**
 * Interface for customer mapping
 */
interface CustomerMapping {
  etsyBuyerId: string;
  internalCustomerId: number;
  lastSyncedAt: string;
}

/**
 * Interface for order mapping
 */
interface OrderMapping {
  etsyOrderId: string;
  internalOrderId: number;
  lastSyncedAt: string;
}

/**
 * API request metrics tracking
 */
interface EtsyApiMetrics {
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
 * Custom error class for Etsy API errors
 */
class EtsyApiError extends Error {
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
    this.name = 'EtsyApiError';
    this.status = options.status;
    this.code = options.code;
    this.retryable = options.retryable !== undefined ? options.retryable : true;
    this.originalError = options.originalError;
  }
}

/**
 * Circuit breaker for Etsy API calls
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
    if (!(error instanceof EtsyApiError) || error.retryable) {
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
 * Etsy API client with token refresh and proper error handling
 */
class EtsyApiClient {
  private config: PlatformAuthConfig;
  private axiosInstance: AxiosInstance;
  private circuitBreaker: CircuitBreaker;
  private metrics: EtsyApiMetrics;

  /**
   * Create a new Etsy API client
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
      baseURL: ETSY_API_URL,
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

        // Add API key-related headers
        config.headers['x-api-key'] = validConfig.apiKey;

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
            new EtsyApiError(
              `Rate limited by Etsy API. Retry after ${retryAfter} seconds.`,
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
            new EtsyApiError(
              `Authentication error: ${
                error.response.data?.error || error.message
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
          new EtsyApiError(
            `Etsy API error: ${error.response?.data?.error || error.message}`,
            {
              status: error.response?.status,
              code: error.response?.data?.error_code || 'API_ERROR',
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
        parts[i] === 'receipts' ||
        parts[i] === 'shops' ||
        parts[i] === 'users' ||
        parts[i] === 'transactions'
      ) {
        return `${parts[i]}${parts[i + 1] ? `/${parts[i + 1]}` : ''}`;
      }
    }

    return url.split('?')[0];
  }

  /**
   * Get metrics for this client instance
   */
  public getMetrics(): EtsyApiMetrics {
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
   * Ensure we have a valid token, refreshing if necessary
   */
  private async ensureValidToken(): Promise<PlatformAuthConfig> {
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

        // Update instance config
        this.config = currentConfig;
      } catch (error) {
        console.error('Error refreshing Etsy token:', error);
        throw new EtsyApiError(
          `Etsy token refresh failed: ${(error as Error).message}`,
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
  private async refreshToken(): Promise<EtsyTokenResponse> {
    try {
      // Check if refresh token exists
      if (!this.config.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response: AxiosResponse<EtsyTokenResponse> = await axios.post(
        ETSY_TOKEN_URL,
        {
          grant_type: 'refresh_token',
          client_id: this.config.apiKey,
          refresh_token: this.config.refreshToken,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error in token refresh:', error);
      throw new EtsyApiError(
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
   * Make a request to the Etsy API with retry and circuit breaker
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
        const startTime = Date.now();

        const response = await this.axiosInstance.request<T>({
          method,
          url: endpoint,
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
   * Get shop receipts (orders) from Etsy
   * @param shopId Etsy shop ID
   * @param params Optional query parameters
   */
  public async getShopReceipts(
    shopId: string,
    params: Record<string, any> = {}
  ): Promise<EtsyReceiptsResponse> {
    return this.request<EtsyReceiptsResponse>(
      'GET',
      `/application/shops/${shopId}/receipts`,
      {
        was_paid: 'true', // Only get paid orders
        limit: 25, // Max results per page
        ...params,
      }
    );
  }

  /**
   * Get a specific receipt by ID
   * @param receiptId Receipt ID
   */
  public async getReceipt(receiptId: number): Promise<EtsyReceipt> {
    return this.request<EtsyReceipt>(
      'GET',
      `/application/receipts/${receiptId}`,
      {
        includes: 'transactions,buyer',
      }
    );
  }

  /**
   * Update shipping details for a receipt/order
   * @param shopId Etsy shop ID
   * @param receiptId Receipt ID
   * @param shipmentDetails Shipping details
   */
  public async updateShipment(
    shopId: string,
    receiptId: number,
    shipmentDetails: EtsyShopReceiptUpdate
  ): Promise<EtsyReceipt> {
    return this.request<EtsyReceipt>(
      'PUT',
      `/application/shops/${shopId}/receipts/${receiptId}`,
      undefined,
      shipmentDetails
    );
  }

  /**
   * Get buyer information
   * @param userId Etsy user ID
   */
  public async getBuyer(userId: number): Promise<EtsyBuyer> {
    return this.request<EtsyBuyer>('GET', `/application/users/${userId}`);
  }
}

/**
 * Map Etsy order status to HideSync fulfillment status
 * @param status Etsy order status
 * @param wasShipped Shipping status flag
 */
const mapFulfillmentStatus = (
  status: string,
  wasShipped: boolean
): FulfillmentStatus => {
  if (status === 'canceled') return FulfillmentStatus.CANCELLED;
  if (!wasShipped) return FulfillmentStatus.PENDING;
  if (status === 'completed') return FulfillmentStatus.DELIVERED;
  return FulfillmentStatus.SHIPPED;
};

/**
 * Map Etsy order status to HideSync payment status
 * @param status Etsy order status
 * @param wasPaid Payment status flag
 */
const mapPaymentStatus = (status: string, wasPaid: boolean): PaymentStatus => {
  if (!wasPaid) return PaymentStatus.PENDING;

  switch (status) {
    case 'open':
      return PaymentStatus.PENDING;
    case 'paid':
      return PaymentStatus.PAID;
    case 'completed':
      return PaymentStatus.PAID;
    case 'canceled':
      return PaymentStatus.CANCELLED;
    default:
      return PaymentStatus.PENDING;
  }
};

/**
 * Map Etsy status to Sale status
 * @param status Etsy order status
 * @param wasShipped Shipping status flag
 * @param wasPaid Payment status flag
 */
const mapSaleStatus = (
  status: string,
  wasShipped: boolean,
  wasPaid: boolean
): SaleStatus => {
  if (status === 'canceled') return SaleStatus.CANCELLED;
  if (wasShipped) return SaleStatus.SHIPPED;
  if (wasPaid) return SaleStatus.CONFIRMED;
  return SaleStatus.INQUIRY;
};

/**
 * Convert Etsy address to HideSync address
 * @param address Etsy address
 */
const convertAddress = (address?: EtsyAddress): Address | undefined => {
  if (!address) return undefined;

  return {
    street: [address.first_line, address.second_line]
      .filter(Boolean)
      .join(', '),
    city: address.city,
    state: address.state || '',
    postalCode: address.zip,
    country: address.country_iso || address.country_name || '',
  };
};

/**
 * Format money amount from Etsy
 * @param money Etsy money object
 */
const formatMoney = (money?: {
  amount: number;
  divisor: number;
  currency_code: string;
}): number => {
  if (!money) return 0;
  return money.amount / money.divisor;
};

/**
 * Find or create a customer by email
 * @param email Customer email
 * @param name Customer name
 * @param phone Customer phone
 */
const findOrCreateCustomerByEmail = async (
  email: string,
  name: string,
  phone?: string
): Promise<number> => {
  try {
    // Try to find customer by email
    const response = await apiClient.get<Customer[]>('/customers', {
      params: { email },
    });

    if (response.data && response.data.length > 0) {
      // Customer exists
      return response.data[0].id;
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

    const createResult = await apiClient.post<Customer>(
      '/customers',
      newCustomer
    );
    return createResult.data.id;
  } catch (error) {
    console.error('Error finding/creating customer by email:', error);
    throw new Error(
      `Failed to find or create customer: ${(error as Error).message}`
    );
  }
};

/**
 * Save customer mapping
 * @param etsyBuyerId Etsy buyer ID
 * @param internalCustomerId Internal customer ID
 */
const saveCustomerMapping = async (
  etsyBuyerId: string,
  internalCustomerId: number
): Promise<void> => {
  try {
    const mapping: CustomerMapping = {
      etsyBuyerId,
      internalCustomerId,
      lastSyncedAt: new Date().toISOString(),
    };

    // Save mapping in the database
    await apiClient.post('/integration-mappings/customers', mapping);

    // Cache the mapping
    const cacheKey = cacheKeys.customerMapping(etsyBuyerId);
    setCacheItem(cacheKey, internalCustomerId, CACHE_TTL.CUSTOMER_MAPPING);
  } catch (error) {
    console.error('Error saving customer mapping:', error);
    // Continue execution - mapping will be retried next time
  }
};

/**
 * Get customer mapping by Etsy buyer ID
 * @param etsyBuyerId Etsy buyer ID
 */
const getCustomerMappingId = async (
  etsyBuyerId: string
): Promise<number | null> => {
  const cacheKey = cacheKeys.customerMapping(etsyBuyerId);

  // Check cache first
  if (hasCacheItem(cacheKey)) {
    return getCacheItem<number>(cacheKey) || null;
  }

  try {
    // Try to find mapping in database
    const response = await apiClient.get<CustomerMapping[]>(
      '/integration-mappings/customers',
      {
        params: { etsyBuyerId },
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
 * Find or create a customer from Etsy receipt
 * @param receipt Etsy receipt
 * @param client Etsy API client (optional, for fetching buyer details)
 */
const findOrCreateCustomer = async (
  receipt: EtsyReceipt,
  client?: EtsyApiClient
): Promise<Customer> => {
  const buyerId = receipt.buyer_user_id.toString();
  const email = receipt.buyer_email || '';
  let name = '';

  // Try to get buyer name from shipping address
  if (receipt.shipping_address && receipt.shipping_address.name) {
    name = receipt.shipping_address.name;
  } else if (receipt.buyer_address && receipt.buyer_address.name) {
    name = receipt.buyer_address.name;
  }

  // If no name in address, try to fetch buyer details
  if (!name && client) {
    try {
      const buyer = await client.getBuyer(receipt.buyer_user_id);
      if (buyer.first_name && buyer.last_name) {
        name = `${buyer.first_name} ${buyer.last_name}`;
      } else if (buyer.login_name) {
        name = buyer.login_name;
      }
    } catch (error) {
      console.warn('Could not fetch buyer details:', error);
    }
  }

  // Fallback if still no name
  if (!name) {
    name = 'Etsy Customer';
  }

  const phone =
    receipt.shipping_address?.phone || receipt.buyer_address?.phone || '';

  // If no email, return placeholder customer
  if (!email) {
    return {
      id: 0,
      name,
      email: `${buyerId}@marketplace.etsy.com`,
      phone,
      status: CustomerStatus.ACTIVE,
      tier: CustomerTier.STANDARD,
      source: CustomerSource.MARKETPLACE,
    };
  }

  try {
    // First check for existing mapping
    const mappedId = await getCustomerMappingId(buyerId);
    if (mappedId !== null) {
      // We found a mapping, get the customer details
      const response = await apiClient.get<Customer>(`/customers/${mappedId}`);
      return response.data;
    }

    // No mapping found, try to find by email or create new
    const customerId = await findOrCreateCustomerByEmail(email, name, phone);

    // Create mapping for future lookups
    await saveCustomerMapping(buyerId, customerId);

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
      name,
      email,
      phone,
      status: CustomerStatus.ACTIVE,
      tier: CustomerTier.STANDARD,
      source: CustomerSource.MARKETPLACE,
    };
  }
};

/**
 * Save order mapping
 * @param etsyOrderId Etsy order ID
 * @param internalOrderId Internal order ID
 */
const saveOrderMapping = async (
  etsyOrderId: string,
  internalOrderId: number
): Promise<void> => {
  try {
    const mapping: OrderMapping = {
      etsyOrderId,
      internalOrderId,
      lastSyncedAt: new Date().toISOString(),
    };

    // Save mapping in the database
    await apiClient.post('/integration-mappings/orders', mapping);

    // Cache the mapping
    const cacheKey = cacheKeys.orderMapping(etsyOrderId);
    setCacheItem(cacheKey, internalOrderId, CACHE_TTL.ORDER_MAPPING);
  } catch (error) {
    console.error('Error saving order mapping:', error);
    // Continue execution - mapping will be retried next time
  }
};

/**
 * Get order mapping by Etsy order ID
 * @param etsyOrderId Etsy order ID
 */
const getOrderMappingId = async (
  etsyOrderId: string
): Promise<number | null> => {
  const cacheKey = cacheKeys.orderMapping(etsyOrderId);

  // Check cache first
  if (hasCacheItem(cacheKey)) {
    return getCacheItem<number>(cacheKey) || null;
  }

  try {
    // Try to find mapping in database
    const response = await apiClient.get<OrderMapping[]>(
      '/integration-mappings/orders',
      {
        params: { etsyOrderId },
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
 * Generate a sale ID from Etsy order ID
 * @param etsyOrderId Etsy order ID
 */
const generateSaleId = (etsyOrderId: string): number => {
  // Create a deterministic but unique ID from the Etsy order ID
  // This uses a hash function to get a numeric ID within INT range
  const hash = crypto.createHash('md5').update(etsyOrderId).digest('hex');
  return parseInt(hash.substring(0, 8), 16);
};

/**
 * Convert Etsy receipt to HideSync Sale
 * @param receipt Etsy receipt
 * @param client Etsy API client (optional, for fetching buyer details)
 */
const convertEtsyReceiptToSale = async (
  receipt: EtsyReceipt,
  client?: EtsyApiClient
): Promise<Sale> => {
  // Find or create customer
  const customer = await findOrCreateCustomer(receipt, client);

  // Convert transactions to sales items
  const items: SalesItem[] = receipt.transactions.map((transaction) => {
    // Format variations as notes
    const variationNotes = transaction.variations
      ? transaction.variations
          .map((v) => `${v.formatted_name}: ${v.formatted_value}`)
          .join(', ')
      : '';

    return {
      id: transaction.transaction_id,
      name: transaction.title,
      sku: transaction.sku || `ETSY-${transaction.listing_id}`,
      price: formatMoney(transaction.price),
      quantity: transaction.quantity,
      type: 'PRODUCT',
      notes: variationNotes || undefined,
    };
  });

  // Calculate totals
  const total = formatMoney(receipt.total_price);
  const subtotal = formatMoney(receipt.subtotal);
  const taxes = formatMoney(receipt.total_tax) + formatMoney(receipt.total_vat);
  const shipping = formatMoney(receipt.total_shipping);

  // Etsy takes approximately 6.5% of the total sale as fees (simplified)
  const platformFees = Math.round(total * 0.065 * 100) / 100; // Round to 2 decimal places

  // Determine the sale ID - either from mapping or generate a new one
  let saleId: number;
  const etsyOrderId = receipt.receipt_id.toString();
  const existingId = await getOrderMappingId(etsyOrderId);

  if (existingId !== null) {
    saleId = existingId;
  } else {
    // Generate a new ID
    saleId = generateSaleId(etsyOrderId);

    // Save the mapping for future reference
    await saveOrderMapping(etsyOrderId, saleId);
  }

  // Extract shipping carrier and tracking info
  const carrier = receipt.transactions[0]?.carrier_name;
  const tracking = receipt.transactions[0]?.tracking_code;

  return {
    id: saleId,
    customer,
    createdAt: new Date(receipt.create_timestamp * 1000).toISOString(),
    status: mapSaleStatus(
      receipt.status,
      receipt.was_shipped || false,
      receipt.was_paid
    ),
    paymentStatus: mapPaymentStatus(receipt.status, receipt.was_paid),
    fulfillmentStatus: mapFulfillmentStatus(
      receipt.status,
      receipt.was_shipped || false
    ),
    total,
    totalAmount: total,
    subtotal,
    taxes,
    shipping,
    platformFees,
    netRevenue: total - platformFees,
    depositAmount: total, // Etsy typically collects full payment
    balanceDue: 0,
    items,
    channel: SalesChannel.ETSY,
    platformOrderId: etsyOrderId,
    marketplaceData: {
      externalOrderId: etsyOrderId,
      platform: SalesChannel.ETSY,
      orderUrl: `https://www.etsy.com/your/orders/${etsyOrderId}`,
      platformFees,
    },
    shippingAddress: convertAddress(
      receipt.shipping_address || receipt.buyer_address
    ),
    shippingProvider: carrier,
    trackingNumber: tracking,
    notes: receipt.message_from_buyer,
    communications: [],
    tags: receipt.is_gift ? ['gift'] : [],
  };
};

/**
 * Fetch all receipts from Etsy with pagination
 * @param client Etsy API client
 * @param shopId Etsy shop ID
 * @param fromDate Optional date to filter receipts created after
 * @param limit Maximum number of receipts to return
 */
const fetchAllReceipts = async (
  client: EtsyApiClient,
  shopId: string,
  fromDate?: Date,
  limit: number = 100
): Promise<EtsyReceipt[]> => {
  const params: Record<string, any> = {};

  if (fromDate) {
    params.min_created = Math.floor(fromDate.getTime() / 1000);
  }

  let allReceipts: EtsyReceipt[] = [];
  let hasMore = true;
  let offset = 0;
  const pageSize = 25; // Etsy API max page size

  while (hasMore && allReceipts.length < limit) {
    try {
      // Calculate remaining items to fetch
      const remaining = limit - allReceipts.length;
      const currentPageSize = Math.min(remaining, pageSize);

      // Fetch the next page of receipts
      const response = await client.getShopReceipts(shopId, {
        ...params,
        limit: currentPageSize,
        offset,
      });

      if (response.results && response.results.length > 0) {
        // Add receipts to the result
        allReceipts = [...allReceipts, ...response.results];
        offset += response.results.length;
      }

      // Check if we need more pages
      hasMore =
        response.results.length === currentPageSize &&
        allReceipts.length < limit &&
        response.count !== undefined &&
        allReceipts.length < response.count;

      // Add a small delay to avoid rate limiting
      if (hasMore) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    } catch (error) {
      if (error instanceof EtsyApiError && error.status === 429) {
        // Rate limited, wait before retrying
        const retryAfter =
          error.originalError?.response?.headers?.['retry-after'] || 10;
        console.warn(
          `Rate limited by Etsy API. Waiting ${retryAfter} seconds before retrying...`
        );
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        continue;
      }

      console.error('Error fetching Etsy receipts:', error);

      // If we have some receipts, continue with those rather than failing completely
      if (allReceipts.length > 0) {
        console.warn(
          `Continuing with ${allReceipts.length} receipts collected before error`
        );
        hasMore = false;
      } else {
        // If we have no receipts, rethrow the error
        throw error;
      }
    }
  }

  // Enrich receipts with transactions (if not already included)
  if (allReceipts.length > 0 && !allReceipts[0].transactions) {
    const enrichedReceipts = await Promise.all(
      allReceipts.map(async (receipt) => {
        try {
          return await client.getReceipt(receipt.receipt_id);
        } catch (error) {
          console.error(
            `Error fetching receipt details ${receipt.receipt_id}:`,
            error
          );
          return receipt;
        }
      })
    );
    return enrichedReceipts;
  }

  return allReceipts;
};

/**
 * Process receipts in parallel with controlled concurrency
 * @param receipts Etsy receipts to process
 * @param client Etsy API client
 * @param concurrencyLimit Maximum concurrency
 */
const processReceiptsConcurrently = async (
  receipts: EtsyReceipt[],
  client: EtsyApiClient,
  concurrencyLimit: number = DEFAULT_CONCURRENCY
): Promise<Sale[]> => {
  const sales: Sale[] = [];

  // Process receipts in batches to control concurrency
  for (let i = 0; i < receipts.length; i += concurrencyLimit) {
    const batch = receipts.slice(i, i + concurrencyLimit);

    try {
      // Process batch concurrently
      const batchPromises = batch.map(async (receipt) => {
        try {
          // Convert to HideSync Sale
          return await convertEtsyReceiptToSale(receipt, client);
        } catch (error) {
          console.error(
            `Error processing receipt ${receipt.receipt_id}:`,
            error
          );
          return null;
        }
      });

      // Wait for all receipts in batch to be processed
      const batchResults = await Promise.all(batchPromises);

      // Add successful results to sales array
      sales.push(...batchResults.filter((sale): sale is Sale => sale !== null));

      // Implement a small delay between batches to prevent rate limiting
      if (i + concurrencyLimit < receipts.length) {
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
 * Fetch orders from Etsy
 * @param config Platform auth configuration
 * @param fromDate Optional date to fetch orders from
 * @param options Optional configuration options
 */
export const fetchEtsyOrders = async (
  config: PlatformAuthConfig,
  fromDate?: Date,
  options?: {
    concurrencyLimit?: number;
    forceRefresh?: boolean;
    limit?: number;
  }
): Promise<Sale[]> => {
  const concurrencyLimit = options?.concurrencyLimit || DEFAULT_CONCURRENCY;
  const forceRefresh = options?.forceRefresh || false;
  const limit = options?.limit || 100;

  console.log('Fetching Etsy orders with config:', {
    ...config,
    accessToken: config.accessToken ? '***REDACTED***' : undefined,
    refreshToken: config.refreshToken ? '***REDACTED***' : undefined,
    apiSecret: config.apiSecret ? '***REDACTED***' : undefined,
  });

  if (fromDate) {
    console.log('From date:', fromDate);
  }

  // Validate that we have a shop ID
  if (!config.storeId) {
    throw new Error('Etsy shop ID is required in the configuration');
  }

  try {
    // Check cache first (if not forcing refresh and not using date filter)
    if (!forceRefresh && !fromDate) {
      const cacheKey = cacheKeys.ordersList(config.storeId);
      if (hasCacheItem(cacheKey)) {
        console.log('Using cached Etsy orders');
        return getCacheItem<Sale[]>(cacheKey) || [];
      }
    }

    // Create Etsy API client
    const client = new EtsyApiClient(config);

    // Fetch all receipts with pagination
    const receipts = await fetchAllReceipts(
      client,
      config.storeId,
      fromDate,
      limit
    );
    console.log(`Found ${receipts.length} Etsy receipts`);

    // Process receipts in parallel with concurrency control
    const sales = await processReceiptsConcurrently(
      receipts,
      client,
      concurrencyLimit
    );
    console.log(`Processed ${sales.length} Etsy receipts into sales`);

    // Cache results if not using date filter and not forcing refresh
    if (!fromDate && !forceRefresh) {
      const cacheKey = cacheKeys.ordersList(config.storeId);
      setCacheItem(cacheKey, sales, CACHE_TTL.ORDERS);
    }

    // Log metrics
    console.log('Etsy API metrics:', client.getMetrics());

    return sales;
  } catch (error) {
    if (error instanceof EtsyApiError) {
      console.error('Etsy API error:', {
        message: error.message,
        code: error.code,
        status: error.status,
        retryable: error.retryable,
      });
    } else {
      console.error('Error fetching Etsy orders:', error);
    }

    throw new Error(`Failed to fetch Etsy orders: ${(error as Error).message}`);
  }
};

/**
 * Update fulfillment status for an Etsy order
 * @param orderId Etsy order ID (receipt ID)
 * @param trackingNumber Tracking number
 * @param shippingProvider Shipping provider
 * @param config Platform auth configuration
 */
export const updateEtsyFulfillment = async (
  orderId: string,
  trackingNumber: string,
  shippingProvider: string,
  config: PlatformAuthConfig
): Promise<boolean> => {
  try {
    console.log('Updating Etsy fulfillment for order:', orderId);
    console.log('Tracking number:', trackingNumber);
    console.log('Shipping provider:', shippingProvider);

    // Validate that we have a shop ID
    if (!config.storeId) {
      throw new Error('Etsy shop ID is required in the configuration');
    }

    // Create Etsy API client
    const client = new EtsyApiClient(config);

    // Update shipment details with retry logic
    let attempts = 0;
    let success = false;
    let lastError: any;

    while (attempts < MAX_RETRIES && !success) {
      try {
        // Update the shipment
        await client.updateShipment(config.storeId, parseInt(orderId, 10), {
          was_shipped: true,
          carrier_name: shippingProvider,
          tracking_code: trackingNumber,
        });

        success = true;
      } catch (error) {
        lastError = error;
        attempts++;

        // Only retry if error is retryable
        if (error instanceof EtsyApiError && !error.retryable) {
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

    if (!success) {
      throw (
        lastError || new Error('Failed to update fulfillment after max retries')
      );
    }

    // Invalidate cache for this order
    const orderCacheKey = cacheKeys.order(orderId);
    if (hasCacheItem(orderCacheKey)) {
      setCacheItem(orderCacheKey, null);
    }

    // Also invalidate the orders list cache
    const ordersListCacheKey = cacheKeys.ordersList(config.storeId);
    if (hasCacheItem(ordersListCacheKey)) {
      setCacheItem(ordersListCacheKey, null);
    }

    return true;
  } catch (error) {
    console.error('Error updating Etsy fulfillment:', error);
    throw new Error(
      `Failed to update Etsy fulfillment: ${(error as Error).message}`
    );
  }
};

/**
 * Generate authorization URL for Etsy OAuth flow
 * @param apiKey API key
 * @param redirectUri Redirect URI
 * @param scopes OAuth scopes
 */
export const getEtsyAuthUrl = (
  apiKey: string,
  redirectUri: string,
  scopes: string[]
): string => {
  const scopesParam = scopes.join(' ');
  const state = crypto.randomBytes(16).toString('hex');

  return `${ETSY_AUTH_URL}?response_type=code&client_id=${apiKey}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scopesParam)}&state=${state}`;
};

/**
 * Exchange authorization code for Etsy access token (OAuth flow)
 * @param apiKey API key
 * @param apiSecret API secret
 * @param code Authorization code
 * @param redirectUri Redirect URI
 */
export const exchangeEtsyAuthCode = async (
  apiKey: string,
  apiSecret: string,
  code: string,
  redirectUri: string
): Promise<PlatformAuthConfig> => {
  try {
    console.log('Exchanging auth code for Etsy access token');

    const response = await axios.post<EtsyTokenResponse>(
      ETSY_TOKEN_URL,
      {
        grant_type: 'authorization_code',
        client_id: apiKey,
        redirect_uri: redirectUri,
        code,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      apiKey,
      apiSecret,
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresAt: Date.now() + response.data.expires_in * 1000,
      scopes: ['transactions_r', 'transactions_w'], // Simplification of actual scopes
    };
  } catch (error) {
    console.error('Error exchanging Etsy auth code:', error);
    throw new Error(
      `Failed to exchange Etsy auth code: ${(error as Error).message}`
    );
  }
};
