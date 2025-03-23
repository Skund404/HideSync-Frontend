// src/components/patterns/PatternDetail.tsx
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ComponentDetail from '@/components/patterns/components/ComponentDetail';
import ComponentForm from '@/components/patterns/components/ComponentForm';
import ComponentList from '@/components/patterns/components/ComponentList';
import ComponentViewer from '@/components/patterns/components/ComponentViewer';
import PatternActions from '@/components/patterns/detail/PatternActions';
import PatternMetadata from '@/components/patterns/detail/PatternMetadata';
import MaterialRequirementsViewer from '@/components/patterns/materials/MaterialRequirementsViewer';
import ImageViewer from '@/components/patterns/viewer/ImageViewer';
import PDFViewer from '@/components/patterns/viewer/PDFViewer';
import SVGViewer from '@/components/patterns/viewer/SVGViewer';
import { useComponentContext } from '@/context/ComponentContext';
import { usePatternContext } from '@/context/PatternContext';
import { Component, Pattern, PatternFileType } from '@/types/patternTypes';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface PatternDetailProps {
  patternId?: number;
  onClose?: () => void;
  isModal?: boolean;
}

const PatternDetail: React.FC<PatternDetailProps> = ({
  patternId: propPatternId,
  onClose,
  isModal = false,
}) => {
  // Use either prop patternId or route param
  const { id: paramId } = useParams<{ id: string }>();
  const patternId =
    propPatternId || (paramId ? parseInt(paramId, 10) : undefined);

  const {
    getPatternById,
    toggleFavorite,
    loading: patternLoading,
    error: patternError,
  } = usePatternContext();
  const {
    getComponentsByPatternId,
    loading: componentLoading,
    error: componentError,
  } = useComponentContext();

  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'pattern' | 'components' | 'materials' | 'notes'
  >('pattern');

  // Component-related state
  const [patternComponents, setPatternComponents] = useState<Component[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(
    null
  );
  const [isAddingComponent, setIsAddingComponent] = useState(false);
  const [isEditingComponent, setIsEditingComponent] = useState(false);

  const navigate = useNavigate();

  // Load pattern and components
  const loadData = useCallback(async () => {
    if (!patternId) {
      setError('No pattern ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch pattern data
      const fetchedPattern = await getPatternById(patternId);

      if (!fetchedPattern) {
        setError(`Pattern with ID ${patternId} not found`);
        setLoading(false);
        return;
      }

      setPattern(fetchedPattern);

      // Fetch components for this pattern
      if (fetchedPattern.id) {
        const components = await getComponentsByPatternId(fetchedPattern.id);
        setPatternComponents(components);
      }
    } catch (err) {
      setError(
        `Error loading pattern data: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setLoading(false);
    }
  }, [patternId, getPatternById, getComponentsByPatternId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/patterns');
    }
  };

  const handleRetry = () => {
    loadData();
  };

  const handleToggleFavorite = async () => {
    if (!pattern) return;

    try {
      const updatedPattern = await toggleFavorite(pattern.id);
      setPattern(updatedPattern);
    } catch (err) {
      console.error('Error toggling favorite:', err);
      // You could add a toast notification here
    }
  };

  const handleSelectComponent = (component: Component) => {
    setSelectedComponent(component);
    setIsAddingComponent(false);
    setIsEditingComponent(false);
  };

  const handleAddComponent = () => {
    setSelectedComponent(null);
    setIsAddingComponent(true);
    setIsEditingComponent(false);
  };

  const handleEditComponent = (component: Component) => {
    setSelectedComponent(component);
    setIsAddingComponent(false);
    setIsEditingComponent(true);
  };

  const handleCloseComponentDetail = () => {
    setSelectedComponent(null);
  };

  const handleSaveComponent = async () => {
    // After saving, refresh component list
    if (pattern?.id) {
      try {
        const updatedComponents = await getComponentsByPatternId(pattern.id);
        setPatternComponents(updatedComponents);
      } catch (err) {
        console.error('Error refreshing components:', err);
        // You could add a toast notification here
      }
    }

    setIsAddingComponent(false);
    setIsEditingComponent(false);
    setSelectedComponent(null);
  };

  const renderViewer = () => {
    if (!pattern) return null;

    switch (pattern.fileType) {
      case PatternFileType.SVG:
        return <SVGViewer filePath={pattern.filePath} />;
      case PatternFileType.PDF:
        return <PDFViewer filePath={pattern.filePath} />;
      case PatternFileType.IMAGE:
        return <ImageViewer filePath={pattern.filePath} />;
      default:
        return (
          <div className='flex items-center justify-center h-96 bg-stone-100 rounded-lg'>
            <div className='text-center p-6'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-12 w-12 text-stone-400 mx-auto mb-4'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              <h3 className='text-lg font-medium text-stone-700'>
                Unsupported File Format
              </h3>
              <p className='text-stone-500 mt-2'>
                The pattern file format is not supported for preview.
              </p>
            </div>
          </div>
        );
    }
  };

  // Render components tab content
  const renderComponentsTab = () => {
    if (!pattern) return null;

    if (componentLoading) {
      return (
        <LoadingSpinner
          size='medium'
          color='amber'
          message='Loading components...'
        />
      );
    }

    if (componentError) {
      return <ErrorMessage message={componentError} onRetry={handleRetry} />;
    }

    // If viewing component details
    if (selectedComponent && !isEditingComponent) {
      return (
        <ComponentDetail
          componentId={selectedComponent.id}
          onClose={handleCloseComponentDetail}
          onEdit={handleEditComponent}
        />
      );
    }

    // If adding or editing a component
    if (isAddingComponent || isEditingComponent) {
      return (
        <ComponentForm
          patternId={pattern.id}
          component={
            isEditingComponent ? selectedComponent || undefined : undefined
          }
          onSave={handleSaveComponent}
          onCancel={() => {
            setIsAddingComponent(false);
            setIsEditingComponent(false);
            setSelectedComponent(null);
          }}
        />
      );
    }

    // Default view - show component list and viewer
    return (
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <h3 className='text-lg font-medium text-stone-700'>
            Pattern Components
          </h3>
          <button
            onClick={handleAddComponent}
            className='bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 mr-2'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 6v6m0 0v6m0-6h6m-6 0H6'
              />
            </svg>
            Add Component
          </button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-5 gap-6'>
          <div className='lg:col-span-2'>
            <ComponentList
              patternId={pattern.id}
              onSelectComponent={handleSelectComponent}
            />
          </div>
          <div className='lg:col-span-3'>
            <ComponentViewer
              patternId={pattern.id}
              components={patternComponents}
              selectedComponentId={selectedComponent?.id}
              onSelectComponent={handleSelectComponent}
            />
          </div>
        </div>
      </div>
    );
  };

  // Render materials tab content
  const renderMaterialsTab = () => {
    if (!pattern) return null;

    return <MaterialRequirementsViewer patternId={pattern.id} />;
  };

  // Show loading indicator
  if (loading || patternLoading) {
    return (
      <div
        className={`bg-white ${isModal ? 'rounded-lg p-6' : 'min-h-screen'}`}
      >
        <LoadingSpinner
          size='medium'
          color='amber'
          message='Loading pattern...'
        />
      </div>
    );
  }

  // Show error message
  if (error || patternError || !pattern) {
    return (
      <div
        className={`bg-white ${isModal ? 'rounded-lg p-6' : 'min-h-screen'}`}
      >
        <div className='text-center p-6 bg-red-50 rounded-lg max-w-md mx-auto mt-10'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-10 w-10 text-red-500 mx-auto mb-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
          <h3 className='text-lg font-medium text-red-800 mb-2'>
            Error Loading Pattern
          </h3>
          <p className='text-red-700'>{error || patternError}</p>
          <button
            onClick={handleRetry}
            className='mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium'
          >
            Try Again
          </button>
          <button
            onClick={handleBack}
            className='mt-4 ml-2 px-4 py-2 bg-stone-600 hover:bg-stone-700 text-white rounded-md text-sm font-medium'
          >
            Return to Patterns
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white ${isModal ? 'rounded-lg' : 'min-h-screen'}`}>
      {/* Header */}
      <div className='border-b border-stone-200 px-6 py-4 flex justify-between items-center'>
        <div className='flex items-center'>
          <button
            onClick={handleBack}
            className='mr-4 text-stone-500 hover:text-stone-700'
            aria-label='Go back'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M10 19l-7-7m0 0l7-7m-7 7h18'
              />
            </svg>
          </button>
          <div>
            <h1 className='text-xl font-semibold text-stone-900'>
              {pattern.name}
            </h1>
            <p className='text-sm text-stone-500'>
              Last modified {new Date(pattern.modifiedAt).toLocaleDateString()}{' '}
              by {pattern.authorName}
            </p>
          </div>
        </div>
        <PatternActions
          pattern={pattern}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>

      {/* Content */}
      <div className='flex flex-col md:flex-row'>
        {/* Pattern Viewer (2/3 width on desktop, full on mobile) */}
        <div className='md:w-2/3 p-6 bg-stone-50'>
          {/* Tabs for the viewer section */}
          <div className='border-b border-stone-200 mb-4'>
            <div className='flex space-x-6'>
              <button
                onClick={() => setActiveTab('pattern')}
                className={`py-2 px-1 text-sm font-medium border-b-2 ${
                  activeTab === 'pattern'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                }`}
              >
                Pattern
              </button>
              <button
                onClick={() => setActiveTab('components')}
                className={`py-2 px-1 text-sm font-medium border-b-2 ${
                  activeTab === 'components'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                }`}
              >
                Components
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`py-2 px-1 text-sm font-medium border-b-2 ${
                  activeTab === 'materials'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                }`}
              >
                Materials
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`py-2 px-1 text-sm font-medium border-b-2 ${
                  activeTab === 'notes'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                }`}
              >
                Notes
              </button>
            </div>
          </div>

          {/* Viewer content based on active tab */}
          <div>
            {activeTab === 'pattern' && renderViewer()}

            {activeTab === 'components' && renderComponentsTab()}

            {activeTab === 'materials' && renderMaterialsTab()}

            {activeTab === 'notes' && (
              <div className='bg-white p-4 rounded-lg border border-stone-200'>
                <h3 className='font-medium text-lg mb-2'>Pattern Notes</h3>
                <textarea
                  className='w-full h-48 border border-stone-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
                  placeholder='Add notes about this pattern...'
                  defaultValue={pattern.notes || ''}
                />
                <div className='flex justify-end mt-2'>
                  <button className='bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-md text-sm font-medium'>
                    Save Notes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pattern Metadata Sidebar (1/3 width on desktop, full on mobile) */}
        <div className='md:w-1/3 border-l border-stone-200 bg-white'>
          <PatternMetadata pattern={pattern} />
        </div>
      </div>
    </div>
  );
};

export default PatternDetail;
