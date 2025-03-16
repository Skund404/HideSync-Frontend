// src/components/documentation/workflows/StepByStepGuide.tsx

import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ContentRenderer from '../ContentRenderer';
import VideoEmbed from '../VideoEmbed';

export interface WorkflowStep {
  id: string;
  title: string;
  content: string;
  image?: string;
  video?: {
    videoId: string;
    title: string;
    description?: string;
  };
  estimatedTime?: number; // In minutes
  dependencies?: string[]; // IDs of steps that must be completed first
  warning?: string; // Optional warning message
  tools?: string[]; // Optional list of required tools
  materials?: string[]; // Optional list of required materials
}

interface StepByStepGuideProps {
  title: string;
  description: string;
  steps: WorkflowStep[];
  onComplete?: () => void;
}

const StepByStepGuide: React.FC<StepByStepGuideProps> = ({
  title,
  description,
  steps,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);

  // Calculate total estimated time
  const totalTime = steps.reduce(
    (total, step) => total + (step.estimatedTime || 0),
    0
  );

  // Calculate progress percentage when steps are completed
  useEffect(() => {
    const progressPercent =
      steps.length > 0 ? (completedSteps.length / steps.length) * 100 : 0;
    setProgress(progressPercent);
  }, [completedSteps.length, steps.length]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      window.scrollTo(0, 0); // Scroll to top when navigating to next step
    } else if (onComplete) {
      // Last step completed
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      window.scrollTo(0, 0); // Scroll to top when navigating to previous step
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStepIndex(index);
    window.scrollTo(0, 0); // Scroll to top when clicking on a step
  };

  const toggleStepCompletion = (stepId: string) => {
    setCompletedSteps((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId]
    );
  };

  const isStepAccessible = (stepIndex: number) => {
    // First step is always accessible
    if (stepIndex === 0) return true;

    const step = steps[stepIndex];

    // If the step has dependencies, check if they're completed
    if (step.dependencies && step.dependencies.length > 0) {
      return step.dependencies.every((depId) => completedSteps.includes(depId));
    }

    // Otherwise, check if the previous step is completed
    const prevStepId = steps[stepIndex - 1].id;
    return completedSteps.includes(prevStepId);
  };

  const currentStep = steps[currentStepIndex];

  // Format minutes into a readable time string
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min${minutes !== 1 ? 's' : ''}`;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (mins === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }

    return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} min${
      mins !== 1 ? 's' : ''
    }`;
  };

  return (
    <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
      <div className='p-6 border-b'>
        <h2 className='text-xl font-medium mb-2'>{title}</h2>
        <p className='text-gray-600'>{description}</p>

        <div className='mt-4 flex items-center justify-between'>
          <div className='flex items-center'>
            <Clock size={18} className='text-gray-500 mr-2' />
            <span className='text-gray-600'>
              Estimated time: {formatTime(totalTime)}
            </span>
          </div>

          <div>
            <div className='w-36 bg-gray-200 rounded-full h-2.5'>
              <div
                className='bg-amber-600 h-2.5 rounded-full'
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className='text-xs text-gray-500 mt-1 text-right'>
              {completedSteps.length} of {steps.length} steps completed
            </div>
          </div>
        </div>
      </div>

      <div className='flex flex-col lg:flex-row'>
        <div className='w-full lg:w-64 border-r bg-gray-50 p-4 overflow-y-auto'>
          <h3 className='text-sm font-medium text-gray-500 uppercase mb-3'>
            Steps
          </h3>
          <ul className='space-y-1'>
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isAccessible = isStepAccessible(index);
              const isCurrent = currentStepIndex === index;

              return (
                <li key={step.id}>
                  <button
                    onClick={() => isAccessible && handleStepClick(index)}
                    className={`flex items-center w-full text-left px-3 py-2 rounded-md ${
                      isCurrent
                        ? 'bg-amber-100 text-amber-800'
                        : isAccessible
                        ? 'hover:bg-gray-100'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    disabled={!isAccessible}
                  >
                    <span
                      className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 ${
                        isCompleted
                          ? 'bg-green-100 text-green-600'
                          : isCurrent
                          ? 'bg-amber-200 text-amber-800'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted ? <Check size={14} /> : index + 1}
                    </span>
                    <span
                      className={isCompleted ? 'line-through opacity-70' : ''}
                    >
                      {step.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className='flex-1 p-6'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-lg font-medium'>
              Step {currentStepIndex + 1}: {currentStep.title}
            </h3>
            <div className='flex items-center'>
              <label className='flex items-center text-sm'>
                <input
                  type='checkbox'
                  checked={completedSteps.includes(currentStep.id)}
                  onChange={() => toggleStepCompletion(currentStep.id)}
                  className='mr-2 h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500'
                />
                Mark as completed
              </label>
            </div>
          </div>

          {currentStep.estimatedTime && (
            <div className='bg-blue-50 text-blue-800 text-sm px-4 py-2 rounded-md mb-4 flex items-center'>
              <Clock size={16} className='mr-2' />
              Estimated time: {formatTime(currentStep.estimatedTime)}
            </div>
          )}

          {currentStep.warning && (
            <div className='bg-yellow-50 text-yellow-800 text-sm px-4 py-2 rounded-md mb-4 flex items-center'>
              <AlertTriangle size={16} className='mr-2' />
              {currentStep.warning}
            </div>
          )}

          {(currentStep.tools && currentStep.tools.length > 0) ||
          (currentStep.materials && currentStep.materials.length > 0) ? (
            <div className='mb-4 flex flex-col md:flex-row gap-4'>
              {currentStep.tools && currentStep.tools.length > 0 && (
                <div className='bg-gray-50 rounded-md p-4 flex-1'>
                  <h4 className='font-medium mb-2'>Tools Needed</h4>
                  <ul className='list-disc ml-5 text-sm space-y-1'>
                    {currentStep.tools.map((tool, index) => (
                      <li key={index}>{tool}</li>
                    ))}
                  </ul>
                </div>
              )}

              {currentStep.materials && currentStep.materials.length > 0 && (
                <div className='bg-gray-50 rounded-md p-4 flex-1'>
                  <h4 className='font-medium mb-2'>Materials Needed</h4>
                  <ul className='list-disc ml-5 text-sm space-y-1'>
                    {currentStep.materials.map((material, index) => (
                      <li key={index}>{material}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}

          {currentStep.image && (
            <div className='mb-4'>
              <img
                src={currentStep.image}
                alt={`Step ${currentStepIndex + 1}`}
                className='w-full max-h-80 object-contain rounded-md'
              />
            </div>
          )}

          <div className='prose max-w-none mb-6'>
            <ContentRenderer content={currentStep.content} />
          </div>

          {currentStep.video && (
            <div className='mb-6'>
              <h4 className='text-md font-medium mb-2'>Video Demonstration</h4>
              <VideoEmbed
                video={{
                  videoId: currentStep.video.videoId,
                  title: currentStep.video.title,
                  description: currentStep.video.description,
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className='p-4 flex justify-between border-t'>
        <button
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
          className={`flex items-center px-4 py-2 rounded ${
            currentStepIndex === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <ChevronLeft size={18} className='mr-1' />
          Previous
        </button>

        <button
          onClick={handleNext}
          className={`flex items-center px-4 py-2 rounded ${
            currentStepIndex === steps.length - 1
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-amber-600 text-white hover:bg-amber-700'
          }`}
        >
          {currentStepIndex === steps.length - 1 ? 'Complete' : 'Next'}
          <ChevronRight size={18} className='ml-1' />
        </button>
      </div>
    </div>
  );
};

export default StepByStepGuide;
