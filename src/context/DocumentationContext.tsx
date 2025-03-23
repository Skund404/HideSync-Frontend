// src/context/DocumentationContext.tsx
import { ApiError } from '@/services/api-client';
import {
  createDocumentationResource,
  deleteDocumentationResource,
  getContextualHelp as getContextualHelpFromAPI,
  getDocumentationCategories,
  getDocumentationCategoryById,
  getDocumentationResourceById,
  getDocumentationResources,
  searchDocumentation,
  updateDocumentationResource,
} from '@/services/documentation-service';
import {
  DocumentationCategoryResource,
  DocumentationFilters,
  DocumentationResource,
  DocumentationSearchResult,
} from '@/types/documentationTypes';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

// IndexedDB for offline support
import { DBSchema, openDB } from 'idb';

// Extended DocumentationFilters with pagination props
interface ExtendedDocumentationFilters extends DocumentationFilters {
  page?: number;
  pageSize?: number;
}

// API response with pagination
interface DocumentationApiResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

interface DocDB extends DBSchema {
  resources: {
    key: string;
    value: DocumentationResource;
    indexes: { 'by-category': string };
  };
  offlineQueue: {
    key: string;
    value: {
      id: string;
      operation: 'create' | 'update' | 'delete';
      resource: Partial<DocumentationResource>;
      timestamp: number;
    };
  };
}

// Context type definition with everything needed
interface DocumentationContextType {
  // State
  resources: DocumentationResource[];
  categories: DocumentationCategoryResource[];
  loading: boolean;
  error: string | null;
  currentResource: DocumentationResource | null;
  currentCategory: DocumentationCategoryResource | null;
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };

  // Resource operations
  fetchResources: (filters?: ExtendedDocumentationFilters) => Promise<void>;
  fetchResourceById: (id: string) => Promise<void>;
  createResource: (
    resource: Omit<DocumentationResource, 'id'>
  ) => Promise<DocumentationResource>;
  updateResource: (
    id: string,
    resource: Partial<DocumentationResource>
  ) => Promise<DocumentationResource>;
  deleteResource: (id: string) => Promise<void>;

  // Category operations
  fetchCategories: () => Promise<void>;
  fetchCategoryById: (id: string) => Promise<void>;

  // Search
  searchResults: DocumentationSearchResult | null;
  searchResources: (query: string) => Promise<DocumentationResource[]>;
  searchDocumentation: (params: { term: string }) => Promise<void>;

  // Contextual help - both naming conventions for compatibility
  getContextHelp: (contextKey: string) => Promise<DocumentationResource[]>;
  getContextualHelp: (contextKey: string) => Promise<DocumentationResource[]>;

  // Pagination
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;

  // Other utilities
  clearError: () => void;
  isOffline: boolean;
  syncOfflineChanges: () => Promise<void>;
}

const DocumentationContext = createContext<
  DocumentationContextType | undefined
>(undefined);

export function useDocumentation() {
  const context = useContext(DocumentationContext);
  if (context === undefined) {
    throw new Error(
      'useDocumentation must be used within a DocumentationProvider'
    );
  }
  return context;
}

interface DocumentationProviderProps {
  children: ReactNode;
}

export function DocumentationProvider({
  children,
}: DocumentationProviderProps) {
  // State
  const [resources, setResources] = useState<DocumentationResource[]>([]);
  const [categories, setCategories] = useState<DocumentationCategoryResource[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResource, setCurrentResource] =
    useState<DocumentationResource | null>(null);
  const [currentCategory, setCurrentCategory] =
    useState<DocumentationCategoryResource | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalPages: 1,
    totalItems: 0,
  });
  const [filters, setFilters] = useState<ExtendedDocumentationFilters>({});
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [db, setDb] = useState<any>(null);
  const [searchResults, setSearchResults] =
    useState<DocumentationSearchResult | null>(null);

  // Initialize IndexedDB for offline support
  useEffect(() => {
    const initDB = async () => {
      const database = await openDB<DocDB>('documentation-db', 1, {
        upgrade(db) {
          const resourceStore = db.createObjectStore('resources', {
            keyPath: 'id',
          });
          resourceStore.createIndex('by-category', 'category');
          db.createObjectStore('offlineQueue', { keyPath: 'id' });
        },
      });
      setDb(database);
    };

    initDB();

    // Online/offline event listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Resource operations
  const fetchResources = useCallback(
    async (newFilters?: ExtendedDocumentationFilters) => {
      const currentFilters = { ...filters, ...newFilters };
      setFilters(currentFilters);

      try {
        setLoading(true);
        setError(null);

        if (isOffline && db) {
          // Get resources from IndexedDB when offline
          const storedResources = await db.getAll('resources');

          // Apply filters in memory when offline
          let filteredResources = [...storedResources];

          if (currentFilters.category) {
            filteredResources = filteredResources.filter(
              (r) => r.category === currentFilters.category
            );
          }

          if (currentFilters.type) {
            filteredResources = filteredResources.filter(
              (r) => r.type === currentFilters.type
            );
          }

          if (currentFilters.skillLevel) {
            filteredResources = filteredResources.filter(
              (r) => r.skillLevel === currentFilters.skillLevel
            );
          }

          if (currentFilters.search) {
            const searchLower = currentFilters.search.toLowerCase();
            filteredResources = filteredResources.filter(
              (r) =>
                r.title.toLowerCase().includes(searchLower) ||
                r.description.toLowerCase().includes(searchLower) ||
                r.content.toLowerCase().includes(searchLower)
            );
          }

          if (currentFilters.tags && currentFilters.tags.length > 0) {
            filteredResources = filteredResources.filter((r) =>
              currentFilters.tags?.some((tag) => r.tags.includes(tag))
            );
          }

          // Manual pagination
          const page = currentFilters.page || 1;
          const pageSize = currentFilters.pageSize || 20;
          const startIndex = (page - 1) * pageSize;
          const paginatedResources = filteredResources.slice(
            startIndex,
            startIndex + pageSize
          );

          setResources(paginatedResources);
          setPagination({
            page,
            pageSize,
            totalItems: filteredResources.length,
            totalPages: Math.ceil(filteredResources.length / pageSize),
          });
        } else {
          // Get from API when online
          const response = (await getDocumentationResources(
            currentFilters
          )) as DocumentationApiResponse<DocumentationResource>;
          setResources(response.data);
          // Fix: Access meta information correctly
          setPagination({
            page: response.meta.page,
            pageSize: response.meta.per_page,
            totalItems: response.meta.total,
            totalPages: response.meta.total_pages,
          });

          // Store in IndexedDB for offline use
          if (db) {
            const tx = db.transaction('resources', 'readwrite');
            for (const resource of response.data) {
              await tx.store.put(resource);
            }
            await tx.done;
          }
        }
      } catch (error) {
        const apiError = error as ApiError;
        setError(apiError.message || 'Failed to fetch resources');
      } finally {
        setLoading(false);
      }
    },
    [filters, isOffline, db]
  );

  const fetchResourceById = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        let resource;

        if (isOffline && db) {
          // Try to get from IndexedDB when offline
          resource = await db.get('resources', id);
          if (!resource) {
            throw new Error('Resource not available offline');
          }
        } else {
          // Get from API when online
          resource = await getDocumentationResourceById(id);

          // Store in IndexedDB for offline use
          if (db) {
            await db.put('resources', resource);
          }

          // Prefetch related resources in the background
          if (resource.relatedResources?.length) {
            for (const relatedId of resource.relatedResources) {
              getDocumentationResourceById(relatedId).catch(() => {
                // Silently fail prefetching - it's just an optimization
              });
            }
          }
        }

        setCurrentResource(resource);
      } catch (error) {
        const apiError = error as ApiError;
        setError(apiError.message || `Failed to fetch resource with ID ${id}`);
      } finally {
        setLoading(false);
      }
    },
    [isOffline, db]
  );

  // Optimistic update functions
  const createResource = useCallback(
    async (resource: Omit<DocumentationResource, 'id'>) => {
      // Create temporary ID for optimistic update
      const tempId = `temp-${Date.now()}`;
      const tempResource = {
        ...resource,
        id: tempId,
        lastUpdated: new Date().toISOString(),
      } as DocumentationResource;

      // Optimistic update
      setResources((prev) => [...prev, tempResource]);

      try {
        if (isOffline && db) {
          // Store in offline queue
          await db.add('offlineQueue', {
            id: `create-${tempId}`,
            operation: 'create',
            resource,
            timestamp: Date.now(),
          });

          // Return the temp resource in offline mode
          return tempResource;
        } else {
          // Create through API
          const newResource = await createDocumentationResource(resource);

          // Replace temp resource with real one
          setResources((prev) =>
            prev.map((r) => (r.id === tempId ? newResource : r))
          );

          // Store in IndexedDB
          if (db) {
            await db.put('resources', newResource);
          }

          return newResource;
        }
      } catch (error) {
        // Revert optimistic update
        setResources((prev) => prev.filter((r) => r.id !== tempId));

        const apiError = error as ApiError;
        setError(apiError.message || 'Failed to create resource');
        throw error;
      }
    },
    [isOffline, db]
  );

  const updateResource = useCallback(
    async (id: string, resource: Partial<DocumentationResource>) => {
      // Store original for rollback
      const originalResource = resources.find((r) => r.id === id);
      if (!originalResource) {
        throw new Error(`Resource with ID ${id} not found`);
      }

      // Optimistic update
      const updatedResource = {
        ...originalResource,
        ...resource,
        lastUpdated: new Date().toISOString(),
      };
      setResources((prev) =>
        prev.map((r) => (r.id === id ? updatedResource : r))
      );

      if (currentResource?.id === id) {
        setCurrentResource(updatedResource);
      }

      try {
        if (isOffline && db) {
          // Store in offline queue
          await db.add('offlineQueue', {
            id: `update-${id}-${Date.now()}`,
            operation: 'update',
            resource: { id, ...resource },
            timestamp: Date.now(),
          });

          // Update in IndexedDB as well
          await db.put('resources', updatedResource);

          return updatedResource;
        } else {
          // Update through API
          const result = await updateDocumentationResource(id, resource);

          // Update in IndexedDB
          if (db) {
            await db.put('resources', result);
          }

          return result;
        }
      } catch (error) {
        // Revert optimistic update
        setResources((prev) =>
          prev.map((r) => (r.id === id ? originalResource : r))
        );

        if (currentResource?.id === id) {
          setCurrentResource(originalResource);
        }

        const apiError = error as ApiError;
        setError(apiError.message || `Failed to update resource with ID ${id}`);
        throw error;
      }
    },
    [resources, currentResource, isOffline, db]
  );

  const deleteResource = useCallback(
    async (id: string) => {
      // Store original for rollback
      const originalResource = resources.find((r) => r.id === id);

      // Optimistic update
      setResources((prev) => prev.filter((r) => r.id !== id));

      if (currentResource?.id === id) {
        setCurrentResource(null);
      }

      try {
        if (isOffline && db) {
          // Store in offline queue
          await db.add('offlineQueue', {
            id: `delete-${id}-${Date.now()}`,
            operation: 'delete',
            resource: { id },
            timestamp: Date.now(),
          });

          // Remove from IndexedDB as well
          await db.delete('resources', id);
        } else {
          // Delete through API
          await deleteDocumentationResource(id);

          // Remove from IndexedDB
          if (db) {
            await db.delete('resources', id);
          }
        }
      } catch (error) {
        // Revert optimistic update if we have the original
        if (originalResource) {
          setResources((prev) => [...prev, originalResource]);

          if (currentResource?.id === id) {
            setCurrentResource(originalResource);
          }
        }

        const apiError = error as ApiError;
        setError(apiError.message || `Failed to delete resource with ID ${id}`);
        throw error;
      }
    },
    [resources, currentResource, isOffline, db]
  );

  // Categories operations
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (isOffline && db) {
        // For simplicity, we'll just return the existing categories when offline
        // A more sophisticated approach would store categories in IndexedDB as well
        if (categories.length === 0) {
          setError('Categories not available offline');
        }
      } else {
        const categoriesData = await getDocumentationCategories();
        setCategories(categoriesData);
      }
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [isOffline, db, categories.length]);

  const fetchCategoryById = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        if (isOffline && db) {
          // For offline, find from already loaded categories
          const category = categories.find((c) => c.id === id);
          if (category) {
            setCurrentCategory(category);
          } else {
            throw new Error('Category not available offline');
          }
        } else {
          const category = await getDocumentationCategoryById(id);
          setCurrentCategory(category);
        }
      } catch (error) {
        const apiError = error as ApiError;
        setError(apiError.message || `Failed to fetch category with ID ${id}`);
      } finally {
        setLoading(false);
      }
    },
    [isOffline, db, categories]
  );

  // Search operations
  const searchResources = useCallback(
    async (query: string) => {
      try {
        setLoading(true);
        setError(null);

        if (isOffline && db) {
          // Perform client-side search when offline
          const allResources = await db.getAll('resources');
          const queryLower = query.toLowerCase();

          const results = allResources.filter(
            (resource: DocumentationResource) =>
              resource.title.toLowerCase().includes(queryLower) ||
              resource.description.toLowerCase().includes(queryLower) ||
              resource.content.toLowerCase().includes(queryLower) ||
              resource.tags.some((tag) =>
                tag.toLowerCase().includes(queryLower)
              )
          );

          return results;
        } else {
          return await searchDocumentation(query);
        }
      } catch (error) {
        const apiError = error as ApiError;
        setError(apiError.message || 'Search failed');
        return [];
      } finally {
        setLoading(false);
      }
    },
    [isOffline, db]
  );

  // Adding searchDocumentation method to match the interface in KnowledgeBase.tsx
  const handleSearchDocumentation = useCallback(
    async ({ term }: { term: string }) => {
      try {
        setLoading(true);
        setError(null);

        const results = await searchResources(term);
        setSearchResults({
          resources: results,
          totalCount: results.length,
        });
      } catch (error) {
        const apiError = error as ApiError;
        setError(apiError.message || 'Search failed');
      } finally {
        setLoading(false);
      }
    },
    [searchResources]
  );

  // Contextual help - primary implementation
  const getContextualHelp = useCallback(
    async (contextKey: string) => {
      try {
        setLoading(true);

        if (isOffline && db) {
          // Search for resources with matching contextual help keys when offline
          const allResources = await db.getAll('resources');
          return allResources.filter(
            (resource: DocumentationResource) =>
              resource.contextualHelpKeys &&
              resource.contextualHelpKeys.includes(contextKey)
          );
        } else {
          return await getContextualHelpFromAPI(contextKey);
        }
      } catch (error) {
        console.error('Error fetching contextual help:', error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [isOffline, db]
  );

  // Create an alias for backward compatibility
  const getContextHelp = getContextualHelp;

  // Pagination methods
  const nextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      const nextPageNum = pagination.page + 1;
      setPagination((prev) => ({ ...prev, page: nextPageNum }));
      const newFilters = { ...filters, page: nextPageNum };
      fetchResources(newFilters);
    }
  }, [pagination, filters, fetchResources]);

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      const prevPageNum = pagination.page - 1;
      setPagination((prev) => ({ ...prev, page: prevPageNum }));
      const newFilters = { ...filters, page: prevPageNum };
      fetchResources(newFilters);
    }
  }, [pagination, filters, fetchResources]);

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= pagination.totalPages) {
        setPagination((prev) => ({ ...prev, page }));
        const newFilters = { ...filters, page };
        fetchResources(newFilters);
      }
    },
    [pagination, filters, fetchResources]
  );

  // Offline sync
  const syncOfflineChanges = useCallback(async () => {
    if (!db || isOffline) return;

    try {
      setLoading(true);

      // Get all pending changes
      const offlineChanges = await db.getAll('offlineQueue');

      // Sort by timestamp to apply in order
      offlineChanges.sort((a: any, b: any) => a.timestamp - b.timestamp);

      for (const change of offlineChanges) {
        try {
          if (change.operation === 'create') {
            await createDocumentationResource(change.resource);
          } else if (change.operation === 'update') {
            const { id, ...data } = change.resource;
            await updateDocumentationResource(id, data);
          } else if (change.operation === 'delete') {
            await deleteDocumentationResource(change.resource.id);
          }

          // Remove from queue when processed
          await db.delete('offlineQueue', change.id);
        } catch (err) {
          console.error('Failed to sync change:', change, err);
          // Continue with next change
        }
      }

      // Refresh data after sync
      fetchResources(filters);
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Failed to sync offline changes');
    } finally {
      setLoading(false);
    }
  }, [db, isOffline, filters, fetchResources]);

  // Attempt to sync when coming back online
  useEffect(() => {
    if (!isOffline) {
      syncOfflineChanges();
    }
  }, [isOffline, syncOfflineChanges]);

  // Initial data loading
  useEffect(() => {
    fetchResources();
    fetchCategories();
  }, [fetchResources, fetchCategories]);

  // Provide memoized context value
  const value = useMemo(
    () => ({
      resources,
      categories,
      loading,
      error,
      currentResource,
      currentCategory,
      pagination,
      fetchResources,
      fetchResourceById,
      createResource,
      updateResource,
      deleteResource,
      fetchCategories,
      fetchCategoryById,
      searchResources,
      searchResults,
      searchDocumentation: handleSearchDocumentation,
      getContextHelp,
      getContextualHelp,
      nextPage,
      prevPage,
      goToPage,
      clearError: () => setError(null),
      isOffline,
      syncOfflineChanges,
    }),
    [
      resources,
      categories,
      loading,
      error,
      currentResource,
      currentCategory,
      pagination,
      searchResults,
      fetchResources,
      fetchResourceById,
      createResource,
      updateResource,
      deleteResource,
      fetchCategories,
      fetchCategoryById,
      searchResources,
      handleSearchDocumentation,
      getContextHelp,
      getContextualHelp,
      nextPage,
      prevPage,
      goToPage,
      isOffline,
      syncOfflineChanges,
    ]
  );

  return (
    <DocumentationContext.Provider value={value}>
      {children}
    </DocumentationContext.Provider>
  );
}
