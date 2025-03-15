// src/context/PurchaseTimelineContext.tsx
import React, { createContext, ReactNode, useContext, useState } from 'react';

// Define types for purchase timeline
export interface PurchaseTimelineItem {
  id: string;
  supplier: string;
  deliveryDate: string;
  status: 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'DELAYED';
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  total: number;
}

// Context type
interface PurchaseTimelineContextType {
  purchaseTimelines: PurchaseTimelineItem[];
  loading: boolean;
  error: string | null;
  addPurchaseTimeline?: (timeline: Omit<PurchaseTimelineItem, 'id'>) => void;
  updatePurchaseTimeline?: (
    id: string,
    updates: Partial<PurchaseTimelineItem>
  ) => void;
}

// Create context
const PurchaseTimelineContext = createContext<PurchaseTimelineContextType>({
  purchaseTimelines: [],
  loading: true,
  error: null,
});

// Provider component
export const PurchaseTimelineProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [purchaseTimelines, setPurchaseTimelines] = useState<
    PurchaseTimelineItem[]
  >([
    {
      id: 'PO-001',
      supplier: 'Leather Suppliers Inc.',
      deliveryDate: '2024-04-15',
      status: 'PROCESSING',
      items: [
        { name: 'Full Grain Leather', quantity: 10, unitPrice: 50 },
        { name: 'Hardware Kit', quantity: 5, unitPrice: 25 },
      ],
      total: 625,
    },
    {
      id: 'PO-002',
      supplier: 'Hardware Essentials',
      deliveryDate: '2024-04-20',
      status: 'SHIPPED',
      items: [
        { name: 'Brass Rivets', quantity: 100, unitPrice: 0.5 },
        { name: 'Zippers', quantity: 20, unitPrice: 3 },
      ],
      total: 160,
    },
  ]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  // Add purchase timeline
  const addPurchaseTimeline = (timeline: Omit<PurchaseTimelineItem, 'id'>) => {
    const newTimeline = {
      ...timeline,
      id: `PO-${(purchaseTimelines.length + 1).toString().padStart(3, '0')}`,
    };
    setPurchaseTimelines((prev) => [...prev, newTimeline]);
  };

  // Update purchase timeline
  const updatePurchaseTimeline = (
    id: string,
    updates: Partial<PurchaseTimelineItem>
  ) => {
    setPurchaseTimelines((prev) =>
      prev.map((timeline) =>
        timeline.id === id ? { ...timeline, ...updates } : timeline
      )
    );
  };

  return (
    <PurchaseTimelineContext.Provider
      value={{
        purchaseTimelines,
        loading,
        error,
        addPurchaseTimeline,
        updatePurchaseTimeline,
      }}
    >
      {children}
    </PurchaseTimelineContext.Provider>
  );
};

// Custom hook to use the PurchaseTimeline context
export const usePurchaseTimeline = () => {
  const context = useContext(PurchaseTimelineContext);
  if (context === undefined) {
    throw new Error(
      'usePurchaseTimeline must be used within a PurchaseTimelineProvider'
    );
  }
  return context;
};

export default PurchaseTimelineContext;
