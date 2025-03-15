import { useStorage } from '@context/StorageContext';
import { Download, Printer, Share2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const StorageUtilizationView: React.FC = () => {
  const { storageLocations, getItemsForStorage, storageStats } = useStorage();

  // Chart data for storage utilization
  const [utilizationData, setUtilizationData] = useState<any[]>([]);
  const [typeDistribution, setTypeDistribution] = useState<any[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);

  // Calculate chart data
  useEffect(() => {
    // Calculate utilization data
    const storageUtilization = storageLocations.map((location) => {
      const utilizationPercentage = Math.round(
        (location.utilized / location.capacity) * 100
      );
      return {
        name: location.name,
        utilized: location.utilized,
        available: location.capacity - location.utilized,
        utilization: utilizationPercentage,
        capacity: location.capacity,
        type: location.type,
        section: location.section,
      };
    });
    setUtilizationData(storageUtilization);

    // Calculate storage type distribution
    const typeCount: Record<string, number> = {};
    storageLocations.forEach((location) => {
      const type = location.type;
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    const typeData = Object.entries(typeCount).map(([name, value]) => ({
      name,
      value,
    }));
    setTypeDistribution(typeData);

    // Calculate category distribution of stored items
    const categoryCount: Record<string, number> = {
      leather: 0,
      hardware: 0,
      supplies: 0,
      other: 0,
    };

    storageLocations.forEach((location) => {
      const items = getItemsForStorage(location.id);
      items.forEach((item) => {
        const category = item.category || 'other';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
    });

    const categoryData = Object.entries(categoryCount).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
    setCategoryDistribution(categoryData);
  }, [storageLocations, getItemsForStorage]);

  // Colors for charts
  const STORAGE_COLORS = [
    '#4f46e5',
    '#0ea5e9',
    '#14b8a6',
    '#a855f7',
    '#f43f5e',
    '#f59e0b',
    '#84cc16',
  ];
  const CATEGORY_COLORS = {
    Leather: '#d97706',
    Hardware: '#2563eb',
    Supplies: '#059669',
    Other: '#71717a',
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-3 border border-stone-200 shadow-md rounded-md'>
          <p className='font-medium text-sm text-stone-800'>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className='text-xs'>
              {entry.name}: {entry.value}{' '}
              {entry.name === 'utilization' ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Print report
  const printReport = () => {
    window.print();
  };

  return (
    <div className='space-y-6'>
      {/* Storage Utilization Dashboard */}
      <div className='bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden'>
        <div className='px-4 py-3 border-b border-stone-200 flex justify-between items-center'>
          <h3 className='font-medium text-stone-800'>
            Storage Utilization Dashboard
          </h3>
          <div className='flex space-x-2'>
            <button
              className='p-2 text-stone-500 hover:text-stone-700 rounded-md hover:bg-stone-100'
              title='Download'
            >
              <Download className='h-5 w-5' />
            </button>
            <button
              className='p-2 text-stone-500 hover:text-stone-700 rounded-md hover:bg-stone-100'
              title='Print Report'
              onClick={printReport}
            >
              <Printer className='h-5 w-5' />
            </button>
            <button
              className='p-2 text-stone-500 hover:text-stone-700 rounded-md hover:bg-stone-100'
              title='Share'
            >
              <Share2 className='h-5 w-5' />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 p-4'>
          <div className='bg-stone-50 p-4 rounded-lg border border-stone-200'>
            <div className='text-xs font-medium text-stone-500 uppercase'>
              Total Locations
            </div>
            <div className='text-2xl font-bold text-stone-800 mt-1'>
              {storageStats.totalLocations}
            </div>
            <div className='mt-2 text-xs text-stone-600'>
              Across all sections and types
            </div>
          </div>

          <div className='bg-stone-50 p-4 rounded-lg border border-stone-200'>
            <div className='text-xs font-medium text-stone-500 uppercase'>
              Total Capacity
            </div>
            <div className='text-2xl font-bold text-stone-800 mt-1'>
              {storageStats.totalCapacity}
            </div>
            <div className='mt-2 text-xs text-stone-600'>
              Maximum number of items
            </div>
          </div>

          <div className='bg-stone-50 p-4 rounded-lg border border-stone-200'>
            <div className='text-xs font-medium text-stone-500 uppercase'>
              Used Capacity
            </div>
            <div className='text-2xl font-bold text-stone-800 mt-1'>
              {storageStats.totalUtilized}
            </div>
            <div className='mt-2 text-xs text-stone-600'>
              Currently stored items
            </div>
          </div>

          <div className='bg-stone-50 p-4 rounded-lg border border-stone-200'>
            <div className='text-xs font-medium text-stone-500 uppercase'>
              Overall Utilization
            </div>
            <div className='text-2xl font-bold text-stone-800 mt-1'>
              {storageStats.utilizationPercentage}%
            </div>
            <div className='mt-2 text-xs text-stone-600'>
              Average across all storage
            </div>
          </div>
        </div>

        {/* Utilization Bar Chart */}
        <div className='p-4'>
          <h4 className='text-sm font-medium text-stone-700 mb-4'>
            Storage Location Utilization
          </h4>
          <div className='h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={utilizationData}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                  dataKey='name'
                  angle={-45}
                  textAnchor='end'
                  tick={{ fontSize: 12 }}
                  height={80}
                />
                <YAxis
                  yAxisId='left'
                  orientation='left'
                  label={{ value: 'Items', angle: -90, position: 'insideLeft' }}
                />
                <YAxis
                  yAxisId='right'
                  orientation='right'
                  label={{
                    value: 'Utilization %',
                    angle: 90,
                    position: 'insideRight',
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  yAxisId='left'
                  dataKey='utilized'
                  name='Used Capacity'
                  stackId='a'
                  fill='#4f46e5'
                />
                <Bar
                  yAxisId='left'
                  dataKey='available'
                  name='Available Capacity'
                  stackId='a'
                  fill='#e5e7eb'
                />
                <Bar
                  yAxisId='right'
                  dataKey='utilization'
                  name='Utilization %'
                  fill='#f59e0b'
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Storage Type Distribution */}
        <div className='bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden'>
          <div className='px-4 py-3 border-b border-stone-200'>
            <h3 className='font-medium text-stone-800'>
              Storage Type Distribution
            </h3>
          </div>
          <div className='p-4'>
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                    nameKey='name'
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {typeDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STORAGE_COLORS[index % STORAGE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className='mt-4 grid grid-cols-2 gap-2'>
              {typeDistribution.map((entry, index) => (
                <div key={index} className='flex items-center text-xs'>
                  <div
                    className='w-3 h-3 rounded-full mr-2'
                    style={{
                      backgroundColor:
                        STORAGE_COLORS[index % STORAGE_COLORS.length],
                    }}
                  ></div>
                  <span>
                    {entry.name}: {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Item Category Distribution */}
        <div className='bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden'>
          <div className='px-4 py-3 border-b border-stone-200'>
            <h3 className='font-medium text-stone-800'>
              Item Category Distribution
            </h3>
          </div>
          <div className='p-4'>
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                    nameKey='name'
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {categoryDistribution.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={
                          CATEGORY_COLORS[
                            entry.name as keyof typeof CATEGORY_COLORS
                          ] || '#71717a'
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className='mt-4 grid grid-cols-2 gap-2'>
              {categoryDistribution.map((entry) => (
                <div key={entry.name} className='flex items-center text-xs'>
                  <div
                    className='w-3 h-3 rounded-full mr-2'
                    style={{
                      backgroundColor:
                        CATEGORY_COLORS[
                          entry.name as keyof typeof CATEGORY_COLORS
                        ] || '#71717a',
                    }}
                  ></div>
                  <span>
                    {entry.name}: {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Storage Optimization Recommendations */}
      <div className='bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden'>
        <div className='px-4 py-3 border-b border-stone-200'>
          <h3 className='font-medium text-stone-800'>
            Storage Optimization Recommendations
          </h3>
        </div>
        <div className='p-4'>
          {/* This would contain actual recommendations based on storage data */}
          <div className='space-y-4'>
            <div className='bg-amber-50 p-4 rounded-md border border-amber-200'>
              <h4 className='font-medium text-amber-800 mb-1'>
                Rebalance Capacity
              </h4>
              <p className='text-sm text-amber-700'>
                You have several underutilized storage locations. Consider
                consolidating items to free up empty storage units.
              </p>
            </div>

            <div className='bg-blue-50 p-4 rounded-md border border-blue-200'>
              <h4 className='font-medium text-blue-800 mb-1'>
                Organize by Category
              </h4>
              <p className='text-sm text-blue-700'>
                Group similar materials together for easier access. Hardware
                items are currently spread across multiple locations.
              </p>
            </div>

            <div className='bg-green-50 p-4 rounded-md border border-green-200'>
              <h4 className='font-medium text-green-800 mb-1'>
                Storage Expansion
              </h4>
              <p className='text-sm text-green-700'>
                Leather storage is approaching maximum capacity (85%). Consider
                adding additional storage for this category.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageUtilizationView;
