// src/pages/Documentation.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { DocumentationProvider } from '@/context/DocumentationContext';
import { ContextHelpProvider } from '@/components/documentation/contextual/ContextHelpProvider';
import AdvancedDocumentationList from '@/components/documentation/AdvancedDocumentationList';
import EnhancedArticleView from '@/components/documentation/EnhancedArticleView';
import CategoryNav from '@/components/documentation/CategoryNav';
import ContextHelpModal from '@/components/documentation/contextual/ContextHelpModal';
import { DocumentationFilters, DocumentationCategory, DocumentationType, SkillLevel } from '@/types/documentationTypes';
import { Search, Filter, X, Plus, BookOpen } from 'lucide-react';

const Documentation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [initialFilters, setInitialFilters] = useState<DocumentationFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Parse URL params for filters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filters: DocumentationFilters = {};
    
    if (params.has('category')) filters.category = params.get('category') as DocumentationCategory;
    if (params.has('type')) filters.type = params.get('type') as DocumentationType;
    if (params.has('skill')) filters.skillLevel = params.get('skill') as SkillLevel;
    if (params.has('search')) {
      filters.search = params.get('search') as string;
      setSearchQuery(filters.search);
    }
    if (params.has('page')) filters.page = parseInt(params.get('page') || '1', 10);
    
    setInitialFilters(filters);
    
    // Show filter panel if any filters are applied
    if (Object.keys(filters).length > 0) {
      setShowFilters(true);
    }
  }, [location]);
  
  // Update URL when filters change
  const handleFiltersChange = useCallback((filters: DocumentationFilters) => {
    const params = new URLSearchParams();
    
    if (filters.category) params.set('category', filters.category);
    if (filters.type) params.set('type', filters.type);
    if (filters.skillLevel) params.set('skill', filters.skillLevel);
    if (filters.search) params.set('search', filters.search);
    if (filters.page && filters.page > 1) params.set('page', filters.page.toString());
    
    navigate(`${location.pathname}?${params.toString()}`);
  }, [navigate, location.pathname]);
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleFiltersChange({ ...initialFilters, search: searchQuery, page: 1 });
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setInitialFilters({});
    navigate(location.pathname);
  };
  
  // Handle filter changes
  const handleFilterChange = (name: string, value: string | null) => {
    const newFilters = { ...initialFilters, page: 1 };
    
    if (value) {
      newFilters[name] = value;
    } else {
      delete newFilters[name];
    }
    
    handleFiltersChange(newFilters);
  };
  
  return (
    <DocumentationProvider>
      <ContextHelpProvider>
        <div className="min-h-screen bg-white flex flex-col">
          {/* Main header */}
          <div className="bg-amber-50 border-b border-amber-200 py-4 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h1 className="text-2xl font-bold text-stone-800 flex items-center">
                <BookOpen className="mr-2" />
                Documentation Center
              </h1>
              
              {/* Search form */}
              <form onSubmit={handleSearch} className="w-full md:w-auto md:min-w-[320px]">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search documentation..."
                    className="w-full px-4 py-2 pr-10 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 h-full px-3 text-stone-500 hover:text-amber-600"
                  >
                    <Search size={18} />
                  </button>
                </div>
              </form>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center px-3 py-1.5 border rounded-md ${
                    showFilters || Object.keys(initialFilters).length > 0
                      ? 'bg-amber-100 border-amber-300 text-amber-700'
                      : 'border-stone-300 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Filter size={16} className="mr-1" />
                  Filters
                  {Object.keys(initialFilters).length > 0 && (
                    <span className="ml-1 bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {Object.keys(initialFilters).length}
                    </span>
                  )}
                </button>
                
                <Link
                  to="/documentation/new"
                  className="flex items-center px-3 py-1.5 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                >
                  <Plus size={16} className="mr-1" />
                  New
                </Link>
              </div>
            </div>
          </div>
          
          {/* Filters bar */}
          {showFilters && (
            <div className="bg-stone-50 border-b border-stone-200 px-6 py-3">
              <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4">
                {/* Category filter */}
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Category</label>
                  <select
                    value={initialFilters.category || ''}
                    onChange={e => handleFilterChange('category', e.target.value || null)}
                    className="px-3 py-1.5 border border-stone-300 rounded-md text-sm bg-white"
                  >
                    <option value="">All Categories</option>
                    {Object.values(DocumentationCategory).map(category => (
                      <option key={category} value={category}>
                        {category.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Type filter */}
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Type</label>
                  <select
                    value={initialFilters.type || ''}
                    onChange={e => handleFilterChange('type', e.target.value || null)}
                    className="px-3 py-1.5 border border-stone-300 rounded-md text-sm bg-white"
                  >
                    <option value="">All Types</option>
                    {Object.values(DocumentationType).map(type => (
                      <option key={type} value={type}>
                        {type.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Skill level filter */}
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Skill Level</label>
                  <select
                    value={initialFilters.skillLevel || ''}
                    onChange={e => handleFilterChange('skillLevel', e.target.value || null)}
                    className="px-3 py-1.5 border border-stone-300 rounded-md text-sm bg-white"
                  >
                    <option value="">All Levels</option>
                    {Object.values(SkillLevel).map(level => (
                      <option key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Clear filters */}
                {Object.keys(initialFilters).length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center px-3 py-1.5 ml-auto text-stone-600 hover:text-stone-800"
                  >
                    <X size={16} className="mr-1" />
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}
          
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar navigation */}
            <CategoryNav />
            
            {/* Main content area */}
            <div className="flex-1 overflow-auto">
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <AdvancedDocumentationList 
                      initialFilters={initialFilters}
                      onFiltersChange={handleFiltersChange}
                      useVirtualScroll={false}
                      className="p-6"
                    />
                  } 
                />
                <Route 
                  path="/category/:categoryId" 
                  element={
                    <AdvancedDocumentationList 
                      initialFilters={initialFilters}
                      onFiltersChange={handleFiltersChange}
                      useVirtualScroll={false}
                      className="p-6"
                    />
                  } 
                />
                <Route path="/article/:id" element={<EnhancedArticleView />} />
                <Route 
                  path="/search" 
                  element={
                    <AdvancedDocumentationList
                      initialFilters={{ ...initialFilters, search: initialFilters.search || '' }}
                      onFiltersChange={handleFiltersChange}
                      useVirtualScroll={true}
                      className="p-6"
                    />
                  } 
                />
                {/* Additional routes for videos, workflows, etc. would go here */}
              </Routes>
            </div>
          </div>
          
          {/* Contextual help modal */}
          <ContextHelpModal />
        </div>
      </ContextHelpProvider>
    </DocumentationProvider>
  );
};

export default Documentation;