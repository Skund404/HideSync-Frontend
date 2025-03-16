import React from 'react';
import {
  DocumentationCategory,
  SkillLevel,
} from '../../../types/documentationTypes';

interface VideoFilterProps {
  categories: DocumentationCategory[];
  skillLevels: SkillLevel[];
  activeCategory: string;
  activeSkillLevel: string;
  onCategoryChange: (category: string) => void;
  onSkillLevelChange: (level: string) => void;
}

const VideoFilter: React.FC<VideoFilterProps> = ({
  categories,
  skillLevels,
  activeCategory,
  activeSkillLevel,
  onCategoryChange,
  onSkillLevelChange,
}) => {
  return (
    <div className='mb-6 bg-white p-4 rounded-lg shadow-sm'>
      <h3 className='font-medium mb-3'>Filter Videos</h3>

      <div className='space-y-4'>
        <div>
          <h4 className='text-sm font-medium text-gray-500 mb-2'>Categories</h4>
          <div className='flex flex-wrap gap-2'>
            <button
              onClick={() => onCategoryChange('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                activeCategory === 'all'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              All
            </button>

            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeCategory === category
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className='text-sm font-medium text-gray-500 mb-2'>
            Skill Level
          </h4>
          <div className='flex flex-wrap gap-2'>
            <button
              onClick={() => onSkillLevelChange('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                activeSkillLevel === 'all'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              All Levels
            </button>

            {skillLevels.map((level) => (
              <button
                key={level}
                onClick={() => onSkillLevelChange(level)}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeSkillLevel === level
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoFilter;
