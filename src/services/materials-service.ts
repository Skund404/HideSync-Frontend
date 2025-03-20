// src/services/materials-service.ts
import { apiClient } from './api-client';

// Replace with your actual Material types
interface Material {
  id: number;
  name: string;
  materialType: string;
  description?: string;
  unit: string;
  quantity: number;
  quality: string;
  supplier?: string;
  notes?: string;
}

const BASE_URL = '/materials';

export const getMaterials = async (
  skip: number = 0,
  limit: number = 100,
  materialType?: string
): Promise<Material[]> => {
  let url = `${BASE_URL}/?skip=${skip}&limit=${limit}`;

  if (materialType) {
    url += `&material_type=${materialType}`;
  }

  const response = await apiClient.get<Material[]>(url);
  return response.data;
};

export const getMaterial = async (id: number): Promise<Material> => {
  const response = await apiClient.get<Material>(`${BASE_URL}/${id}`);
  return response.data;
};
