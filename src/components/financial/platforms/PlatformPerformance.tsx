import React from 'react';
import { useFinancial } from '../../../context/FinancialContext';
import {
  formatCurrency,
  formatPercentage,
} from '../../../utils/financialHelpers';
import PlatformComparison from './PlatformComparison';
import PlatformRevenueChart from './PlatformRevenueChart';

const PlatformPerformance: React.FC = () => {
  const { platformPerformance, loading } = useFinancial();

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-600'></div>
          <p className='mt-2 text-sm text-stone-500'>
            Loading platform data...
          </p>
        </div>
      </div>
    );
  }

  if (!platformPerformance.length) {
    return (
      <div className='p-6 bg-white rounded-lg shadow-sm border border-stone-200 text-center'>
        <h3 className='text-lg font-medium mb-2'>No Platform Data Available</h3>
        <p className='text-stone-500 mb-4'>
          Connect your e-commerce platforms to see performance metrics.
        </p>
        <button className='px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700'>
          Connect Platforms
        </button>
      </div>
    );
  }

  // Calculate totals
  const totalSales = platformPerformance.reduce(
    (sum, platform) => sum + platform.sales,
    0
  );
  const totalOrders = platformPerformance.reduce(
    (sum, platform) => sum + platform.orders,
    0
  );
  const totalProfit = platformPerformance.reduce(
    (sum, platform) => sum + platform.profit,
    0
  );
  const totalFees = platformPerformance.reduce(
    (sum, platform) => sum + platform.fees,
    0
  );

  // Calculate averages
  const averageMargin = (totalProfit / totalSales) * 100;
  const averageOrderValue = totalSales / totalOrders;

  return (
    <div className='space-y-6'>
      {/* KPI Summary */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='bg-white p-4 rounded-lg shadow-sm border border-stone-200'>
          <h4 className='text-sm font-medium text-stone-500'>
            Total Platform Sales
          </h4>
          <p className='text-2xl font-bold text-stone-800 mt-1'>
            {formatCurrency(totalSales)}
          </p>
        </div>

        <div className='bg-white p-4 rounded-lg shadow-sm border border-stone-200'>
          <h4 className='text-sm font-medium text-stone-500'>Total Orders</h4>
          <p className='text-2xl font-bold text-stone-800 mt-1'>
            {totalOrders}
          </p>
          <p className='text-xs text-stone-500 mt-1'>
            Avg: {formatCurrency(averageOrderValue)}
          </p>
        </div>

        <div className='bg-white p-4 rounded-lg shadow-sm border border-stone-200'>
          <h4 className='text-sm font-medium text-stone-500'>Average Margin</h4>
          <p className='text-2xl font-bold text-stone-800 mt-1'>
            {formatPercentage(averageMargin)}
          </p>
        </div>

        <div className='bg-white p-4 rounded-lg shadow-sm border border-stone-200'>
          <h4 className='text-sm font-medium text-stone-500'>Platform Fees</h4>
          <p className='text-2xl font-bold text-stone-800 mt-1'>
            {formatCurrency(totalFees)}
          </p>
          <p className='text-xs text-stone-500 mt-1'>
            {formatPercentage((totalFees / totalSales) * 100)} of sales
          </p>
        </div>
      </div>

      {/* Platform Comparison */}
      <div className='bg-white p-6 rounded-lg shadow-sm border border-stone-200'>
        <h3 className='text-lg font-medium mb-4'>Platform Comparison</h3>
        <div className='h-80'>
          <PlatformComparison />
        </div>
      </div>

      {/* Platform Revenue Chart */}
      <div className='bg-white p-6 rounded-lg shadow-sm border border-stone-200'>
        <h3 className='text-lg font-medium mb-4'>Platform Revenue by Month</h3>
        <div className='h-64'>
          <PlatformRevenueChart />
        </div>
      </div>

      {/* Platform Details Table */}
      <div className='bg-white p-6 rounded-lg shadow-sm border border-stone-200'>
        <h3 className='text-lg font-medium mb-4'>Platform Details</h3>
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
                  Avg Order
                </th>
                <th className='px-4 py-3 bg-stone-50 text-right text-xs font-medium text-stone-500 uppercase tracking-wider'>
                  Profit
                </th>
                <th className='px-4 py-3 bg-stone-50 text-right text-xs font-medium text-stone-500 uppercase tracking-wider'>
                  Margin
                </th>
                <th className='px-4 py-3 bg-stone-50 text-right text-xs font-medium text-stone-500 uppercase tracking-wider'>
                  Fees
                </th>
                <th className='px-4 py-3 bg-stone-50 text-right text-xs font-medium text-stone-500 uppercase tracking-wider'>
                  YoY Growth
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-stone-200'>
              {platformPerformance.map((platform, index) => (
                <tr
                  key={platform.platform}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-stone-50'}
                >
                  <td className='px-4 py-3 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <span className='font-medium text-stone-900 capitalize'>
                        {platform.platform}
                      </span>
                    </div>
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap text-right text-stone-800'>
                    {formatCurrency(platform.sales)}
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap text-right text-stone-800'>
                    {platform.orders}
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap text-right text-stone-800'>
                    {formatCurrency(platform.sales / platform.orders)}
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap text-right text-green-600 font-medium'>
                    {formatCurrency(platform.profit)}
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap text-right text-stone-800'>
                    {formatPercentage(platform.margin)}
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap text-right text-stone-800'>
                    {formatCurrency(platform.fees)}
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap text-right'>
                    {platform.yearOverYearGrowth !== undefined && (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          platform.yearOverYearGrowth > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {platform.yearOverYearGrowth > 0 ? '+' : ''}
                        {platform.yearOverYearGrowth.toFixed(1)}%
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlatformPerformance;
