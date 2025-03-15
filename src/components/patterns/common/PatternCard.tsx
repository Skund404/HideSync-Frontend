// src/components/patterns/common/PatternCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatternContext } from '../../../context/PatternContext';
import { EnumTypes } from '../../../types';
import { Pattern, PatternFileType } from '../../../types/patternTypes';

interface PatternCardProps {
  pattern: Pattern;
  onClick?: (pattern: Pattern) => void;
}

const PatternCard: React.FC<PatternCardProps> = ({ pattern, onClick }) => {
  const { toggleFavorite } = usePatternContext();
  const navigate = useNavigate();

  // Get skill level display text
  const getSkillLevelDisplay = (level: EnumTypes.SkillLevel): string => {
    return level
      .toString()
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Get color for skill level tag
  const getSkillLevelColor = (level: EnumTypes.SkillLevel): string => {
    switch (level) {
      case EnumTypes.SkillLevel.BEGINNER:
        return 'bg-green-100 text-green-800';
      case EnumTypes.SkillLevel.INTERMEDIATE:
        return 'bg-amber-100 text-amber-800';
      case EnumTypes.SkillLevel.ADVANCED:
        return 'bg-red-100 text-red-800';
      case EnumTypes.SkillLevel.EXPERT:
      case EnumTypes.SkillLevel.MASTER:
      case EnumTypes.SkillLevel.MASTER_CRAFTSMAN:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  // Get icon for pattern file type
  const getFileTypeIcon = (fileType: PatternFileType): React.ReactNode => {
    switch (fileType) {
      case PatternFileType.SVG:
        return (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5 text-blue-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01'
            />
          </svg>
        );
      case PatternFileType.PDF:
        return (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5 text-red-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z'
            />
          </svg>
        );
      case PatternFileType.IMAGE:
        return (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5 text-green-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
            />
          </svg>
        );
      default:
        return (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5 text-stone-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
            />
          </svg>
        );
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(pattern.id);
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(pattern);
    } else {
      navigate(`/patterns/${pattern.id}`);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      className='bg-white rounded-lg shadow-sm overflow-hidden border border-stone-200 hover:shadow-md transition-shadow cursor-pointer'
      onClick={handleCardClick}
    >
      <div className='relative h-40 bg-stone-200'>
        <img
          src={pattern.thumbnail}
          alt={pattern.name}
          className='w-full h-full object-cover'
        />
        <div className='absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent'>
          <div className='flex justify-between'>
            <span
              className={`px-2 py-1 rounded-md text-xs font-medium ${getSkillLevelColor(
                pattern.skillLevel
              )}`}
            >
              {getSkillLevelDisplay(pattern.skillLevel)}
            </span>
            <button
              className={`text-white hover:text-amber-300 ${
                pattern.isFavorite ? 'text-amber-300' : ''
              }`}
              onClick={handleFavoriteClick}
              aria-label={
                pattern.isFavorite
                  ? 'Remove from favorites'
                  : 'Add to favorites'
              }
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5'
                fill={pattern.isFavorite ? 'currentColor' : 'none'}
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className='p-4'>
        <div className='flex justify-between items-start mb-2'>
          <h3 className='font-medium text-stone-900 text-lg'>{pattern.name}</h3>
          <div className='flex items-center'>
            {getFileTypeIcon(pattern.fileType)}
            <span className='text-xs ml-1 text-stone-500'>
              {pattern.fileType}
            </span>
          </div>
        </div>
        <p className='text-sm text-stone-600 mb-3 line-clamp-2'>
          {pattern.description}
        </p>
        <div className='mb-3'>
          <div className='text-xs font-medium text-stone-500 mb-2'>Tags</div>
          <div className='flex flex-wrap gap-1'>
            {pattern.tags.map((tag, index) => (
              <span
                key={index}
                className='px-2 py-1 bg-stone-100 rounded-md text-xs text-stone-700'
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className='grid grid-cols-2 gap-2 text-sm mb-3'>
          <div>
            <span className='text-stone-500'>Version:</span>
            <span className='ml-1 text-stone-700'>{pattern.version}</span>
          </div>
          <div>
            <span className='text-stone-500'>Author:</span>
            <span className='ml-1 text-stone-700'>{pattern.authorName}</span>
          </div>
          <div>
            <span className='text-stone-500'>Modified:</span>
            <span className='ml-1 text-stone-700'>
              {formatDate(pattern.modifiedAt)}
            </span>
          </div>
          {pattern.estimatedTime && (
            <div>
              <span className='text-stone-500'>Est. Time:</span>
              <span className='ml-1 text-stone-700'>
                {pattern.estimatedTime}h
              </span>
            </div>
          )}
        </div>
        <div className='border-t border-stone-100 pt-3 flex justify-between'>
          {/* Single View Details button */}
          <button
            className='text-sm text-amber-600 hover:text-amber-800 font-medium'
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/patterns/${pattern.id}`);
            }}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatternCard;
