import {
  filterPurchaseOrders,
  purchaseOrders as mockPurchaseOrders,
} from '@/services/mock/purchases';
import { PurchaseOrder, PurchaseOrderFilters } from '@/types/purchaseTypes';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

// Rename interface to PurchaseOrderContextType
interface PurchaseOrderContextType {
  purchaseOrders: PurchaseOrder[];
  loading: boolean;
  error: string | null;
  filteredPurchaseOrders: PurchaseOrder[];
  filters: PurchaseOrderFilters;
  setFilters: React.Dispatch<React.SetStateAction<PurchaseOrderFilters>>;
  getPurchaseOrderById: (id: string) => PurchaseOrder | undefined;
  getSupplierPurchaseOrders: (supplierId: number) => PurchaseOrder[];
  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id'>) => void;
  updatePurchaseOrder: (order: PurchaseOrder) => void;
  deletePurchaseOrder: (id: string) => void;
}

const defaultFilters: PurchaseOrderFilters = {
  supplier: '',
  status: '',
  dateRange: {},
  searchQuery: '',
};

// Rename context to PurchaseOrderContext
const PurchaseOrderContext = createContext<
  PurchaseOrderContextType | undefined
>(undefined);

// Rename provider to PurchaseOrderProvider
export const PurchaseOrderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PurchaseOrderFilters>(defaultFilters);

  // Load mock data
  useEffect(() => {
    try {
      setLoading(true);
      setPurchaseOrders(mockPurchaseOrders);
      setError(null);
    } catch (err) {
      setError('Failed to load purchase orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter purchase orders based on current filters
  const filteredPurchaseOrders = useMemo(() => {
    return filterPurchaseOrders({
      supplier: filters.supplier,
      status: filters.status,
      dateRange: filters.dateRange,
      searchQuery: filters.searchQuery,
    });
  }, [purchaseOrders, filters]);

  // Get purchase order by ID
  const getPurchaseOrderById = (id: string): PurchaseOrder | undefined => {
    return purchaseOrders.find((order) => order.id === id);
  };

  // Get purchase orders by supplier ID
  const getSupplierPurchaseOrders = (supplierId: number): PurchaseOrder[] => {
    return purchaseOrders.filter((order) => order.supplierId === supplierId);
  };

  // Add new purchase order
  const addPurchaseOrder = (order: Omit<PurchaseOrder, 'id'>): void => {
    // Generate purchase order number (PO-YYYY-XXX)
    const year = new Date().getFullYear();
    const orderCount = purchaseOrders.filter((p) =>
      p.id.includes(`PO-${year}`)
    ).length;
    const newId = `PO-${year}-${(orderCount + 1).toString().padStart(3, '0')}`;

    const newOrder: PurchaseOrder = {
      ...order,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPurchaseOrders((prevOrders) => [...prevOrders, newOrder]);
  };

  // Update existing purchase order
  const updatePurchaseOrder = (updatedOrder: PurchaseOrder): void => {
    setPurchaseOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === updatedOrder.id
          ? { ...updatedOrder, updatedAt: new Date().toISOString() }
          : order
      )
    );
  };

  // Delete purchase order
  const deletePurchaseOrder = (id: string): void => {
    setPurchaseOrders((prevOrders) =>
      prevOrders.filter((order) => order.id !== id)
    );
  };

  const value = {
    purchaseOrders,
    loading,
    error,
    filteredPurchaseOrders,
    filters,
    setFilters,
    getPurchaseOrderById,
    getSupplierPurchaseOrders,
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
  };

  return (
    <PurchaseOrderContext.Provider value={value}>
      {children}
    </PurchaseOrderContext.Provider>
  );
};

// Rename hook to usePurchaseOrders
export const usePurchaseOrders = (): PurchaseOrderContextType => {
  const context = useContext(PurchaseOrderContext);
  if (context === undefined) {
    throw new Error(
      'usePurchaseOrders must be used within a PurchaseOrderProvider'
    );
  }
  return context;
};
