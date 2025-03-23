// src/context/ToolContext.tsx
//
// This file contains the React Context for the Tool Management module.
// It provides state management and operations for tools, tool maintenance,
// and tool checkout functionality, integrated with the API service.
//
// The context uses the types defined in src/types/toolTypes.ts and
// makes API calls using src/services/tool-service.ts

import {
  MaintenanceStatus,
  Tool,
  ToolCheckout,
  ToolCheckoutStatus,
  ToolMaintenance,
  ToolStatus,
  ToolCategory,
} from '@/types/toolType';
import React, { createContext, ReactNode, useContext, useState, useEffect, useCallback } from 'react';
import * as toolService from '@/services/tool-service';
import { ApiError } from '@/services/api-client';
import { useToast } from '@/hooks/useToast'; // Assuming you have a toast hook

// Define the context type
interface ToolContextType {
  // State
  tools: Tool[];
  maintenanceRecords: ToolMaintenance[];
  checkoutRecords: ToolCheckout[];
  loading: {
    tools: boolean;
    maintenance: boolean;
    checkout: boolean;
  };
  error: {
    tools: string | null;
    maintenance: string | null;
    checkout: string | null;
  };

  // Tool operations
  addTool: (tool: Omit<Tool, 'id'>) => Promise<void>;
  updateTool: (tool: Tool) => Promise<void>;
  deleteTool: (id: number) => Promise<void>;
  getToolById: (id: number) => Tool | undefined;
  refreshTools: () => Promise<void>;

  // Maintenance operations
  addMaintenanceRecord: (record: Omit<ToolMaintenance, 'id'>) => Promise<void>;
  updateMaintenanceRecord: (record: ToolMaintenance) => Promise<void>;
  deleteMaintenanceRecord: (id: number) => Promise<void>;
  getToolMaintenanceRecords: (toolId: number) => ToolMaintenance[];
  scheduleMaintenance: (
    toolId: number,
    maintenanceType: string,
    date: string
  ) => Promise<void>;
  refreshMaintenanceRecords: () => Promise<void>;

  // Checkout operations
  checkoutTool: (toolId: number, checkoutData: Partial<ToolCheckout>) => Promise<void>;
  returnTool: (checkoutId: number, condition: string, issues?: string) => Promise<void>;
  getToolCheckoutRecords: (toolId: number) => ToolCheckout[];
  getCurrentCheckout: (toolId: number) => ToolCheckout | undefined;
  refreshCheckoutRecords: () => Promise<void>;

  // Statistics and queries
  getUpcomingMaintenance: () => Tool[];
  getOverdueMaintenance: () => Tool[];
  getCurrentlyCheckedOut: () => Tool[];
  getNeedsAttention: () => Tool[];
  countToolsByStatus: () => Record<ToolStatus, number>;
  
  // Filters
  applyFilters: (filters: toolService.ToolFilters) => Promise<void>;
  resetFilters: () => Promise<void>;
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
  const [tools, setTools] = useState<Tool[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<ToolMaintenance[]>([]);
  const [checkoutRecords, setCheckoutRecords] = useState<ToolCheckout[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState({
    tools: true,
    maintenance: true,
    checkout: true,
  });
  
  // Error states
  const [error, setError] = useState({
    tools: null as string | null,
    maintenance: null as string | null,
    checkout: null as string | null,
  });

  // Toast notifications (assuming you have a toast hook)
  const { showToast } = useToast();

  // Fetch initial data
  useEffect(() => {
    refreshTools();
    refreshMaintenanceRecords();
    refreshCheckoutRecords();
  }, []);

  // Refresh functions
  const refreshTools = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, tools: true }));
      setError(prev => ({ ...prev, tools: null }));
      const data = await toolService.getTools();
      setTools(data);
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Failed to load tools';
      setError(prev => ({ ...prev, tools: errorMessage }));
      showToast('error', errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, tools: false }));
    }
  }, [showToast]);

  const refreshMaintenanceRecords = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, maintenance: true }));
      setError(prev => ({ ...prev, maintenance: null }));
      const data = await toolService.getMaintenanceRecords();
      setMaintenanceRecords(data);
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Failed to load maintenance records';
      setError(prev => ({ ...prev, maintenance: errorMessage }));
      showToast('error', errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, maintenance: false }));
    }
  }, [showToast]);

  const refreshCheckoutRecords = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, checkout: true }));
      setError(prev => ({ ...prev, checkout: null }));
      const data = await toolService.getCheckoutRecords();
      setCheckoutRecords(data);
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Failed to load checkout records';
      setError(prev => ({ ...prev, checkout: errorMessage }));
      showToast('error', errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, checkout: false }));
    }
  }, [showToast]);

  // Apply filters
  const applyFilters = useCallback(async (filters: toolService.ToolFilters) => {
    try {
      setLoading(prev => ({ ...prev, tools: true }));
      setError(prev => ({ ...prev, tools: null }));
      const data = await toolService.filterTools(filters);
      setTools(data);
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Failed to filter tools';
      setError(prev => ({ ...prev, tools: errorMessage }));
      showToast('error', errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, tools: false }));
    }
  }, [showToast]);

  const resetFilters = useCallback(async () => {
    await refreshTools();
  }, [refreshTools]);

  // Tool operations
  const addTool = useCallback(async (toolData: Omit<Tool, 'id'>) => {
    try {
      const newTool = await toolService.createTool(toolData);
      setTools(prev => [...prev, newTool]);
      showToast('success', 'Tool added successfully');
    } catch (err) {
      const apiError = err as ApiError;
      showToast('error', apiError.message || 'Failed to add tool');
      throw err;
    }
  }, [showToast]);

  const updateTool = useCallback(async (updatedTool: Tool) => {
    try {
      // Optimistic update
      setTools(prev => prev.map(tool => tool.id === updatedTool.id ? updatedTool : tool));
      
      // Actual API call
      const result = await toolService.updateTool(updatedTool);
      
      // Update with server result
      setTools(prev => prev.map(tool => tool.id === result.id ? result : tool));
      showToast('success', 'Tool updated successfully');
    } catch (err) {
      const apiError = err as ApiError;
      showToast('error', apiError.message || 'Failed to update tool');
      // Rollback optimistic update
      refreshTools();
      throw err;
    }
  }, [refreshTools, showToast]);

  const deleteTool = useCallback(async (id: number) => {
    try {
      // Optimistic delete
      setTools(prev => prev.filter(tool => tool.id !== id));
      
      // Actual API call
      await toolService.deleteTool(id);
      
      // Update related records
      setMaintenanceRecords(prev => prev.filter(record => record.toolId !== id));
      setCheckoutRecords(prev => prev.filter(record => record.toolId !== id));
      
      showToast('success', 'Tool deleted successfully');
    } catch (err) {
      const apiError = err as ApiError;
      showToast('error', apiError.message || 'Failed to delete tool');
      // Rollback optimistic delete
      refreshTools();
      throw err;
    }
  }, [refreshTools, showToast]);

  const getToolById = useCallback((id: number) => {
    return tools.find(tool => tool.id === id);
  }, [tools]);

  // Maintenance operations
  const addMaintenanceRecord = useCallback(async (recordData: Omit<ToolMaintenance, 'id'>) => {
    try {
      const newRecord = await toolService.createMaintenanceRecord(recordData);
      setMaintenanceRecords(prev => [...prev, newRecord]);
      
      // If maintenance is completed, update the tool's last maintenance date
      if (recordData.status === MaintenanceStatus.COMPLETED) {
        refreshTools();
      }
      
      showToast('success', 'Maintenance record added successfully');
    } catch (err) {
      const apiError = err as ApiError;
      showToast('error', apiError.message || 'Failed to add maintenance record');
      throw err;
    }
  }, [refreshTools, showToast]);

  const updateMaintenanceRecord = useCallback(async (updatedRecord: ToolMaintenance) => {
    try {
      // Optimistic update
      setMaintenanceRecords(prev => 
        prev.map(record => record.id === updatedRecord.id ? updatedRecord : record)
      );
      
      // Actual API call
      const result = await toolService.updateMaintenanceRecord(updatedRecord);
      
      // Update with server result
      setMaintenanceRecords(prev => 
        prev.map(record => record.id === result.id ? result : record)
      );
      
      // If maintenance is now completed, update the tool's last maintenance date
      if (updatedRecord.status === MaintenanceStatus.COMPLETED) {
        refreshTools();
      }
      
      showToast('success', 'Maintenance record updated successfully');
    } catch (err) {
      const apiError = err as ApiError;
      showToast('error', apiError.message || 'Failed to update maintenance record');
      // Rollback optimistic update
      refreshMaintenanceRecords();
      throw err;
    }
  }, [refreshMaintenanceRecords, refreshTools, showToast]);

  const deleteMaintenanceRecord = useCallback(async (id: number) => {
    try {
      // Optimistic delete
      setMaintenanceRecords(prev => prev.filter(record => record.id !== id));
      
      // Actual API call
      await toolService.deleteMaintenanceRecord(id);
      
      showToast('success', 'Maintenance record deleted successfully');
    } catch (err) {
      const apiError = err as ApiError;
      showToast('error', apiError.message || 'Failed to delete maintenance record');
      // Rollback optimistic delete
      refreshMaintenanceRecords();
      throw err;
    }
  }, [refreshMaintenanceRecords, showToast]);

  const getToolMaintenanceRecords = useCallback((toolId: number) => {
    return maintenanceRecords.filter(record => record.toolId === toolId);
  }, [maintenanceRecords]);

  const scheduleMaintenance = useCallback(async (
    toolId: number,
    maintenanceType: string,
    date: string
  ) => {
    try {
      const tool = tools.find(t => t.id === toolId);
      if (!tool) {
        throw new Error(`Tool with ID ${toolId} not found`);
      }
      
      // Create maintenance record
      const maintenanceData: Omit<ToolMaintenance, 'id'> = {
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await addMaintenanceRecord(maintenanceData);
      
      // Update tool status if currently in stock
      if (tool.status === ToolStatus.IN_STOCK) {
        const updatedTool = { ...tool, status: ToolStatus.MAINTENANCE };
        await updateTool(updatedTool);
      }
      
      showToast('success', 'Maintenance scheduled successfully');
    } catch (err) {
      const apiError = err as ApiError;
      showToast('error', apiError.message || 'Failed to schedule maintenance');
      throw err;
    }
  }, [addMaintenanceRecord, showToast, tools, updateTool]);

  // Checkout operations
  const checkoutTool = useCallback(async (
    toolId: number,
    checkoutData: Partial<ToolCheckout>
  ) => {
    try {
      const tool = tools.find(t => t.id === toolId);
      if (!tool || tool.status !== ToolStatus.IN_STOCK) {
        throw new Error(`Tool with ID ${toolId} is not available for checkout`);
      }
      
      const now = new Date().toISOString();
      
      // Create checkout record
      const newCheckoutData: Omit<ToolCheckout, 'id'> = {
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
      
      const newCheckout = await toolService.createCheckoutRecord(newCheckoutData);
      setCheckoutRecords(prev => [...prev, newCheckout]);
      
      // Update tool status
      const updatedTool = {
        ...tool,
        status: ToolStatus.CHECKED_OUT,
        checkedOutTo: checkoutData.checkedOutBy,
        checkedOutDate: checkoutData.checkedOutDate || now.split('T')[0],
        dueDate: checkoutData.dueDate,
        location: `Checked out to ${checkoutData.checkedOutBy}`,
      };
      
      await updateTool(updatedTool);
      
      showToast('success', 'Tool checked out successfully');
    } catch (err) {
      const apiError = err as ApiError;
      showToast('error', apiError.message || 'Failed to check out tool');
      throw err;
    }
  }, [showToast, tools, updateTool]);

  const returnTool = useCallback(async (
    checkoutId: number,
    condition: string,
    issues?: string
  ) => {
    try {
      const checkout = checkoutRecords.find(c => c.id === checkoutId);
      if (!checkout || checkout.status !== ToolCheckoutStatus.CHECKED_OUT) {
        throw new Error(`Checkout with ID ${checkoutId} is not valid for return`);
      }
      
      const tool = tools.find(t => t.id === checkout.toolId);
      if (!tool) {
        throw new Error(`Tool with ID ${checkout.toolId} not found`);
      }
      
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
      
      await updateMaintenanceRecord(updatedCheckout);
      
      // Update tool status and remove checkout-related fields
      const newStatus = issues ? ToolStatus.MAINTENANCE : ToolStatus.IN_STOCK;
      
      const updatedTool = {
        ...tool,
        status: newStatus,
        location: issues
          ? 'Maintenance Shop'
          : tool.location.replace(
              `Checked out to ${checkout.checkedOutBy}`,
              'Main Workshop'
            ),
      };
      
      await updateTool(updatedTool);
      
      // If there were issues, create a maintenance record
      if (issues) {
        const maintenanceData: Omit<ToolMaintenance, 'id'> = {
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
        };
        
        await addMaintenanceRecord(maintenanceData);
      }
      
      showToast('success', 'Tool returned successfully');
    } catch (err) {
      const apiError = err as ApiError;
      showToast('error', apiError.message || 'Failed to return tool');
      throw err;
    }
  }, [addMaintenanceRecord, checkoutRecords, showToast, tools, updateMaintenanceRecord, updateTool]);

  const getToolCheckoutRecords = useCallback((toolId: number) => {
    return checkoutRecords.filter(record => record.toolId === toolId);
  }, [checkoutRecords]);

  const getCurrentCheckout = useCallback((toolId: number) => {
    return checkoutRecords.find(
      record =>
        record.toolId === toolId &&
        record.status === ToolCheckoutStatus.CHECKED_OUT
    );
  }, [checkoutRecords]);

  // Statistics and queries
  const getUpcomingMaintenance = useCallback(() => {
    const today = new Date();
    return tools.filter(tool => {
      const nextDate = new Date(tool.nextMaintenance);
      const diffTime = nextDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return (
        diffDays <= 30 && diffDays > 0 && tool.status !== ToolStatus.MAINTENANCE
      );
    });
  }, [tools]);

  const getOverdueMaintenance = useCallback(() => {
    const today = new Date();
    return tools.filter(tool => {
      const nextDate = new Date(tool.nextMaintenance);
      return nextDate < today && tool.status !== ToolStatus.MAINTENANCE;
    });
  }, [tools]);

  const getCurrentlyCheckedOut = useCallback(() => {
    return tools.filter(tool => tool.status === ToolStatus.CHECKED_OUT);
  }, [tools]);

  const getNeedsAttention = useCallback(() => {
    return tools.filter(
      tool =>
        tool.status === ToolStatus.DAMAGED ||
        tool.status === ToolStatus.LOST ||
        tool.status === ToolStatus.MAINTENANCE
    );
  }, [tools]);

  const countToolsByStatus = useCallback(() => {
    const counts = Object.values(ToolStatus).reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {} as Record<ToolStatus, number>);

    tools.forEach(tool => {
      counts[tool.status]++;
    });

    return counts;
  }, [tools]);

  // Create the context value object
  const contextValue: ToolContextType = {
    // State
    tools,
    maintenanceRecords,
    checkoutRecords,
    loading,
    error,
    
    // Tool operations
    addTool,
    updateTool,
    deleteTool,
    getToolById,
    refreshTools,
    
    // Maintenance operations
    addMaintenanceRecord,
    updateMaintenanceRecord,
    deleteMaintenanceRecord,
    getToolMaintenanceRecords,
    scheduleMaintenance,
    refreshMaintenanceRecords,
    
    // Checkout operations
    checkoutTool,
    returnTool,
    getToolCheckoutRecords,
    getCurrentCheckout,
    refreshCheckoutRecords,
    
    // Statistics and queries
    getUpcomingMaintenance,
    getOverdueMaintenance,
    getCurrentlyCheckedOut,
    getNeedsAttention,
    countToolsByStatus,
    
    // Filters
    applyFilters,
    resetFilters,
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
    loading,
    error,
    refreshTools,
    applyFilters,
    resetFilters,
  } = useTools();

  return {
    tools,
    addTool,
    updateTool,
    deleteTool,
    getToolById,
    countToolsByStatus,
    loading: loading.tools,
    error: error.tools,
    refreshTools,
    applyFilters,
    resetFilters,
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
    loading,
    error,
    refreshMaintenanceRecords,
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
    loading: loading.maintenance,
    error: error.maintenance,
    refreshMaintenanceRecords,
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
    loading,
    error,
    refreshCheckoutRecords,
  } = useTools();

  return {
    checkoutRecords,
    checkoutTool,
    returnTool,
    getToolCheckoutRecords,
    getCurrentCheckout,
    getCurrentlyCheckedOut,
    loading: loading.checkout,
    error: error.checkout,
    refreshCheckoutRecords,
  };
};