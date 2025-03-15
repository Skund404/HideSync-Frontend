// src/utils/purchaseTypeConversion.ts
import { MaterialType, PaymentStatus } from '@/types/enums';
import { Purchase, PurchaseItem, Supplier } from '@/types/models';
import { PurchaseOrder, PurchaseOrderItem } from '@/types/purchaseTypes';

export function toPurchaseOrder(purchase: Purchase): PurchaseOrder {
  return {
    id: purchase.id.toString(),
    supplier:
      typeof purchase.supplier === 'number'
        ? 'Unknown Supplier'
        : (purchase.supplier as Supplier).name || 'Unknown Supplier',
    supplierId:
      typeof purchase.supplier === 'number'
        ? purchase.supplier
        : (purchase.supplier as Supplier).id,
    date: purchase.date,
    deliveryDate: '', // Default empty string
    status: purchase.status,
    total: purchase.totalAmount,
    paymentStatus: PaymentStatus.PENDING,
    items: purchase.items.map(convertPurchaseItemToPurchaseOrderItem),
    invoice: '',
  };
}

export function toGridPurchase(purchaseOrder: PurchaseOrder): Purchase {
  return {
    id: parseInt(purchaseOrder.id),
    date: purchaseOrder.date,
    supplier: purchaseOrder.supplierId,
    totalAmount: purchaseOrder.total,
    status: purchaseOrder.status,
    items: purchaseOrder.items.map(convertPurchaseOrderItemToPurchaseItem),
  };
}

function convertPurchaseItemToPurchaseOrderItem(
  item: PurchaseItem
): PurchaseOrderItem {
  return {
    id: item.id,
    name: item.itemName,
    quantity: item.quantity,
    price: item.price,
    total: item.quantity * item.price,
    itemType: item.itemType.toString(),
  };
}

function convertPurchaseOrderItemToPurchaseItem(
  item: PurchaseOrderItem
): PurchaseItem {
  return {
    id: item.id,
    purchaseId: 0, // This might need to be set separately
    itemId: 0, // You might need to map this based on your specific requirements
    itemType: MaterialType.SUPPLIES, // Default, adjust as needed
    itemName: item.name,
    quantity: item.quantity,
    price: item.price,
  };
}

export { toPurchaseOrder as convertToGridPurchase };
