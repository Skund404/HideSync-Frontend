// src/components/tools/ToolManagementView.tsx
//
// This is the main container component for the Tool Management module.
// It follows the structure of the provided example, with tabs for
// Inventory, Maintenance, and Checkout views.
//
// This component uses the ToolContext for state management and displays
// summary cards for key metrics at the top.

import React, { useEffect, useState } from 'react';
// Corrected tabs import with full path alias
import ToolDetailModal from '@/components/tools/common/ToolDetailModal';
import ToolFilter from '@/components/tools/common/ToolFilter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTools } from '@/context/ToolContext';
import {
  MaintenanceStatus,
  Tool,
  ToolCategory,
  ToolCheckoutStatus,
  ToolStatus,
} from '@/types/toolType';
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  Edit,
  Eye,
  Filter,
  PlusCircle,
  RotateCw,
  Search,
  Users,
} from 'lucide-react';
// Corrected ToolForm import with full path alias
import ToolForm from '@/components/tools/common/ToolForm';

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
  } = useTools();

  // State
  // Note: activeTab is used by the Tabs component via onValueChange
  const [activeTab, setActiveTab] = useState('inventory');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [filters, setFilters] = useState<{
    category?: ToolCategory;
    status?: ToolStatus;
    maintenanceStatus?: 'upcoming' | 'overdue' | 'current';
    searchTerm?: string;
  }>({});

  // Filtered tools
  const [filteredTools, setFilteredTools] = useState<Tool[]>(tools);

  // Apply filters when tools or filters change
  useEffect(() => {
    let result = [...tools];

    // Apply category filter
    if (filters.category) {
      result = result.filter((tool) => tool.category === filters.category);
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter((tool) => tool.status === filters.status);
    }

    // Apply maintenance status filter
    if (filters.maintenanceStatus) {
      const today = new Date();

      if (filters.maintenanceStatus === 'upcoming') {
        result = result.filter((tool) => {
          const nextDate = new Date(tool.nextMaintenance);
          const diffTime = nextDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 30 && diffDays > 0;
        });
      } else if (filters.maintenanceStatus === 'overdue') {
        result = result.filter((tool) => {
          const nextDate = new Date(tool.nextMaintenance);
          return nextDate < today;
        });
      } else if (filters.maintenanceStatus === 'current') {
        result = result.filter((tool) => {
          const nextDate = new Date(tool.nextMaintenance);
          const diffTime = nextDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays > 30;
        });
      }
    }

    // Apply search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(
        (tool) =>
          tool.name.toLowerCase().includes(searchLower) ||
          tool.brand.toLowerCase().includes(searchLower) ||
          tool.model.toLowerCase().includes(searchLower) ||
          tool.description.toLowerCase().includes(searchLower)
      );
    }

    setFilteredTools(result);
  }, [tools, filters]);

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
          <div className='relative hidden md:block'>
            <input
              type='text'
              placeholder='Search tools...'
              className='w-64 bg-stone-100 border border-stone-300 rounded-md py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
            />
            <Search className='h-5 w-5 absolute right-3 top-2.5 text-stone-400' />
          </div>

          <button
            className='bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center'
            onClick={() => setIsAddFormOpen(true)}
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
                  {tools.filter((t) => t.status === ToolStatus.IN_STOCK).length}{' '}
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
                        c.status === ToolCheckoutStatus.CHECKED_OUT &&
                        new Date(c.dueDate) <=
                          new Date(new Date().setDate(new Date().getDate() + 3))
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
        </div>

        {/* Tabs for Tool Content */}
        <Tabs
          defaultValue='inventory'
          className='w-full'
          onValueChange={setActiveTab}
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
              <button
                className='inline-flex items-center px-3 py-2 border border-stone-300 bg-white rounded-md text-sm font-medium text-stone-700 hover:bg-stone-50'
                onClick={() => setShowFilter(!showFilter)}
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
              <ToolFilter filters={filters} setFilters={setFilters} />
            )}
            <div className='bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='bg-stone-50 border-b border-stone-200'>
                      <th className='text-left text-xs font-medium text-stone-500 uppercase tracking-wider py-3 px-4'>
                        Tool
                      </th>
                      <th className='text-left text-xs font-medium text-stone-500 uppercase tracking-wider py-3 px-4'>
                        Category
                      </th>
                      <th className='text-left text-xs font-medium text-stone-500 uppercase tracking-wider py-3 px-4'>
                        Status
                      </th>
                      <th className='text-left text-xs font-medium text-stone-500 uppercase tracking-wider py-3 px-4'>
                        Location
                      </th>
                      <th className='text-left text-xs font-medium text-stone-500 uppercase tracking-wider py-3 px-4'>
                        Next Maintenance
                      </th>
                      <th className='text-left text-xs font-medium text-stone-500 uppercase tracking-wider py-3 px-4'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-stone-200'>
                    {filteredTools.map((tool) => (
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
                          {tool.category}
                        </td>
                        <td className='py-4 px-4'>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              tool.status === ToolStatus.IN_STOCK
                                ? 'bg-green-100 text-green-800'
                                : tool.status === ToolStatus.CHECKED_OUT
                                ? 'bg-blue-100 text-blue-800'
                                : tool.status === ToolStatus.MAINTENANCE
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {tool.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className='py-4 px-4 text-sm text-stone-600'>
                          {tool.location}
                        </td>
                        <td className='py-4 px-4 text-sm text-stone-600'>
                          <div
                            className={
                              new Date(tool.nextMaintenance) < new Date()
                                ? 'text-red-600 font-medium'
                                : new Date(tool.nextMaintenance) <
                                  new Date(
                                    new Date().setDate(
                                      new Date().getDate() + 30
                                    )
                                  )
                                ? 'text-amber-600'
                                : 'text-stone-600'
                            }
                          >
                            {tool.nextMaintenance}
                          </div>
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
                              onClick={() => handleViewTool(tool)}
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
              <div className='px-4 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between'>
                <div className='text-sm text-stone-500'>
                  Showing{' '}
                  <span className='font-medium'>{filteredTools.length}</span> of{' '}
                  <span className='font-medium'>{tools.length}</span> tools
                </div>
                <div className='flex space-x-2'>
                  <button className='px-3 py-1 border border-stone-300 rounded-md text-sm text-stone-600 bg-white hover:bg-stone-50'>
                    Previous
                  </button>
                  <button className='px-3 py-1 border border-stone-300 rounded-md text-sm text-stone-600 bg-white hover:bg-stone-50'>
                    Next
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value='maintenance' className='m-0'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              <div className='lg:col-span-2'>
                <div className='bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden'>
                  <div className='px-4 py-3 border-b border-stone-200 flex justify-between items-center'>
                    <h3 className='font-medium text-stone-800'>
                      Maintenance History
                    </h3>
                    <button className='inline-flex items-center px-2 py-1 border border-stone-300 bg-white rounded-md text-xs font-medium text-stone-700 hover:bg-stone-50'>
                      View All
                    </button>
                  </div>
                  <div className='overflow-x-auto'>
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
                              {record.date}
                            </td>
                            <td className='py-4 px-4 text-sm text-stone-600'>
                              {record.performedBy}
                            </td>
                            <td className='py-4 px-4'>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  record.status === MaintenanceStatus.COMPLETED
                                    ? 'bg-green-100 text-green-800'
                                    : record.status ===
                                      MaintenanceStatus.IN_PROGRESS
                                    ? 'bg-blue-100 text-blue-800'
                                    : record.status ===
                                      MaintenanceStatus.SCHEDULED
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
                  </div>
                </div>
              </div>

              {/* Rest of the maintenance tab content... */}
            </div>
          </TabsContent>

          {/* Checkout Tab */}
          <TabsContent value='checkout' className='m-0'>
            {/* Checkout tab content... */}
          </TabsContent>
        </Tabs>
      </main>

      {/* Tool Detail Modal */}
      <ToolDetailModal
        tool={selectedTool}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Add Tool Form */}
      <ToolForm
        isOpen={isAddFormOpen}
        onClose={() => setIsAddFormOpen(false)}
      />
    </div>
  );
};

export default ToolManagementView;
