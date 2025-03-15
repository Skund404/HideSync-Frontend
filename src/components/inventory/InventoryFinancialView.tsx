import React from 'react';

interface InventoryFinancialViewProps {
  products: any[];
}

export const InventoryFinancialView: React.FC<InventoryFinancialViewProps> = ({
  products,
}) => {
  // Helper function to get profit margin color
  const getMarginColor = (margin: number) => {
    if (margin >= 40) return 'text-green-600';
    if (margin >= 30) return 'text-amber-600';
    return 'text-red-600';
  };

  // Calculate financial summary
  const calculateSummary = () => {
    const totalInventoryValue = products.reduce(
      (sum, product) => sum + product.sellingPrice * product.quantity,
      0
    );

    const totalInventoryCost = products.reduce(
      (sum, product) => sum + product.totalCost * product.quantity,
      0
    );

    const potentialProfit = totalInventoryValue - totalInventoryCost;

    const averageMargin =
      products.length > 0
        ? products.reduce((sum, product) => sum + product.profitMargin, 0) /
          products.length
        : 0;

    // Group by product type for category breakdown
    const categoryBreakdown: Record<
      string,
      {
        count: number;
        value: number;
        cost: number;
        profit: number;
        margin: number;
      }
    > = {};

    products.forEach((product) => {
      const type = product.productType;
      if (!categoryBreakdown[type]) {
        categoryBreakdown[type] = {
          count: 0,
          value: 0,
          cost: 0,
          profit: 0,
          margin: 0,
        };
      }

      categoryBreakdown[type].count += product.quantity;
      categoryBreakdown[type].value += product.sellingPrice * product.quantity;
      categoryBreakdown[type].cost += product.totalCost * product.quantity;
      categoryBreakdown[type].profit +=
        (product.sellingPrice - product.totalCost) * product.quantity;
    });

    // Calculate margin for each category
    Object.keys(categoryBreakdown).forEach((key) => {
      if (categoryBreakdown[key].value > 0) {
        categoryBreakdown[key].margin =
          (categoryBreakdown[key].profit / categoryBreakdown[key].value) * 100;
      }
    });

    return {
      totalInventoryValue,
      totalInventoryCost,
      potentialProfit,
      averageMargin,
      categoryBreakdown,
    };
  };

  const summary = calculateSummary();

  // Format product type for display
  const formatProductType = (type: string) => {
    if (!type) return '';
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Sort products by profitability (highest first)
  const sortedByProfit = [...products].sort((a, b) => {
    const profitA = (a.sellingPrice - a.totalCost) * a.quantity;
    const profitB = (b.sellingPrice - b.totalCost) * b.quantity;
    return profitB - profitA;
  });

  // Get top 5 most profitable products
  const topProfitProducts = sortedByProfit.slice(0, 5);

  // Sort by margin (highest first)
  const sortedByMargin = [...products].sort(
    (a, b) => b.profitMargin - a.profitMargin
  );

  // Get top 5 highest margin products
  const topMarginProducts = sortedByMargin.slice(0, 5);

  if (products.length === 0) {
    return (
      <div className='bg-white shadow-sm rounded-lg p-6 border border-stone-200 text-center'>
        <div className='flex flex-col items-center justify-center py-12'>
          <div className='bg-amber-100 p-4 rounded-full mb-4'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-10 w-10 text-amber-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>
          <h3 className='text-lg font-medium text-stone-700 mb-2'>
            No Financial Data Available
          </h3>
          <p className='text-stone-500 max-w-md mb-6'>
            Try adjusting your filters or add products to your inventory to view
            financial analysis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Financial Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <div className='bg-white shadow-sm rounded-lg p-6 border border-stone-200'>
          <h3 className='text-sm font-medium text-stone-500'>
            Total Inventory Value
          </h3>
          <p className='text-2xl font-bold text-stone-800 mt-1'>
            ${summary.totalInventoryValue.toFixed(2)}
          </p>
          <div className='mt-2 text-xs text-stone-500'>
            Based on current selling prices
          </div>
        </div>

        <div className='bg-white shadow-sm rounded-lg p-6 border border-stone-200'>
          <h3 className='text-sm font-medium text-stone-500'>
            Total Inventory Cost
          </h3>
          <p className='text-2xl font-bold text-stone-800 mt-1'>
            ${summary.totalInventoryCost.toFixed(2)}
          </p>
          <div className='mt-2 text-xs text-stone-500'>
            Materials, labor, and overhead
          </div>
        </div>

        <div className='bg-white shadow-sm rounded-lg p-6 border border-stone-200'>
          <h3 className='text-sm font-medium text-stone-500'>
            Potential Profit
          </h3>
          <p className='text-2xl font-bold text-green-600 mt-1'>
            ${summary.potentialProfit.toFixed(2)}
          </p>
          <div className='mt-2 text-xs text-stone-500'>
            If all current inventory sells
          </div>
        </div>

        <div className='bg-white shadow-sm rounded-lg p-6 border border-stone-200'>
          <h3 className='text-sm font-medium text-stone-500'>Average Margin</h3>
          <p className='text-2xl font-bold text-stone-800 mt-1'>
            {summary.averageMargin.toFixed(1)}%
          </p>
          <div className='mt-2 text-xs text-stone-500'>
            Across all product types
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className='bg-white shadow-sm rounded-lg p-6 border border-stone-200'>
        <h3 className='text-lg font-medium text-stone-800 mb-4'>
          Category Breakdown
        </h3>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-stone-200'>
            <thead className='bg-stone-50'>
              <tr>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Category
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Items
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Value
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Cost
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Profit
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Margin
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  % of Inventory
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-stone-200'>
              {Object.entries(summary.categoryBreakdown).map(
                ([category, data]) => (
                  <tr key={category} className='hover:bg-stone-50'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900'>
                      {formatProductType(category)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-stone-700'>
                      {data.count}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-stone-700'>
                      ${data.value.toFixed(2)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-stone-700'>
                      ${data.cost.toFixed(2)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium'>
                      ${data.profit.toFixed(2)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <span className={getMarginColor(data.margin)}>
                        {data.margin.toFixed(1)}%
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='w-full h-2 bg-stone-100 rounded-full'>
                        <div
                          className='h-full bg-amber-500 rounded-full'
                          style={{
                            width: `${
                              (data.value / summary.totalInventoryValue) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <div className='text-xs text-stone-500 mt-1'>
                        {(
                          (data.value / summary.totalInventoryValue) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Most Profitable Products */}
        <div className='bg-white shadow-sm rounded-lg p-6 border border-stone-200'>
          <h3 className='text-lg font-medium text-stone-800 mb-4'>
            Most Profitable Products
          </h3>
          <div className='space-y-4'>
            {topProfitProducts.map((product, index) => {
              const profit =
                (product.sellingPrice - product.totalCost) * product.quantity;
              return (
                <div key={product.id} className='flex items-center'>
                  <div className='flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold'>
                    {index + 1}
                  </div>
                  <div className='ml-4 flex-1'>
                    <div className='flex justify-between'>
                      <div>
                        <div className='text-sm font-medium text-stone-900'>
                          {product.name}
                        </div>
                        <div className='text-xs text-stone-500'>
                          {formatProductType(product.productType)} •{' '}
                          {product.quantity} in stock
                        </div>
                      </div>
                      <div className='text-sm font-medium text-green-600'>
                        ${profit.toFixed(2)}
                      </div>
                    </div>
                    <div className='w-full h-1.5 bg-stone-100 rounded-full mt-1'>
                      <div
                        className='h-full bg-blue-500 rounded-full'
                        style={{
                          width: `${
                            (profit /
                              ((topProfitProducts[0].sellingPrice -
                                topProfitProducts[0].totalCost) *
                                topProfitProducts[0].quantity)) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Highest Margin Products */}
        <div className='bg-white shadow-sm rounded-lg p-6 border border-stone-200'>
          <h3 className='text-lg font-medium text-stone-800 mb-4'>
            Highest Margin Products
          </h3>
          <div className='space-y-4'>
            {topMarginProducts.map((product, index) => (
              <div key={product.id} className='flex items-center'>
                <div className='flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold'>
                  {index + 1}
                </div>
                <div className='ml-4 flex-1'>
                  <div className='flex justify-between'>
                    <div>
                      <div className='text-sm font-medium text-stone-900'>
                        {product.name}
                      </div>
                      <div className='text-xs text-stone-500'>
                        {formatProductType(product.productType)} • $
                        {product.sellingPrice.toFixed(2)}
                      </div>
                    </div>
                    <div
                      className={`text-sm font-medium ${getMarginColor(
                        product.profitMargin
                      )}`}
                    >
                      {product.profitMargin.toFixed(1)}%
                    </div>
                  </div>
                  <div className='w-full h-1.5 bg-stone-100 rounded-full mt-1'>
                    <div
                      className='h-full bg-green-500 rounded-full'
                      style={{ width: `${(product.profitMargin / 50) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Insights */}
      <div className='bg-white shadow-sm rounded-lg p-6 border border-stone-200'>
        <h3 className='text-lg font-medium text-stone-800 mb-4'>
          Financial Insights
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <h4 className='text-sm font-medium text-stone-700 mb-2'>
              Cost Breakdown
            </h4>
            <div className='space-y-3'>
              <div>
                <div className='flex justify-between text-sm mb-1'>
                  <span className='text-stone-500'>Materials</span>
                  <span className='text-stone-700'>
                    $
                    {products
                      .reduce(
                        (sum, p) =>
                          sum + p.costBreakdown.materials * p.quantity,
                        0
                      )
                      .toFixed(2)}
                  </span>
                </div>
                <div className='w-full h-2 bg-stone-100 rounded-full'>
                  <div
                    className='h-full bg-blue-500 rounded-full'
                    style={{
                      width: `${
                        (products.reduce(
                          (sum, p) =>
                            sum + p.costBreakdown.materials * p.quantity,
                          0
                        ) /
                          summary.totalInventoryCost) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className='flex justify-between text-sm mb-1'>
                  <span className='text-stone-500'>Labor</span>
                  <span className='text-stone-700'>
                    $
                    {products
                      .reduce(
                        (sum, p) => sum + p.costBreakdown.labor * p.quantity,
                        0
                      )
                      .toFixed(2)}
                  </span>
                </div>
                <div className='w-full h-2 bg-stone-100 rounded-full'>
                  <div
                    className='h-full bg-amber-500 rounded-full'
                    style={{
                      width: `${
                        (products.reduce(
                          (sum, p) => sum + p.costBreakdown.labor * p.quantity,
                          0
                        ) /
                          summary.totalInventoryCost) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className='flex justify-between text-sm mb-1'>
                  <span className='text-stone-500'>Overhead</span>
                  <span className='text-stone-700'>
                    $
                    {products
                      .reduce(
                        (sum, p) => sum + p.costBreakdown.overhead * p.quantity,
                        0
                      )
                      .toFixed(2)}
                  </span>
                </div>
                <div className='w-full h-2 bg-stone-100 rounded-full'>
                  <div
                    className='h-full bg-green-500 rounded-full'
                    style={{
                      width: `${
                        (products.reduce(
                          (sum, p) =>
                            sum + p.costBreakdown.overhead * p.quantity,
                          0
                        ) /
                          summary.totalInventoryCost) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className='text-sm font-medium text-stone-700 mb-2'>
              Margin Distribution
            </h4>
            <div className='space-y-3'>
              <div>
                <div className='flex justify-between text-sm mb-1'>
                  <span className='text-stone-500'>High Margin (&gt;40%)</span>
                  <span className='text-green-600 font-medium'>
                    {products.filter((p) => p.profitMargin > 40).length}{' '}
                    products
                  </span>
                </div>
                <div className='w-full h-2 bg-stone-100 rounded-full'>
                  <div
                    className='h-full bg-green-500 rounded-full'
                    style={{
                      width: `${
                        (products.filter((p) => p.profitMargin > 40).length /
                          products.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className='flex justify-between text-sm mb-1'>
                  <span className='text-stone-500'>Medium Margin (30-40%)</span>
                  <span className='text-amber-600 font-medium'>
                    {
                      products.filter(
                        (p) => p.profitMargin <= 40 && p.profitMargin >= 30
                      ).length
                    }{' '}
                    products
                  </span>
                </div>
                <div className='w-full h-2 bg-stone-100 rounded-full'>
                  <div
                    className='h-full bg-amber-500 rounded-full'
                    style={{
                      width: `${
                        (products.filter(
                          (p) => p.profitMargin <= 40 && p.profitMargin >= 30
                        ).length /
                          products.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className='flex justify-between text-sm mb-1'>
                  <span className='text-stone-500'>Low Margin (&lt;30%)</span>
                  <span className='text-red-600 font-medium'>
                    {products.filter((p) => p.profitMargin < 30).length}{' '}
                    products
                  </span>
                </div>
                <div className='w-full h-2 bg-stone-100 rounded-full'>
                  <div
                    className='h-full bg-red-500 rounded-full'
                    style={{
                      width: `${
                        (products.filter((p) => p.profitMargin < 30).length /
                          products.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryFinancialView;
