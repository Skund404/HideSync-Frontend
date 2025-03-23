// src/components/financial/tables/ProjectFinancialsTable.tsx
import { Search } from 'lucide-react';
import React, { useState } from 'react';
import { useFinancial } from '../../../context/FinancialContext';
import {
  formatCurrency,
  formatPercentage,
} from '../../../utils/financialHelpers';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';

const ProjectFinancialsTable: React.FC = () => {
  const { projectFinancials, loading, loadingState, error, refreshData } = useFinancial();
  const [searchTerm, setSearchTerm] = useState('');

  // Show loading spinner when loading project data
  if (loading || loadingState.projectFinancials) {
    return (
      <div className='flex items-center justify-center h-40'>
        <LoadingSpinner
          size="small"
          color="amber"
          message="Loading project data..."
        />
      </div>
    );
  }

  // Handle error state with retry option
  if (error) {
    return (
      <div className='py-4'>
        <ErrorMessage 
          message="Unable to load project financial data. Please try again." 
          onRetry={refreshData} 
        />
      </div>
    );
  }

  // Handle empty state
  if (!projectFinancials.length) {
    return (
      <div className='flex items-center justify-center h-40'>
        <p className='text-stone-500'>No project data available for the selected period</p>
      </div>
    );
  }

  // Filter projects by search term
  const filteredProjects = projectFinancials.filter((project) => {
    const term = searchTerm.toLowerCase();
    return (
      project.name.toLowerCase().includes(term) ||
      project.customer.toLowerCase().includes(term) ||
      project.id.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div className='mb-4'>
        <div className='relative'>
          <input
            type='text'
            placeholder='Search projects...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full md:w-64 bg-stone-100 border border-stone-300 rounded-md py-1 px-3 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
          />
          <Search className='h-4 w-4 absolute left-3 top-1.5 text-stone-400' />
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='min-w-full border-collapse'>
          <thead>
            <tr>
              <th className='px-3 py-3 bg-stone-50 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'>
                Project
              </th>
              <th className='px-3 py-3 bg-stone-50 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'>
                Customer
              </th>
              <th className='px-3 py-3 bg-stone-50 text-right text-xs font-medium text-stone-500 uppercase tracking-wider'>
                Revenue
              </th>
              <th className='px-3 py-3 bg-stone-50 text-right text-xs font-medium text-stone-500 uppercase tracking-wider'>
                Costs
              </th>
              <th className='px-3 py-3 bg-stone-50 text-right text-xs font-medium text-stone-500 uppercase tracking-wider'>
                Profit
              </th>
              <th className='px-3 py-3 bg-stone-50 text-right text-xs font-medium text-stone-500 uppercase tracking-wider'>
                Margin
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-stone-200'>
            {filteredProjects.map((project, index) => (
              <tr
                key={project.id}
                className={index % 2 === 0 ? 'bg-white' : 'bg-stone-50'}
              >
                <td className='px-3 py-3 whitespace-nowrap'>
                  <div className='flex items-center'>
                    <div className='text-sm font-medium text-stone-800'>
                      {project.id}
                    </div>
                    <div className='ml-2 text-sm text-stone-600'>
                      {project.name}
                    </div>
                  </div>
                </td>
                <td className='px-3 py-3 whitespace-nowrap text-sm text-stone-600'>
                  {project.customer}
                </td>
                <td className='px-3 py-3 whitespace-nowrap text-sm text-right text-stone-600'>
                  {formatCurrency(project.revenue)}
                </td>
                <td className='px-3 py-3 whitespace-nowrap text-sm text-right text-stone-600'>
                  {formatCurrency(project.costs)}
                </td>
                <td className='px-3 py-3 whitespace-nowrap text-sm text-right font-medium text-green-600'>
                  {formatCurrency(project.profit)}
                </td>
                <td className='px-3 py-3 whitespace-nowrap text-right'>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      project.margin > 50
                        ? 'bg-green-100 text-green-800'
                        : project.margin > 40
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {formatPercentage(project.margin)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProjects.length === 0 && (
        <div className='text-center py-4 text-sm text-stone-500'>
          No matching projects found
        </div>
      )}
    </div>
  );
};

export default ProjectFinancialsTable;