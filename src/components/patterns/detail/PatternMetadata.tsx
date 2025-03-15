// src/components/patterns/detail/PatternMetadata.tsx
import React, { JSX, useState } from 'react';
import { EnumTypes } from '../../../types';
import { Pattern, PatternFileType } from '../../../types/patternTypes';

interface PatternMetadataProps {
  pattern: Pattern;
}

const PatternMetadata: React.FC<PatternMetadataProps> = ({ pattern }) => {
  const [isEditing, setIsEditing] = useState(false);

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

  // Get file type icon and color
  const getFileTypeInfo = (
    fileType: PatternFileType
  ): { icon: JSX.Element; color: string } => {
    switch (fileType) {
      case PatternFileType.SVG:
        return {
          icon: (
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
                d='M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01'
              />
            </svg>
          ),
          color: 'text-blue-600',
        };
      case PatternFileType.PDF:
        return {
          icon: (
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
                d='M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z'
              />
            </svg>
          ),
          color: 'text-red-600',
        };
      case PatternFileType.IMAGE:
        return {
          icon: (
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
                d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
          ),
          color: 'text-green-600',
        };
      default:
        return {
          icon: (
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
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
          ),
          color: 'text-stone-600',
        };
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const { icon, color } = getFileTypeInfo(pattern.fileType);

  if (isEditing) {
    return (
      <div className='p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-medium text-stone-900'>
            Edit Pattern Details
          </h2>
          <button
            onClick={() => setIsEditing(false)}
            className='text-stone-500 hover:text-stone-700'
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
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        <form className='space-y-4'>
          <div>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-stone-700 mb-1'
            >
              Pattern Name
            </label>
            <input
              type='text'
              id='name'
              defaultValue={pattern.name}
              className='w-full border border-stone-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
            />
          </div>

          <div>
            <label
              htmlFor='description'
              className='block text-sm font-medium text-stone-700 mb-1'
            >
              Description
            </label>
            <textarea
              id='description'
              rows={3}
              defaultValue={pattern.description}
              className='w-full border border-stone-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='skillLevel'
                className='block text-sm font-medium text-stone-700 mb-1'
              >
                Skill Level
              </label>
              <select
                id='skillLevel'
                defaultValue={pattern.skillLevel.toString()}
                className='w-full border border-stone-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              >
                {Object.values(EnumTypes.SkillLevel).map((level) => (
                  <option key={level} value={level}>
                    {getSkillLevelDisplay(level as EnumTypes.SkillLevel)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor='projectType'
                className='block text-sm font-medium text-stone-700 mb-1'
              >
                Project Type
              </label>
              <select
                id='projectType'
                defaultValue={pattern.projectType.toString()}
                className='w-full border border-stone-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              >
                {Object.values(EnumTypes.ProjectType).map((type) => (
                  <option key={type} value={type}>
                    {type
                      .toString()
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor='tags'
              className='block text-sm font-medium text-stone-700 mb-1'
            >
              Tags (comma separated)
            </label>
            <input
              type='text'
              id='tags'
              defaultValue={pattern.tags.join(', ')}
              className='w-full border border-stone-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='estimatedTime'
                className='block text-sm font-medium text-stone-700 mb-1'
              >
                Estimated Time (hours)
              </label>
              <input
                type='number'
                id='estimatedTime'
                defaultValue={pattern.estimatedTime || ''}
                min='0'
                step='0.5'
                className='w-full border border-stone-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              />
            </div>

            <div>
              <label
                htmlFor='estimatedDifficulty'
                className='block text-sm font-medium text-stone-700 mb-1'
              >
                Difficulty (1-10)
              </label>
              <input
                type='number'
                id='estimatedDifficulty'
                defaultValue={pattern.estimatedDifficulty || ''}
                min='1'
                max='10'
                className='w-full border border-stone-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              />
            </div>
          </div>

          <div className='pt-2'>
            <div className='flex justify-end space-x-2'>
              <button
                type='button'
                onClick={() => setIsEditing(false)}
                className='px-4 py-2 border border-stone-300 rounded-md shadow-sm text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
              >
                Cancel
              </button>
              <button
                type='submit'
                className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-lg font-medium text-stone-900'>Pattern Details</h2>
        <button
          onClick={() => setIsEditing(true)}
          className='text-amber-600 hover:text-amber-800 text-sm font-medium flex items-center'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-4 w-4 mr-1'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
            />
          </svg>
          Edit
        </button>
      </div>

      <div className='space-y-6'>
        {/* File Info */}
        <div className='p-4 bg-stone-50 rounded-lg'>
          <div className='flex items-center'>
            <div className={`mr-2 ${color}`}>{icon}</div>
            <div>
              <h3 className='font-medium text-stone-900'>
                {pattern.fileType} Pattern
              </h3>
              <p className='text-sm text-stone-500'>
                Version {pattern.version}
              </p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div>
          <div className='mb-4'>
            <h3 className='text-sm font-medium text-stone-500 uppercase tracking-wider mb-2'>
              Description
            </h3>
            <p className='text-stone-700'>{pattern.description}</p>
          </div>

          <div className='mb-4'>
            <h3 className='text-sm font-medium text-stone-500 uppercase tracking-wider mb-2'>
              Skills & Difficulty
            </h3>
            <div className='flex items-center justify-between'>
              <span
                className={`px-2 py-1 rounded-md text-xs font-medium ${getSkillLevelColor(
                  pattern.skillLevel
                )}`}
              >
                {getSkillLevelDisplay(pattern.skillLevel)}
              </span>

              {pattern.estimatedDifficulty && (
                <div className='text-sm flex items-center'>
                  <span className='text-stone-500 mr-1'>Difficulty:</span>
                  <div className='flex items-center'>
                    {Array(10)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-4 mx-px rounded-sm ${
                            i < pattern.estimatedDifficulty!
                              ? 'bg-amber-500'
                              : 'bg-stone-200'
                          }`}
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className='mb-4'>
            <h3 className='text-sm font-medium text-stone-500 uppercase tracking-wider mb-2'>
              Tags
            </h3>
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

          <div className='mb-4'>
            <h3 className='text-sm font-medium text-stone-500 uppercase tracking-wider mb-2'>
              Project Information
            </h3>
            <div className='grid grid-cols-2 gap-2'>
              <div>
                <span className='text-stone-500 text-sm'>Type:</span>
                <span className='text-stone-700 text-sm ml-1'>
                  {pattern.projectType
                    .toString()
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </div>

              {pattern.estimatedTime && (
                <div>
                  <span className='text-stone-500 text-sm'>Est. Time:</span>
                  <span className='text-stone-700 text-sm ml-1'>
                    {pattern.estimatedTime}{' '}
                    {pattern.estimatedTime === 1 ? 'hour' : 'hours'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className='text-sm font-medium text-stone-500 uppercase tracking-wider mb-2'>
              Timeline
            </h3>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div>
                <span className='text-stone-500'>Created:</span>
                <span className='text-stone-700 ml-1'>
                  {formatDate(pattern.createdAt)}
                </span>
              </div>
              <div>
                <span className='text-stone-500'>Modified:</span>
                <span className='text-stone-700 ml-1'>
                  {formatDate(pattern.modifiedAt)}
                </span>
              </div>
              <div>
                <span className='text-stone-500'>Author:</span>
                <span className='text-stone-700 ml-1'>
                  {pattern.authorName}
                </span>
              </div>
              <div>
                <span className='text-stone-500'>Status:</span>
                <span className='text-stone-700 ml-1'>
                  {pattern.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatternMetadata;
