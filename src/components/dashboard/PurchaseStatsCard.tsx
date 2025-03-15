// src/components/dashboard/PurchaseStatsCard.tsx
import StatCard from '@/components/dashboard/StatCard';
import usePurchaseMetrics from '@/hooks/usePurchaseMetrics';
import React from 'react';

const PurchaseStatsCard: React.FC = () => {
  const { totalOrders, inProgress, spendingTrend } = usePurchaseMetrics();

  return (
    <StatCard
      title='Purchase Orders'
      value={totalOrders}
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
      detail={`${inProgress} in progress`}
      percentage={Math.min(
        100,
        totalOrders > 0 ? (inProgress / totalOrders) * 100 : 0
      )}
      trend={
        spendingTrend !== 0
          ? {
              value: `${Math.abs(spendingTrend).toFixed(1)}%`,
              isPositive: spendingTrend > 0,
            }
          : undefined
      }
    />
  );
};

export default PurchaseStatsCard;
