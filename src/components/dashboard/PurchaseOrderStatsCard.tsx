// src/components/dashboard/PurchaseOrderStatsCard.tsx
import StatCard from '@/components/dashboard/StatCard';
import usePurchaseMetrics from '@/hooks/usePurchaseMetrics';
import React from 'react';

const PurchaseOrderStatsCard: React.FC = () => {
  const metrics = usePurchaseMetrics();

  // Updated to use correct property names from our metrics hook
  return (
    <StatCard
      title='Purchase Orders'
      value={metrics.totalOrders}
      icon={
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-6 w-6'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
          />
        </svg>
      }
      color='amber'
      detail={`${metrics.inProgress} in progress`}
      percentage={
        metrics.totalOrders > 0
          ? (metrics.inProgress / metrics.totalOrders) * 100
          : 0
      }
      trend={
        metrics.spendingTrend !== 0
          ? {
              value: `${Math.abs(metrics.spendingTrend).toFixed(1)}%`,
              isPositive: metrics.spendingTrend > 0,
            }
          : undefined
      }
    />
  );
};

export default PurchaseOrderStatsCard;
