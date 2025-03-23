// src/context/InventoryContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Inventory, InventoryFilters, Product } from '@/types/models';
import {
  getInventoryItems,
  getInventorySummary,
  filterInventoryItems,
  updateInventoryQuantity,
  getStorageLocations
} from '@/services/inventory-service';
import { getRecentTransactions } from '@/services/inventory-transactions-service';
import { InventoryAdjustmentType } from '@/types/enums';
import { ApiError } from '@/services/api-client';

interface InventorySummary {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
  averageMargin: number;
  needsReorder: number;
}

interface InventoryContextType {
  inventoryItems: Product[];
  filteredItems: Product[];
  loading: boolean;
  error: string | null;
  summary: InventorySummary | null;
  storageLocations: { id: string; type: string; products: Product[] }[];
  filters: InventoryFilters;
  setFilters: React.Dispatch<React.SetStateAction<InventoryFilters>>;
  refreshInventory: () => Promise<void>;
  updateItemQuantity: (id: number, quantity: number, adjustmentType?: InventoryAdjustmentType, notes?: string) => Promise<void>;
  loadingLocations: boolean;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

interface InventoryProviderProps {
  children: ReactNode;
}

export const InventoryProvider: React.FC<InventoryProviderProps> = ({ children }) => {
  const [inventoryItems, setInventoryItems] = useState<Product[]>([]);
  const [filteredItems, setFilteredItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [storageLocations, setStorageLocations] = useState<{ id: string; type: string; products: Product[] }[]>([]);
  const [loadingLocations, setLoadingLocations] = useState<boolean>(false);
  
  const [filters, setFilters] = useState<InventoryFilters>({
    searchQuery: '',
    productType: '',
    status: '',
    storageLocation: '',
    dateRange: { from: '', to: '' },
    priceRange: { min: '', max: '' }
  });

  // Load initial inventory data
  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch inventory items and summary in parallel
      const [itemsData, summaryData] = await Promise.all([
        getInventoryItems(),
        getInventorySummary()
      ]);
      
      setInventoryItems(itemsData as unknown as Product[]); // Type conversion as needed
      setFilteredItems(itemsData as unknown as Product[]);
      setSummary(summaryData);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load inventory data');
      console.error('Error loading inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load storage locations
  const fetchStorageLocations = async () => {
    try {
      setLoadingLocations(true);
      const locations = await getStorageLocations();
      setStorageLocations(locations);
    } catch (err) {
      const apiError = err as ApiError;
      console.error('Error loading storage locations:', apiError);
      // We don't set the main error state here to avoid blocking the entire UI
    } finally {
      setLoadingLocations(false);
    }
  };

  // Apply filters to inventory items
  const applyFilters = async () => {
    try {
      setLoading(true);
      
      // If there are no filters, just return all items
      if (
        !filters.searchQuery &&
        !filters.productType &&
        !filters.status &&
        !filters.storageLocation &&
        !filters.dateRange.from &&
        !filters.dateRange.to &&
        !filters.priceRange.min &&
        !filters.priceRange.max
      ) {
        setFilteredItems(inventoryItems);
        return;
      }
      
      // Otherwise, use the API to filter items
      const filtered = await filterInventoryItems(filters);
      setFilteredItems(filtered as unknown as Product[]);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to filter inventory items');
    } finally {
      setLoading(false);
    }
  };

  // Update an item's quantity
  const updateItemQuantity = async (
    id: number, 
    quantity: number, 
    adjustmentType: InventoryAdjustmentType = InventoryAdjustmentType.PHYSICAL_COUNT,
    notes?: string
  ) => {
    try {
      setLoading(true);
      await updateInventoryQuantity(id, quantity, adjustmentType, notes);
      
      // Optimistic update
      const updatedItems = inventoryItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      );
      
      setInventoryItems(updatedItems);
      
      // Also update filtered items if needed
      if (filteredItems.some(item => item.id === id)) {
        const updatedFiltered = filteredItems.map(item => 
          item.id === id ? { ...item, quantity } : item
        );
        setFilteredItems(updatedFiltered);
      }
      
      // Refresh summary data after update
      const summaryData = await getInventorySummary();
      setSummary(summaryData);
      
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || `Failed to update quantity for item #${id}`);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchInventoryData();
    fetchStorageLocations();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [filters]);

  // Function to manually refresh inventory data
  const refreshInventory = async () => {
    await fetchInventoryData();
  };

  const value: InventoryContextType = {
    inventoryItems,
    filteredItems,
    loading,
    error,
    summary,
    storageLocations,
    filters,
    setFilters,
    refreshInventory,
    updateItemQuantity,
    loadingLocations
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

export default InventoryContext;