import { Calculator, Clock, DollarSign, Percent } from 'lucide-react';
import React, { useState } from 'react';
import { useFinancial } from '../../../context/FinancialContext';
import {
  formatCurrency,
  formatPercentage,
} from '../../../utils/financialHelpers';

const PricingCalculator: React.FC = () => {
  const {
    calculatorInputs,
    calculatorResults,
    updateCalculatorInputs,
    productMetrics,
  } = useFinancial();

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateCalculatorInputs({ [name]: parseFloat(value) || 0 });
  };

  // Profit margin color based on target
  const getMarginColor = () => {
    const actualMargin = parseFloat(calculatorResults.actualMargin);
    const targetMargin = calculatorInputs.targetMargin;

    if (actualMargin >= targetMargin) return 'text-green-600';
    if (actualMargin >= targetMargin * 0.9) return 'text-amber-600';
    return 'text-red-600';
  };

  // Top performing products by margin for comparison
  const topMarginProducts = productMetrics
    .slice()
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 3);

  return (
    <div className='space-y-6'>
      <p className='text-stone-600 mb-4'>
        Calculate optimal pricing for your leather products based on material
        costs, labor, overhead, and your target profit margin.
      </p>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Inputs Column */}
        <div className='space-y-4'>
          <h4 className='font-medium text-stone-700 flex items-center'>
            <Calculator className='h-5 w-5 mr-2 text-amber-600' />
            Project Costs
          </h4>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-xs font-medium text-stone-500 mb-1'>
                Material Cost ($)
              </label>
              <input
                type='number'
                name='materialCost'
                value={calculatorInputs.materialCost}
                onChange={handleInputChange}
                className='w-full bg-stone-100 border border-stone-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              />
            </div>

            <div>
              <label className='block text-xs font-medium text-stone-500 mb-1'>
                Hardware Cost ($)
              </label>
              <input
                type='number'
                name='hardwareCost'
                value={calculatorInputs.hardwareCost}
                onChange={handleInputChange}
                className='w-full bg-stone-100 border border-stone-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-xs font-medium text-stone-500 mb-1'>
                <span className='flex items-center'>
                  <Clock className='h-4 w-4 mr-1' />
                  Labor Hours
                </span>
              </label>
              <input
                type='number'
                name='laborHours'
                value={calculatorInputs.laborHours}
                onChange={handleInputChange}
                className='w-full bg-stone-100 border border-stone-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-xs font-medium text-stone-500 mb-1'>
                Hourly Rate ($)
              </label>
              <input
                type='number'
                name='laborRate'
                value={calculatorInputs.laborRate}
                onChange={handleInputChange}
                className='w-full bg-stone-100 border border-stone-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-xs font-medium text-stone-500 mb-1'>
                Overhead (%)
              </label>
              <input
                type='number'
                name='overhead'
                value={calculatorInputs.overhead}
                onChange={handleInputChange}
                className='w-full bg-stone-100 border border-stone-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-xs font-medium text-stone-500 mb-1'>
                <span className='flex items-center'>
                  <Percent className='h-4 w-4 mr-1' />
                  Target Margin (%)
                </span>
              </label>
              <input
                type='number'
                name='targetMargin'
                value={calculatorInputs.targetMargin}
                onChange={handleInputChange}
                className='w-full bg-stone-100 border border-stone-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              />
            </div>
          </div>

          {showAdvanced && (
            <div className='mt-4 pt-4 border-t border-stone-200'>
              <h5 className='text-sm font-medium text-stone-700 mb-3'>
                Advanced Options
              </h5>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-medium text-stone-500 mb-1'>
                    Shipping Cost ($)
                  </label>
                  <input
                    type='number'
                    name='shippingCost'
                    value={calculatorInputs.shippingCost ?? 0}
                    onChange={handleInputChange}
                    className='w-full bg-stone-100 border border-stone-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                  />
                </div>

                <div>
                  <label className='block text-xs font-medium text-stone-500 mb-1'>
                    Platform Fees (%)
                  </label>
                  <input
                    type='number'
                    name='platformFees'
                    value={calculatorInputs.platformFees ?? 0}
                    onChange={handleInputChange}
                    className='w-full bg-stone-100 border border-stone-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4 mt-3'>
                <div>
                  <label className='block text-xs font-medium text-stone-500 mb-1'>
                    Packaging Cost ($)
                  </label>
                  <input
                    type='number'
                    name='packagingCost'
                    value={calculatorInputs.packagingCost ?? 0}
                    onChange={handleInputChange}
                    className='w-full bg-stone-100 border border-stone-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                  />
                </div>

                <div>
                  <label className='block text-xs font-medium text-stone-500 mb-1'>
                    Marketing Cost (%)
                  </label>
                  <input
                    type='number'
                    name='marketingCost'
                    value={calculatorInputs.marketingCost ?? 0}
                    onChange={handleInputChange}
                    className='w-full bg-stone-100 border border-stone-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                  />
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className='text-sm text-amber-600 hover:text-amber-700 font-medium mt-2'
          >
            {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
          </button>
        </div>

        {/* Results Column */}
        <div className='space-y-4'>
          <h4 className='font-medium text-stone-700 flex items-center'>
            <DollarSign className='h-5 w-5 mr-2 text-amber-600' />
            Pricing Results
          </h4>

          <div className='bg-amber-50 p-6 rounded-lg border border-amber-100'>
            <div className='mb-4'>
              <div className='text-2xl font-bold text-amber-800'>
                Suggested Price:{' '}
                {formatCurrency(parseFloat(calculatorResults.suggestedPrice))}
              </div>
              <div className={`text-sm font-medium mt-1 ${getMarginColor()}`}>
                Profit Margin: {calculatorResults.actualMargin}%
                {parseFloat(calculatorResults.actualMargin) <
                  calculatorInputs.targetMargin && (
                  <span className='text-xs ml-2 text-amber-700'>
                    (Target: {calculatorInputs.targetMargin}%)
                  </span>
                )}
              </div>
            </div>

            <div className='grid grid-cols-2 gap-x-4 gap-y-3'>
              <div className='text-sm text-stone-600'>
                Materials & Hardware:
              </div>
              <div className='text-sm text-stone-800 font-medium text-right'>
                {formatCurrency(
                  parseFloat(calculatorInputs.materialCost.toString()) +
                    parseFloat(calculatorInputs.hardwareCost.toString())
                )}
              </div>

              <div className='text-sm text-stone-600'>Labor Cost:</div>
              <div className='text-sm text-stone-800 font-medium text-right'>
                {formatCurrency(
                  parseFloat(calculatorInputs.laborHours.toString()) *
                    parseFloat(calculatorInputs.laborRate.toString())
                )}
              </div>

              <div className='text-sm text-stone-600'>Overhead:</div>
              <div className='text-sm text-stone-800 font-medium text-right'>
                {formatCurrency(parseFloat(calculatorResults.overheadAmount))}
              </div>

              {showAdvanced && (calculatorInputs.shippingCost ?? 0) > 0 && (
                <>
                  <div className='text-sm text-stone-600'>Shipping:</div>
                  <div className='text-sm text-stone-800 font-medium text-right'>
                    {formatCurrency(
                      parseFloat(
                        (calculatorInputs.shippingCost ?? 0).toString()
                      )
                    )}
                  </div>
                </>
              )}

              {showAdvanced && (calculatorInputs.packagingCost ?? 0) > 0 && (
                <>
                  <div className='text-sm text-stone-600'>Packaging:</div>
                  <div className='text-sm text-stone-800 font-medium text-right'>
                    {formatCurrency(
                      parseFloat(
                        (calculatorInputs.packagingCost ?? 0).toString()
                      )
                    )}
                  </div>
                </>
              )}

              <div className='text-sm text-stone-600 font-medium pt-2 border-t border-amber-200'>
                Total Cost:
              </div>
              <div className='text-sm text-stone-800 font-medium text-right pt-2 border-t border-amber-200'>
                {formatCurrency(parseFloat(calculatorResults.totalCost))}
              </div>

              <div className='text-sm text-stone-600'>Profit:</div>
              <div className='text-sm text-green-600 font-medium text-right'>
                {formatCurrency(parseFloat(calculatorResults.profit))}
              </div>
            </div>
          </div>

          <div className='bg-white p-4 rounded-lg border border-stone-200'>
            <h5 className='font-medium text-stone-700 mb-3'>
              Market Comparison
            </h5>
            <div className='space-y-2'>
              {topMarginProducts.map((product, idx) => (
                <div
                  key={`top-product-${idx}`}
                  className='flex justify-between items-center p-2 rounded bg-stone-50'
                >
                  <span className='text-sm'>{product.name}</span>
                  <span className='text-sm font-medium'>
                    {formatPercentage(product.margin)}
                  </span>
                </div>
              ))}
            </div>
            <p className='text-xs text-stone-500 mt-3'>
              Your calculated margin of {calculatorResults.actualMargin}%
              compared to top products
            </p>
          </div>

          <div className='bg-stone-50 p-4 rounded-lg border border-stone-200'>
            <h5 className='font-medium text-stone-700 mb-2'>Pricing Formula</h5>
            <div className='bg-white p-3 rounded-md border border-stone-200 font-mono text-xs overflow-x-auto'>
              Price = (Materials + Hardware + (Labor Hours × Rate) + Additional
              Costs) × (1 + Overhead%) ÷ (1 - Target Margin%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;
