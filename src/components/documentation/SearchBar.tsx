// src/components/documentation/SearchBar.tsx
import { useDocumentation } from '@/context/DocumentationContext';
import {
  documentationHelpers,
  DocumentationResource,
} from '@/types/documentationTypes';
import { BookOpen, Clock, FileText, Search, Video, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  defaultQuery?: string; // More appropriate name than initialValue
}

const SearchBar: React.FC<SearchBarProps> = ({
  className = '',
  placeholder = 'Search documentation...',
  onSearch,
  defaultQuery = '',
}) => {
  const navigate = useNavigate();
  const { searchResources } = useDocumentation();
  const [query, setQuery] = useState(defaultQuery);
  const [results, setResults] = useState<DocumentationResource[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Update query if defaultQuery changes
  useEffect(() => {
    if (defaultQuery) {
      setQuery(defaultQuery);
    }
  }, [defaultQuery]);

  // Load recent searches from localStorage
  useEffect(() => {
    const storedSearches = localStorage.getItem('recentDocumentationSearches');
    if (storedSearches) {
      try {
        setRecentSearches(JSON.parse(storedSearches));
      } catch (e) {
        // If JSON parse fails, reset recent searches
        setRecentSearches([]);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    const updatedSearches = [
      searchQuery,
      ...recentSearches.filter((s) => s !== searchQuery),
    ].slice(0, 5); // Keep only 5 most recent

    setRecentSearches(updatedSearches);
    localStorage.setItem(
      'recentDocumentationSearches',
      JSON.stringify(updatedSearches)
    );
  };

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Perform search with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    const debouncedSearch = documentationHelpers.debounce(async (q: string) => {
      try {
        const searchResults = await searchResources(q);
        setResults(searchResults.slice(0, 5)); // Show only top 5 results in dropdown
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    debouncedSearch(query);

    return () => {
      // Cleanup function to handle component unmount during debounce
    };
  }, [query, searchResources]);

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    // Save to recent searches
    saveRecentSearch(query);

    // Close results dropdown
    setShowResults(false);

    // Navigate to search results page or call onSearch callback
    if (onSearch) {
      onSearch(query);
    } else {
      navigate(`/documentation/search?query=${encodeURIComponent(query)}`);
    }
  };

  // Get icon based on resource type
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className='mr-2 flex-shrink-0' size={16} />;
      case 'GUIDE':
      case 'TUTORIAL':
        return <BookOpen className='mr-2 flex-shrink-0' size={16} />;
      default:
        return <FileText className='mr-2 flex-shrink-0' size={16} />;
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className='relative'>
          <Search
            className='absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400'
            size={18}
          />

          <input
            type='text'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className='w-full pl-10 pr-10 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
            onFocus={() => {
              if (query.trim() || recentSearches.length > 0) {
                setShowResults(true);
              }
            }}
          />

          {query && (
            <button
              type='button'
              onClick={() => setQuery('')}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600'
              aria-label='Clear search'
            >
              <X size={18} />
            </button>
          )}
        </div>
      </form>

      {/* Results dropdown */}
      {showResults && (query.trim() || recentSearches.length > 0) && (
        <div className='absolute z-10 mt-1 w-full bg-white border border-stone-200 rounded-lg shadow-lg max-h-80 overflow-y-auto'>
          {/* Recent searches */}
          {!query.trim() && recentSearches.length > 0 && (
            <div className='p-2'>
              <h3 className='text-xs font-semibold text-stone-500 uppercase px-3 py-1'>
                Recent Searches
              </h3>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  className='flex items-center w-full px-3 py-2 text-sm text-stone-700 hover:bg-amber-50 rounded'
                  onClick={() => {
                    setQuery(search);
                    setShowResults(false);
                    if (onSearch) {
                      onSearch(search);
                    } else {
                      navigate(
                        `/documentation/search?query=${encodeURIComponent(
                          search
                        )}`
                      );
                    }
                  }}
                >
                  <Clock size={16} className='mr-2 text-stone-400' />
                  <span>{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Search results */}
          {query.trim() && (
            <div className='p-2'>
              <h3 className='text-xs font-semibold text-stone-500 uppercase px-3 py-1'>
                {isSearching
                  ? 'Searching...'
                  : results.length > 0
                  ? 'Results'
                  : 'No Results'}
              </h3>

              {isSearching ? (
                <div className='px-3 py-2 text-sm text-stone-500'>
                  <div className='flex items-center'>
                    <div className='animate-pulse h-4 w-4 bg-amber-200 rounded-full mr-2'></div>
                    <span>Searching...</span>
                  </div>
                </div>
              ) : results.length > 0 ? (
                results.map((result) => (
                  <a
                    key={result.id}
                    href={`/documentation/article/${result.id}`}
                    className='flex items-center px-3 py-2 text-sm text-stone-700 hover:bg-amber-50 rounded'
                    onClick={(e) => {
                      e.preventDefault();
                      saveRecentSearch(query);
                      setShowResults(false);
                      navigate(`/documentation/article/${result.id}`);
                    }}
                  >
                    {getResourceIcon(result.type)}
                    <div>
                      <div className='font-medium'>{result.title}</div>
                      <div className='text-xs text-stone-500 truncate'>
                        {documentationHelpers.generatePreview(
                          result.description,
                          60
                        )}
                      </div>
                    </div>
                  </a>
                ))
              ) : (
                query.trim() && (
                  <div className='px-3 py-2 text-sm text-stone-500'>
                    No results found for "{query}"
                  </div>
                )
              )}

              {/* View all results link */}
              {query.trim() && results.length > 0 && (
                <div className='border-t border-stone-100 mt-1 pt-1'>
                  <button
                    className='flex items-center justify-center w-full px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 rounded'
                    onClick={() => {
                      saveRecentSearch(query);
                      setShowResults(false);
                      navigate(
                        `/documentation/search?query=${encodeURIComponent(
                          query
                        )}`
                      );
                    }}
                  >
                    View all results
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
