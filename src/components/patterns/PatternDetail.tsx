// src/components/patterns/PatternDetail.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useComponentContext } from '../../context/ComponentContext';
import { usePatternContext } from '../../context/PatternContext';
import {
  Annotation,
  createAnnotation,
  deleteAnnotation,
  getAnnotationsByPatternId,
  updateAnnotation,
} from '../../services/annotation-service';
import { handleApiError } from '../../services/error-handler';
import { showError, showSuccess } from '../../services/notification-service';
import { Component, Pattern, PatternFileType } from '../../types/patternTypes';
import ErrorBoundary from '../common/ErrorBoundary';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';
import AnnotationToolbar from './annotation/AnnotationToolbar';
import ComponentDetail from './components/ComponentDetail';
import ComponentForm from './components/ComponentForm';
import ComponentList from './components/ComponentList';
import ComponentViewer from './components/ComponentViewer';
import PatternActions from './detail/PatternActions';
import PatternMetadata from './detail/PatternMetadata';
import MaterialRequirementsViewer from './materials/MaterialRequirementsViewer';
import ImageViewer from './viewer/ImageViewer';
import PDFViewer from './viewer/PDFViewer';
import SVGViewer from './viewer/SVGViewer';

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

  // Annotation-related state
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeAnnotationId, setActiveAnnotationId] = useState<
    string | undefined
  >(undefined);
  const [activeToolType, setActiveToolType] = useState<
    'text' | 'arrow' | 'measurement' | 'highlight' | null
  >(null);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [isLoadingAnnotations, setIsLoadingAnnotations] = useState(false);
  const [annotationError, setAnnotationError] = useState<string | null>(null);

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

        // Fetch annotations for this pattern
        try {
          setIsLoadingAnnotations(true);
          const patternAnnotations = await getAnnotationsByPatternId(
            fetchedPattern.id
          );
          setAnnotations(patternAnnotations);
        } catch (err) {
          const annotErrMsg = handleApiError(
            err,
            'Failed to fetch annotations'
          );
          setAnnotationError(annotErrMsg);
          // Don't fail the entire pattern load if annotations fail
          console.error(annotErrMsg);
        } finally {
          setIsLoadingAnnotations(false);
        }
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
      showError(
        `Failed to toggle favorite status: ${handleApiError(
          err,
          'Unknown error'
        )}`
      );
    }
  };

  // Annotation handlers
  const handleAnnotationCreated = async (
    newAnnotation: Omit<Annotation, 'id' | 'createdAt' | 'modifiedAt'>
  ) => {
    if (!pattern) return;

    try {
      // Create annotation with API
      const createdAnnotation = await createAnnotation({
        ...newAnnotation,
        patternId: pattern.id,
      });

      // Add to local state
      setAnnotations((prev) => [...prev, createdAnnotation]);
      setActiveAnnotationId(createdAnnotation.id);

      showSuccess('Annotation created');
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to create annotation');
      showError(errorMessage);
    }
  };

  const handleAnnotationUpdated = async (
    id: string,
    changes: Partial<Annotation>
  ) => {
    try {
      // Update annotation with API
      await updateAnnotation(id, changes);

      // Update local state
      setAnnotations((prev) =>
        prev.map((ann) => (ann.id === id ? { ...ann, ...changes } : ann))
      );

      showSuccess('Annotation updated');
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to update annotation');
      showError(errorMessage);
    }
  };

  const handleAnnotationDeleted = async (id: string) => {
    try {
      // Delete annotation with API
      await deleteAnnotation(id);

      // Update local state
      setAnnotations((prev) => prev.filter((ann) => ann.id !== id));

      // Clear active annotation if it was deleted
      if (activeAnnotationId === id) {
        setActiveAnnotationId(undefined);
      }

      showSuccess('Annotation deleted');
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to delete annotation');
      showError(errorMessage);
    }
  };

  const handleClearAllAnnotations = async () => {
    if (!pattern) return;

    if (annotations.length === 0) return;

    if (
      !window.confirm(
        `Are you sure you want to delete all ${annotations.length} annotations?`
      )
    ) {
      return;
    }

    try {
      // Delete all annotations with API
      await Promise.all(annotations.map((ann) => deleteAnnotation(ann.id)));

      // Clear local state
      setAnnotations([]);
      setActiveAnnotationId(undefined);

      showSuccess('All annotations cleared');
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to clear annotations');
      showError(errorMessage);
    }
  };

  const handleToggleAnnotationsVisibility = () => {
    setShowAnnotations((prev) => !prev);
  };

  // Component handlers
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
        showError(
          `Failed to refresh components: ${handleApiError(
            err,
            'Unknown error'
          )}`
        );
      }
    }

    setIsAddingComponent(false);
    setIsEditingComponent(false);
    setSelectedComponent(null);
  };

  // Custom wrappers for setActiveAnnotationId to handle string | undefined vs string | null
  const handleSetActiveAnnotationId = (id?: string) => {
    setActiveAnnotationId(id);
  };

  // Display loading indicator when annotations are loading
  const renderAnnotationLoadingStatus = () => {
    if (isLoadingAnnotations) {
      return (
        <div className='bg-amber-50 border-l-4 border-amber-400 p-2 text-xs'>
          <div className='flex items-center'>
            <span className='ml-1'>Loading annotations...</span>
          </div>
        </div>
      );
    }

    if (annotationError) {
      return (
        <div className='bg-red-50 border-l-4 border-red-400 p-2 text-xs'>
          <div className='flex items-center'>
            <span className='ml-1'>
              Error loading annotations: {annotationError}
            </span>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderViewer = () => {
    if (!pattern) return null;

    switch (pattern.fileType) {
      case PatternFileType.SVG:
        return (
          <ErrorBoundary>
            <SVGViewer
              filePath={pattern.filePath}
              annotations={annotations}
              onAnnotationCreated={handleAnnotationCreated}
              onAnnotationUpdated={handleAnnotationUpdated}
              onAnnotationDeleted={handleAnnotationDeleted}
              activeAnnotationId={activeAnnotationId}
              setActiveAnnotationId={handleSetActiveAnnotationId}
              activeToolType={activeToolType}
              showAnnotations={showAnnotations}
            />
          </ErrorBoundary>
        );
      case PatternFileType.PDF:
        return (
          <ErrorBoundary>
            <PDFViewer
              filePath={pattern.filePath}
              annotations={annotations}
              onAnnotationCreated={handleAnnotationCreated}
              onAnnotationUpdated={handleAnnotationUpdated}
              onAnnotationDeleted={handleAnnotationDeleted}
              activeAnnotationId={activeAnnotationId}
              setActiveAnnotationId={handleSetActiveAnnotationId}
              activeToolType={activeToolType}
              showAnnotations={showAnnotations}
            />
          </ErrorBoundary>
        );
      case PatternFileType.IMAGE:
        return (
          <ErrorBoundary>
            <ImageViewer
              filePath={pattern.filePath}
              annotations={annotations}
              onAnnotationCreated={handleAnnotationCreated}
              onAnnotationUpdated={handleAnnotationUpdated}
              onAnnotationDeleted={handleAnnotationDeleted}
              activeAnnotationId={activeAnnotationId}
              setActiveAnnotationId={handleSetActiveAnnotationId}
              activeToolType={activeToolType}
              showAnnotations={showAnnotations}
            />
          </ErrorBoundary>
        );
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
            {activeTab === 'pattern' && (
              <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
                {/* Annotation Toolbar */}
                <AnnotationToolbar
                  activeToolType={activeToolType}
                  setActiveToolType={setActiveToolType}
                  annotationCount={annotations.length}
                  onClearAllAnnotations={handleClearAllAnnotations}
                  onToggleAnnotationsVisibility={
                    handleToggleAnnotationsVisibility
                  }
                  areAnnotationsVisible={showAnnotations}
                />

                {/* Annotation Loading Status */}
                {renderAnnotationLoadingStatus()}

                {/* Pattern Viewer */}
                <div className='h-[600px]'>{renderViewer()}</div>
              </div>
            )}

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
          <PatternMetadata pattern={pattern} onPatternUpdated={setPattern} />
        </div>
      </div>
    </div>
  );
};

export default PatternDetail;
