// src/components/common/ErrorMessage.tsx
import { AlertCircle } from 'lucide-react';
import React from 'react';

interface Props {
  message: string;
  onRetry?: () => void;
  variant?: 'default' | 'critical';
}

const ErrorMessage: React.FC<Props> = ({
  message,
  onRetry,
  variant = 'default',
}) => {
  const baseClass = 'px-4 py-3 rounded-md flex items-start';

  const variantClasses = {
    default: 'bg-red-50 border border-red-200 text-red-700',
    critical: 'bg-red-100 border border-red-300 text-red-800',
  };

  return (
    <div className={`${baseClass} ${variantClasses[variant]}`}>
      <AlertCircle className='h-5 w-5 mr-2 mt-0.5 flex-shrink-0' />
      <div className='flex-1'>
        <p className='text-sm font-medium'>{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className='mt-2 text-sm font-medium text-red-800 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded'
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
