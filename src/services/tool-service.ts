// src/services/tool-service.ts
//
// API service for tool management operations.
// Handles communication with the backend for CRUD operations on tools,
// tool maintenance records, and tool checkout records.

import { apiClient, ApiError } from './api-client';
import {
  Tool,
  ToolMaintenance,
  ToolCheckout,
  ToolStatus,
  MaintenanceStatus,
  ToolCategory
} from '@/types/toolType';

const BASE_URL = '/tools';
const MAINTENANCE_URL = '/tool-maintenance';
const CHECKOUT_URL = '/tool-checkout';

// Tool CRUD operations
export const getTools = async (): Promise<Tool[]> => {
  try {
    const response = await apiClient.get<Tool[]>(BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching tools:', error);
    throw error;
  }
};

export const getToolById = async (id: number): Promise<Tool> => {
  try {
    const response = await apiClient.get<Tool>(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tool with id ${id}:`, error);
    throw error;
  }
};

export const createTool = async (tool: Omit<Tool, 'id'>): Promise<Tool> => {
  try {
    const response = await apiClient.post<Tool>(BASE_URL, tool);
    return response.data;
  } catch (error) {
    console.error('Error creating tool:', error);
    throw error;
  }
};

export const updateTool = async (tool: Tool): Promise<Tool> => {
  try {
    const response = await apiClient.put<Tool>(`${BASE_URL}/${tool.id}`, tool);
    return response.data;
  } catch (error) {
    console.error(`Error updating tool with id ${tool.id}:`, error);
    throw error;
  }
};

export const deleteTool = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    console.error(`Error deleting tool with id ${id}:`, error);
    throw error;
  }
};

// Tool filtering operations
export interface ToolFilters {
  category?: ToolCategory;
  status?: ToolStatus;
  maintenanceStatus?: 'upcoming' | 'overdue' | 'current';
  search?: string;
}

export const filterTools = async (filters: ToolFilters): Promise<Tool[]> => {
  try {
    // Convert the filters object to query parameters
    const params = new URLSearchParams();
    
    if (filters.category) {
      params.append('category', filters.category);
    }
    
    if (filters.status) {
      params.append('status', filters.status);
    }
    
    if (filters.maintenanceStatus) {
      params.append('maintenance_status', filters.maintenanceStatus);
    }
    
    if (filters.search) {
      params.append('search', filters.search);
    }
    
    const queryString = params.toString();
    const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;
    
    const response = await apiClient.get<Tool[]>(url);
    return response.data;
  } catch (error) {
    console.error('Error filtering tools:', error);
    throw error;
  }
};

// Tool maintenance operations
export const getMaintenanceRecords = async (): Promise<ToolMaintenance[]> => {
  try {
    const response = await apiClient.get<ToolMaintenance[]>(MAINTENANCE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    throw error;
  }
};

export const getMaintenanceRecordsByToolId = async (toolId: number): Promise<ToolMaintenance[]> => {
  try {
    const response = await apiClient.get<ToolMaintenance[]>(`${MAINTENANCE_URL}?tool_id=${toolId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching maintenance records for tool ${toolId}:`, error);
    throw error;
  }
};

export const createMaintenanceRecord = async (record: Omit<ToolMaintenance, 'id'>): Promise<ToolMaintenance> => {
  try {
    const response = await apiClient.post<ToolMaintenance>(MAINTENANCE_URL, record);
    return response.data;
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    throw error;
  }
};

export const updateMaintenanceRecord = async (record: ToolMaintenance): Promise<ToolMaintenance> => {
  try {
    const response = await apiClient.put<ToolMaintenance>(`${MAINTENANCE_URL}/${record.id}`, record);
    return response.data;
  } catch (error) {
    console.error(`Error updating maintenance record with id ${record.id}:`, error);
    throw error;
  }
};

export const deleteMaintenanceRecord = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${MAINTENANCE_URL}/${id}`);
  } catch (error) {
    console.error(`Error deleting maintenance record with id ${id}:`, error);
    throw error;
  }
};

// Tool checkout operations
export const getCheckoutRecords = async (): Promise<ToolCheckout[]> => {
  try {
    const response = await apiClient.get<ToolCheckout[]>(CHECKOUT_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching checkout records:', error);
    throw error;
  }
};

export const getCheckoutRecordsByToolId = async (toolId: number): Promise<ToolCheckout[]> => {
  try {
    const response = await apiClient.get<ToolCheckout[]>(`${CHECKOUT_URL}?tool_id=${toolId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching checkout records for tool ${toolId}:`, error);
    throw error;
  }
};

export const createCheckoutRecord = async (record: Omit<ToolCheckout, 'id'>): Promise<ToolCheckout> => {
  try {
    const response = await apiClient.post<ToolCheckout>(CHECKOUT_URL, record);
    return response.data;
  } catch (error) {
    console.error('Error creating checkout record:', error);
    throw error;
  }
};

export const updateCheckoutRecord = async (record: ToolCheckout): Promise<ToolCheckout> => {
  try {
    const response = await apiClient.put<ToolCheckout>(`${CHECKOUT_URL}/${record.id}`, record);
    return response.data;
  } catch (error) {
    console.error(`Error updating checkout record with id ${record.id}:`, error);
    throw error;
  }
};

export const deleteCheckoutRecord = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${CHECKOUT_URL}/${id}`);
  } catch (error) {
    console.error(`Error deleting checkout record with id ${id}:`, error);
    throw error;
  }
};

// Specialized tool operations
export const getToolsNeedingMaintenance = async (): Promise<Tool[]> => {
  try {
    const response = await apiClient.get<Tool[]>(`${BASE_URL}/needs-maintenance`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tools needing maintenance:', error);
    throw error;
  }
};

export const getOverdueMaintenance = async (): Promise<Tool[]> => {
  try {
    const response = await apiClient.get<Tool[]>(`${BASE_URL}/overdue-maintenance`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tools with overdue maintenance:', error);
    throw error;
  }
};

export const getCheckedOutTools = async (): Promise<Tool[]> => {
  try {
    const response = await apiClient.get<Tool[]>(`${BASE_URL}/checked-out`);
    return response.data;
  } catch (error) {
    console.error('Error fetching checked out tools:', error);
    throw error;
  }
};

export const checkoutTool = async (
  toolId: number,
  checkedOutBy: string,
  dueDate: string,
  projectId?: number
): Promise<Tool> => {
  try {
    const checkoutData = {
      checked_out_by: checkedOutBy,
      due_date: dueDate,
      project_id: projectId
    };
    
    const response = await apiClient.post<Tool>(`${BASE_URL}/${toolId}/checkout`, checkoutData);
    return response.data;
  } catch (error) {
    console.error(`Error checking out tool ${toolId}:`, error);
    throw error;
  }
};

export const returnTool = async (
  toolId: number, 
  condition: string,
  issues?: string
): Promise<Tool> => {
  try {
    const returnData = {
      condition,
      issues
    };
    
    const response = await apiClient.post<Tool>(`${BASE_URL}/${toolId}/return`, returnData);
    return response.data;
  } catch (error) {
    console.error(`Error returning tool ${toolId}:`, error);
    throw error;
  }
};

export const scheduleMaintenance = async (
  toolId: number,
  maintenanceType: string,
  date: string,
  performer?: string
): Promise<Tool> => {
  try {
    const maintenanceData = {
      maintenance_type: maintenanceType,
      date,
      performer
    };
    
    const response = await apiClient.post<Tool>(`${BASE_URL}/${toolId}/schedule-maintenance`, maintenanceData);
    return response.data;
  } catch (error) {
    console.error(`Error scheduling maintenance for tool ${toolId}:`, error);
    throw error;
  }
};

export const completeMaintenance = async (
  maintenanceId: number,
  condition?: string,
  notes?: string
): Promise<ToolMaintenance> => {
  try {
    const completionData = {
      condition,
      notes,
      status: MaintenanceStatus.COMPLETED
    };
    
    const response = await apiClient.post<ToolMaintenance>(
      `${MAINTENANCE_URL}/${maintenanceId}/complete`, 
      completionData
    );
    return response.data;
  } catch (error) {
    console.error(`Error completing maintenance record ${maintenanceId}:`, error);
    throw error;
  }
};

// Tool statistics
export interface ToolCounts {
  total: number;
  byStatus: Record<ToolStatus, number>;
  byCategory: Record<ToolCategory, number>;
  needingMaintenance: number;
  checkedOut: number;
  overdue: number;
}

export const getToolStatistics = async (): Promise<ToolCounts> => {
  try {
    const response = await apiClient.get<ToolCounts>(`${BASE_URL}/statistics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tool statistics:', error);
    throw error;
  }
};