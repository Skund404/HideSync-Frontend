// src/components/patterns/PatternList.tsx
// Update to include navigation to detail view

import React from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import { usePatternContext } from '../../context/PatternContext';
import { EnumTypes } from '../../types';
import { Pattern, PatternFileType } from '../../types/patternTypes';

interface PatternListProps {
  patterns: Pattern[];
  onPatternClick?: (pattern: Pattern) => void;
}

const PatternList: React.FC<PatternListProps> = ({
  patterns,
  onPatternClick,
}) => {
  const { toggleFavorite } = usePatternContext();
  const navigate = useNavigate(); // Add this hook

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

  // Format date
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (e: React.MouseEvent, patternId: number) => {
    e.stopPropagation();
    toggleFavorite(patternId);
  };

  // Handle row click
  const handleRowClick = (pattern: Pattern) => {
    if (onPatternClick) {
      onPatternClick(pattern);
    } else {
      // Navigate to pattern detail
      navigate(`/patterns/${pattern.id}`);
    }
  };

  if (patterns.length === 0) {
    return (
      <div className='bg-white shadow-sm rounded-lg p-6 border border-stone-200 text-center'>
        <div className='flex flex-col items-center justify-center py-12'>
          <div className='bg-amber-100 p-4 rounded-full mb-4'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-10 w-10 text-amber-600'
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
          </div>
          <h3 className='text-lg font-medium text-stone-700 mb-2'>
            No Patterns Found
          </h3>
          <p className='text-stone-500 max-w-md mb-6'>
            Try adjusting your filters or create a new pattern.
          </p>
          <button className='bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 mr-2'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 6v6m0 0v6m0-6h6m-6 0H6'
              />
            </svg>
            Create New Pattern
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white shadow-sm rounded-lg border border-stone-200 overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-stone-200'>
          <thead className='bg-stone-50'>
            <tr>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
              >
                Pattern
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
              >
                Skill Level
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
              >
                Tags
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
              >
                Last Modified
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
              >
                File Type
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-stone-200'>
            {patterns.map((pattern) => (
              <tr
                key={pattern.id}
                className='hover:bg-stone-50 cursor-pointer'
                onClick={() => handleRowClick(pattern)}
              >
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center'>
                    <div className='h-10 w-10 flex-shrink-0'>
                      <img
                        className='h-10 w-10 rounded-md object-cover'
                        src={pattern.thumbnail}
                        alt=''
                      />
                    </div>
                    <div className='ml-4'>
                      <div className='text-sm font-medium text-stone-900'>
                        {pattern.name}
                      </div>
                      <div className='text-xs text-stone-500 truncate max-w-xs'>
                        {pattern.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getSkillLevelColor(
                      pattern.skillLevel
                    )}`}
                  >
                    {getSkillLevelDisplay(pattern.skillLevel)}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex flex-wrap gap-1 max-w-xs'>
                    {pattern.tags.map((tag, index) => (
                      <span
                        key={index}
                        className='px-2 py-0.5 bg-stone-100 rounded-md text-xs text-stone-700'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-stone-900'>
                    {formatDate(pattern.modifiedAt)}
                  </div>
                  <div className='text-xs text-stone-500'>
                    by {pattern.authorName}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center'>
                    {pattern.fileType === PatternFileType.SVG && (
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5 mr-1 text-blue-600'
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
                    )}
                    {pattern.fileType === PatternFileType.PDF && (
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5 mr-1 text-red-600'
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
                    )}
                    {pattern.fileType === PatternFileType.IMAGE && (
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5 mr-1 text-green-600'
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
                    )}
                    <span className='text-sm text-stone-700'>
                      {pattern.fileType}
                    </span>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-stone-500'>
                  <div className='flex space-x-2'>
                    <button
                      className='text-amber-600 hover:text-amber-900'
                      aria-label='View pattern details'
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/patterns/${pattern.id}`);
                      }}
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                        />
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                        />
                      </svg>
                    </button>
                    <button
                      className='text-stone-600 hover:text-stone-900'
                      aria-label='Download pattern'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                        />
                      </svg>
                    </button>
                    <button
                      className={`${
                        pattern.isFavorite ? 'text-amber-500' : 'text-stone-600'
                      } hover:text-amber-600`}
                      aria-label={
                        pattern.isFavorite
                          ? 'Remove from favorites'
                          : 'Add to favorites'
                      }
                      onClick={(e) => handleFavoriteToggle(e, pattern.id)}
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
                    <button
                      className='text-stone-600 hover:text-stone-900'
                      aria-label='More options'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z'
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatternList;
