// src/components/financial/workshop/PricingReferenceSheet.tsx
import { ArrowDown, Calculator, Printer, Tag } from 'lucide-react';
import React, { useRef } from 'react';
import { useFinancial } from '../../../context/FinancialContext';
import {
  formatCurrency,
  formatPercentage,
} from '../../../utils/financialHelpers';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';

const PricingReferenceSheet: React.FC = () => {
  const { 
    productMetrics, 
    calculatorInputs, 
    calculatorResults, 
    loading, 
    loadingState,
    error,
    refreshData
  } = useFinancial();

  const printRef = useRef<HTMLDivElement>(null);

  // Determine if we're loading the specific data needed for this component
  const isLoading = loading || loadingState.productMetrics;

  // Handle print functionality
  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const originalContents = document.body.innerHTML;

      document.body.innerHTML = `
        <html>
          <head>
            <title>HideSync Pricing Reference</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; }
              th { background-color: #f5f5f5; text-align: left; }
              .header { text-align: center; margin-bottom: 20px; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
              .section { margin-bottom: 20px; }
              .price-formula { background-color: #f9f9f9; padding: 10px; font-family: monospace; margin: 10px 0; }
              @media print {
                body { padding: 0; }
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>HideSync Pricing Reference Sheet</h1>
              <p>${new Date().toLocaleDateString()}</p>
            </div>
            ${printContents}
            <div class="footer">
              <p>Generated from HideSync Financial Analytics Dashboard</p>
              <p>For workshop reference only. Prices may need adjustment based on specific project requirements.</p>
            </div>
          </body>
        </html>
      `;

      window.print();
      document.body.innerHTML = originalContents;
    }
  };

  // Show loading spinner when loading data
  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <LoadingSpinner
          size="medium"
          color="amber"
          message="Loading pricing data..."
        />
      </div>
    );
  }

  // Handle error state with retry option
  if (error) {
    return (
      <div className='flex items-center justify-center h-64'>
        <ErrorMessage 
          message="Unable to load pricing reference data. Please try again." 
          onRetry={refreshData} 
        />
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-medium text-stone-800 flex items-center'>
          <Calculator className='h-5 w-5 mr-2 text-amber-600' />
          Workshop Pricing Reference
        </h3>
        <button
          onClick={handlePrint}
          className='flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700'
        >
          <Printer className='mr-2 h-4 w-4' />
          Print Reference
        </button>
      </div>

      <div className='bg-white p-6 rounded-lg shadow-sm border border-stone-200'>
        <div ref={printRef} className='pricing-reference'>
          {/* Print-optimized content */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4'>
            {/* Current Pricing Formula */}
            <div className='border border-stone-200 rounded-lg p-4 print:text-sm'>
              <h3 className='font-medium text-stone-800 mb-2 border-b pb-2 flex items-center'>
                <Calculator className='h-4 w-4 mr-2 text-amber-600' />
                Current Pricing Formula
              </h3>

              <div className='space-y-2'>
                <div className='grid grid-cols-2'>
                  <div className='text-stone-600'>Material Cost:</div>
                  <div className='text-right font-medium'>
                    ${calculatorInputs.materialCost}
                  </div>
                </div>

                <div className='grid grid-cols-2'>
                  <div className='text-stone-600'>Hardware Cost:</div>
                  <div className='text-right font-medium'>
                    ${calculatorInputs.hardwareCost}
                  </div>
                </div>

                <div className='grid grid-cols-2'>
                  <div className='text-stone-600'>Labor:</div>
                  <div className='text-right font-medium'>
                    {calculatorInputs.laborHours} hrs @ $
                    {calculatorInputs.laborRate}/hr
                  </div>
                </div>

                <div className='grid grid-cols-2'>
                  <div className='text-stone-600'>Overhead Rate:</div>
                  <div className='text-right font-medium'>
                    {calculatorInputs.overhead}%
                  </div>
                </div>

                <div className='grid grid-cols-2'>
                  <div className='text-stone-600'>Target Margin:</div>
                  <div className='text-right font-medium'>
                    {calculatorInputs.targetMargin}%
                  </div>
                </div>

                <div className='border-t pt-2 mt-2'>
                  <div className='grid grid-cols-2'>
                    <div className='text-stone-700 font-medium'>
                      Suggested Price:
                    </div>
                    <div className='text-right font-bold text-amber-700'>
                      ${calculatorResults.suggestedPrice}
                    </div>
                  </div>

                  <div className='grid grid-cols-2'>
                    <div className='text-stone-700'>Actual Margin:</div>
                    <div className='text-right font-medium'>
                      {calculatorResults.actualMargin}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Pricing Table */}
            <div className='border border-stone-200 rounded-lg p-4 print:text-sm'>
              <h3 className='font-medium text-stone-800 mb-2 border-b pb-2 flex items-center'>
                <Tag className='h-4 w-4 mr-2 text-amber-600' />
                Quick Price Reference
              </h3>

              <table className='min-w-full text-sm'>
                <thead>
                  <tr>
                    <th className='text-left font-medium text-stone-600'>
                      Material Cost
                    </th>
                    <th className='text-right font-medium text-stone-600'>
                      Min Price
                    </th>
                    <th className='text-right font-medium text-stone-600'>
                      Target Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[25, 50, 75, 100, 150, 200].map((cost) => {
                    // Simple calculation for example purposes
                    const directCost =
                      cost +
                      calculatorInputs.laborHours * calculatorInputs.laborRate;
                    const withOverhead =
                      directCost * (1 + calculatorInputs.overhead / 100);
                    const minPrice = withOverhead / (1 - 0.2); // 20% min margin
                    const targetPrice =
                      withOverhead / (1 - calculatorInputs.targetMargin / 100);

                    return (
                      <tr
                        key={`cost-${cost}`}
                        className='border-b border-stone-100 last:border-0'
                      >
                        <td className='py-2'>${cost}</td>
                        <td className='py-2 text-right'>
                          ${minPrice.toFixed(2)}
                        </td>
                        <td className='py-2 text-right font-medium text-amber-700'>
                          ${targetPrice.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Current Product Margins */}
            <div className='border border-stone-200 rounded-lg p-4 print:text-sm'>
              <h3 className='font-medium text-stone-800 mb-2 border-b pb-2 flex items-center'>
                <ArrowDown className='h-4 w-4 mr-2 text-amber-600' />
                Product Type Margins
              </h3>

              {productMetrics.length === 0 ? (
                <p className='text-center text-stone-500 py-4'>
                  No product data available for reference
                </p>
              ) : (
                <table className='min-w-full text-sm'>
                  <thead>
                    <tr>
                      <th className='text-left font-medium text-stone-600'>
                        Product
                      </th>
                      <th className='text-right font-medium text-stone-600'>
                        Avg Price
                      </th>
                      <th className='text-right font-medium text-stone-600'>
                        Margin
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {productMetrics.slice(0, 6).map((product, index) => {
                      // Calculate average price from sales and quantity
                      const avgPrice = product.quantity
                        ? product.sales / product.quantity
                        : 0;

                      return (
                        <tr
                          key={product.name}
                          className='border-b border-stone-100 last:border-0'
                        >
                          <td className='py-2'>{product.name}</td>
                          <td className='py-2 text-right'>
                            {formatCurrency(avgPrice)}
                          </td>
                          <td className='py-2 text-right font-medium'>
                            {formatPercentage(product.margin)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pricing Formula Reference */}
            <div className='border border-stone-200 rounded-lg p-4 print:text-sm'>
              <h3 className='font-medium text-stone-800 mb-2 border-b pb-2'>
                Pricing Formula Reference
              </h3>

              <div className='space-y-3'>
                <div>
                  <h4 className='text-sm font-medium text-stone-700'>
                    Basic Formula
                  </h4>
                  <div className='bg-stone-50 p-2 rounded border border-stone-100 font-mono text-xs'>
                    Price = Total Cost ÷ (1 - Target Margin%)
                  </div>
                </div>

                <div>
                  <h4 className='text-sm font-medium text-stone-700'>
                    Total Cost
                  </h4>
                  <div className='bg-stone-50 p-2 rounded border border-stone-100 font-mono text-xs'>
                    Total Cost = Direct Costs × (1 + Overhead%)
                  </div>
                </div>

                <div>
                  <h4 className='text-sm font-medium text-stone-700'>
                    Direct Costs
                  </h4>
                  <div className='bg-stone-50 p-2 rounded border border-stone-100 font-mono text-xs'>
                    Direct Costs = Materials + Hardware + Labor
                  </div>
                </div>

                <div>
                  <h4 className='text-sm font-medium text-stone-700'>Labor</h4>
                  <div className='bg-stone-50 p-2 rounded border border-stone-100 font-mono text-xs'>
                    Labor = Hours × Hourly Rate
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Labor Cost Quick Reference */}
          <div className='mt-6 border border-stone-200 rounded-lg p-4 print:text-sm'>
            <h3 className='font-medium text-stone-800 mb-3 border-b pb-2'>
              Labor Cost Quick Reference
            </h3>

            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              {[1, 2, 3, 4, 5, 6, 8, 10].map((hours) => (
                <div
                  key={`labor-${hours}`}
                  className='bg-stone-50 p-3 rounded border border-stone-200'
                >
                  <div className='text-sm font-medium text-stone-700 mb-1'>
                    {hours} Hour{hours > 1 ? 's' : ''}
                  </div>
                  <div className='text-xl font-bold text-amber-700'>
                    ${(hours * calculatorInputs.laborRate).toFixed(2)}
                  </div>
                  <div className='text-xs text-stone-500 mt-1'>
                    @ ${calculatorInputs.laborRate}/hr
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Common Project Pricing Estimator */}
          <div className='mt-6 border border-stone-200 rounded-lg p-4 print:text-sm'>
            <h3 className='font-medium text-stone-800 mb-3 border-b pb-2'>
              Common Project Pricing Estimator
            </h3>

            <table className='min-w-full'>
              <thead>
                <tr>
                  <th className='text-left font-medium text-stone-600 px-2 py-2'>
                    Project Type
                  </th>
                  <th className='text-center font-medium text-stone-600 px-2 py-2'>
                    Typical Hours
                  </th>
                  <th className='text-center font-medium text-stone-600 px-2 py-2'>
                    Materials Cost
                  </th>
                  <th className='text-center font-medium text-stone-600 px-2 py-2'>
                    Hardware Cost
                  </th>
                  <th className='text-right font-medium text-stone-600 px-2 py-2'>
                    Min Price
                  </th>
                  <th className='text-right font-medium text-stone-600 px-2 py-2'>
                    Target Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    type: 'Bifold Wallet',
                    hours: 2,
                    materials: 30,
                    hardware: 5,
                  },
                  { type: 'Tote Bag', hours: 5, materials: 85, hardware: 15 },
                  {
                    type: 'Messenger Bag',
                    hours: 8,
                    materials: 120,
                    hardware: 35,
                  },
                  { type: 'Belt', hours: 1.5, materials: 25, hardware: 10 },
                  {
                    type: 'Notebook Cover',
                    hours: 3,
                    materials: 45,
                    hardware: 0,
                  },
                  { type: 'Card Holder', hours: 1, materials: 15, hardware: 0 },
                ].map((project, idx) => {
                  const directCost =
                    project.materials +
                    project.hardware +
                    project.hours * calculatorInputs.laborRate;
                  const withOverhead =
                    directCost * (1 + calculatorInputs.overhead / 100);
                  const minPrice = withOverhead / (1 - 0.2); // 20% min margin
                  const targetPrice =
                    withOverhead / (1 - calculatorInputs.targetMargin / 100);

                  return (
                    <tr
                      key={`project-${idx}`}
                      className='border-b border-stone-100 hover:bg-stone-50'
                    >
                      <td className='px-2 py-2'>{project.type}</td>
                      <td className='px-2 py-2 text-center'>{project.hours}</td>
                      <td className='px-2 py-2 text-center'>
                        ${project.materials}
                      </td>
                      <td className='px-2 py-2 text-center'>
                        ${project.hardware}
                      </td>
                      <td className='px-2 py-2 text-right font-medium'>
                        ${minPrice.toFixed(2)}
                      </td>
                      <td className='px-2 py-2 text-right font-bold text-amber-700'>
                        ${targetPrice.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingReferenceSheet;