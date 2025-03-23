// src/components/dashboard/StatCard.tsx
import React, { ReactNode, useMemo } from 'react';

export interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  color: 'blue' | 'green' | 'red' | 'amber';
  detail: string;
  percentage: number;
  invertPercentage?: boolean; // Optional prop for inverting percentage logic
  onClick?: () => void; // Added to support clickable cards
}

/**
 * A reusable stat card component for displaying metrics in a consistent way.
 * Used throughout the dashboard for various statistics.
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  detail,
  percentage,
  invertPercentage = false, // Default to false if not provided
  onClick,
}) => {
  // Memoize color classes to prevent recalculation on every render
  const colorClasses = useMemo(
    () => ({
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      red: 'bg-red-50 text-red-600',
      amber: 'bg-amber-50 text-amber-600',
    }),
    []
  );

  // Memoize percentage class to prevent recalculation
  const percentageClass = useMemo(() => {
    if (invertPercentage) {
      // For maintenance and needs attention, lower percentage is better
      return percentage <= 20
        ? 'text-green-600'
        : percentage <= 50
        ? 'text-yellow-600'
        : 'text-red-600';
    } else {
      // For standard cases, higher percentage is better
      return percentage >= 80
        ? 'text-green-600'
        : percentage >= 50
        ? 'text-yellow-600'
        : 'text-red-600';
    }
  }, [percentage, invertPercentage]);

  // Determine cursor style based on whether onClick is provided
  const cursorStyle = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`${colorClasses[color]} p-6 rounded-lg shadow-sm border border-stone-200 hover:shadow-md transition-shadow ${cursorStyle}`}
      onClick={onClick}
    >
      <div className='flex justify-between items-start'>
        <div>
          <p className='text-sm font-medium text-stone-500 mb-1'>{title}</p>
          <p className='text-2xl font-bold'>{value}</p>
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-md`}>{icon}</div>
      </div>
      <div className='mt-4 flex justify-between items-center'>
        <p className='text-sm text-stone-500'>{detail}</p>
        <p className={`text-sm font-medium ${percentageClass}`}>
          {percentage.toFixed(1)}%
        </p>
      </div>
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(StatCard);
