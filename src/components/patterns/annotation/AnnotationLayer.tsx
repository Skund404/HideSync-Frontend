// src/components/patterns/annotation/AnnotationLayer.tsx
import React, { useEffect, useRef, useState } from 'react';

export interface Annotation {
  id: string;
  type: 'text' | 'arrow' | 'measurement' | 'highlight';
  position: { x: number; y: number };
  content?: string;
  width?: number;
  height?: number;
  angle?: number;
  color: string;
  targetPosition?: { x: number; y: number }; // For arrows
  measurement?: number; // For measurements
  unit?: string; // For measurements
}

interface AnnotationLayerProps {
  annotations: Annotation[];
  onAddAnnotation: (annotation: Omit<Annotation, 'id'>) => void;
  onUpdateAnnotation: (id: string, annotation: Partial<Annotation>) => void;
  onDeleteAnnotation: (id: string) => void;
  activeAnnotationId?: string;
  setActiveAnnotationId: (id?: string) => void;
  activeToolType?: 'text' | 'arrow' | 'measurement' | 'highlight' | null;
  zoom: number;
  position: { x: number; y: number };
  containerRef: React.RefObject<HTMLDivElement>;
  readOnly?: boolean;
}

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
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [tempAnnotation, setTempAnnotation] =
    useState<Partial<Annotation> | null>(null);

  const annotationLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeToolType) {
      setIsCreating(false);
      setTempAnnotation(null);
    }
  }, [activeToolType]);

  // Find screen coordinates relative to the container
  const getRelativeCoordinates = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };

    const rect = containerRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - position.x) / zoom;
    const y = (clientY - rect.top - position.y) / zoom;

    return { x, y };
  };

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly || !activeToolType) return;

    const { x, y } = getRelativeCoordinates(e.clientX, e.clientY);

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
    };

    if (activeToolType === 'arrow' || activeToolType === 'measurement') {
      newAnnotation.targetPosition = { x, y };
    }

    setTempAnnotation(newAnnotation);
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (readOnly || !isCreating || !tempAnnotation || !activeToolType) return;

    const { x, y } = getRelativeCoordinates(e.clientX, e.clientY);

    if (activeToolType === 'arrow' || activeToolType === 'measurement') {
      setTempAnnotation((prev) => ({
        ...prev,
        targetPosition: { x, y },
      }));
    } else if (activeToolType === 'highlight' || activeToolType === 'text') {
      const width = Math.abs(x - dragStart.x);
      const height = Math.abs(y - dragStart.y);
      const position = {
        x: Math.min(dragStart.x, x),
        y: Math.min(dragStart.y, y),
      };

      setTempAnnotation((prev) => ({
        ...prev,
        position,
        width,
        height,
      }));
    }
  };

  // Handle mouse up
  const handleMouseUp = (e: React.MouseEvent) => {
    if (readOnly || !isCreating || !tempAnnotation || !activeToolType) return;

    // Finalize the annotation
    if (activeToolType === 'text') {
      // For text, we need to prompt the user for the content
      const content = prompt('Enter annotation text:');
      if (content) {
        onAddAnnotation({
          ...(tempAnnotation as Omit<Annotation, 'id'>),
          content,
          width: tempAnnotation.width || 100,
          height: tempAnnotation.height || 30,
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
        ...(tempAnnotation as Omit<Annotation, 'id'>),
        measurement: distance,
        unit: unit || 'cm',
      });
    } else {
      // For other annotation types, just add them
      onAddAnnotation(tempAnnotation as Omit<Annotation, 'id'>);
    }

    setIsCreating(false);
    setTempAnnotation(null);
  };

  // Handle annotation click
  const handleAnnotationClick = (e: React.MouseEvent, annotationId: string) => {
    e.stopPropagation();
    if (readOnly) return;

    setActiveAnnotationId(annotationId);
  };

  // Handle annotation drag
  const handleAnnotationDrag = (e: React.MouseEvent, annotationId: string) => {
    e.stopPropagation();
    if (readOnly) return;

    // Implementation for dragging annotations would go here
    // This would update the position of an existing annotation
  };

  // Handle annotation delete
  const handleAnnotationDelete = (
    e: React.MouseEvent,
    annotationId: string
  ) => {
    e.stopPropagation();
    if (readOnly) return;

    if (window.confirm('Are you sure you want to delete this annotation?')) {
      onDeleteAnnotation(annotationId);
    }
  };

  // Render temporary annotation during creation
  const renderTempAnnotation = () => {
    if (!tempAnnotation) return null;

    switch (tempAnnotation.type) {
      case 'text':
        return (
          <div
            className='absolute border-2 border-dashed border-black bg-white bg-opacity-50'
            style={{
              left: tempAnnotation.position?.x,
              top: tempAnnotation.position?.y,
              width: tempAnnotation.width || 0,
              height: tempAnnotation.height || 0,
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
              }}
            />
            <div
              className='absolute bg-white text-blue-700 text-xs px-1 rounded border border-blue-500'
              style={{
                left: mStart.x + mDx / 2 - 20,
                top: mStart.y + mDy / 2 - 10,
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
              width: tempAnnotation.width || 0,
              height: tempAnnotation.height || 0,
            }}
          />
        );

      default:
        return null;
    }
  };

  // Render existing annotations
  const renderAnnotations = () => {
    return annotations.map((annotation) => {
      const isActive = activeAnnotationId === annotation.id;

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
                width: annotation.width,
                minHeight: annotation.height,
                zIndex: isActive ? 10 : 1,
              }}
              onClick={(e) => handleAnnotationClick(e, annotation.id)}
            >
              <div className='text-sm'>{annotation.content}</div>

              {isActive && !readOnly && (
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

              {isActive && !readOnly && (
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

              {isActive && !readOnly && (
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
                width: annotation.width,
                height: annotation.height,
                zIndex: isActive ? 10 : 1,
              }}
              onClick={(e) => handleAnnotationClick(e, annotation.id)}
            >
              {isActive && !readOnly && (
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
  };

  return (
    <div
      ref={annotationLayerRef}
      className='absolute inset-0 z-10 pointer-events-none' // This layer is positioned above the pattern content
      style={{
        transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
        transformOrigin: '0 0',
      }}
    >
      {/* This is the interaction layer that receives events */}
      <div
        className={`absolute inset-0 ${
          activeToolType
            ? 'pointer-events-auto cursor-crosshair'
            : 'pointer-events-none'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {renderTempAnnotation()}
      </div>

      {/* Layer for existing annotations */}
      <div className='absolute inset-0 pointer-events-auto'>
        {renderAnnotations()}
      </div>
    </div>
  );
};

export default AnnotationLayer;
