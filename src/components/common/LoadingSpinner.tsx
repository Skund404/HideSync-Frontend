// src/components/common/LoadingSpinner.tsx
import { Loader2 } from 'lucide-react';
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'amber' | 'stone' | 'blue';
  message?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'amber',
  message = 'Loading...',
  className = '',
}) => {
  // Define sizes
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  // Define colors
  const colorClasses = {
    amber: 'text-amber-600',
    stone: 'text-stone-600',
    blue: 'text-blue-600',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center py-4 ${className}`}
    >
      <Loader2
        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}
      />
      {message && <p className='mt-3 text-sm text-stone-600'>{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
