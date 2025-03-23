// src/services/customer-service.ts
import { CustomerSource, CustomerStatus, CustomerTier } from '../types/enums';
import { Customer, Sale } from '../types/salesTypes';
import { apiClient, ApiError } from './api-client';

/**
 * Interface for customer filters
 */
export interface CustomerFilters {
  email?: string;
  name?: string;
  phone?: string;
  status?: CustomerStatus | CustomerStatus[];
  tier?: CustomerTier | CustomerTier[];
  source?: CustomerSource | CustomerSource[];
  searchQuery?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Interface for external customer mapping
 */
export interface ExternalCustomerMapping {
  externalId: string;
  platform: string;
  internalId: number;
  email: string;
  lastSyncedAt: string;
}

/**
 * Interface for customer stats
 */
export interface CustomerStats {
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  firstPurchaseDate?: string;
  lastPurchaseDate?: string;
  lifetimeValue: number;
}

/**
 * Cache with automatic expiration
 */
class ExpiringCache<T> {
  private cache = new Map<string, { value: T; expiresAt: number }>();
  private readonly defaultTtl: number;

  constructor(defaultTtlMs: number = 5 * 60 * 1000) {
    // 5 minutes default
    this.defaultTtl = defaultTtlMs;
    // Periodically clean expired items
    setInterval(() => this.cleanExpired(), 60000);
  }

  /**
   * Get an item from cache
   * @param key Cache key
   * @returns Cached value or undefined if not found or expired
   */
  get(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

    // Check if item is expired
    if (item.expiresAt < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }

    return item.value;
  }

  /**
   * Set an item in cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttlMs Time to live in milliseconds
   */
  set(key: string, value: T, ttlMs?: number): void {
    const expiresAt = Date.now() + (ttlMs || this.defaultTtl);
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Remove an item from cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cached items
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clean expired items from cache
   */
  private cleanExpired(): void {
    const now = Date.now();
    Array.from(this.cache.entries()).forEach(([key, item]) => {
      if (item.expiresAt < now) {
        this.cache.delete(key);
      }
    });
  }
}

/**
 * Customer service for managing customers
 */
class CustomerService {
  // Caches for customers, with 10 min TTL for collection, 5 min for individual items
  private customerCache = new ExpiringCache<Customer[]>(10 * 60 * 1000);
  private customerDetailCache = new ExpiringCache<Customer>(5 * 60 * 1000);

  // Cache for email-to-ID mapping with 30 min TTL (less likely to change)
  private emailToIdCache = new ExpiringCache<number>(30 * 60 * 1000);

  // Cache for external ID mappings with 1 hour TTL
  private externalIdMappings = new ExpiringCache<Map<string, number>>(
    60 * 60 * 1000
  );

  // Base API path
  private readonly BASE_PATH = '/customers';
  private readonly MAPPING_PATH = '/integration-mappings/customers';

  /**
   * Format error for error handling
   */
  private formatError(error: unknown, context: string): ApiError {
    const apiError = error as ApiError;
    console.error(`Customer service - Error ${context}:`, apiError);
    return apiError;
  }

  /**
   * Get a customer by ID
   * @param id Customer ID
   */
  public async getCustomerById(id: number): Promise<Customer> {
    // Check cache first
    const cachedCustomer = this.customerDetailCache.get(`customer:${id}`);
    if (cachedCustomer) {
      return cachedCustomer;
    }

    try {
      const response = await apiClient.get<Customer>(`${this.BASE_PATH}/${id}`);
      const customer = response.data;

      // Update caches
      this.customerDetailCache.set(`customer:${id}`, customer);
      if (customer.email) {
        this.emailToIdCache.set(`email:${customer.email}`, id);
      }

      return customer;
    } catch (error) {
      throw this.formatError(error, `fetching customer with ID ${id}`);
    }
  }

  /**
   * Get customers matching filters
   * @param filters Customer filters
   */
  public async getCustomers(filters?: CustomerFilters): Promise<Customer[]> {
    // Generate cache key based on filters
    const cacheKey = `customers:${JSON.stringify(filters || {})}`;

    // Check cache first
    const cachedCustomers = this.customerCache.get(cacheKey);
    if (cachedCustomers) {
      return cachedCustomers;
    }

    try {
      const response = await apiClient.get<Customer[]>(this.BASE_PATH, {
        params: filters,
      });

      // Update caches
      this.customerCache.set(cacheKey, response.data);

      // Also cache individual customers and email mappings
      response.data.forEach((customer) => {
        this.customerDetailCache.set(`customer:${customer.id}`, customer);
        if (customer.email) {
          this.emailToIdCache.set(`email:${customer.email}`, customer.id);
        }
      });

      return response.data;
    } catch (error) {
      throw this.formatError(error, 'fetching customers');
    }
  }

  /**
   * Create a new customer
   * @param customerData Customer data
   */
  public async createCustomer(
    customerData: Partial<Customer>
  ): Promise<Customer> {
    try {
      const response = await apiClient.post<Customer>(
        this.BASE_PATH,
        customerData
      );
      const newCustomer = response.data;

      // Update caches
      this.customerDetailCache.set(`customer:${newCustomer.id}`, newCustomer);
      if (newCustomer.email) {
        this.emailToIdCache.set(`email:${newCustomer.email}`, newCustomer.id);
      }

      // Invalidate collection cache since we added a new customer
      this.customerCache.clear();

      return newCustomer;
    } catch (error) {
      throw this.formatError(error, 'creating customer');
    }
  }

  /**
   * Update an existing customer
   * @param id Customer ID
   * @param customerData Updated customer data
   */
  public async updateCustomer(
    id: number,
    customerData: Partial<Customer>
  ): Promise<Customer> {
    try {
      const response = await apiClient.put<Customer>(
        `${this.BASE_PATH}/${id}`,
        customerData
      );
      const updatedCustomer = response.data;

      // Update caches
      this.customerDetailCache.set(
        `customer:${updatedCustomer.id}`,
        updatedCustomer
      );
      if (updatedCustomer.email) {
        this.emailToIdCache.set(
          `email:${updatedCustomer.email}`,
          updatedCustomer.id
        );
      }

      // Invalidate collection cache since we updated a customer
      this.customerCache.clear();

      return updatedCustomer;
    } catch (error) {
      throw this.formatError(error, `updating customer with ID ${id}`);
    }
  }

  /**
   * Delete a customer
   * @param id Customer ID
   */
  public async deleteCustomer(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/${id}`);

      // Invalidate caches
      this.customerDetailCache.delete(`customer:${id}`);
      this.customerCache.clear();

      // We should also invalidate email cache, but we don't know the email here
      // A more sophisticated implementation would fetch the customer first
    } catch (error) {
      throw this.formatError(error, `deleting customer with ID ${id}`);
    }
  }

  /**
   * Find a customer by email
   * @param email Customer email
   */
  public async findCustomerByEmail(email: string): Promise<Customer | null> {
    // Check email cache first
    const cachedId = this.emailToIdCache.get(`email:${email}`);
    if (cachedId !== undefined) {
      return this.getCustomerById(cachedId);
    }

    try {
      const response = await apiClient.get<Customer[]>(this.BASE_PATH, {
        params: { email },
      });

      if (response.data.length > 0) {
        const customer = response.data[0];

        // Update caches
        this.customerDetailCache.set(`customer:${customer.id}`, customer);
        this.emailToIdCache.set(`email:${email}`, customer.id);

        return customer;
      }

      return null;
    } catch (error) {
      throw this.formatError(error, `finding customer with email ${email}`);
    }
  }

  /**
   * Find a customer by external ID from a platform
   * @param platform Platform name
   * @param externalId External customer ID
   */
  public async findCustomerByExternalId(
    platform: string,
    externalId: string
  ): Promise<Customer | null> {
    // Check platform cache
    const platformCache = this.externalIdMappings.get(`platform:${platform}`);
    if (platformCache) {
      const internalId = platformCache.get(externalId);
      if (internalId !== undefined) {
        return this.getCustomerById(internalId);
      }
    }

    try {
      // Query the mapping API
      const response = await apiClient.get<ExternalCustomerMapping[]>(
        this.MAPPING_PATH,
        {
          params: { platform, externalId },
        }
      );

      if (response.data.length > 0) {
        const mapping = response.data[0];

        // Get the customer
        const customer = await this.getCustomerById(mapping.internalId);

        // Update the platform cache
        let platformCache = this.externalIdMappings.get(`platform:${platform}`);
        if (!platformCache) {
          platformCache = new Map<string, number>();
          this.externalIdMappings.set(`platform:${platform}`, platformCache);
        }
        platformCache.set(externalId, mapping.internalId);

        return customer;
      }

      return null;
    } catch (error) {
      throw this.formatError(
        error,
        `finding customer with external ID ${externalId} on platform ${platform}`
      );
    }
  }

  /**
   * Create or update an external customer mapping
   * @param mapping External customer mapping
   */
  public async saveExternalCustomerMapping(
    mapping: ExternalCustomerMapping
  ): Promise<void> {
    try {
      await apiClient.post<void>(this.MAPPING_PATH, mapping);

      // Update the platform cache
      let platformCache = this.externalIdMappings.get(
        `platform:${mapping.platform}`
      );
      if (!platformCache) {
        platformCache = new Map<string, number>();
        this.externalIdMappings.set(
          `platform:${mapping.platform}`,
          platformCache
        );
      }
      platformCache.set(mapping.externalId, mapping.internalId);
    } catch (error) {
      throw this.formatError(error, 'saving external customer mapping');
    }
  }

  /**
   * Find or create a customer based on marketplace data
   * @param platform Platform name
   * @param externalId External customer ID
   * @param customerData Customer data
   */
  public async findOrCreateCustomer(
    platform: string,
    externalId: string,
    customerData: Partial<Customer>
  ): Promise<Customer> {
    try {
      // Try to find by external ID first
      const customerByExternalId = await this.findCustomerByExternalId(
        platform,
        externalId
      );
      if (customerByExternalId) {
        return customerByExternalId;
      }

      // Then try to find by email
      if (customerData.email) {
        const customerByEmail = await this.findCustomerByEmail(
          customerData.email
        );
        if (customerByEmail) {
          // Found by email, create mapping and return
          await this.saveExternalCustomerMapping({
            externalId,
            platform,
            internalId: customerByEmail.id,
            email: customerData.email,
            lastSyncedAt: new Date().toISOString(),
          });
          return customerByEmail;
        }
      }

      // Customer not found, create a new one
      const newCustomer = await this.createCustomer(customerData);

      // Create mapping
      await this.saveExternalCustomerMapping({
        externalId,
        platform,
        internalId: newCustomer.id,
        email: newCustomer.email || '',
        lastSyncedAt: new Date().toISOString(),
      });

      return newCustomer;
    } catch (error) {
      throw this.formatError(
        error,
        `finding or creating customer from ${platform}`
      );
    }
  }

  /**
   * Get customer sales
   * @param customerId Customer ID
   * @param limit Maximum number of sales to return
   */
  public async getCustomerSales(
    customerId: number,
    limit: number = 10
  ): Promise<Sale[]> {
    try {
      const response = await apiClient.get<Sale[]>(
        `${this.BASE_PATH}/${customerId}/sales`,
        {
          params: { limit },
        }
      );

      return response.data;
    } catch (error) {
      throw this.formatError(error, `getting sales for customer ${customerId}`);
    }
  }

  /**
   * Get customer statistics
   * @param customerId Customer ID
   */
  public async getCustomerStats(customerId: number): Promise<CustomerStats> {
    try {
      const response = await apiClient.get<CustomerStats>(
        `${this.BASE_PATH}/${customerId}/stats`
      );
      return response.data;
    } catch (error) {
      throw this.formatError(error, `getting stats for customer ${customerId}`);
    }
  }

  /**
   * Search customers by name, email, or phone
   * @param query Search query
   * @param limit Maximum number of results to return
   */
  public async searchCustomers(
    query: string,
    limit: number = 20
  ): Promise<Customer[]> {
    try {
      const response = await apiClient.get<Customer[]>(
        `${this.BASE_PATH}/search`,
        {
          params: { query, limit },
        }
      );

      // Update caches
      response.data.forEach((customer) => {
        this.customerDetailCache.set(`customer:${customer.id}`, customer);
        if (customer.email) {
          this.emailToIdCache.set(`email:${customer.email}`, customer.id);
        }
      });

      return response.data;
    } catch (error) {
      throw this.formatError(
        error,
        `searching customers with query "${query}"`
      );
    }
  }

  /**
   * Clear all caches
   */
  public clearCaches(): void {
    this.customerCache.clear();
    this.customerDetailCache.clear();
    this.emailToIdCache.clear();
    this.externalIdMappings.clear();
  }
}

// Export a singleton instance
export const customerService = new CustomerService();

// Also export the class for testing or custom instantiation
export default CustomerService;
