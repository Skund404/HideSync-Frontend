// src/hooks/usePatterns.ts
import { useCallback, useMemo, useState } from 'react';
import { usePatternContext } from '../context/PatternContext';
import { EnumTypes } from '../types';
import { Pattern, PatternFilters } from '../types/patternTypes';

interface UsePatternsResult {
  // State
  patterns: Pattern[];
  filteredPatterns: Pattern[];
  activePattern: Pattern | null;
  loading: boolean;
  error: string | null;

  // Pattern view state
  viewMode: 'grid' | 'list';
  activeTab: 'all' | 'favorites' | 'recent';
  filters: PatternFilters;

  // Actions
  setViewMode: (mode: 'grid' | 'list') => void;
  setActiveTab: (tab: 'all' | 'favorites' | 'recent') => void;
  setFilters: (filters: PatternFilters) => void;
  updateFilter: <K extends keyof PatternFilters>(
    key: K,
    value: PatternFilters[K]
  ) => void;
  clearFilters: () => void;
  setActivePattern: (pattern: Pattern | null) => void;

  // Pattern operations
  addPattern: (pattern: Omit<Pattern, 'id'>) => Promise<Pattern>;
  updatePattern: (id: number, pattern: Partial<Pattern>) => Promise<Pattern>;
  deletePattern: (id: number) => Promise<boolean>;
  toggleFavorite: (id: number) => Promise<Pattern>;
  refreshPatterns: () => Promise<void>;

  // Derived data
  skillLevels: Array<{ label: string; value: string }>;
  projectTypes: Array<{ label: string; value: string }>;
  patternsBySkillLevel: Record<string, number>;
  patternsByProjectType: Record<string, number>;
  recentPatterns: Pattern[];
  favoritePatterns: Pattern[];
}

export const usePatterns = (): UsePatternsResult => {
  // Get pattern context
  const {
    patterns,
    loading,
    error,
    getPatternById,
    addPattern,
    updatePattern,
    deletePattern,
    toggleFavorite,
    filterPatterns,
    refreshPatterns,
  } = usePatternContext();

  // Local state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'recent'>(
    'all'
  );
  const [filters, setFilters] = useState<PatternFilters>({
    searchQuery: '',
    skillLevel: '',
    projectType: '',
    tags: [],
  });
  const [activePattern, setActivePattern] = useState<Pattern | null>(null);

  // Update a single filter
  const updateFilter = useCallback(
    <K extends keyof PatternFilters>(key: K, value: PatternFilters[K]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      skillLevel: '',
      projectType: '',
      tags: [],
    });
  }, []);

  // Compute filtered patterns based on active tab and filters
  const filteredPatterns = useMemo(() => {
    const filtered = filterPatterns(filters);

    switch (activeTab) {
      case 'favorites':
        return filtered.filter((p) => p.isFavorite);
      case 'recent':
        return filtered
          .sort(
            (a, b) =>
              new Date(b.modifiedAt).getTime() -
              new Date(a.modifiedAt).getTime()
          )
          .slice(0, 6);
      case 'all':
      default:
        return filtered;
    }
  }, [activeTab, filters, patterns, filterPatterns]);

  // Prepare dropdown options for skill levels
  const skillLevels = useMemo(() => {
    return Object.entries(EnumTypes.SkillLevel).map(([key, value]) => ({
      label: key
        .split('_')
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(' '),
      value,
    }));
  }, []);

  // Prepare dropdown options for project types
  const projectTypes = useMemo(() => {
    return Object.entries(EnumTypes.ProjectType).map(([key, value]) => ({
      label: key
        .split('_')
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(' '),
      value,
    }));
  }, []);

  // Count patterns by skill level
  const patternsBySkillLevel = useMemo(() => {
    return patterns.reduce((acc, pattern) => {
      const level = pattern.skillLevel.toString();
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [patterns]);

  // Count patterns by project type
  const patternsByProjectType = useMemo(() => {
    return patterns.reduce((acc, pattern) => {
      const type = pattern.projectType.toString();
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [patterns]);

  // Get recent patterns
  const recentPatterns = useMemo(() => {
    return [...patterns]
      .sort(
        (a, b) =>
          new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
      )
      .slice(0, 6);
  }, [patterns]);

  // Get favorite patterns
  const favoritePatterns = useMemo(() => {
    return patterns.filter((p) => p.isFavorite);
  }, [patterns]);

  return {
    // State
    patterns,
    filteredPatterns,
    activePattern,
    loading,
    error,

    // Pattern view state
    viewMode,
    activeTab,
    filters,

    // Actions
    setViewMode,
    setActiveTab,
    setFilters,
    updateFilter,
    clearFilters,
    setActivePattern,

    // Pattern operations
    addPattern,
    updatePattern,
    deletePattern,
    toggleFavorite,
    refreshPatterns,

    // Derived data
    skillLevels,
    projectTypes,
    patternsBySkillLevel,
    patternsByProjectType,
    recentPatterns,
    favoritePatterns,
  };
};
