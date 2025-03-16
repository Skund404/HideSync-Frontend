import { useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { ProjectType } from '../../types/enums';

interface TopProduct {
  id: number;
  name: string;
  type: ProjectType;
  totalSold: number;
  revenue: number;
  profit: number;
  margin: number;
  trend: 'up' | 'down' | 'stable';
  percentChange: number;
}

const TopProductsWidget = () => {
  const { sales, completedSales } = useSales();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>(
    'month'
  );

  // Mock data for top products - in a real implementation, this would be calculated from sales data
  const topProducts: TopProduct[] = [
    {
      id: 1,
      name: 'Classic Bifold Wallet',
      type: ProjectType.BIFOLD_WALLET,
      totalSold: 42,
      revenue: 2940,
      profit: 1764,
      margin: 60,
      trend: 'up',
      percentChange: 15,
    },
    {
      id: 2,
      name: 'Leather Belt',
      type: ProjectType.BELT,
      totalSold: 35,
      revenue: 2450,
      profit: 1470,
      margin: 60,
      trend: 'up',
      percentChange: 8,
    },
    {
      id: 3,
      name: 'Card Holder',
      type: ProjectType.CARD_HOLDER,
      totalSold: 27,
      revenue: 1350,
      profit: 837,
      margin: 62,
      trend: 'down',
      percentChange: 3,
    },
    {
      id: 4,
      name: 'Messenger Bag',
      type: ProjectType.MESSENGER_BAG,
      totalSold: 12,
      revenue: 2640,
      profit: 1680,
      margin: 64,
      trend: 'stable',
      percentChange: 0,
    },
    {
      id: 5,
      name: 'Leather Journal Cover',
      type: ProjectType.NOTEBOOK_COVER,
      totalSold: 18,
      revenue: 1260,
      profit: 680,
      margin: 54,
      trend: 'up',
      percentChange: 12,
    },
  ];

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className='bg-white shadow-sm rounded-lg p-4 border border-stone-200'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-lg font-medium text-stone-800'>
          Top Selling Products
        </h3>
        <div className='flex space-x-2'>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-2 py-1 text-xs rounded-md ${
              timeRange === 'week'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-2 py-1 text-xs rounded-md ${
              timeRange === 'month'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('quarter')}
            className={`px-2 py-1 text-xs rounded-md ${
              timeRange === 'quarter'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Quarter
          </button>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-stone-200'>
          <thead className='bg-stone-50'>
            <tr>
              <th
                scope='col'
                className='px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
              >
                Product
              </th>
              <th
                scope='col'
                className='px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
              >
                Sold
              </th>
              <th
                scope='col'
                className='px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
              >
                Revenue
              </th>
              <th
                scope='col'
                className='px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
              >
                Margin
              </th>
              <th
                scope='col'
                className='px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
              >
                Trend
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-stone-200'>
            {topProducts.map((product) => (
              <tr key={product.id} className='hover:bg-stone-50'>
                <td className='px-4 py-3 whitespace-nowrap'>
                  <div className='flex items-center'>
                    <div className='h-8 w-8 flex-shrink-0 bg-stone-200 rounded-md overflow-hidden'>
                      {/* Product image would go here */}
                      <div className='h-full w-full flex items-center justify-center text-xs text-stone-500'>
                        {product.name.charAt(0)}
                      </div>
                    </div>
                    <div className='ml-3'>
                      <div className='text-sm font-medium text-stone-900'>
                        {product.name}
                      </div>
                      <div className='text-xs text-stone-500'>
                        {product.type.replace(/_/g, ' ').toLowerCase()}
                      </div>
                    </div>
                  </div>
                </td>
                <td className='px-4 py-3 whitespace-nowrap text-sm text-stone-600'>
                  {product.totalSold}
                </td>
                <td className='px-4 py-3 whitespace-nowrap text-sm text-stone-600'>
                  {formatCurrency(product.revenue)}
                </td>
                <td className='px-4 py-3 whitespace-nowrap text-sm text-stone-600'>
                  {product.margin}%
                </td>
                <td className='px-4 py-3 whitespace-nowrap'>
                  <div className='flex items-center'>
                    {product.trend === 'up' ? (
                      <svg
                        className='h-4 w-4 text-green-500'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M5 10l7-7m0 0l7 7m-7-7v18'
                        />
                      </svg>
                    ) : product.trend === 'down' ? (
                      <svg
                        className='h-4 w-4 text-red-500'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 14l-7 7m0 0l-7-7m7 7V3'
                        />
                      </svg>
                    ) : (
                      <svg
                        className='h-4 w-4 text-stone-400'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M5 12h14'
                        />
                      </svg>
                    )}
                    <span
                      className={`ml-1 text-xs ${
                        product.trend === 'up'
                          ? 'text-green-500'
                          : product.trend === 'down'
                          ? 'text-red-500'
                          : 'text-stone-500'
                      }`}
                    >
                      {product.percentChange > 0 ? '+' : ''}
                      {product.percentChange}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className='mt-4 border-t border-stone-200 pt-3 flex justify-center'>
        <a
          href='/sales/products'
          className='text-sm text-amber-600 hover:text-amber-800 font-medium flex items-center'
        >
          View all products
          <svg
            className='ml-1 h-4 w-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 5l7 7-7 7'
            />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default TopProductsWidget;
