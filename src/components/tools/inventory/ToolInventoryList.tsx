// src/components/tools/inventory/ToolInventoryList.tsx
//
// This component displays the tool inventory list in a table format.
// It includes filtering, sorting, and pagination functionality.
// Used in the Tool Management view's Inventory tab.

import ToolDetailModal from '@/components/tools/common/ToolDetailModal';
import { useTools } from '@/context/ToolContext';
import { Tool, ToolStatus } from '@/types/toolType';
import { ChevronDown, ChevronUp, Edit, Eye } from 'lucide-react';
import React, { useState } from 'react';

interface ToolInventoryListProps {
  onEditTool?: (tool: Tool) => void;
}

const ToolInventoryList: React.FC<ToolInventoryListProps> = ({
  onEditTool,
}) => {
  const { tools } = useTools();

  // State for sorting
  const [sortField, setSortField] = useState<keyof Tool>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // State for detail modal
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle sort change
  const handleSort = (field: keyof Tool) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sorted and paginated tools
  const getSortedTools = () => {
    return [...tools].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (
        sortField === 'nextMaintenance' ||
        sortField === 'lastMaintenance' ||
        sortField === 'purchaseDate'
      ) {
        const aDate = new Date(String(aValue));
        const bDate = new Date(String(bValue));

        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          return sortDirection === 'asc'
            ? aDate.getTime() - bDate.getTime()
            : bDate.getTime() - aDate.getTime();
        }
      }

      // Default for other types
      return sortDirection === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  };

  const sortedTools = getSortedTools();

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTools = sortedTools.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedTools.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // View tool details
  const handleViewTool = (tool: Tool) => {
    setSelectedTool(tool);
    setIsModalOpen(true);
  };

  // Helper function to get status badge color
  const getStatusColor = (status: ToolStatus) => {
    switch (status) {
      case ToolStatus.IN_STOCK:
        return 'bg-green-100 text-green-800';
      case ToolStatus.CHECKED_OUT:
        return 'bg-blue-100 text-blue-800';
      case ToolStatus.MAINTENANCE:
        return 'bg-amber-100 text-amber-800';
      case ToolStatus.DAMAGED:
      case ToolStatus.LOST:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  return (
    <div className='bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr className='bg-stone-50 border-b border-stone-200'>
              <th
                className='text-left text-xs font-medium text-stone-500 uppercase tracking-wider py-3 px-4 cursor-pointer'
                onClick={() => handleSort('name')}
              >
                <div className='flex items-center'>
                  Tool
                  {sortField === 'name' &&
                    (sortDirection === 'asc' ? (
                      <ChevronUp className='h-4 w-4 ml-1' />
                    ) : (
                      <ChevronDown className='h-4 w-4 ml-1' />
                    ))}
                </div>
              </th>
              <th
                className='text-left text-xs font-medium text-stone-500 uppercase tracking-wider py-3 px-4 cursor-pointer'
                onClick={() => handleSort('category')}
              >
                <div className='flex items-center'>
                  Category
                  {sortField === 'category' &&
                    (sortDirection === 'asc' ? (
                      <ChevronUp className='h-4 w-4 ml-1' />
                    ) : (
                      <ChevronDown className='h-4 w-4 ml-1' />
                    ))}
                </div>
              </th>
              <th
                className='text-left text-xs font-medium text-stone-500 uppercase tracking-wider py-3 px-4 cursor-pointer'
                onClick={() => handleSort('status')}
              >
                <div className='flex items-center'>
                  Status
                  {sortField === 'status' &&
                    (sortDirection === 'asc' ? (
                      <ChevronUp className='h-4 w-4 ml-1' />
                    ) : (
                      <ChevronDown className='h-4 w-4 ml-1' />
                    ))}
                </div>
              </th>
              <th
                className='text-left text-xs font-medium text-stone-500 uppercase tracking-wider py-3 px-4 cursor-pointer'
                onClick={() => handleSort('location')}
              >
                <div className='flex items-center'>
                  Location
                  {sortField === 'location' &&
                    (sortDirection === 'asc' ? (
                      <ChevronUp className='h-4 w-4 ml-1' />
                    ) : (
                      <ChevronDown className='h-4 w-4 ml-1' />
                    ))}
                </div>
              </th>
              <th
                className='text-left text-xs font-medium text-stone-500 uppercase tracking-wider py-3 px-4 cursor-pointer'
                onClick={() => handleSort('nextMaintenance')}
              >
                <div className='flex items-center'>
                  Next Maintenance
                  {sortField === 'nextMaintenance' &&
                    (sortDirection === 'asc' ? (
                      <ChevronUp className='h-4 w-4 ml-1' />
                    ) : (
                      <ChevronDown className='h-4 w-4 ml-1' />
                    ))}
                </div>
              </th>
              <th className='text-left text-xs font-medium text-stone-500 uppercase tracking-wider py-3 px-4'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-stone-200'>
            {currentTools.map((tool) => (
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
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      tool.status
                    )}`}
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
                            new Date().setDate(new Date().getDate() + 30)
                          )
                        ? 'text-amber-600'
                        : 'text-stone-600'
                    }
                  >
                    {tool.nextMaintenance
                      ? new Date(tool.nextMaintenance).toLocaleDateString()
                      : 'N/A'}
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
                    {onEditTool && (
                      <button
                        className='text-amber-500 hover:text-amber-800'
                        onClick={() => onEditTool(tool)}
                      >
                        <Edit className='h-5 w-5' />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className='px-4 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between'>
        <div className='text-sm text-stone-500'>
          Showing <span className='font-medium'>{indexOfFirstItem + 1}</span> to{' '}
          <span className='font-medium'>
            {Math.min(indexOfLastItem, sortedTools.length)}
          </span>{' '}
          of <span className='font-medium'>{sortedTools.length}</span> tools
        </div>
        <div className='flex space-x-2'>
          <button
            className={`px-3 py-1 border border-stone-300 rounded-md text-sm ${
              currentPage === 1
                ? 'text-stone-400 bg-stone-50 cursor-not-allowed'
                : 'text-stone-600 bg-white hover:bg-stone-50'
            }`}
            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className={`px-3 py-1 border border-stone-300 rounded-md text-sm ${
              currentPage === totalPages
                ? 'text-stone-400 bg-stone-50 cursor-not-allowed'
                : 'text-stone-600 bg-white hover:bg-stone-50'
            }`}
            onClick={() =>
              currentPage < totalPages && handlePageChange(currentPage + 1)
            }
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      <ToolDetailModal
        tool={selectedTool}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        readOnly={true}
      />
    </div>
  );
};

export default ToolInventoryList;
