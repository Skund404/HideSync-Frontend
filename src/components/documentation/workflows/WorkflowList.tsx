// src/components/documentation/workflows/WorkflowList.tsx

import { FileBarChart2, Grid, List } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentation } from '../../../context/DocumentationContext';
import { ResourceType } from '../../../types/documentationTypes';
import WorkflowCard from './WorkflowCard';
import WorkflowFilter from './WorkflowFilter';

// Transform category enum values to display names
const getCategoryDisplayName = (category: string): string => {
  return category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const WorkflowList: React.FC = () => {
  const { resources, loading, error } = useDocumentation();
  const navigate = useNavigate();

  // Filter state
  const [filters, setFilters] = useState({
    category: '',
    skillLevel: '',
    duration: '',
    hasVideo: false,
  });

  // View mode state (grid or list)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get all available categories for filter dropdown
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();

    resources
      .filter((resource) => resource.type === ResourceType.WORKFLOW)
      .forEach((workflow) => {
        uniqueCategories.add(workflow.category);
      });

    return Array.from(uniqueCategories).map((category) => ({
      id: category,
      name: getCategoryDisplayName(category),
    }));
  }, [resources]);

  // Filter workflows based on current filters
  const filteredWorkflows = useMemo(() => {
    return resources
      .filter((resource) => resource.type === ResourceType.WORKFLOW)
      .filter((workflow) => {
        // Apply category filter
        if (filters.category && workflow.category !== filters.category) {
          return false;
        }

        // Apply skill level filter
        if (filters.skillLevel && workflow.skillLevel !== filters.skillLevel) {
          return false;
        }

        // Apply video filter
        if (
          filters.hasVideo &&
          (!workflow.videos || workflow.videos.length === 0)
        ) {
          return false;
        }

        // Apply duration filter (approximate based on content description)
        if (filters.duration) {
          const estimatedTimeRegex =
            /(?:estimated\s*time|time):\s*(\d+)\s*(minutes|minute|mins|min|hours|hour|hrs|hr)/i;
          const match =
            estimatedTimeRegex.exec(workflow.description) ||
            estimatedTimeRegex.exec(workflow.content);

          if (match) {
            const value = parseInt(match[1]);
            const unit = match[2].toLowerCase();
            const minutes = unit.startsWith('hour') ? value * 60 : value;

            switch (filters.duration) {
              case 'short':
                return minutes < 30;
              case 'medium':
                return minutes >= 30 && minutes <= 60;
              case 'long':
                return minutes > 60;
              default:
                return true;
            }
          }
        }

        return true;
      });
  }, [resources, filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      category: '',
      skillLevel: '',
      duration: '',
      hasVideo: false,
    });
  };

  // Navigate to workflow detail
  const handleWorkflowClick = (workflowId: string) => {
    navigate(`/documentation/${workflowId}`);
  };

  if (loading) {
    return <div className='text-center p-4'>Loading workflows...</div>;
  }

  if (error) {
    return <div className='text-red-600 p-4'>Error loading workflows</div>;
  }

  const workflowCount = resources.filter(
    (resource) => resource.type === ResourceType.WORKFLOW
  ).length;

  return (
    <div className='workflows-list'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-medium flex items-center'>
          <FileBarChart2 size={24} className='mr-2' />
          Workflow Documentation
          <span className='ml-2 text-gray-500 text-base'>
            ({workflowCount} {workflowCount === 1 ? 'workflow' : 'workflows'})
          </span>
        </h2>

        <div className='flex space-x-2'>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${
              viewMode === 'grid'
                ? 'bg-amber-100 text-amber-800'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            title='Grid view'
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${
              viewMode === 'list'
                ? 'bg-amber-100 text-amber-800'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            title='List view'
          >
            <List size={18} />
          </button>
        </div>
      </div>

      <WorkflowFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        categories={categories}
        onReset={resetFilters}
      />

      {filteredWorkflows.length === 0 ? (
        <div className='text-center p-8 bg-gray-50 rounded-lg'>
          <p className='text-gray-600 mb-2'>
            No workflows match your selected filters.
          </p>
          <button
            onClick={resetFilters}
            className='text-amber-600 hover:text-amber-800 font-medium'
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {filteredWorkflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onClick={() => handleWorkflowClick(workflow.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkflowList;
