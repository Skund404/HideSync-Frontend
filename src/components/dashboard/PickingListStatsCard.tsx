// src/components/dashboard/PickingListStatsCard.tsx
import React from 'react';
import { usePickingLists } from '../../context/PickingListContext';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';
import StatCard from './StatCard';

/**
 * Displays summary statistics for picking lists.
 * Consistently named with other stat card components.
 */
const PickingListStatsCard: React.FC = () => {
  const { pickingLists, loading, error } = usePickingLists();

  // Handle loading state
  if (loading) {
    return (
      <div className='bg-white shadow-sm rounded-lg p-4 border border-stone-200'>
        <LoadingSpinner
          size='small'
          color='amber'
          message='Loading picking list data...'
        />
      </div>
    );
  }

  // Handle error state - since refreshPickingLists isn't available in the context,
  // we'll omit the onRetry prop
  if (error) {
    return (
      <div className='bg-white shadow-sm rounded-lg p-4 border border-stone-200'>
        <ErrorMessage message={`Failed to load picking list data: ${error}`} />
      </div>
    );
  }

  // Calculate stats with null handling
  const totalLists = pickingLists?.length || 0;
  const pendingLists =
    pickingLists?.filter((list) => list.status === 'pending')?.length || 0;

  return (
    <StatCard
      title='Picking Lists'
      value={totalLists}
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
            d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
          />
        </svg>
      }
      color='amber'
      detail={`${pendingLists} pending`}
      percentage={
        totalLists > 0 ? Math.min(100, (pendingLists / totalLists) * 100) : 0
      }
    />
  );
};

export default PickingListStatsCard;
