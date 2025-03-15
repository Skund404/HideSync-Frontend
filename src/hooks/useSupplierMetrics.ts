import { usePurchaseOrders } from '@/context/PurchaseContext';
import { useSuppliers } from '@/context/SupplierContext';
import { SupplierStatus } from '@/types/enums';
import { PurchaseOrder } from '@/types/purchaseTypes';
import { Supplier } from '@/types/supplierTypes';
import { useMemo } from 'react';

export const useSupplierMetrics = () => {
  const { suppliers } = useSuppliers();
  const { purchaseOrders } = usePurchaseOrders();

  const metrics = useMemo(() => {
    // Get active suppliers
    const activeSuppliers = suppliers.filter(
      (s: Supplier) => s.status === SupplierStatus.ACTIVE
    );

    // Get new suppliers (added in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newSuppliers = suppliers.filter((s: Supplier) => {
      if (!s.createdAt) return false;
      const createdDate = new Date(s.createdAt);
      return createdDate >= thirtyDaysAgo;
    });

    // Calculate utilization rate (active/total)
    const utilizationRate =
      suppliers.length > 0
        ? Math.round((activeSuppliers.length / suppliers.length) * 100)
        : 0;

    // Calculate purchase distribution by supplier
    const purchasesBySupplier = suppliers.map((supplier: Supplier) => {
      const supplierPurchaseOrders = purchaseOrders.filter(
        (p: PurchaseOrder) => p.supplierId === supplier.id
      );
      const totalAmount = supplierPurchaseOrders.reduce(
        (sum: number, p: PurchaseOrder) => sum + p.total,
        0
      );

      return {
        id: supplier.id,
        name: supplier.name,
        purchaseCount: supplierPurchaseOrders.length,
        totalAmount,
        averageAmount:
          supplierPurchaseOrders.length > 0
            ? totalAmount / supplierPurchaseOrders.length
            : 0,
      };
    });

    // Get top suppliers by purchase amount
    const topSuppliersByAmount = [...purchasesBySupplier]
      .sort((a: any, b: any) => b.totalAmount - a.totalAmount)
      .slice(0, 5);

    // Get suppliers with no recent purchases (in last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const suppliersWithNoRecentPurchases = suppliers.filter(
      (supplier: Supplier) => {
        const latestPurchase = purchaseOrders
          .filter((p: PurchaseOrder) => p.supplierId === supplier.id)
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0];

        if (!latestPurchase) return true;

        return new Date(latestPurchase.date) < ninetyDaysAgo;
      }
    );

    return {
      totalSuppliers: suppliers.length,
      activeSuppliers: activeSuppliers.length,
      inactiveSuppliers: suppliers.length - activeSuppliers.length,
      newSuppliers: newSuppliers.length,
      utilizationRate,
      topSuppliersByAmount,
      suppliersWithNoRecentPurchases: suppliersWithNoRecentPurchases.length,
      purchasesBySupplier,
    };
  }, [suppliers, purchaseOrders]);

  return metrics;
};
