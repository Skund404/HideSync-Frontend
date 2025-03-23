// src/context/SupplierContext.tsx
import { ApiError } from '@/services/api-client';
import {
  getSuppliers,
  getSupplierById as fetchSupplierById,
  createSupplier as apiCreateSupplier,
  updateSupplier as apiUpdateSupplier,
  deleteSupplier as apiDeleteSupplier,
  filterSuppliers as apiFilterSuppliers,
} from '@/services/supplier-service';
import { Supplier, SupplierFilters } from '@/types/supplierTypes';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

interface SupplierContextType {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  filteredSuppliers: Supplier[];
  filters: SupplierFilters;
  setFilters: React.Dispatch<React.SetStateAction<SupplierFilters>>;
  getSupplierById: (id: number) => Promise<Supplier>;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<Supplier>;
  updateSupplier: (supplier: Supplier) => Promise<Supplier>;
  deleteSupplier: (id: number) => Promise<void>;
  retryFetchSuppliers: () => Promise<void>;
}

const defaultFilters: SupplierFilters = {
  category: '',
  status: '',
  rating: '',
  searchQuery: '',
};

const SupplierContext = createContext<SupplierContextType | undefined>(
  undefined
);

export const SupplierProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SupplierFilters>(defaultFilters);

  // Function to fetch suppliers
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSuppliers();
      setSuppliers(data);
      setFilteredSuppliers(data); // Initialize filtered suppliers with all suppliers
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load suppliers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load suppliers from API on component mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Function to retry fetching suppliers
  const retryFetchSuppliers = async () => {
    await fetchSuppliers();
  };

  // Filter suppliers based on current filters
  useEffect(() => {
    const applyFilters = async () => {
      if (!filters.category && !filters.status && !filters.rating && !filters.searchQuery) {
        // If no filters are applied, just show all suppliers
        setFilteredSuppliers(suppliers);
        return;
      }

      try {
        setLoading(true);
        const data = await apiFilterSuppliers(filters);
        setFilteredSuppliers(data);
      } catch (err) {
        console.error('Error filtering suppliers:', err);
        // Fallback to local filtering if API fails
        const filtered = suppliers.filter((supplier) => {
          // Filter by category
          if (filters.category && supplier.category !== filters.category) {
            return false;
          }

          // Filter by status
          if (filters.status && supplier.status !== filters.status) {
            return false;
          }

          // Filter by rating
          if (
            filters.rating &&
            supplier.rating < parseInt(String(filters.rating))
          ) {
            return false;
          }

          // Filter by search query
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            if (
              !supplier.name.toLowerCase().includes(query) &&
              !supplier.contactName.toLowerCase().includes(query) &&
              !supplier.materialCategories.some((category) =>
                category.toLowerCase().includes(query)
              )
            ) {
              return false;
            }
          }

          return true;
        });
        setFilteredSuppliers(filtered);
      } finally {
        setLoading(false);
      }
    };

    applyFilters();
  }, [suppliers, filters]);

  // Get supplier by ID
  const getSupplierById = async (id: number): Promise<Supplier> => {
    try {
      return await fetchSupplierById(id);
    } catch (err) {
      const apiError = err as ApiError;
      throw new Error(apiError.message || `Failed to fetch supplier ${id}`);
    }
  };

  // Add new supplier
  const addSupplier = async (supplier: Omit<Supplier, 'id'>): Promise<Supplier> => {
    try {
      setLoading(true);
      const newSupplier = await apiCreateSupplier(supplier);
      setSuppliers((prevSuppliers) => [...prevSuppliers, newSupplier]);
      return newSupplier;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to add supplier');
      console.error(err);
      throw err; // Re-throw to allow component to handle the error
    } finally {
      setLoading(false);
    }
  };

  // Update existing supplier
  const updateSupplier = async (updatedSupplier: Supplier): Promise<Supplier> => {
    try {
      setLoading(true);
      const supplier = await apiUpdateSupplier(updatedSupplier);
      setSuppliers((prevSuppliers) =>
        prevSuppliers.map((s) =>
          s.id === supplier.id ? supplier : s
        )
      );
      return supplier;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to update supplier');
      console.error(err);
      throw err; // Re-throw to allow component to handle the error
    } finally {
      setLoading(false);
    }
  };

  // Delete supplier
  const deleteSupplier = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      await apiDeleteSupplier(id);
      setSuppliers((prevSuppliers) =>
        prevSuppliers.filter((supplier) => supplier.id !== id)
      );
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete supplier');
      console.error(err);
      throw err; // Re-throw to allow component to handle the error
    } finally {
      setLoading(false);
    }
  };

  const value = {
    suppliers,
    loading,
    error,
    filteredSuppliers,
    filters,
    setFilters,
    getSupplierById,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    retryFetchSuppliers,
  };

  return (
    <SupplierContext.Provider value={value}>
      {children}
    </SupplierContext.Provider>
  );
};

export const useSuppliers = (): SupplierContextType => {
  const context = useContext(SupplierContext);
  if (context === undefined) {
    throw new Error('useSuppliers must be used within a SupplierProvider');
  }
  return context;
};