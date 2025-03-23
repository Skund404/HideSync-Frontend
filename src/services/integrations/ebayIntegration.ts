// src/services/integrations/ebayIntegration.ts
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
const EBAY_API_URL = 'https://api.ebay.com';
const EBAY_AUTH_URL = 'https://auth.ebay.com/oauth2/authorize';
const EBAY_TOKEN_URL = 'https://api.ebay.com/identity/v1/oauth2/token';

// Production and Sandbox environments
const ENVIRONMENTS = {
  PRODUCTION: {
    API_GATEWAY: EBAY_API_URL, // Use the constant here
    AUTH_SERVER: EBAY_AUTH_URL, // Use the constant here
    TOKEN_SERVER: EBAY_TOKEN_URL, // Use the constant here
  },
  SANDBOX: {
    API_GATEWAY: 'https://api.sandbox.ebay.com',
    AUTH_SERVER: 'https://auth.sandbox.ebay.com/oauth2/authorize',
    TOKEN_SERVER: 'https://api.sandbox.ebay.com/identity/v1/oauth2/token',
  },
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

// Default concurrency limit
const DEFAULT_CONCURRENCY = 5;

/**
 * Cache keys for different eBay data types
 */
const cacheKeys = {
  order: (orderId: string) => `ebay:order:${orderId}`,
  ordersList: (accountId: string, fromDate?: string) =>
    `ebay:ordersList:${accountId}${fromDate ? `:${fromDate}` : ''}`,
  customerMapping: (ebayBuyerId: string) =>
    `ebay:customerMapping:${ebayBuyerId}`,
  orderMapping: (ebayOrderId: string) => `ebay:orderMapping:${ebayOrderId}`,
};

/**
 * eBay API response interfaces
 */

// eBay order response
interface EbayOrdersResponse {
  orders: EbayOrder[];
  href?: string;
  limit: number;
  offset: number;
  total?: number;
  next?: string;
  prev?: string;
  warnings?: any[];
}

// eBay order structure
interface EbayOrder {
  orderId: string;
  legacyOrderId?: string;
  creationDate: string;
  lastModifiedDate: string;
  orderFulfillmentStatus: string;
  orderPaymentStatus: string;
  sellerId: string;
  buyer: EbayBuyer;
  pricingSummary: EbayPricingSummary;
  fulfillmentStartInstructions: EbayFulfillmentStartInstructions[];
  lineItems: EbayLineItem[];
  salesRecordReference?: string;
  totalFeeBasisAmount?: EbayAmount;
  cancelStatus?: {
    cancelState: string;
    cancelRequests?: {
      cancelCompletedDate: string;
      cancelRequestedDate: string;
      cancelReason: string;
    }[];
  };
}

// eBay buyer information
interface EbayBuyer {
  username: string;
  taxAddress?: EbayAddress;
  taxIdentifier?: {
    taxpayerId: string;
    taxIdentifierType: string;
    issuingCountry: string;
  };
}

// eBay address structure
interface EbayAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateOrProvince?: string;
  postalCode: string;
  countryCode: string;
  phoneNumber?: string;
  fullName?: string;
  email?: string;
}

// eBay pricing summary
interface EbayPricingSummary {
  priceSubtotal: EbayAmount;
  deliveryCost: EbayAmount;
  tax: EbayAmount;
  total: EbayAmount;
}

// eBay monetary amount
interface EbayAmount {
  value: string;
  currency: string;
}

// eBay fulfillment instructions
interface EbayFulfillmentStartInstructions {
  fulfillmentInstructionsType: string;
  shippingStep: {
    shippingCarrierCode?: string;
    shippingServiceCode?: string;
    shipTo: EbayAddress;
    shippingCost?: EbayAmount;
  };
  pickupStep?: {
    merchantLocationKey: string;
    pickupLocationName: string;
    pickupAddress: EbayAddress;
  };
}

// eBay line item (order item)
interface EbayLineItem {
  lineItemId: string;
  legacyItemId: string;
  title: string;
  sku?: string;
  quantity: number;
  lineItemCost: EbayAmount;
  tax?: EbayAmount;
  deliveryCost?: EbayAmount;
  discountedLineItemCost?: EbayAmount;
  properties?: {
    name: string;
    value: string;
  }[];
  legacyVariationId?: string;
  fulfillmentStatus?: string;
}

// eBay token response
interface EbayTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
}

// eBay shipping fulfillment
interface EbayShippingFulfillment {
  fulfillmentId: string;
  lineItems: Array<{
    lineItemId: string;
    quantity: number;
  }>;
  shippedDate: string;
  shippingCarrierCode: string;
  trackingNumber: string;
}

// eBay shipping fulfillment response
interface EbayShippingFulfillmentResponse {
  fulfillmentId: string;
  orderId: string;
  shipmentTrackingNumber: string;
  shippingCarrierCode: string;
  shippedDate: string;
  lineItems: Array<{
    lineItemId: string;
    quantity: number;
  }>;
}

/**
 * Interface for customer mapping
 */
interface CustomerMapping {
  ebayBuyerId: string;
  internalCustomerId: number;
  lastSyncedAt: string;
}

/**
 * Interface for order mapping
 */
interface OrderMapping {
  ebayOrderId: string;
  internalOrderId: number;
  lastSyncedAt: string;
}

/**
 * API request metrics tracking
 */
interface EbayApiMetrics {
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
 * Custom error class for eBay API errors
 */
class EbayApiError extends Error {
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
    this.name = 'EbayApiError';
    this.status = options.status;
    this.code = options.code;
    this.retryable = options.retryable !== undefined ? options.retryable : true;
    this.originalError = options.originalError;
  }
}

/**
 * Circuit breaker for eBay API calls
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
    if (!(error instanceof EbayApiError) || error.retryable) {
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
 * eBay API client with token refresh and proper error handling
 */
class EbayApiClient {
  private config: PlatformAuthConfig;
  private axiosInstance: AxiosInstance;
  private circuitBreaker: CircuitBreaker;
  private metrics: EbayApiMetrics;
  private apiGateway: string;
  private tokenServer: string;

  /**
   * Create a new eBay API client
   * @param config The platform auth config
   */
  constructor(config: PlatformAuthConfig) {
    this.config = config;
    this.circuitBreaker = new CircuitBreaker();

    // Determine environment (production or sandbox)
    const env = config.sandbox ? ENVIRONMENTS.SANDBOX : ENVIRONMENTS.PRODUCTION;
    this.apiGateway = env.API_GATEWAY;
    this.tokenServer = env.TOKEN_SERVER;

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
            new EbayApiError(
              `Rate limited by eBay API. Retry after ${retryAfter} seconds.`,
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
            new EbayApiError(
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
          new EbayApiError(
            `eBay API error: ${
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
        parts[i] === 'fulfillment' ||
        parts[i] === 'items' ||
        parts[i] === 'shipping_fulfillment'
      ) {
        return `${parts[i]}${parts[i + 1] ? `/${parts[i + 1]}` : ''}`;
      }
    }

    return url.split('?')[0];
  }

  /**
   * Get metrics for this client instance
   */
  public getMetrics(): EbayApiMetrics {
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
        console.error('Error refreshing eBay token:', error);
        throw new EbayApiError(
          `eBay token refresh failed: ${(error as Error).message}`,
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
  private async refreshToken(): Promise<EbayTokenResponse> {
    try {
      // Check if refresh token exists
      if (!this.config.refreshToken) {
        throw new Error('No refresh token available');
      }

      const authString = Buffer.from(
        `${this.config.apiKey}:${this.config.apiSecret}`
      ).toString('base64');

      const response: AxiosResponse<EbayTokenResponse> = await axios.post(
        this.tokenServer,
        'grant_type=refresh_token&refresh_token=' + this.config.refreshToken,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${authString}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error in token refresh:', error);
      throw new EbayApiError(
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
   * Make a request to the eBay API with retry and circuit breaker
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
        const url = `${this.apiGateway}${endpoint}`;
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
   * Get orders from eBay
   * @param fromDate Optional date to filter orders created after
   * @param toDate Optional date to filter orders created before
   * @param limit Maximum number of orders to return
   * @param offset Pagination offset
   */
  public async getOrders(
    fromDate?: Date,
    toDate?: Date,
    limit: number = 50,
    offset: number = 0
  ): Promise<EbayOrdersResponse> {
    const params: Record<string, any> = {
      limit,
      offset,
    };

    if (fromDate) {
      params.filter = `creationdate:[${fromDate.toISOString()}..`;
      if (toDate) {
        params.filter += `${toDate.toISOString()}]`;
      } else {
        params.filter += '}';
      }
    }

    return this.request<EbayOrdersResponse>(
      'GET',
      '/sell/fulfillment/v1/order',
      params
    );
  }

  /**
   * Get a specific order by ID
   * @param orderId eBay order ID
   */
  public async getOrder(orderId: string): Promise<{ order: EbayOrder }> {
    return this.request<{ order: EbayOrder }>(
      'GET',
      `/sell/fulfillment/v1/order/${orderId}`
    );
  }

  /**
   * Create a shipping fulfillment for an order
   * @param orderId Order ID
   * @param fulfillmentData Shipping fulfillment data
   */
  public async createShippingFulfillment(
    orderId: string,
    fulfillmentData: {
      lineItems: Array<{ lineItemId: string; quantity: number }>;
      shippedDate: string;
      shippingCarrierCode: string;
      trackingNumber: string;
    }
  ): Promise<EbayShippingFulfillmentResponse> {
    return this.request<EbayShippingFulfillmentResponse>(
      'POST',
      `/sell/fulfillment/v1/order/${orderId}/shipping_fulfillment`,
      undefined,
      fulfillmentData
    );
  }
}

/**
 * Map eBay fulfillment status to HideSync fulfillment status
 * @param status eBay fulfillment status
 */
const mapFulfillmentStatus = (status: string): FulfillmentStatus => {
  switch (status) {
    case 'FULFILLED':
      return FulfillmentStatus.SHIPPED;
    case 'IN_PROGRESS':
      return FulfillmentStatus.READY_TO_SHIP;
    case 'NOT_STARTED':
      return FulfillmentStatus.PENDING;
    default:
      return FulfillmentStatus.PENDING;
  }
};

/**
 * Map eBay payment status to HideSync payment status
 * @param status eBay payment status
 */
const mapPaymentStatus = (status: string): PaymentStatus => {
  switch (status) {
    case 'FULLY_PAID':
      return PaymentStatus.PAID;
    case 'PARTIALLY_PAID':
      return PaymentStatus.PARTIALLY_PAID;
    case 'NOT_PAID':
      return PaymentStatus.PENDING;
    case 'REFUNDED':
      return PaymentStatus.REFUNDED;
    default:
      return PaymentStatus.PENDING;
  }
};

/**
 * Map eBay order status to HideSync sale status
 * @param order eBay order
 */
const mapSaleStatus = (order: EbayOrder): SaleStatus => {
  if (order.cancelStatus && order.cancelStatus.cancelState === 'COMPLETE') {
    return SaleStatus.CANCELLED;
  }

  switch (order.orderFulfillmentStatus) {
    case 'FULFILLED':
      return SaleStatus.SHIPPED;
    case 'IN_PROGRESS':
      return SaleStatus.IN_PROGRESS;
    case 'NOT_STARTED':
      if (order.orderPaymentStatus === 'FULLY_PAID') {
        return SaleStatus.CONFIRMED;
      }
      return SaleStatus.INQUIRY;
    default:
      return SaleStatus.INQUIRY;
  }
};

/**
 * Convert eBay address to HideSync address
 * @param address eBay address
 */
const convertAddress = (address?: EbayAddress): Address | undefined => {
  if (!address) return undefined;

  return {
    street: [address.addressLine1, address.addressLine2]
      .filter(Boolean)
      .join(', '),
    city: address.city,
    state: address.stateOrProvince || '',
    postalCode: address.postalCode,
    country: address.countryCode,
  };
};

/**
 * Get shipping address from eBay order
 * @param order eBay order
 */
const getShippingAddress = (order: EbayOrder): Address | undefined => {
  // Find the shipping instruction if available
  const shippingInstruction = order.fulfillmentStartInstructions.find(
    (instruction) => instruction.fulfillmentInstructionsType === 'SHIP_TO'
  );

  if (!shippingInstruction || !shippingInstruction.shippingStep.shipTo) {
    return undefined;
  }

  return convertAddress(shippingInstruction.shippingStep.shipTo);
};

/**
 * Get shipping method from eBay order
 * @param order eBay order
 */
const getShippingMethod = (order: EbayOrder): string | undefined => {
  const shippingInstruction = order.fulfillmentStartInstructions.find(
    (instruction) => instruction.fulfillmentInstructionsType === 'SHIP_TO'
  );

  if (!shippingInstruction) {
    return undefined;
  }

  const carrierCode = shippingInstruction.shippingStep.shippingCarrierCode;
  const serviceCode = shippingInstruction.shippingStep.shippingServiceCode;

  if (carrierCode && serviceCode) {
    return `${carrierCode} - ${serviceCode}`;
  } else if (carrierCode) {
    return carrierCode;
  } else if (serviceCode) {
    return serviceCode;
  }

  return undefined;
};

/**
 * Helper functions to extract customer details from order
 */
function getShippingName(order: EbayOrder): string | undefined {
  const shippingInstruction = order.fulfillmentStartInstructions.find(
    (instruction) => instruction.fulfillmentInstructionsType === 'SHIP_TO'
  );
  return shippingInstruction?.shippingStep.shipTo.fullName;
}

function getShippingEmail(order: EbayOrder): string | undefined {
  const shippingInstruction = order.fulfillmentStartInstructions.find(
    (instruction) => instruction.fulfillmentInstructionsType === 'SHIP_TO'
  );
  return shippingInstruction?.shippingStep.shipTo.email;
}

function getShippingPhone(order: EbayOrder): string | undefined {
  const shippingInstruction = order.fulfillmentStartInstructions.find(
    (instruction) => instruction.fulfillmentInstructionsType === 'SHIP_TO'
  );
  return shippingInstruction?.shippingStep.shipTo.phoneNumber;
}

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
 * Save customer mapping
 * @param ebayBuyerId eBay buyer ID
 * @param internalCustomerId Internal customer ID
 */
const saveCustomerMapping = async (
  ebayBuyerId: string,
  internalCustomerId: number
): Promise<void> => {
  try {
    const mapping: CustomerMapping = {
      ebayBuyerId,
      internalCustomerId,
      lastSyncedAt: new Date().toISOString(),
    };

    // Save mapping in the database
    await apiClient.post('/integration-mappings/customers', mapping);

    // Cache the mapping
    const cacheKey = cacheKeys.customerMapping(ebayBuyerId);
    setCacheItem(cacheKey, internalCustomerId, CACHE_TTL.CUSTOMER_MAPPING);
  } catch (error) {
    console.error('Error saving customer mapping:', error);
    // Continue execution - mapping will be retried next time
  }
};

/**
 * Get customer mapping by eBay buyer ID
 * @param ebayBuyerId eBay buyer ID
 */
const getCustomerMappingId = async (
  ebayBuyerId: string
): Promise<number | null> => {
  const cacheKey = cacheKeys.customerMapping(ebayBuyerId);

  // Check cache first
  if (hasCacheItem(cacheKey)) {
    return getCacheItem<number>(cacheKey) || null;
  }

  try {
    // Try to find mapping in database
    const response = await apiClient.get<CustomerMapping[]>(
      '/integration-mappings/customers',
      {
        params: { ebayBuyerId },
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
 * Find or create a customer from eBay order
 * @param order eBay order
 */
const findOrCreateCustomer = async (order: EbayOrder): Promise<Customer> => {
  const buyerId = order.buyer.username;
  const email = getShippingEmail(order);
  const name = getShippingName(order) || order.buyer.username;
  const phone = getShippingPhone(order);

  // If no email, return placeholder customer
  if (!email) {
    return {
      id: 0,
      name: name || 'eBay Customer',
      email: `${buyerId}@marketplace.ebay.com`,
      phone: phone || '',
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
      name: name || 'eBay Customer',
      email: email,
      phone: phone || '',
      status: CustomerStatus.ACTIVE,
      tier: CustomerTier.STANDARD,
      source: CustomerSource.MARKETPLACE,
    };
  }
};

/**
 * Save order mapping
 * @param ebayOrderId eBay order ID
 * @param internalOrderId Internal order ID
 */
const saveOrderMapping = async (
  ebayOrderId: string,
  internalOrderId: number
): Promise<void> => {
  try {
    const mapping: OrderMapping = {
      ebayOrderId,
      internalOrderId,
      lastSyncedAt: new Date().toISOString(),
    };

    // Save mapping in the database
    await apiClient.post('/integration-mappings/orders', mapping);

    // Cache the mapping
    const cacheKey = cacheKeys.orderMapping(ebayOrderId);
    setCacheItem(cacheKey, internalOrderId, CACHE_TTL.ORDER_MAPPING);
  } catch (error) {
    console.error('Error saving order mapping:', error);
    // Continue execution - mapping will be retried next time
  }
};

/**
 * Get order mapping by eBay order ID
 * @param ebayOrderId eBay order ID
 */
const getOrderMappingId = async (
  ebayOrderId: string
): Promise<number | null> => {
  const cacheKey = cacheKeys.orderMapping(ebayOrderId);

  // Check cache first
  if (hasCacheItem(cacheKey)) {
    return getCacheItem<number>(cacheKey) || null;
  }

  try {
    // Try to find mapping in database
    const response = await apiClient.get<OrderMapping[]>(
      '/integration-mappings/orders',
      {
        params: { ebayOrderId },
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
 * Generate a sale ID from eBay order ID
 * @param ebayOrderId eBay order ID
 */
const generateSaleId = (ebayOrderId: string): number => {
  // Create a deterministic but unique ID from the eBay order ID
  // This uses a hash function to get a numeric ID within INT range
  const hash = crypto.createHash('md5').update(ebayOrderId).digest('hex');
  return parseInt(hash.substring(0, 8), 16);
};

/**
 * Convert eBay order to HideSync Sale
 * @param ebayOrder eBay order
 */
const convertEbayOrderToSale = async (ebayOrder: EbayOrder): Promise<Sale> => {
  // Find or create customer
  const customer = await findOrCreateCustomer(ebayOrder);

  // Convert line items
  const items: SalesItem[] = ebayOrder.lineItems.map((item) => {
    // Combine item properties as notes if available
    const propertyNotes = item.properties
      ? item.properties.map((prop) => `${prop.name}: ${prop.value}`).join(', ')
      : undefined;

    return {
      id: parseInt(item.lineItemId),
      name: item.title,
      sku: item.sku || `EBAY-${item.legacyItemId}`,
      price: parseFloat(item.lineItemCost.value),
      quantity: item.quantity,
      type: 'PRODUCT',
      notes: propertyNotes,
    };
  });

  // Calculate totals
  const total = parseFloat(ebayOrder.pricingSummary.total.value);
  const shipping = parseFloat(ebayOrder.pricingSummary.deliveryCost.value);
  const taxes = parseFloat(ebayOrder.pricingSummary.tax.value);

  // eBay fees are typically around 10-12% (simplified for demo)
  const platformFees = ebayOrder.totalFeeBasisAmount
    ? parseFloat(ebayOrder.totalFeeBasisAmount.value)
    : Math.round(total * 0.1 * 100) / 100;

  // Calculate subtotal (total - taxes - shipping)
  const subtotal = total - taxes - shipping;

  // Store additional info in tags
  const tags = [];
  if (ebayOrder.salesRecordReference)
    tags.push(`srn:${ebayOrder.salesRecordReference}`);

  // Determine the sale ID - either from mapping or generate a new one
  let saleId: number;
  const existingId = await getOrderMappingId(ebayOrder.orderId);

  if (existingId !== null) {
    saleId = existingId;
  } else {
    // Generate a new ID
    saleId = generateSaleId(ebayOrder.orderId);

    // Save the mapping for future reference
    await saveOrderMapping(ebayOrder.orderId, saleId);
  }

  return {
    id: saleId,
    customer,
    createdAt: ebayOrder.creationDate,
    status: mapSaleStatus(ebayOrder),
    paymentStatus: mapPaymentStatus(ebayOrder.orderPaymentStatus),
    fulfillmentStatus: mapFulfillmentStatus(ebayOrder.orderFulfillmentStatus),
    total,
    totalAmount: total,
    subtotal,
    taxes,
    shipping,
    platformFees,
    netRevenue: total - platformFees,
    depositAmount: total,
    balanceDue: 0,
    items,
    channel: SalesChannel.EBAY,
    marketplaceData: {
      externalOrderId: ebayOrder.legacyOrderId || ebayOrder.orderId,
      platform: SalesChannel.EBAY,
      orderUrl: `https://www.ebay.com/sh/ord/?orderid=${
        ebayOrder.legacyOrderId || ebayOrder.orderId
      }`,
      platformFees,
    },
    shippingAddress: getShippingAddress(ebayOrder),
    shippingMethod: getShippingMethod(ebayOrder),
    communications: [],
    tags,
  };
};

/**
 * Fetch all orders from eBay with pagination
 * @param client eBay API client
 * @param fromDate Optional date to filter orders created after
 * @param limit Maximum number of orders to return
 */
const fetchAllOrders = async (
  client: EbayApiClient,
  fromDate?: Date,
  limit: number = 100
): Promise<EbayOrder[]> => {
  const pageSize = 50; // eBay API page size
  let allOrders: EbayOrder[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore && allOrders.length < limit) {
    try {
      // Calculate remaining items to fetch
      const remaining = limit - allOrders.length;
      const currentPageSize = Math.min(remaining, pageSize);

      // Fetch the next page of orders
      const response = await client.getOrders(
        fromDate,
        undefined,
        currentPageSize,
        offset
      );

      if (response.orders && response.orders.length > 0) {
        // Add orders to the result
        allOrders = [...allOrders, ...response.orders];
        offset += response.orders.length;
      }

      // Check if we need more pages
      hasMore =
        response.orders.length === currentPageSize &&
        allOrders.length < limit &&
        response.total !== undefined &&
        allOrders.length < response.total;

      // Add a small delay to avoid rate limiting
      if (hasMore) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    } catch (error) {
      if (error instanceof EbayApiError && error.status === 429) {
        // Rate limited, wait before retrying
        const retryAfter =
          error.originalError?.response?.headers?.['retry-after'] || 10;
        console.warn(
          `Rate limited by eBay API. Waiting ${retryAfter} seconds before retrying...`
        );
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        continue;
      }

      console.error('Error fetching eBay orders:', error);

      // If we have some orders, continue with those rather than failing completely
      if (allOrders.length > 0) {
        console.warn(
          `Continuing with ${allOrders.length} orders collected before error`
        );
        hasMore = false;
      } else {
        // If we have no orders, rethrow the error
        throw error;
      }
    }
  }

  return allOrders;
};

/**
 * Process orders in parallel with controlled concurrency
 * @param orders eBay orders to process
 * @param concurrencyLimit Maximum concurrency
 */
const processOrdersConcurrently = async (
  orders: EbayOrder[],
  concurrencyLimit: number = DEFAULT_CONCURRENCY
): Promise<Sale[]> => {
  const sales: Sale[] = [];

  // Process orders in batches to control concurrency
  for (let i = 0; i < orders.length; i += concurrencyLimit) {
    const batch = orders.slice(i, i + concurrencyLimit);

    try {
      // Process batch concurrently
      const batchPromises = batch.map(async (order) => {
        try {
          // Convert to HideSync Sale
          return await convertEbayOrderToSale(order);
        } catch (error) {
          console.error(`Error processing order ${order.orderId}:`, error);
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
 * Fetch orders from eBay
 * @param config Platform auth configuration
 * @param fromDate Optional date to fetch orders from
 * @param options Optional configuration options
 */
export const fetchEbayOrders = async (
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

  console.log('Fetching eBay orders with config:', {
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
      const cacheKey = cacheKeys.ordersList(config.storeId || '');
      if (hasCacheItem(cacheKey)) {
        console.log('Using cached eBay orders');
        return getCacheItem<Sale[]>(cacheKey) || [];
      }
    }

    // Create eBay API client
    const client = new EbayApiClient(config);

    // Fetch all orders with pagination
    const orders = await fetchAllOrders(client, fromDate, limit);
    console.log(`Found ${orders.length} eBay orders`);

    // Process orders in parallel with concurrency control
    const sales = await processOrdersConcurrently(orders, concurrencyLimit);
    console.log(`Processed ${sales.length} eBay orders into sales`);

    // Cache results if not using date filter and not forcing refresh
    if (!fromDate && !forceRefresh) {
      const cacheKey = cacheKeys.ordersList(config.storeId || '');
      setCacheItem(cacheKey, sales, CACHE_TTL.ORDERS);
    }

    // Log metrics
    console.log('eBay API metrics:', client.getMetrics());

    return sales;
  } catch (error) {
    if (error instanceof EbayApiError) {
      console.error('eBay API error:', {
        message: error.message,
        code: error.code,
        status: error.status,
        retryable: error.retryable,
      });
    } else {
      console.error('Error fetching eBay orders:', error);
    }

    throw new Error(`Failed to fetch eBay orders: ${(error as Error).message}`);
  }
};

/**
 * Update fulfillment status for an eBay order
 * @param orderId eBay order ID
 * @param trackingNumber Tracking number
 * @param shippingProvider Shipping provider
 * @param config Platform auth configuration
 */
export const updateEbayFulfillment = async (
  orderId: string,
  trackingNumber: string,
  shippingProvider: string,
  config: PlatformAuthConfig
): Promise<boolean> => {
  try {
    console.log('Updating eBay fulfillment for order:', orderId);
    console.log('Tracking number:', trackingNumber);
    console.log('Shipping provider:', shippingProvider);

    // Create eBay API client
    const client = new EbayApiClient(config);

    // Get the order to find line items that need fulfillment
    const orderResponse = await client.getOrder(orderId);
    const order = orderResponse.order;

    // Prepare line items for fulfillment - only those that aren't fulfilled
    const lineItems = order.lineItems
      .filter((item) => item.fulfillmentStatus !== 'FULFILLED')
      .map((item) => ({
        lineItemId: item.lineItemId,
        quantity: item.quantity,
      }));

    if (lineItems.length === 0) {
      console.log('All items already fulfilled for order:', orderId);
      return true;
    }

    // Create shipping fulfillment with retry logic
    let attempts = 0;
    let success = false;
    let lastError: any;

    while (attempts < MAX_RETRIES && !success) {
      try {
        // Create the shipping fulfillment
        const fulfillmentData: EbayShippingFulfillment = {
          fulfillmentId: crypto.randomBytes(8).toString('hex'), // Generate a unique ID
          lineItems,
          shippedDate: new Date().toISOString(),
          shippingCarrierCode: shippingProvider,
          trackingNumber,
        };

        await client.createShippingFulfillment(orderId, fulfillmentData);

        success = true;
      } catch (error) {
        lastError = error;
        attempts++;

        // Only retry if error is retryable
        if (error instanceof EbayApiError && !error.retryable) {
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
    const ordersListCacheKey = cacheKeys.ordersList(config.storeId || '');
    if (hasCacheItem(ordersListCacheKey)) {
      setCacheItem(ordersListCacheKey, null);
    }

    return true;
  } catch (error) {
    console.error('Error updating eBay fulfillment:', error);
    throw new Error(
      `Failed to update eBay fulfillment: ${(error as Error).message}`
    );
  }
};

/**
 * Generate authorization URL for eBay OAuth flow
 * @param clientId Client ID (API key)
 * @param redirectUri Redirect URI
 * @param scopes OAuth scopes
 */
export const getEbayAuthUrl = (
  clientId: string,
  redirectUri: string,
  scopes: string[]
): string => {
  const scopesParam = scopes.join('%20');
  const state = crypto.randomBytes(16).toString('hex');

  return `${EBAY_AUTH_URL}?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${scopesParam}&state=${state}`;
};

/**
 * Exchange authorization code for eBay access token (OAuth flow)
 * @param clientId Client ID (API key)
 * @param clientSecret Client secret (API secret)
 * @param code Authorization code
 * @param redirectUri Redirect URI
 */
export const exchangeEbayAuthCode = async (
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUri: string
): Promise<PlatformAuthConfig> => {
  try {
    console.log('Exchanging auth code for eBay access token');

    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64'
    );

    const response: AxiosResponse<EbayTokenResponse> = await axios.post(
      EBAY_TOKEN_URL,
      `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${authString}`,
        },
      }
    );

    return {
      apiKey: clientId,
      apiSecret: clientSecret,
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresAt: Date.now() + response.data.expires_in * 1000,
      scopes: ['https://api.ebay.com/oauth/api_scope/sell.fulfillment'],
      sandbox: false, // Default to production environment
    };
  } catch (error) {
    console.error('Error exchanging eBay auth code:', error);
    throw new Error(
      `Failed to exchange eBay auth code: ${(error as Error).message}`
    );
  }
};
