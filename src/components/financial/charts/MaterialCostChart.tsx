import React from 'react';
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
import { formatCurrency } from '../../../utils/financialHelpers';

const MaterialCostChart: React.FC = () => {
  const { materialCosts, loading } = useFinancial();

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

  if (!materialCosts.length) {
    return (
      <div className='flex items-center justify-center h-full'>
        <p className='text-stone-500'>No material cost data available</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce(
        (sum: number, entry: any) => sum + entry.value,
        0
      );

      return (
        <div className='bg-white p-4 shadow-md rounded-md border border-stone-200'>
          <p className='font-medium'>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className='text-sm' style={{ color: entry.color }}>
              <span>{entry.name}: </span>
              {formatCurrency(entry.value)}
              <span className='text-stone-500 ml-1'>
                ({((entry.value / total) * 100).toFixed(1)}%)
              </span>
            </p>
          ))}
          <p className='text-sm font-medium mt-1 pt-1 border-t border-stone-200'>
            Total: {formatCurrency(total)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width='100%' height='100%'>
      <BarChart
        data={materialCosts}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
        <XAxis dataKey='month' stroke='#78716c' tick={{ fontSize: 12 }} />
        <YAxis
          stroke='#78716c'
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: 10 }} iconType='circle' />
        <Bar dataKey='leather' stackId='a' fill='#d97706' name='Leather' />
        <Bar dataKey='hardware' stackId='a' fill='#0ea5e9' name='Hardware' />
        <Bar dataKey='thread' stackId='a' fill='#059669' name='Thread' />
        <Bar dataKey='other' stackId='a' fill='#7c3aed' name='Other' />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MaterialCostChart;
