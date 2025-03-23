// src/components/patterns/detail/PatternActions.tsx
import React, { useState } from 'react';
import { Pattern } from '../../../types/patternTypes';
import { 
  exportPattern, 
  generateDownloadUrl, 
  generateShareableLink,
  ExportOptions 
} from '../../../services/pattern-export-service';
import { showSuccess, showError } from '../../../services/notification-service';
import { handleApiError } from '../../../services/error-handler';
import { getPatternFile } from '../../../services/file-upload-service';
import PatternPrintDialog from '../print/PatternPrintDialog';

interface PatternActionsProps {
  pattern: Pattern;
  onToggleFavorite: () => void;
}

const PatternActions: React.FC<PatternActionsProps> = ({
  pattern,
  onToggleFavorite,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handlePrint = () => {
    setShowPrintDialog(true);
    setShowMenu(false);
  };

  const handleDownload = async () => {
    try {
      const blob = await getPatternFile<Blob>(pattern.filePath, 'blob');
      const url = URL.createObjectURL(blob);
      
      // Create a download link
      const a = document.createElement('a');
      a.href = url;
      a.download = pattern.name + '.' + pattern.fileType.toLowerCase();
      
      // Trigger download and clean up
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showSuccess('Pattern downloaded successfully');
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to download pattern');
      showError(`Download error: ${errorMessage}`);
    }
    
    setShowMenu(false);
  };

  const handleExport = async (format: 'pdf' | 'svg' | 'dxf' | 'image' = 'pdf') => {
    try {
      setIsExporting(true);
      
      // Configure export options
      const options: ExportOptions = {
        format,
        includeMetadata: true,
        includeNotes: true,
        includeAnnotations: true,
        quality: 'high'
      };
      
      // Export the pattern
      const blob = await exportPattern(pattern.id, options);
      
      // Generate a filename
      const extension = format === 'image' ? 'png' : format;
      const filename = `${pattern.name}_export.${extension}`;
      
      // Create a download URL and trigger download
      const url = generateDownloadUrl(blob, filename);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showSuccess(`Pattern exported as ${format.toUpperCase()} successfully`);
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to export pattern');
      showError(`Export error: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
    
    setShowMenu(false);
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);
      
      // Generate a shareable link
      const url = await generateShareableLink(pattern.id, 7); // Link expires in 7 days
      
      // Copy to clipboard
      await navigator.clipboard.writeText(url);
      
      showSuccess('Shareable link copied to clipboard! The link will expire in 7 days.');
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to generate shareable link');
      showError(`Sharing error: ${errorMessage}`);
    } finally {
      setIsSharing(false);
    }
    
    setShowMenu(false);
  };

  const handleDelete = async () => {
    // This would usually involve a confirmation dialog
    if (window.confirm(`Are you sure you want to delete "${pattern.name}"?`)) {
      try {
        // In a real implementation, this would call a service method to delete the pattern
        // And then navigate away from this page
        console.log('Deleting pattern:', pattern.id);
        showSuccess('Pattern deleted successfully');
      } catch (error) {
        const errorMessage = handleApiError(error, 'Failed to delete pattern');
        showError(`Deletion error: ${errorMessage}`);
      }
    }
    
    setShowMenu(false);
  };

  return (
    <div className='flex items-center space-x-2'>
      {/* Print Button */}
      <button
        className='text-stone-500 hover:text-stone-700 p-2 rounded-md hover:bg-stone-100'
        aria-label='Print pattern'
        onClick={handlePrint}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-5 w-5'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z'
          />
        </svg>
      </button>

      {/* Download Button */}
      <button
        className='text-stone-500 hover:text-stone-700 p-2 rounded-md hover:bg-stone-100'
        aria-label='Download pattern'
        onClick={handleDownload}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-5 w-5'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
          />
        </svg>
      </button>

      {/* Favorite Button */}
      <button
        className={`${
          pattern.isFavorite
            ? 'text-amber-500'
            : 'text-stone-500 hover:text-stone-700'
        } p-2 rounded-md hover:bg-stone-100`}
        aria-label={
          pattern.isFavorite ? 'Remove from favorites' : 'Add to favorites'
        }
        onClick={onToggleFavorite}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-5 w-5'
          fill={pattern.isFavorite ? 'currentColor' : 'none'}
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
          />
        </svg>
      </button>

      {/* Share Button */}
      <button
        className='text-stone-500 hover:text-stone-700 p-2 rounded-md hover:bg-stone-100'
        aria-label='Share pattern'
        onClick={handleShare}
        disabled={isSharing}
      >
        {isSharing ? (
          <svg className="animate-spin h-5 w-5 text-stone-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z'
            />
          </svg>
        )}
      </button>

      {/* More Actions Button with Dropdown */}
      <div className='relative'>
        <button
          className='text-stone-500 hover:text-stone-700 p-2 rounded-md hover:bg-stone-100'
          aria-label='More options'
          onClick={toggleMenu}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z'
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-stone-200'>
            <div className='py-1'>
              <div className="py-1">
                <button
                  className='flex items-center w-full px-4 py-2 text-sm text-stone-700 hover:bg-stone-100'
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 mr-2 text-stone-500'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4'
                    />
                  </svg>
                  {isExporting ? 'Exporting...' : 'Export as PDF'}
                </button>

                <button
                  className='flex items-center w-full px-4 py-2 text-sm text-stone-700 hover:bg-stone-100'
                  onClick={() => handleExport('svg')}
                  disabled={isExporting}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 mr-2 text-stone-500'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4'
                    />
                  </svg>
                  {isExporting ? 'Exporting...' : 'Export as SVG'}
                </button>

                <button
                  className='flex items-center w-full px-4 py-2 text-sm text-stone-700 hover:bg-stone-100'
                  onClick={() => handleExport('dxf')}
                  disabled={isExporting}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 mr-2 text-stone-500'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4'
                    />
                  </svg>
                  {isExporting ? 'Exporting...' : 'Export as DXF'}
                </button>
              </div>

              <hr className='my-1 border-stone-200' />

              <button
                className='flex items-center w-full px-4 py-2 text-sm text-stone-700 hover:bg-stone-100'
                onClick={() => console.log('Create project from pattern')}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4 mr-2 text-stone-500'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                  />
                </svg>
                Create Project
              </button>

              <button
                className='flex items-center w-full px-4 py-2 text-sm text-stone-700 hover:bg-stone-100'
                onClick={() => console.log('Duplicate pattern')}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4 mr-2 text-stone-500'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                  />
                </svg>
                Duplicate
              </button>

              <hr className='my-1 border-stone-200' />

              <button
                className='flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-stone-100'
                onClick={handleDelete}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4 mr-2 text-red-500'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                  />
                </svg>
                Delete Pattern
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Print Dialog */}
      {showPrintDialog && (
        <PatternPrintDialog
          isOpen={showPrintDialog}
          onClose={() => setShowPrintDialog(false)}
          patternId={pattern.id}
          patternName={pattern.name}
          fileType={pattern.fileType}
        />
      )}
    </div>
  );
};

export default PatternActions;