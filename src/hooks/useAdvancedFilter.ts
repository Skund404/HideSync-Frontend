// src/hooks/useAdvancedFilter.ts
import { useState, useCallback } from 'react';

// Generic filter type that can be extended for different entities
export interface AdvancedFilter {
  [key: string]: string[] | number[] | { min?: number; max?: number };
}

// Pagination state
export interface PaginationState {
  page: number;
  pageSize: number;
  total?: number;
}

// Hook for managing advanced filtering and pagination
export const useAdvancedFilter = <T extends AdvancedFilter>(
  initialFilter: T = {} as T,
  initialPagination: PaginationState = { page: 1, pageSize: 10 }
) => {
  // Filter state
  const [filter, setFilter] = useState<T>(initialFilter);
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>(initialPagination);

  // Add a filter condition
  const addFilter = useCallback((key: keyof T, value: string | number) => {
    setFilter(prev => {
      const currentFilter = prev[key] || [];
      
      // For array-based filters (multi-select)
      if (Array.isArray(currentFilter)) {
        const newFilter = currentFilter.includes(value)
          ? currentFilter.filter(v => v !== value)
          : [...currentFilter, value];
        
        return {
          ...prev,
          [key]: newFilter.length > 0 ? newFilter : undefined
        };
      }
      
      // For range-based filters
      return {
        ...prev,
        [key]: { ...currentFilter, value }
      };
    });
  }, []);

  // Set range filter
  const setRangeFilter = useCallback((key: keyof T, min?: number, max?: number) => {
    setFilter(prev => ({
      ...prev,
      [key]: { min, max }
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilter({} as T);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Update pagination
  const updatePagination = useCallback((updates: Partial<PaginationState>) => {
    setPagination(prev => ({ ...prev, ...updates }));
  }, []);

  // Convert filter to query parameters
  const getFilterParams = useCallback(() => {
    const params: Record<string, any> = {};

    Object.entries(filter).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        // Multi-select filters
        params[key] = value;
      } else if (typeof value === 'object' && value !== null) {
        // Range filters
        if (value.min !== undefined) params[`${key}Min`] = value.min;
        if (value.max !== undefined) params[`${key}Max`] = value.max;
      }
    });

    // Add pagination
    params.page = pagination.page;
    params.pageSize = pagination.pageSize;

    return params;
  }, [filter, pagination]);

  return {
    filter,
    setFilter,
    addFilter,
    setRangeFilter,
    clearFilters,
    pagination,
    updatePagination,
    getFilterParams
  };
};

export default useAdvancedFilter;