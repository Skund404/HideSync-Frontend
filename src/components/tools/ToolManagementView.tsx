// src/components/tools/ToolManagementView.tsx
//
// This is the main container component for the Tool Management module.
// It follows the structure of the provided example, with tabs for
// Inventory, Maintenance, and Checkout views.
//
// This component uses the ToolContext for state management and displays
// summary cards for key metrics at the top.
// Updated to work with API integration.

import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ToolDetailModal from '@/components/tools/common/ToolDetailModal';
import ToolFilter from '@/components/tools/common/ToolFilter';
import ToolForm from '@/components/tools/common/ToolForm';
import ToolInventoryList from '@/components/tools/inventory/ToolInventoryList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTools } from '@/context/ToolContext';
import useToast from '@/hooks/useToast';
import { ToolFilters } from '@/services/tool-service';
import { Tool } from '@/types/toolType';
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  Edit,
  Eye,
  Filter,
  PlusCircle,
  RefreshCcw,
  RotateCw,
  Search,
  Users,
} from 'lucide-react';
import React, { useRef, useState } from 'react';

const ToolManagementView: React.FC = () => {
  // Access tool context
  const {
    tools,
    maintenanceRecords,
    checkoutRecords,
    getUpcomingMaintenance,
    getOverdueMaintenance,
    getCurrentlyCheckedOut,
    getNeedsAttention,
    loading,
    error,
    refreshTools,
    refreshMaintenanceRecords,
    refreshCheckoutRecords,
    applyFilters,
    resetFilters, // Used in handleResetFilters function
  } = useTools();

  const { showToast } = useToast();

  // State
  const [tabValue, setTabValue] = useState('inventory'); // Renamed from activeTab for clarity
  const [showFilter, setShowFilter] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<ToolFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  // Use useRef to properly manage the search timeout
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculated metrics
  const upcomingMaintenance = getUpcomingMaintenance();
  const overdueMaintenance = getOverdueMaintenance();
  const currentlyCheckedOut = getCurrentlyCheckedOut();
  const needsAttention = getNeedsAttention();

  // Handle view tool details
  const handleViewTool = (tool: Tool) => {
    setSelectedTool(tool);
    setIsModalOpen(true);
  };

  // Handle edit tool
  const handleEditTool = (tool: Tool) => {
    setSelectedTool(tool);
    setIsAddFormOpen(true); // Changed to use the form for editing
  };

  // Handle filters
  const handleFilterChange = (filters: ToolFilters) => {
    setCurrentFilters(filters);
    applyFilters(filters);
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous timeout if it exists
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      const filters = { ...currentFilters, search: value || undefined };
      setCurrentFilters(filters);
      applyFilters(filters);
    }, 500);
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filters = { ...currentFilters, search: searchQuery || undefined };
    setCurrentFilters(filters);
    applyFilters(filters);
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await refreshTools();
      await refreshMaintenanceRecords();
      await refreshCheckoutRecords();
      showToast('success', 'Data refreshed successfully');
    } catch (error) {
      showToast('error', 'Failed to refresh data');
    }
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setCurrentFilters({});
    setSearchQuery('');
    resetFilters();
    showToast('info', 'Filters have been reset');
  };

  return (
    <div className='flex-1 flex flex-col overflow-hidden bg-stone-50'>
      {/* Top Header */}
      <header className='bg-white shadow-sm z-10 p-4 flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <h1 className='text-xl font-semibold text-stone-900'>
            Tool Management
          </h1>
          <div className='text-sm hidden md:block'>
            <span className='text-stone-500'>Dashboard / Tool Management</span>
          </div>
        </div>

        <div className='flex items-center space-x-4'>
          <form
            className='relative hidden md:block'
            onSubmit={handleSearchSubmit}
          >
            <input
              type='text'
              placeholder='Search tools...'
              className='w-64 bg-stone-100 border border-stone-300 rounded-md py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              value={searchQuery}
              onChange={handleSearchChange}
              disabled={loading.tools}
            />
            <button
              type='submit'
              className='absolute right-3 top-2.5 text-stone-400'
              disabled={loading.tools}
            >
              <Search className='h-5 w-5' />
            </button>
          </form>

          <button
            className='bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center'
            onClick={() => setIsAddFormOpen(true)}
            disabled={loading.tools}
          >
            <PlusCircle className='h-5 w-5 mr-2' />
            Add Tool
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className='flex-1 overflow-y-auto p-6'>
        {/* Summary Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
          {/* Skeleton loader for cards while data is loading */}
          {loading.tools && (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className='bg-white p-6 rounded-lg shadow-sm border border-stone-200 animate-pulse'
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
            </>
          )}

          {/* Actual cards when data is loaded */}
          {!loading.tools && (
            <>
              <div className='bg-white p-6 rounded-lg shadow-sm border border-stone-200'>
                <div className='flex justify-between items-start'>
                  <div>
                    <h3 className='text-sm font-medium text-stone-500'>
                      Tools Inventory
                    </h3>
                    <p className='text-3xl font-bold text-stone-800 mt-1'>
                      {tools.length}
                    </p>
                  </div>
                  <div className='bg-amber-100 p-3 rounded-md'>
                    <RotateCw className='h-6 w-6 text-amber-700' />
                  </div>
                </div>
                <div className='mt-4'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-stone-500'>
                      {tools.filter((t) => t.status === 'IN_STOCK').length}{' '}
                      available
                    </span>
                  </div>
                </div>
              </div>

              <div className='bg-white p-6 rounded-lg shadow-sm border border-stone-200'>
                <div className='flex justify-between items-start'>
                  <div>
                    <h3 className='text-sm font-medium text-stone-500'>
                      Upcoming Maintenance
                    </h3>
                    <p className='text-3xl font-bold text-stone-800 mt-1'>
                      {upcomingMaintenance.length}
                    </p>
                  </div>
                  <div className='bg-blue-100 p-3 rounded-md'>
                    <Calendar className='h-6 w-6 text-blue-600' />
                  </div>
                </div>
                <div className='mt-4'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-stone-500'>
                      Next:{' '}
                      {upcomingMaintenance.length > 0
                        ? upcomingMaintenance[0].name
                        : 'None'}
                    </span>
                  </div>
                </div>
              </div>

              <div className='bg-white p-6 rounded-lg shadow-sm border border-stone-200'>
                <div className='flex justify-between items-start'>
                  <div>
                    <h3 className='text-sm font-medium text-stone-500'>
                      Checked Out
                    </h3>
                    <p className='text-3xl font-bold text-stone-800 mt-1'>
                      {currentlyCheckedOut.length}
                    </p>
                  </div>
                  <div className='bg-green-100 p-3 rounded-md'>
                    <Users className='h-6 w-6 text-green-600' />
                  </div>
                </div>
                <div className='mt-4'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-stone-500'>
                      Due soon:{' '}
                      {
                        checkoutRecords.filter(
                          (c) =>
                            c.status === 'Checked Out' &&
                            new Date(c.dueDate) <=
                              new Date(
                                new Date().setDate(new Date().getDate() + 3)
                              )
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className='bg-white p-6 rounded-lg shadow-sm border border-stone-200'>
                <div className='flex justify-between items-start'>
                  <div>
                    <h3 className='text-sm font-medium text-stone-500'>
                      Needs Attention
                    </h3>
                    <p className='text-3xl font-bold text-stone-800 mt-1'>
                      {needsAttention.length}
                    </p>
                  </div>
                  <div className='bg-red-100 p-3 rounded-md'>
                    <AlertTriangle className='h-6 w-6 text-red-600' />
                  </div>
                </div>
                <div className='mt-4'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-stone-500'>
                      {overdueMaintenance.length} overdue maintenance
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Global error display */}
        {(error.tools || error.maintenance || error.checkout) && (
          <div className='mb-6'>
            <ErrorMessage
              message={
                error.tools ||
                error.maintenance ||
                error.checkout ||
                'An error occurred'
              }
              onRetry={handleRefresh}
            />
          </div>
        )}

        {/* Tabs for Tool Content */}
        <Tabs
          defaultValue='inventory'
          className='w-full'
          value={tabValue}
          onValueChange={setTabValue}
        >
          <div className='flex justify-between items-center mb-6'>
            <TabsList className='bg-stone-100'>
              <TabsTrigger
                value='inventory'
                className='data-[state=active]:bg-white'
              >
                <RotateCw className='h-4 w-4 mr-2' />
                Inventory
              </TabsTrigger>
              <TabsTrigger
                value='maintenance'
                className='data-[state=active]:bg-white'
              >
                <RotateCw className='h-4 w-4 mr-2' />
                Maintenance
              </TabsTrigger>
              <TabsTrigger
                value='checkout'
                className='data-[state=active]:bg-white'
              >
                <Users className='h-4 w-4 mr-2' />
                Checkout
              </TabsTrigger>
            </TabsList>

            <div className='flex space-x-2'>
              {Object.keys(currentFilters).length > 0 && (
                <button
                  className='inline-flex items-center px-3 py-2 border border-stone-300 bg-white rounded-md text-sm font-medium text-amber-700 hover:bg-stone-50'
                  onClick={handleResetFilters}
                  disabled={loading.tools}
                >
                  <RefreshCcw className='h-4 w-4 mr-2' />
                  Reset Filters
                </button>
              )}
              <button
                className='inline-flex items-center px-3 py-2 border border-stone-300 bg-white rounded-md text-sm font-medium text-stone-700 hover:bg-stone-50'
                onClick={() => setShowFilter(!showFilter)}
                disabled={loading.tools}
              >
                <Filter className='h-4 w-4 mr-2' />
                Filter
                <ChevronDown className='h-4 w-4 ml-2' />
              </button>
            </div>
          </div>

          {/* Tool Inventory Tab */}
          <TabsContent value='inventory' className='m-0'>
            {showFilter && (
              <ToolFilter
                onFilterChange={handleFilterChange}
                initialFilters={currentFilters}
              />
            )}
            <ToolInventoryList
              onEditTool={handleEditTool}
              filters={currentFilters}
            />
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value='maintenance' className='m-0'>
            {loading.maintenance ? (
              <div className='bg-white p-6 rounded-lg shadow-sm border border-stone-200'>
                <LoadingSpinner
                  size='medium'
                  color='amber'
                  message='Loading maintenance records...'
                />
              </div>
            ) : error.maintenance ? (
              <div className='bg-white p-6 rounded-lg shadow-sm border border-stone-200'>
                <ErrorMessage
                  message={error.maintenance}
                  onRetry={refreshMaintenanceRecords}
                />
              </div>
            ) : (
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div className='lg:col-span-2'>
                  <div className='bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden'>
                    <div className='px-4 py-3 border-b border-stone-200 flex justify-between items-center'>
                      <h3 className='font-medium text-stone-800'>
                        Maintenance History
                      </h3>
                      <button
                        className='inline-flex items-center px-2 py-1 border border-stone-300 bg-white rounded-md text-xs font-medium text-stone-700 hover:bg-stone-50'
                        onClick={refreshMaintenanceRecords}
                      >
                        <RotateCw className='h-3 w-3 mr-1' />
                        Refresh
                      </button>
                    </div>
                    <div className='overflow-x-auto'>
                      {maintenanceRecords.length === 0 ? (
                        <div className='p-6 text-center text-stone-500'>
                          No maintenance records found
                        </div>
                      ) : (
                        <table className='w-full'>
                          <thead>
                            <tr className='bg-stone-50 border-b border-stone-200'>
                              <th className='text-left text-xs font-medium text-stone-500 uppercase tracking-wider py-3 px-4'>
                                Tool
                              </th>
                              <th className='text-left text-xs font-medium text-stone-500 uppercase tracking-wider py-3 px-4'>
                                Maintenance Type
                              </th>
                              <th className='text-left text-xs font-medium text-stone-500 uppercase tracking-wider py-3 px-4'>
                                Date
                              </th>
                              <th className='text-left text-xs font-medium text-stone-500 uppercase tracking-wider py-3 px-4'>
                                Performed By
                              </th>
                              <th className='text-left text-xs font-medium text-stone-500 uppercase tracking-wider py-3 px-4'>
                                Status
                              </th>
                              <th className='text-left text-xs font-medium text-stone-500 uppercase tracking-wider py-3 px-4'>
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className='divide-y divide-stone-200'>
                            {maintenanceRecords.map((record) => (
                              <tr key={record.id} className='hover:bg-stone-50'>
                                <td className='py-4 px-4'>
                                  <div className='font-medium text-stone-800'>
                                    {record.toolName}
                                  </div>
                                </td>
                                <td className='py-4 px-4 text-sm text-stone-600'>
                                  {record.maintenanceType}
                                </td>
                                <td className='py-4 px-4 text-sm text-stone-600'>
                                  {new Date(record.date).toLocaleDateString()}
                                </td>
                                <td className='py-4 px-4 text-sm text-stone-600'>
                                  {record.performedBy || 'Not assigned'}
                                </td>
                                <td className='py-4 px-4'>
                                  <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      record.status === 'Completed'
                                        ? 'bg-green-100 text-green-800'
                                        : record.status === 'In Progress'
                                        ? 'bg-blue-100 text-blue-800'
                                        : record.status === 'Scheduled'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {record.status}
                                  </span>
                                </td>
                                <td className='py-4 px-4'>
                                  <div className='flex space-x-2'>
                                    <button className='text-stone-500 hover:text-stone-800'>
                                      <Eye className='h-5 w-5' />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>

                {/* Upcoming maintenance panel */}
                <div>
                  <div className='bg-white rounded-lg shadow-sm border border-stone-200 p-4'>
                    <h3 className='font-medium text-stone-800 mb-4'>
                      Upcoming Maintenance
                    </h3>
                    {upcomingMaintenance.length === 0 ? (
                      <div className='text-stone-500 text-sm text-center p-4 bg-stone-50 rounded-md'>
                        No upcoming maintenance scheduled
                      </div>
                    ) : (
                      <div className='space-y-3'>
                        {upcomingMaintenance.slice(0, 5).map((tool) => (
                          <div
                            key={tool.id}
                            className='border-b border-stone-100 pb-3 last:border-0 last:pb-0'
                          >
                            <div className='font-medium'>{tool.name}</div>
                            <div className='text-sm text-stone-500 mt-1'>
                              Next maintenance:{' '}
                              {new Date(
                                tool.nextMaintenance
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className='bg-white rounded-lg shadow-sm border border-stone-200 p-4 mt-4'>
                    <h3 className='font-medium text-stone-800 mb-4 flex items-center'>
                      <AlertTriangle className='h-4 w-4 mr-2 text-red-500' />
                      Overdue Maintenance
                    </h3>
                    {overdueMaintenance.length === 0 ? (
                      <div className='text-green-600 text-sm text-center p-4 bg-green-50 rounded-md'>
                        No overdue maintenance
                      </div>
                    ) : (
                      <div className='space-y-3'>
                        {overdueMaintenance.map((tool) => (
                          <div
                            key={tool.id}
                            className='border-b border-stone-100 pb-3 last:border-0 last:pb-0'
                          >
                            <div className='font-medium'>{tool.name}</div>
                            <div className='text-sm text-red-500 mt-1'>
                              Due:{' '}
                              {new Date(
                                tool.nextMaintenance
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Checkout Tab */}
          <TabsContent value='checkout' className='m-0'>
            {loading.checkout ? (
              <div className='bg-white p-6 rounded-lg shadow-sm border border-stone-200'>
                <LoadingSpinner
                  size='medium'
                  color='amber'
                  message='Loading checkout records...'
                />
              </div>
            ) : error.checkout ? (
              <div className='bg-white p-6 rounded-lg shadow-sm border border-stone-200'>
                <ErrorMessage
                  message={error.checkout}
                  onRetry={refreshCheckoutRecords}
                />
              </div>
            ) : (
              <div className='bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden'>
                <div className='px-4 py-3 border-b border-stone-200 flex justify-between items-center'>
                  <h3 className='font-medium text-stone-800'>
                    Checked Out Tools
                  </h3>
                  <button
                    className='inline-flex items-center px-2 py-1 border border-stone-300 bg-white rounded-md text-xs font-medium text-stone-700 hover:bg-stone-50'
                    onClick={refreshCheckoutRecords}
                  >
                    <RotateCw className='h-3 w-3 mr-1' />
                    Refresh
                  </button>
                </div>
                {currentlyCheckedOut.length === 0 ? (
                  <div className='p-6 text-center text-stone-500'>
                    No tools are currently checked out
                  </div>
                ) : (
                  <div className='overflow-x-auto'>
                    <table className='w-full'>
                      <thead>
                        <tr className='bg-stone-50 border-b border-stone-200'>
                          <th className='text-left text-xs font-medium text-stone-500 uppercase tracking-wider py-3 px-4'>
                            Tool
                          </th>
                          <th className='text-left text-xs font-medium text-stone-500 uppercase tracking-wider py-3 px-4'>
                            Checked Out To
                          </th>
                          <th className='text-left text-xs font-medium text-stone-500 uppercase tracking-wider py-3 px-4'>
                            Checkout Date
                          </th>
                          <th className='text-left text-xs font-medium text-stone-500 uppercase tracking-wider py-3 px-4'>
                            Due Date
                          </th>
                          <th className='text-left text-xs font-medium text-stone-500 uppercase tracking-wider py-3 px-4'>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-stone-200'>
                        {currentlyCheckedOut.map((tool) => (
                          <tr key={tool.id} className='hover:bg-stone-50'>
                            <td className='py-4 px-4'>
                              <div className='flex items-center'>
                                <img
                                  src={tool.image}
                                  alt={tool.name}
                                  className='h-10 w-10 rounded-md mr-3 bg-stone-200'
                                />
                                <div>
                                  <div className='font-medium text-stone-800'>
                                    {tool.name}
                                  </div>
                                  <div className='text-sm text-stone-500'>
                                    {tool.brand} {tool.model}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className='py-4 px-4 text-sm text-stone-600'>
                              {tool.checkedOutTo}
                            </td>
                            <td className='py-4 px-4 text-sm text-stone-600'>
                              {new Date(
                                tool.checkedOutDate
                              ).toLocaleDateString()}
                            </td>
                            <td className='py-4 px-4 text-sm'>
                              <span
                                className={
                                  new Date(tool.dueDate) < new Date()
                                    ? 'text-red-600 font-medium'
                                    : 'text-stone-600'
                                }
                              >
                                {new Date(tool.dueDate).toLocaleDateString()}
                              </span>
                            </td>
                            <td className='py-4 px-4'>
                              <div className='flex space-x-2'>
                                <button
                                  className='text-stone-500 hover:text-stone-800'
                                  onClick={() => handleViewTool(tool)}
                                >
                                  <Eye className='h-5 w-5' />
                                </button>
                                <button
                                  className='text-amber-500 hover:text-amber-800'
                                  onClick={() => handleEditTool(tool)}
                                >
                                  <Edit className='h-5 w-5' />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Tool Detail Modal */}
      <ToolDetailModal
        tool={selectedTool}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Add/Edit Tool Form */}
      <ToolForm
        isOpen={isAddFormOpen}
        onClose={() => {
          setIsAddFormOpen(false);
          setSelectedTool(null); // Clear the selected tool when closing the form
        }}
        editTool={selectedTool || undefined} // Convert null to undefined to fix type error
      />
    </div>
  );
};

export default ToolManagementView;
