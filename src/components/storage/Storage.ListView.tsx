import { useStorage } from '@context/StorageContext';
import { StorageLocationType } from '@types';
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Download,
  Edit,
  MoveUpRight,
  Settings,
} from 'lucide-react';
import React, { useState } from 'react';

const StorageListView: React.FC = () => {
  const { storageLocations, getItemsForStorage } = useStorage();

  // State for sorting
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // State for expanded rows
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Toggle row expansion
  const toggleRowExpansion = (locationId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [locationId]: !prev[locationId],
    }));
  };

  // Handle sort change
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field: string) => {
    if (field === sortField) {
      return sortDirection === 'asc' ? (
        <ChevronUp className='h-4 w-4' />
      ) : (
        <ChevronDown className='h-4 w-4' />
      );
    }
    return <ArrowUpDown className='h-4 w-4 opacity-30' />;
  };

  // Sort storage locations
  const sortedLocations = [...storageLocations].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'section':
        comparison = a.section.localeCompare(b.section);
        break;
      case 'capacity':
        comparison = a.capacity - b.capacity;
        break;
      case 'utilized':
        comparison = a.utilized - b.utilized;
        break;
      case 'utilization':
        const utilA = (a.utilized / a.capacity) * 100;
        const utilB = (b.utilized / b.capacity) * 100;
        comparison = utilA - utilB;
        break;
      default:
        comparison = 0;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Get the storage type badge
  const getStorageTypeBadge = (type: StorageLocationType) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (type) {
      case StorageLocationType.CABINET:
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            CABINET
          </span>
        );
      case StorageLocationType.SHELF:
        return (
          <span className={`${baseClasses} bg-amber-100 text-amber-800`}>
            SHELF
          </span>
        );
      case StorageLocationType.DRAWER:
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            DRAWER
          </span>
        );
      case StorageLocationType.RACK:
        return (
          <span className={`${baseClasses} bg-purple-100 text-purple-800`}>
            RACK
          </span>
        );
      case StorageLocationType.BIN:
        return (
          <span className={`${baseClasses} bg-indigo-100 text-indigo-800`}>
            BIN
          </span>
        );
      case StorageLocationType.BOX:
        return (
          <span className={`${baseClasses} bg-rose-100 text-rose-800`}>
            BOX
          </span>
        );
      case StorageLocationType.SAFE:
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>SAFE</span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-stone-100 text-stone-800`}>
            {type}
          </span>
        );
    }
  };

  // Download CSV of storage locations
  const downloadStorageCSV = () => {
    // Create CSV content
    const headers = [
      'Name',
      'Type',
      'Section',
      'Capacity',
      'Utilized',
      'Utilization %',
      'Status',
      'Last Modified',
    ];

    const rows = storageLocations.map((loc) => [
      loc.name,
      loc.type,
      loc.section,
      loc.capacity.toString(),
      loc.utilized.toString(),
      `${Math.round((loc.utilized / loc.capacity) * 100)}%`,
      loc.status,
      loc.lastModified,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'storage-locations.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden'>
      <div className='px-4 py-3 border-b border-stone-200 flex justify-between items-center'>
        <h3 className='font-medium text-stone-800'>All Storage Locations</h3>
        <div className='flex space-x-2'>
          <button
            className='p-2 text-stone-500 hover:text-stone-700 rounded-md hover:bg-stone-100'
            title='Download CSV'
            onClick={downloadStorageCSV}
          >
            <Download className='h-5 w-5' />
          </button>
          <button
            className='p-2 text-stone-500 hover:text-stone-700 rounded-md hover:bg-stone-100'
            title='Settings'
          >
            <Settings className='h-5 w-5' />
          </button>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead className='bg-stone-50 text-stone-600'>
            <tr>
              <th className='py-3 px-4 text-left font-medium text-xs uppercase tracking-wider'>
                <button
                  className='flex items-center space-x-1 focus:outline-none'
                  onClick={() => handleSort('name')}
                >
                  <span>Name</span>
                  {getSortIcon('name')}
                </button>
              </th>
              <th className='py-3 px-4 text-left font-medium text-xs uppercase tracking-wider'>
                <button
                  className='flex items-center space-x-1 focus:outline-none'
                  onClick={() => handleSort('type')}
                >
                  <span>Type</span>
                  {getSortIcon('type')}
                </button>
              </th>
              <th className='py-3 px-4 text-left font-medium text-xs uppercase tracking-wider'>
                <button
                  className='flex items-center space-x-1 focus:outline-none'
                  onClick={() => handleSort('section')}
                >
                  <span>Section</span>
                  {getSortIcon('section')}
                </button>
              </th>
              <th className='py-3 px-4 text-center font-medium text-xs uppercase tracking-wider'>
                <button
                  className='flex items-center space-x-1 focus:outline-none'
                  onClick={() => handleSort('capacity')}
                >
                  <span>Capacity</span>
                  {getSortIcon('capacity')}
                </button>
              </th>
              <th className='py-3 px-4 text-center font-medium text-xs uppercase tracking-wider'>
                <button
                  className='flex items-center space-x-1 focus:outline-none'
                  onClick={() => handleSort('utilized')}
                >
                  <span>Utilized</span>
                  {getSortIcon('utilized')}
                </button>
              </th>
              <th className='py-3 px-4 text-center font-medium text-xs uppercase tracking-wider'>
                <button
                  className='flex items-center space-x-1 focus:outline-none'
                  onClick={() => handleSort('utilization')}
                >
                  <span>Utilization</span>
                  {getSortIcon('utilization')}
                </button>
              </th>
              <th className='py-3 px-4 text-center font-medium text-xs uppercase tracking-wider'>
                Status
              </th>
              <th className='py-3 px-4 text-center font-medium text-xs uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-stone-200'>
            {sortedLocations.map((location) => {
              const utilizationPercentage = Math.round(
                (location.utilized / location.capacity) * 100
              );
              const itemsInLocation = getItemsForStorage(location.id);
              const isExpanded = expandedRows[location.id] || false;

              return (
                <React.Fragment key={location.id}>
                  <tr
                    className='hover:bg-stone-50 cursor-pointer'
                    onClick={() => toggleRowExpansion(location.id)}
                  >
                    <td className='py-3 px-4'>
                      <div className='flex items-center'>
                        <button className='mr-2 text-stone-400'>
                          {isExpanded ? (
                            <ChevronDown className='h-5 w-5' />
                          ) : (
                            <ChevronRight className='h-5 w-5' />
                          )}
                        </button>
                        <div>
                          <div className='font-medium text-stone-800'>
                            {location.name}
                          </div>
                          <div className='text-xs text-stone-500'>
                            {itemsInLocation.length} items
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='py-3 px-4'>
                      {getStorageTypeBadge(location.type)}
                    </td>
                    <td className='py-3 px-4'>
                      <div className='text-stone-600'>
                        {location.section.replace(/_/g, ' ')}
                      </div>
                    </td>
                    <td className='py-3 px-4 text-center'>
                      <div className='text-stone-600'>{location.capacity}</div>
                    </td>
                    <td className='py-3 px-4 text-center'>
                      <div className='text-stone-600'>{location.utilized}</div>
                    </td>
                    <td className='py-3 px-4'>
                      <div className='flex items-center justify-center'>
                        <div className='w-24 h-2 bg-stone-100 rounded-full mr-2'>
                          <div
                            className={`h-full rounded-full ${
                              utilizationPercentage > 90
                                ? 'bg-red-500'
                                : utilizationPercentage > 70
                                ? 'bg-amber-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${utilizationPercentage}%` }}
                          ></div>
                        </div>
                        <span className='text-xs font-medium'>
                          {utilizationPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className='py-3 px-4 text-center'>
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          location.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : location.status === 'INACTIVE'
                            ? 'bg-stone-100 text-stone-800'
                            : location.status === 'FULL'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {location.status}
                      </span>
                    </td>
                    <td className='py-3 px-4'>
                      <div className='flex items-center justify-center space-x-2'>
                        <button
                          className='text-amber-500 hover:text-amber-700 p-1 rounded-md hover:bg-amber-50'
                          title='Edit'
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle edit here
                          }}
                        >
                          <Edit className='h-4 w-4' />
                        </button>
                        <button
                          className='text-blue-500 hover:text-blue-700 p-1 rounded-md hover:bg-blue-50'
                          title='Move Items'
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle move here
                          }}
                        >
                          <MoveUpRight className='h-4 w-4' />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded row with items */}
                  {isExpanded && (
                    <tr className='bg-stone-50'>
                      <td colSpan={8} className='py-3 px-4'>
                        <div className='pl-8'>
                          <h4 className='font-medium text-stone-700 mb-2'>
                            Items in {location.name}
                          </h4>
                          {itemsInLocation.length > 0 ? (
                            <div className='overflow-x-auto max-h-60 overflow-y-auto border border-stone-200 rounded-md'>
                              <table className='w-full text-xs'>
                                <thead className='bg-stone-100 text-stone-600'>
                                  <tr>
                                    <th className='py-2 px-3 text-left font-medium uppercase tracking-wider'>
                                      Name
                                    </th>
                                    <th className='py-2 px-3 text-left font-medium uppercase tracking-wider'>
                                      Category
                                    </th>
                                    <th className='py-2 px-3 text-left font-medium uppercase tracking-wider'>
                                      Quantity
                                    </th>
                                    <th className='py-2 px-3 text-left font-medium uppercase tracking-wider'>
                                      Position
                                    </th>
                                    <th className='py-2 px-3 text-left font-medium uppercase tracking-wider'>
                                      Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className='divide-y divide-stone-200'>
                                  {itemsInLocation.map((item, idx) => (
                                    <tr key={idx} className='hover:bg-white'>
                                      <td className='py-2 px-3'>
                                        <div className='font-medium text-stone-800'>
                                          {item.name}
                                        </div>
                                      </td>
                                      <td className='py-2 px-3 capitalize'>
                                        {item.category}{' '}
                                        {item.subcategory &&
                                          `(${item.subcategory.replace(
                                            /-/g,
                                            ' '
                                          )})`}
                                      </td>
                                      <td className='py-2 px-3'>
                                        {item.quantity} {item.unit}
                                      </td>
                                      <td className='py-2 px-3'>
                                        {item.position
                                          ? `Row ${item.position.y + 1}, Col ${
                                              item.position.x + 1
                                            }`
                                          : 'Unknown'}
                                      </td>
                                      <td className='py-2 px-3'>
                                        <span
                                          className={`px-2 py-0.5 text-xs rounded-full ${
                                            item.status === 'IN_STOCK'
                                              ? 'bg-green-100 text-green-800'
                                              : item.status === 'LOW_STOCK'
                                              ? 'bg-amber-100 text-amber-800'
                                              : 'bg-red-100 text-red-800'
                                          }`}
                                        >
                                          {item.status &&
                                            item.status.replace(/_/g, ' ')}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className='text-stone-500 bg-white p-4 rounded-md border border-stone-200 text-center'>
                              No items in this storage location
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {sortedLocations.length === 0 && (
              <tr>
                <td colSpan={8} className='py-6 text-center text-stone-500'>
                  No storage locations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className='px-4 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between'>
        <div className='text-sm text-stone-500'>
          Showing <span className='font-medium'>{storageLocations.length}</span>{' '}
          storage locations
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
  );
};

// Add the missing ChevronRight component
const ChevronRight: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <polyline points='9 18 15 12 9 6' />
  </svg>
);

export default StorageListView;
