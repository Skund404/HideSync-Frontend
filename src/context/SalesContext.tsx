import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  fetchOrdersFromPlatform,
  updateOrderFulfillment,
} from '../services/integrations/platformIntegration';
import { completedSalesData, salesData } from '../services/mock/sales';
import { PickingListStatus } from '../types/pickinglist';
import {
  FulfillmentStatus,
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
  createPickingList: (saleId: number) => Promise<string>;
  getChannelMetrics: () => Record<
    SalesChannel,
    { count: number; revenue: number; fees: number }
  >;

  // New methods for Material and Inventory Integration
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

  useEffect(() => {
    // Simulate API fetch
    try {
      setSales(salesData);
      setCompletedSales(completedSalesData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load sales data');
      setLoading(false);
    }
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
        (sale) => sale.customer.id.toString() === filters.customerId
      );
    }

    if (filters.channel) {
      filteredSales = filteredSales.filter(
        (sale) => sale.channel === filters.channel
      );
    }

    if (filters.dateFrom && filters.dateTo) {
      filteredSales = filteredSales.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= filters.dateFrom! && saleDate <= filters.dateTo!;
      });
    } else if (filters.dateFrom) {
      filteredSales = filteredSales.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= filters.dateFrom!;
      });
    } else if (filters.dateTo) {
      filteredSales = filteredSales.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate <= filters.dateTo!;
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
      // Generate a new ID (this would be handled by the server in a real app)
      const newId = Math.max(...sales.map((s) => s.id), 0) + 1;

      const newSale: Sale = {
        ...(sale as any),
        id: newId,
      };

      // Add to sales list
      setSales([...sales, newSale]);

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
      const saleIndex = sales.findIndex((s) => s.id === id);

      if (saleIndex === -1) {
        const completedSaleIndex = completedSales.findIndex((s) => s.id === id);

        if (completedSaleIndex === -1) {
          throw new Error('Sale not found');
        }

        // Update a completed sale
        const updatedSale = {
          ...completedSales[completedSaleIndex],
          ...updates,
        };

        const newCompletedSales = [...completedSales];
        newCompletedSales[completedSaleIndex] = updatedSale;
        setCompletedSales(newCompletedSales);

        return updatedSale;
      }

      // Update a current sale
      const updatedSale = {
        ...sales[saleIndex],
        ...updates,
      };

      const newSales = [...sales];
      newSales[saleIndex] = updatedSale;
      setSales(newSales);

      return updatedSale;
    } catch (err) {
      setError('Failed to update sale');
      throw err;
    }
  };

  // Sync orders from integrated platforms
  const syncOrders = async (fromDate?: Date): Promise<number> => {
    try {
      // Create a unified list of new orders
      const newOrders: Sale[] = [];

      // In a real app, this would fetch orders from each connected platform
      // For this demo, we'll just simulate it

      // Get existing order IDs to avoid duplicates
      const existingOrderIds = new Set(
        [
          ...sales.map((s) => s.marketplaceData?.externalOrderId || ''),
          ...completedSales.map(
            (s) => s.marketplaceData?.externalOrderId || ''
          ),
        ].filter((id) => id)
      );

      // Simulate fetching orders from Shopify
      const shopifyConfig = {
        shopName: 'your-shop',
        apiKey: 'demo-api-key',
      };
      const shopifyOrders = await fetchOrdersFromPlatform(
        SalesChannel.SHOPIFY,
        shopifyConfig,
        fromDate
      );

      // Add non-duplicate orders
      for (const order of shopifyOrders) {
        if (
          order.marketplaceData?.externalOrderId &&
          !existingOrderIds.has(order.marketplaceData.externalOrderId)
        ) {
          newOrders.push(order);
          existingOrderIds.add(order.marketplaceData.externalOrderId);
        }
      }

      // Simulate fetching orders from Etsy
      const etsyConfig = {
        apiKey: 'demo-etsy-key',
      };
      const etsyOrders = await fetchOrdersFromPlatform(
        SalesChannel.ETSY,
        etsyConfig,
        fromDate
      );

      // Add non-duplicate orders
      for (const order of etsyOrders) {
        if (
          order.marketplaceData?.externalOrderId &&
          !existingOrderIds.has(order.marketplaceData.externalOrderId)
        ) {
          newOrders.push(order);
          existingOrderIds.add(order.marketplaceData.externalOrderId);
        }
      }

      // Add new orders to the sales list
      if (newOrders.length > 0) {
        setSales([...sales, ...newOrders]);
      }

      return newOrders.length;
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
      const updatedSale = await updateSale(saleId, {
        fulfillmentStatus: FulfillmentStatus.SHIPPED,
        trackingNumber,
        shippingProvider,
      });

      // If it's a marketplace order, update the external system
      if (sale.marketplaceData) {
        await updateOrderFulfillment(sale, trackingNumber, shippingProvider);
      }

      return updatedSale;
    } catch (err) {
      setError('Failed to update fulfillment');
      throw err;
    }
  };

  // Create a picking list for a sale
  // Create a picking list for a sale - using numeric ID for compatibility
  const createPickingList = async (saleId: number): Promise<string> => {
    try {
      const sale = getSale(saleId);

      if (!sale) {
        throw new Error('Sale not found');
      }

      // In a real app, this would create a picking list in the database
      // For this demo, we'll just generate a numeric ID
      const numericId = parseInt(Date.now().toString().slice(-6), 10);

      // Format the ID as a string for the return value
      const pickingListId = `PL-${numericId}`;

      // Update the sale with picking list reference
      await updateSale(saleId, {
        pickingList: {
          id: numericId, // Use the numeric ID here
          status: PickingListStatus.PENDING,
          createdAt: new Date().toISOString(),
        },
      });

      return pickingListId; // Return formatted string ID
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
      metrics[sale.channel].revenue += sale.total;

      if (sale.platformFees) {
        metrics[sale.channel].fees += sale.platformFees;
      }
    });

    return metrics;
  };

  // New methods for Material and Inventory Integration

  // Get material requirements for a sale
  const getMaterialRequirements = async (saleId: number): Promise<any[]> => {
    try {
      const sale = getSale(saleId);

      if (!sale) {
        throw new Error('Sale not found');
      }

      // In a real app, this would calculate material requirements based on the products
      // For this demo, we'll return mock data
      const mockRequirements = [
        {
          materialId: 1,
          name: 'Vegetable Tanned Leather',
          quantity: 2,
          unit: 'sq ft',
          available: 5,
          status: 'in_stock',
          location: 'Cabinet 1A',
        },
        {
          materialId: 2,
          name: 'Waxed Thread',
          quantity: 1,
          unit: 'spool',
          available: 3,
          status: 'in_stock',
          location: 'Drawer 2B',
        },
        {
          materialId: 3,
          name: 'Brass Hardware',
          quantity: 4,
          unit: 'pieces',
          available: 8,
          status: 'in_stock',
          location: 'Drawer 3C',
        },
      ];

      return mockRequirements;
    } catch (err) {
      setError('Failed to get material requirements');
      throw err;
    }
  };

  // Reserve materials for a sale
  const reserveMaterials = async (saleId: number): Promise<boolean> => {
    try {
      const sale = getSale(saleId);

      if (!sale) {
        throw new Error('Sale not found');
      }

      // In a real app, this would reserve materials in the inventory
      // For this demo, we'll just return success
      return true;
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
      const sale = getSale(saleId);

      if (!sale) {
        throw new Error('Sale not found');
      }

      // In a real app, this would update inventory quantities
      // For this demo, we'll just return success
      return true;
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

    // New methods
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
