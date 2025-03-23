// src/services/materials-service.ts
import { apiClient } from './api-client';
import { 
  Material, 
  LeatherMaterial,
  HardwareMaterial,
  SuppliesMaterial
} from '@/types/models';
import {
  MaterialType,
  InventoryStatus,
  LeatherType,
  LeatherFinish,
  HardwareType,
  HardwareMaterial as HardwareMaterialEnum,
  HardwareFinish
} from '@/types/enums';

/**
 * Pagination and Filtering Parameters
 */
export interface MaterialQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  materialType?: MaterialType;
  status?: InventoryStatus;
  searchQuery?: string;
  
  // Specific filters
  leatherType?: LeatherType;
  hardwareType?: HardwareType;
  suppliesType?: string;
  
  // Additional filtering options
  minQuantity?: number;
  maxQuantity?: number;
  minPrice?: number;
  maxPrice?: number;
  minThickness?: number;
  maxThickness?: number;
  supplier?: string;
  storageLocation?: string;
}

/**
 * API Response for Material Queries
 */
export interface MaterialQueryResponse {
  items: Material[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Material Creation Interfaces
 * Preserving original structure with enhanced type safety
 */
export interface MaterialBaseCreate {
  name: string;
  materialType: MaterialType;
  status?: InventoryStatus;
  quantity: number;
  unit: string;
  quality: string;
  supplierId?: number;
  supplier?: string;
  sku?: string;
  description?: string;
  reorderPoint?: number;
  supplierSku?: string;
  cost?: number;
  price?: number;
  storageLocation?: string;
  notes?: string;
  thumbnail?: string;
}

export interface LeatherMaterialCreate extends MaterialBaseCreate {
  materialType: MaterialType.LEATHER;
  leatherType: LeatherType;
  tannage: string;
  animalSource: string;
  thickness: number;
  area?: number;
  isFullHide?: boolean;
  color?: string;
  finish?: LeatherFinish;
  grade?: string;
}

export interface HardwareMaterialCreate extends MaterialBaseCreate {
  materialType: MaterialType.HARDWARE;
  hardwareType: HardwareType;
  hardwareMaterial: HardwareMaterialEnum;
  finish?: HardwareFinish;
  size?: string;
  color?: string;
}

export interface SuppliesMaterialCreate extends MaterialBaseCreate {
  materialType: MaterialType.SUPPLIES;
  suppliesMaterialType: string;
  color?: string;
  threadThickness?: string;
  materialComposition?: string;
  volume?: number;
  length?: number;
  dryingTime?: string;
  applicationMethod?: string;
  finish?: string;
}

/**
 * Material Service with Comprehensive CRUD Operations
 */
export class MaterialService {
  private static BASE_URL = '/materials';

  /**
   * Fetch Materials with Advanced Querying
   */
  static async getMaterials(
    params: MaterialQueryParams = {}
  ): Promise<MaterialQueryResponse> {
    try {
      const response = await apiClient.get<MaterialQueryResponse>(
        this.BASE_URL, 
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch materials', error);
      throw error;
    }
  }

  /**
   * Fetch Single Material by ID
   */
  static async getMaterial(id: number): Promise<Material> {
    try {
      const response = await apiClient.get<Material>(`${this.BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch material with ID ${id}`, error);
      throw error;
    }
  }

  /**
   * Fetch Materials by Type
   */
  static async getMaterialsByType(type: MaterialType): Promise<Material[]> {
    try {
      const response = await apiClient.get<Material[]>(`${this.BASE_URL}/type/${type}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch materials of type ${type}`, error);
      throw error;
    }
  }

  /**
   * Fetch Leather Materials
   */
  static async getLeatherMaterials(params: Omit<MaterialQueryParams, 'materialType'> = {}): Promise<{
    items: LeatherMaterial[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    try {
      const response = await apiClient.get<{
        items: LeatherMaterial[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      }>(`${this.BASE_URL}/leather`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch leather materials', error);
      throw error;
    }
  }

  /**
   * Fetch Hardware Materials
   */
  static async getHardwareMaterials(params: Omit<MaterialQueryParams, 'materialType'> = {}): Promise<{
    items: HardwareMaterial[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    try {
      const response = await apiClient.get<{
        items: HardwareMaterial[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      }>(`${this.BASE_URL}/hardware`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch hardware materials', error);
      throw error;
    }
  }

  /**
   * Fetch Supplies Materials
   */
  static async getSuppliesMaterials(params: Omit<MaterialQueryParams, 'materialType'> = {}): Promise<{
    items: SuppliesMaterial[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    try {
      const response = await apiClient.get<{
        items: SuppliesMaterial[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      }>(`${this.BASE_URL}/supplies`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch supplies materials', error);
      throw error;
    }
  }

  /**
   * Create Material with Type-Specific Logic
   */
  static async createMaterial(
    materialData: 
      | LeatherMaterialCreate 
      | HardwareMaterialCreate 
      | SuppliesMaterialCreate
  ): Promise<Material> {
    try {
      const response = await apiClient.post<Material>(
        this.BASE_URL, 
        materialData
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create material', error);
      throw error;
    }
  }

  /**
   * Create Leather Material
   */
  static async createLeatherMaterial(material: LeatherMaterialCreate): Promise<LeatherMaterial> {
    try {
      const response = await apiClient.post<LeatherMaterial>(`${this.BASE_URL}/leather`, material);
      return response.data;
    } catch (error) {
      console.error('Failed to create leather material', error);
      throw error;
    }
  }

  /**
   * Create Hardware Material
   */
  static async createHardwareMaterial(material: HardwareMaterialCreate): Promise<HardwareMaterial> {
    try {
      const response = await apiClient.post<HardwareMaterial>(`${this.BASE_URL}/hardware`, material);
      return response.data;
    } catch (error) {
      console.error('Failed to create hardware material', error);
      throw error;
    }
  }

  /**
   * Create Supplies Material
   */
  static async createSuppliesMaterial(material: SuppliesMaterialCreate): Promise<SuppliesMaterial> {
    try {
      const response = await apiClient.post<SuppliesMaterial>(`${this.BASE_URL}/supplies`, material);
      return response.data;
    } catch (error) {
      console.error('Failed to create supplies material', error);
      throw error;
    }
  }

  /**
   * Update Material
   */
  static async updateMaterial(
    id: number, 
    updateData: Partial<Material>
  ): Promise<Material> {
    try {
      const response = await apiClient.put<Material>(
        `${this.BASE_URL}/${id}`, 
        updateData
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update material with ID ${id}`, error);
      throw error;
    }
  }

  /**
   * Update Leather Material
   */
  static async updateLeatherMaterial(
    id: number,
    updateData: Partial<LeatherMaterial>
  ): Promise<LeatherMaterial> {
    try {
      const response = await apiClient.put<LeatherMaterial>(
        `${this.BASE_URL}/leather/${id}`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update leather material with ID ${id}`, error);
      throw error;
    }
  }

  /**
   * Update Hardware Material
   */
  static async updateHardwareMaterial(
    id: number,
    updateData: Partial<HardwareMaterial>
  ): Promise<HardwareMaterial> {
    try {
      const response = await apiClient.put<HardwareMaterial>(
        `${this.BASE_URL}/hardware/${id}`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update hardware material with ID ${id}`, error);
      throw error;
    }
  }

  /**
   * Update Supplies Material
   */
  static async updateSuppliesMaterial(
    id: number,
    updateData: Partial<SuppliesMaterial>
  ): Promise<SuppliesMaterial> {
    try {
      const response = await apiClient.put<SuppliesMaterial>(
        `${this.BASE_URL}/supplies/${id}`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update supplies material with ID ${id}`, error);
      throw error;
    }
  }

  /**
   * Delete Material
   */
  static async deleteMaterial(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_URL}/${id}`);
    } catch (error) {
      console.error(`Failed to delete material with ID ${id}`, error);
      throw error;
    }
  }

  /**
   * Batch Operations
   */
  static async batchUpdateMaterials(
    ids: number[], 
    updateData: Partial<Material>
  ): Promise<Material[]> {
    try {
      const response = await apiClient.put<Material[]>(
        `${this.BASE_URL}/batch`, 
        { ids, updateData }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to batch update materials', error);
      throw error;
    }
  }

  static async batchDeleteMaterials(ids: number[]): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_URL}/batch`, { data: { ids } });
    } catch (error) {
      console.error('Failed to batch delete materials', error);
      throw error;
    }
  }

  /**
   * Get Low Stock Materials
   */
  static async getLowStockMaterials(): Promise<Material[]> {
    try {
      const response = await apiClient.get<Material[]>(`${this.BASE_URL}/low-stock`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch low stock materials', error);
      throw error;
    }
  }

  /**
   * Get Materials by Supplier
   */
  static async getMaterialsBySupplier(supplierId: number): Promise<Material[]> {
    try {
      const response = await apiClient.get<Material[]>(`${this.BASE_URL}/supplier/${supplierId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch materials for supplier ${supplierId}`, error);
      throw error;
    }
  }

  /**
   * Get Materials by Storage Location
   */
  static async getMaterialsByStorageLocation(locationId: string): Promise<Material[]> {
    try {
      const response = await apiClient.get<Material[]>(`${this.BASE_URL}/storage/${locationId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch materials for storage location ${locationId}`, error);
      throw error;
    }
  }

  /**
   * Update Material Quantity
   */
  static async updateMaterialQuantity(
    id: number,
    quantity: number,
    adjustmentType?: string,
    notes?: string
  ): Promise<Material> {
    try {
      const response = await apiClient.patch<Material>(
        `${this.BASE_URL}/${id}/quantity`,
        { quantity, adjustmentType, notes }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update quantity for material ${id}`, error);
      throw error;
    }
  }

  /**
   * Import Materials from CSV
   */
  static async importMaterials(
    formData: FormData
  ): Promise<{ imported: number; errors: any[] }> {
    try {
      const response = await apiClient.post(
        `${this.BASE_URL}/import`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to import materials", error);
      throw error;
    }
  }

  /**
   * Export Materials to CSV
   */
  static async exportMaterials(
    params: MaterialQueryParams = {}
  ): Promise<Blob> {
    try {
      const response = await apiClient.get<Blob>(`${this.BASE_URL}/export`, {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export materials', error);
      throw error;
    }
  }

  /**
   * Utility to download a blob as a file
   */
  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Convenience functions for backwards compatibility
export const getMaterials = MaterialService.getMaterials;
export const getMaterial = MaterialService.getMaterial;
export const getMaterialsByType = MaterialService.getMaterialsByType;
export const getLeatherMaterials = MaterialService.getLeatherMaterials;
export const getHardwareMaterials = MaterialService.getHardwareMaterials;
export const getSuppliesMaterials = MaterialService.getSuppliesMaterials;
export const createMaterial = MaterialService.createMaterial;
export const createLeatherMaterial = MaterialService.createLeatherMaterial;
export const createHardwareMaterial = MaterialService.createHardwareMaterial;
export const createSuppliesMaterial = MaterialService.createSuppliesMaterial;
export const updateMaterial = MaterialService.updateMaterial;
export const updateLeatherMaterial = MaterialService.updateLeatherMaterial;
export const updateHardwareMaterial = MaterialService.updateHardwareMaterial;
export const updateSuppliesMaterial = MaterialService.updateSuppliesMaterial;
export const deleteMaterial = MaterialService.deleteMaterial;
export const batchUpdateMaterials = MaterialService.batchUpdateMaterials;
export const batchDeleteMaterials = MaterialService.batchDeleteMaterials;
export const getLowStockMaterials = MaterialService.getLowStockMaterials;
export const getMaterialsBySupplier = MaterialService.getMaterialsBySupplier;
export const getMaterialsByStorageLocation = MaterialService.getMaterialsByStorageLocation;
export const updateMaterialQuantity = MaterialService.updateMaterialQuantity;
export const importMaterials = MaterialService.importMaterials;
export const exportMaterials = MaterialService.exportMaterials;
export const downloadBlob = MaterialService.downloadBlob;