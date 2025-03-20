import {
  AlertCircle,
  DollarSign,
  Download,
  Package,
  Percent,
  RefreshCw,
} from 'lucide-react';
import React, { useState } from 'react';
import MarginAnalysis from '../components/financial/analysis/MarginAnalysis'; // Correct import
import MaterialCostChart from '../components/financial/charts/MaterialCostChart';
import ProductTypeChart from '../components/financial/charts/ProductTypeChart';
import RevenueChart from '../components/financial/charts/RevenueChart';
import DataExportModal from '../components/financial/export/DataExportModal';
import FinancialSummaryCard from '../components/financial/FinancialSummaryCard';
import CostOptimizationInsights from '../components/financial/optimization/CostOptimizationInsights';
import PlatformPerformance from '../components/financial/platforms/PlatformPerformance';
import PricingCalculator from '../components/financial/pricing/PricingCalculator';
import FinancialReports from '../components/financial/reports/FinancialReports';
import ProjectFinancialsTable from '../components/financial/tables/ProjectFinancialsTable';
import TimeframeSelector from '../components/financial/TimeframeSelector';
import PricingReferenceSheet from '../components/financial/workshop/PricingReferenceSheet';
import { useFinancial } from '../context/FinancialContext';
import { TimeFrame } from '../types/financialTypes';

const FinancialDashboard: React.FC = () => {
  const { summary, loading, error, filters, setFilters, refreshData } =
    useFinancial();

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'platforms'
    | 'pricing'
    | 'optimization'
    | 'workshop'
    | 'reports'
    | 'analysis'
  >('overview');

  const [showExportModal, setShowExportModal] = useState(false);

  const handleTimeframeChange = (timeframe: TimeFrame) => {
    setFilters({ timeFrame: timeframe });
  };

  const handleRefresh = async () => {
    await refreshData();
  };

  if (loading && !summary) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600'></div>
          <p className='mt-2 text-stone-600'>Loading financial data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md'>
          <p className='font-medium'>Error loading financial data</p>
          <p className='text-sm mt-1'>{error}</p>
          <button
            onClick={handleRefresh}
            className='mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex-1 flex flex-col overflow-hidden'>
      <header className='bg-white shadow-sm z-10 p-4 flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <h1 className='text-xl font-semibold text-stone-900'>
            Financial Analytics
          </h1>
          <div className='text-sm hidden md:block'>
            <span className='text-stone-500'>
              Business Performance & Pricing
            </span>
          </div>
        </div>

        <div className='flex items-center space-x-4'>
          <TimeframeSelector
            value={filters.timeFrame}
            onChange={handleTimeframeChange}
          />

          <button
            onClick={() => setShowExportModal(true)}
            className='bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-md text-sm font-medium flex items-center'
          >
            <Download className='h-4 w-4 mr-2' />
            Export Data
          </button>

          <button
            onClick={handleRefresh}
            className='bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center'
          >
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh Data
          </button>
        </div>
      </header>

      <main className='flex-1 overflow-y-auto bg-stone-50 p-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
          {summary && (
            <>
              <FinancialSummaryCard
                title='Monthly Revenue'
                value={summary.monthlyRevenue}
                icon={<DollarSign className='h-6 w-6' />}
                trend={{
                  value: summary.revenueGrowth,
                  isPositive: summary.revenueGrowth > 0,
                }}
                isCurrency={true}
                color='green'
              />

              <FinancialSummaryCard
                title='Average Profit Margin'
                value={summary.averageMargin}
                icon={<Percent className='h-6 w-6' />}
                trend={{
                  value: summary.marginGrowth,
                  isPositive: summary.marginGrowth > 0,
                }}
                isPercentage={true}
                color='amber'
              />

              <FinancialSummaryCard
                title='Material Costs'
                value={summary.materialCosts}
                icon={<Package className='h-6 w-6' />}
                trend={{
                  value: summary.costGrowth,
                  isPositive: false,
                }}
                isCurrency={true}
                color='blue'
              />

              <FinancialSummaryCard
                title='Cost Optimization'
                value={summary.potentialSavings}
                icon={<AlertCircle className='h-6 w-6' />}
                isCurrency={true}
                trendLabel='Potential monthly savings'
                color='purple'
              />
            </>
          )}
        </div>

        <div className='mb-6'>
          <div className='border-b border-gray-200'>
            <nav className='-mb-px flex space-x-8'>
              <button
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'platforms'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('platforms')}
              >
                Platform Analytics
              </button>
              <button
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pricing'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('pricing')}
              >
                Pricing Calculator
              </button>
              <button
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analysis'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('analysis')}
              >
                Margin Analysis
              </button>
              <button
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'optimization'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('optimization')}
              >
                Cost Optimization
              </button>
              <button
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reports'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('reports')}
              >
                Reports
              </button>
              <button
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'workshop'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('workshop')}
              >
                Workshop
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
            <div className='lg:col-span-2 space-y-6'>
              <div className='bg-white rounded-lg shadow-sm border border-stone-200 p-6'>
                <div className='flex justify-between items-center mb-6'>
                  <h3 className='font-medium text-stone-800'>
                    Revenue & Profitability Trends
                  </h3>
                </div>
                <div className='h-80'>
                  <RevenueChart />
                </div>
              </div>

              <div className='bg-white rounded-lg shadow-sm border border-stone-200 p-6'>
                <div className='flex justify-between items-center mb-6'>
                  <h3 className='font-medium text-stone-800'>
                    Material Cost Breakdown
                  </h3>
                </div>
                <div className='h-72'>
                  <MaterialCostChart />
                </div>
              </div>

              <div className='bg-white rounded-lg shadow-sm border border-stone-200 p-6'>
                <div className='flex justify-between items-center mb-4'>
                  <h3 className='font-medium text-stone-800'>
                    Recent Project Performance
                  </h3>
                </div>
                <ProjectFinancialsTable />
              </div>
            </div>

            <div className='space-y-6'>
              <div className='bg-white rounded-lg shadow-sm border border-stone-200 p-6'>
                <h3 className='font-medium text-stone-800 mb-4'>
                  Product Type Analysis
                </h3>
                <div className='h-80'>
                  <ProductTypeChart />
                </div>
              </div>

              <div className='bg-white rounded-lg shadow-sm border border-stone-200 p-6'>
                <h3 className='font-medium text-stone-800 mb-2'>
                  Platform Performance
                </h3>
                <p className='text-stone-500 text-sm mb-4'>
                  Compare performance across your sales channels.
                </p>
                <button
                  onClick={() => setActiveTab('platforms')}
                  className='w-full py-2 bg-amber-100 text-amber-700 rounded-md text-sm font-medium hover:bg-amber-200 transition-colors'
                >
                  View Platform Analytics
                </button>
              </div>

              <div className='bg-white rounded-lg shadow-sm border border-stone-200 p-6'>
                <h3 className='font-medium text-stone-800 mb-2'>
                  Cost Optimization
                </h3>
                <p className='text-stone-500 text-sm mb-4'>
                  Identify opportunities to reduce costs and improve margins.
                </p>
                <button
                  onClick={() => setActiveTab('optimization')}
                  className='w-full py-2 bg-amber-100 text-amber-700 rounded-md text-sm font-medium hover:bg-amber-200 transition-colors'
                >
                  View Optimization Insights
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'platforms' && <PlatformPerformance />}

        {activeTab === 'pricing' && (
          <div className='bg-white rounded-lg shadow-sm border border-stone-200 p-6'>
            <h3 className='text-lg font-medium mb-4'>Pricing Calculator</h3>
            <PricingCalculator />
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-3'>
              <MarginAnalysis />
            </div>
          </div>
        )}

        {activeTab === 'optimization' && (
          <div className='bg-white rounded-lg shadow-sm border border-stone-200 p-6'>
            <h3 className='text-lg font-medium mb-4'>
              Cost Optimization Insights
            </h3>
            <CostOptimizationInsights />
          </div>
        )}

        {activeTab === 'workshop' && (
          <div className='bg-white rounded-lg shadow-sm border border-stone-200 p-6'>
            <h3 className='text-lg font-medium mb-4'>
              Workshop Reference Sheets
            </h3>
            <PricingReferenceSheet />
          </div>
        )}

        {activeTab === 'reports' && (
          <div className='bg-white rounded-lg shadow-sm border border-stone-200 p-6'>
            <h3 className='text-lg font-medium mb-4'>Financial Reports</h3>
            <FinancialReports />
          </div>
        )}
      </main>

      {showExportModal && (
        <DataExportModal onClose={() => setShowExportModal(false)} />
      )}
    </div>
  );
};

export default FinancialDashboard;
