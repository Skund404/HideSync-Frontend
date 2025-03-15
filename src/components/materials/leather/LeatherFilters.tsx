import { useMaterials } from '@/context/MaterialsContext';
import { AnimalSource, LeatherType, TannageType } from '@/types/materialTypes';
import { formatType } from '@/utils/materialHelpers';
import React, { useState } from 'react';

const LeatherFilters: React.FC = () => {
  const {
    // Get current filter values
    filterLeatherType,
    filterAnimalSource,
    filterTannage,
    filterColor,
    filterThickness,
    filterGrade,

    // Get filter setters
    setFilterLeatherType,
    setFilterAnimalSource,
    setFilterTannage,
    setFilterColor,
    setFilterThickness,
    setFilterGrade,

    // Clear filters function
    clearFilters,
  } = useMaterials();

  // Use local state to track filter values before applying
  const [leatherType, setLeatherType] = useState<LeatherType | null>(
    filterLeatherType
  );
  const [animalSource, setAnimalSource] = useState<AnimalSource | null>(
    filterAnimalSource
  );
  const [tannage, setTannage] = useState<TannageType | null>(filterTannage);
  const [color, setColor] = useState<string | null>(filterColor || null);
  const [thickness, setThickness] = useState<string | null>(
    filterThickness || null
  );
  const [grade, setGrade] = useState<string | null>(filterGrade || null);

  const handleApplyFilters = () => {
    // Apply all filters at once
    setFilterLeatherType(leatherType);
    setFilterAnimalSource(animalSource);
    setFilterTannage(tannage);
    setFilterColor(color);
    setFilterThickness(thickness);
    setFilterGrade(grade);
  };

  const handleClearFilters = () => {
    // Clear local state
    setLeatherType(null);
    setAnimalSource(null);
    setTannage(null);
    setColor(null);
    setThickness(null);
    setGrade(null);

    // Clear global filters
    clearFilters();
  };

  return (
    <div className='space-y-4'>
      <h3 className='text-sm font-medium text-stone-700'>Leather Filters</h3>

      <div>
        <label className='block text-xs font-medium text-stone-500 mb-1'>
          Leather Type
        </label>
        <select
          value={leatherType || ''}
          onChange={(e) =>
            setLeatherType(
              e.target.value ? (e.target.value as LeatherType) : null
            )
          }
          className='w-full rounded-md border border-stone-300 py-1.5 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
        >
          <option value=''>All Types</option>
          {Object.values(LeatherType).map((type) => (
            <option key={type} value={type}>
              {formatType(type)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className='block text-xs font-medium text-stone-500 mb-1'>
          Animal Source
        </label>
        <select
          value={animalSource || ''}
          onChange={(e) =>
            setAnimalSource(
              e.target.value ? (e.target.value as AnimalSource) : null
            )
          }
          className='w-full rounded-md border border-stone-300 py-1.5 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
        >
          <option value=''>All Sources</option>
          {Object.values(AnimalSource).map((source) => (
            <option key={source} value={source}>
              {formatType(source)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className='block text-xs font-medium text-stone-500 mb-1'>
          Tannage
        </label>
        <select
          value={tannage || ''}
          onChange={(e) =>
            setTannage(e.target.value ? (e.target.value as TannageType) : null)
          }
          className='w-full rounded-md border border-stone-300 py-1.5 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
        >
          <option value=''>All Tannages</option>
          {Object.values(TannageType).map((type) => (
            <option key={type} value={type}>
              {formatType(type)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className='block text-xs font-medium text-stone-500 mb-1'>
          Color
        </label>
        <select
          value={color || ''}
          onChange={(e) => setColor(e.target.value || null)}
          className='w-full rounded-md border border-stone-300 py-1.5 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
        >
          <option value=''>All Colors</option>
          <option value='natural'>Natural</option>
          <option value='black'>Black</option>
          <option value='brown'>Brown</option>
          <option value='tan'>Tan</option>
          <option value='burgundy'>Burgundy</option>
          <option value='navy'>Navy</option>
          <option value='olive'>Olive</option>
          <option value='other'>Other</option>
        </select>
      </div>

      <div>
        <label className='block text-xs font-medium text-stone-500 mb-1'>
          Thickness
        </label>
        <select
          value={thickness || ''}
          onChange={(e) => setThickness(e.target.value || null)}
          className='w-full rounded-md border border-stone-300 py-1.5 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
        >
          <option value=''>All Thicknesses</option>
          <option value='1-2oz'>1-2 oz</option>
          <option value='2-3oz'>2-3 oz</option>
          <option value='3-4oz'>3-4 oz</option>
          <option value='4-5oz'>4-5 oz</option>
          <option value='5-6oz'>5-6 oz</option>
          <option value='6-7oz'>6-7 oz</option>
          <option value='7-8oz'>7-8 oz</option>
          <option value='8-9oz'>8-9 oz</option>
          <option value='9-10oz'>9-10 oz</option>
          <option value='10+oz'>10+ oz</option>
        </select>
      </div>

      <div className='pt-2 flex space-x-2'>
        <button
          onClick={handleApplyFilters}
          className='flex-1 bg-amber-600 text-white py-1.5 px-3 rounded-md text-sm font-medium hover:bg-amber-700'
        >
          Apply Filters
        </button>
        <button
          onClick={handleClearFilters}
          className='flex-1 bg-stone-100 text-stone-700 py-1.5 px-3 rounded-md text-sm font-medium hover:bg-stone-200'
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default LeatherFilters;
