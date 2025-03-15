// src/components/projects/ProjectTemplateList.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjectTemplates } from '../../context/ProjectTemplateContext';
import { ProjectType, SkillLevel } from '../../types/enums';
import { ProjectTemplate, TemplateFilter } from '../../types/projectTemplate';

interface ProjectTemplateListProps {
  onSelectTemplate?: (template: ProjectTemplate) => void;
  showActions?: boolean;
  initialFilters?: Partial<TemplateFilter>;
  title?: string;
}

const ProjectTemplateList: React.FC<ProjectTemplateListProps> = ({
  onSelectTemplate,
  showActions = true,
  initialFilters,
  title = 'Project Templates',
}) => {
  const { templates, loading, error, deleteTemplate, getFilteredTemplates } =
    useProjectTemplates();
  const [filter, setFilter] = useState<TemplateFilter>({
    searchText: '',
    projectType: undefined,
    skillLevel: undefined,
    tags: [],
    isPublic: undefined,
    ...initialFilters,
  });
  const [filteredTemplates, setFilteredTemplates] = useState<ProjectTemplate[]>(
    []
  );
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Apply filters whenever templates or filter changes
  useEffect(() => {
    if (templates.length > 0) {
      const filtered = getFilteredTemplates(filter);
      setFilteredTemplates(filtered);
    } else {
      setFilteredTemplates([]);
    }
  }, [templates, filter, getFilteredTemplates]);

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format project type for display
  const formatType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Handle filter text change
  const handleFilterTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter((prev: TemplateFilter) => ({
      ...prev,
      searchText: e.target.value,
    }));
  };

  // Handle project type filter change
  const handleProjectTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter((prev: TemplateFilter) => ({
      ...prev,
      projectType: e.target.value ? (e.target.value as ProjectType) : undefined,
    }));
  };

  // Handle skill level filter change
  const handleSkillLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter((prev: TemplateFilter) => ({
      ...prev,
      skillLevel: e.target.value ? (e.target.value as SkillLevel) : undefined,
    }));
  };

  // Handle tag selection
  const handleTagClick = (tag: string) => {
    setFilter((prev: TemplateFilter) => {
      const currentTags = prev.tags || [];

      if (currentTags.includes(tag)) {
        // Remove tag if already selected
        return {
          ...prev,
          tags: currentTags.filter((t: string) => t !== tag),
        };
      } else {
        // Add tag if not selected
        return {
          ...prev,
          tags: [...currentTags, tag],
        };
      }
    });
  };

  // Handle delete confirmation
  const handleDeleteClick = (templateId: string) => {
    setConfirmDelete(templateId);
  };

  // Handle template deletion
  const handleDeleteConfirm = async () => {
    if (confirmDelete) {
      try {
        await deleteTemplate(confirmDelete);
        setConfirmDelete(null);
      } catch (error) {
        console.error('Error deleting template:', error);
        // You could show an error message here
      }
    }
  };

  // Get all unique tags from templates
  const allTags = Array.from(
    new Set(templates.flatMap((template) => template.tags).filter(Boolean))
  ).sort();

  // Reset all filters
  const handleClearFilters = () => {
    setFilter({
      searchText: '',
      projectType: undefined,
      skillLevel: undefined,
      tags: [],
      isPublic: undefined,
    });
  };

  if (loading) {
    return (
      <div className='p-6 text-center'>
        <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600'></div>
        <p className='mt-2 text-sm text-gray-600'>Loading templates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-4 bg-red-50 text-red-700 rounded-lg'>
        <p className='font-medium'>Error loading templates</p>
        <p className='text-sm'>{error}</p>
        <button
          className='mt-2 px-3 py-1 bg-red-600 text-white rounded-md text-sm'
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className='bg-white shadow-sm rounded-lg border border-stone-200 overflow-hidden'>
      {/* Search and filter section */}
      <div className='border-b border-stone-200 p-4 space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-medium text-gray-900'>{title}</h2>

          {showActions && (
            <Link
              to='/templates/new'
              className='inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 mr-2'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              Create Template
            </Link>
          )}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Search input */}
          <div className='relative'>
            <input
              type='text'
              placeholder='Search templates...'
              className='w-full bg-stone-50 border border-stone-300 rounded-md py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              value={filter.searchText || ''}
              onChange={handleFilterTextChange}
            />
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 absolute left-3 top-2.5 text-stone-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>

          {/* Project type filter */}
          <div>
            <select
              className='w-full bg-stone-50 border border-stone-300 rounded-md py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              value={filter.projectType || ''}
              onChange={handleProjectTypeChange}
            >
              <option value=''>All Project Types</option>
              {Object.values(ProjectType).map((type) => (
                <option key={type} value={type}>
                  {formatType(type)}
                </option>
              ))}
            </select>
          </div>

          {/* Skill level filter */}
          <div>
            <select
              className='w-full bg-stone-50 border border-stone-300 rounded-md py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              value={filter.skillLevel || ''}
              onChange={handleSkillLevelChange}
            >
              <option value=''>All Skill Levels</option>
              {Object.values(SkillLevel).map((level) => (
                <option key={level} value={level}>
                  {formatType(level)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags filter */}
        {allTags.length > 0 && (
          <div className='mt-2'>
            <p className='text-xs font-medium text-stone-500 mb-2'>Tags</p>
            <div className='flex flex-wrap gap-2'>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition ${
                    filter.tags?.includes(tag)
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active filters and clear button */}
        {(filter.searchText ||
          filter.projectType ||
          filter.skillLevel ||
          (filter.tags && filter.tags.length > 0)) && (
          <div className='flex justify-between items-center pt-2'>
            <div className='text-xs text-stone-500'>
              <span className='font-medium'>Filters:</span>{' '}
              {filter.searchText && (
                <span className='mr-2'>Search: "{filter.searchText}"</span>
              )}
              {filter.projectType && (
                <span className='mr-2'>
                  Type: {formatType(filter.projectType)}
                </span>
              )}
              {filter.skillLevel && (
                <span className='mr-2'>
                  Skill: {formatType(filter.skillLevel)}
                </span>
              )}
              {filter.tags && filter.tags.length > 0 && (
                <span>Tags: {filter.tags.join(', ')}</span>
              )}
            </div>
            <button
              onClick={handleClearFilters}
              className='text-xs text-amber-600 hover:text-amber-800 font-medium'
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Template content */}
      {filteredTemplates.length === 0 ? (
        <div className='p-6 text-center'>
          <div className='bg-stone-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6 text-stone-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
              />
            </svg>
          </div>
          <h3 className='text-lg font-medium text-stone-700 mb-2'>
            No Templates Found
          </h3>
          <p className='text-stone-500 max-w-md mx-auto mb-4'>
            {filter.searchText ||
            filter.projectType ||
            filter.skillLevel ||
            (filter.tags && filter.tags.length > 0)
              ? 'No templates match your search criteria. Try different keywords or clear your filters.'
              : "You haven't created any templates yet. Templates help you start new projects faster."}
          </p>
          {showActions && (
            <Link
              to='/templates/new'
              className='text-amber-600 hover:text-amber-800 font-medium'
            >
              Create Your First Template
            </Link>
          )}
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-stone-200'>
            <thead className='bg-stone-50'>
              <tr>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Template Name
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Type
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Components
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Duration
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Last Updated
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
              {filteredTemplates.map((template) => (
                <tr key={template.id} className='hover:bg-stone-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='text-sm font-medium text-stone-900'>
                        {template.name}
                        {template.isPublic && (
                          <span className='ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800'>
                            Public
                          </span>
                        )}
                      </div>
                    </div>
                    {template.description && (
                      <div className='text-xs text-stone-500 mt-1 truncate max-w-xs'>
                        {template.description}
                      </div>
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-stone-500'>
                      {formatType(template.type)}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-stone-500'>
                      {template.components.length || 0}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-stone-500'>
                      {template.estimatedDuration}{' '}
                      {template.estimatedDuration === 1 ? 'day' : 'days'}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-stone-500'>
                      {formatDate(template.updatedAt)}
                    </div>
                    <div className='text-xs text-stone-400'>
                      v{template.version}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <div className='flex space-x-3'>
                      {onSelectTemplate && (
                        <button
                          onClick={() => onSelectTemplate(template)}
                          className='text-amber-600 hover:text-amber-900'
                        >
                          Select
                        </button>
                      )}

                      {showActions && (
                        <>
                          <Link
                            to={`/templates/${template.id}`}
                            className='text-amber-600 hover:text-amber-900'
                          >
                            View
                          </Link>
                          <Link
                            to={`/templates/${template.id}/edit`}
                            className='text-blue-600 hover:text-blue-900'
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(template.id)}
                            className='text-red-600 hover:text-red-900'
                          >
                            Delete
                          </button>
                          <Link
                            to={`/projects/new?template=${template.id}`}
                            className='text-green-600 hover:text-green-900'
                          >
                            Use
                          </Link>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {confirmDelete && (
        <div className='fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md mx-auto'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              Confirm Delete
            </h3>
            <p className='text-sm text-gray-500 mb-4'>
              Are you sure you want to delete this template? This action cannot
              be undone.
            </p>
            <div className='flex justify-end space-x-3'>
              <button
                onClick={() => setConfirmDelete(null)}
                className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium'
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTemplateList;
