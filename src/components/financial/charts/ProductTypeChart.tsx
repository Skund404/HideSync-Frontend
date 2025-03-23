// src/components/financial/charts/ProductTypeChart.tsx
import React, { useState } from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useFinancial } from '../../../context/FinancialContext';
import {
  formatCurrency,
  formatPercentage,
} from '../../../utils/financialHelpers';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';

const COLORS = ['#d97706', '#0ea5e9', '#059669', '#7c3aed', '#ec4899'];

const ProductTypeChart: React.FC = () => {
  const { productMetrics, loading, loadingState, error, refreshData } = useFinancial();
  const [activeMetric, setActiveMetric] = useState<'sales' | 'margin'>('sales');

  // Specific loading state for this component
  if (loading || loadingState.productMetrics) {
    return (
      <div className='flex items-center justify-center h-full'>
        <LoadingSpinner
          size="medium"
          color="amber"
          message="Loading product data..."
        />
      </div>
    );
  }

  // Handle error state with retry option
  if (error) {
    return (
      <div className='flex items-center justify-center h-full'>
        <ErrorMessage 
          message="Unable to load product data. Please try again." 
          onRetry={refreshData} 
        />
      </div>
    );
  }

  // Handle empty data state
  if (!productMetrics.length) {
    return (
      <div className='flex items-center justify-center h-full'>
        <p className='text-stone-500'>No product data available</p>
      </div>
    );
  }

  // Calculate totals for percentage display
  const totalSales = productMetrics.reduce(
    (sum, product) => sum + product.sales,
    0
  );

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className='bg-white p-4 shadow-md rounded-md border border-stone-200'>
          <p className='font-medium'>{data.name}</p>
          <p className='text-sm'>
            <span className='text-stone-600'>Sales: </span>
            {formatCurrency(data.sales)}
          </p>
          <p className='text-sm'>
            <span className='text-stone-600'>Margin: </span>
            {formatPercentage(data.margin)}
          </p>
          <p className='text-sm'>
            <span className='text-stone-600'>Units: </span>
            {data.quantity || 'N/A'}
          </p>
          <p className='text-sm'>
            <span className='text-stone-600'>% of Total: </span>
            {((data.sales / totalSales) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLabel = ({ name, percent }: any) => {
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <div className='h-full flex flex-col'>
      <div className='flex justify-center mb-2'>
        <div className='inline-flex rounded-md shadow-sm' role='group'>
          <button
            type='button'
            className={`px-4 py-1 text-sm font-medium rounded-l-lg ${
              activeMetric === 'sales'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-stone-700 hover:bg-stone-100'
            }`}
            onClick={() => setActiveMetric('sales')}
          >
            By Sales
          </button>
          <button
            type='button'
            className={`px-4 py-1 text-sm font-medium rounded-r-lg ${
              activeMetric === 'margin'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-stone-700 hover:bg-stone-100'
            }`}
            onClick={() => setActiveMetric('margin')}
          >
            By Margin
          </button>
        </div>
      </div>

      <div className='flex-grow'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={productMetrics}
              cx='50%'
              cy='50%'
              labelLine={false}
              label={renderLabel}
              outerRadius={80}
              fill='#8884d8'
              dataKey={activeMetric === 'sales' ? 'sales' : 'margin'}
              nameKey='name'
            >
              {productMetrics.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className='mt-4'>
        <h4 className='text-xs font-medium text-stone-500 uppercase mb-2'>
          {activeMetric === 'sales' ? 'Product Sales' : 'Product Margins'}
        </h4>
        <div className='space-y-2'>
          {productMetrics.map((product, index) => (
            <div key={product.name} className='flex items-center'>
              <div
                className='w-3 h-3 rounded-full mr-2'
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <div className='text-sm text-stone-700 flex-1'>
                {product.name}
              </div>
              <div className='text-sm font-medium text-stone-800'>
                {activeMetric === 'sales'
                  ? formatCurrency(product.sales)
                  : formatPercentage(product.margin)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductTypeChart;