// src/services/documentation-service.ts
import {
  DocumentationCategoryResource,
  DocumentationFilters,
  DocumentationResource,
  PaginatedResponse,
} from '@/types/documentationTypes';
import { apiClient } from './api-client';

// Cache implementation
class CacheManager {
  private cache: Map<string, { data: any; expiresAt: number }> = new Map();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry || Date.now() > entry.expiresAt) {
      if (entry) this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateByPattern(pattern: string): void {
    // Convert Map keys to array before iterating to avoid iterator issues
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (key.includes(pattern)) this.cache.delete(key);
    }
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry || Date.now() > entry.expiresAt) {
      if (entry) this.cache.delete(key);
      return false;
    }
    return true;
  }
}

const cache = new CacheManager();
const BASE_URL = '/documentation';

// Cache keys
const cacheKeys = {
  resources: (filters?: string) =>
    `docs:resources${filters ? `:${filters}` : ''}`,
  resource: (id: string) => `docs:resource:${id}`,
  categories: 'docs:categories',
  category: (id: string) => `docs:category:${id}`,
  search: (query: string) => `docs:search:${query}`,
};

// Get all documentation resources with pagination & caching
export const getDocumentationResources = async (
  filters?: DocumentationFilters
): Promise<PaginatedResponse<DocumentationResource>> => {
  const cacheKey = cacheKeys.resources(filters ? JSON.stringify(filters) : '');
  const cached = cache.get<PaginatedResponse<DocumentationResource>>(cacheKey);

  if (cached) return cached;

  try {
    const response = await apiClient.get<
      PaginatedResponse<DocumentationResource>
    >(`${BASE_URL}/resources`, { params: filters });

    cache.set(cacheKey, response.data, 5 * 60 * 1000); // 5 minutes TTL
    return response.data;
  } catch (error) {
    console.error('Error fetching documentation resources:', error);
    throw error;
  }
};

// Get a resource by ID with caching
export const getDocumentationResourceById = async (
  id: string
): Promise<DocumentationResource> => {
  const cacheKey = cacheKeys.resource(id);
  const cached = cache.get<DocumentationResource>(cacheKey);

  if (cached) return cached;

  try {
    const response = await apiClient.get<DocumentationResource>(
      `${BASE_URL}/resources/${id}`
    );
    cache.set(cacheKey, response.data, 15 * 60 * 1000); // 15 minutes TTL
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching documentation resource with ID ${id}:`,
      error
    );
    throw error;
  }
};

// CRUD operations with proper cache invalidation
export const createDocumentationResource = async (
  resource: Omit<DocumentationResource, 'id'>
): Promise<DocumentationResource> => {
  try {
    const response = await apiClient.post<DocumentationResource>(
      `${BASE_URL}/resources`,
      resource
    );

    // Invalidate collection caches
    cache.invalidateByPattern('docs:resources');
    // Cache the new resource
    cache.set(cacheKeys.resource(response.data.id), response.data);

    return response.data;
  } catch (error) {
    console.error('Error creating documentation resource:', error);
    throw error;
  }
};

export const updateDocumentationResource = async (
  id: string,
  resource: Partial<DocumentationResource>
): Promise<DocumentationResource> => {
  try {
    const response = await apiClient.put<DocumentationResource>(
      `${BASE_URL}/resources/${id}`,
      resource
    );

    // Update caches
    cache.set(cacheKeys.resource(id), response.data);
    cache.invalidateByPattern('docs:resources');

    return response.data;
  } catch (error) {
    console.error(
      `Error updating documentation resource with ID ${id}:`,
      error
    );
    throw error;
  }
};

export const deleteDocumentationResource = async (
  id: string
): Promise<void> => {
  try {
    await apiClient.delete(`${BASE_URL}/resources/${id}`);

    // Invalidate caches
    cache.invalidate(cacheKeys.resource(id));
    cache.invalidateByPattern('docs:resources');
  } catch (error) {
    console.error(
      `Error deleting documentation resource with ID ${id}:`,
      error
    );
    throw error;
  }
};

// Categories CRUD with caching
export const getDocumentationCategories = async (): Promise<
  DocumentationCategoryResource[]
> => {
  const cacheKey = cacheKeys.categories;
  const cached = cache.get<DocumentationCategoryResource[]>(cacheKey);

  if (cached) return cached;

  try {
    const response = await apiClient.get<DocumentationCategoryResource[]>(
      `${BASE_URL}/categories`
    );
    cache.set(cacheKey, response.data, 30 * 60 * 1000); // 30 minutes TTL
    return response.data;
  } catch (error) {
    console.error('Error fetching documentation categories:', error);
    throw error;
  }
};

export const getDocumentationCategoryById = async (
  id: string
): Promise<DocumentationCategoryResource> => {
  const cacheKey = cacheKeys.category(id);
  const cached = cache.get<DocumentationCategoryResource>(cacheKey);

  if (cached) return cached;

  try {
    const response = await apiClient.get<DocumentationCategoryResource>(
      `${BASE_URL}/categories/${id}`
    );
    cache.set(cacheKey, response.data, 30 * 60 * 1000); // 30 minutes TTL
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching documentation category with ID ${id}:`,
      error
    );
    throw error;
  }
};

// Search with caching & retry logic
export const searchDocumentation = async (
  query: string,
  maxRetries = 2
): Promise<DocumentationResource[]> => {
  const cacheKey = cacheKeys.search(query);
  const cached = cache.get<DocumentationResource[]>(cacheKey);

  if (cached) return cached;

  let attempts = 0;
  let lastError: any;

  while (attempts <= maxRetries) {
    try {
      const response = await apiClient.get<DocumentationResource[]>(
        `${BASE_URL}/search`,
        {
          params: { query },
        }
      );

      cache.set(cacheKey, response.data, 5 * 60 * 1000); // 5 minutes TTL
      return response.data;
    } catch (error) {
      lastError = error;
      attempts++;

      if (attempts <= maxRetries) {
        // Wait with exponential backoff - store attempts in a local constant
        const currentAttempt = attempts;
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, currentAttempt - 1))
        );
      }
    }
  }

  console.error(
    `Error searching documentation after ${maxRetries} retries:`,
    lastError
  );
  throw lastError;
};

// Get contextual help resources
export const getContextualHelp = async (
  contextKey: string
): Promise<DocumentationResource[]> => {
  try {
    const response = await apiClient.get<DocumentationResource[]>(
      `${BASE_URL}/contextual-help`,
      {
        params: { key: contextKey },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching contextual help for key ${contextKey}:`,
      error
    );
    throw error;
  }
};
