// src/context/PatternContext.tsx
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  addPattern,
  deletePattern,
  filterPatterns as filterPatternsService,
  getPatternById,
  getPatterns,
  togglePatternFavorite,
  updatePattern,
} from '../services/mock/patterns';
import { Pattern, PatternFilters } from '../types/patternTypes';

interface PatternContextValue {
  patterns: Pattern[];
  loading: boolean;
  error: string | null;
  getPatternById: (id: number) => Promise<Pattern | null>;
  addPattern: (pattern: Omit<Pattern, 'id'>) => Promise<Pattern>;
  updatePattern: (id: number, pattern: Partial<Pattern>) => Promise<Pattern>;
  deletePattern: (id: number) => Promise<boolean>;
  toggleFavorite: (id: number) => Promise<Pattern>;
  filterPatterns: (filters: PatternFilters) => Pattern[];
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
      setError('Failed to fetch patterns');
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
      setError(`Failed to fetch pattern with id ${id}`);
      console.error(`Error fetching pattern with id ${id}:`, err);
      return null;
    }
  };

  const handleAddPattern = async (
    pattern: Omit<Pattern, 'id'>
  ): Promise<Pattern> => {
    try {
      const newPattern = await addPattern(pattern);
      setPatterns((prevPatterns) => [...prevPatterns, newPattern]);
      return newPattern;
    } catch (err) {
      setError('Failed to add pattern');
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
      setPatterns((prevPatterns) =>
        prevPatterns.map((p) => (p.id === id ? updatedPattern : p))
      );
      return updatedPattern;
    } catch (err) {
      setError(`Failed to update pattern with id ${id}`);
      console.error(`Error updating pattern with id ${id}:`, err);
      throw err;
    }
  };

  const handleDeletePattern = async (id: number): Promise<boolean> => {
    try {
      const success = await deletePattern(id);
      if (success) {
        setPatterns((prevPatterns) => prevPatterns.filter((p) => p.id !== id));
      }
      return success;
    } catch (err) {
      setError(`Failed to delete pattern with id ${id}`);
      console.error(`Error deleting pattern with id ${id}:`, err);
      throw err;
    }
  };

  const handleToggleFavorite = async (id: number): Promise<Pattern> => {
    try {
      const updatedPattern = await togglePatternFavorite(id);
      setPatterns((prevPatterns) =>
        prevPatterns.map((p) => (p.id === id ? updatedPattern : p))
      );
      return updatedPattern;
    } catch (err) {
      setError(`Failed to toggle favorite for pattern with id ${id}`);
      console.error(`Error toggling favorite for pattern with id ${id}:`, err);
      throw err;
    }
  };

  const handleFilterPatterns = (filters: PatternFilters): Pattern[] => {
    return filterPatternsService(filters);
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
