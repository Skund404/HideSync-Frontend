// src/components/common/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'amber' | 'stone' | 'blue';
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'amber',
  message = 'Loading...',
}) => {
  // Define sizes
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16',
  };

  // Define colors
  const colorClasses = {
    amber: 'border-amber-500',
    stone: 'border-stone-500',
    blue: 'border-blue-500',
  };

  return (
    <div className='flex flex-col items-center justify-center p-8'>
      <div
        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin rounded-full border-t-2 border-b-2 border-l-transparent border-r-transparent mx-auto`}
      />
      {message && <p className='mt-4 text-stone-600'>{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
