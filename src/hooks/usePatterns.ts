// src/hooks/usePatterns.ts
import { useCallback, useEffect, useState } from 'react';
import { usePatternContext } from '../context/PatternContext';
import { EnumTypes } from '../types';
import { Pattern, PatternFilters } from '../types/patternTypes';
import { ApiError } from '../services/api-client';

interface UsePatternResult {
  // Existing properties
  filteredPatterns: Pattern[];
  loading: boolean;
  error: string | null;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  activeTab: 'all' | 'favorites' | 'recent';
  setActiveTab: (tab: 'all' | 'favorites' | 'recent') => void;
  filters: PatternFilters;
  setFilters: (filters: PatternFilters) => void;
  skillLevels: { value: string; label: string }[];
  projectTypes: { value: string; label: string }[];
  refreshPatterns: () => Promise<void>;
  
  // Add CRUD operations
  getPatternById: (id: number) => Promise<Pattern | null>;
  addPattern: (pattern: Omit<Pattern, 'id'>) => Promise<Pattern>;
  updatePattern: (id: number, pattern: Partial<Pattern>) => Promise<Pattern>;
  deletePattern: (id: number) => Promise<boolean>;
  toggleFavorite: (id: number) => Promise<Pattern>;
}

export const usePatterns = (): UsePatternResult => {
  const { 
    patterns, 
    loading, 
    error, 
    filterPatterns, 
    refreshPatterns,
    getPatternById,
    addPattern,
    updatePattern,
    deletePattern,
    toggleFavorite
  } = usePatternContext();
  
  // Application state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    const savedMode = localStorage.getItem('patternViewMode');
    return (savedMode as 'grid' | 'list') || 'grid';
  });
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'recent'>('all');
  const [filters, setFilters] = useState<PatternFilters>({});
  const [filteredPatterns, setFilteredPatterns] = useState<Pattern[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);
  
  // Options for dropdown menus
  const skillLevels = Object.values(EnumTypes.SkillLevel).map((level) => ({
    value: level.toString(),
    label: level.toString().replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
  }));
  
  const projectTypes = Object.values(EnumTypes.ProjectType).map((type) => ({
    value: type.toString(),
    label: type.toString().replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
  }));
  
  // Save view mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('patternViewMode', viewMode);
  }, [viewMode]);
  
  // Apply filters from API or locally
  const applyFilters = useCallback(async () => {
    setIsFiltering(true);
    setFilterError(null);
    try {
      // Apply API-based filtering
      const filtered = await filterPatterns({
        ...filters,
        favorite: activeTab === 'favorites' ? true : undefined,
      });
      
      // Apply 'recent' filtering locally if needed
      if (activeTab === 'recent') {
        filtered.sort((a, b) => {
          return new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();
        });
      }
      
      setFilteredPatterns(filtered);
    } catch (err) {
      const apiError = err as ApiError;
      setFilterError(apiError.message || 'Error filtering patterns');
      // Fall back to showing all patterns
      setFilteredPatterns(patterns);
    } finally {
      setIsFiltering(false);
    }
  }, [filters, activeTab, filterPatterns, patterns]);
  
  // Apply filters when patterns, filters, or activeTab changes
  useEffect(() => {
    applyFilters();
  }, [filters, activeTab, patterns, applyFilters]);
  
  return {
    filteredPatterns,
    // Combine loading states
    loading: loading || isFiltering,
    // Show first error encountered
    error: error || filterError,
    viewMode,
    setViewMode,
    activeTab,
    setActiveTab,
    filters,
    setFilters,
    skillLevels,
    projectTypes,
    refreshPatterns,
    
    // Add CRUD operations to the return value
    getPatternById,
    addPattern,
    updatePattern,
    deletePattern,
    toggleFavorite
  };
};