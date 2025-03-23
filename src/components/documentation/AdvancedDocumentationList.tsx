// src/components/documentation/AdvancedDocumentationList.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useDocumentation } from '@/context/DocumentationContext';
import { DocumentationResource, DocumentationFilters, documentationHelpers } from '@/types/documentationTypes';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import ResourceCard from './ResourceCard';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Grid, 
  List,
  FileText,
  BookOpen,
  SortAsc,
  SortDesc
} from 'lucide-react';

interface AdvancedDocumentationListProps {
  initialFilters?: DocumentationFilters;
  onFiltersChange?: (filters: DocumentationFilters) => void;
  useVirtualScroll?: boolean;
  className?: string;
}

type ViewMode = 'grid' | 'list';
type SortField = 'title' | 'lastUpdated';
type SortDirection = 'asc' | 'desc';

const AdvancedDocumentationList: React.FC<AdvancedDocumentationListProps> = ({
  initialFilters = {},
  onFiltersChange,
  useVirtualScroll = false,
  className = ''
}) => {
  const { 
    resources, 
    loading, 
    error, 
    pagination, 
    fetchResources, 
    nextPage, 
    prevPage, 
    goToPage 
  } = useDocumentation();
  
  const { categoryId } = useParams<{ categoryId: string }>();
  
  // Local state for filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<DocumentationFilters>(initialFilters);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('lastUpdated');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Refs for scrolling and load tracking
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);
  const lastScrollPosition = useRef(0);
  
  // Update local filters when props change
  useEffect(() => {
    // Merge initial filters with category from route params
    const mergedFilters = { ...initialFilters };
    if (categoryId) {
      mergedFilters.category = categoryId as any;
    }
    
    setFilters(mergedFilters);
    
    // Set search term from filters for the search input
    if (mergedFilters.search) {
      setSearchTerm(mergedFilters.search);
    }
  }, [initialFilters, categoryId]);
  
  // Apply filters and fetch resources
  useEffect(() => {
    fetchResources(filters);
  }, [filters, fetchResources]);
  
  // Sort resources client-side
  const sortedResources = useMemo(() => {
    if (!resources || resources.length === 0) return [];
    
    return [...resources].sort((a, b) => {
      if (sortField === 'title') {
        return sortDirection === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortField === 'lastUpdated') {
        const dateA = new Date(a.lastUpdated).getTime();
        const dateB = new Date(b.lastUpdated).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });
  }, [resources, sortField, sortDirection]);
  
  // Debounced search handler
  const debouncedSearch = useCallback(
    documentationHelpers.debounce((query: string) => {
      const newFilters = { ...filters, search: query, page: 1 };
      setFilters(newFilters);
      onFiltersChange?.(newFilters);
    }, 300),
    [filters, onFiltersChange]
  );
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    debouncedSearch(query);
  };
  
  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (
      containerRef.current &&
      useVirtualScroll &&
      !loading &&
      !loadingMoreRef.current &&
      pagination.page < pagination.totalPages
    ) {
      const { scrollTop, clientHeight, scrollHeight } = containerRef.current;
      
      // Check if we've scrolled down
      if (scrollTop > lastScrollPosition.current) {
        lastScrollPosition.current = scrollTop;
        
        // If we're near the bottom, load more
        if (scrollTop + clientHeight >= scrollHeight - 500) {
          loadingMoreRef.current = true;
          nextPage();
          
          // Reset loading flag after a brief delay to prevent duplicate calls
          setTimeout(() => {
            loadingMoreRef.current = false;
          }, 300);
        }
      }
    }
  }, [loading, nextPage, pagination, useVirtualScroll]);
  
  // Setup scroll listener for infinite scroll
  useEffect(() => {
    const container = containerRef.current;
    if (container && useVirtualScroll) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [useVirtualScroll, handleScroll]);
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
    goToPage(page);
    
    // Scroll to top when page changes
    if (containerRef.current) {
      containerRef.current.scrollTo(0, 0);
    }
  };
  
  // Handle sorting
  const handleSortChange = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default desc direction
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  return (
    <div className={`documentation-list ${className}`}>
      {/* List header with controls */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-stone-800">
            {categoryId ? (
              <span>Category: {categoryId}</span>
            ) : filters.search ? (
              <span>Search: "{filters.search}"</span>
            ) : (
              <span>All Documentation</span>
            )}
          </h2>
          {!loading && (
            <p className="text-stone-500 text-sm mt-1">
              {pagination.totalItems} {pagination.totalItems === 1 ? 'result' : 'results'}
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* View mode toggle */}
          <div className="flex border border-stone-300 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${
                viewMode === 'grid' 
                  ? 'bg-amber-100 text-amber-800 border-r border-amber-300' 
                  : 'bg-white text-stone-600 border-r border-stone-300 hover:bg-stone-50'
              }`}
              aria-label="Grid view"
              title="Grid view"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${
                viewMode === 'list' 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-white text-stone-600 hover:bg-stone-50'
              }`}
              aria-label="List view"
              title="List view"
            >
              <List size={16} />
            </button>
          </div>
          
          {/* Sort controls */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-500">Sort by:</span>
            <div className="flex border border-stone-300 rounded-md overflow-hidden">
              <button
                onClick={() => handleSortChange('title')}
                className={`px-2 py-1 text-sm ${
                  sortField === 'title' 
                    ? 'bg-amber-100 text-amber-800 border-r border-amber-300' 
                    : 'bg-white text-stone-600 border-r border-stone-300 hover:bg-stone-50'
                }`}
              >
                Title
                {sortField === 'title' && (
                  sortDirection === 'asc' ? <SortAsc size={14} className="inline ml-1" /> : <SortDesc size={14} className="inline ml-1" />
                )}
              </button>
              <button
                onClick={() => handleSortChange('lastUpdated')}
                className={`px-2 py-1 text-sm ${
                  sortField === 'lastUpdated' 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                Updated
                {sortField === 'lastUpdated' && (
                  sortDirection === 'asc' ? <SortAsc size={14} className="inline ml-1" /> : <SortDesc size={14} className="inline ml-1" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search input (optional) */}
      {false && (
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search documentation..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full p-3 border border-stone-300 rounded-lg"
          />
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={() => fetchResources(filters)}
        />
      )}
      
      {/* Resource list */}
      <div 
        ref={containerRef}
        className={useVirtualScroll ? "h-[calc(100vh-220px)] overflow-y-auto" : ""}
      >
        {loading && resources.length === 0 ? (
          <div className="py-12">
            <LoadingSpinner message="Loading resources..." />
          </div>
        ) : resources.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              // Grid view
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedResources.map(resource => (
                  <ResourceCard 
                    key={resource.id} 
                    resource={resource} 
                  />
                ))}
              </div>
            ) : (
              // List view
              <div className="space-y-3">
                {sortedResources.map(resource => (
                  <div 
                    key={resource.id}
                    className="flex border border-stone-200 rounded-lg hover:shadow-md transition-shadow duration-300 overflow-hidden"
                  >
                    <div className="flex items-center justify-center bg-stone-50 p-4 w-14">
                      {resource.type === 'guide' ? (
                        <BookOpen size={24} className="text-blue-500" />
                      ) : (
                        <FileText size={24} className="text-stone-500" />
                      )}
                    </div>
                    <div className="p-4 flex flex-grow flex-col">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-stone-800 hover:text-amber-600">
                          <a href={`/documentation/article/${resource.id}`}>
                            {resource.title}
                          </a>
                        </h3>
                        <span className="text-xs text-stone-500">
                          {documentationHelpers.formatDate(resource.lastUpdated)}
                        </span>
                      </div>
                      <p className="mt-1 text-stone-600 text-sm">
                        {documentationHelpers.generatePreview(resource.description, 140)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {resource.tags.slice(0, 3).map(tag => (
                          <span 
                            key={tag}
                            className="inline-block px-2 py-0.5 bg-stone-100 text-stone-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {resource.tags.length > 3 && (
                          <span className="inline-block px-2 py-0.5 text-xs text-stone-500">
                            +{resource.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Loading indicator for infinite scroll */}
            {loading && useVirtualScroll && (
              <div className="py-4 flex justify-center">
                <LoadingSpinner size="small" message="Loading more..." />
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-12 bg-stone-50 rounded-lg">
            <p className="text-stone-600 text-lg mb-2">No resources found</p>
            <p className="text-stone-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
      
      {/* Pagination controls (only show if not using virtual scroll) */}
      {!useVirtualScroll && pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(1)}
              disabled={pagination.page === 1}
              className={`p-2 rounded-md ${
                pagination.page === 1
                  ? 'text-stone-400 cursor-not-allowed'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
              aria-label="First page"
            >
              <ChevronsLeft size={16} />
            </button>
            
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`p-2 rounded-md ${
                pagination.page === 1
                  ? 'text-stone-400 cursor-not-allowed'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            
            {/* Page numbers */}
            <div className="hidden sm:flex space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                // Calculate which page numbers to show
                let pageNum: number;
                if (pagination.totalPages <= 5) {
                  // Show all pages if 5 or fewer
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  // Show first 5 pages if current page is near the start
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  // Show last 5 pages if current page is near the end
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  // Show 2 pages before and after current page
                  pageNum = pagination.page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${
                      pagination.page === pageNum
                        ? 'bg-amber-100 text-amber-800 font-medium'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            {/* Mobile page indicator */}
            <span className="sm:hidden px-2 py-1">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className={`p-2 rounded-md ${
                pagination.page === pagination.totalPages
                  ? 'text-stone-400 cursor-not-allowed'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
            
            <button
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
              className={`p-2 rounded-md ${
                pagination.page === pagination.totalPages
                  ? 'text-stone-400 cursor-not-allowed'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
              aria-label="Last page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedDocumentationList;