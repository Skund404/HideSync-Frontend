import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useFinancial } from '../../../context/FinancialContext';
import {
  formatCurrency,
  formatPercentage,
} from '../../../utils/financialHelpers';

type MetricType = 'sales' | 'profit' | 'margin' | 'orders' | 'fees';

const PlatformComparison: React.FC = () => {
  const { platformPerformance, loading } = useFinancial();
  const [activeMetric, setActiveMetric] = useState<MetricType>('sales');

  if (loading || !platformPerformance.length) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-600'></div>
          <p className='mt-2 text-sm text-stone-500'>
            Loading comparison data...
          </p>
        </div>
      </div>
    );
  }

  // Transform data for the chart
  const chartData = platformPerformance.map((platform) => ({
    name:
      platform.platform.charAt(0).toUpperCase() + platform.platform.slice(1),
    sales: platform.sales,
    profit: platform.profit,
    margin: platform.margin,
    orders: platform.orders,
    fees: platform.fees,
  }));

  // Color map for metrics
  const colorMap = {
    sales: '#d97706',
    profit: '#10b981',
    margin: '#3b82f6',
    orders: '#8b5cf6',
    fees: '#ef4444',
  };

  // Format values based on metric type
  const formatValue = (value: number, metric: MetricType) => {
    if (metric === 'margin') return formatPercentage(value);
    if (metric === 'orders') return value.toString();
    return formatCurrency(value);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-4 shadow-md rounded-md border border-stone-200'>
          <p className='font-medium text-stone-900'>{label}</p>
          <p className='text-sm' style={{ color: colorMap[activeMetric] }}>
            {activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)}:{' '}
            {formatValue(payload[0].value, activeMetric)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className='h-full flex flex-col'>
      <div className='flex justify-center mb-4'>
        <div className='inline-flex rounded-md shadow-sm' role='group'>
          <button
            type='button'
            className={`px-3 py-1 text-sm font-medium ${
              activeMetric === 'sales'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-stone-700 hover:bg-stone-100'
            } rounded-l-lg`}
            onClick={() => setActiveMetric('sales')}
          >
            Sales
          </button>
          <button
            type='button'
            className={`px-3 py-1 text-sm font-medium ${
              activeMetric === 'profit'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-stone-700 hover:bg-stone-100'
            }`}
            onClick={() => setActiveMetric('profit')}
          >
            Profit
          </button>
          <button
            type='button'
            className={`px-3 py-1 text-sm font-medium ${
              activeMetric === 'margin'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-stone-700 hover:bg-stone-100'
            }`}
            onClick={() => setActiveMetric('margin')}
          >
            Margin
          </button>
          <button
            type='button'
            className={`px-3 py-1 text-sm font-medium ${
              activeMetric === 'orders'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-stone-700 hover:bg-stone-100'
            }`}
            onClick={() => setActiveMetric('orders')}
          >
            Orders
          </button>
          <button
            type='button'
            className={`px-3 py-1 text-sm font-medium ${
              activeMetric === 'fees'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-stone-700 hover:bg-stone-100'
            } rounded-r-lg`}
            onClick={() => setActiveMetric('fees')}
          >
            Fees
          </button>
        </div>
      </div>

      <div className='flex-grow'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
            <XAxis dataKey='name' tick={{ fontSize: 12 }} stroke='#78716c' />
            <YAxis
              stroke='#78716c'
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                if (activeMetric === 'margin') return `${value}%`;
                if (activeMetric === 'orders') return value.toString();
                return `$${value.toLocaleString()}`;
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey={activeMetric}
              fill={colorMap[activeMetric]}
              name={
                activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)
              }
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PlatformComparison;
