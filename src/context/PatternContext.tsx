// src/context/PatternContext.tsx
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  getPatterns,
  getPatternById,
  createPattern,
  updatePattern,
  deletePattern,
  togglePatternFavorite,
  filterPatterns,
} from '../services/pattern-service';
import { Pattern, PatternFilters } from '../types/patternTypes';
import { ApiError } from '../services/api-client';

interface PatternContextValue {
  patterns: Pattern[];
  loading: boolean;
  error: string | null;
  getPatternById: (id: number) => Promise<Pattern | null>;
  addPattern: (pattern: Omit<Pattern, 'id'>) => Promise<Pattern>;
  updatePattern: (id: number, pattern: Partial<Pattern>) => Promise<Pattern>;
  deletePattern: (id: number) => Promise<boolean>;
  toggleFavorite: (id: number) => Promise<Pattern>;
  filterPatterns: (filters: PatternFilters) => Promise<Pattern[]>;
  refreshPatterns: () => Promise<void>;
}

const PatternContext = createContext<PatternContextValue | undefined>(
  undefined
);

export const PatternProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatterns = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPatterns();
      setPatterns(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch patterns');
      console.error('Error fetching patterns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatterns();
  }, []);

  const handleGetPatternById = async (id: number): Promise<Pattern | null> => {
    try {
      return await getPatternById(id);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || `Failed to fetch pattern with id ${id}`);
      console.error(`Error fetching pattern with id ${id}:`, err);
      return null;
    }
  };

  const handleAddPattern = async (
    pattern: Omit<Pattern, 'id'>
  ): Promise<Pattern> => {
    try {
      const newPattern = await createPattern(pattern);
      setPatterns((prevPatterns) => [...prevPatterns, newPattern]);
      return newPattern;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to add pattern');
      console.error('Error adding pattern:', err);
      throw err;
    }
  };

  const handleUpdatePattern = async (
    id: number,
    pattern: Partial<Pattern>
  ): Promise<Pattern> => {
    try {
      const updatedPattern = await updatePattern(id, pattern);
      
      // Optimistic update of the patterns list
      setPatterns((prevPatterns) =>
        prevPatterns.map((p) => (p.id === id ? updatedPattern : p))
      );
      
      return updatedPattern;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || `Failed to update pattern with id ${id}`);
      console.error(`Error updating pattern with id ${id}:`, err);
      throw err;
    }
  };

  const handleDeletePattern = async (id: number): Promise<boolean> => {
    try {
      const success = await deletePattern(id);
      
      // Optimistic update of the patterns list
      if (success) {
        setPatterns((prevPatterns) => prevPatterns.filter((p) => p.id !== id));
      }
      
      return success;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || `Failed to delete pattern with id ${id}`);
      console.error(`Error deleting pattern with id ${id}:`, err);
      throw err;
    }
  };

  const handleToggleFavorite = async (id: number): Promise<Pattern> => {
    try {
      const updatedPattern = await togglePatternFavorite(id);
      
      // Optimistic update of the patterns list
      setPatterns((prevPatterns) =>
        prevPatterns.map((p) => (p.id === id ? updatedPattern : p))
      );
      
      return updatedPattern;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || `Failed to toggle favorite for pattern with id ${id}`);
      console.error(`Error toggling favorite for pattern with id ${id}:`, err);
      throw err;
    }
  };

  const handleFilterPatterns = async (filters: PatternFilters): Promise<Pattern[]> => {
    try {
      return await filterPatterns(filters);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to filter patterns');
      console.error('Error filtering patterns:', err);
      throw err;
    }
  };

  const value: PatternContextValue = {
    patterns,
    loading,
    error,
    getPatternById: handleGetPatternById,
    addPattern: handleAddPattern,
    updatePattern: handleUpdatePattern,
    deletePattern: handleDeletePattern,
    toggleFavorite: handleToggleFavorite,
    filterPatterns: handleFilterPatterns,
    refreshPatterns: fetchPatterns,
  };

  return (
    <PatternContext.Provider value={value}>{children}</PatternContext.Provider>
  );
};

export const usePatternContext = (): PatternContextValue => {
  const context = useContext(PatternContext);
  if (context === undefined) {
    throw new Error('usePatternContext must be used within a PatternProvider');
  }
  return context;
};