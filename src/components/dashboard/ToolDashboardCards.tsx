// src/components/dashboard/ToolDashboardCards.tsx
//
// Dashboard stat cards for tools that can be integrated into the main dashboard.
// Uses the StatCard component pattern for consistent UI.

import { ToolStatus } from '@/types/toolType';
import StatCard from '@components/dashboard/StatCard';
import { useTools } from '@context/ToolContext';
import { AlertTriangle, Calendar, Users, Wrench } from 'lucide-react';
import React from 'react';
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
  } = useTools();

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

  // Calculate maintenance percentage
  const maintenancePercentage = toolCount
    ? ((toolCount - upcomingMaintenance.length - overdueMaintenance.length) /
        toolCount) *
      100
    : 0;

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
      <StatCard
        title='Tools Inventory'
        value={toolCount}
        icon={<Wrench className='h-6 w-6' />}
        color='amber'
        detail={`${statusCounts[ToolStatus.IN_STOCK]} available`}
        percentage={availablePercentage}
      />

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
      />

      <StatCard
        title='Checked Out'
        value={checkedOut.length}
        icon={<Users className='h-6 w-6' />}
        color='green'
        detail={`${checkedOut.length} of ${toolCount} tools`}
        percentage={(checkedOut.length / (toolCount || 1)) * 100}
      />

      <StatCard
        title='Needs Attention'
        value={needsAttention.length}
        icon={<AlertTriangle className='h-6 w-6' />}
        color='red'
        detail={`${overdueMaintenance.length} overdue maintenance`}
        percentage={(needsAttention.length / (toolCount || 1)) * 100}
      />
    </div>
  );
};

export default ToolDashboardCards;
