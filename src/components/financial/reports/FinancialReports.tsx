import { Download, File, FileText } from 'lucide-react';
import React, { useState } from 'react';
import { useFinancial } from '../../../context/FinancialContext';
import { TimeFrame } from '../../../types/financialTypes';
import {
  formatCurrency,
  formatPercentage,
} from '../../../utils/financialHelpers';
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
  } = useFinancial();

  const [selectedReport, setSelectedReport] = useState<string>(
    REPORT_TYPES[0].id
  );
  const [timeframe, setTimeframe] = useState<TimeFrame>(
    TimeFrame.LAST_6_MONTHS
  );

  const handleExportReport = (reportType: string) => {
    // Placeholder for export functionality
    console.log(`Exporting report: ${reportType}`);
    alert('Export functionality will be implemented in future updates');
  };

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'revenue_summary':
        return (
          <div className='bg-white p-6 rounded-lg shadow-sm'>
            <h3 className='text-lg font-medium mb-4'>Revenue Summary</h3>
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
          </div>
        );

      case 'profit_margin':
        return (
          <div className='bg-white p-6 rounded-lg shadow-sm'>
            <h3 className='text-lg font-medium mb-4'>Profit Margin Analysis</h3>
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
          </div>
        );

      case 'platform_performance':
        return (
          <div className='bg-white p-6 rounded-lg shadow-sm'>
            <h3 className='text-lg font-medium mb-4'>Platform Performance</h3>
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
          </div>
        );

      case 'cost_breakdown':
        return (
          <div className='bg-white p-6 rounded-lg shadow-sm'>
            <h3 className='text-lg font-medium mb-4'>Cost Breakdown</h3>
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
          </div>
        );

      default:
        return <div>Select a report to view details</div>;
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-600'></div>
          <p className='mt-2 text-sm text-stone-500'>Loading reports...</p>
        </div>
      </div>
    );
  }

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
            className='flex items-center space-x-2 bg-stone-100 text-stone-700 px-4 py-2 rounded-md hover:bg-stone-200'
          >
            <Download className='h-4 w-4' />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      <div className='mt-6'>{renderReportContent()}</div>
    </div>
  );
};

export default FinancialReports;
