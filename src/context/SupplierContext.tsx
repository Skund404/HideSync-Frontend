import {
  filterSuppliers,
  suppliers as mockSuppliers,
} from '@/services/mock/suppliers';
import { Supplier, SupplierFilters } from '@/types/supplierTypes';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface SupplierContextType {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  filteredSuppliers: Supplier[];
  filters: SupplierFilters;
  setFilters: React.Dispatch<React.SetStateAction<SupplierFilters>>;
  getSupplierById: (id: number) => Supplier | undefined;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: number) => void;
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SupplierFilters>(defaultFilters);

  // Load mock data
  useEffect(() => {
    try {
      setLoading(true);
      setSuppliers(mockSuppliers);
      setError(null);
    } catch (err) {
      setError('Failed to load suppliers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter suppliers based on current filters
  const filteredSuppliers = useMemo(() => {
    return filterSuppliers({
      category: filters.category,
      status: filters.status,
      rating: filters.rating,
      searchQuery: filters.searchQuery,
    });
  }, [suppliers, filters]);

  // Get supplier by ID
  const getSupplierById = (id: number): Supplier | undefined => {
    return suppliers.find((supplier) => supplier.id === id);
  };

  // Add new supplier
  const addSupplier = (supplier: Omit<Supplier, 'id'>): void => {
    const newId = Math.max(...suppliers.map((s) => s.id), 0) + 1;
    const newSupplier: Supplier = {
      ...supplier,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSuppliers((prevSuppliers) => [...prevSuppliers, newSupplier]);
  };

  // Update existing supplier
  const updateSupplier = (updatedSupplier: Supplier): void => {
    setSuppliers((prevSuppliers) =>
      prevSuppliers.map((supplier) =>
        supplier.id === updatedSupplier.id
          ? { ...updatedSupplier, updatedAt: new Date().toISOString() }
          : supplier
      )
    );
  };

  // Delete supplier
  const deleteSupplier = (id: number): void => {
    setSuppliers((prevSuppliers) =>
      prevSuppliers.filter((supplier) => supplier.id !== id)
    );
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
