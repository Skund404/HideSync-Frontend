// src/components/patterns/annotation/AnnotationLayer.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Annotation } from '../../../services/annotation-service';

interface AnnotationLayerProps {
  annotations: Annotation[];
  onAddAnnotation?: (
    annotation: Omit<Annotation, 'id' | 'createdAt' | 'modifiedAt'>
  ) => void;
  onUpdateAnnotation?: (id: string, annotation: Partial<Annotation>) => void;
  onDeleteAnnotation?: (id: string) => void;
  activeAnnotationId?: string;
  setActiveAnnotationId?: (id?: string) => void;
  activeToolType?: 'text' | 'arrow' | 'measurement' | 'highlight' | null;
  zoom: number;
  position: { x: number; y: number };
  containerRef: React.RefObject<HTMLDivElement>;
  readOnly?: boolean;
  svgWidth?: number;
  svgHeight?: number;
  transformCoordinates?: (x: number, y: number) => { x: number; y: number };
}

// Virtual viewport constants for optimization
const VIEWPORT_PADDING = 100; // Extra padding around visible area to render annotations

const AnnotationLayer: React.FC<AnnotationLayerProps> = ({
  annotations,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  activeAnnotationId,
  setActiveAnnotationId,
  activeToolType,
  zoom,
  position,
  containerRef,
  readOnly = false,
  svgWidth,
  svgHeight,
  transformCoordinates,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [tempAnnotation, setTempAnnotation] =
    useState<Partial<Annotation> | null>(null);
  const [visibleAnnotations, setVisibleAnnotations] = useState<string[]>([]);
  const [viewportRect, setViewportRect] = useState<{
    left: number;
    top: number;
    right: number;
    bottom: number;
  }>({ left: 0, top: 0, right: 0, bottom: 0 });
  const [draggedAnnotation, setDraggedAnnotation] = useState<string | null>(
    null
  );
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const annotationLayerRef = useRef<HTMLDivElement>(null);
  const mouseEventTimerRef = useRef<number | null>(null);
  const interactionStartRef = useRef<{ x: number; y: number } | null>(null);

  // Calculate and update viewport rectangle (visible area)
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      // Calculate the visible area in pattern coordinates
      const viewportLeft = -position.x / zoom - VIEWPORT_PADDING;
      const viewportTop = -position.y / zoom - VIEWPORT_PADDING;
      const viewportRight =
        viewportLeft + rect.width / zoom + VIEWPORT_PADDING * 2;
      const viewportBottom =
        viewportTop + rect.height / zoom + VIEWPORT_PADDING * 2;

      setViewportRect({
        left: viewportLeft,
        top: viewportTop,
        right: viewportRight,
        bottom: viewportBottom,
      });
    }
  }, [position, zoom, containerRef]);

  // Filter out only annotations that should be visible in the current viewport
  useEffect(() => {
    // Skip if we have a small number of annotations (no need to optimize)
    if (annotations.length < 100) {
      setVisibleAnnotations(annotations.map((a) => a.id));
      return;
    }

    const visibleIds = annotations
      .filter((annotation) => {
        // Check if annotation is at least partially within the viewport
        const { position: pos, size, targetPosition } = annotation;

        // Basic position check
        if (pos.x > viewportRect.right || pos.y > viewportRect.bottom) {
          return false;
        }

        // Check based on annotation type
        switch (annotation.type) {
          case 'text':
          case 'highlight':
            // Use size if available
            if (size) {
              return !(
                pos.x + size.width < viewportRect.left ||
                pos.y + size.height < viewportRect.top
              );
            }
            // Fallback if size is not defined
            return true;

          case 'arrow':
          case 'measurement':
            // For annotations with a target position
            if (targetPosition) {
              // Check if either the start or end point is in the viewport
              const startInViewport = !(
                pos.x < viewportRect.left ||
                pos.x > viewportRect.right ||
                pos.y < viewportRect.top ||
                pos.y > viewportRect.bottom
              );

              const endInViewport = !(
                targetPosition.x < viewportRect.left ||
                targetPosition.x > viewportRect.right ||
                targetPosition.y < viewportRect.top ||
                targetPosition.y > viewportRect.bottom
              );

              return startInViewport || endInViewport;
            }
            return true;

          default:
            return true;
        }
      })
      .map((a) => a.id);

    setVisibleAnnotations(visibleIds);
  }, [annotations, viewportRect]);

  useEffect(() => {
    if (!activeToolType) {
      setIsCreating(false);
      setTempAnnotation(null);
    }
  }, [activeToolType]);

  // Debounced mouse event handler to improve performance
  const debouncedMouseEvent = useCallback(
    (callback: Function, event: React.MouseEvent) => {
      if (mouseEventTimerRef.current !== null) {
        window.cancelAnimationFrame(mouseEventTimerRef.current);
      }

      mouseEventTimerRef.current = window.requestAnimationFrame(() => {
        callback(event);
        mouseEventTimerRef.current = null;
      });
    },
    []
  );

  // Find screen coordinates relative to the container
  const getRelativeCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };

      const rect = containerRef.current.getBoundingClientRect();
      let x = (clientX - rect.left - position.x) / zoom;
      let y = (clientY - rect.top - position.y) / zoom;

      // Use transformCoordinates if provided (for more precise coordinate mapping)
      if (transformCoordinates) {
        const transformed = transformCoordinates(clientX, clientY);
        x = transformed.x;
        y = transformed.y;
      }

      return { x, y };
    },
    [containerRef, position, zoom, transformCoordinates]
  );

  // Handle mouse down
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (readOnly) return;

      // Store the exact start position for detecting small movements
      interactionStartRef.current = { x: e.clientX, y: e.clientY };
      const { x, y } = getRelativeCoordinates(e.clientX, e.clientY);

      // We're creating a new annotation if an active tool is selected
      if (activeToolType && onAddAnnotation) {
        setIsCreating(true);
        setDragStart({ x, y });

        // Create a temporary annotation based on the active tool
        const newAnnotation: Partial<Annotation> = {
          type: activeToolType,
          position: { x, y },
          color:
            activeToolType === 'text'
              ? '#000000'
              : activeToolType === 'arrow'
              ? '#ff0000'
              : activeToolType === 'measurement'
              ? '#0000ff'
              : '#ffff00', // highlight
          patternId: 0, // Will be set properly when added
        };

        if (activeToolType === 'arrow' || activeToolType === 'measurement') {
          newAnnotation.targetPosition = { x, y };
        }

        setTempAnnotation(newAnnotation);
      }
    },
    [readOnly, activeToolType, onAddAnnotation, getRelativeCoordinates]
  );

  // Handle mouse move - debounced for performance
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (readOnly) return;

      debouncedMouseEvent((event: React.MouseEvent) => {
        const { x, y } = getRelativeCoordinates(event.clientX, event.clientY);

        // Handle creating a new annotation
        if (isCreating && tempAnnotation && activeToolType) {
          if (activeToolType === 'arrow' || activeToolType === 'measurement') {
            setTempAnnotation((prev) => ({
              ...prev,
              targetPosition: { x, y },
            }));
          } else if (
            activeToolType === 'highlight' ||
            activeToolType === 'text'
          ) {
            const width = Math.abs(x - dragStart.x);
            const height = Math.abs(y - dragStart.y);
            const position = {
              x: Math.min(dragStart.x, x),
              y: Math.min(dragStart.y, y),
            };

            setTempAnnotation((prev) => ({
              ...prev,
              position,
              size: { width, height },
            }));
          }
        }

        // Handle dragging an existing annotation
        else if (isDragging && draggedAnnotation && onUpdateAnnotation) {
          // Update the annotation's position
          onUpdateAnnotation(draggedAnnotation, {
            position: {
              x: x - dragOffset.x,
              y: y - dragOffset.y,
            },
          });
        }
      }, e);
    },
    [
      readOnly,
      isCreating,
      tempAnnotation,
      activeToolType,
      dragStart,
      getRelativeCoordinates,
      debouncedMouseEvent,
      isDragging,
      draggedAnnotation,
      dragOffset,
      onUpdateAnnotation,
    ]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (readOnly) return;

      // End annotation creation if we were creating one
      if (isCreating && tempAnnotation && activeToolType && onAddAnnotation) {
        // Check if this was just a click without significant movement
        // This prevents creating tiny annotations when just clicking
        if (interactionStartRef.current) {
          const deltaX = Math.abs(e.clientX - interactionStartRef.current.x);
          const deltaY = Math.abs(e.clientY - interactionStartRef.current.y);

          // If movement was minimal, adjust based on annotation type
          if (deltaX < 5 && deltaY < 5) {
            if (activeToolType === 'text') {
              // For text annotations, use a default size
              tempAnnotation.size = { width: 150, height: 50 };
            } else if (activeToolType === 'highlight') {
              // For highlights, use a default size
              tempAnnotation.size = { width: 100, height: 50 };
            } else if (
              activeToolType === 'arrow' ||
              activeToolType === 'measurement'
            ) {
              // For arrows and measurements, extend the line a bit
              const { x, y } = tempAnnotation.position!;
              tempAnnotation.targetPosition = { x: x + 100, y: y + 0 };
            }
          }
        }

        // Finalize the annotation
        if (activeToolType === 'text') {
          // For text, we need to prompt the user for the content
          const content = prompt('Enter annotation text:');
          if (content) {
            onAddAnnotation({
              ...(tempAnnotation as Omit<
                Annotation,
                'id' | 'createdAt' | 'modifiedAt'
              >),
              content,
              size: tempAnnotation.size || { width: 100, height: 30 },
            });
          }
        } else if (activeToolType === 'measurement') {
          // For measurements, calculate the distance and prompt for unit
          const unit = prompt('Enter measurement unit (e.g., in, cm):', 'cm');
          const start = tempAnnotation.position!;
          const end = tempAnnotation.targetPosition!;
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          onAddAnnotation({
            ...(tempAnnotation as Omit<
              Annotation,
              'id' | 'createdAt' | 'modifiedAt'
            >),
            measurement: distance,
            unit: unit || 'cm',
          });
        } else {
          // For other annotation types, just add them
          onAddAnnotation(
            tempAnnotation as Omit<
              Annotation,
              'id' | 'createdAt' | 'modifiedAt'
            >
          );
        }

        setIsCreating(false);
        setTempAnnotation(null);
      }

      // End annotation dragging if we were dragging
      if (isDragging) {
        setIsDragging(false);
        setDraggedAnnotation(null);
      }

      // Reset interaction tracking
      interactionStartRef.current = null;
    },
    [
      readOnly,
      isCreating,
      tempAnnotation,
      activeToolType,
      onAddAnnotation,
      isDragging,
    ]
  );

  // Handle annotation click
  const handleAnnotationClick = useCallback(
    (e: React.MouseEvent, annotationId: string) => {
      e.stopPropagation();
      if (readOnly || !setActiveAnnotationId) return;

      // Calculate drag offset when clicking on an annotation
      const annotation = annotations.find((a) => a.id === annotationId);
      if (annotation) {
        const { x, y } = getRelativeCoordinates(e.clientX, e.clientY);
        setDragOffset({
          x: x - annotation.position.x,
          y: y - annotation.position.y,
        });
      }

      setActiveAnnotationId(annotationId);
    },
    [readOnly, setActiveAnnotationId, annotations, getRelativeCoordinates]
  );

  // Start dragging an annotation
  const handleAnnotationDragStart = useCallback(
    (e: React.MouseEvent, annotationId: string) => {
      e.stopPropagation();
      if (readOnly || !onUpdateAnnotation) return;

      // Only enable dragging for text and highlight annotations
      const annotation = annotations.find((a) => a.id === annotationId);
      if (
        !annotation ||
        (annotation.type !== 'text' && annotation.type !== 'highlight')
      )
        return;

      const { x, y } = getRelativeCoordinates(e.clientX, e.clientY);
      setDragOffset({
        x: x - annotation.position.x,
        y: y - annotation.position.y,
      });

      setIsDragging(true);
      setDraggedAnnotation(annotationId);

      // Ensure the annotation is active
      if (setActiveAnnotationId) {
        setActiveAnnotationId(annotationId);
      }
    },
    [
      readOnly,
      onUpdateAnnotation,
      annotations,
      getRelativeCoordinates,
      setActiveAnnotationId,
    ]
  );

  // Handle annotation delete
  const handleAnnotationDelete = useCallback(
    (e: React.MouseEvent, annotationId: string) => {
      e.stopPropagation();
      if (readOnly || !onDeleteAnnotation) return;

      if (window.confirm('Are you sure you want to delete this annotation?')) {
        onDeleteAnnotation(annotationId);
      }
    },
    [readOnly, onDeleteAnnotation]
  );

  // Memoize the rendering of temporary annotation to reduce re-renders
  const renderedTempAnnotation = useMemo(() => {
    if (!tempAnnotation) return null;

    switch (tempAnnotation.type) {
      case 'text':
        return (
          <div
            className='absolute border-2 border-dashed border-black bg-white bg-opacity-50'
            style={{
              left: tempAnnotation.position?.x,
              top: tempAnnotation.position?.y,
              width: tempAnnotation.size?.width || 0,
              height: tempAnnotation.size?.height || 0,
              pointerEvents: 'none',
            }}
          />
        );

      case 'arrow':
        if (!tempAnnotation.targetPosition) return null;
        const start = tempAnnotation.position!;
        const end = tempAnnotation.targetPosition;

        // Calculate the angle for the arrow
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        const length = Math.sqrt(dx * dx + dy * dy);

        return (
          <div
            className='absolute bg-red-500'
            style={{
              left: start.x,
              top: start.y,
              width: length,
              height: 2,
              transformOrigin: 'left center',
              transform: `rotate(${angle}deg)`,
              pointerEvents: 'none',
            }}
          >
            <div
              className='absolute w-0 h-0 border-t-4 border-b-4 border-l-8 border-t-transparent border-b-transparent border-l-red-500'
              style={{
                right: -8,
                top: -3,
              }}
            />
          </div>
        );

      case 'measurement':
        if (!tempAnnotation.targetPosition) return null;
        const mStart = tempAnnotation.position!;
        const mEnd = tempAnnotation.targetPosition;

        // Calculate the angle and length
        const mDx = mEnd.x - mStart.x;
        const mDy = mEnd.y - mStart.y;
        const mAngle = (Math.atan2(mDy, mDx) * 180) / Math.PI;
        const mLength = Math.sqrt(mDx * mDx + mDy * mDy);

        return (
          <>
            <div
              className='absolute bg-blue-500'
              style={{
                left: mStart.x,
                top: mStart.y,
                width: mLength,
                height: 2,
                transformOrigin: 'left center',
                transform: `rotate(${mAngle}deg)`,
                pointerEvents: 'none',
              }}
            />
            <div
              className='absolute bg-white text-blue-700 text-xs px-1 rounded border border-blue-500'
              style={{
                left: mStart.x + mDx / 2 - 20,
                top: mStart.y + mDy / 2 - 10,
                pointerEvents: 'none',
              }}
            >
              {mLength.toFixed(1)}
            </div>
          </>
        );

      case 'highlight':
        return (
          <div
            className='absolute bg-yellow-200 bg-opacity-50'
            style={{
              left: tempAnnotation.position?.x,
              top: tempAnnotation.position?.y,
              width: tempAnnotation.size?.width || 0,
              height: tempAnnotation.size?.height || 0,
              pointerEvents: 'none',
            }}
          />
        );

      default:
        return null;
    }
  }, [tempAnnotation]);

  // Memoize annotation rendering to reduce unnecessary re-renders
  const renderedAnnotations = useMemo(() => {
    return annotations
      .filter((annotation) => visibleAnnotations.includes(annotation.id))
      .map((annotation) => {
        const isActive = activeAnnotationId === annotation.id;
        const isCurrentlyDragging =
          isDragging && draggedAnnotation === annotation.id;

        switch (annotation.type) {
          case 'text':
            return (
              <div
                key={annotation.id}
                className={`absolute bg-white p-1 border ${
                  isActive ? 'border-amber-500' : 'border-gray-300'
                } ${!readOnly ? 'cursor-move' : ''}`}
                style={{
                  left: annotation.position.x,
                  top: annotation.position.y,
                  width: annotation.size?.width || 100,
                  minHeight: annotation.size?.height || 30,
                  zIndex: isActive ? 10 : 1,
                  opacity: isCurrentlyDragging ? 0.7 : 1,
                }}
                onClick={(e) => handleAnnotationClick(e, annotation.id)}
                onMouseDown={(e) => handleAnnotationDragStart(e, annotation.id)}
              >
                <div className='text-sm'>{annotation.content}</div>

                {isActive && !readOnly && onDeleteAnnotation && (
                  <button
                    className='absolute -top-3 -right-3 bg-red-500 rounded-full text-white w-6 h-6 flex items-center justify-center'
                    onClick={(e) => handleAnnotationDelete(e, annotation.id)}
                  >
                    ×
                  </button>
                )}
              </div>
            );

          case 'arrow':
            if (!annotation.targetPosition) return null;
            const start = annotation.position;
            const end = annotation.targetPosition;

            // Calculate the angle for the arrow
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
            const length = Math.sqrt(dx * dx + dy * dy);

            return (
              <div
                key={annotation.id}
                className='absolute'
                style={{ left: 0, top: 0 }}
              >
                <div
                  className={`absolute bg-red-500 ${
                    !readOnly ? 'cursor-pointer' : ''
                  }`}
                  style={{
                    left: start.x,
                    top: start.y,
                    width: length,
                    height: isActive ? 3 : 2,
                    transformOrigin: 'left center',
                    transform: `rotate(${angle}deg)`,
                    zIndex: isActive ? 10 : 1,
                  }}
                  onClick={(e) => handleAnnotationClick(e, annotation.id)}
                >
                  <div
                    className='absolute w-0 h-0 border-t-4 border-b-4 border-l-8 border-t-transparent border-b-transparent border-l-red-500'
                    style={{
                      right: -8,
                      top: -3,
                    }}
                  />
                </div>

                {isActive && !readOnly && onDeleteAnnotation && (
                  <button
                    className='absolute bg-red-500 rounded-full text-white w-6 h-6 flex items-center justify-center'
                    style={{
                      left: start.x + dx / 2 - 12,
                      top: start.y + dy / 2 - 12,
                    }}
                    onClick={(e) => handleAnnotationDelete(e, annotation.id)}
                  >
                    ×
                  </button>
                )}
              </div>
            );

          case 'measurement':
            if (!annotation.targetPosition) return null;
            const mStart = annotation.position;
            const mEnd = annotation.targetPosition;

            // Calculate the angle and length
            const mDx = mEnd.x - mStart.x;
            const mDy = mEnd.y - mStart.y;
            const mAngle = (Math.atan2(mDy, mDx) * 180) / Math.PI;
            const mLength = Math.sqrt(mDx * mDx + mDy * mDy);

            return (
              <div
                key={annotation.id}
                className='absolute'
                style={{ left: 0, top: 0 }}
              >
                <div
                  className={`absolute bg-blue-500 ${
                    !readOnly ? 'cursor-pointer' : ''
                  }`}
                  style={{
                    left: mStart.x,
                    top: mStart.y,
                    width: mLength,
                    height: isActive ? 3 : 2,
                    transformOrigin: 'left center',
                    transform: `rotate(${mAngle}deg)`,
                    zIndex: isActive ? 10 : 1,
                  }}
                  onClick={(e) => handleAnnotationClick(e, annotation.id)}
                >
                  <div
                    className={`absolute bg-white text-blue-700 text-xs px-1 rounded border ${
                      isActive ? 'border-amber-500' : 'border-blue-500'
                    }`}
                    style={{
                      left: mLength / 2 - 20,
                      top: -10,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {annotation.measurement?.toFixed(1)} {annotation.unit}
                  </div>
                </div>

                {isActive && !readOnly && onDeleteAnnotation && (
                  <button
                    className='absolute bg-red-500 rounded-full text-white w-6 h-6 flex items-center justify-center'
                    style={{
                      left: mStart.x + mDx / 2 - 12,
                      top: mStart.y + mDy / 2 - 12,
                    }}
                    onClick={(e) => handleAnnotationDelete(e, annotation.id)}
                  >
                    ×
                  </button>
                )}
              </div>
            );

          case 'highlight':
            return (
              <div
                key={annotation.id}
                className={`absolute bg-yellow-200 bg-opacity-50 ${
                  isActive ? 'border-2 border-dashed border-amber-500' : ''
                } ${!readOnly ? 'cursor-move' : ''}`}
                style={{
                  left: annotation.position.x,
                  top: annotation.position.y,
                  width: annotation.size?.width || 100,
                  height: annotation.size?.height || 30,
                  zIndex: isActive ? 10 : 1,
                  opacity: isCurrentlyDragging ? 0.7 : 1,
                }}
                onClick={(e) => handleAnnotationClick(e, annotation.id)}
                onMouseDown={(e) => handleAnnotationDragStart(e, annotation.id)}
              >
                {isActive && !readOnly && onDeleteAnnotation && (
                  <button
                    className='absolute -top-3 -right-3 bg-red-500 rounded-full text-white w-6 h-6 flex items-center justify-center'
                    onClick={(e) => handleAnnotationDelete(e, annotation.id)}
                  >
                    ×
                  </button>
                )}
              </div>
            );

          default:
            return null;
        }
      });
  }, [
    annotations,
    visibleAnnotations,
    activeAnnotationId,
    isDragging,
    draggedAnnotation,
    readOnly,
    onDeleteAnnotation,
    handleAnnotationClick,
    handleAnnotationDelete,
    handleAnnotationDragStart,
  ]);

  // Clean up any timers on unmount
  useEffect(() => {
    return () => {
      if (mouseEventTimerRef.current !== null) {
        window.cancelAnimationFrame(mouseEventTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={annotationLayerRef}
      className='absolute inset-0 z-10 pointer-events-none' // This layer is positioned above the pattern content
      style={{
        transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
        transformOrigin: '0 0',
        width: svgWidth || '100%',
        height: svgHeight || '100%',
      }}
    >
      {/* This is the interaction layer that receives events */}
      <div
        className={`absolute inset-0 ${
          activeToolType && !readOnly
            ? 'pointer-events-auto cursor-crosshair'
            : 'pointer-events-none'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {renderedTempAnnotation}
      </div>

      {/* Layer for existing annotations */}
      <div className='absolute inset-0 pointer-events-auto'>
        {renderedAnnotations}
      </div>

      {/* Optimization stats - for development only */}
      {process.env.NODE_ENV === 'development' && (
        <div className='absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs p-1 rounded pointer-events-none'>
          Visible: {visibleAnnotations.length}/{annotations.length}
          {isDragging && ' (Dragging)'}
        </div>
      )}
    </div>
  );
};

export default AnnotationLayer;
