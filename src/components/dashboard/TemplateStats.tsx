import React from 'react';
import { useProjectTemplates } from '../../context/ProjectTemplateContext';
import StatCard from './StatCard';

const TemplateStats: React.FC = () => {
  const { templates } = useProjectTemplates();

  // Calculate stats
  const totalTemplates = templates.length;
  const newThisMonth = templates.filter((template) => {
    const createdDate = new Date(template.createdAt);
    const now = new Date();
    return (
      createdDate.getMonth() === now.getMonth() &&
      createdDate.getFullYear() === now.getFullYear()
    );
  }).length;

  return (
    <StatCard
      title='Project Templates'
      value={totalTemplates}
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
            d='M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z'
          />
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z'
          />
        </svg>
      }
      color='green'
      detail={`${newThisMonth} new this month`}
      percentage={75}
    />
  );
};

export default TemplateStats;
