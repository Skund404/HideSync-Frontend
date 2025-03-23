// src/components/documentation/ResourceCard.tsx
import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { DocumentationResource, documentationHelpers } from '@/types/documentationTypes';

interface ResourceCardProps {
  resource: DocumentationResource;
  compact?: boolean;
  onClick?: () => void;
}

const ResourceCard: React.FC<ResourceCardProps> = memo(({ 
  resource, 
  compact = false,
  onClick
}) => {
  // Type color map for visual distinction
  const typeColors: Record<string, string> = {
    guide: 'bg-blue-100 text-blue-800',
    tutorial: 'bg-green-100 text-green-800',
    reference: 'bg-purple-100 text-purple-800',
    troubleshooting: 'bg-red-100 text-red-800',
    faq: 'bg-yellow-100 text-yellow-800',
    // Add other types with their colors
    default: 'bg-stone-100 text-stone-800'
  };
  
  // Get type color or default
  const typeColor = typeColors[resource.type] || typeColors.default;
  
  const handleClick = () => {
    if (onClick) onClick();
  };
  
  return (
    <Link
      to={`/documentation/article/${resource.id}`}
      className={`
        block h-full border border-stone-200 rounded-lg overflow-hidden 
        hover:shadow-md transition-shadow duration-300
        ${compact ? 'p-3' : 'p-5'}
      `}
      onClick={handleClick}
    >
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-start">
          <span className={`px-2 py-1 text-xs rounded-full ${typeColor}`}>
            {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
          </span>
          
          <span className="text-xs text-stone-500">
            {documentationHelpers.formatDate(resource.lastUpdated)}
          </span>
        </div>
        
        <h3 className={`${compact ? 'text-base' : 'text-lg'} font-semibold mt-3 text-stone-800`}>
          {resource.title}
        </h3>
        
        {!compact && (
          <p className="mt-2 text-stone-600 text-sm flex-grow">
            {documentationHelpers.generatePreview(resource.description, 120)}
          </p>
        )}
        
        <div className="mt-3 flex flex-wrap gap-1">
          {resource.tags.slice(0, compact ? 2 : 3).map(tag => (
            <span 
              key={tag}
              className="inline-block px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {resource.tags.length > (compact ? 2 : 3) && (
            <span className="inline-block px-2 py-1 text-xs text-stone-500">
              +{resource.tags.length - (compact ? 2 : 3)} more
            </span>
          )}
        </div>
        
        {resource.contextualHelpKeys?.length > 0 && (
          <div className="mt-2 text-xs text-stone-400">
            <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">Contextual Help</span>
          </div>
        )}
      </div>
    </Link>
  );
});

ResourceCard.displayName = 'ResourceCard';

export default ResourceCard;