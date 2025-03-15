// src/hooks/usePurchaseMetrics.ts
import { usePurchaseOrders } from '@/context/PurchaseContext';
import { PurchaseStatus } from '@/types/enums';
import { useMemo } from 'react';

export const usePurchaseMetrics = () => {
  const { purchaseOrders } = usePurchaseOrders();

  const metrics = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Filter for this month's purchases
    const thisMonthPurchases = purchaseOrders.filter((purchase) => {
      const purchaseDate = new Date(purchase.date);
      return (
        purchaseDate.getMonth() === currentMonth &&
        purchaseDate.getFullYear() === currentYear
      );
    });

    // Filter for last month's purchases
    const lastMonthPurchases = purchaseOrders.filter((purchase) => {
      const purchaseDate = new Date(purchase.date);
      return (
        purchaseDate.getMonth() === lastMonth &&
        purchaseDate.getFullYear() === lastMonthYear
      );
    });

    // Calculate total spend this month
    const totalSpendThisMonth = thisMonthPurchases.reduce(
      (total, purchase) => total + purchase.total,
      0
    );

    // Calculate total spend last month
    const totalSpendLastMonth = lastMonthPurchases.reduce(
      (total, purchase) => total + purchase.total,
      0
    );

    // Calculate spending trend percentage
    let spendingTrend = 0;
    if (totalSpendLastMonth > 0) {
      spendingTrend =
        ((totalSpendThisMonth - totalSpendLastMonth) / totalSpendLastMonth) *
        100;
    }

    // Count purchases by status
    const pending = purchaseOrders.filter(
      (po) =>
        po.status === PurchaseStatus.PENDING_APPROVAL ||
        po.status === PurchaseStatus.APPROVED
    ).length;

    const inProgress = purchaseOrders.filter(
      (po) =>
        po.status === PurchaseStatus.PROCESSING ||
        po.status === PurchaseStatus.SHIPPED ||
        po.status === PurchaseStatus.IN_TRANSIT
    ).length;

    const completed = purchaseOrders.filter(
      (po) =>
        po.status === PurchaseStatus.DELIVERED ||
        po.status === PurchaseStatus.COMPLETE
    ).length;

    // Get upcoming deliveries (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingDeliveries = purchaseOrders.filter((po) => {
      const deliveryDate = new Date(po.deliveryDate);
      return deliveryDate > currentDate && deliveryDate <= nextWeek;
    });

    // Get top suppliers by purchase amount
    const supplierSpend = purchaseOrders.reduce((acc, purchase) => {
      acc[purchase.supplier] = (acc[purchase.supplier] || 0) + purchase.total;
      return acc;
    }, {} as Record<string, number>);

    const topSuppliers = Object.entries(supplierSpend)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([supplier, total]) => ({ supplier, total }));

    return {
      totalOrders: purchaseOrders.length,
      totalSpendThisMonth,
      totalSpendLastMonth,
      spendingTrend,
      pending,
      inProgress,
      completed,
      upcomingDeliveries,
      topSuppliers,
      recentPurchases: [...purchaseOrders]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    };
  }, [purchaseOrders]);

  return metrics;
};

export default usePurchaseMetrics;
