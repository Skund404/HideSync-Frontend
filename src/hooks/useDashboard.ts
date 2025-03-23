// src/hooks/useDashboard.ts
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DashboardSummary } from '../types/models';
import { 
  getDashboardSummary, 
  getRecentActivity, 
  getMaterialStockSummary, 
  getUpcomingDeadlines,
  getConsolidatedDashboard
} from '../services/dashboard-service';
import { handleApiError } from '../utils/errorHandler';

/**
 * Custom hook for fetching and managing dashboard data
 * @returns Object containing dashboard data, loading state, and error information
 */
export function useDashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch dashboard data from the API
   * Use either consolidated endpoint or multiple specific endpoints based on configuration
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we should use multiple endpoints or a single consolidated endpoint
      const useDetailedEndpoints = process.env.REACT_APP_USE_DETAILED_DASHBOARD === 'true';
      
      if (useDetailedEndpoints) {
        // Use multiple specific endpoints
        const [summaryData, activities, stockData, deadlines] = await Promise.all([
          getDashboardSummary(),
          getRecentActivity(5),
          getMaterialStockSummary(),
          getUpcomingDeadlines(7)
        ]);
        
        // Combine data into a single dashboard summary
        setData({
          ...summaryData,
          recentActivity: activities,
          materialStockSummary: stockData,
          upcomingDeadlines: deadlines
        });
      } else {
        // Use consolidated endpoint (backward compatible)
        try {
          // Try the new consolidated endpoint
          const dashboardData = await getConsolidatedDashboard();
          setData(dashboardData);
        } catch (consolidatedError) {
          // Fall back to original approach if new endpoint fails
          const summary = await api.get<DashboardSummary>('dashboard');
          setData(summary);
        }
      }
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj);
      console.error('Error fetching dashboard data:', handleApiError(err));
      
      // Fallback mock data for development/testing
      setData({
        activeProjects: 12,
        pendingOrders: 8,
        materialsToReorder: 5,
        upcomingDeadlines: [],
        recentActivity: [],
        materialStockSummary: [
          { name: 'Vegetable Tan Leather', percentage: 62, status: 'medium' },
          { name: 'Brass Hardware', percentage: 89, status: 'good' },
          { name: 'Waxed Thread', percentage: 18, status: 'low' },
          { name: 'Dye (Brown)', percentage: 12, status: 'low' },
          { name: 'Snaps and Rivets', percentage: 35, status: 'medium' },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
    
    // Set up refresh interval (default: 5 minutes)
    const refreshInterval = parseInt(process.env.REACT_APP_DASHBOARD_REFRESH_INTERVAL || '300000', 10);
    const intervalId = setInterval(fetchDashboardData, refreshInterval);
    
    // Clean up interval when component unmounts
    return () => clearInterval(intervalId);
  }, []);

  // Format safe data for easy access
  const safeData = data
    ? {
        activeProjects: data.activeProjects || 0,
        pendingOrders: data.pendingOrders || 0,
        materialsToReorder: data.materialsToReorder || 0,
        upcomingDeadlines: data.upcomingDeadlines || [],
        recentActivity: data.recentActivity || [],
        materialStockSummary: data.materialStockSummary || [],
      }
    : null;

  return {
    data: safeData,
    loading,
    error,
    refresh: fetchDashboardData // Expose refresh function to allow manual refreshes
  };
}