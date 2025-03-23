// src/components/financial/optimization/CostOptimizationInsights.tsx
import {
  AlertCircle,
  DollarSign,
  Filter,
  Sparkles,
  TrendingDown,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useFinancial } from '../../../context/FinancialContext';
import { CostOptimizationInsight } from '../../../types/financialTypes';
import { formatCurrency } from '../../../utils/financialHelpers';
import ErrorMessage from '../../common/ErrorMessage';
import LoadingSpinner from '../../common/LoadingSpinner';

const CostOptimizationInsights: React.FC = () => {
  const { costInsights, loading, loadingState, error, refreshData } =
    useFinancial();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Move all useMemo hooks before any conditional returns to fix React Hook rules violations

  // Calculate total savings
  const totalSavings = useMemo(() => {
    return costInsights.reduce((total, insight) => {
      // Extract dollar amount from the savings string
      const savingsMatch = insight.savings.match(/\$(\d+)/);
      if (savingsMatch && savingsMatch[1]) {
        return total + parseInt(savingsMatch[1], 10);
      }
      return total;
    }, 0);
  }, [costInsights]);

  // Generate categories
  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      costInsights.map((insight) => {
        // Extract category from material name (e.g., "Vegetable Tanned Leather" -> "Leather")
        const category = insight.material.split(' ').pop()?.toLowerCase() || '';
        return category;
      })
    );
    return ['all', ...Array.from(uniqueCategories)];
  }, [costInsights]);

  // Filter insights
  const filteredInsights = useMemo(() => {
    return categoryFilter === 'all'
      ? costInsights
      : costInsights.filter((insight) => {
          const insightCategory =
            insight.material.split(' ').pop()?.toLowerCase() || '';
          return insightCategory === categoryFilter;
        });
  }, [costInsights, categoryFilter]);

  // Show loading spinner when loading cost insights
  if (loading || loadingState.costInsights) {
    return (
      <div className='flex items-center justify-center h-64'>
        <LoadingSpinner
          size='medium'
          color='amber'
          message='Loading cost optimization insights...'
        />
      </div>
    );
  }

  // Handle error state with retry option
  if (error) {
    return (
      <div className='flex items-center justify-center h-64'>
        <ErrorMessage
          message='Unable to load cost optimization insights. Please try again.'
          onRetry={refreshData}
        />
      </div>
    );
  }

  // Handle empty state
  if (!costInsights.length) {
    return (
      <div className='p-6 bg-white rounded-lg border border-stone-200 text-center'>
        <div className='w-16 h-16 mx-auto bg-stone-100 rounded-full flex items-center justify-center mb-3'>
          <Sparkles className='h-8 w-8 text-stone-400' />
        </div>
        <h3 className='text-lg font-medium text-stone-700 mb-2'>
          No optimization insights available
        </h3>
        <p className='text-stone-500 max-w-md mx-auto'>
          As you continue to use HideSync, we'll analyze your financial data and
          provide cost optimization suggestions here.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Summary Banner */}
      <div className='bg-green-50 p-4 rounded-lg border border-green-100'>
        <div className='flex items-center'>
          <div className='bg-green-100 p-2 rounded-full mr-4'>
            <TrendingDown className='h-6 w-6 text-green-700' />
          </div>
          <div>
            <h4 className='font-medium text-green-800 text-lg'>
              Potential Monthly Savings: {formatCurrency(totalSavings)}
            </h4>
            <p className='text-green-700 text-sm mt-1'>
              Implementing these suggestions could reduce your costs by
              approximately {formatCurrency(totalSavings)} per month or{' '}
              {formatCurrency(totalSavings * 12)} annually.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className='flex items-center space-x-2'>
        <Filter className='h-4 w-4 text-stone-500' />
        <span className='text-sm text-stone-600'>Filter by category:</span>
        <div className='flex flex-wrap gap-2'>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`px-3 py-1 text-xs rounded-full ${
                categoryFilter === category
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Insights List */}
      <div className='space-y-4'>
        {filteredInsights.length === 0 ? (
          <p className='text-stone-500 text-center py-4'>
            No insights available for this category.
          </p>
        ) : (
          filteredInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))
        )}
      </div>

      {/* Additional Tips */}
      <div className='bg-amber-50 p-5 rounded-lg border border-amber-100 mt-6'>
        <h4 className='font-medium text-amber-800 mb-3 flex items-center'>
          <Sparkles className='h-5 w-5 mr-2' />
          Additional Cost-Saving Opportunities
        </h4>
        <ul className='space-y-2 text-stone-700'>
          <li className='flex items-start'>
            <span className='h-5 w-5 text-amber-700 mr-2'>•</span>
            <span>
              Review supplier pricing annually and negotiate bulk discounts
            </span>
          </li>
          <li className='flex items-start'>
            <span className='h-5 w-5 text-amber-700 mr-2'>•</span>
            <span>Optimize cutting patterns to reduce material waste</span>
          </li>
          <li className='flex items-start'>
            <span className='h-5 w-5 text-amber-700 mr-2'>•</span>
            <span>Standardize hardware across product lines when possible</span>
          </li>
          <li className='flex items-start'>
            <span className='h-5 w-5 text-amber-700 mr-2'>•</span>
            <span>Track time accurately to identify inefficient processes</span>
          </li>
          <li className='flex items-start'>
            <span className='h-5 w-5 text-amber-700 mr-2'>•</span>
            <span>Consider using templates to increase production speed</span>
          </li>
          <li className='flex items-start'>
            <span className='h-5 w-5 text-amber-700 mr-2'>•</span>
            <span>
              Analyze material cost trends to time purchases optimally
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

interface InsightCardProps {
  insight: CostOptimizationInsight;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const [expanded, setExpanded] = useState(false);

  // Extract savings amount for highlighting
  const savingsMatch = insight.savings.match(/\$(\d+)/);
  const savingsAmount = savingsMatch ? parseInt(savingsMatch[1], 10) : 0;

  // Determine priority level based on savings amount
  const getPriorityLevel = (amount: number) => {
    if (amount > 150) return { label: 'High Priority', color: 'text-red-600' };
    if (amount > 75)
      return { label: 'Medium Priority', color: 'text-amber-600' };
    return { label: 'Low Priority', color: 'text-green-600' };
  };

  const priority = getPriorityLevel(savingsAmount);

  return (
    <div className='border border-stone-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow transition-shadow'>
      <div
        className='p-4 border-b border-stone-100 cursor-pointer'
        onClick={() => setExpanded(!expanded)}
      >
        <div className='flex items-start'>
          <div className='bg-amber-100 p-2 rounded-full mr-3 mt-1'>
            <AlertCircle className='h-5 w-5 text-amber-700' />
          </div>
          <div className='flex-1'>
            <div className='flex items-center justify-between'>
              <h4 className='text-lg font-medium text-stone-800'>
                {insight.material}
              </h4>
              <span className={`text-sm font-medium ${priority.color}`}>
                {priority.label}
              </span>
            </div>
            <p className='text-stone-600 mt-1'>{insight.issue}</p>
            <p className='text-red-600 font-medium mt-1'>
              Impact: {insight.impact}
            </p>
          </div>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          expanded ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className='p-4 bg-green-50'>
          <h5 className='font-medium text-green-800 mb-2 flex items-center'>
            <Sparkles className='h-4 w-4 mr-2' />
            Recommendation
          </h5>
          <p className='text-stone-700'>{insight.suggestion}</p>
          <div className='flex items-center mt-3 bg-white p-2 rounded border border-green-100'>
            <DollarSign className='h-5 w-5 text-green-600 mr-2' />
            <p className='text-green-600 font-medium'>
              Potential savings: {insight.savings}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostOptimizationInsights;
