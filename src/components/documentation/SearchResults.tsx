// src/components/documentation/SearchResults.tsx

import { Search } from 'lucide-react';
import React from 'react';
import { DocumentationSearchResult } from '../../types/documentationTypes';
import ResourceCard from './ResourceCard';

interface SearchResultsProps {
  results: DocumentationSearchResult | null;
  query: string;
  onResourceSelect: (id: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  query,
  onResourceSelect,
}) => {
  if (!results) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600'></div>
      </div>
    );
  }

  if (results.resources.length === 0) {
    return (
      <div className='bg-white rounded-lg shadow-sm p-6 text-center'>
        <div className='inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4'>
          <Search size={24} className='text-gray-500' />
        </div>
        <h3 className='text-lg font-medium mb-2'>No results found</h3>
        <p className='text-gray-600'>
          We couldn't find any documentation matching "{query}".
        </p>
        <div className='mt-4 text-gray-600'>
          <p className='text-sm'>Suggestions:</p>
          <ul className='text-sm list-disc list-inside mt-2'>
            <li>Check your spelling</li>
            <li>Try more general keywords</li>
            <li>Try different keywords</li>
            <li>Browse categories instead of searching</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className='search-results'>
      <div className='mb-6'>
        <h2 className='text-lg font-medium'>
          Search Results for "{query}"
          <span className='text-gray-500 text-base ml-2'>
            ({results.totalCount}{' '}
            {results.totalCount === 1 ? 'result' : 'results'})
          </span>
        </h2>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {results.resources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onClick={() => onResourceSelect(resource.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
