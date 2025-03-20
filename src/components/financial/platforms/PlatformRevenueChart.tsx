import React, { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useFinancial } from '../../../context/FinancialContext';
import { formatCurrency } from '../../../utils/financialHelpers';

// This would normally come from the API, but we'll mock it here
const mockPlatformRevenueData = [
  {
    month: 'Jan',
    shopify: 3850,
    etsy: 2450,
    amazon: 1500,
    website: 950,
    other: 350,
  },
  {
    month: 'Feb',
    shopify: 3950,
    etsy: 2600,
    amazon: 1550,
    website: 1000,
    other: 380,
  },
  {
    month: 'Mar',
    shopify: 4100,
    etsy: 2750,
    amazon: 1600,
    website: 1050,
    other: 400,
  },
  {
    month: 'Apr',
    shopify: 4200,
    etsy: 2850,
    amazon: 1650,
    website: 1100,
    other: 420,
  },
  {
    month: 'May',
    shopify: 4300,
    etsy: 2950,
    amazon: 1700,
    website: 1150,
    other: 440,
  },
  {
    month: 'Jun',
    shopify: 4400,
    etsy: 3050,
    amazon: 1750,
    website: 1200,
    other: 460,
  },
];

const PlatformRevenueChart: React.FC = () => {
  const { filters, loading } = useFinancial();
  const [revenueData, setRevenueData] = useState(mockPlatformRevenueData);

  // In a real implementation, this would fetch data from the API
  useEffect(() => {
    // This would be replaced with an actual API call
    setRevenueData(mockPlatformRevenueData);
  }, [filters]);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-600'></div>
          <p className='mt-2 text-sm text-stone-500'>Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (!revenueData.length) {
    return (
      <div className='flex items-center justify-center h-full'>
        <p className='text-stone-500'>No revenue data available</p>
      </div>
    );
  }

  // Color map for platforms
  const colorMap = {
    shopify: '#7dd3fc', // light blue
    etsy: '#fda4af', // light red
    amazon: '#fcd34d', // light yellow
    website: '#86efac', // light green
    other: '#d8b4fe', // light purple
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-4 shadow-md rounded-md border border-stone-200'>
          <p className='font-medium text-stone-900'>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={`platform-${index}`}
              className='text-sm'
              style={{ color: entry.color }}
            >
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
          {payload.length > 1 && (
            <p className='text-sm font-medium text-stone-800 pt-1 mt-1 border-t border-stone-200'>
              Total:{' '}
              {formatCurrency(
                payload.reduce(
                  (sum: number, entry: any) => sum + entry.value,
                  0
                )
              )}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width='100%' height='100%'>
      <LineChart
        data={revenueData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
        <XAxis dataKey='month' stroke='#78716c' tick={{ fontSize: 12 }} />
        <YAxis
          stroke='#78716c'
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type='monotone'
          dataKey='shopify'
          stroke={colorMap.shopify}
          strokeWidth={2}
          name='Shopify'
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type='monotone'
          dataKey='etsy'
          stroke={colorMap.etsy}
          strokeWidth={2}
          name='Etsy'
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type='monotone'
          dataKey='amazon'
          stroke={colorMap.amazon}
          strokeWidth={2}
          name='Amazon'
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type='monotone'
          dataKey='website'
          stroke={colorMap.website}
          strokeWidth={2}
          name='Website'
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type='monotone'
          dataKey='other'
          stroke={colorMap.other}
          strokeWidth={2}
          name='Other'
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PlatformRevenueChart;
