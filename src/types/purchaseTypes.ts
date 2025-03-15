import { PaymentStatus, PurchaseStatus } from './enums';

export interface PurchaseOrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
  itemType?: string;
  materialType?: string;
  unit?: string;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  supplierId: number;
  date: string;
  deliveryDate: string;
  status: PurchaseStatus;
  total: number;
  paymentStatus: PaymentStatus;
  items: PurchaseOrderItem[];
  notes?: string;
  invoice: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseOrderFilters {
  supplier: string;
  status: string;
  dateRange: {
    start?: string;
    end?: string;
  };
  searchQuery: string;
}
