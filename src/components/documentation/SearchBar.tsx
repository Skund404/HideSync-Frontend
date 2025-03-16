// src/components/documentation/SearchBar.tsx

import { Search, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  initialValue = '',
  placeholder = 'Search documentation...',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  // Update search term when initialValue changes
  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className='relative w-64'>
      <div className='relative'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
          <Search size={18} className='text-gray-400' />
        </div>
        <input
          type='search'
          value={searchTerm}
          onChange={handleInputChange}
          className='w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500'
          placeholder={placeholder}
        />
        {searchTerm && (
          <button
            type='button'
            onClick={handleClear}
            className='absolute inset-y-0 right-0 flex items-center pr-3'
          >
            <X size={16} className='text-gray-400 hover:text-gray-500' />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
