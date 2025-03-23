// src/components/financial/charts/RevenueChart.tsx
import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useFinancial } from '../../../context/FinancialContext';
import { formatCurrency } from '../../../utils/financialHelpers';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';

const RevenueChart: React.FC = () => {
  const { revenueTrends, loading, loadingState, error, refreshData } = useFinancial();

  // Specific loading state for this component
  if (loading || loadingState.revenueTrends) {
    return (
      <div className='flex items-center justify-center h-full'>
        <LoadingSpinner
          size="medium"
          color="amber"
          message="Loading revenue data..."
        />
      </div>
    );
  }

  // Handle error state with retry option
  if (error) {
    return (
      <div className='flex items-center justify-center h-full'>
        <ErrorMessage 
          message="Unable to load revenue data. Please try again." 
          onRetry={refreshData} 
        />
      </div>
    );
  }

  // Handle empty data state
  if (!revenueTrends.length) {
    return (
      <div className='flex items-center justify-center h-full'>
        <p className='text-stone-500'>No revenue data available for the selected period</p>
      </div>
    );
  }

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-4 shadow-md rounded-md border border-stone-200'>
          <p className='font-medium'>{label}</p>
          <p className='text-sm'>
            <span className='text-amber-600'>Revenue: </span>
            {formatCurrency(payload[0].value)}
          </p>
          <p className='text-sm'>
            <span className='text-red-600'>Costs: </span>
            {formatCurrency(payload[1].value)}
          </p>
          <p className='text-sm'>
            <span className='text-green-600'>Profit: </span>
            {formatCurrency(payload[2].value)}
          </p>
          {payload[2].payload.margin && (
            <p className='text-sm'>
              <span className='text-blue-600'>Margin: </span>
              {payload[2].payload.margin.toFixed(1)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width='100%' height='100%'>
      <AreaChart
        data={revenueTrends}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
        <XAxis
          dataKey='month'
          stroke='#78716c'
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: '#78716c' }}
        />
        <YAxis
          stroke='#78716c'
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: '#78716c' }}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: 10 }} iconType='circle' />
        <Area
          type='monotone'
          dataKey='revenue'
          stroke='#d97706'
          fillOpacity={0.3}
          fill='#fffbeb'
          strokeWidth={2}
          name='Revenue'
        />
        <Area
          type='monotone'
          dataKey='costs'
          stroke='#ef4444'
          fillOpacity={0.3}
          fill='#fee2e2'
          strokeWidth={2}
          name='Costs'
        />
        <Area
          type='monotone'
          dataKey='profit'
          stroke='#10b981'
          fillOpacity={0.3}
          fill='#ecfdf5'
          strokeWidth={2}
          name='Profit'
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;