// src/context/SalesContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { updateOrderFulfillment } from '../services/integrations/platformIntegration';
import * as salesService from '../services/sales-service';
import { PickingListStatus } from '../types/pickingListTypes';
import {
  PickingListSummary,
  Sale,
  SalesChannel,
  SalesFilters,
} from '../types/salesTypes';

interface SalesContextType {
  sales: Sale[];
  completedSales: Sale[];
  loading: boolean;
  error: string | null;
  getSale: (id: number) => Sale | undefined;
  filterSalesList: (filters: SalesFilters, includeCompleted: boolean) => Sale[];
  createSale: (sale: Omit<Sale, 'id'>) => Promise<Sale>;
  updateSale: (id: number, updates: Partial<Sale>) => Promise<Sale>;
  syncOrders: (fromDate?: Date) => Promise<number>;
  updateFulfillment: (
    saleId: number,
    trackingNumber: string,
    shippingProvider: string
  ) => Promise<Sale>;
  createPickingList: (saleId: number) => Promise<number>;
  getChannelMetrics: () => Record<
    SalesChannel,
    { count: number; revenue: number; fees: number }
  >;

  // Methods for Material and Inventory Integration
  getMaterialRequirements: (saleId: number) => Promise<any[]>;
  reserveMaterials: (saleId: number) => Promise<boolean>;
  updateInventoryOnFulfillment: (saleId: number) => Promise<boolean>;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [completedSales, setCompletedSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channelMetricsCache, setChannelMetricsCache] = useState<Record<
    SalesChannel,
    { count: number; revenue: number; fees: number }
  > | null>(null);

  useEffect(() => {
    // Fetch data from API
    const fetchSales = async () => {
      try {
        setLoading(true);

        // Fetch both active and completed sales in parallel
        const [activeSales, completed] = await Promise.all([
          salesService.getAllSales(),
          salesService.getCompletedSales(),
        ]);

        setSales(activeSales);
        setCompletedSales(completed);
        setError(null);
      } catch (err) {
        console.error('Error fetching sales:', err);
        setError('Failed to load sales data');
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  // Get a single sale by ID
  const getSale = (id: number): Sale | undefined => {
    return (
      sales.find((sale) => sale.id === id) ||
      completedSales.find((sale) => sale.id === id)
    );
  };

  // Filter sales based on criteria
  const filterSalesList = (
    filters: SalesFilters,
    includeCompleted: boolean = false
  ): Sale[] => {
    let filteredSales = [...sales];

    if (includeCompleted) {
      filteredSales = [...filteredSales, ...completedSales];
    }

    // Apply filters
    if (filters.status) {
      filteredSales = filteredSales.filter(
        (sale) => sale.status === filters.status
      );
    }

    if (filters.fulfillmentStatus) {
      filteredSales = filteredSales.filter(
        (sale) => sale.fulfillmentStatus === filters.fulfillmentStatus
      );
    }

    if (filters.paymentStatus) {
      filteredSales = filteredSales.filter(
        (sale) => sale.paymentStatus === filters.paymentStatus
      );
    }

    if (filters.customerId) {
      filteredSales = filteredSales.filter(
        (sale) => sale.customer.id === filters.customerId
      );
    }

    if (filters.channel) {
      filteredSales = filteredSales.filter(
        (sale) => sale.channel === filters.channel
      );
    }

    if (filters.dateFrom && filters.dateTo) {
      const fromDate =
        typeof filters.dateFrom === 'string'
          ? new Date(filters.dateFrom)
          : filters.dateFrom;

      const toDate =
        typeof filters.dateTo === 'string'
          ? new Date(filters.dateTo)
          : filters.dateTo;

      filteredSales = filteredSales.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= fromDate && saleDate <= toDate;
      });
    } else if (filters.dateFrom) {
      const fromDate =
        typeof filters.dateFrom === 'string'
          ? new Date(filters.dateFrom)
          : filters.dateFrom;

      filteredSales = filteredSales.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= fromDate;
      });
    } else if (filters.dateTo) {
      const toDate =
        typeof filters.dateTo === 'string'
          ? new Date(filters.dateTo)
          : filters.dateTo;

      filteredSales = filteredSales.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate <= toDate;
      });
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredSales = filteredSales.filter(
        (sale) =>
          sale.customer.name.toLowerCase().includes(query) ||
          sale.customer.email.toLowerCase().includes(query) ||
          sale.id.toString().includes(query) ||
          (sale.marketplaceData?.externalOrderId &&
            sale.marketplaceData.externalOrderId
              .toLowerCase()
              .includes(query)) ||
          sale.items.some((item) => item.name.toLowerCase().includes(query))
      );
    }

    return filteredSales;
  };

  // Create a new sale
  const createSale = async (sale: Omit<Sale, 'id'>): Promise<Sale> => {
    try {
      const newSale = await salesService.createSale(sale);

      // Add to sales list to keep state in sync
      setSales((prevSales) => [...prevSales, newSale]);

      return newSale;
    } catch (err) {
      setError('Failed to create sale');
      throw err;
    }
  };

  // Update an existing sale
  const updateSale = async (
    id: number,
    updates: Partial<Sale>
  ): Promise<Sale> => {
    try {
      const updatedSale = await salesService.updateSale(id, updates);

      // Update local state
      const isCompletedSale = completedSales.some((s) => s.id === id);

      if (isCompletedSale) {
        setCompletedSales((prevSales) =>
          prevSales.map((s) => (s.id === id ? updatedSale : s))
        );
      } else {
        setSales((prevSales) =>
          prevSales.map((s) => (s.id === id ? updatedSale : s))
        );

        // If the sale was just completed, move it to completedSales
        if (updatedSale.status === 'completed') {
          setSales((prevSales) => prevSales.filter((s) => s.id !== id));
          setCompletedSales((prevSales) => [...prevSales, updatedSale]);
        }
      }

      return updatedSale;
    } catch (err) {
      setError('Failed to update sale');
      throw err;
    }
  };

  // Sync orders from integrated platforms
  const syncOrders = async (fromDate?: Date): Promise<number> => {
    try {
      const newOrdersCount = await salesService.syncOrders(fromDate);

      // Refresh sales list after syncing
      const activeSales = await salesService.getAllSales();
      setSales(activeSales);

      // Invalidate metrics cache
      setChannelMetricsCache(null);

      return newOrdersCount;
    } catch (err) {
      setError('Failed to sync orders');
      throw err;
    }
  };

  // Update fulfillment status and shipping details
  const updateFulfillment = async (
    saleId: number,
    trackingNumber: string,
    shippingProvider: string
  ): Promise<Sale> => {
    try {
      const sale = getSale(saleId);

      if (!sale) {
        throw new Error('Sale not found');
      }

      // Update the sale with shipping information
      const updatedSale = await salesService.updateFulfillment(
        saleId,
        trackingNumber,
        shippingProvider
      );

      // If it's a marketplace order, update the external system
      if (sale.marketplaceData) {
        await updateOrderFulfillment(sale, trackingNumber, shippingProvider);
      }

      // Update local state
      setSales((prevSales) =>
        prevSales.map((s) => (s.id === saleId ? updatedSale : s))
      );

      return updatedSale;
    } catch (err) {
      setError('Failed to update fulfillment');
      throw err;
    }
  };

  // Create a picking list for a sale
  const createPickingList = async (saleId: number): Promise<number> => {
    try {
      const pickingListId = await salesService.createPickingList(saleId);

      // Update the sale with picking list reference
      const sale = getSale(saleId);
      if (sale) {
        await updateSale(saleId, {
          pickingList: {
            id: pickingListId,
            status: PickingListStatus.PENDING,
            createdAt: new Date().toISOString(),
          } as unknown as PickingListSummary,
        });
      }

      return pickingListId;
    } catch (err) {
      setError('Failed to create picking list');
      throw err;
    }
  };

  // Get sales metrics by channel
  const getChannelMetrics = (): Record<
    SalesChannel,
    { count: number; revenue: number; fees: number }
  > => {
    // If we have cached metrics, return them
    if (channelMetricsCache) {
      return channelMetricsCache;
    }

    // Otherwise, calculate from current state (this will be replaced with API call in production)
    const metrics: Record<
      SalesChannel,
      { count: number; revenue: number; fees: number }
    > = {} as any;

    // Initialize metrics for all channels
    Object.values(SalesChannel).forEach((channel) => {
      metrics[channel] = { count: 0, revenue: 0, fees: 0 };
    });

    // Calculate metrics from all sales
    const allSales = [...sales, ...completedSales];

    allSales.forEach((sale) => {
      metrics[sale.channel].count += 1;
      metrics[sale.channel].revenue += sale.totalAmount;

      if (sale.platformFees) {
        metrics[sale.channel].fees += sale.platformFees;
      }
    });

    // Cache the metrics
    setChannelMetricsCache(metrics);

    return metrics;
  };

  // Get material requirements for a sale
  const getMaterialRequirements = async (saleId: number): Promise<any[]> => {
    try {
      return await salesService.getMaterialRequirements(saleId);
    } catch (err) {
      setError('Failed to get material requirements');
      throw err;
    }
  };

  // Reserve materials for a sale
  const reserveMaterials = async (saleId: number): Promise<boolean> => {
    try {
      return await salesService.reserveMaterials(saleId);
    } catch (err) {
      setError('Failed to reserve materials');
      throw err;
    }
  };

  // Update inventory when order is fulfilled
  const updateInventoryOnFulfillment = async (
    saleId: number
  ): Promise<boolean> => {
    try {
      return await salesService.updateInventoryOnFulfillment(saleId);
    } catch (err) {
      setError('Failed to update inventory');
      throw err;
    }
  };

  // Context value
  const value: SalesContextType = {
    sales,
    completedSales,
    loading,
    error,
    getSale,
    filterSalesList,
    createSale,
    updateSale,
    syncOrders,
    updateFulfillment,
    createPickingList,
    getChannelMetrics,

    // Material integration methods
    getMaterialRequirements,
    reserveMaterials,
    updateInventoryOnFulfillment,
  };

  return (
    <SalesContext.Provider value={value}>{children}</SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};
