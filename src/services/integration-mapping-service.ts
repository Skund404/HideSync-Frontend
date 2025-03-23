// src/services/integration-mapping-service.ts
import { apiClient, ApiError } from './api-client';

/**
 * Interface for entity mapping between external platforms and internal system
 */
export interface EntityMapping {
  id?: number;
  platform: string;
  externalId: string;
  internalId: number;
  entityType: 'customer' | 'product' | 'order' | 'other';
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface for customer-specific mapping
 */
export interface CustomerMapping extends EntityMapping {
  entityType: 'customer';
  metadata?: {
    email?: string;
    name?: string;
    lastOrderDate?: string;
    totalOrders?: number;
  };
}

/**
 * Interface for order-specific mapping
 */
export interface OrderMapping extends EntityMapping {
  entityType: 'order';
  metadata?: {
    orderDate?: string;
    status?: string;
    total?: number;
  };
}

/**
 * Interface for product-specific mapping
 */
export interface ProductMapping extends EntityMapping {
  entityType: 'product';
  metadata?: {
    sku?: string;
    name?: string;
    lastUpdated?: string;
  };
}

/**
 * Service for managing integration mappings between external platforms and internal system
 */
class IntegrationMappingService {
  private readonly BASE_PATH = '/integration-mappings';

  // In-memory cache for frequently accessed mappings
  private cache = new Map<string, EntityMapping>();
  private cacheTTL = 30 * 60 * 1000; // 30 minutes
  private cacheTimers = new Map<string, NodeJS.Timeout>();

  /**
   * Format error for error handling
   */
  private formatError(error: unknown, context: string): ApiError {
    const apiError = error as ApiError;
    console.error(`Integration Mapping Service - Error ${context}:`, apiError);
    return apiError;
  }

  /**
   * Generate a cache key for a mapping
   */
  private getCacheKey(
    platform: string,
    entityType: string,
    externalId: string
  ): string {
    return `${platform}:${entityType}:${externalId}`;
  }

  /**
   * Set a value in the cache with expiration
   */
  private setCacheValue(key: string, value: EntityMapping): void {
    // Clear existing timer if any
    const existingTimer = this.cacheTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set value in cache
    this.cache.set(key, value);

    // Set expiration timer
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.cacheTimers.delete(key);
    }, this.cacheTTL);

    this.cacheTimers.set(key, timer);
  }

  /**
   * Clear a specific item from cache
   */
  private clearCacheItem(key: string): void {
    const timer = this.cacheTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.cacheTimers.delete(key);
    }
    this.cache.delete(key);
  }

  /**
   * Find a mapping by platform, entity type, and external ID
   */
  public async findMapping<T extends EntityMapping>(
    platform: string,
    entityType: string,
    externalId: string
  ): Promise<T | null> {
    const cacheKey = this.getCacheKey(platform, entityType, externalId);

    // Check cache first
    const cachedMapping = this.cache.get(cacheKey) as T;
    if (cachedMapping) {
      return cachedMapping;
    }

    try {
      const response = await apiClient.get<T[]>(this.BASE_PATH, {
        params: { platform, entityType, externalId },
      });

      if (response.data.length > 0) {
        const mapping = response.data[0];
        this.setCacheValue(cacheKey, mapping);
        return mapping;
      }

      return null;
    } catch (error) {
      throw this.formatError(
        error,
        `finding mapping for ${platform}:${entityType}:${externalId}`
      );
    }
  }

  /**
   * Find a mapping by platform, entity type, and internal ID
   */
  public async findMappingByInternalId<T extends EntityMapping>(
    platform: string,
    entityType: string,
    internalId: number
  ): Promise<T | null> {
    try {
      const response = await apiClient.get<T[]>(this.BASE_PATH, {
        params: { platform, entityType, internalId },
      });

      if (response.data.length > 0) {
        const mapping = response.data[0];
        const cacheKey = this.getCacheKey(
          platform,
          entityType,
          mapping.externalId
        );
        this.setCacheValue(cacheKey, mapping);
        return mapping;
      }

      return null;
    } catch (error) {
      throw this.formatError(
        error,
        `finding mapping for ${platform}:${entityType} with internal ID ${internalId}`
      );
    }
  }

  /**
   * Create a new mapping
   */
  public async createMapping<T extends EntityMapping>(mapping: T): Promise<T> {
    try {
      const response = await apiClient.post<T>(this.BASE_PATH, mapping);
      const newMapping = response.data;

      // Update cache
      const cacheKey = this.getCacheKey(
        newMapping.platform,
        newMapping.entityType,
        newMapping.externalId
      );
      this.setCacheValue(cacheKey, newMapping);

      return newMapping;
    } catch (error) {
      throw this.formatError(error, 'creating mapping');
    }
  }

  /**
   * Update an existing mapping
   */
  public async updateMapping<T extends EntityMapping>(
    id: number,
    mapping: Partial<T>
  ): Promise<T> {
    try {
      const response = await apiClient.put<T>(
        `${this.BASE_PATH}/${id}`,
        mapping
      );
      const updatedMapping = response.data;

      // Update cache
      const cacheKey = this.getCacheKey(
        updatedMapping.platform,
        updatedMapping.entityType,
        updatedMapping.externalId
      );
      this.setCacheValue(cacheKey, updatedMapping);

      return updatedMapping;
    } catch (error) {
      throw this.formatError(error, `updating mapping with ID ${id}`);
    }
  }

  /**
   * Delete a mapping
   */
  public async deleteMapping(id: number): Promise<void> {
    try {
      // Get mapping details first to be able to remove from cache
      const response = await apiClient.get<EntityMapping>(
        `${this.BASE_PATH}/${id}`
      );
      const mapping = response.data;

      // Delete the mapping
      await apiClient.delete(`${this.BASE_PATH}/${id}`);

      // Remove from cache
      const cacheKey = this.getCacheKey(
        mapping.platform,
        mapping.entityType,
        mapping.externalId
      );
      this.clearCacheItem(cacheKey);
    } catch (error) {
      throw this.formatError(error, `deleting mapping with ID ${id}`);
    }
  }

  /**
   * Find or create a customer mapping
   */
  public async findOrCreateCustomerMapping(
    platform: string,
    externalId: string,
    internalId: number,
    metadata?: CustomerMapping['metadata']
  ): Promise<CustomerMapping> {
    try {
      // Try to find existing mapping
      const existingMapping = await this.findMapping<CustomerMapping>(
        platform,
        'customer',
        externalId
      );

      if (existingMapping) {
        // Update metadata if provided
        if (metadata) {
          return this.updateMapping<CustomerMapping>(existingMapping.id!, {
            metadata: {
              ...existingMapping.metadata,
              ...metadata,
            },
          });
        }
        return existingMapping;
      }

      // Create new mapping
      return this.createMapping<CustomerMapping>({
        platform,
        entityType: 'customer',
        externalId,
        internalId,
        metadata: metadata || undefined,
      });
    } catch (error) {
      throw this.formatError(
        error,
        `finding or creating customer mapping for ${platform}:${externalId}`
      );
    }
  }

  /**
   * Find or create an order mapping
   */
  public async findOrCreateOrderMapping(
    platform: string,
    externalId: string,
    internalId: number,
    metadata?: OrderMapping['metadata']
  ): Promise<OrderMapping> {
    try {
      // Try to find existing mapping
      const existingMapping = await this.findMapping<OrderMapping>(
        platform,
        'order',
        externalId
      );

      if (existingMapping) {
        // Update metadata if provided
        if (metadata) {
          return this.updateMapping<OrderMapping>(existingMapping.id!, {
            metadata: {
              ...existingMapping.metadata,
              ...metadata,
            },
          });
        }
        return existingMapping;
      }

      // Create new mapping
      return this.createMapping<OrderMapping>({
        platform,
        entityType: 'order',
        externalId,
        internalId,
        metadata: metadata || undefined,
      });
    } catch (error) {
      throw this.formatError(
        error,
        `finding or creating order mapping for ${platform}:${externalId}`
      );
    }
  }

  /**
   * Clear all cached mappings
   */
  public clearCache(): void {
    // Clear all cache timers
    for (const timer of Array.from(this.cacheTimers.values())) {
      clearTimeout(timer);
    }

    // Clear maps
    this.cache.clear();
    this.cacheTimers.clear();
  }
}

// Export a singleton instance
export const integrationMappingService = new IntegrationMappingService();

// Also export the class for testing or custom instantiation
export default IntegrationMappingService;
