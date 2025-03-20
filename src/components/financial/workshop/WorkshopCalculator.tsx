import {
  Calculator,
  Clock,
  DollarSign,
  Percent,
  RefreshCw,
} from 'lucide-react';
import React, { useState } from 'react';
import { useFinancial } from '../../../context/FinancialContext';
import { formatCurrency } from '../../../utils/financialHelpers';

const WorkshopCalculator: React.FC = () => {
  const { calculatorInputs } = useFinancial();

  // Simple mode states
  const [materialCost, setMaterialCost] = useState('75');
  const [hardwareCost, setHardwareCost] = useState('25');
  const [hours, setHours] = useState('3');

  // Derived values
  const hourlyRate = calculatorInputs.laborRate;
  const overhead = calculatorInputs.overhead;
  const targetMargin = calculatorInputs.targetMargin;

  // Calculate basic price
  const calcDirectCosts =
    parseFloat(materialCost) +
    parseFloat(hardwareCost) +
    parseFloat(hours) * hourlyRate;
  const calcOverhead = calcDirectCosts * (overhead / 100);
  const calcTotalCost = calcDirectCosts + calcOverhead;
  const calcPrice = calcTotalCost / (1 - targetMargin / 100);

  // Reference presets for common projects
  const commonProjects = [
    { name: 'Bifold Wallet', materials: 30, hardware: 5, hours: 2 },
    { name: 'Card Holder', materials: 15, hardware: 0, hours: 1 },
    { name: 'Belt', materials: 35, hardware: 10, hours: 1.5 },
    { name: 'Tote Bag', materials: 85, hardware: 15, hours: 5 },
    { name: 'Notebook Cover', materials: 45, hardware: 0, hours: 3 },
  ];

  // Apply preset to calculator
  const applyPreset = (preset: (typeof commonProjects)[0]) => {
    setMaterialCost(preset.materials.toString());
    setHardwareCost(preset.hardware.toString());
    setHours(preset.hours.toString());
  };

  // Reset to defaults
  const resetValues = () => {
    setMaterialCost('75');
    setHardwareCost('25');
    setHours('3');
  };

  return (
    <div className='max-w-md mx-auto'>
      <h3 className='text-lg font-medium mb-4 flex items-center'>
        <Calculator className='h-5 w-5 mr-2 text-amber-600' />
        Quick Workshop Calculator
      </h3>
      <p className='text-stone-600 mb-6'>
        Simple pricing calculator optimized for quick use while in your
        workshop.
      </p>

      <div className='bg-stone-50 p-5 rounded-lg border border-stone-200 shadow-sm mb-6'>
        <div className='space-y-4'>
          {/* Materials Cost Input */}
          <div>
            <label className='flex justify-between items-center text-sm font-medium text-stone-700 mb-1'>
              <span>Materials Cost</span>
              <span className='text-stone-500'>${materialCost}</span>
            </label>
            <input
              type='range'
              min='0'
              max='300'
              step='5'
              value={materialCost}
              onChange={(e) => setMaterialCost(e.target.value)}
              className='w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600'
            />
            <div className='flex justify-between text-xs text-stone-500 mt-1'>
              <span>$0</span>
              <span>$100</span>
              <span>$200</span>
              <span>$300</span>
            </div>
          </div>

          {/* Hardware Cost Input */}
          <div>
            <label className='flex justify-between items-center text-sm font-medium text-stone-700 mb-1'>
              <span>Hardware Cost</span>
              <span className='text-stone-500'>${hardwareCost}</span>
            </label>
            <input
              type='range'
              min='0'
              max='100'
              step='5'
              value={hardwareCost}
              onChange={(e) => setHardwareCost(e.target.value)}
              className='w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600'
            />
            <div className='flex justify-between text-xs text-stone-500 mt-1'>
              <span>$0</span>
              <span>$25</span>
              <span>$50</span>
              <span>$100</span>
            </div>
          </div>

          {/* Labor Hours Input */}
          <div>
            <label className='flex justify-between items-center text-sm font-medium text-stone-700 mb-1'>
              <span>Labor Hours</span>
              <span className='text-stone-500'>{hours} hrs</span>
            </label>
            <input
              type='range'
              min='0.5'
              max='20'
              step='0.5'
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className='w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600'
            />
            <div className='flex justify-between text-xs text-stone-500 mt-1'>
              <span>0.5</span>
              <span>5</span>
              <span>10</span>
              <span>20</span>
            </div>
          </div>

          {/* Direct Inputs (Optional) */}
          <div className='grid grid-cols-3 gap-2 pt-3 border-t border-stone-200'>
            <div>
              <label className='block text-xs text-stone-500 mb-1'>
                Materials
              </label>
              <input
                type='number'
                value={materialCost}
                onChange={(e) => setMaterialCost(e.target.value)}
                className='w-full bg-white border border-stone-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-xs text-stone-500 mb-1'>
                Hardware
              </label>
              <input
                type='number'
                value={hardwareCost}
                onChange={(e) => setHardwareCost(e.target.value)}
                className='w-full bg-white border border-stone-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-xs text-stone-500 mb-1'>Hours</label>
              <input
                type='number'
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                step='0.5'
                className='w-full bg-white border border-stone-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent'
              />
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={resetValues}
          className='flex items-center text-xs text-amber-600 hover:text-amber-700 mt-3'
        >
          <RefreshCw className='h-3 w-3 mr-1' />
          Reset to Defaults
        </button>
      </div>

      {/* Calculation Results */}
      <div className='bg-amber-50 p-5 rounded-lg border border-amber-100 shadow-sm mb-6'>
        <div className='flex items-center justify-between mb-4'>
          <div className='space-y-1'>
            <div className='flex items-center text-sm text-amber-800'>
              <DollarSign className='h-4 w-4 mr-1' />
              Calculated Price
            </div>
            <div className='text-3xl font-bold text-amber-900'>
              {formatCurrency(calcPrice)}
            </div>
          </div>

          <div className='bg-white p-2 rounded-lg border border-amber-200'>
            <div className='text-xs text-amber-700 mb-1'>Margin</div>
            <div className='flex items-center'>
              <Percent className='h-3 w-3 mr-1 text-amber-600' />
              <span className='font-medium'>{targetMargin}%</span>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3 text-sm'>
          <div>
            <div className='text-xs text-amber-700'>Materials & Hardware</div>
            <div className='font-medium'>
              {formatCurrency(
                parseFloat(materialCost) + parseFloat(hardwareCost)
              )}
            </div>
          </div>

          <div>
            <div className='text-xs text-amber-700'>Labor Cost</div>
            <div className='font-medium'>
              {formatCurrency(parseFloat(hours) * hourlyRate)}
              <span className='text-xs ml-1 text-amber-600'>
                ({hours}h @ ${hourlyRate}/h)
              </span>
            </div>
          </div>

          <div>
            <div className='text-xs text-amber-700'>Overhead ({overhead}%)</div>
            <div className='font-medium'>{formatCurrency(calcOverhead)}</div>
          </div>

          <div>
            <div className='text-xs text-amber-700'>Total Cost</div>
            <div className='font-medium'>{formatCurrency(calcTotalCost)}</div>
          </div>
        </div>
      </div>

      {/* Common Projects */}
      <div>
        <h4 className='font-medium text-stone-700 mb-3 flex items-center'>
          <Clock className='h-4 w-4 mr-2' />
          Quick Project Presets
        </h4>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
          {commonProjects.map((project, index) => (
            <button
              key={index}
              onClick={() => applyPreset(project)}
              className='flex justify-between items-center p-3 bg-white rounded-md border border-stone-200 hover:bg-stone-50 text-left'
            >
              <div>
                <div className='font-medium'>{project.name}</div>
                <div className='text-xs text-stone-500'>
                  {project.hours} hrs
                </div>
              </div>
              <div>
                <div className='text-sm font-medium text-amber-600'>
                  ${(project.materials + project.hardware).toFixed(0)}
                </div>
                <div className='text-xs text-stone-500'>materials</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkshopCalculator;
