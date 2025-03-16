// src/components/dashboard/SalesStatsCard.tsx
import React from 'react';
import { useSales } from '../../context/SalesContext';
import { FulfillmentStatus } from '../../types/salesTypes';
import StatCard from './StatCard';

const SalesStatsCard: React.FC = () => {
  const { sales, loading } = useSales();

  // Define the sales icon that we'll use in both loading and loaded states
  const salesIcon = (
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
        d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
      />
    </svg>
  );

  if (loading)
    return (
      <StatCard
        title='Sales'
        value='--'
        color='amber'
        icon={salesIcon} // Add the icon to the loading state
      />
    );

  const pendingFulfillment = sales.filter(
    (sale) => sale.fulfillmentStatus === FulfillmentStatus.PENDING
  ).length;

  return (
    <StatCard
      title='Sales'
      value={sales.length}
      icon={salesIcon}
      color='amber'
      detail={`${pendingFulfillment} pending fulfillment`}
      percentage={
        pendingFulfillment > 0
          ? Math.min(100, (pendingFulfillment / sales.length) * 100)
          : 0
      }
    />
  );
};

export default SalesStatsCard;
