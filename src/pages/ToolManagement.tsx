// src/pages/ToolManagement.tsx
//
// The main page component for the Tool Management module.
// It wraps the ToolManagementView with the ToolProvider for context.
// Updated to include error boundaries and loading states.

import React, { Suspense, useState, useEffect } from 'react';
import ToolManagementView from '@/components/tools/ToolManagementView';
import { ToolProvider } from '@/context/ToolContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';

// Error boundary for catching rendering errors
class ToolManagementErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error in Tool Management module:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-4xl mx-auto">
          <ErrorMessage 
            message={`Something went wrong in the Tool Management module: ${this.state.error?.message || 'Unknown error'}`}
            onRetry={() => window.location.reload()}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy load the Tool Management view for better performance
const LazyToolManagementView = React.lazy(() => 
  import('@/components/tools/ToolManagementView')
);

const ToolManagement: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  // Check for any initialization errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Unhandled error in Tool Management:', event.error);
      setError(`Unhandled error: ${event.error?.message || 'Unknown error'}`);
    };

    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <ErrorMessage 
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <ToolManagementErrorBoundary>
      <ToolProvider>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner 
              size="large" 
              color="amber" 
              message="Loading Tool Management module..." 
            />
          </div>
        }>
          <ToolManagementView />
        </Suspense>
      </ToolProvider>
    </ToolManagementErrorBoundary>
  );
};

export default ToolManagement;