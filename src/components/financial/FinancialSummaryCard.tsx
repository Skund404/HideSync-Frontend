import { TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';
import { formatCurrency, formatPercentage } from '../../utils/financialHelpers';

interface FinancialSummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  trendLabel?: string;
  isCurrency?: boolean;
  isPercentage?: boolean;
  color?: 'green' | 'amber' | 'blue' | 'red' | 'purple';
}

const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendLabel = 'from last month',
  isCurrency = false,
  isPercentage = false,
  color = 'amber',
}) => {
  // Format the value based on type
  const formattedValue = isCurrency
    ? formatCurrency(value)
    : isPercentage
    ? formatPercentage(value)
    : value.toLocaleString();

  // Color classes mapping
  const colorClasses = {
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    red: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className='bg-white rounded-lg shadow-sm p-6 border border-stone-200'>
      <div className='flex justify-between items-start'>
        <div>
          <h3 className='text-sm font-medium text-stone-500'>{title}</h3>
          <p className='text-2xl font-bold text-stone-800 mt-1'>
            {formattedValue}
          </p>

          {trend && (
            <p
              className={`text-xs font-medium mt-1 flex items-center ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className='h-3 w-3 mr-1' />
              ) : (
                <TrendingDown className='h-3 w-3 mr-1' />
              )}
              <span>
                {trend.isPositive ? '↑' : '↓'}{' '}
                {Math.abs(trend.value).toFixed(1)}%
                {trendLabel && ` ${trendLabel}`}
              </span>
            </p>
          )}
        </div>

        <div className={`p-3 rounded-md ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
};

export default FinancialSummaryCard;
