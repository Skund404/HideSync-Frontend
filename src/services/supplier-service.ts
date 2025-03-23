// src/services/supplier-service.ts
import { apiClient, ApiResponse, ApiError } from './api-client';
import { Supplier, SupplierFilters } from '@/types/supplierTypes';

const BASE_URL = '/suppliers';

// Get all suppliers
export const getSuppliers = async (): Promise<Supplier[]> => {
  try {
    const response = await apiClient.get<Supplier[]>(BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    throw error;
  }
};

// Get a supplier by ID
export const getSupplierById = async (id: number): Promise<Supplier> => {
  try {
    const response = await apiClient.get<Supplier>(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching supplier ${id}:`, error);
    throw error;
  }
};

// Create a new supplier
export const createSupplier = async (supplier: Omit<Supplier, 'id'>): Promise<Supplier> => {
  try {
    const response = await apiClient.post<Supplier>(BASE_URL, supplier);
    return response.data;
  } catch (error) {
    console.error('Error creating supplier:', error);
    throw error;
  }
};

// Update a supplier
export const updateSupplier = async (supplier: Supplier): Promise<Supplier> => {
  try {
    const response = await apiClient.put<Supplier>(`${BASE_URL}/${supplier.id}`, supplier);
    return response.data;
  } catch (error) {
    console.error(`Error updating supplier ${supplier.id}:`, error);
    throw error;
  }
};

// Delete a supplier
export const deleteSupplier = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    console.error(`Error deleting supplier ${id}:`, error);
    throw error;
  }
};

// Filter suppliers based on criteria
export const filterSuppliers = async (filters: SupplierFilters): Promise<Supplier[]> => {
  try {
    // Convert filters object to query params
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);
    if (filters.rating) params.append('rating', filters.rating.toString());
    if (filters.searchQuery) params.append('search', filters.searchQuery);

    const response = await apiClient.get<Supplier[]>(BASE_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error filtering suppliers:', error);
    throw error;
  }
};