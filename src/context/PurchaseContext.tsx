// src/context/PurchaseContext.tsx
import { ApiError } from '@/services/api-client';
import {
  createPurchaseOrder as apiCreatePurchaseOrder,
  deletePurchaseOrder as apiDeletePurchaseOrder,
  filterPurchaseOrders as apiFilterPurchaseOrders,
  getPurchaseOrderById,
  getPurchaseOrders,
  getSupplierPurchaseOrders as fetchSupplierPurchaseOrders,
  updatePurchaseOrder as apiUpdatePurchaseOrder,
  updatePurchaseOrderStatus as apiUpdateStatus,
} from '@/services/purchase-service';
import {
  PurchaseOrder,
  PurchaseOrderFilters,
  PurchaseOrderItem,
} from '@/types/purchaseTypes';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface PurchaseContextType {
  purchaseOrders: PurchaseOrder[];
  loading: boolean;
  error: string | null;
  filteredOrders: PurchaseOrder[];
  filters: PurchaseOrderFilters;
  setFilters: React.Dispatch<React.SetStateAction<PurchaseOrderFilters>>;
  getPurchaseOrderById: (id: string) => Promise<PurchaseOrder | undefined>;
  getSupplierPurchaseOrders: (supplierId: number) => Promise<PurchaseOrder[]>;
  createPurchaseOrder: (
    order: Omit<PurchaseOrder, 'id'>
  ) => Promise<PurchaseOrder>;
  updatePurchaseOrder: (order: PurchaseOrder) => Promise<PurchaseOrder>;
  updatePurchaseOrderStatus: (
    id: string,
    status: string
  ) => Promise<PurchaseOrder>;
  deletePurchaseOrder: (id: string) => Promise<void>;
  retryFetchPurchaseOrders: () => Promise<void>;
  updateOrderItem: (
    orderId: string,
    item: PurchaseOrderItem
  ) => Promise<PurchaseOrder>;
  addOrderItem: (
    orderId: string,
    item: Omit<PurchaseOrderItem, 'id'>
  ) => Promise<PurchaseOrder>;
  removeOrderItem: (orderId: string, itemId: number) => Promise<PurchaseOrder>;
}

const defaultFilters: PurchaseOrderFilters = {
  supplier: '',
  status: '',
  dateRange: {},
  searchQuery: '',
};

const PurchaseContext = createContext<PurchaseContextType | undefined>(
  undefined
);

export const PurchaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PurchaseOrderFilters>(defaultFilters);

  // Function to fetch purchase orders
  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPurchaseOrders();
      setPurchaseOrders(data);
      setFilteredOrders(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load purchase orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load purchase orders from API on component mount
  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  // Function to retry fetching purchase orders
  const retryFetchPurchaseOrders = async () => {
    await fetchPurchaseOrders();
  };

  // Filter purchase orders based on current filters
  useEffect(() => {
    const applyFilters = async () => {
      if (
        !filters.supplier &&
        !filters.status &&
        !filters.dateRange.start &&
        !filters.dateRange.end &&
        !filters.searchQuery
      ) {
        // If no filters are applied, just show all purchase orders
        setFilteredOrders(purchaseOrders);
        return;
      }

      try {
        setLoading(true);
        const data = await apiFilterPurchaseOrders(filters);
        setFilteredOrders(data);
      } catch (err) {
        console.error('Error filtering purchase orders:', err);
        // Fallback to local filtering if API fails
        const filtered = purchaseOrders.filter((order) => {
          // Filter by supplier
          if (
            filters.supplier &&
            order.supplierId.toString() !== filters.supplier
          ) {
            return false;
          }

          // Filter by status
          if (filters.status && order.status !== filters.status) {
            return false;
          }

          // Filter by date range - start date
          if (filters.dateRange.start) {
            const orderDate = new Date(order.date);
            const startDate = new Date(filters.dateRange.start);
            if (orderDate < startDate) {
              return false;
            }
          }

          // Filter by date range - end date
          if (filters.dateRange.end) {
            const orderDate = new Date(order.date);
            const endDate = new Date(filters.dateRange.end);
            // Add 1 day to include the end date
            endDate.setDate(endDate.getDate() + 1);
            if (orderDate >= endDate) {
              return false;
            }
          }

          // Filter by search query
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            if (
              !order.id.toLowerCase().includes(query) &&
              !order.supplier.toLowerCase().includes(query) &&
              !order.items.some((item) =>
                item.name.toLowerCase().includes(query)
              )
            ) {
              return false;
            }
          }

          return true;
        });
        setFilteredOrders(filtered);
      } finally {
        setLoading(false);
      }
    };

    applyFilters();
  }, [purchaseOrders, filters]);

  // Get purchase order by ID
  const getPurchaseOrderByIdImpl = async (
    id: string
  ): Promise<PurchaseOrder | undefined> => {
    try {
      return await getPurchaseOrderById(id);
    } catch (err) {
      const apiError = err as ApiError;
      throw new Error(
        apiError.message || `Failed to fetch purchase order ${id}`
      );
    }
  };

  // Get purchase orders for a specific supplier
  const getSupplierPurchaseOrders = async (
    supplierId: number
  ): Promise<PurchaseOrder[]> => {
    try {
      setLoading(true);
      const data = await fetchSupplierPurchaseOrders(supplierId);
      return data;
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.message ||
          `Failed to fetch purchase orders for supplier ${supplierId}`
      );
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create a new purchase order
  const createPurchaseOrder = async (
    order: Omit<PurchaseOrder, 'id'>
  ): Promise<PurchaseOrder> => {
    try {
      setLoading(true);
      const newOrder = await apiCreatePurchaseOrder(order, order.items);
      setPurchaseOrders((prev) => [...prev, newOrder]);
      return newOrder;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to create purchase order');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a purchase order
  const updatePurchaseOrder = async (
    order: PurchaseOrder
  ): Promise<PurchaseOrder> => {
    try {
      setLoading(true);
      const updatedOrder = await apiUpdatePurchaseOrder(order);
      setPurchaseOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
      return updatedOrder;
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.message || `Failed to update purchase order ${order.id}`
      );
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update purchase order status
  const updatePurchaseOrderStatus = async (
    id: string,
    status: string
  ): Promise<PurchaseOrder> => {
    try {
      setLoading(true);
      const updatedOrder = await apiUpdateStatus(id, status);
      setPurchaseOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
      return updatedOrder;
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.message || `Failed to update purchase order ${id} status`
      );
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a purchase order
  const deletePurchaseOrder = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      await apiDeletePurchaseOrder(id);
      setPurchaseOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || `Failed to delete purchase order ${id}`);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add a new item to a purchase order
  const addOrderItem = async (
    orderId: string,
    item: Omit<PurchaseOrderItem, 'id'>
  ): Promise<PurchaseOrder> => {
    try {
      // Get the order
      const order = await getPurchaseOrderByIdImpl(orderId);
      if (!order) {
        throw new Error(`Purchase order ${orderId} not found`);
      }

      // Generate a new ID for the item
      const newItemId = Math.max(0, ...order.items.map((i) => i.id)) + 1;

      // Create the new item
      const newItem: PurchaseOrderItem = {
        ...item,
        id: newItemId,
        purchase_id: parseInt(orderId, 10), // Set the purchase_id if needed
      };

      // Add the item to the order
      const updatedOrder: PurchaseOrder = {
        ...order,
        items: [...order.items, newItem],
        // Recalculate total
        total: order.total + newItem.total,
      };

      // Update the order
      return await updatePurchaseOrder(updatedOrder);
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.message || `Failed to add item to purchase order ${orderId}`
      );
      console.error(err);
      throw err;
    }
  };

  // Update an item in a purchase order
  const updateOrderItem = async (
    orderId: string,
    updatedItem: PurchaseOrderItem
  ): Promise<PurchaseOrder> => {
    try {
      // Get the order
      const order = await getPurchaseOrderByIdImpl(orderId);
      if (!order) {
        throw new Error(`Purchase order ${orderId} not found`);
      }

      // Find the item to update
      const oldItem = order.items.find((item) => item.id === updatedItem.id);
      if (!oldItem) {
        throw new Error(
          `Item ${updatedItem.id} not found in purchase order ${orderId}`
        );
      }

      // Update the item in the order
      const updatedOrder: PurchaseOrder = {
        ...order,
        items: order.items.map((item) =>
          item.id === updatedItem.id ? updatedItem : item
        ),
        // Recalculate total
        total: order.total - oldItem.total + updatedItem.total,
      };

      // Update the order
      return await updatePurchaseOrder(updatedOrder);
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.message || `Failed to update item in purchase order ${orderId}`
      );
      console.error(err);
      throw err;
    }
  };

  // Remove an item from a purchase order
  const removeOrderItem = async (
    orderId: string,
    itemId: number
  ): Promise<PurchaseOrder> => {
    try {
      // Get the order
      const order = await getPurchaseOrderByIdImpl(orderId);
      if (!order) {
        throw new Error(`Purchase order ${orderId} not found`);
      }

      // Find the item to remove
      const itemToRemove = order.items.find((item) => item.id === itemId);
      if (!itemToRemove) {
        throw new Error(
          `Item ${itemId} not found in purchase order ${orderId}`
        );
      }

      // Remove the item from the order
      const updatedOrder: PurchaseOrder = {
        ...order,
        items: order.items.filter((item) => item.id !== itemId),
        // Recalculate total
        total: order.total - itemToRemove.total,
      };

      // Update the order
      return await updatePurchaseOrder(updatedOrder);
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.message ||
          `Failed to remove item from purchase order ${orderId}`
      );
      console.error(err);
      throw err;
    }
  };

  const value = {
    purchaseOrders,
    loading,
    error,
    filteredOrders,
    filters,
    setFilters,
    getPurchaseOrderById: getPurchaseOrderByIdImpl,
    getSupplierPurchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrder,
    updatePurchaseOrderStatus,
    deletePurchaseOrder,
    retryFetchPurchaseOrders,
    updateOrderItem,
    addOrderItem,
    removeOrderItem,
  };

  return (
    <PurchaseContext.Provider value={value}>
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchaseOrders = (): PurchaseContextType => {
  const context = useContext(PurchaseContext);
  if (context === undefined) {
    throw new Error('usePurchaseOrders must be used within a PurchaseProvider');
  }
  return context;
};
