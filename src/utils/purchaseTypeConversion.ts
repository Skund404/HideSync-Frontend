// src/utils/purchaseTypeConversion.ts
import { MaterialType, PaymentStatus } from '@/types/enums';
import { Purchase, PurchaseItem, Supplier } from '@/types/models.purchase';
import { PurchaseOrder, PurchaseOrderItem } from '@/types/purchaseTypes';

/**
 * Converts a Purchase model to a PurchaseOrder view model
 * @param purchase The Purchase model from the API/database
 * @returns A PurchaseOrder view model for use in the UI
 */
export function toPurchaseOrder(purchase: Purchase): PurchaseOrder {
  return {
    id: purchase.id.toString(),
    supplier: extractSupplierName(purchase.supplier),
    supplierId: extractSupplierId(purchase.supplier),
    date: purchase.date,
    deliveryDate: purchase.deliveryDate || '',
    status: purchase.status,
    total: purchase.total,
    paymentStatus: purchase.paymentStatus || PaymentStatus.PENDING,
    items: (purchase.items || []).map(convertPurchaseItemToPurchaseOrderItem),
    notes: purchase.notes,
    invoice: purchase.invoice || '',
    createdAt: purchase.createdAt || '',
    updatedAt: purchase.updatedAt || '',
  };
}

/**
 * Converts a PurchaseOrder view model to a Purchase model
 * @param purchaseOrder The PurchaseOrder view model from the UI
 * @returns A Purchase model for use with the API/database
 */
export function fromPurchaseOrder(purchaseOrder: PurchaseOrder): Purchase {
  return {
    id: parseInt(purchaseOrder.id, 10),
    supplier: purchaseOrder.supplier,
    supplierId: purchaseOrder.supplierId,
    date: purchaseOrder.date,
    deliveryDate: purchaseOrder.deliveryDate,
    status: purchaseOrder.status,
    total: purchaseOrder.total,
    paymentStatus: purchaseOrder.paymentStatus,
    items: purchaseOrder.items.map(convertPurchaseOrderItemToPurchaseItem),
    notes: purchaseOrder.notes,
    invoice: purchaseOrder.invoice,
    createdAt: purchaseOrder.createdAt,
    updatedAt: purchaseOrder.updatedAt,
  };
}

/**
 * Converts a PurchaseItem model to a PurchaseOrderItem view model
 * @param item The PurchaseItem model from the API/database
 * @returns A PurchaseOrderItem view model for use in the UI
 */
function convertPurchaseItemToPurchaseOrderItem(
  item: PurchaseItem
): PurchaseOrderItem {
  return {
    id: item.id,
    purchase_id: item.purchaseId,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    total: item.total || item.quantity * item.price,
    itemType: item.itemType?.toString() || '',
    materialType: item.materialType || MaterialType.SUPPLIES,
    unit: item.unit || 'piece',
    notes: item.notes,
  };
}

/**
 * Converts a PurchaseOrderItem view model to a PurchaseItem model
 * @param item The PurchaseOrderItem view model from the UI
 * @param purchaseId Optional purchase ID to associate the item with
 * @returns A PurchaseItem model for use with the API/database
 */
function convertPurchaseOrderItemToPurchaseItem(
  item: PurchaseOrderItem,
  purchaseId?: number
): PurchaseItem {
  return {
    id: item.id,
    purchaseId: purchaseId || item.purchase_id || 0,
    itemId: 0, // This would need to be populated from elsewhere if relevant
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    total: item.total,
    itemType: item.itemType || '',
    materialType: item.materialType || MaterialType.SUPPLIES,
    unit: item.unit || 'piece',
    notes: item.notes,
  };
}

/**
 * Extracts the supplier name from different supplier representations
 * @param supplier The supplier field which could be a string, object, or number
 * @returns The extracted supplier name or 'Unknown Supplier' if unavailable
 */
function extractSupplierName(
  supplier: string | Supplier | number | undefined
): string {
  if (typeof supplier === 'object' && supplier !== null) {
    return supplier.name || 'Unknown Supplier';
  }
  if (typeof supplier === 'string') {
    return supplier;
  }
  return 'Unknown Supplier';
}

/**
 * Extracts the supplier ID from different supplier representations
 * @param supplier The supplier field which could be a string, object, or number
 * @returns The extracted supplier ID or 0 if unavailable
 */
function extractSupplierId(
  supplier: string | Supplier | number | undefined
): number {
  if (typeof supplier === 'object' && supplier !== null) {
    return supplier.id || 0;
  }
  if (typeof supplier === 'number') {
    return supplier;
  }
  return 0;
}

// For backward compatibility
export const convertToGridPurchase = toPurchaseOrder;
export const toGridPurchase = fromPurchaseOrder;
