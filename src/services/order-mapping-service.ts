// src/services/order-mapping-service.ts
import { apiClient, ApiError } from './api-client';
import {
  getCacheItem,
  hasCacheItem,
  removeCacheItem,
  setCacheItem,
} from './caching-service';

/**
 * Interface for order mapping between external platforms and internal system
 */
export interface OrderMapping {
  id?: number;
  platformId: string; // e.g., "amazon", "ebay", "etsy"
  externalOrderId: string;
  internalOrderId: number;
  additionalData?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Service for managing order mappings between marketplace platforms and internal system
 */
class OrderMappingService {
  private readonly BASE_PATH = '/integration-mappings/orders';

  /**
   * Format error for error handling
   */
  private formatError(error: unknown, context: string): ApiError {
    const apiError = error as ApiError;
    console.error(`Order Mapping Service - Error ${context}:`, apiError);
    return apiError;
  }

  /**
   * Get cache key for an order mapping
   */
  private getCacheKey(platformId: string, externalOrderId: string): string {
    return `orderMapping:${platformId}:${externalOrderId}`;
  }

  /**
   * Find a mapping by platform ID and external order ID
   */
  public async findMapping(
    platformId: string,
    externalOrderId: string
  ): Promise<OrderMapping | null> {
    const cacheKey = this.getCacheKey(platformId, externalOrderId);

    // Check cache first
    if (hasCacheItem(cacheKey)) {
      return getCacheItem<OrderMapping>(cacheKey)!;
    }

    try {
      const response = await apiClient.get<OrderMapping[]>(this.BASE_PATH, {
        params: {
          platformId,
          externalOrderId,
        },
      });

      if (response.data && response.data.length > 0) {
        const mapping = response.data[0];
        // Cache the result
        setCacheItem(cacheKey, mapping);
        return mapping;
      }

      return null;
    } catch (error) {
      throw this.formatError(
        error,
        `finding mapping for ${platformId}:${externalOrderId}`
      );
    }
  }

  /**
   * Create a new order mapping
   */
  public async createMapping(mapping: OrderMapping): Promise<OrderMapping> {
    try {
      const response = await apiClient.post<OrderMapping>(
        this.BASE_PATH,
        mapping
      );
      const newMapping = response.data;

      // Cache the new mapping
      const cacheKey = this.getCacheKey(
        mapping.platformId,
        mapping.externalOrderId
      );
      setCacheItem(cacheKey, newMapping);

      return newMapping;
    } catch (error) {
      throw this.formatError(error, 'creating order mapping');
    }
  }

  /**
   * Update an existing order mapping
   */
  public async updateMapping(
    id: number,
    mapping: Partial<OrderMapping>
  ): Promise<OrderMapping> {
    try {
      const response = await apiClient.put<OrderMapping>(
        `${this.BASE_PATH}/${id}`,
        mapping
      );
      const updatedMapping = response.data;

      // Update cache if we have platformId and externalOrderId
      if (updatedMapping.platformId && updatedMapping.externalOrderId) {
        const cacheKey = this.getCacheKey(
          updatedMapping.platformId,
          updatedMapping.externalOrderId
        );
        setCacheItem(cacheKey, updatedMapping);
      }

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
      // Get mapping details first to be able to invalidate cache
      const response = await apiClient.get<OrderMapping>(
        `${this.BASE_PATH}/${id}`
      );
      const mapping = response.data;

      // Delete the mapping
      await apiClient.delete(`${this.BASE_PATH}/${id}`);

      // Invalidate cache
      if (mapping.platformId && mapping.externalOrderId) {
        const cacheKey = this.getCacheKey(
          mapping.platformId,
          mapping.externalOrderId
        );
        removeCacheItem(cacheKey);
      }
    } catch (error) {
      throw this.formatError(error, `deleting mapping with ID ${id}`);
    }
  }

  /**
   * Find an internal order ID from a platform and external order ID
   * Returns null if no mapping found
   */
  public async findInternalOrderId(
    platformId: string,
    externalOrderId: string
  ): Promise<number | null> {
    const mapping = await this.findMapping(platformId, externalOrderId);
    return mapping ? mapping.internalOrderId : null;
  }

  /**
   * Find or create a mapping, returning the internal order ID
   */
  public async findOrCreateMapping(
    platformId: string,
    externalOrderId: string,
    internalOrderId: number,
    additionalData?: Record<string, any>
  ): Promise<number> {
    // Try to find existing mapping
    const existingMapping = await this.findMapping(platformId, externalOrderId);

    if (existingMapping) {
      return existingMapping.internalOrderId;
    }

    // Create new mapping
    const newMapping = await this.createMapping({
      platformId,
      externalOrderId,
      internalOrderId,
      additionalData,
      createdAt: new Date().toISOString(),
    });

    return newMapping.internalOrderId;
  }

  /**
   * Get all mappings for a platform
   */
  public async getAllMappingsForPlatform(
    platformId: string
  ): Promise<OrderMapping[]> {
    try {
      const response = await apiClient.get<OrderMapping[]>(this.BASE_PATH, {
        params: { platformId },
      });

      return response.data;
    } catch (error) {
      throw this.formatError(
        error,
        `getting all mappings for platform ${platformId}`
      );
    }
  }

  /**
   * Find mappings by internal order ID
   */
  public async findMappingsByInternalId(
    internalOrderId: number
  ): Promise<OrderMapping[]> {
    try {
      const response = await apiClient.get<OrderMapping[]>(this.BASE_PATH, {
        params: { internalOrderId },
      });

      return response.data;
    } catch (error) {
      throw this.formatError(
        error,
        `finding mappings for internal order ID ${internalOrderId}`
      );
    }
  }
}

// Export a singleton instance
export const orderMappingService = new OrderMappingService();

// Also export the class for testing or custom instantiation
export default OrderMappingService;
