// src/components/documentation/workflows/WorkflowProgress.tsx

import { ArrowRight, Calendar, Check, CheckCircle, Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface WorkflowStep {
  id: string;
  title: string;
  estimatedTime?: number; // minutes
}

interface WorkflowProgressProps {
  workflowId: string;
  steps: WorkflowStep[];
  currentStepIndex?: number;
  onStepSelect?: (index: number) => void;
  showTimeRemaining?: boolean;
}

const WorkflowProgress: React.FC<WorkflowProgressProps> = ({
  workflowId,
  steps,
  currentStepIndex = 0,
  onStepSelect,
  showTimeRemaining = true,
}) => {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [lastAccessTime, setLastAccessTime] = useState<string | null>(null);

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const progressKey = `hidesync_workflow_progress_${workflowId}`;
      const savedProgress = localStorage.getItem(progressKey);

      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setCompletedSteps(progress.completedSteps || []);

        if (progress.lastAccessTime) {
          setLastAccessTime(progress.lastAccessTime);
        }
      }
    } catch (error) {
      console.error('Error loading workflow progress:', error);
    }
  }, [workflowId]);

  // Save progress to localStorage when completedSteps changes
  useEffect(() => {
    try {
      const now = new Date().toISOString();
      const progressKey = `hidesync_workflow_progress_${workflowId}`;
      localStorage.setItem(
        progressKey,
        JSON.stringify({
          completedSteps,
          lastAccessTime: now,
        })
      );
      setLastAccessTime(now);
    } catch (error) {
      console.error('Error saving workflow progress:', error);
    }
  }, [completedSteps, workflowId]);

  // Toggle step completion
  const toggleStepCompletion = (stepId: string) => {
    setCompletedSteps((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId]
    );
  };

  // Calculate remaining time based on incomplete steps
  const calculateRemainingTime = () => {
    let remainingMinutes = 0;

    steps.forEach((step, index) => {
      if (
        !completedSteps.includes(step.id) &&
        index >= currentStepIndex &&
        step.estimatedTime
      ) {
        remainingMinutes += step.estimatedTime;
      }
    });

    if (remainingMinutes < 60) {
      return `${remainingMinutes} min${remainingMinutes !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(remainingMinutes / 60);
      const mins = remainingMinutes % 60;

      if (mins === 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
      }

      return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} min${
        mins !== 1 ? 's' : ''
      }`;
    }
  };

  // Format last access date
  const formatLastAccess = () => {
    if (!lastAccessTime) return null;

    try {
      const lastAccess = new Date(lastAccessTime);
      const now = new Date();
      const diffMs = now.getTime() - lastAccess.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return lastAccess.toLocaleDateString();
      }
    } catch (error) {
      return null;
    }
  };

  // Calculate overall progress percentage
  const progressPercentage =
    steps.length > 0 ? (completedSteps.length / steps.length) * 100 : 0;

  return (
    <div className='bg-white rounded-lg shadow-sm border overflow-hidden'>
      <div className='p-4 border-b bg-gray-50'>
        <div className='flex justify-between items-center mb-2'>
          <h3 className='font-medium'>Workflow Progress</h3>
          <span className='text-sm text-gray-600'>
            {completedSteps.length} of {steps.length} steps complete
          </span>
        </div>

        <div className='w-full bg-gray-200 rounded-full h-2.5'>
          <div
            className='bg-amber-600 h-2.5 rounded-full'
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {showTimeRemaining && (
          <div className='mt-2 flex items-center justify-between text-xs text-gray-500'>
            <div className='flex items-center'>
              <Clock size={14} className='mr-1' />
              Remaining: {calculateRemainingTime()}
            </div>

            {lastAccessTime && (
              <div className='flex items-center'>
                <Calendar size={14} className='mr-1' />
                Last accessed: {formatLastAccess()}
              </div>
            )}
          </div>
        )}
      </div>

      <ul className='divide-y'>
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStepIndex === index;

          return (
            <li key={step.id} className={`${isCurrent ? 'bg-amber-50' : ''}`}>
              <div className='flex items-center p-3'>
                <button
                  onClick={() => toggleStepCompletion(step.id)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center border mr-3 ${
                    isCompleted
                      ? 'bg-green-100 border-green-500 text-green-500'
                      : 'border-gray-300 text-transparent hover:border-gray-400'
                  }`}
                  aria-label={
                    isCompleted ? 'Mark as incomplete' : 'Mark as complete'
                  }
                >
                  <Check
                    size={14}
                    className={isCompleted ? 'opacity-100' : 'opacity-0'}
                  />
                </button>

                <div className='flex-1'>
                  <button
                    onClick={() => onStepSelect && onStepSelect(index)}
                    className={`text-left hover:text-amber-700 ${
                      isCurrent ? 'font-medium text-amber-800' : ''
                    } ${isCompleted ? 'line-through text-gray-500' : ''}`}
                  >
                    {step.title}
                  </button>

                  {step.estimatedTime && (
                    <span className='text-xs text-gray-500 ml-2'>
                      {step.estimatedTime} min
                    </span>
                  )}
                </div>

                {onStepSelect && (
                  <button
                    onClick={() => onStepSelect(index)}
                    className='text-amber-600 hover:text-amber-800'
                  >
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {progressPercentage === 100 && (
        <div className='p-3 bg-green-50 text-green-700 font-medium flex items-center justify-center'>
          <CheckCircle size={18} className='mr-2' />
          Workflow Completed!
        </div>
      )}
    </div>
  );
};

export default WorkflowProgress;
