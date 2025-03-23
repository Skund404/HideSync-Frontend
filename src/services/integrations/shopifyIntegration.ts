// src/services/integrations/shopifyIntegration.ts
import axios, { AxiosInstance } from 'axios';
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

// Cache TTLs in milliseconds
const CACHE_TTL = {
  ORDERS: 15 * 60 * 1000, // 15 minutes for orders list
  ORDER: 30 * 60 * 1000, // 30 minutes for single order
  LOCATIONS: 24 * 60 * 60 * 1000, // 24 hours for locations
  CUSTOMER_MAPPING: 24 * 60 * 60 * 1000, // 24 hours for customer mappings
  ORDER_MAPPING: 24 * 60 * 60 * 1000, // 24 hours for order mappings
};

// Max retries for API calls
const MAX_RETRIES = 3;

// Retry delay in milliseconds
const RETRY_DELAY = 1000;

// Max concurrency for order processing
const DEFAULT_CONCURRENCY = 5;

/**
 * Cache keys for different Shopify data types
 */
const cacheKeys = {
  order: (orderId: string) => `shopify:order:${orderId}`,
  orders: (shopName: string, fromDate?: string) =>
    `shopify:orders:${shopName}${fromDate ? `:${fromDate}` : ''}`,
  customer: (customerId: string) => `shopify:customer:${customerId}`,
  customerByEmail: (email: string) => `shopify:customerByEmail:${email}`,
  locations: (shopName: string) => `shopify:locations:${shopName}`,
  product: (productId: string) => `shopify:product:${productId}`,
};

/**
 * Shopify API responses and types
 */

// Shopify Pagination Info from Link header
interface ShopifyPaginationLinks {
  previous?: string;
  next?: string;
}

// Shopify Location
interface ShopifyLocation {
  id: number;
  name: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  zip: string;
  country_code: string;
  phone?: string;
  active: boolean;
  legacy: boolean;
  created_at: string;
  updated_at: string;
  admin_graphql_api_id: string;
}

// Shopify Locations Response
interface ShopifyLocationsResponse {
  locations: ShopifyLocation[];
}

// Shopify Order Response
interface ShopifyOrdersResponse {
  orders: ShopifyOrder[];
}

// Shopify Order
interface ShopifyOrder {
  id: number;
  admin_graphql_api_id: string;
  app_id?: number;
  browser_ip?: string;
  buyer_accepts_marketing: boolean;
  cancel_reason?: string;
  cancelled_at?: string;
  cart_token?: string;
  checkout_id?: number;
  checkout_token?: string;
  client_details?: {
    accept_language?: string;
    browser_height?: number;
    browser_ip?: string;
    browser_width?: number;
    session_hash?: string;
    user_agent?: string;
  };
  closed_at?: string;
  confirmed: boolean;
  contact_email?: string;
  created_at: string;
  currency: string;
  current_subtotal_price: string;
  current_total_discounts: string;
  current_total_price: string;
  current_total_tax: string;
  customer?: ShopifyCustomer;
  customer_locale?: string;
  discount_applications: Array<{
    type: string;
    value: string;
    value_type: string;
    allocation_method: string;
    target_selection: string;
    target_type: string;
    code?: string;
  }>;
  discount_codes: Array<{
    code: string;
    amount: string;
    type: string;
  }>;
  email: string;
  financial_status: string;
  fulfillment_status?: string;
  fulfillments?: ShopifyFulfillment[];
  gateway: string;
  landing_site?: string;
  landing_site_ref?: string;
  line_items: ShopifyLineItem[];
  location_id?: number;
  name: string;
  note?: string;
  note_attributes: Array<{
    name: string;
    value: string;
  }>;
  number: number;
  order_number: number;
  order_status_url: string;
  original_total_duties_set?: {
    shop_money: ShopifyMoney;
    presentment_money: ShopifyMoney;
  };
  payment_details?: {
    credit_card_bin?: string;
    avs_result_code?: string;
    cvv_result_code?: string;
    credit_card_number?: string;
    credit_card_company?: string;
  };
  payment_gateway_names: string[];
  phone?: string;
  presentment_currency: string;
  processed_at: string;
  processing_method: string;
  referring_site?: string;
  refunds: ShopifyRefund[];
  shipping_address?: ShopifyAddress;
  shipping_lines: ShopifyShippingLine[];
  source_identifier?: string;
  source_name: string;
  source_url?: string;
  subtotal_price: string;
  tags: string;
  tax_lines: Array<{
    price: string;
    rate: number;
    title: string;
  }>;
  taxes_included: boolean;
  test: boolean;
  token: string;
  total_discounts: string;
  total_line_items_price: string;
  total_price: string;
  total_price_usd?: string;
  total_shipping_price_set: {
    shop_money: ShopifyMoney;
    presentment_money: ShopifyMoney;
  };
  total_tax: string;
  total_weight?: number;
  updated_at: string;
  user_id?: number;
}

// Shopify Money
interface ShopifyMoney {
  amount: string;
  currency_code: string;
}

// Shopify Customer
interface ShopifyCustomer {
  id: number;
  email: string;
  accepts_marketing: boolean;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  orders_count: number;
  state: string;
  total_spent: string;
  last_order_id?: number;
  note?: string;
  verified_email: boolean;
  multipass_identifier?: string;
  tax_exempt: boolean;
  phone?: string;
  tags: string;
  last_order_name?: string;
  default_address?: ShopifyAddress;
}

// Shopify Address
interface ShopifyAddress {
  first_name?: string;
  address1: string;
  phone?: string;
  city: string;
  zip: string;
  province?: string;
  country: string;
  last_name?: string;
  address2?: string;
  company?: string;
  latitude?: number;
  longitude?: number;
  name?: string;
  country_code: string;
  province_code?: string;
}

// Shopify Line Item
interface ShopifyLineItem {
  id: number;
  admin_graphql_api_id: string;
  fulfillable_quantity: number;
  fulfillment_service: string;
  fulfillment_status?: string;
  gift_card: boolean;
  grams: number;
  name: string;
  price: string;
  price_set: {
    shop_money: ShopifyMoney;
    presentment_money: ShopifyMoney;
  };
  product_exists: boolean;
  product_id?: number;
  properties: Array<{
    name: string;
    value: string;
  }>;
  quantity: number;
  requires_shipping: boolean;
  sku?: string;
  taxable: boolean;
  title: string;
  total_discount: string;
  total_discount_set: {
    shop_money: ShopifyMoney;
    presentment_money: ShopifyMoney;
  };
  variant_id?: number;
  variant_inventory_management?: string;
  variant_title?: string;
  vendor?: string;
  tax_lines: Array<{
    price: string;
    price_set: {
      shop_money: ShopifyMoney;
      presentment_money: ShopifyMoney;
    };
    rate: number;
    title: string;
  }>;
  duties: Array<{
    id: string;
    admin_graphql_api_id: string;
    country_code_of_origin: string;
    harmonized_system_code: string;
    presentment_money: ShopifyMoney;
    shop_money: ShopifyMoney;
    tax_lines: Array<{
      price: string;
      price_set: {
        shop_money: ShopifyMoney;
        presentment_money: ShopifyMoney;
      };
      rate: number;
      title: string;
    }>;
  }>;
  discount_allocations: Array<{
    amount: string;
    amount_set: {
      shop_money: ShopifyMoney;
      presentment_money: ShopifyMoney;
    };
    discount_application_index: number;
  }>;
}

// Shopify Shipping Line
interface ShopifyShippingLine {
  id: number;
  carrier_identifier?: string;
  code: string;
  delivery_category?: string;
  discounted_price: string;
  discounted_price_set: {
    shop_money: ShopifyMoney;
    presentment_money: ShopifyMoney;
  };
  phone?: string;
  price: string;
  price_set: {
    shop_money: ShopifyMoney;
    presentment_money: ShopifyMoney;
  };
  requested_fulfillment_service_id?: string;
  source: string;
  title: string;
  tax_lines: Array<{
    price: string;
    price_set: {
      shop_money: ShopifyMoney;
      presentment_money: ShopifyMoney;
    };
    rate: number;
    title: string;
  }>;
  discount_allocations: Array<{
    amount: string;
    amount_set: {
      shop_money: ShopifyMoney;
      presentment_money: ShopifyMoney;
    };
    discount_application_index: number;
  }>;
}

// Shopify Fulfillment
interface ShopifyFulfillment {
  id: number;
  admin_graphql_api_id: string;
  created_at: string;
  location_id: number;
  name: string;
  order_id: number;
  receipt: {
    testcase: boolean;
    authorization: string;
  };
  service: string;
  shipment_status?: string;
  status: string;
  tracking_company?: string;
  tracking_number?: string;
  tracking_numbers: string[];
  tracking_url?: string;
  tracking_urls: string[];
  updated_at: string;
  line_items: ShopifyLineItem[];
}

// Shopify Refund
interface ShopifyRefund {
  id: number;
  admin_graphql_api_id: string;
  created_at: string;
  note?: string;
  order_id: number;
  processed_at: string;
  restock: boolean;
  user_id: number;
  refund_line_items: Array<{
    id: number;
    line_item_id: number;
    location_id: number;
    quantity: number;
    restock_type: string;
    subtotal: number;
    total_tax: number;
    line_item: ShopifyLineItem;
  }>;
  transactions: Array<{
    id: number;
    admin_graphql_api_id: string;
    amount: string;
    authorization?: string;
    created_at: string;
    currency: string;
    device_id?: number;
    error_code?: string;
    gateway: string;
    kind: string;
    location_id?: number;
    message?: string;
    order_id: number;
    parent_id?: number;
    processed_at: string;
    source_name: string;
    status: string;
    test: boolean;
    user_id?: number;
  }>;
  order_adjustments: Array<{
    id: number;
    amount: string;
    tax_amount: string;
    kind: string;
    reason: string;
  }>;
}

// Fulfillment request payload
interface ShopifyFulfillmentRequest {
  fulfillment: {
    location_id: number;
    tracking_number?: string;
    tracking_company?: string;
    tracking_url?: string;
    notify_customer?: boolean;
    line_items?: Array<{
      id: number;
      quantity: number;
    }>;
  };
}

/**
 * Custom error class for Shopify API errors
 */
class ShopifyApiError extends Error {
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
    this.name = 'ShopifyApiError';
    this.status = options.status;
    this.code = options.code;
    this.retryable = options.retryable !== undefined ? options.retryable : true;
    this.originalError = options.originalError;
  }
}

/**
 * API request metrics tracking
 */
interface ShopifyApiMetrics {
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
 * Circuit breaker for Shopify API calls
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
    if (!(error instanceof ShopifyApiError) || error.retryable) {
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
 * Extract Link header pagination information
 * @param linkHeader Link header string
 * @returns Object with next and previous URLs
 */
function parseLinkHeader(linkHeader?: string): ShopifyPaginationLinks {
  if (!linkHeader) return {};

  const links: ShopifyPaginationLinks = {};

  // Link header format: <url>; rel="next", <url>; rel="previous"
  const parts = linkHeader.split(',');

  for (const part of parts) {
    const section = part.split(';');
    if (section.length !== 2) continue;

    // Extract URL (remove < and >)
    const url = section[0].trim().slice(1, -1);

    // Extract rel (remove quotes and trim)
    const rel = section[1].trim().match(/rel="([^"]+)"/);
    if (!rel || rel.length !== 2) continue;

    if (rel[1] === 'next') links.next = url;
    if (rel[1] === 'previous') links.previous = url;
  }

  return links;
}

/**
 * Shopify API client with authentication and token management
 */
class ShopifyApiClient {
  private axiosInstance: AxiosInstance;
  private readonly config: PlatformAuthConfig;
  private readonly baseUrl: string;
  private circuitBreaker: CircuitBreaker;
  private metrics: ShopifyApiMetrics;
  private _locations?: ShopifyLocation[];

  /**
   * Create a new Shopify API client
   * @param config Platform authentication configuration
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

    if (!config.shopName) {
      throw new Error('Shopify shop name is required in the configuration');
    }

    this.baseUrl = `https://${config.shopName}.myshopify.com/admin/api/2023-04`;

    this.axiosInstance = axios.create({
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': config.accessToken || '',
      },
      timeout: 30000, // 30 second timeout
    });

    // Add request interceptor for metrics
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Track request metrics
        this.metrics.totalRequests++;
        this.metrics.lastRequestTime = new Date();

        const endpoint = this.getEndpointFromUrl(config.url || '');
        this.metrics.requestsByEndpoint[endpoint] =
          (this.metrics.requestsByEndpoint[endpoint] || 0) + 1;

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling and metrics
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

        if (error.response) {
          // Handle rate limiting (429)
          if (error.response.status === 429) {
            this.metrics.rateLimitedRequests++;

            // Get retry-after header
            const retryAfter = parseInt(
              error.response.headers['retry-after'] || '5',
              10
            );
            console.warn(
              `Rate limited by Shopify. Retry after ${retryAfter} seconds.`
            );

            return Promise.reject(
              new ShopifyApiError(
                `Rate limited by Shopify. Retry after ${retryAfter} seconds.`,
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
          if (error.response.status === 401 || error.response.status === 403) {
            return Promise.reject(
              new ShopifyApiError(
                `Authentication error: ${
                  error.response.data?.errors || error.message
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

          // Handle other API errors
          console.error('Shopify API Error:', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
          });

          return Promise.reject(
            new ShopifyApiError(
              `Shopify API error (${error.response.status}): ${
                error.response.data?.errors || error.response.statusText
              }`,
              {
                status: error.response.status,
                code: 'API_ERROR',
                retryable:
                  error.response.status >= 500 || error.response.status === 0,
                originalError: error,
              }
            )
          );
        }

        // Handle network errors
        return Promise.reject(
          new ShopifyApiError(`Shopify API request failed: ${error.message}`, {
            retryable: true,
            originalError: error,
          })
        );
      }
    );
  }

  /**
   * Get endpoint name from URL for metrics tracking
   */
  private getEndpointFromUrl(url: string): string {
    const apiPrefix = '/admin/api/';

    // Check if URL contains API prefix
    const apiPrefixIndex = url.indexOf(apiPrefix);
    if (apiPrefixIndex !== -1) {
      // Get the part after the API version
      const afterVersion = url.substring(
        url.indexOf('/', apiPrefixIndex + apiPrefix.length + 8) + 1
      );
      // Extract resource type (e.g., orders, products)
      return afterVersion.split('/')[0];
    }

    // Default to full path without query
    return url.split('?')[0];
  }

  /**
   * Get metrics for this client instance
   */
  public getMetrics(): ShopifyApiMetrics {
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
   * Make a request to the Shopify Admin API with circuit breaker pattern
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
        const url = `${this.baseUrl}${endpoint}`;
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
   * Make a request with pagination handling
   * @param method HTTP method
   * @param endpoint API endpoint
   * @param params Query parameters
   * @param data Request body
   */
  public async requestWithPagination<T>(
    method: string,
    endpoint: string,
    params?: Record<string, any>,
    data?: any
  ): Promise<{ data: T; pagination: ShopifyPaginationLinks }> {
    try {
      const url = `${this.baseUrl}${endpoint}`;

      const response = await this.axiosInstance.request({
        method,
        url,
        params,
        data,
      });

      // Parse Link header for pagination
      const linkHeader = response.headers.link || response.headers.Link;
      const pagination = parseLinkHeader(linkHeader);

      return {
        data: response.data,
        pagination,
      };
    } catch (error) {
      // Let the interceptor handle the error transformation
      throw error;
    }
  }

  /**
   * Get orders from Shopify
   * @param params Query parameters for filtering orders
   */
  public async getOrders(params: Record<string, any> = {}): Promise<{
    orders: ShopifyOrder[];
    pagination: ShopifyPaginationLinks;
  }> {
    const response = await this.requestWithPagination<ShopifyOrdersResponse>(
      'GET',
      '/orders.json',
      {
        status: 'any',
        limit: 50,
        ...params,
      }
    );

    return {
      orders: response.data.orders,
      pagination: response.pagination,
    };
  }

  /**
   * Get a specific order by ID
   * @param orderId Order ID
   */
  public async getOrder(orderId: number): Promise<{ order: ShopifyOrder }> {
    return this.request<{ order: ShopifyOrder }>(
      'GET',
      `/orders/${orderId}.json`
    );
  }

  /**
   * Get all locations for the shop
   */
  public async getLocations(): Promise<ShopifyLocation[]> {
    // Return cached locations if available
    if (this._locations) {
      return this._locations;
    }

    // Check if locations are in the cache
    const cacheKey = cacheKeys.locations(this.config.shopName || '');
    if (hasCacheItem(cacheKey)) {
      this._locations = getCacheItem<ShopifyLocation[]>(cacheKey);
      return this._locations || [];
    }

    // Fetch locations from API
    const response = await this.request<ShopifyLocationsResponse>(
      'GET',
      '/locations.json'
    );
    this._locations = response.locations;

    // Cache locations
    setCacheItem(cacheKey, this._locations, CACHE_TTL.LOCATIONS);

    return this._locations;
  }

  /**
   * Get the primary active location ID
   */
  public async getPrimaryLocationId(): Promise<number> {
    const locations = await this.getLocations();

    // Find first active location
    const primaryLocation = locations.find((location) => location.active);

    if (!primaryLocation) {
      throw new ShopifyApiError('No active location found for fulfillment', {
        code: 'NO_ACTIVE_LOCATION',
        retryable: false,
      });
    }

    return primaryLocation.id;
  }

  /**
   * Create a fulfillment for an order
   * @param orderId Order ID
   * @param fulfillmentData Fulfillment data
   */
  public async createFulfillment(
    orderId: number,
    fulfillmentData: ShopifyFulfillmentRequest['fulfillment']
  ): Promise<{ fulfillment: ShopifyFulfillment }> {
    return this.request<{ fulfillment: ShopifyFulfillment }>(
      'POST',
      `/orders/${orderId}/fulfillments.json`,
      undefined,
      { fulfillment: fulfillmentData }
    );
  }

  /**
   * Get a customer by ID
   * @param customerId Customer ID
   */
  public async getCustomer(
    customerId: number
  ): Promise<{ customer: ShopifyCustomer }> {
    return this.request<{ customer: ShopifyCustomer }>(
      'GET',
      `/customers/${customerId}.json`
    );
  }

  /**
   * Search for customers by email
   * @param email Customer email
   */
  public async searchCustomers(email: string): Promise<{
    customers: ShopifyCustomer[];
    pagination: ShopifyPaginationLinks;
  }> {
    // Use the customer search endpoint with email query
    const response = await this.requestWithPagination<{
      customers: ShopifyCustomer[];
    }>('GET', '/customers/search.json', { query: `email:${email}`, limit: 1 });

    return {
      customers: response.data.customers,
      pagination: response.pagination,
    };
  }
}

/**
 * Calculate Shopify platform fees
 * @param total Total order amount
 * @returns Calculated fees
 */
const calculateShopifyFees = (total: number): number => {
  // Shopify typically charges 2.0% + $0.30 per transaction for online payments
  const percentage = 0.02; // 2.0%
  const fixedFee = 0.3; // $0.30

  return Math.round((total * percentage + fixedFee) * 100) / 100;
};

/**
 * Find or create a customer from Shopify customer data
 * @param shopifyCustomer Shopify customer data
 * @returns HideSync Customer object
 */
const findOrCreateCustomer = async (
  shopifyCustomer?: ShopifyCustomer,
  email?: string,
  name?: string
): Promise<Customer> => {
  // If no customer data provided, create a placeholder
  if (!shopifyCustomer && !email) {
    return {
      id: 0, // Special ID for anonymous customer
      name: name || 'Shopify Customer',
      email: 'anonymous@shopify.com',
      phone: '',
      status: CustomerStatus.ACTIVE,
      tier: CustomerTier.STANDARD,
      source: CustomerSource.ONLINE_STORE,
    };
  }

  // Use provided email or get from customer data
  const customerEmail = email || shopifyCustomer?.email || '';

  // Check cache for customer by email
  const cacheKey = cacheKeys.customerByEmail(customerEmail);
  if (hasCacheItem(cacheKey)) {
    return (
      getCacheItem<Customer>(cacheKey) || {
        id: 0,
        name: name || 'Shopify Customer',
        email: customerEmail,
        phone: '',
        status: CustomerStatus.ACTIVE,
        tier: CustomerTier.STANDARD,
        source: CustomerSource.ONLINE_STORE,
      }
    );
  }

  try {
    // Try to find customer by email in our system
    const response = await apiClient.get<Customer[]>('/customers', {
      params: { email: customerEmail },
    });

    if (response.data && response.data.length > 0) {
      // Customer exists, cache and return
      const customer = response.data[0];
      setCacheItem(cacheKey, customer, CACHE_TTL.CUSTOMER_MAPPING);
      return customer;
    }

    // Customer doesn't exist, create a new one
    const newCustomer: Partial<Customer> = {
      name: shopifyCustomer
        ? `${shopifyCustomer.first_name || ''} ${
            shopifyCustomer.last_name || ''
          }`.trim()
        : name || 'Shopify Customer',
      email: customerEmail,
      phone: shopifyCustomer?.phone || '',
      status: CustomerStatus.ACTIVE,
      tier: CustomerTier.STANDARD,
      source: CustomerSource.ONLINE_STORE,
    };

    const createResult = await apiClient.post<Customer>(
      '/customers',
      newCustomer
    );
    const createdCustomer = createResult.data;

    // Cache the new customer
    setCacheItem(cacheKey, createdCustomer, CACHE_TTL.CUSTOMER_MAPPING);

    return createdCustomer;
  } catch (error) {
    console.error('Error finding/creating customer:', error);

    // Return a temporary customer object with error flag
    return {
      id: -1, // Negative ID indicates error
      name: shopifyCustomer
        ? `${shopifyCustomer.first_name || ''} ${
            shopifyCustomer.last_name || ''
          }`.trim()
        : name || 'Shopify Customer',
      email: customerEmail,
      phone: shopifyCustomer?.phone || '',
      status: CustomerStatus.ACTIVE,
      tier: CustomerTier.STANDARD,
      source: CustomerSource.ONLINE_STORE,
    };
  }
};

/**
 * Convert Shopify order to HideSync Sale
 * @param shopifyOrder Shopify order data
 * @returns Sale object
 */
const convertShopifyOrderToSale = async (
  shopifyOrder: ShopifyOrder
): Promise<Sale> => {
  // Map Shopify financial status to HideSync payment status
  const mapPaymentStatus = (status: string): PaymentStatus => {
    switch (status) {
      case 'paid':
        return PaymentStatus.PAID;
      case 'partially_paid':
        return PaymentStatus.PARTIALLY_PAID;
      case 'pending':
        return PaymentStatus.PENDING;
      case 'refunded':
        return PaymentStatus.REFUNDED;
      case 'partially_refunded':
        return PaymentStatus.PARTIALLY_REFUNDED;
      case 'voided':
        return PaymentStatus.CANCELLED;
      default:
        return PaymentStatus.PENDING;
    }
  };

  // Map Shopify fulfillment status to HideSync fulfillment status
  const mapFulfillmentStatus = (
    status: string | null | undefined
  ): FulfillmentStatus => {
    switch (status) {
      case 'fulfilled':
        return FulfillmentStatus.SHIPPED;
      case 'partial':
        return FulfillmentStatus.READY_TO_SHIP;
      case null:
      case undefined:
        return FulfillmentStatus.PENDING;
      default:
        return FulfillmentStatus.PENDING;
    }
  };

  // Map overall order status
  const determineOrderStatus = (order: ShopifyOrder): SaleStatus => {
    if (order.cancelled_at) {
      return SaleStatus.CANCELLED;
    }

    if (order.fulfillment_status === 'fulfilled') {
      return SaleStatus.SHIPPED;
    }

    if (order.fulfillment_status === 'partial') {
      return SaleStatus.IN_PROGRESS;
    }

    if (order.financial_status === 'paid') {
      return SaleStatus.CONFIRMED;
    }

    return SaleStatus.INQUIRY;
  };

  // Convert Shopify address to HideSync address
  const convertAddress = (
    shopifyAddress: ShopifyAddress | undefined
  ): Address | undefined => {
    if (!shopifyAddress) return undefined;

    return {
      street: [shopifyAddress.address1, shopifyAddress.address2]
        .filter(Boolean)
        .join(', '),
      city: shopifyAddress.city,
      state: shopifyAddress.province || '',
      postalCode: shopifyAddress.zip,
      country: shopifyAddress.country,
    };
  };

  // Find or create customer
  const customer = await findOrCreateCustomer(
    shopifyOrder.customer,
    shopifyOrder.email,
    shopifyOrder.shipping_address?.name
  );

  // Convert line items
  const items: SalesItem[] = shopifyOrder.line_items.map((item) => ({
    id: item.id,
    name: item.name || item.title,
    sku: item.sku || `SHOPIFY-${item.product_id || item.variant_id || item.id}`,
    price: parseFloat(item.price),
    quantity: item.quantity,
    type: 'PRODUCT',
    productId: item.product_id,
    notes:
      item.properties && item.properties.length > 0
        ? item.properties
            .map((prop) => `${prop.name}: ${prop.value}`)
            .join(', ')
        : undefined,
  }));

  // Calculate totals
  const subtotal = parseFloat(shopifyOrder.subtotal_price);
  const taxes = parseFloat(shopifyOrder.total_tax);
  const shipping = shopifyOrder.total_shipping_price_set
    ? parseFloat(shopifyOrder.total_shipping_price_set.shop_money.amount)
    : 0;
  const total = parseFloat(shopifyOrder.total_price);

  // Calculate platform fees using our dedicated function
  const platformFees = calculateShopifyFees(total);

  // Extract tags
  const tags = shopifyOrder.tags
    ? shopifyOrder.tags.split(',').map((tag) => tag.trim())
    : [];

  // Get tracking info from fulfillments
  const trackingInfo =
    shopifyOrder.fulfillments && shopifyOrder.fulfillments.length > 0
      ? {
          trackingNumber: shopifyOrder.fulfillments[0].tracking_number,
          trackingUrl: shopifyOrder.fulfillments[0].tracking_url,
          shippingProvider: shopifyOrder.fulfillments[0].tracking_company,
        }
      : {
          trackingNumber: undefined,
          trackingUrl: undefined,
          shippingProvider: undefined,
        };

  return {
    id: shopifyOrder.id,
    customer,
    createdAt: shopifyOrder.created_at,
    completedDate: shopifyOrder.closed_at,
    subtotal,
    taxes,
    shipping,
    platformFees,
    totalAmount: total,
    total, // For backward compatibility
    netRevenue: total - platformFees,
    depositAmount: total, // Shopify typically collects full payment
    balanceDue: 0,
    status: determineOrderStatus(shopifyOrder),
    paymentStatus: mapPaymentStatus(shopifyOrder.financial_status),
    fulfillmentStatus: mapFulfillmentStatus(shopifyOrder.fulfillment_status),
    channel: SalesChannel.SHOPIFY,
    platformOrderId: shopifyOrder.order_number.toString(),
    marketplaceData: {
      externalOrderId: shopifyOrder.order_number.toString(),
      platform: SalesChannel.SHOPIFY,
      orderUrl: shopifyOrder.order_status_url,
      platformFees,
    },
    shippingMethod:
      shopifyOrder.shipping_lines.length > 0
        ? shopifyOrder.shipping_lines[0].title
        : undefined,
    shippingProvider: trackingInfo.shippingProvider,
    trackingNumber: trackingInfo.trackingNumber,
    tags,
    notes: shopifyOrder.note,
    items,
    communications: [],
    shippingAddress: convertAddress(shopifyOrder.shipping_address),
  };
};

/**
 * Process orders in parallel with controlled concurrency
 * @param orders Shopify orders to process
 * @param concurrencyLimit Maximum number of orders to process concurrently
 */
const processOrdersConcurrently = async (
  orders: ShopifyOrder[],
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
          return await convertShopifyOrderToSale(order);
        } catch (error) {
          console.error(`Error processing order ${order.id}:`, error);
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
 * Fetch all orders from Shopify with pagination
 * @param client Shopify API client
 * @param fromDate Optional date to fetch orders from
 * @param limit Maximum number of orders to fetch
 */
const fetchAllOrders = async (
  client: ShopifyApiClient,
  fromDate?: Date,
  limit: number = 250
): Promise<ShopifyOrder[]> => {
  const params: Record<string, any> = {
    limit: Math.min(limit, 250), // Shopify maximum is 250 per page
    status: 'any',
  };

  if (fromDate) {
    params.created_at_min = fromDate.toISOString();
  }

  let allOrders: ShopifyOrder[] = [];
  let hasMoreOrders = true;
  let nextPageUrl: string | undefined;

  while (hasMoreOrders && allOrders.length < limit) {
    try {
      let result;

      if (nextPageUrl) {
        // Extract query parameters from the next page URL
        const url = new URL(nextPageUrl);
        const queryParams: Record<string, any> = {};

        url.searchParams.forEach((value, key) => {
          queryParams[key] = value;
        });

        // Use the path and query params for the next request
        const path = url.pathname.replace('/admin/api/2023-04', '');
        const response =
          await client.requestWithPagination<ShopifyOrdersResponse>(
            'GET',
            path,
            queryParams
          );

        // Transform to match getOrders result structure
        result = {
          orders: response.data.orders,
          pagination: response.pagination,
        };
      } else {
        // First page request
        result = await client.getOrders(params);
      }

      const orders = result.orders; // Now this works!
      allOrders = [...allOrders, ...orders];

      // Check if we need to fetch more pages
      if (
        orders.length === 0 ||
        !result.pagination.next ||
        allOrders.length >= limit
      ) {
        hasMoreOrders = false;
      } else {
        nextPageUrl = result.pagination.next;
      }
    } catch (error) {
      if (error instanceof ShopifyApiError && error.status === 429) {
        // Rate limited, wait before retrying
        const retryAfter =
          error.originalError?.response?.headers?.['retry-after'] || 10;
        console.warn(
          `Rate limited by Shopify. Waiting ${retryAfter} seconds before retrying...`
        );
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        continue;
      }

      console.error('Error fetching Shopify orders:', error);

      // If we have some orders, continue with those rather than failing completely
      if (allOrders.length > 0) {
        console.warn(
          `Continuing with ${allOrders.length} orders collected before error`
        );
        hasMoreOrders = false;
      } else {
        // If we have no orders, rethrow the error
        throw error;
      }
    }
  }

  return allOrders;
};
/**
 * Fetch orders from Shopify
 * @param config Platform auth configuration
 * @param fromDate Optional date to fetch orders from
 */
export const fetchShopifyOrders = async (
  config: PlatformAuthConfig,
  fromDate?: Date,
  options?: {
    concurrencyLimit?: number;
    forceRefresh?: boolean;
  }
): Promise<Sale[]> => {
  const concurrencyLimit = options?.concurrencyLimit || DEFAULT_CONCURRENCY;
  const forceRefresh = options?.forceRefresh || false;

  console.log('Fetching Shopify orders with config:', {
    ...config,
    accessToken: config.accessToken ? '***REDACTED***' : undefined,
    apiSecret: config.apiSecret ? '***REDACTED***' : undefined,
  });

  if (fromDate) {
    console.log('From date:', fromDate);
  }

  try {
    const shopName = config.shopName || '';

    // Check cache first (if not forcing refresh and not using date filter)
    if (!forceRefresh && !fromDate) {
      const cacheKey = cacheKeys.orders(shopName);
      if (hasCacheItem(cacheKey)) {
        console.log(`Using cached Shopify orders for ${shopName}`);
        return getCacheItem<Sale[]>(cacheKey) || [];
      }
    }

    // Create Shopify API client
    const client = new ShopifyApiClient(config);

    // Fetch all orders with pagination
    const orders = await fetchAllOrders(client, fromDate);
    console.log(`Fetched ${orders.length} Shopify orders`);

    // Process orders in parallel with concurrency control
    const sales = await processOrdersConcurrently(orders, concurrencyLimit);
    console.log(`Processed ${sales.length} Shopify orders into sales`);

    // Cache results if not using date filter and not forcing refresh
    if (!fromDate && !forceRefresh) {
      const cacheKey = cacheKeys.orders(shopName);
      setCacheItem(cacheKey, sales, CACHE_TTL.ORDERS);
    }

    // Log metrics
    console.log('Shopify API metrics:', client.getMetrics());

    return sales;
  } catch (error) {
    if (error instanceof ShopifyApiError) {
      console.error('Shopify API error:', {
        message: error.message,
        code: error.code,
        status: error.status,
        retryable: error.retryable,
      });
    } else {
      console.error('Error fetching Shopify orders:', error);
    }

    throw new Error(
      `Failed to fetch Shopify orders: ${(error as Error).message}`
    );
  }
};

/**
 * Update fulfillment for a Shopify order
 * @param orderId Order ID
 * @param trackingNumber Tracking number
 * @param shippingProvider Shipping provider
 * @param config Platform auth configuration
 */
export const updateShopifyFulfillment = async (
  orderId: string,
  trackingNumber: string,
  shippingProvider: string,
  config: PlatformAuthConfig
): Promise<boolean> => {
  try {
    console.log('Updating Shopify fulfillment for order:', orderId);
    console.log('Tracking number:', trackingNumber);
    console.log('Shipping provider:', shippingProvider);

    // Create Shopify API client
    const client = new ShopifyApiClient(config);

    // First, get the order to find line items that need fulfillment
    const { order } = await client.getOrder(parseInt(orderId, 10));

    // Get location ID for the fulfillment
    const locationId = await client.getPrimaryLocationId();

    // Prepare line items for fulfillment - only those that aren't fulfilled
    const lineItems = order.line_items
      .filter((item) => item.fulfillment_status !== 'fulfilled')
      .map((item) => ({
        id: item.id,
        quantity: item.quantity,
      }));

    if (lineItems.length === 0) {
      console.log('All items already fulfilled for order:', orderId);
      return true;
    }

    // Attempt to create the fulfillment with retry logic
    let attempts = 0;
    let success = false;
    let lastError: any;

    while (attempts < MAX_RETRIES && !success) {
      try {
        // Create the fulfillment
        await client.createFulfillment(parseInt(orderId, 10), {
          location_id: locationId,
          tracking_number: trackingNumber,
          tracking_company: shippingProvider,
          notify_customer: true,
          line_items: lineItems,
        });

        success = true;
      } catch (error) {
        lastError = error;
        attempts++;

        // Only retry if error is retryable
        if (error instanceof ShopifyApiError && !error.retryable) {
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
    const ordersListCacheKey = cacheKeys.orders(config.shopName || '');
    if (hasCacheItem(ordersListCacheKey)) {
      setCacheItem(ordersListCacheKey, null);
    }

    return true;
  } catch (error) {
    if (error instanceof ShopifyApiError) {
      console.error('Shopify API error updating fulfillment:', {
        message: error.message,
        code: error.code,
        status: error.status,
        retryable: error.retryable,
      });
    } else {
      console.error('Error updating Shopify fulfillment:', error);
    }

    throw new Error(
      `Failed to update Shopify fulfillment: ${(error as Error).message}`
    );
  }
};

/**
 * Generate authorization URL for Shopify OAuth flow
 * @param shopName Shopify shop name
 * @param apiKey API key (client ID)
 * @param redirectUri Redirect URI
 * @param scopes OAuth scopes
 * @returns Authorization URL
 */
export const getShopifyAuthUrl = (
  shopName: string,
  apiKey: string,
  redirectUri: string,
  scopes: string[]
): string => {
  const shopUrl = `${shopName}.myshopify.com`;
  const scopesParam = scopes.join(',');
  return `https://${shopUrl}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopesParam}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}`;
};

/**
 * Exchange authorization code for access token (OAuth flow)
 * @param shopName Shopify shop name
 * @param apiKey API key (client ID)
 * @param apiSecret API secret (client secret)
 * @param code Authorization code
 * @returns Platform auth configuration with access token
 */
export const exchangeShopifyAuthCode = async (
  shopName: string,
  apiKey: string,
  apiSecret: string,
  code: string
): Promise<PlatformAuthConfig> => {
  try {
    console.log('Exchanging auth code for Shopify access token');
    console.log('Shop:', shopName);

    const shopUrl = `${shopName}.myshopify.com`;

    const response = await axios.post<{
      access_token: string;
      scope: string;
    }>(`https://${shopUrl}/admin/oauth/access_token`, {
      client_id: apiKey,
      client_secret: apiSecret,
      code,
    });

    return {
      shopName,
      apiKey,
      apiSecret,
      accessToken: response.data.access_token,
      scopes: response.data.scope.split(','),
    };
  } catch (error) {
    console.error('Error exchanging Shopify auth code:', error);
    throw new Error(
      `Failed to exchange Shopify auth code: ${(error as Error).message}`
    );
  }
};
