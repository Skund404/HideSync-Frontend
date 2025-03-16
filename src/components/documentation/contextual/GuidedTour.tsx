// src/components/documentation/contextual/GuidedTour.tsx

import React, { useEffect, useState } from 'react';
import TourStep, { Step } from './TourStep';

interface GuidedTourProps {
  tourId: string;
  steps: Step[];
  onComplete: () => void;
  onExit: () => void;
  isActive: boolean;
  startAtStep?: number;
}

const GuidedTour: React.FC<GuidedTourProps> = ({
  tourId,
  steps,
  onComplete,
  onExit,
  isActive,
  startAtStep = 0,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(startAtStep);
  const [isVisible, setIsVisible] = useState(false);

  // Track tour progress in localStorage
  const localStorageKey = `hidesync_tour_${tourId}`;

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);

      // Check if tour was previously started but not completed
      try {
        const savedProgress = localStorage.getItem(localStorageKey);
        if (savedProgress) {
          const progress = JSON.parse(savedProgress);
          if (progress.completed !== true && progress.lastStep < steps.length) {
            setCurrentStepIndex(progress.lastStep);
          }
        }
      } catch (error) {
        console.error('Error reading tour progress:', error);
      }
    } else {
      setIsVisible(false);
    }
  }, [isActive, tourId, localStorageKey, steps.length]);

  const saveProgress = (index: number, completed = false) => {
    try {
      localStorage.setItem(
        localStorageKey,
        JSON.stringify({
          lastStep: index,
          completed,
        })
      );
    } catch (error) {
      console.error('Error saving tour progress:', error);
    }
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      const newIndex = currentStepIndex + 1;
      setCurrentStepIndex(newIndex);
      saveProgress(newIndex);
    } else {
      // Tour complete
      saveProgress(currentStepIndex, true);
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      const newIndex = currentStepIndex - 1;
      setCurrentStepIndex(newIndex);
      saveProgress(newIndex);
    }
  };

  const handleExit = () => {
    // Save current progress before exiting
    saveProgress(currentStepIndex);
    onExit();
  };

  if (!isVisible || steps.length === 0) {
    return null;
  }

  const currentStep = steps[currentStepIndex];

  return (
    <>
      <div className='fixed inset-0 bg-black bg-opacity-20 z-40 pointer-events-none'></div>
      <TourStep
        key={currentStep.id}
        step={currentStep}
        currentStep={currentStepIndex + 1}
        totalSteps={steps.length}
        onNext={nextStep}
        onPrev={prevStep}
        onExit={handleExit}
      />
    </>
  );
};

export default GuidedTour;
