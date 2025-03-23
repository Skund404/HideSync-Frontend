// src/components/patterns/detail/PatternMetadata.tsx
import React, { JSX, useState } from 'react';
import { EnumTypes } from '../../../types';
import { Pattern, PatternFileType } from '../../../types/patternTypes';
import { usePatterns } from '../../../hooks/usePatterns';
import { showSuccess, showError } from '../../../services/notification-service';
import { handleApiError } from '../../../services/error-handler';

interface PatternMetadataProps {
  pattern: Pattern;
  onPatternUpdated?: (updatedPattern: Pattern) => void;
  readOnly?: boolean;
}

const PatternMetadata: React.FC<PatternMetadataProps> = ({ 
  pattern,
  onPatternUpdated,
  readOnly = false
}) => {
  const { updatePattern } = usePatterns();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Pattern>>({
    name: pattern.name,
    description: pattern.description,
    skillLevel: pattern.skillLevel,
    projectType: pattern.projectType,
    tags: [...pattern.tags],
    estimatedTime: pattern.estimatedTime,
    estimatedDifficulty: pattern.estimatedDifficulty,
    authorName: pattern.authorName,
    version: pattern.version,
    isPublic: pattern.isPublic
  });
  const [tagInput, setTagInput] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
      case EnumTypes.SkillLevel.ABSOLUTE_BEGINNER:
      case EnumTypes.SkillLevel.NOVICE:
        return 'bg-green-100 text-green-800';
      case EnumTypes.SkillLevel.INTERMEDIATE:
      case EnumTypes.SkillLevel.APPRENTICE:
        return 'bg-amber-100 text-amber-800';
      case EnumTypes.SkillLevel.ADVANCED:
      case EnumTypes.SkillLevel.JOURNEYMAN:
        return 'bg-red-100 text-red-800';
      case EnumTypes.SkillLevel.EXPERT:
      case EnumTypes.SkillLevel.MASTER:
      case EnumTypes.SkillLevel.MASTER_CRAFTSMAN:
      case EnumTypes.SkillLevel.PROFESSIONAL:
      case EnumTypes.SkillLevel.SPECIALIST:
      case EnumTypes.SkillLevel.ARTISAN:
      case EnumTypes.SkillLevel.INSTRUCTOR:
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

  // Validate form data
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.description?.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.authorName?.trim()) {
      errors.authorName = 'Author name is required';
    }
    
    if (formData.estimatedDifficulty && (formData.estimatedDifficulty < 1 || formData.estimatedDifficulty > 10)) {
      errors.estimatedDifficulty = 'Difficulty must be between 1 and 10';
    }
    
    if (formData.estimatedTime && formData.estimatedTime < 0) {
      errors.estimatedTime = 'Time must be positive';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (name === 'estimatedTime' || name === 'estimatedDifficulty') {
      const numberValue = value ? parseFloat(value) : undefined;
      setFormData((prev) => ({
        ...prev,
        [name]: numberValue,
      }));
    } else if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleCancel = () => {
    // Reset form data to original pattern
    setFormData({
      name: pattern.name,
      description: pattern.description,
      skillLevel: pattern.skillLevel,
      projectType: pattern.projectType,
      tags: [...pattern.tags],
      estimatedTime: pattern.estimatedTime,
      estimatedDifficulty: pattern.estimatedDifficulty,
      authorName: pattern.authorName,
      version: pattern.version,
      isPublic: pattern.isPublic
    });
    setFormErrors({});
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Create optimistic update
      const updatedData = {
        ...formData,
        modifiedAt: new Date() // Update the modification date
      };
      
      // Apply optimistic update locally first if callback provided
      if (onPatternUpdated) {
        const optimisticPattern = {
          ...pattern,
          ...updatedData
        } as Pattern;
        onPatternUpdated(optimisticPattern);
      }
      
      // Send the update to the API using the hook
      const updatedPattern = await updatePattern(pattern.id, updatedData);
      
      // Show success message
      showSuccess('Pattern updated successfully');
      
      // If a callback was provided, call it with the real updated pattern
      if (onPatternUpdated) {
        onPatternUpdated(updatedPattern);
      }
      
      // Exit edit mode
      setIsEditing(false);
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to update pattern');
      showError(`Update error: ${errorMessage}`);
      
      // Revert optimistic update by reapplying original pattern data
      if (onPatternUpdated) {
        onPatternUpdated(pattern);
      }
    } finally {
      setIsLoading(false);
    }
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
            onClick={handleCancel}
            className='text-stone-500 hover:text-stone-700'
            disabled={isLoading}
            aria-label="Cancel"
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

        <form className='space-y-4' onSubmit={handleSubmit} noValidate>
          <div>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-stone-700 mb-1'
            >
              Pattern Name <span className="text-red-500">*</span>
            </label>
            <input
              type='text'
              id='name'
              name='name'
              value={formData.name || ''}
              onChange={handleInputChange}
              className={`w-full border ${formErrors.name ? 'border-red-500' : 'border-stone-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
              required
              disabled={isLoading}
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor='description'
              className='block text-sm font-medium text-stone-700 mb-1'
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id='description'
              name='description'
              rows={3}
              value={formData.description || ''}
              onChange={handleInputChange}
              className={`w-full border ${formErrors.description ? 'border-red-500' : 'border-stone-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
              required
              disabled={isLoading}
            />
            {formErrors.description && (
              <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
            )}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='authorName'
                className='block text-sm font-medium text-stone-700 mb-1'
              >
                Author Name <span className="text-red-500">*</span>
              </label>
              <input
                type='text'
                id='authorName'
                name='authorName'
                value={formData.authorName || ''}
                onChange={handleInputChange}
                className={`w-full border ${formErrors.authorName ? 'border-red-500' : 'border-stone-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                required
                disabled={isLoading}
              />
              {formErrors.authorName && (
                <p className="mt-1 text-sm text-red-500">{formErrors.authorName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor='version'
                className='block text-sm font-medium text-stone-700 mb-1'
              >
                Version
              </label>
              <input
                type='text'
                id='version'
                name='version'
                value={formData.version || ''}
                onChange={handleInputChange}
                className='w-full border border-stone-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                disabled={isLoading}
              />
            </div>
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
                name='skillLevel'
                value={formData.skillLevel?.toString() || ''}
                onChange={handleInputChange}
                className='w-full border border-stone-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                disabled={isLoading}
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
                name='projectType'
                value={formData.projectType?.toString() || ''}
                onChange={handleInputChange}
                className='w-full border border-stone-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                disabled={isLoading}
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
              Tags
            </label>
            <div className='flex gap-2 mb-2'>
              <input
                type='text'
                id='tags'
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                className='flex-1 border border-stone-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                placeholder='Add a tag'
                disabled={isLoading}
              />
              <button
                type='button'
                onClick={handleAddTag}
                className='px-3 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500'
                disabled={isLoading || !tagInput.trim()}
              >
                Add
              </button>
            </div>
            <div className='flex flex-wrap gap-2'>
              {formData.tags?.map((tag, index) => (
                <div
                  key={index}
                  className='inline-flex items-center bg-stone-100 rounded-md px-3 py-1 text-sm text-stone-700'
                >
                  <span>{tag}</span>
                  <button
                    type='button'
                    onClick={() => handleRemoveTag(tag)}
                    className='ml-2 text-stone-500 hover:text-stone-700'
                    disabled={isLoading}
                    aria-label={`Remove tag ${tag}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {(!formData.tags || formData.tags.length === 0) && (
                <p className='text-sm text-stone-500'>No tags added</p>
              )}
            </div>
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
                name='estimatedTime'
                value={formData.estimatedTime || ''}
                onChange={handleInputChange}
                min='0'
                step='0.5'
                className={`w-full border ${formErrors.estimatedTime ? 'border-red-500' : 'border-stone-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                disabled={isLoading}
              />
              {formErrors.estimatedTime && (
                <p className="mt-1 text-sm text-red-500">{formErrors.estimatedTime}</p>
              )}
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
                name='estimatedDifficulty'
                value={formData.estimatedDifficulty || ''}
                onChange={handleInputChange}
                min='1'
                max='10'
                className={`w-full border ${formErrors.estimatedDifficulty ? 'border-red-500' : 'border-stone-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                disabled={isLoading}
              />
              {formErrors.estimatedDifficulty && (
                <p className="mt-1 text-sm text-red-500">{formErrors.estimatedDifficulty}</p>
              )}
            </div>
          </div>

          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={formData.isPublic ?? true}
              onChange={handleInputChange}
              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-stone-700">
              Make this pattern public
            </label>
          </div>

          <div className='pt-2 flex justify-end space-x-2'>
            <button
              type='button'
              onClick={handleCancel}
              className='px-4 py-2 border border-stone-300 rounded-md shadow-sm text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 flex items-center'
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-lg font-medium text-stone-900'>Pattern Details</h2>
        {!readOnly && (
          <button
            onClick={() => setIsEditing(true)}
            className='text-amber-600 hover:text-amber-800 text-sm font-medium flex items-center'
            aria-label="Edit pattern details"
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
        )}
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
            <p className='text-stone-700 whitespace-pre-line'>{pattern.description}</p>
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
                          aria-hidden="true"
                        />
                      ))}
                  </div>
                  <span className="sr-only">{pattern.estimatedDifficulty} out of 10</span>
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
              {pattern.tags.length === 0 && (
                <span className='text-stone-500 text-sm'>No tags</span>
              )}
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