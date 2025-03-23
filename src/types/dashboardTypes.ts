// src/types/dashboardTypes.ts

/**
 * Type definition for material stock summary items
 */
export interface MaterialStockSummary {
    name: string;
    percentage: number;
    status: 'low' | 'medium' | 'good';
  }
  
  /**
   * Type definition for recent activity items
   */
  export interface RecentActivity {
    id: string | number;
    type: string;
    description: string;
    timestamp: string;
    user?: string;
    relatedId?: string | number;
    relatedType?: string;
    metadata?: Record<string, any>;
  }
  
  /**
   * Type definition for upcoming deadline projects
   */
  export interface UpcomingDeadline {
    id: number;
    name: string;
    dueDate: string;
    status: string;
    completionPercentage: number;
    customer?: string;
  }
  
  /**
   * Type definition for dashboard summary data
   */
  export interface DashboardSummary {
    activeProjects: number;
    pendingOrders: number;
    materialsToReorder: number;
    upcomingDeadlines: UpcomingDeadline[];
    recentActivity: RecentActivity[];
    materialStockSummary: MaterialStockSummary[];
  }
  
  /**
   * Type definition for purchase timeline items
   */
  export interface PurchaseTimelineItem {
    id: string | number;
    supplier: string;
    deliveryDate: string;
    status: 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'DELAYED';
    items: number;
    total: number;
  }
  
  /**
   * Type definition for top product items
   */
  export interface TopProduct {
    id: number;
    name: string;
    sales: number;
    revenue: number;
    growth: number;
    image?: string;
  }
  
  /**
   * Type definition for supplier activity items
   */
  export interface SupplierActivity {
    id: string | number;
    supplier: string;
    action: string;
    date: string;
    status: string;
    value?: number;
  }
  
  /**
   * Type definition for tool maintenance item
   */
  export interface ToolMaintenance {
    id: number;
    toolName: string;
    maintenanceType: string;
    dueDate: string;
    isOverdue: boolean;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
  }
  
  /**
   * Type definition for storage utilization data
   */
  export interface StorageUtilization {
    totalLocations: number;
    usedLocations: number;
    utilizationPercentage: number;
    bySection: Record<string, number>;
    byType: Record<string, number>;
    nearCapacity: number;
  }