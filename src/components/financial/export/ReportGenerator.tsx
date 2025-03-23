import {
  ArrowDown,
  Calendar,
  Copy,
  FilePlus,
  FileSpreadsheet,
  FileText,
  Printer,
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useFinancial } from '../../../context/FinancialContext';
import { TimeFrame } from '../../../types/financialTypes';
import ErrorMessage from '../../common/ErrorMessage';
import LoadingSpinner from '../../common/LoadingSpinner';

type ReportType = 'executive' | 'detailed' | 'cost' | 'platform' | 'custom';
type ReportPeriod = 'current' | 'comparative';

const ReportGenerator: React.FC = () => {
  const {
    summary,
    revenueTrends,
    productMetrics,
    platformPerformance,
    filters,
    loading,
    error,
    exportData, // Use exportData from context
  } = useFinancial();

  const [reportType, setReportType] = useState<ReportType>('executive');
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('current');
  const [reportTitle, setReportTitle] = useState(
    'Financial Performance Report'
  );
  const [includeSections, setIncludeSections] = useState({
    summary: true,
    revenueTrends: true,
    productAnalysis: true,
    costBreakdown: true,
    platformComparison: true,
    projectPerformance: true,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Use useCallback for event handler functions
  const toggleSection = useCallback((section: keyof typeof includeSections) => {
    setIncludeSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const handleReportTypeChange = useCallback((type: ReportType) => {
    setReportType(type);

    // Set default sections based on report type
    switch (type) {
      case 'executive':
        setIncludeSections({
          summary: true,
          revenueTrends: true,
          productAnalysis: true,
          costBreakdown: false,
          platformComparison: true,
          projectPerformance: false,
        });
        setReportTitle('Executive Summary Report');
        break;
      case 'detailed':
        setIncludeSections({
          summary: true,
          revenueTrends: true,
          productAnalysis: true,
          costBreakdown: true,
          platformComparison: true,
          projectPerformance: true,
        });
        setReportTitle('Detailed Financial Analysis');
        break;
      case 'cost':
        setIncludeSections({
          summary: true,
          revenueTrends: false,
          productAnalysis: false,
          costBreakdown: true,
          platformComparison: false,
          projectPerformance: false,
        });
        setReportTitle('Cost Analysis Report');
        break;
      case 'platform':
        setIncludeSections({
          summary: true,
          revenueTrends: false,
          productAnalysis: false,
          costBreakdown: false,
          platformComparison: true,
          projectPerformance: false,
        });
        setReportTitle('Platform Performance Analysis');
        break;
      case 'custom':
        // Keep current selections for custom report
        setReportTitle('Custom Financial Report');
        break;
    }
  }, []);

  const getTimePeriodString = useCallback(() => {
    switch (filters.timeFrame) {
      case TimeFrame.LAST_MONTH:
        return 'Last Month';
      case TimeFrame.LAST_3_MONTHS:
        return 'Last 3 Months';
      case TimeFrame.LAST_6_MONTHS:
        return 'Last 6 Months';
      case TimeFrame.LAST_YEAR:
        return 'Last Year';
      case TimeFrame.ALL_TIME:
        return 'All Time';
      default:
        return 'Custom Period';
    }
  }, [filters.timeFrame]);

  // Helper function to convert the UI-specific section names to the API-expected format
  const convertToApiSections = useMemo(() => {
    return {
      revenueData: includeSections.revenueTrends,
      materialCosts: includeSections.costBreakdown,
      productMetrics: includeSections.productAnalysis,
      projectFinancials: includeSections.projectPerformance,
      platformData: includeSections.platformComparison,
      costInsights: false, // Default to false unless specifically needed
      pricingReferences: false, // Default to false unless specifically needed
    };
  }, [includeSections]);

  // Generate report
  const generateReport = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      // If exportData function exists, call it with the proper format
      if (typeof exportData === 'function') {
        const success = await exportData('pdf', {
          format: 'pdf',
          timeframe: filters.timeFrame,
          includeSections: convertToApiSections,
        });

        if (!success) {
          throw new Error('Failed to generate report');
        }
      } else {
        // For demo purposes, simulate a delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      setReportGenerated(true);
    } catch (err) {
      console.error('Error generating report:', err);
      setGenerationError(
        err instanceof Error
          ? err.message
          : 'Failed to generate report. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Preview report
  const previewReport = () => {
    // In a real implementation, this would generate a preview
    console.log(`Previewing ${reportType} report`);
    alert('Report preview functionality would be shown here');
  };

  // Show loading state
  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <LoadingSpinner
          size='medium'
          color='amber'
          message='Loading financial data...'
        />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className='flex items-center justify-center h-64'>
        <ErrorMessage
          message='Unable to load financial data. Please try again later.'
          variant='critical'
        />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {generationError && (
        <div className='mb-4'>
          <ErrorMessage message={generationError} />
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Report Configuration */}
        <div>
          <h3 className='text-lg font-medium mb-4'>Report Configuration</h3>

          <div className='space-y-4'>
            {/* Report Type */}
            <div>
              <label className='block text-sm font-medium text-stone-700 mb-2'>
                Report Type
              </label>
              <div className='grid grid-cols-3 gap-2'>
                <button
                  type='button'
                  onClick={() => handleReportTypeChange('executive')}
                  className={`flex flex-col items-center justify-center p-3 border rounded-md ${
                    reportType === 'executive'
                      ? 'border-amber-600 bg-amber-50 text-amber-700'
                      : 'border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <FileText className='h-6 w-6 mb-1' />
                  <span className='text-xs'>Executive</span>
                </button>

                <button
                  type='button'
                  onClick={() => handleReportTypeChange('detailed')}
                  className={`flex flex-col items-center justify-center p-3 border rounded-md ${
                    reportType === 'detailed'
                      ? 'border-amber-600 bg-amber-50 text-amber-700'
                      : 'border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <FileSpreadsheet className='h-6 w-6 mb-1' />
                  <span className='text-xs'>Detailed</span>
                </button>

                <button
                  type='button'
                  onClick={() => handleReportTypeChange('custom')}
                  className={`flex flex-col items-center justify-center p-3 border rounded-md ${
                    reportType === 'custom'
                      ? 'border-amber-600 bg-amber-50 text-amber-700'
                      : 'border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <FilePlus className='h-6 w-6 mb-1' />
                  <span className='text-xs'>Custom</span>
                </button>
              </div>
            </div>

            {/* Report Period */}
            <div>
              <label className='block text-sm font-medium text-stone-700 mb-2'>
                Report Period
              </label>
              <div className='flex space-x-2'>
                <button
                  type='button'
                  onClick={() => setReportPeriod('current')}
                  className={`flex-1 flex items-center justify-center p-2 border rounded-md text-sm ${
                    reportPeriod === 'current'
                      ? 'border-amber-600 bg-amber-50 text-amber-700'
                      : 'border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <Calendar className='h-4 w-4 mr-2' />
                  {getTimePeriodString()}
                </button>

                <button
                  type='button'
                  onClick={() => setReportPeriod('comparative')}
                  className={`flex-1 flex items-center justify-center p-2 border rounded-md text-sm ${
                    reportPeriod === 'comparative'
                      ? 'border-amber-600 bg-amber-50 text-amber-700'
                      : 'border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <ArrowDown className='h-4 w-4 mr-2' />
                  Period Comparison
                </button>
              </div>
            </div>

            {/* Report Title */}
            <div>
              <label
                htmlFor='report-title'
                className='block text-sm font-medium text-stone-700 mb-1'
              >
                Report Title
              </label>
              <input
                type='text'
                id='report-title'
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className='w-full bg-stone-100 border border-stone-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              />
            </div>

            {/* Include Sections */}
            {reportType === 'custom' && (
              <div>
                <label className='block text-sm font-medium text-stone-700 mb-2'>
                  Include Sections
                </label>
                <div className='space-y-2 p-3 bg-stone-50 rounded-md border border-stone-200'>
                  {(
                    Object.keys(
                      includeSections
                    ) as (keyof typeof includeSections)[]
                  ).map((key) => (
                    <div key={key} className='flex items-center'>
                      <input
                        type='checkbox'
                        id={`section-${key}`}
                        checked={includeSections[key]}
                        onChange={() => toggleSection(key)}
                        className='h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500'
                      />
                      <label
                        htmlFor={`section-${key}`}
                        className='ml-2 text-sm text-stone-700'
                      >
                        {key === 'summary' && 'Financial Summary'}
                        {key === 'revenueTrends' &&
                          'Revenue & Profitability Trends'}
                        {key === 'productAnalysis' && 'Product Analysis'}
                        {key === 'costBreakdown' && 'Cost Breakdown'}
                        {key === 'platformComparison' && 'Platform Comparison'}
                        {key === 'projectPerformance' && 'Project Performance'}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Report Preview */}
        <div>
          <h3 className='text-lg font-medium mb-4'>Report Preview</h3>

          <div className='bg-white p-6 rounded-lg border-2 border-dashed border-stone-300 h-96 overflow-y-auto'>
            {reportGenerated ? (
              <div className='h-full'>
                <div className='text-center mb-6'>
                  <h1 className='text-xl font-bold text-stone-800'>
                    {reportTitle}
                  </h1>
                  <p className='text-sm text-stone-500'>
                    {getTimePeriodString()} • Generated on{' '}
                    {new Date().toLocaleDateString()}
                  </p>
                </div>

                {/* Preview of report sections */}
                <div className='space-y-4'>
                  {includeSections.summary && (
                    <div className='p-3 border rounded border-stone-200'>
                      <h2 className='text-md font-medium mb-2'>
                        Financial Summary
                      </h2>
                      <div className='grid grid-cols-2 gap-2 text-sm'>
                        <div className='text-stone-500'>Monthly Revenue:</div>
                        <div className='text-right font-medium'>
                          ${summary?.monthlyRevenue?.toLocaleString() || 'N/A'}
                        </div>
                        <div className='text-stone-500'>Average Margin:</div>
                        <div className='text-right font-medium'>
                          {summary?.averageMargin?.toFixed(1) || 'N/A'}%
                        </div>
                      </div>
                    </div>
                  )}

                  {includeSections.revenueTrends &&
                    revenueTrends.length > 0 && (
                      <div className='p-3 border rounded border-stone-200'>
                        <h2 className='text-md font-medium mb-2'>
                          Revenue Trends
                        </h2>
                        <p className='text-sm text-stone-500'>
                          Showing data for {revenueTrends.length} months
                        </p>
                      </div>
                    )}

                  {includeSections.productAnalysis &&
                    productMetrics.length > 0 && (
                      <div className='p-3 border rounded border-stone-200'>
                        <h2 className='text-md font-medium mb-2'>
                          Product Analysis
                        </h2>
                        <p className='text-sm text-stone-500'>
                          Analyzing {productMetrics.length} product types
                        </p>
                      </div>
                    )}

                  {includeSections.platformComparison &&
                    platformPerformance.length > 0 && (
                      <div className='p-3 border rounded border-stone-200'>
                        <h2 className='text-md font-medium mb-2'>
                          Platform Comparison
                        </h2>
                        <p className='text-sm text-stone-500'>
                          Comparing {platformPerformance.length} sales platforms
                        </p>
                      </div>
                    )}
                </div>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center h-full text-stone-400'>
                <FileText className='h-16 w-16 mb-4 opacity-50' />
                <p>Report preview will appear here</p>
                <p className='text-xs mt-1'>
                  Configure your report settings and click "Generate Report"
                </p>
              </div>
            )}
          </div>

          <div className='flex mt-4 space-x-2'>
            <button
              type='button'
              onClick={generateReport}
              disabled={isGenerating}
              className='flex-1 flex items-center justify-center py-2 px-4 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isGenerating ? (
                <>
                  <div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2'></div>
                  Generating...
                </>
              ) : (
                <>Generate Report</>
              )}
            </button>

            {reportGenerated && (
              <>
                <button
                  type='button'
                  onClick={previewReport}
                  className='flex items-center justify-center py-2 px-4 bg-stone-100 text-stone-700 rounded-md hover:bg-stone-200'
                >
                  <Printer className='h-4 w-4 mr-2' />
                  Print
                </button>

                <button
                  type='button'
                  onClick={() =>
                    navigator.clipboard.writeText(
                      'Report exported to clipboard'
                    )
                  }
                  className='flex items-center justify-center py-2 px-4 bg-stone-100 text-stone-700 rounded-md hover:bg-stone-200'
                >
                  <Copy className='h-4 w-4 mr-2' />
                  Copy
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;
