// src/components/documentation/CategoryNav.tsx

import { BookOpen, FileText, Layers, Package, Wrench } from 'lucide-react';
import React from 'react';
import {
  CategoryDefinition,
  DocumentationCategory,
} from '../../types/documentationTypes';

interface CategoryNavProps {
  categories: CategoryDefinition[];
  activeCategory: DocumentationCategory | null;
  onCategorySelect: (category: DocumentationCategory) => void;
}

const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategory,
  onCategorySelect,
}) => {
  // Get icon component based on icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'book-open':
        return <BookOpen size={18} />;
      case 'package':
        return <Package size={18} />;
      case 'layers':
        return <Layers size={18} />;
      case 'tool':
      case 'tools':
        return <Wrench size={18} />;
      default:
        return <FileText size={18} />;
    }
  };

  return (
    <div className='category-nav'>
      <h2 className='text-lg font-medium mb-4'>Categories</h2>

      <button
        onClick={() => onCategorySelect(null as any)}
        className={`flex items-center w-full text-left p-2 rounded-md mb-1 ${
          activeCategory === null
            ? 'bg-amber-100 text-amber-800'
            : 'hover:bg-gray-100'
        }`}
      >
        <BookOpen size={18} className='mr-2' />
        All Documentation
      </button>

      <div className='mt-2 space-y-1'>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`flex items-center w-full text-left p-2 rounded-md ${
              activeCategory === category.id
                ? 'bg-amber-100 text-amber-800'
                : 'hover:bg-gray-100'
            }`}
          >
            <span className='mr-2'>{getIconComponent(category.icon)}</span>
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryNav;
