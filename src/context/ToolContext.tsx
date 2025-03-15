// src/context/ToolContext.tsx
//
// This file contains the React Context for the Tool Management module.
// It provides state management and operations for tools, tool maintenance,
// and tool checkout functionality.
//
// The context uses the types defined in src/types/toolTypes.ts and
// mock data from src/services/mock/tools.ts

import {
  MaintenanceStatus,
  Tool,
  ToolCheckout,
  ToolCheckoutStatus,
  ToolMaintenance,
  ToolStatus,
} from '@/types/toolType';
import React, { createContext, ReactNode, useContext, useState } from 'react';
// Use the path alias from tsconfig
import {
  checkoutData as initialCheckoutData,
  maintenanceData as initialMaintenanceData,
  toolsData as initialToolsData,
} from '@services/mock/tools';
// Define the context type
interface ToolContextType {
  // Data
  tools: Tool[];
  maintenanceRecords: ToolMaintenance[];
  checkoutRecords: ToolCheckout[];

  // Tool operations
  addTool: (tool: Omit<Tool, 'id'>) => void;
  updateTool: (tool: Tool) => void;
  deleteTool: (id: number) => void;
  getToolById: (id: number) => Tool | undefined;

  // Maintenance operations
  addMaintenanceRecord: (record: Omit<ToolMaintenance, 'id'>) => void;
  updateMaintenanceRecord: (record: ToolMaintenance) => void;
  deleteMaintenanceRecord: (id: number) => void;
  getToolMaintenanceRecords: (toolId: number) => ToolMaintenance[];
  scheduleMaintenance: (
    toolId: number,
    maintenanceType: string,
    date: string
  ) => void;

  // Checkout operations
  checkoutTool: (toolId: number, checkoutData: Partial<ToolCheckout>) => void;
  returnTool: (checkoutId: number, condition: string, issues?: string) => void;
  getToolCheckoutRecords: (toolId: number) => ToolCheckout[];
  getCurrentCheckout: (toolId: number) => ToolCheckout | undefined;

  // Statistics and queries
  getUpcomingMaintenance: () => Tool[];
  getOverdueMaintenance: () => Tool[];
  getCurrentlyCheckedOut: () => Tool[];
  getNeedsAttention: () => Tool[];
  countToolsByStatus: () => Record<ToolStatus, number>;
}

// Create the context with a default value
const ToolContext = createContext<ToolContextType | undefined>(undefined);

// Provider props type
interface ToolProviderProps {
  children: ReactNode;
}

// Create the provider component
export const ToolProvider: React.FC<ToolProviderProps> = ({ children }) => {
  // State for tools and related records
  const [tools, setTools] = useState<Tool[]>(initialToolsData);
  const [maintenanceRecords, setMaintenanceRecords] = useState<
    ToolMaintenance[]
  >(initialMaintenanceData);
  const [checkoutRecords, setCheckoutRecords] =
    useState<ToolCheckout[]>(initialCheckoutData);

  // Tool operations
  const addTool = (toolData: Omit<Tool, 'id'>) => {
    const newId = Math.max(...tools.map((t) => t.id), 0) + 1;
    const newTool = { ...toolData, id: newId };
    setTools([...tools, newTool]);
  };

  const updateTool = (updatedTool: Tool) => {
    setTools(
      tools.map((tool) => (tool.id === updatedTool.id ? updatedTool : tool))
    );
  };

  const deleteTool = (id: number) => {
    setTools(tools.filter((tool) => tool.id !== id));
    // Also delete related records
    setMaintenanceRecords(
      maintenanceRecords.filter((record) => record.toolId !== id)
    );
    setCheckoutRecords(
      checkoutRecords.filter((record) => record.toolId !== id)
    );
  };

  const getToolById = (id: number) => {
    return tools.find((tool) => tool.id === id);
  };

  // Maintenance operations
  const addMaintenanceRecord = (recordData: Omit<ToolMaintenance, 'id'>) => {
    const newId = Math.max(...maintenanceRecords.map((r) => r.id), 0) + 1;
    const now = new Date().toISOString();
    const newRecord: ToolMaintenance = {
      ...recordData,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };

    setMaintenanceRecords([...maintenanceRecords, newRecord]);

    // If maintenance is completed, update the tool's last maintenance date
    if (recordData.status === MaintenanceStatus.COMPLETED) {
      const tool = tools.find((t) => t.id === recordData.toolId);
      if (tool) {
        // Calculate next maintenance date based on interval
        const maintenanceDate = new Date(recordData.date);
        const nextDate = new Date(maintenanceDate);
        nextDate.setDate(
          nextDate.getDate() + (tool.maintenanceInterval || 180)
        );

        updateTool({
          ...tool,
          lastMaintenance: recordData.date,
          nextMaintenance: nextDate.toISOString().split('T')[0],
          status: ToolStatus.IN_STOCK,
        });
      }
    }
  };

  const updateMaintenanceRecord = (updatedRecord: ToolMaintenance) => {
    setMaintenanceRecords(
      maintenanceRecords.map((record) =>
        record.id === updatedRecord.id
          ? { ...updatedRecord, updatedAt: new Date().toISOString() }
          : record
      )
    );

    // If maintenance is now completed, update the tool's last maintenance date
    if (updatedRecord.status === MaintenanceStatus.COMPLETED) {
      const tool = tools.find((t) => t.id === updatedRecord.toolId);
      if (tool) {
        // Calculate next maintenance date based on interval
        const maintenanceDate = new Date(updatedRecord.date);
        const nextDate = new Date(maintenanceDate);
        nextDate.setDate(
          nextDate.getDate() + (tool.maintenanceInterval || 180)
        );

        updateTool({
          ...tool,
          lastMaintenance: updatedRecord.date,
          nextMaintenance: nextDate.toISOString().split('T')[0],
          status: ToolStatus.IN_STOCK,
        });
      }
    }
  };

  const deleteMaintenanceRecord = (id: number) => {
    setMaintenanceRecords(
      maintenanceRecords.filter((record) => record.id !== id)
    );
  };

  const getToolMaintenanceRecords = (toolId: number) => {
    return maintenanceRecords.filter((record) => record.toolId === toolId);
  };

  const scheduleMaintenance = (
    toolId: number,
    maintenanceType: string,
    date: string
  ) => {
    const tool = tools.find((t) => t.id === toolId);
    if (!tool) return;

    const now = new Date().toISOString();

    // Create maintenance record
    addMaintenanceRecord({
      toolId,
      toolName: tool.name,
      maintenanceType,
      date,
      performedBy: '',
      cost: 0,
      internalService: true,
      details: `Scheduled ${maintenanceType}`,
      parts: '',
      conditionBefore: '',
      conditionAfter: '',
      status: MaintenanceStatus.SCHEDULED,
      createdAt: now,
      updatedAt: now,
    });

    // Update tool status if currently in stock
    if (tool.status === ToolStatus.IN_STOCK) {
      updateTool({
        ...tool,
        status: ToolStatus.MAINTENANCE,
      });
    }
  };

  // Checkout operations
  const checkoutTool = (
    toolId: number,
    checkoutData: Partial<ToolCheckout>
  ) => {
    const tool = tools.find((t) => t.id === toolId);
    if (!tool || tool.status !== ToolStatus.IN_STOCK) return;

    const newId = Math.max(...checkoutRecords.map((r) => r.id), 0) + 1;
    const now = new Date().toISOString();

    // Create checkout record
    const newCheckout: ToolCheckout = {
      id: newId,
      toolId,
      toolName: tool.name,
      checkedOutBy: checkoutData.checkedOutBy || '',
      checkedOutDate: checkoutData.checkedOutDate || now.split('T')[0],
      dueDate: checkoutData.dueDate || '',
      projectId: checkoutData.projectId,
      projectName: checkoutData.projectName,
      notes: checkoutData.notes || '',
      status: ToolCheckoutStatus.CHECKED_OUT,
      conditionBefore: checkoutData.conditionBefore || 'Good',
      createdAt: now,
      updatedAt: now,
    };

    setCheckoutRecords([...checkoutRecords, newCheckout]);

    // Update tool status
    updateTool({
      ...tool,
      status: ToolStatus.CHECKED_OUT,
      checkedOutTo: checkoutData.checkedOutBy,
      checkedOutDate: checkoutData.checkedOutDate,
      dueDate: checkoutData.dueDate,
      location: `Checked out to ${checkoutData.checkedOutBy}`,
    });
  };

  const returnTool = (
    checkoutId: number,
    condition: string,
    issues?: string
  ) => {
    const checkout = checkoutRecords.find((c) => c.id === checkoutId);
    if (!checkout || checkout.status !== ToolCheckoutStatus.CHECKED_OUT) return;

    const tool = tools.find((t) => t.id === checkout.toolId);
    if (!tool) return;

    // Update checkout record
    const now = new Date().toISOString();
    const returnDate = now.split('T')[0];
    const updatedCheckout: ToolCheckout = {
      ...checkout,
      returnedDate: returnDate,
      conditionAfter: condition,
      issueDescription: issues,
      status: issues
        ? ToolCheckoutStatus.RETURNED_WITH_ISSUES
        : ToolCheckoutStatus.RETURNED,
      updatedAt: now,
    };

    setCheckoutRecords(
      checkoutRecords.map((record) =>
        record.id === checkoutId ? updatedCheckout : record
      )
    );

    // Update tool status and remove checkout-related fields
    const newStatus = issues ? ToolStatus.MAINTENANCE : ToolStatus.IN_STOCK;

    updateTool({
      ...tool,
      status: newStatus,
      checkedOutTo: undefined,
      checkedOutDate: undefined,
      dueDate: undefined,
      location: issues
        ? 'Maintenance Shop'
        : tool.location.replace(
            `Checked out to ${checkout.checkedOutBy}`,
            'Main Workshop'
          ),
    });

    // If there were issues, create a maintenance record
    if (issues) {
      addMaintenanceRecord({
        toolId: tool.id,
        toolName: tool.name,
        maintenanceType: 'Repair after checkout',
        date: returnDate,
        performedBy: '',
        cost: 0,
        internalService: true,
        details: `Repair needed after checkout: ${issues}`,
        parts: '',
        conditionBefore: condition,
        conditionAfter: '',
        status: MaintenanceStatus.SCHEDULED,
        createdAt: now,
        updatedAt: now,
      });
    }
  };

  const getToolCheckoutRecords = (toolId: number) => {
    return checkoutRecords.filter((record) => record.toolId === toolId);
  };

  const getCurrentCheckout = (toolId: number) => {
    return checkoutRecords.find(
      (record) =>
        record.toolId === toolId &&
        record.status === ToolCheckoutStatus.CHECKED_OUT
    );
  };

  // Statistics and queries
  const getUpcomingMaintenance = () => {
    const today = new Date();
    return tools.filter((tool) => {
      const nextDate = new Date(tool.nextMaintenance);
      const diffTime = nextDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return (
        diffDays <= 30 && diffDays > 0 && tool.status !== ToolStatus.MAINTENANCE
      );
    });
  };

  const getOverdueMaintenance = () => {
    const today = new Date();
    return tools.filter((tool) => {
      const nextDate = new Date(tool.nextMaintenance);
      return nextDate < today && tool.status !== ToolStatus.MAINTENANCE;
    });
  };

  const getCurrentlyCheckedOut = () => {
    return tools.filter((tool) => tool.status === ToolStatus.CHECKED_OUT);
  };

  const getNeedsAttention = () => {
    return tools.filter(
      (tool) =>
        tool.status === ToolStatus.DAMAGED ||
        tool.status === ToolStatus.LOST ||
        tool.status === ToolStatus.MAINTENANCE
    );
  };

  const countToolsByStatus = () => {
    const counts = Object.values(ToolStatus).reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {} as Record<ToolStatus, number>);

    tools.forEach((tool) => {
      counts[tool.status]++;
    });

    return counts;
  };

  // Create the context value object
  const contextValue: ToolContextType = {
    tools,
    maintenanceRecords,
    checkoutRecords,
    addTool,
    updateTool,
    deleteTool,
    getToolById,
    addMaintenanceRecord,
    updateMaintenanceRecord,
    deleteMaintenanceRecord,
    getToolMaintenanceRecords,
    scheduleMaintenance,
    checkoutTool,
    returnTool,
    getToolCheckoutRecords,
    getCurrentCheckout,
    getUpcomingMaintenance,
    getOverdueMaintenance,
    getCurrentlyCheckedOut,
    getNeedsAttention,
    countToolsByStatus,
  };

  return (
    <ToolContext.Provider value={contextValue}>{children}</ToolContext.Provider>
  );
};

// Custom hook for using the tool context
export const useTools = () => {
  const context = useContext(ToolContext);
  if (context === undefined) {
    throw new Error('useTools must be used within a ToolProvider');
  }
  return context;
};

// Specialized hooks for specific functionality
export const useToolInventory = () => {
  const {
    tools,
    addTool,
    updateTool,
    deleteTool,
    getToolById,
    countToolsByStatus,
  } = useTools();

  return {
    tools,
    addTool,
    updateTool,
    deleteTool,
    getToolById,
    countToolsByStatus,
  };
};

export const useToolMaintenance = () => {
  const {
    maintenanceRecords,
    addMaintenanceRecord,
    updateMaintenanceRecord,
    deleteMaintenanceRecord,
    getToolMaintenanceRecords,
    scheduleMaintenance,
    getUpcomingMaintenance,
    getOverdueMaintenance,
  } = useTools();

  return {
    maintenanceRecords,
    addMaintenanceRecord,
    updateMaintenanceRecord,
    deleteMaintenanceRecord,
    getToolMaintenanceRecords,
    scheduleMaintenance,
    getUpcomingMaintenance,
    getOverdueMaintenance,
  };
};

export const useToolCheckout = () => {
  const {
    checkoutRecords,
    checkoutTool,
    returnTool,
    getToolCheckoutRecords,
    getCurrentCheckout,
    getCurrentlyCheckedOut,
  } = useTools();

  return {
    checkoutRecords,
    checkoutTool,
    returnTool,
    getToolCheckoutRecords,
    getCurrentCheckout,
    getCurrentlyCheckedOut,
  };
};
