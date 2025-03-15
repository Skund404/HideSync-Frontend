// src/pages/Dashboard.tsx
import ProjectTimelineWidget from '@/components/dashboard/ProjectTimelineWidget';
import PurchaseOrderStatsCard from '@/components/dashboard/PurchaseOrderStatsCard';
import PurchaseTimelineWidget from '@/components/dashboard/PurchaseTimelineWidget';
import StorageSummaryWidget from '@/components/dashboard/StorageSummaryWidget';
import SupplierActivityWidget from '@/components/dashboard/SupplierActivityWidget';
import SupplierStatsCard from '@/components/dashboard/SupplierStatsCard';
import { ProjectProvider } from '@/context/ProjectContext';
import { PurchaseOrderProvider } from '@/context/PurchaseContext';
import { PurchaseTimelineProvider } from '@/context/PurchaseTimelineContext';
import { SupplierProvider } from '@/context/SupplierContext';
import { Wrench } from 'lucide-react';
import React from 'react';
import PickingListStatsCard from '../components/dashboard/PickingListStatsCard';
import RecurringProjectStatsCard from '../components/dashboard/RecurringProjectStatsCard';
import StatCard from '../components/dashboard/StatCard';
import TemplateStatsCard from '../components/dashboard/TemplateStatsCard';
import ToolDashboardCards from '../components/dashboard/ToolDashboardCards';
import { ToolProvider, useTools } from '../context/ToolContext';
import { useDashboard } from '../hooks/useDashboard';

// Tool Stats component using hooks directly
const ToolStatsCard = () => {
  const { getNeedsAttention } = useTools();
  const needsAttention = getNeedsAttention();

  return (
    <StatCard
      title='Tools Needing Attention'
      value={needsAttention.length}
      icon={<Wrench className='h-6 w-6' />}
      color='purple'
      detail={`${
        needsAttention.length > 0 ? needsAttention.length - 1 : 0
      } overdue maintenance`}
      percentage={25}
    />
  );
};

const Dashboard: React.FC = () => {
  const { data: safeData, loading, error } = useDashboard();

  if (loading) {
    return (
      <div className='flex justify-center items-center h-full'>
        Loading dashboard data...
      </div>
    );
  }

  if (error || !safeData) {
    return <div className='text-red-500'>Error loading dashboard data</div>;
  }

  return (
    <div>
      {/* Summary Cards - First Row */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <StatCard
          title='Active Projects'
          value={safeData.activeProjects}
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
                d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
              />
            </svg>
          }
          color='amber'
          detail='3 due this week'
          trend={{ value: '10%', isPositive: true }}
          percentage={75}
        />

        <StatCard
          title='Pending Orders'
          value={safeData.pendingOrders}
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
                d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
              />
            </svg>
          }
          color='blue'
          detail='2 awaiting materials'
          trend={{ value: '5%', isPositive: false }}
          percentage={60}
        />

        <StatCard
          title='Materials to Reorder'
          value={safeData.materialsToReorder}
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
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
              />
            </svg>
          }
          color='red'
          detail='Includes 2 critical items'
          percentage={30}
        />

        {/* Tool Management Card - Using a wrapper component to get context data */}
        <ToolProvider>
          <ToolStatsCard />
        </ToolProvider>
      </div>

      {/* Supplier and Purchase Order Stats - New Row */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6'>
        <SupplierProvider>
          <SupplierStatsCard />
        </SupplierProvider>

        <PurchaseOrderProvider>
          <PurchaseOrderStatsCard />
        </PurchaseOrderProvider>

        {/* Additional stat cards can be placed here in the future */}
      </div>

      {/* Project Templates, Recurring Projects, and Picking Lists Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-6'>
        <TemplateStatsCard />
        <RecurringProjectStatsCard />
        <PickingListStatsCard />
      </div>

      {/* Supplier and Purchase Activity Widgets */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
        <SupplierProvider>
          <SupplierActivityWidget />
        </SupplierProvider>

        <PurchaseTimelineProvider>
          <PurchaseTimelineWidget />
        </PurchaseTimelineProvider>
      </div>

      {/* Project Timeline and Storage Widgets */}
      <ProjectProvider>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
          <ProjectTimelineWidget />
          <StorageSummaryWidget />
        </div>
      </ProjectProvider>

      {/* Tool Management Cards */}
      <ToolProvider>
        <div className='mt-6'>
          <h3 className='text-lg font-medium text-stone-800 mb-4'>
            Tool Management
          </h3>
          <ToolDashboardCards />
        </div>
      </ToolProvider>
    </div>
  );
};

export default Dashboard;
