// src/components/patterns/print/PatternPrintDialog.tsx
import React, { useState, useEffect } from 'react';
import { 
  PrintOptions, 
  printPattern, 
  generatePrintablePattern,
  getDefaultPrintSettings
} from '../../../services/pattern-print-service';
import { showSuccess, showError } from '../../../services/notification-service';
import { handleApiError } from '../../../services/error-handler';

interface PatternPrintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patternId: number;
  patternName: string;
  fileType: string;
}

const PatternPrintDialog: React.FC<PatternPrintDialogProps> = ({
  isOpen,
  onClose,
  patternId,
  patternName,
  fileType,
}) => {
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    paperSize: 'letter',
    orientation: 'portrait',
    scale: 100,
    margins: 0.5,
    includeMetadata: true,
    fitToPage: true,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingDefaults, setIsLoadingDefaults] = useState(true);

  // Load default print settings when dialog opens
  useEffect(() => {
    const loadDefaultSettings = async () => {
      if (!isOpen) return;
      
      try {
        setIsLoadingDefaults(true);
        const defaultSettings = await getDefaultPrintSettings(patternId);
        setPrintOptions(defaultSettings);
      } catch (err) {
        // If we can't load defaults, we'll use the initial state values
        console.warn('Could not load default print settings:', err);
      } finally {
        setIsLoadingDefaults(false);
      }
    };

    loadDefaultSettings();
  }, [isOpen, patternId]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setPrintOptions((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === 'scale' || name === 'margins') {
      setPrintOptions((prev) => ({
        ...prev,
        [name]: parseFloat(value),
      }));
    } else {
      setPrintOptions((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Generate the printable pattern using our service
      const printableFileUrl = await generatePrintablePattern(patternId, printOptions);
      
      // Open the printable file in a new window/tab
      const printWindow = window.open(printableFileUrl, '_blank');
      
      if (printWindow) {
        // Add event listener to trigger print dialog when the content loads
        printWindow.addEventListener('load', () => {
          // Short delay to ensure content is fully rendered
          setTimeout(() => {
            printWindow.print();
          }, 500);
        });
        
        showSuccess('Pattern print preview generated successfully');
      } else {
        throw new Error('Unable to open print window. Please check your popup blocker settings.');
      }
      
      // Close the dialog
      onClose();
    } catch (err) {
      const errorMessage = handleApiError(err, 'Failed to generate printable pattern');
      setError(`Print error: ${errorMessage}`);
      showError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDirectPrint = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      // Use the print service to send directly to printer
      await printPattern(patternId, printOptions);
      showSuccess('Print job sent to printer');
      
      onClose();
    } catch (err) {
      const errorMessage = handleApiError(err, 'Failed to print pattern');
      setError(`Print error: ${errorMessage}`);
      showError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-stone-800 bg-opacity-75 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-lg max-w-md w-full'>
        {/* Print Dialog Header */}
        <div className='border-b border-stone-200 px-6 py-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-medium text-stone-900'>
              Print Pattern
            </h2>
            <button
              onClick={onClose}
              className='text-stone-400 hover:text-stone-500'
              aria-label='Close'
              disabled={isGenerating || isLoadingDefaults}
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
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Print Dialog Content */}
        <form onSubmit={handleSubmit}>
          <div className='px-6 py-4'>
            <div className='mb-4'>
              <p className='text-sm text-stone-500'>
                You are about to print:{' '}
                <span className='font-medium text-stone-700'>
                  {patternName}
                </span>{' '}
                ({fileType})
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            {isLoadingDefaults && (
              <div className="mb-4 flex items-center justify-center py-4">
                <svg className="animate-spin h-6 w-6 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-2 text-sm text-stone-600">Loading print settings...</span>
              </div>
            )}

            {!isLoadingDefaults && (
              <div className='space-y-4'>
                {/* Paper Size */}
                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Paper Size
                  </label>
                  <select
                    name='paperSize'
                    value={printOptions.paperSize}
                    onChange={handleChange}
                    className='w-full border border-stone-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500'
                    disabled={isGenerating}
                  >
                    <option value='letter'>Letter (8.5" x 11")</option>
                    <option value='a4'>A4 (210mm x 297mm)</option>
                    <option value='legal'>Legal (8.5" x 14")</option>
                    <option value='tabloid'>Tabloid (11" x 17")</option>
                  </select>
                </div>

                {/* Orientation */}
                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Orientation
                  </label>
                  <div className='flex space-x-4'>
                    <label className='flex items-center'>
                      <input
                        type='radio'
                        name='orientation'
                        value='portrait'
                        checked={printOptions.orientation === 'portrait'}
                        onChange={handleChange}
                        className='h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300'
                        disabled={isGenerating}
                      />
                      <span className='ml-2 text-sm text-stone-700'>
                        Portrait
                      </span>
                    </label>
                    <label className='flex items-center'>
                      <input
                        type='radio'
                        name='orientation'
                        value='landscape'
                        checked={printOptions.orientation === 'landscape'}
                        onChange={handleChange}
                        className='h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300'
                        disabled={isGenerating}
                      />
                      <span className='ml-2 text-sm text-stone-700'>
                        Landscape
                      </span>
                    </label>
                  </div>
                </div>

                {/* Scale */}
                <div>
                  <div className='flex justify-between mb-1'>
                    <label className='block text-sm font-medium text-stone-700'>
                      Scale {printOptions.scale}%
                    </label>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        name='fitToPage'
                        checked={printOptions.fitToPage}
                        onChange={handleChange}
                        className='h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300 rounded'
                        disabled={isGenerating}
                      />
                      <span className='ml-2 text-sm text-stone-700'>
                        Fit to page
                      </span>
                    </label>
                  </div>
                  <input
                    type='range'
                    name='scale'
                    min='25'
                    max='200'
                    step='5'
                    value={printOptions.scale}
                    onChange={handleChange}
                    disabled={printOptions.fitToPage || isGenerating}
                    className='w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer'
                  />
                  <div className='flex justify-between text-xs text-stone-500 mt-1'>
                    <span>25%</span>
                    <span>100%</span>
                    <span>200%</span>
                  </div>
                </div>

                {/* Margins */}
                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Margins {printOptions.margins}"
                  </label>
                  <input
                    type='range'
                    name='margins'
                    min='0'
                    max='2'
                    step='0.25'
                    value={printOptions.margins}
                    onChange={handleChange}
                    className='w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer'
                    disabled={isGenerating}
                  />
                  <div className='flex justify-between text-xs text-stone-500 mt-1'>
                    <span>0"</span>
                    <span>1"</span>
                    <span>2"</span>
                  </div>
                </div>

                {/* Include Metadata */}
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    name='includeMetadata'
                    checked={printOptions.includeMetadata}
                    onChange={handleChange}
                    className='h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300 rounded'
                    disabled={isGenerating}
                  />
                  <label className='ml-2 block text-sm text-stone-700'>
                    Include pattern name, author, and date
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Print Dialog Footer */}
          <div className='bg-stone-50 px-6 py-4 flex justify-end space-x-2 rounded-b-lg border-t border-stone-200'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 border border-stone-300 rounded-md shadow-sm text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
              disabled={isGenerating || isLoadingDefaults}
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={handleDirectPrint}
              className='px-4 py-2 border border-stone-300 rounded-md shadow-sm text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 flex items-center'
              disabled={isGenerating || isLoadingDefaults}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-stone-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 mr-2'
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
                  Direct Print
                </>
              )}
            </button>
            <button
              type='submit'
              className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 flex items-center'
              disabled={isGenerating || isLoadingDefaults}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 mr-2'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                    />
                  </svg>
                  Preview & Print
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatternPrintDialog;