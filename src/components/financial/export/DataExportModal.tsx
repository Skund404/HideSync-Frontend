// src/components/financial/export/DataExportModal.tsx
import {
  Calendar,
  Check,
  ChevronDown,
  File,
  FileSpreadsheet,
  FileText,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useFinancial } from '../../../context/FinancialContext';
import { TimeFrame } from '../../../types/financialTypes';
import ErrorMessage from '../../common/ErrorMessage';
import LoadingSpinner from '../../common/LoadingSpinner';

interface DataExportModalProps {
  onClose: () => void;
}

type ExportFormat = 'csv' | 'excel' | 'pdf';

const DataExportModal: React.FC<DataExportModalProps> = ({ onClose }) => {
  const { filters, exportData, error } = useFinancial();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('excel');
  const [timeframe, setTimeframe] = useState<TimeFrame>(filters.timeFrame);
  const [includeOptions, setIncludeOptions] = useState({
    revenueData: true,
    materialCosts: true,
    productMetrics: true,
    projectFinancials: true,
    platformData: true,
    costInsights: false,
    pricingReferences: false,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const handleIncludeToggle = (option: keyof typeof includeOptions) => {
    setIncludeOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      // Prepare options for export - use the correct structure for includeSections
      const options = {
        timeframe,
        includeSections: includeOptions, // This is already the correct structure
        includeCharts: true,
        includeRawData: false,
        filename: `hidesync_financial_export_${new Date()
          .toISOString()
          .slice(0, 10)}`,
      };

      // Call the export function from the context
      const success = await exportData(selectedFormat, options);

      if (success) {
        setExportSuccess(true);

        // Close the modal after a delay
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setExportError('Export failed. Please try again.');
      }
    } catch (error) {
      console.error('Export failed:', error);
      setExportError(
        error instanceof Error
          ? error.message
          : 'Export failed. Please try again.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const formatNames = {
    csv: 'CSV (Comma Separated Values)',
    excel: 'Excel Spreadsheet',
    pdf: 'PDF Document',
  };

  const timeframeNames = {
    [TimeFrame.LAST_MONTH]: 'Last Month',
    [TimeFrame.LAST_3_MONTHS]: 'Last 3 Months',
    [TimeFrame.LAST_6_MONTHS]: 'Last 6 Months',
    [TimeFrame.LAST_YEAR]: 'Last Year',
    [TimeFrame.ALL_TIME]: 'All Time',
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full'>
        <div className='flex justify-between items-center p-4 border-b'>
          <h3 className='text-lg font-medium'>Export Financial Data</h3>
          <button
            onClick={onClose}
            className='text-stone-500 hover:text-stone-700'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        <div className='p-4'>
          {/* Display any error that occurred */}
          {(error || exportError) && (
            <div className='mb-4'>
              <ErrorMessage
                message={
                  exportError ||
                  'There was a problem preparing the export. Some data may be unavailable.'
                }
              />
            </div>
          )}

          <div className='space-y-6'>
            {/* Export Format Selection */}
            <div>
              <label className='text-sm font-medium text-stone-700 mb-2 inline-block'>
                Export Format
              </label>
              <div className='grid grid-cols-3 gap-3'>
                <button
                  onClick={() => setSelectedFormat('csv')}
                  className={`flex flex-col items-center justify-center p-4 border rounded-md ${
                    selectedFormat === 'csv'
                      ? 'border-amber-600 bg-amber-50 text-amber-700'
                      : 'border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <FileText className='h-8 w-8 mb-2' />
                  <span className='text-sm'>CSV</span>
                </button>

                <button
                  onClick={() => setSelectedFormat('excel')}
                  className={`flex flex-col items-center justify-center p-4 border rounded-md ${
                    selectedFormat === 'excel'
                      ? 'border-amber-600 bg-amber-50 text-amber-700'
                      : 'border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <FileSpreadsheet className='h-8 w-8 mb-2' />
                  <span className='text-sm'>Excel</span>
                </button>

                <button
                  onClick={() => setSelectedFormat('pdf')}
                  className={`flex flex-col items-center justify-center p-4 border rounded-md ${
                    selectedFormat === 'pdf'
                      ? 'border-amber-600 bg-amber-50 text-amber-700'
                      : 'border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <File className='h-8 w-8 mb-2' />
                  <span className='text-sm'>PDF</span>
                </button>
              </div>
              <p className='mt-2 text-xs text-stone-500'>
                {formatNames[selectedFormat]}
              </p>
            </div>

            {/* Time Period Selection */}
            <div>
              <label className='text-sm font-medium text-stone-700 mb-2 flex items-center'>
                <Calendar className='h-4 w-4 mr-2 text-stone-500' />
                Time Period
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as TimeFrame)}
                className='w-full bg-stone-100 border border-stone-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              >
                <option value={TimeFrame.LAST_MONTH}>Last Month</option>
                <option value={TimeFrame.LAST_3_MONTHS}>Last 3 Months</option>
                <option value={TimeFrame.LAST_6_MONTHS}>Last 6 Months</option>
                <option value={TimeFrame.LAST_YEAR}>Last Year</option>
                <option value={TimeFrame.ALL_TIME}>All Time</option>
              </select>
            </div>

            {/* Include Options - Toggle */}
            <div>
              <button
                onClick={() => setShowOptions(!showOptions)}
                className='flex items-center justify-between w-full text-sm bg-stone-100 hover:bg-stone-200 rounded-md px-4 py-2 text-stone-700'
              >
                <span className='font-medium'>Data to Include</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    showOptions ? 'transform rotate-180' : ''
                  }`}
                />
              </button>

              {/* Include Options - Content */}
              {showOptions && (
                <div className='mt-3 space-y-2 p-3 bg-stone-50 rounded-md border border-stone-200'>
                  <div className='text-xs font-medium text-stone-500 mb-2'>
                    SELECT DATA TO INCLUDE:
                  </div>
                  {Object.entries(includeOptions).map(([key, value]) => (
                    <div key={key} className='flex items-center'>
                      <input
                        type='checkbox'
                        id={key}
                        checked={value}
                        onChange={() =>
                          handleIncludeToggle(
                            key as keyof typeof includeOptions
                          )
                        }
                        className='h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500'
                      />
                      <label
                        htmlFor={key}
                        className='ml-2 text-sm text-stone-700'
                      >
                        {key === 'revenueData' &&
                          'Revenue & Profitability Data'}
                        {key === 'materialCosts' && 'Material Cost Analysis'}
                        {key === 'productMetrics' && 'Product Type Metrics'}
                        {key === 'projectFinancials' &&
                          'Project Financial Details'}
                        {key === 'platformData' && 'Platform Performance Data'}
                        {key === 'costInsights' && 'Cost Optimization Insights'}
                        {key === 'pricingReferences' &&
                          'Pricing Reference Sheets'}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Export Preview */}
            <div className='bg-stone-50 p-3 rounded-md border border-stone-200'>
              <h5 className='text-sm font-medium text-stone-700 mb-2'>
                Export Summary
              </h5>
              <ul className='text-sm text-stone-600 space-y-1'>
                <li>
                  • Format:{' '}
                  <span className='text-stone-800 font-medium'>
                    {formatNames[selectedFormat]}
                  </span>
                </li>
                <li>
                  • Time Period:{' '}
                  <span className='text-stone-800 font-medium'>
                    {timeframeNames[timeframe]}
                  </span>
                </li>
                <li>
                  • Data Sections:{' '}
                  <span className='text-stone-800 font-medium'>
                    {
                      Object.entries(includeOptions).filter(
                        ([_, isIncluded]) => isIncluded
                      ).length
                    }{' '}
                    selected
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className='p-4 border-t flex justify-end space-x-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 border border-stone-300 rounded-md text-stone-700 hover:bg-stone-50'
            disabled={isExporting}
          >
            Cancel
          </button>

          <button
            onClick={handleExport}
            disabled={
              isExporting ||
              exportSuccess ||
              Object.entries(includeOptions).filter(
                ([_, isIncluded]) => isIncluded
              ).length === 0
            }
            className={`px-4 py-2 rounded-md flex items-center ${
              exportSuccess
                ? 'bg-green-600 text-white'
                : 'bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {isExporting ? (
              <>
                <LoadingSpinner size='small' color='amber' />
                <span className='ml-2'>Exporting...</span>
              </>
            ) : exportSuccess ? (
              <>
                <Check className='h-4 w-4 mr-2' />
                Exported
              </>
            ) : (
              'Export Data'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataExportModal;
