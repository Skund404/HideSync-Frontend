// src/services/mock/purchases.ts
import { PaymentStatus, PurchaseStatus } from '@/types/enums';
import { PurchaseOrder, PurchaseOrderItem } from '@/types/purchaseTypes';

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO-2025-001',
    supplier: 'Horween Leather',
    supplierId: 1,
    date: 'Feb 2, 2025',
    deliveryDate: 'Mar 2, 2025',
    status: PurchaseStatus.DELIVERED,
    total: 845.5,
    paymentStatus: PaymentStatus.PAID,
    items: [
      {
        id: 1,
        name: 'Chromexcel Hide',
        quantity: 1,
        price: 250.0,
        total: 250.0,
        itemType: 'LEATHER',
        materialType: 'CHROME_TANNED',
        unit: 'HIDE',
      },
      {
        id: 2,
        name: 'Shell Cordovan Pieces',
        quantity: 3,
        price: 180.0,
        total: 540.0,
        itemType: 'LEATHER',
        materialType: 'SHELL_CORDOVAN',
        unit: 'PIECE',
      },
      {
        id: 3,
        name: 'Shipping',
        quantity: 1,
        price: 55.5,
        total: 55.5,
        itemType: 'SERVICE',
      },
    ],
    notes: 'Premium leather for upcoming wallet project',
    invoice: 'INV-HL-4582',
    createdAt: '2025-02-01T14:30:00Z',
    updatedAt: '2025-03-05T10:15:00Z',
  },
  // Additional purchase orders would go here
];

export const getPurchaseOrderById = (id: string): PurchaseOrder | undefined => {
  return purchaseOrders.find((order) => order.id === id);
};

export const getSupplierPurchaseOrders = (
  supplierId: number
): PurchaseOrder[] => {
  return purchaseOrders.filter((order) => order.supplierId === supplierId);
};

export const filterPurchaseOrders = (filters: {
  supplier?: string;
  status?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  searchQuery?: string;
}): PurchaseOrder[] => {
  return purchaseOrders.filter((order: PurchaseOrder) => {
    // Filter by supplier
    if (filters.supplier && order.supplierId.toString() !== filters.supplier) {
      return false;
    }

    // Filter by status
    if (filters.status && order.status !== filters.status) {
      return false;
    }

    // Filter by date range
    if (filters.dateRange) {
      const orderDate = new Date(order.date);

      if (filters.dateRange.start) {
        const startDate = new Date(filters.dateRange.start);
        if (orderDate < startDate) {
          return false;
        }
      }

      if (filters.dateRange.end) {
        const endDate = new Date(filters.dateRange.end);
        if (orderDate > endDate) {
          return false;
        }
      }
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      if (
        !order.id.toLowerCase().includes(query) &&
        !order.supplier.toLowerCase().includes(query) &&
        !order.items.some((item: PurchaseOrderItem) =>
          item.name.toLowerCase().includes(query)
        )
      ) {
        return false;
      }
    }

    return true;
  });
};
