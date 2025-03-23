// src/components/documentation/CategoryNav.tsx
import React from 'react';
import {
  DocumentationCategory,
  DocumentationCategoryResource,
} from '../../types/documentationTypes';

// Define proper props interface for CategoryNav
export interface CategoryNavProps {
  categories: DocumentationCategoryResource[];
  activeCategory: DocumentationCategory | null;
  onCategorySelect: (categoryId: DocumentationCategory) => void;
}

const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategory,
  onCategorySelect,
}) => {
  // Component implementation (this is a placeholder - your actual implementation may differ)
  return (
    <div className='category-nav'>
      <h3 className='text-sm font-medium text-gray-500 uppercase mb-3'>
        Categories
      </h3>
      <ul className='space-y-1'>
        {categories.map((category) => (
          <li key={category.id}>
            <button
              onClick={() =>
                onCategorySelect(category.id as DocumentationCategory)
              }
              className={`w-full text-left px-3 py-2 rounded-md ${
                activeCategory === category.id
                  ? 'bg-amber-100 text-amber-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryNav;
