// src/components/patterns/print/PatternPrintDialog.tsx
import React, { useState } from 'react';

interface PatternPrintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: (options: PrintOptions) => void;
  patternName: string;
  fileType: string;
}

export interface PrintOptions {
  paperSize: 'letter' | 'a4' | 'legal' | 'tabloid';
  orientation: 'portrait' | 'landscape';
  scale: number;
  margins: number;
  includeMetadata: boolean;
  fitToPage: boolean;
}

const PatternPrintDialog: React.FC<PatternPrintDialogProps> = ({
  isOpen,
  onClose,
  onPrint,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPrint(printOptions);
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
                  disabled={printOptions.fitToPage}
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
                />
                <label className='ml-2 block text-sm text-stone-700'>
                  Include pattern name, author, and date
                </label>
              </div>
            </div>
          </div>

          {/* Print Dialog Footer */}
          <div className='bg-stone-50 px-6 py-4 flex justify-end space-x-2 rounded-b-lg border-t border-stone-200'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 border border-stone-300 rounded-md shadow-sm text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 flex items-center'
            >
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
              Print
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatternPrintDialog;
