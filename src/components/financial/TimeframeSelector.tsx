import { Calendar } from 'lucide-react';
import React from 'react';
import { TimeFrame } from '../../types/financialTypes';

interface TimeframeSelectorProps {
  value: TimeFrame;
  onChange: (timeframe: TimeFrame) => void;
  className?: string;
}

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const options = [
    { value: TimeFrame.LAST_MONTH, label: 'Last Month' },
    { value: TimeFrame.LAST_3_MONTHS, label: 'Last 3 Months' },
    { value: TimeFrame.LAST_6_MONTHS, label: 'Last 6 Months' },
    { value: TimeFrame.LAST_YEAR, label: 'Last Year' },
    { value: TimeFrame.ALL_TIME, label: 'All Time' },
  ];

  return (
    <div className={`relative flex items-center ${className}`}>
      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
        <Calendar className='h-4 w-4 text-stone-500' />
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TimeFrame)}
        className='bg-stone-100 border border-stone-300 text-stone-700 pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimeframeSelector;
