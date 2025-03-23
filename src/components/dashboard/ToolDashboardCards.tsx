// src/components/dashboard/ToolDashboardCards.tsx
//
// Dashboard stat cards for tools that can be integrated into the main dashboard.
// Uses the StatCard component pattern for consistent UI.
// Updated to work with API integration.

import ErrorMessage from '@/components/common/ErrorMessage';
import StatCard from '@/components/dashboard/StatCard';
import { useTools } from '@/context/ToolContext';
import { ToolStatus } from '@/types/toolType';
import { AlertTriangle, Calendar, Users, Wrench } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Tool dashboard cards component that displays tool stats in the dashboard
 */
const ToolDashboardCards: React.FC = () => {
  const {
    tools,
    getUpcomingMaintenance,
    getOverdueMaintenance,
    getCurrentlyCheckedOut,
    getNeedsAttention,
    countToolsByStatus,
    loading,
    error,
    refreshTools,
  } = useTools();

  // Retry functionality for error case
  const handleRetry = async () => {
    await refreshTools();
  };

  // Loading state
  if (loading.tools) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className='bg-white p-6 rounded-lg shadow-sm border border-stone-200 animate-pulse h-32'
          >
            <div className='flex justify-between items-start'>
              <div>
                <div className='h-4 w-24 bg-stone-200 rounded mb-2'></div>
                <div className='h-8 w-12 bg-stone-200 rounded'></div>
              </div>
              <div className='bg-stone-200 p-3 rounded-md h-12 w-12'></div>
            </div>
            <div className='mt-4'>
              <div className='h-4 w-40 bg-stone-200 rounded'></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error.tools) {
    return (
      <div className='mb-6'>
        <ErrorMessage
          message={`Failed to load tool stats: ${error.tools}`}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  // Calculate metrics
  const toolCount = tools.length;
  const upcomingMaintenance = getUpcomingMaintenance();
  const overdueMaintenance = getOverdueMaintenance();
  const checkedOut = getCurrentlyCheckedOut();
  const needsAttention = getNeedsAttention();
  const statusCounts = countToolsByStatus();

  // Calculate available percentage
  const availablePercentage =
    (statusCounts[ToolStatus.IN_STOCK] / (toolCount || 1)) * 100;

  // Calculate maintenance percentage (percentage of tools that are current on maintenance)
  const maintenancePercentage = toolCount
    ? ((toolCount - upcomingMaintenance.length - overdueMaintenance.length) /
        toolCount) *
      100
    : 0;

  // Calculate percentage of tools checked out
  const checkedOutPercentage = (checkedOut.length / (toolCount || 1)) * 100;

  // Calculate percentage of tools needing attention
  const needsAttentionPercentage =
    (needsAttention.length / (toolCount || 1)) * 100;

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
      <Link to='/tools' className='block'>
        <StatCard
          title='Tools Inventory'
          value={toolCount}
          icon={<Wrench className='h-6 w-6' />}
          color='amber'
          detail={`${statusCounts[ToolStatus.IN_STOCK]} available`}
          percentage={availablePercentage}
        />
      </Link>

      <Link to='/tools?tab=maintenance' className='block'>
        <StatCard
          title='Upcoming Maintenance'
          value={upcomingMaintenance.length}
          icon={<Calendar className='h-6 w-6' />}
          color='blue'
          detail={
            upcomingMaintenance.length > 0
              ? `Next: ${upcomingMaintenance[0].name}`
              : 'No upcoming maintenance'
          }
          percentage={maintenancePercentage}
          invertPercentage={true} // Higher percentage is better for maintenance
        />
      </Link>

      <Link to='/tools?tab=checkout' className='block'>
        <StatCard
          title='Checked Out'
          value={checkedOut.length}
          icon={<Users className='h-6 w-6' />}
          color='green'
          detail={`${checkedOut.length} of ${toolCount} tools`}
          percentage={checkedOutPercentage}
        />
      </Link>

      <Link to='/tools?tab=maintenance&filter=attention' className='block'>
        <StatCard
          title='Needs Attention'
          value={needsAttention.length}
          icon={<AlertTriangle className='h-6 w-6' />}
          color='red'
          detail={`${overdueMaintenance.length} overdue maintenance`}
          percentage={needsAttentionPercentage}
          invertPercentage={true} // Lower is better for "needs attention"
        />
      </Link>
    </div>
  );
};

export default ToolDashboardCards;
