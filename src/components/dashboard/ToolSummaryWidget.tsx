// src/components/dashboard/ToolSummaryWidget.tsx
//
// A dashboard widget that displays tool status information,
// upcoming maintenance needs, and tools that need attention.
// Similar to the StorageSummaryWidget pattern.

import { ToolStatus } from '@/types/toolType';
import { useTools } from '@context/ToolContext';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

/**
 * A dashboard widget that shows a summary of tool information
 */
const ToolSummaryWidget: React.FC = () => {
  const {
    tools,
    getUpcomingMaintenance,
    getOverdueMaintenance,
    getNeedsAttention,
    getCurrentlyCheckedOut,
  } = useTools();

  // Safety check for empty tools or null context
  if (!tools || tools.length === 0) {
    return (
      <div className='bg-white rounded-lg shadow-sm border border-stone-200 p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='font-medium text-stone-800'>Tool Status</h3>
          <Link
            to='/tools'
            className='text-sm text-amber-600 hover:text-amber-800'
          >
            View All
          </Link>
        </div>
        <div className='text-center p-4 bg-stone-50 rounded-md text-stone-500 text-sm'>
          <p>No tools found in inventory</p>
        </div>
        <Link
          to='/tools'
          className='mt-6 block w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-sm font-medium text-center'
        >
          Manage Tools
        </Link>
      </div>
    );
  }

  // Calculate metrics
  const upcomingMaintenance = getUpcomingMaintenance();
  const overdueMaintenance = getOverdueMaintenance();
  const needsAttention = getNeedsAttention();
  const checkedOut = getCurrentlyCheckedOut();
  const inStock = tools.filter((t) => t.status === ToolStatus.IN_STOCK);

  return (
    <div className='bg-white rounded-lg shadow-sm border border-stone-200 p-6'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='font-medium text-stone-800'>Tool Status</h3>
        <Link
          to='/tools'
          className='text-sm text-amber-600 hover:text-amber-800'
        >
          View All
        </Link>
      </div>

      <div className='grid grid-cols-3 gap-3 mb-6'>
        <div className='border border-stone-200 rounded-md p-3 text-center'>
          <div className='text-sm text-stone-500 mb-1'>Total Tools</div>
          <div className='text-xl font-bold text-stone-800'>{tools.length}</div>
        </div>
        <div className='border border-stone-200 rounded-md p-3 text-center'>
          <div className='text-sm text-stone-500 mb-1'>Available</div>
          <div className='text-xl font-bold text-stone-800'>
            {inStock.length}
          </div>
        </div>
        <div className='border border-stone-200 rounded-md p-3 text-center'>
          <div className='text-sm text-stone-500 mb-1'>Checked Out</div>
          <div className='text-xl font-bold text-stone-800'>
            {checkedOut.length}
          </div>
        </div>
      </div>

      <div className='mb-6'>
        <div className='flex justify-between items-center mb-2'>
          <div className='text-sm text-stone-500'>Maintenance Status</div>
          <div
            className={`text-sm font-medium ${
              overdueMaintenance.length > 0
                ? 'text-red-600'
                : upcomingMaintenance.length > 0
                ? 'text-amber-600'
                : 'text-green-600'
            }`}
          >
            {overdueMaintenance.length > 0
              ? `${overdueMaintenance.length} Overdue`
              : upcomingMaintenance.length > 0
              ? `${upcomingMaintenance.length} Upcoming`
              : 'All Current'}
          </div>
        </div>
        <div className='h-2 bg-stone-100 rounded-full overflow-hidden'>
          <div
            className={`h-full rounded-full ${
              overdueMaintenance.length > 0
                ? 'bg-red-500'
                : upcomingMaintenance.length > 0
                ? 'bg-amber-500'
                : 'bg-green-500'
            }`}
            style={{
              width: `${Math.min(
                100,
                ((tools.length -
                  overdueMaintenance.length -
                  upcomingMaintenance.length) /
                  tools.length) *
                  100 || 0
              )}%`,
            }}
          ></div>
        </div>
      </div>

      {needsAttention.length > 0 ? (
        <div>
          <h4 className='text-sm font-medium text-stone-700 mb-2'>
            Needs Attention
          </h4>
          <div className='space-y-2'>
            {needsAttention.slice(0, 3).map((tool) => (
              <div
                key={tool.id}
                className='flex justify-between items-center p-2 bg-stone-50 rounded-md border border-stone-200'
              >
                <div>
                  <div className='text-sm font-medium text-stone-700'>
                    {tool.name}
                  </div>
                  <div className='text-xs text-stone-500'>
                    {tool.status === ToolStatus.MAINTENANCE
                      ? 'In maintenance'
                      : tool.status === ToolStatus.DAMAGED
                      ? 'Damaged'
                      : 'Lost'}
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tool.status === ToolStatus.LOST
                      ? 'bg-red-100 text-red-800'
                      : tool.status === ToolStatus.DAMAGED
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {tool.status.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className='text-center p-4 bg-green-50 rounded-md text-green-700 text-sm'>
          <CheckCircle className='h-6 w-6 mx-auto mb-2' />
          All tools are in good condition
        </div>
      )}

      {upcomingMaintenance.length > 0 && (
        <div className='mt-4'>
          <h4 className='text-sm font-medium text-stone-700 mb-2'>
            Upcoming Maintenance
          </h4>
          <div className='space-y-2'>
            {upcomingMaintenance.slice(0, 2).map((tool) => (
              <div
                key={`upcoming-${tool.id}`}
                className='flex items-start p-3 border-l-4 border-amber-500 bg-amber-50 rounded-r-md'
              >
                <div className='mr-3'>
                  <Clock className='h-5 w-5 text-amber-600' />
                </div>
                <div className='flex-1'>
                  <div className='font-medium text-stone-800'>{tool.name}</div>
                  <div className='text-xs text-stone-500 mt-1'>
                    Due: {tool.nextMaintenance}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {overdueMaintenance.length > 0 && (
        <div className='mt-4'>
          <h4 className='text-sm font-medium text-stone-700 mb-2'>
            Overdue Maintenance
          </h4>
          <div className='space-y-2'>
            {overdueMaintenance.slice(0, 2).map((tool) => (
              <div
                key={`overdue-${tool.id}`}
                className='flex items-start p-3 border-l-4 border-red-500 bg-red-50 rounded-r-md'
              >
                <div className='mr-3'>
                  <AlertTriangle className='h-5 w-5 text-red-600' />
                </div>
                <div className='flex-1'>
                  <div className='font-medium text-stone-800'>{tool.name}</div>
                  <div className='text-xs text-stone-500 mt-1'>
                    Overdue since: {tool.nextMaintenance}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link
        to='/tools'
        className='mt-6 block w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-sm font-medium text-center'
      >
        Manage Tools
      </Link>
    </div>
  );
};

export default ToolSummaryWidget;
