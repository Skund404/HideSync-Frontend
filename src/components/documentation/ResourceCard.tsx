// src/components/documentation/ResourceCard.tsx

import {
  AlertTriangle,
  BookOpen,
  File,
  FileCode,
  FileCog,
  FileText,
  Video,
} from 'lucide-react';
import React from 'react';
import {
  DocumentationResource,
  ResourceType,
  SkillLevel,
} from '../../types/documentationTypes';

interface ResourceCardProps {
  resource: DocumentationResource;
  onClick: () => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onClick }) => {
  // Get icon based on resource type
  const getResourceIcon = () => {
    switch (resource.type) {
      case ResourceType.GUIDE:
        return <BookOpen className='text-blue-500' />;
      case ResourceType.TUTORIAL:
        return <FileText className='text-green-500' />;
      case ResourceType.REFERENCE:
        return <FileCode className='text-gray-500' />;
      case ResourceType.WORKFLOW:
        return <FileCog className='text-purple-500' />;
      case ResourceType.TEMPLATE:
        return <File className='text-yellow-500' />;
      case ResourceType.TROUBLESHOOTING:
        return <AlertTriangle className='text-red-500' />;
      case ResourceType.VIDEO:
        return <Video className='text-pink-500' />;
      default:
        return <FileText className='text-gray-500' />;
    }
  };

  // Get badge info based on skill level
  const getSkillLevelBadge = () => {
    switch (resource.skillLevel) {
      case SkillLevel.BEGINNER:
        return {
          label: 'Beginner',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
        };
      case SkillLevel.INTERMEDIATE:
        return {
          label: 'Intermediate',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
        };
      case SkillLevel.ADVANCED:
        return {
          label: 'Advanced',
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-800',
        };
      default:
        return {
          label: 'All Levels',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
        };
    }
  };

  const skillLevelBadge = getSkillLevelBadge();
  const hasVideo = resource.videos && resource.videos.length > 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      className='bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer'
      onClick={onClick}
    >
      <div className='p-4'>
        <div className='flex items-start'>
          <div className='mr-3 mt-1'>{getResourceIcon()}</div>
          <div>
            <h3 className='font-medium text-gray-900 mb-1'>{resource.title}</h3>
            <p className='text-sm text-gray-600 mb-3 line-clamp-2'>
              {resource.description}
            </p>

            <div className='flex items-center text-xs text-gray-500 mb-2'>
              <span>Updated {formatDate(resource.lastUpdated)}</span>
            </div>

            <div className='flex flex-wrap gap-2'>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${skillLevelBadge.bgColor} ${skillLevelBadge.textColor}`}
              >
                {skillLevelBadge.label}
              </span>

              {hasVideo && (
                <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-800'>
                  <Video size={12} className='mr-1' />
                  Video
                </span>
              )}

              {resource.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800'
                >
                  {tag}
                </span>
              ))}

              {resource.tags.length > 2 && (
                <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500'>
                  +{resource.tags.length - 2} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
