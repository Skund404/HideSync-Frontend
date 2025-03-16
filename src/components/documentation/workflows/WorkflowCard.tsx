// src/components/documentation/workflows/WorkflowCard.tsx

import { BarChart3, Clock, FileText, Users, Video } from 'lucide-react';
import React from 'react';
import {
  DocumentationResource,
  SkillLevel,
} from '../../../types/documentationTypes';

interface WorkflowCardProps {
  workflow: DocumentationResource;
  onClick: () => void;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({ workflow, onClick }) => {
  // Format estimated time (if available in the description or content)
  const getEstimatedTime = () => {
    // Look for patterns like "Estimated time: 30 minutes" or "Time: 1 hour"
    const timeRegex =
      /(?:estimated\s*time|time):\s*(\d+)\s*(minutes|minute|mins|min|hours|hour|hrs|hr)/i;
    const match =
      timeRegex.exec(workflow.description) || timeRegex.exec(workflow.content);

    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();

      if (unit.startsWith('hour')) {
        return `${value} hour${value !== 1 ? 's' : ''}`;
      } else {
        return `${value} min${value !== 1 ? 's' : ''}`;
      }
    }

    return null;
  };

  // Get difficulty level badge styling
  const getDifficultyBadge = () => {
    switch (workflow.skillLevel) {
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

  // Check if workflow has videos
  const hasVideos = workflow.videos && workflow.videos.length > 0;

  // Extract the number of steps (if mentioned in content)
  const getStepCount = () => {
    const stepsRegex = /(\d+)\s*steps?/i;
    const match =
      stepsRegex.exec(workflow.description) ||
      stepsRegex.exec(workflow.content);

    return match ? parseInt(match[1]) : null;
  };

  const estimatedTime = getEstimatedTime();
  const stepCount = getStepCount();
  const difficultyBadge = getDifficultyBadge();

  return (
    <div
      className='bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer'
      onClick={onClick}
    >
      <div className='p-4'>
        <h3 className='font-medium text-gray-900 mb-2'>{workflow.title}</h3>
        <p className='text-sm text-gray-600 mb-4 line-clamp-2'>
          {workflow.description}
        </p>

        <div className='flex flex-wrap gap-2 mb-3'>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${difficultyBadge.bgColor} ${difficultyBadge.textColor}`}
          >
            <Users size={12} className='mr-1' />
            {difficultyBadge.label}
          </span>

          {estimatedTime && (
            <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800'>
              <Clock size={12} className='mr-1' />
              {estimatedTime}
            </span>
          )}

          {stepCount && (
            <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800'>
              <BarChart3 size={12} className='mr-1' />
              {stepCount} steps
            </span>
          )}

          {hasVideos && (
            <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-800'>
              <Video size={12} className='mr-1' />
              Includes video
            </span>
          )}
        </div>

        <div className='text-amber-600 text-sm font-medium flex items-center'>
          <FileText size={14} className='mr-1' />
          View workflow
        </div>
      </div>
    </div>
  );
};

export default WorkflowCard;
