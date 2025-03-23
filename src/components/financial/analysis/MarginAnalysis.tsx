// src/components/financial/analysis/MarginAnalysis.tsx
import { Activity, Calculator, DollarSign, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
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
import { useFinancial } from '../../../context/FinancialContext';
import {
  calculateBreakEven,
  calculateContributionMarginRatio,
  formatCurrency,
  formatPercentage,
} from '../../../utils/financialHelpers';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#9370DB',
  '#FF6B6B',
];

const MarginAnalysis: React.FC = () => {
  const { productMetrics, materialCosts, loading, loadingState, error, refreshData } = useFinancial();
  const [analysisType, setAnalysisType] = useState<
    'comparison' | 'breakdown' | 'breakeven' | 'elasticity'
  >('comparison');

  // Basic inputs for break-even analysis
  const [breakEvenInputs, setBreakEvenInputs] = useState({
    fixedCosts: 5000,
    pricePerUnit: 150,
    variableCostPerUnit: 75,
  });

  // Basic inputs for price elasticity analysis
  const [elasticityInputs, setElasticityInputs] = useState({
    currentPrice: 150,
    newPrice: 175,
    currentVolume: 100,
    elasticity: -1.2,
  });

  // Loading state based on needed data
  const isLoading = loading || 
    (analysisType === 'comparison' && loadingState.productMetrics) ||
    (analysisType === 'breakdown' && loadingState.materialCosts);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <LoadingSpinner
          size="medium"
          color="amber"
          message={`Loading ${analysisType} data...`}
        />
      </div>
    );
  }

  // Handle error states
  if (error) {
    return (
      <div className='flex items-center justify-center h-64'>
        <ErrorMessage 
          message="Unable to load margin analysis data. Please try again." 
          onRetry={refreshData} 
        />
      </div>
    );
  }

  // Check for required data based on analysis type
  if (analysisType === 'comparison' && !productMetrics.length) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-stone-500'>No product metrics available for comparison analysis</p>
      </div>
    );
  }

  // Prepare product margin comparison data
  const marginComparisonData = productMetrics.map((product) => ({
    name: product.name,
    margin: parseFloat(product.margin.toFixed(1)),
    sales: product.sales,
  }));

  // Calculate contribution margin for break-even analysis
  const contributionMargin =
    breakEvenInputs.pricePerUnit - breakEvenInputs.variableCostPerUnit;
  const contributionMarginRatio = calculateContributionMarginRatio(
    breakEvenInputs.pricePerUnit,
    breakEvenInputs.variableCostPerUnit
  );
  const breakEvenPoint = calculateBreakEven(
    breakEvenInputs.fixedCosts,
    breakEvenInputs.pricePerUnit,
    breakEvenInputs.variableCostPerUnit
  );

  // Calculate price elasticity results
  const priceChangePercent =
    (elasticityInputs.newPrice - elasticityInputs.currentPrice) /
    elasticityInputs.currentPrice;
  const volumeChangePercent = priceChangePercent * elasticityInputs.elasticity;
  const newVolume = elasticityInputs.currentVolume * (1 + volumeChangePercent);
  const currentRevenue =
    elasticityInputs.currentPrice * elasticityInputs.currentVolume;
  const newRevenue = elasticityInputs.newPrice * newVolume;
  const revenueChange = newRevenue - currentRevenue;
  const revenueChangePercent = (revenueChange / currentRevenue) * 100;

  // Transform materialCosts into cost breakdown data
  const costBreakdownData =
    materialCosts && materialCosts.length > 0
      ? (() => {
          const latest = materialCosts[materialCosts.length - 1];
          return [
            { name: 'Leather', value: latest.leather },
            { name: 'Hardware', value: latest.hardware },
            { name: 'Thread', value: latest.thread },
            { name: 'Other', value: latest.other },
          ];
        })()
      : [
          { name: 'Leather', value: 45 },
          { name: 'Hardware', value: 15 },
          { name: 'Thread', value: 25 },
          { name: 'Other', value: 15 },
        ];

  return (
    <div className='space-y-6'>
      {/* Analysis Type Selector */}
      <div className='flex justify-center'>
        <div className='inline-flex shadow-sm rounded-md'>
          <button
            type='button'
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              analysisType === 'comparison'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-stone-700 hover:bg-stone-100'
            }`}
            onClick={() => setAnalysisType('comparison')}
          >
            Margin Comparison
          </button>
          <button
            type='button'
            className={`px-4 py-2 text-sm font-medium ${
              analysisType === 'breakdown'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-stone-700 hover:bg-stone-100'
            }`}
            onClick={() => setAnalysisType('breakdown')}
          >
            Cost Breakdown
          </button>
          <button
            type='button'
            className={`px-4 py-2 text-sm font-medium ${
              analysisType === 'breakeven'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-stone-700 hover:bg-stone-100'
            }`}
            onClick={() => setAnalysisType('breakeven')}
          >
            Break-Even
          </button>
          <button
            type='button'
            className={`px-4 py-2 text-sm font-medium rounded-r-md ${
              analysisType === 'elasticity'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-stone-700 hover:bg-stone-100'
            }`}
            onClick={() => setAnalysisType('elasticity')}
          >
            Price Elasticity
          </button>
        </div>
      </div>

      {/* Analysis Content */}
      <div className='bg-white p-6 rounded-lg border border-stone-200 shadow-sm'>
        {/* Margin Comparison Analysis */}
        {analysisType === 'comparison' && (
          <div>
            <h3 className='text-lg font-medium mb-4 flex items-center'>
              <Activity className='h-5 w-5 mr-2 text-amber-600' />
              Product Margin Comparison
            </h3>
            <p className='text-stone-600 mb-4'>
              Compare profit margins across different product types to identify
              your most profitable products and opportunities for improvement.
            </p>

            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={marginComparisonData}
                  margin={{ top: 10, right: 30, left: 20, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='name'
                    angle={-45}
                    textAnchor='end'
                    height={70}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId='left'
                    orientation='left'
                    stroke='#8884d8'
                    unit='%'
                  />
                  <YAxis
                    yAxisId='right'
                    orientation='right'
                    stroke='#82ca9d'
                    domain={[0, 'dataMax']}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'margin')
                        return formatPercentage(value as number);
                      return formatCurrency(value as number);
                    }}
                  />
                  <Legend />
                  <Bar
                    yAxisId='left'
                    dataKey='margin'
                    name='Profit Margin'
                    fill='#8884d8'
                  />
                  <Bar
                    yAxisId='right'
                    dataKey='sales'
                    name='Sales Volume'
                    fill='#82ca9d'
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className='mt-6 p-4 bg-blue-50 rounded-md border border-blue-100'>
              <h4 className='font-medium text-blue-800 mb-2'>
                Margin Analysis Insights
              </h4>
              <ul className='space-y-1 text-sm text-blue-700'>
                <li>
                  • {productMetrics[0]?.name || 'Product 1'} has the highest
                  profit margin at{' '}
                  {formatPercentage(productMetrics[0]?.margin || 0)}
                </li>
                <li>
                  • The average profit margin across all products is{' '}
                  {formatPercentage(
                    productMetrics.reduce(
                      (sum, product) => sum + product.margin,
                      0
                    ) / productMetrics.length
                  )}
                </li>
                <li>
                  • Consider adjusting pricing for products with margins below
                  35%
                </li>
                <li>
                  • Products with high sales volumes but low margins may benefit
                  from cost optimization
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Cost Breakdown Analysis */}
        {analysisType === 'breakdown' && (
          <div>
            <h3 className='text-lg font-medium mb-4 flex items-center'>
              <DollarSign className='h-5 w-5 mr-2 text-amber-600' />
              Cost Structure Analysis
            </h3>
            <p className='text-stone-600 mb-4'>
              Analyze the composition of your product costs to identify which
              components have the largest impact on your margins.
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='h-64'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={costBreakdownData}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {costBreakdownData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className='p-4 bg-stone-50 rounded-md border border-stone-200'>
                <h4 className='font-medium text-stone-800 mb-3'>
                  Cost Distribution
                </h4>
                <div className='space-y-2'>
                  {costBreakdownData.map((item, index) => (
                    <div
                      key={`item-${index}`}
                      className='flex items-center justify-between'
                    >
                      <div className='flex items-center'>
                        <div
                          className='w-4 h-4 rounded-full mr-2'
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        ></div>
                        <span className='text-sm'>{item.name}</span>
                      </div>
                      <span className='font-medium'>
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className='mt-4 pt-4 border-t border-stone-300'>
                  <h4 className='font-medium text-stone-800 mb-2'>
                    Cost Reduction Potential
                  </h4>
                  <p className='text-sm text-stone-600'>
                    Focus on the largest cost components for maximum impact. A
                    10% reduction in {costBreakdownData[0].name} costs could
                    increase margins by approximately 4.5%.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Break-Even Analysis - No API call needed for this calculation */}
        {analysisType === 'breakeven' && (
          <div>
            <h3 className='text-lg font-medium mb-4 flex items-center'>
              <Calculator className='h-5 w-5 mr-2 text-amber-600' />
              Break-Even Analysis
            </h3>
            <p className='text-stone-600 mb-4'>
              Calculate how many units you need to sell to cover your fixed
              costs and start generating profit.
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Fixed Costs ($)
                  </label>
                  <input
                    type='number'
                    value={breakEvenInputs.fixedCosts}
                    onChange={(e) =>
                      setBreakEvenInputs({
                        ...breakEvenInputs,
                        fixedCosts: parseFloat(e.target.value) || 0,
                      })
                    }
                    className='w-full bg-stone-100 border border-stone-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                  />
                  <p className='text-xs text-stone-500 mt-1'>
                    Monthly costs that don't change based on production volume
                    (rent, equipment, etc.)
                  </p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Variable Cost Per Unit ($)
                  </label>
                  <input
                    type='number'
                    value={breakEvenInputs.variableCostPerUnit}
                    onChange={(e) =>
                      setBreakEvenInputs({
                        ...breakEvenInputs,
                        variableCostPerUnit: parseFloat(e.target.value) || 0,
                      })
                    }
                    className='w-full bg-stone-100 border border-stone-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                  />
                  <p className='text-xs text-stone-500 mt-1'>
                    Costs that change with each unit produced (materials, labor,
                    etc.)
                  </p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Price Per Unit ($)
                  </label>
                  <input
                    type='number'
                    value={breakEvenInputs.pricePerUnit}
                    onChange={(e) =>
                      setBreakEvenInputs({
                        ...breakEvenInputs,
                        pricePerUnit: parseFloat(e.target.value) || 0,
                      })
                    }
                    className='w-full bg-stone-100 border border-stone-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                  />
                </div>
              </div>

              <div className='bg-amber-50 p-6 rounded-lg border border-amber-100'>
                <h4 className='font-medium text-amber-800 mb-4'>
                  Break-Even Results
                </h4>

                <div className='space-y-4'>
                  <div>
                    <div className='text-sm text-amber-700'>
                      Contribution Margin
                    </div>
                    <div className='text-xl font-bold text-amber-900'>
                      {formatCurrency(contributionMargin)}
                    </div>
                    <div className='text-xs text-amber-600'>
                      Amount each unit contributes to fixed costs & profit
                    </div>
                  </div>

                  <div>
                    <div className='text-sm text-amber-700'>
                      Contribution Margin Ratio
                    </div>
                    <div className='text-xl font-bold text-amber-900'>
                      {formatPercentage(contributionMarginRatio)}
                    </div>
                    <div className='text-xs text-amber-600'>
                      Percent of each sale that contributes to fixed costs &
                      profit
                    </div>
                  </div>

                  <div className='pt-4 border-t border-amber-200'>
                    <div className='text-sm text-amber-700'>
                      Break-Even Point
                    </div>
                    <div className='text-2xl font-bold text-amber-900'>
                      {breakEvenPoint < 0
                        ? 'N/A - Price below cost'
                        : `${Math.ceil(breakEvenPoint)} units`}
                    </div>
                    <div className='text-xs text-amber-600'>
                      Units needed to cover all fixed costs
                    </div>
                  </div>

                  {breakEvenPoint > 0 && (
                    <div>
                      <div className='text-sm text-amber-700'>
                        Break-Even Revenue
                      </div>
                      <div className='text-xl font-bold text-amber-900'>
                        {formatCurrency(
                          Math.ceil(breakEvenPoint) *
                            breakEvenInputs.pricePerUnit
                        )}
                      </div>
                      <div className='text-xs text-amber-600'>
                        Total revenue at break-even point
                      </div>
                    </div>
                  )}
                </div>

                {breakEvenPoint < 0 && (
                  <div className='mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm'>
                    Your variable cost per unit exceeds your selling price. You
                    won't be able to break even at current prices.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Price Elasticity Analysis - No API call needed for this calculation */}
        {analysisType === 'elasticity' && (
          <div>
            <h3 className='text-lg font-medium mb-4 flex items-center'>
              <TrendingUp className='h-5 w-5 mr-2 text-amber-600' />
              Price Elasticity Analysis
            </h3>
            <p className='text-stone-600 mb-4'>
              Estimate how changing your prices may affect sales volume and
              overall revenue.
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Current Price ($)
                  </label>
                  <input
                    type='number'
                    value={elasticityInputs.currentPrice}
                    onChange={(e) =>
                      setElasticityInputs({
                        ...elasticityInputs,
                        currentPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className='w-full bg-stone-100 border border-stone-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    New Price ($)
                  </label>
                  <input
                    type='number'
                    value={elasticityInputs.newPrice}
                    onChange={(e) =>
                      setElasticityInputs({
                        ...elasticityInputs,
                        newPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className='w-full bg-stone-100 border border-stone-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Current Monthly Sales Volume (units)
                  </label>
                  <input
                    type='number'
                    value={elasticityInputs.currentVolume}
                    onChange={(e) =>
                      setElasticityInputs({
                        ...elasticityInputs,
                        currentVolume: parseFloat(e.target.value) || 0,
                      })
                    }
                    className='w-full bg-stone-100 border border-stone-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Price Elasticity Coefficient
                  </label>
                  <input
                    type='number'
                    value={elasticityInputs.elasticity}
                    step='0.1'
                    min='-5'
                    max='0'
                    onChange={(e) =>
                      setElasticityInputs({
                        ...elasticityInputs,
                        elasticity: parseFloat(e.target.value) || 0,
                      })
                    }
                    className='w-full bg-stone-100 border border-stone-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                  />
                  <p className='text-xs text-stone-500 mt-1'>
                    Negative value between -5 and 0. Lower values mean demand is
                    more sensitive to price. Luxury goods are typically around
                    -2.5 to -3, necessities around -0.5 to -1.
                  </p>
                </div>
              </div>

              <div>
                <div className='bg-blue-50 p-6 rounded-lg border border-blue-100 mb-4'>
                  <h4 className='font-medium text-blue-800 mb-4'>
                    Price Change Impact
                  </h4>

                  <div className='space-y-4'>
                    <div className='grid grid-cols-2 gap-2'>
                      <div>
                        <div className='text-sm text-blue-700'>
                          Price Change
                        </div>
                        <div className='text-xl font-bold text-blue-900'>
                          {priceChangePercent >= 0 ? '+' : ''}
                          {(priceChangePercent * 100).toFixed(1)}%
                        </div>
                      </div>

                      <div>
                        <div className='text-sm text-blue-700'>
                          Volume Change
                        </div>
                        <div className='text-xl font-bold text-blue-900'>
                          {volumeChangePercent >= 0 ? '+' : ''}
                          {(volumeChangePercent * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-2 pt-3 border-t border-blue-200'>
                      <div>
                        <div className='text-sm text-blue-700'>
                          Current Revenue
                        </div>
                        <div className='text-xl font-bold text-blue-900'>
                          {formatCurrency(currentRevenue)}
                        </div>
                      </div>

                      <div>
                        <div className='text-sm text-blue-700'>
                          Projected Revenue
                        </div>
                        <div className='text-xl font-bold text-blue-900'>
                          {formatCurrency(newRevenue)}
                        </div>
                      </div>
                    </div>

                    <div className='pt-3 border-t border-blue-200'>
                      <div className='text-sm text-blue-700'>
                        Revenue Impact
                      </div>
                      <div
                        className={`text-2xl font-bold ${
                          revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {revenueChange >= 0 ? '+' : ''}
                        {formatCurrency(revenueChange)}
                        <span className='text-sm ml-1'>
                          ({revenueChangePercent >= 0 ? '+' : ''}
                          {revenueChangePercent.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='bg-stone-50 p-4 rounded-md border border-stone-200'>
                  <h4 className='font-medium text-stone-800 mb-2'>
                    About Price Elasticity
                  </h4>
                  <p className='text-sm text-stone-600'>
                    Price elasticity measures how sensitive customer demand is
                    to price changes. An elasticity of -1.0 means a 1% price
                    increase results in a 1% decrease in sales volume. Use this
                    tool to predict how price changes may affect your revenue.
                  </p>
                  <div className='mt-3 text-sm text-amber-600 font-medium'>
                    {revenueChange >= 0
                      ? 'The projected price change is likely to increase total revenue.'
                      : 'The projected price change may decrease revenue. Consider a smaller adjustment.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarginAnalysis;