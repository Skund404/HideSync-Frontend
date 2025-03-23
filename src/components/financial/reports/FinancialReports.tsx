// src/components/financial/reports/FinancialReports.tsx
import { Download, File, FileText } from 'lucide-react';
import React, { useState } from 'react';
import { useFinancial } from '../../../context/FinancialContext';
import { TimeFrame } from '../../../types/financialTypes';
import {
  formatCurrency,
  formatPercentage,
} from '../../../utils/financialHelpers';
import ErrorMessage from '../../common/ErrorMessage';
import LoadingSpinner from '../../common/LoadingSpinner';
import TimeframeSelector from '../../financial/TimeframeSelector';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const REPORT_TYPES: ReportType[] = [
  {
    id: 'revenue_summary',
    name: 'Revenue Summary',
    description: 'Monthly and quarterly revenue breakdown',
    icon: <File className='h-5 w-5 text-blue-600' />,
  },
  {
    id: 'profit_margin',
    name: 'Profit Margin Analysis',
    description: 'Detailed margin performance across product types',
    icon: <FileText className='h-5 w-5 text-green-600' />,
  },
  {
    id: 'platform_performance',
    name: 'Platform Performance',
    description: 'Sales and revenue across different platforms',
    icon: <File className='h-5 w-5 text-purple-600' />,
  },
  {
    id: 'cost_breakdown',
    name: 'Cost Breakdown',
    description: 'Detailed analysis of material and operational costs',
    icon: <FileText className='h-5 w-5 text-red-600' />,
  },
];

const FinancialReports: React.FC = () => {
  const {
    revenueTrends,
    productMetrics,
    platformPerformance,
    materialCosts,
    loading,
    loadingState,
    error,
    refreshData,
    exportData,
  } = useFinancial();

  const [selectedReport, setSelectedReport] = useState<string>(
    REPORT_TYPES[0].id
  );
  const [timeframe, setTimeframe] = useState<TimeFrame>(
    TimeFrame.LAST_6_MONTHS
  );
  const [isExporting, setIsExporting] = useState(false);

  // Determine if we're loading the specific data for this report
  const isLoading =
    loading ||
    (selectedReport === 'revenue_summary' && loadingState.revenueTrends) ||
    (selectedReport === 'profit_margin' && loadingState.productMetrics) ||
    (selectedReport === 'platform_performance' &&
      loadingState.platformPerformance) ||
    (selectedReport === 'cost_breakdown' && loadingState.materialCosts);

  // Handle export function with proper error handling
  const handleExportReport = async (reportType: string) => {
    try {
      setIsExporting(true);

      // Initialize include sections object with all false values
      const includeSections = {
        revenueData: false,
        materialCosts: false,
        productMetrics: false,
        projectFinancials: false,
        platformData: false,
        costInsights: false,
        pricingReferences: false,
      };

      // Determine which sections to include based on report type
      switch (reportType) {
        case 'revenue_summary':
          includeSections.revenueData = true;
          break;
        case 'profit_margin':
          includeSections.productMetrics = true;
          break;
        case 'platform_performance':
          includeSections.platformData = true;
          break;
        case 'cost_breakdown':
          includeSections.materialCosts = true;
          break;
        default:
          // Include all relevant sections by default
          includeSections.revenueData = true;
          includeSections.productMetrics = true;
          includeSections.platformData = true;
          includeSections.materialCosts = true;
      }

      // Call the export function with the correct options structure
      await exportData('pdf', {
        format: 'pdf',
        timeframe,
        includeSections,
      });
    } catch (err) {
      console.error('Export error:', err);
      alert('There was an error exporting the report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Show loading spinner when loading reports data
  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <LoadingSpinner
          size='medium'
          color='amber'
          message='Loading report data...'
        />
      </div>
    );
  }

  // Handle error state with retry option
  if (error) {
    return (
      <div className='flex items-center justify-center h-64'>
        <ErrorMessage
          message='Unable to load report data. Please try again.'
          onRetry={refreshData}
        />
      </div>
    );
  }

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'revenue_summary':
        return (
          <div className='bg-white p-6 rounded-lg shadow-sm'>
            <h3 className='text-lg font-medium mb-4'>Revenue Summary</h3>
            {!revenueTrends.length ? (
              <p className='text-center text-stone-500 py-4'>
                No revenue data available for the selected period
              </p>
            ) : (
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-stone-200'>
                  <thead>
                    <tr>
                      <th className='px-4 py-3 bg-stone-50 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'>
                        Month
                      </th>
                      <th className='px-4 py-3 bg-stone-50 text-right text-xs font-medium text-stone-500 uppercase tracking-wider'>
                        Revenue
                      </th>
                      <th className='px-4 py-3 bg-stone-50 text-right text-xs font-medium text-stone-500 uppercase tracking-wider'>
                        Costs
                      </th>
                      <th className='px-4 py-3 bg-stone-50 text-right text-xs font-medium text-stone-500 uppercase tracking-wider'>
                        Profit
                      </th>
                      <th className='px-4 py-3 bg-stone-50 text-right text-xs font-medium text-stone-500 uppercase tracking-wider'>
                        Margin
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueTrends.map((trend) => (
                      <tr key={trend.month} className='border-b'>
                        <td className='px-4 py-3 text-left'>{trend.month}</td>
                        <td className='px-4 py-3 text-right'>
                          {formatCurrency(trend.revenue)}
                        </td>
                        <td className='px-4 py-3 text-right'>
                          {formatCurrency(trend.costs)}
                        </td>
                        <td className='px-4 py-3 text-right text-green-600'>
                          {formatCurrency(trend.profit)}
                        </td>
                        <td className='px-4 py-3 text-right'>
                          {formatPercentage(trend.margin || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'profit_margin':
        return (
          <div className='bg-white p-6 rounded-lg shadow-sm'>
            <h3 className='text-lg font-medium mb-4'>Profit Margin Analysis</h3>
            {!productMetrics.length ? (
              <p className='text-center text-stone-500 py-4'>
                No product metrics available for the selected period
              </p>
            ) : (
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-stone-200'>
                  <thead>
                    <tr>
                      <th className='px-4 py-3 bg-stone-50 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'>
                        Product Type
                      </th>
                      <th className='px-4 py-3 bg-stone-50 text-right text-xs font-medium text-stone-500 uppercase tracking-wider'>
                        Sales
                      </th>
                      <th className='px-4 py-3 bg-stone-50 text-right text-xs font-medium text-stone-500 uppercase tracking-wider'>
                        Quantity
                      </th>
                      <th className='px-4 py-3 bg-stone-50 text-right text-xs font-medium text-stone-500 uppercase tracking-wider'>
                        Margin
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {productMetrics.map((product) => (
                      <tr key={product.name} className='border-b'>
                        <td className='px-4 py-3 text-left'>{product.name}</td>
                        <td className='px-4 py-3 text-right'>
                          {formatCurrency(product.sales)}
                        </td>
                        <td className='px-4 py-3 text-right'>
                          {product.quantity || 'N/A'}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-medium ${
                            product.margin > 45
                              ? 'text-green-600'
                              : product.margin > 35
                              ? 'text-amber-600'
                              : 'text-red-600'
                          }`}
                        >
                          {formatPercentage(product.margin)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'platform_performance':
        return (
          <div className='bg-white p-6 rounded-lg shadow-sm'>
            <h3 className='text-lg font-medium mb-4'>Platform Performance</h3>
            {!platformPerformance.length ? (
              <p className='text-center text-stone-500 py-4'>
                No platform data available for the selected period
              </p>
            ) : (
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-stone-200'>
                  <thead>
                    <tr>
                      <th className='px-4 py-3 bg-stone-50 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'>
                        Platform
                      </th>
                      <th className='px-4 py-3 bg-stone-50 text-right text-xs font-medium text-stone-500 uppercase tracking-wider'>
                        Sales
                      </th>
                      <th className='px-4 py-3 bg-stone-50 text-right text-xs font-medium text-stone-500 uppercase tracking-wider'>
                        Orders
                      </th>
                      <th className='px-4 py-3 bg-stone-50 text-right text-xs font-medium text-stone-500 uppercase tracking-wider'>
                        Profit
                      </th>
                      <th className='px-4 py-3 bg-stone-50 text-right text-xs font-medium text-stone-500 uppercase tracking-wider'>
                        Margin
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {platformPerformance.map((platform) => (
                      <tr key={platform.platform} className='border-b'>
                        <td className='px-4 py-3 text-left capitalize'>
                          {platform.platform}
                        </td>
                        <td className='px-4 py-3 text-right'>
                          {formatCurrency(platform.sales)}
                        </td>
                        <td className='px-4 py-3 text-right'>
                          {platform.orders}
                        </td>
                        <td className='px-4 py-3 text-right text-green-600'>
                          {formatCurrency(platform.profit)}
                        </td>
                        <td className='px-4 py-3 text-right'>
                          {formatPercentage(platform.margin)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'cost_breakdown':
        return (
          <div className='bg-white p-6 rounded-lg shadow-sm'>
            <h3 className='text-lg font-medium mb-4'>Cost Breakdown</h3>
            {!materialCosts.length ? (
              <p className='text-center text-stone-500 py-4'>
                No cost data available for the selected period
              </p>
            ) : (
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-stone-200'>
                  <thead>
                    <tr>
                      <th className='px-4 py-3 bg-stone-50 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'>
                        Month
                      </th>
                      <th className='px-4 py-3 bg-stone-50 text-right text-xs font-medium text-stone-500 uppercase tracking-wider'>
                        Leather
                      </th>
                      <th className='px-4 py-3 bg-stone-50 text-right text-xs font-medium text-stone-500 uppercase tracking-wider'>
                        Hardware
                      </th>
                      <th className='px-4 py-3 bg-stone-50 text-right text-xs font-medium text-stone-500 uppercase tracking-wider'>
                        Thread
                      </th>
                      <th className='px-4 py-3 bg-stone-50 text-right text-xs font-medium text-stone-500 uppercase tracking-wider'>
                        Other
                      </th>
                      <th className='px-4 py-3 bg-stone-50 text-right text-xs font-medium text-stone-500 uppercase tracking-wider'>
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {materialCosts.map((cost) => (
                      <tr key={cost.month} className='border-b'>
                        <td className='px-4 py-3 text-left'>{cost.month}</td>
                        <td className='px-4 py-3 text-right'>
                          {formatCurrency(cost.leather)}
                        </td>
                        <td className='px-4 py-3 text-right'>
                          {formatCurrency(cost.hardware)}
                        </td>
                        <td className='px-4 py-3 text-right'>
                          {formatCurrency(cost.thread)}
                        </td>
                        <td className='px-4 py-3 text-right'>
                          {formatCurrency(cost.other)}
                        </td>
                        <td className='px-4 py-3 text-right font-medium'>
                          {formatCurrency(
                            cost.leather +
                              cost.hardware +
                              cost.thread +
                              cost.other
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      default:
        return <div>Select a report to view details</div>;
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div className='flex space-x-4'>
          {REPORT_TYPES.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                selectedReport === report.id
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {report.icon}
              <span>{report.name}</span>
            </button>
          ))}
        </div>

        <div className='flex items-center space-x-4'>
          <TimeframeSelector
            value={timeframe}
            onChange={(newTimeframe) => setTimeframe(newTimeframe)}
          />

          <button
            onClick={() => handleExportReport(selectedReport)}
            disabled={isExporting}
            className='flex items-center space-x-2 bg-stone-100 text-stone-700 px-4 py-2 rounded-md hover:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isExporting ? (
              <>
                <div className='animate-spin h-4 w-4 border-2 border-stone-500 border-t-transparent rounded-full mr-2'></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className='h-4 w-4' />
                <span>Export Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className='mt-6'>{renderReportContent()}</div>
    </div>
  );
};

export default FinancialReports;
