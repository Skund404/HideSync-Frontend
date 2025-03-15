// src/hooks/useDashboard.ts
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DashboardSummary } from '../types/models';

export function useDashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const summary = await api.get<DashboardSummary>('dashboard');
        setData(summary);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching dashboard data:', err);

        // Fallback mock data
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

    fetchData();
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
  };
}
