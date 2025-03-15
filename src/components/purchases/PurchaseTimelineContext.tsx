// src/context/PurchaseTimelineContext.tsx
import React, { createContext, ReactNode, useContext, useState } from 'react';

// Define types for purchase timeline
interface PurchaseTimeline {
  id: string;
  supplier: string;
  deliveryDate: string;
  status: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
}

// Context type
interface PurchaseTimelineContextType {
  timelines: PurchaseTimeline[];
  loading: boolean;
  error: string | null;
}

// Create context
const PurchaseTimelineContext = createContext<PurchaseTimelineContextType>({
  timelines: [],
  loading: true,
  error: null,
});

// Provider component
export const PurchaseTimelineProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Mock data - replace with actual data fetching
  const [timelines] = useState<PurchaseTimeline[]>([
    {
      id: 'PO-001',
      supplier: 'Leather Suppliers Inc.',
      deliveryDate: '2024-04-15',
      status: 'PROCESSING',
      items: [
        { name: 'Full Grain Leather', quantity: 10 },
        { name: 'Hardware Kit', quantity: 5 },
      ],
    },
  ]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return (
    <PurchaseTimelineContext.Provider value={{ timelines, loading, error }}>
      {children}
    </PurchaseTimelineContext.Provider>
  );
};

// Custom hook to use the PurchaseTimeline context
export const usePurchaseTimeline = () => {
  const context = useContext(PurchaseTimelineContext);
  if (!context) {
    throw new Error(
      'usePurchaseTimeline must be used within a PurchaseTimelineProvider'
    );
  }
  return context;
};
