// src/pages/PatternFormPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePatterns } from '../hooks/usePatterns';
import { uploadPatternFile, uploadThumbnail, deleteFile } from '../services/file-upload-service';
import { showSuccess, showError } from '../services/notification-service';
import { handleApiError } from '../services/error-handler';
import { Pattern, PatternFileType } from '../types/patternTypes';
import { EnumTypes } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ErrorBoundary from '../components/common/ErrorBoundary';

const PatternFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const {
    getPatternById,
    addPattern,
    updatePattern,
    loading,
    error,
  } = usePatterns();

  // Form state
  const [formData, setFormData] = useState<Omit<Pattern, 'id'>>({
    name: '',
    description: '',
    skillLevel: EnumTypes.SkillLevel.INTERMEDIATE,
    fileType: PatternFileType.SVG,
    filePath: '',
    thumbnail: '',
    tags: [],
    isFavorite: false,
    projectType: EnumTypes.ProjectType.WALLET,
    estimatedTime: undefined,
    estimatedDifficulty: undefined,
    authorName: '',
    isPublic: true,
    version: '1.0',
    createdAt: new Date(),
    modifiedAt: new Date(),
    notes: ''
  });

  // File upload states
  const [patternFile, setPatternFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<{
    pattern: number;
    thumbnail: number;
  }>({
    pattern: 0,
    thumbnail: 0,
  });

  // Preview states
  const [patternPreview, setPatternPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // Form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);

  // Refs for file inputs
  const patternFileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);
  
  // Keep track of tempId for optimistic updates
  const [tempId, setTempId] = useState<string | null>(null);

  // Load pattern data if in edit mode
  useEffect(() => {
    const loadPatternData = async () => {
      if (isEditMode && id) {
        try {
          setIsLoading(true);
          const pattern = await getPatternById(parseInt(id, 10));

          if (pattern) {
            setFormData({
              name: pattern.name,
              description: pattern.description,
              skillLevel: pattern.skillLevel,
              fileType: pattern.fileType,
              filePath: pattern.filePath,
              thumbnail: pattern.thumbnail,
              tags: [...pattern.tags],
              isFavorite: pattern.isFavorite,
              projectType: pattern.projectType,
              estimatedTime: pattern.estimatedTime,
              estimatedDifficulty: pattern.estimatedDifficulty,
              authorName: pattern.authorName,
              isPublic: pattern.isPublic,
              version: pattern.version,
              createdAt: new Date(pattern.createdAt),
              modifiedAt: new Date(),
              notes: pattern.notes || ''
            });

            // Set preview URLs for existing files
            if (pattern.thumbnail) {
              setThumbnailPreview(pattern.thumbnail);
            }
          } else {
            setSubmitError(`Pattern with ID ${id} not found`);
          }
        } catch (err) {
          setSubmitError(
            `Error loading pattern: ${
              err instanceof Error ? err.message : String(err)
            }`
          );
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPatternData();
  }, [id, isEditMode, getPatternById]);

  // Handle form input changes with proper types
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    // Handle different input types
    if (type === 'number') {
      const numberValue = value === '' ? undefined : parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: numberValue }));
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'fileType') {
      // Explicitly cast to PatternFileType to satisfy the type checker
      setFormData(prev => ({
        ...prev,
        fileType: value as PatternFileType,
        // Clear file path if file type changes and no pattern file is present
        ...(patternFile ? {} : { filePath: '' })
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle pattern file selection
  const handlePatternFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const validExtensions: Record<PatternFileType, string[]> = {
        [PatternFileType.SVG]: ['svg'],
        [PatternFileType.PDF]: ['pdf'],
        [PatternFileType.IMAGE]: ['jpg', 'jpeg', 'png', 'gif', 'webp']
      };

      const currentType = formData.fileType;

      if (!validExtensions[currentType].includes(fileExt)) {
        setFormErrors(prev => ({
          ...prev,
          patternFile: `Invalid file type. Expected ${validExtensions[currentType].join(
            ', '
          )}`
        }));
        e.target.value = '';
        return;
      }

      setPatternFile(file);
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.patternFile;
        delete newErrors.filePath;
        return newErrors;
      });

      // Create preview for image files
      if (currentType === PatternFileType.IMAGE) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPatternPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPatternPreview(null);
      }
    }
  };

  // Handle thumbnail file selection
  const handleThumbnailFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type (only images)
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

      if (!validExtensions.includes(fileExt)) {
        setFormErrors(prev => ({
          ...prev,
          thumbnailFile: `Invalid thumbnail format. Expected ${validExtensions.join(
            ', '
          )}`
        }));
        e.target.value = '';
        return;
      }

      setThumbnailFile(file);
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.thumbnailFile;
        delete newErrors.thumbnail;
        return newErrors;
      });

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add a new tag to the pattern
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // Remove a tag from the pattern
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove)
    }));
  };

  // Enhanced error handling for file uploads
  const uploadPatternFiles = async () => {
    const uploadResults = { filePath: '', thumbnail: '' };
    
    if (patternFile) {
      try {
        uploadResults.filePath = await uploadPatternFile(
          patternFile,
          isEditMode && id ? parseInt(id, 10) : -1
        );
        setUploadProgress(prev => ({ ...prev, pattern: 100 }));
      } catch (error) {
        // If we're already uploading a thumbnail, clean up any potential orphaned files
        if (isUploading && thumbnailFile) {
          try {
            await deleteFile(uploadResults.filePath);
          } catch (cleanupError) {
            console.error('Failed to clean up pattern file after error', cleanupError);
          }
        }
        
        const errorMessage = handleApiError(error, 'Failed to upload pattern file');
        throw new Error(errorMessage);
      }
    }
    
    if (thumbnailFile) {
      try {
        uploadResults.thumbnail = await uploadThumbnail(
          thumbnailFile,
          isEditMode && id ? parseInt(id, 10) : -1
        );
        setUploadProgress(prev => ({ ...prev, thumbnail: 100 }));
      } catch (error) {
        // If pattern file upload succeeded but thumbnail failed,
        // clean up the pattern file to avoid orphaned files
        if (uploadResults.filePath) {
          try {
            await deleteFile(uploadResults.filePath);
          } catch (cleanupError) {
            console.error('Failed to clean up pattern file after thumbnail upload error', cleanupError);
          }
        }
        
        const errorMessage = handleApiError(error, 'Failed to upload thumbnail');
        throw new Error(errorMessage);
      }
    }
    
    return uploadResults;
  };

  // Optimistic updates helper functions
  const addPatternOptimistically = (optimisticPattern: Pattern) => {
    // In a real app, this would update the global patterns state
    // For this example, we'll just log it
    console.log('Adding pattern optimistically:', optimisticPattern);
    setTempId(optimisticPattern.id.toString());
    
    // In a real app with a global state provider, you would do something like:
    // dispatch({ type: 'ADD_PATTERN', payload: optimisticPattern });
  };
  
  const replaceOptimisticPattern = (tempId: string, newPattern: Pattern) => {
    // In a real app, this would update the global patterns state
    console.log('Replacing optimistic pattern:', tempId, 'with', newPattern);
    setTempId(null);
    
    // In a real app with a global state provider, you would do something like:
    // dispatch({ type: 'REPLACE_PATTERN', payload: { tempId, pattern: newPattern } });
  };
  
  const removeOptimisticPattern = (tempId: string) => {
    // In a real app, this would update the global patterns state
    console.log('Removing optimistic pattern:', tempId);
    setTempId(null);
    
    // In a real app with a global state provider, you would do something like:
    // dispatch({ type: 'REMOVE_PATTERN', payload: tempId });
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Pattern name is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!formData.filePath && !patternFile) {
      errors.patternFile = 'Pattern file is required';
    }

    if (!formData.thumbnail && !thumbnailFile) {
      errors.thumbnailFile = 'Thumbnail is required';
    }

    if (!formData.authorName.trim()) {
      errors.authorName = 'Author name is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return false;
    }
    
    return true;
  };

  // Handle create pattern with optimistic updates
  const handleCreatePattern = async () => {
    // Validate form first
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Create a temporary ID for optimistic updates
      const tempId = `temp-${Date.now()}`;
      
      // Create an optimistic pattern
      const optimisticPattern: Pattern = {
        ...formData,
        id: tempId as any, // Will be replaced with actual ID
        filePath: patternFile ? URL.createObjectURL(patternFile) : formData.filePath,
        thumbnail: thumbnailFile ? URL.createObjectURL(thumbnailFile) : formData.thumbnail,
        createdAt: new Date(),
        modifiedAt: new Date()
      };
      
      // Add to patterns list optimistically
      addPatternOptimistically(optimisticPattern);
      
      // Show uploading state
      setIsUploading(true);
      
      // Perform actual API call
      const uploadedFiles = await uploadPatternFiles();
      
      // Create new pattern with uploaded files
      const newPattern = await addPattern({
        ...formData,
        filePath: uploadedFiles.filePath || formData.filePath,
        thumbnail: uploadedFiles.thumbnail || formData.thumbnail
      });
      
      // Replace optimistic pattern with real one
      replaceOptimisticPattern(tempId, newPattern);
      
      // Show success message
      showSuccess('Pattern created successfully');
      
      // Navigate to the new pattern
      navigate(`/patterns/${newPattern.id}`);
    } catch (error) {
      // Show error and remove optimistic pattern
      const errorMessage = handleApiError(error, 'Failed to create pattern');
      showError(errorMessage);
      
      if (tempId) {
        removeOptimisticPattern(tempId);
      }
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
      setUploadProgress({ pattern: 0, thumbnail: 0 });
    }
  };

  // Handle update pattern
  const handleUpdatePattern = async () => {
    // Validate form first
    if (!validateForm()) return;
    
    if (!id) {
      showError('Cannot update: Pattern ID is missing');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const patternId = parseInt(id, 10);
      
      // Create optimistic update
      const optimisticPattern: Pattern = {
        ...formData,
        id: patternId,
        filePath: patternFile ? URL.createObjectURL(patternFile) : formData.filePath,
        thumbnail: thumbnailFile ? URL.createObjectURL(thumbnailFile) : formData.thumbnail,
        modifiedAt: new Date()
      } as Pattern;
      
      // Apply optimistic update
      addPatternOptimistically(optimisticPattern);
      
      // Show uploading state
      setIsUploading(true);
      
      // Upload new files if provided
      const uploadedFiles = await uploadPatternFiles();
      
      // Update pattern
      const updatedPattern = await updatePattern(patternId, {
        ...formData,
        filePath: uploadedFiles.filePath || formData.filePath,
        thumbnail: uploadedFiles.thumbnail || formData.thumbnail,
        modifiedAt: new Date()
      });
      
      // Replace optimistic pattern with real one
      replaceOptimisticPattern(patternId.toString(), updatedPattern);
      
      // Show success message
      showSuccess('Pattern updated successfully');
      
      // Navigate to the pattern detail page
      navigate(`/patterns/${updatedPattern.id}`);
    } catch (error) {
      // Show error and revert optimistic update
      const errorMessage = handleApiError(error, 'Failed to update pattern');
      showError(errorMessage);
      
      if (id) {
        removeOptimisticPattern(id);
      }
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
      setUploadProgress({ pattern: 0, thumbnail: 0 });
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode) {
      handleUpdatePattern();
    } else {
      handleCreatePattern();
    }
  };

  // Trigger file input click for pattern file
  const triggerPatternFileInput = () => {
    patternFileInputRef.current?.click();
  };

  // Trigger file input click for thumbnail
  const triggerThumbnailFileInput = () => {
    thumbnailFileInputRef.current?.click();
  };

  // Render loading spinner if data is loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <LoadingSpinner
          size="large"
          color="amber"
          message={`${isEditMode ? 'Loading' : 'Creating'} pattern...`}
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-stone-50 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header Section */}
          <div className="bg-amber-600 px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold text-white">
                {isEditMode ? 'Edit Pattern' : 'Create New Pattern'}
              </h1>
              <button
                onClick={() => navigate(-1)}
                className="text-white hover:text-amber-200"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6">
            {submitError && (
              <div className="mb-6">
                <ErrorMessage message={submitError} />
              </div>
            )}

            {/* Basic Information Section */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-stone-900 mb-4">
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pattern Name */}
                <div className="col-span-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-stone-700 mb-1"
                  >
                    Pattern Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full border ${
                      formErrors.name
                        ? 'border-red-500'
                        : 'border-stone-300'
                    } rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                    required
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-stone-700 mb-1"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full border ${
                      formErrors.description
                        ? 'border-red-500'
                        : 'border-stone-300'
                    } rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                    required
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.description}
                    </p>
                  )}
                </div>

                {/* File Type */}
                <div>
                  <label
                    htmlFor="fileType"
                    className="block text-sm font-medium text-stone-700 mb-1"
                  >
                    File Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="fileType"
                    name="fileType"
                    value={formData.fileType}
                    onChange={handleInputChange}
                    className="w-full border border-stone-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                    required
                  >
                    {Object.values(PatternFileType).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Skill Level */}
                <div>
                  <label
                    htmlFor="skillLevel"
                    className="block text-sm font-medium text-stone-700 mb-1"
                  >
                    Skill Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="skillLevel"
                    name="skillLevel"
                    value={formData.skillLevel}
                    onChange={handleInputChange}
                    className="w-full border border-stone-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                    required
                  >
                    {Object.values(EnumTypes.SkillLevel).map((level) => (
                      <option key={level} value={level}>
                        {level
                          .toString()
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Project Type */}
                <div>
                  <label
                    htmlFor="projectType"
                    className="block text-sm font-medium text-stone-700 mb-1"
                  >
                    Project Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="projectType"
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleInputChange}
                    className="w-full border border-stone-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                    required
                  >
                    {Object.values(EnumTypes.ProjectType).map((type) => (
                      <option key={type} value={type}>
                        {type
                          .toString()
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Author Name */}
                <div>
                  <label
                    htmlFor="authorName"
                    className="block text-sm font-medium text-stone-700 mb-1"
                  >
                    Author Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="authorName"
                    name="authorName"
                    value={formData.authorName}
                    onChange={handleInputChange}
                    className={`w-full border ${
                      formErrors.authorName
                        ? 'border-red-500'
                        : 'border-stone-300'
                    } rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                    required
                  />
                  {formErrors.authorName && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.authorName}
                    </p>
                  )}
                </div>

                {/* Version */}
                <div>
                  <label
                    htmlFor="version"
                    className="block text-sm font-medium text-stone-700 mb-1"
                  >
                    Version <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="version"
                    name="version"
                    value={formData.version}
                    onChange={handleInputChange}
                    className="w-full border border-stone-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Pattern File Upload */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Pattern File <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    ref={patternFileInputRef}
                    onChange={handlePatternFileChange}
                    className="hidden"
                    accept={
                      formData.fileType === PatternFileType.SVG
                        ? '.svg'
                        : formData.fileType === PatternFileType.PDF
                        ? '.pdf'
                        : '.jpg,.jpeg,.png,.gif,.webp'
                    }
                  />
                  <div
                    className={`border-2 border-dashed rounded-md p-4 text-center ${
                      formErrors.patternFile
                        ? 'border-red-500'
                        : 'border-stone-300'
                    } hover:border-amber-500 cursor-pointer transition-colors duration-200`}
                    onClick={triggerPatternFileInput}
                  >
                    {patternFile || formData.filePath ? (
                      <div className="flex flex-col items-center">
                        {formData.fileType === PatternFileType.IMAGE &&
                        (patternPreview || formData.filePath) ? (
                          <img
                            src={patternPreview || formData.filePath}
                            alt="Pattern preview"
                            className="max-h-40 max-w-full mb-2 object-contain"
                          />
                        ) : (
                          <div className="w-12 h-12 mb-2 flex items-center justify-center bg-amber-100 rounded-full">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 text-amber-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                        <p className="text-sm text-stone-700">
                          {patternFile
                            ? patternFile.name
                            : formData.filePath.split('/').pop() ||
                              'Current file'}
                        </p>
                        <p className="text-xs text-stone-500">
                          Click to change file
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10 text-stone-400 mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="text-sm text-stone-700">
                          Click to upload or drop a file here
                        </p>
                        <p className="text-xs text-stone-500">
                          {formData.fileType === PatternFileType.SVG
                            ? 'SVG files only'
                            : formData.fileType === PatternFileType.PDF
                            ? 'PDF files only'
                            : 'JPG, PNG, GIF or WebP'}
                        </p>
                      </div>
                    )}
                  </div>
                  {formErrors.patternFile && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.patternFile}
                    </p>
                  )}
                  {isUploading && patternFile && (
                    <div className="mt-2">
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-stone-200">
                          <div
                            style={{ width: `${uploadProgress.pattern}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500 transition-all duration-500"
                          />
                        </div>
                        <p className="text-xs text-stone-500 mt-1">
                          Uploading: {uploadProgress.pattern}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Thumbnail Upload */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Thumbnail <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    ref={thumbnailFileInputRef}
                    onChange={handleThumbnailFileChange}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                  />
                  <div
                    className={`border-2 border-dashed rounded-md p-4 text-center ${
                      formErrors.thumbnailFile
                        ? 'border-red-500'
                        : 'border-stone-300'
                    } hover:border-amber-500 cursor-pointer transition-colors duration-200`}
                    onClick={triggerThumbnailFileInput}
                  >
                    {thumbnailFile || formData.thumbnail ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={thumbnailPreview || formData.thumbnail}
                          alt="Thumbnail preview"
                          className="max-h-40 max-w-full mb-2 object-contain"
                        />
                        <p className="text-sm text-stone-700">
                          {thumbnailFile
                            ? thumbnailFile.name
                            : formData.thumbnail.split('/').pop() ||
                              'Current thumbnail'}
                        </p>
                        <p className="text-xs text-stone-500">
                          Click to change image
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10 text-stone-400 mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-sm text-stone-700">
                          Click to upload a thumbnail image
                        </p>
                        <p className="text-xs text-stone-500">
                          JPG, PNG, GIF or WebP
                        </p>
                      </div>
                    )}
                  </div>
                  {formErrors.thumbnailFile && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.thumbnailFile}
                    </p>
                  )}
                  {isUploading && thumbnailFile && (
                    <div className="mt-2">
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-stone-200">
                          <div
                            style={{ width: `${uploadProgress.thumbnail}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500 transition-all duration-500"
                          />
                        </div>
                        <p className="text-xs text-stone-500 mt-1">
                          Uploading: {uploadProgress.thumbnail}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Details Section */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-stone-900 mb-4">
                Additional Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Estimated Time */}
                <div>
                  <label
                    htmlFor="estimatedTime"
                    className="block text-sm font-medium text-stone-700 mb-1"
                  >
                    Estimated Time (hours)
                  </label>
                  <input
                    type="number"
                    id="estimatedTime"
                    name="estimatedTime"
                    value={formData.estimatedTime || ''}
                    onChange={handleInputChange}
                    min="0"
                    step="0.5"
                    className="w-full border border-stone-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                {/* Estimated Difficulty */}
                <div>
                  <label
                    htmlFor="estimatedDifficulty"
                    className="block text-sm font-medium text-stone-700 mb-1"
                  >
                    Difficulty (1-10)
                  </label>
                  <input
                    type="number"
                    id="estimatedDifficulty"
                    name="estimatedDifficulty"
                    value={formData.estimatedDifficulty || ''}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    className="w-full border border-stone-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                {/* Public/Private */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300 rounded"
                  />
                  <label
                    htmlFor="isPublic"
                    className="ml-2 block text-sm text-stone-700"
                  >
                    Make this pattern public
                  </label>
                </div>

                {/* Favorite */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFavorite"
                    name="isFavorite"
                    checked={formData.isFavorite}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300 rounded"
                  />
                  <label
                    htmlFor="isFavorite"
                    className="ml-2 block text-sm text-stone-700"
                  >
                    Add to favorites
                  </label>
                </div>

                {/* Notes */}
                <div className="col-span-2">
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-stone-700 mb-1"
                  >
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-stone-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Tags Section */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-stone-900 mb-4">
                Tags
              </h2>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-1 border border-stone-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors duration-200"
                  disabled={!tagInput.trim()}
                >
                  Add Tag
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <div
                    key={tag}
                    className="inline-flex items-center bg-stone-100 rounded-md px-3 py-1 text-sm text-stone-700"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-stone-500 hover:text-stone-700 transition-colors duration-200"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
                {formData.tags.length === 0 && (
                  <p className="text-sm text-stone-500">
                    No tags added yet
                  </p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-stone-300 text-stone-700 rounded-md hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                disabled={isSubmitting || isUploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 flex items-center transition-colors duration-200"
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting || isUploading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>{isEditMode ? 'Update Pattern' : 'Create Pattern'}</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default PatternFormPage;