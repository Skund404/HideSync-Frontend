import { SupplierStatus } from './enums';

export interface Supplier {
  id: number;
  name: string;
  category: string; // LEATHER, HARDWARE, SUPPLIES, MIXED
  contactName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  rating: number; // 1-5 rating
  status: SupplierStatus;
  notes?: string;
  materialCategories: string[];
  logo: string;
  lastOrderDate?: string;
  paymentTerms: string;
  minOrderAmount: string;
  leadTime: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierFilters {
  category: string;
  status: string;
  rating: string;
  searchQuery: string;
}
