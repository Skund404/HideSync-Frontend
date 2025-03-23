// src/context/ComponentContext.tsx
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  getComponents,
  getComponentsByPatternId,
  getComponentById,
  createComponent,
  updateComponent,
  deleteComponent,
  filterComponents as filterComponentsService,
} from '../services/component-service';
import {
  getComponentMaterials,
  getComponentMaterialById,
  createComponentMaterial,
  updateComponentMaterial,
  deleteComponentMaterial,
} from '../services/component-material-service';
import { Component, ComponentFilters, ComponentMaterial } from '../types/patternTypes';
import { ApiError } from '../services/api-client';

interface ComponentContextValue {
  components: Component[];
  loading: boolean;
  error: string | null;
  getComponentById: (id: number) => Promise<Component | null>;
  getComponentsByPatternId: (patternId: number) => Promise<Component[]>;
  addComponent: (component: Omit<Component, 'id'>) => Promise<Component>;
  updateComponent: (id: number, component: Partial<Component>) => Promise<Component>;
  deleteComponent: (id: number) => Promise<boolean>;
  filterComponents: (filters: ComponentFilters) => Promise<Component[]>;
  refreshComponents: () => Promise<void>;
  // Component Material methods
  getComponentMaterials: (componentId: number) => Promise<ComponentMaterial[]>;
  getComponentMaterialById: (id: number) => Promise<ComponentMaterial | null>;
  addComponentMaterial: (material: Omit<ComponentMaterial, 'id'>) => Promise<ComponentMaterial>;
  updateComponentMaterial: (id: number, material: Partial<ComponentMaterial>) => Promise<ComponentMaterial>;
  deleteComponentMaterial: (id: number) => Promise<boolean>;
}

const ComponentContext = createContext<ComponentContextValue | undefined>(
  undefined
);

export const ComponentProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComponents();
      setComponents(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch components');
      console.error('Error fetching components:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  const handleGetComponentById = async (id: number): Promise<Component | null> => {
    try {
      return await getComponentById(id);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || `Failed to fetch component with id ${id}`);
      console.error(`Error fetching component with id ${id}:`, err);
      return null;
    }
  };

  const handleGetComponentsByPatternId = async (patternId: number): Promise<Component[]> => {
    try {
      return await getComponentsByPatternId(patternId);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || `Failed to fetch components for pattern ${patternId}`);
      console.error(`Error fetching components for pattern ${patternId}:`, err);
      return [];
    }
  };

  const handleAddComponent = async (
    component: Omit<Component, 'id'>
  ): Promise<Component> => {
    try {
      const newComponent = await createComponent(component);
      setComponents((prevComponents) => [...prevComponents, newComponent]);
      return newComponent;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to add component');
      console.error('Error adding component:', err);
      throw err;
    }
  };

  const handleUpdateComponent = async (
    id: number,
    component: Partial<Component>
  ): Promise<Component> => {
    try {
      const updatedComponent = await updateComponent(id, component);
      
      // Optimistic update
      setComponents((prevComponents) =>
        prevComponents.map((c) => (c.id === id ? updatedComponent : c))
      );
      
      return updatedComponent;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || `Failed to update component with id ${id}`);
      console.error(`Error updating component with id ${id}:`, err);
      throw err;
    }
  };

  const handleDeleteComponent = async (id: number): Promise<boolean> => {
    try {
      const success = await deleteComponent(id);
      
      // Optimistic update
      if (success) {
        setComponents((prevComponents) => prevComponents.filter((c) => c.id !== id));
      }
      
      return success;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || `Failed to delete component with id ${id}`);
      console.error(`Error deleting component with id ${id}:`, err);
      throw err;
    }
  };

  const handleFilterComponents = async (filters: ComponentFilters): Promise<Component[]> => {
    try {
      return await filterComponentsService(filters);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to filter components');
      console.error('Error filtering components:', err);
      throw err;
    }
  };

  // Component Material handlers
  const handleGetComponentMaterials = async (componentId: number): Promise<ComponentMaterial[]> => {
    try {
      return await getComponentMaterials(componentId);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || `Failed to fetch materials for component ${componentId}`);
      console.error(`Error fetching materials for component ${componentId}:`, err);
      return [];
    }
  };

  const handleGetComponentMaterialById = async (id: number): Promise<ComponentMaterial | null> => {
    try {
      return await getComponentMaterialById(id);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || `Failed to fetch component material with id ${id}`);
      console.error(`Error fetching component material with id ${id}:`, err);
      return null;
    }
  };

  const handleAddComponentMaterial = async (
    material: Omit<ComponentMaterial, 'id'>
  ): Promise<ComponentMaterial> => {
    try {
      return await createComponentMaterial(material);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to add component material');
      console.error('Error adding component material:', err);
      throw err;
    }
  };

  const handleUpdateComponentMaterial = async (
    id: number,
    material: Partial<ComponentMaterial>
  ): Promise<ComponentMaterial> => {
    try {
      return await updateComponentMaterial(id, material);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || `Failed to update component material with id ${id}`);
      console.error(`Error updating component material with id ${id}:`, err);
      throw err;
    }
  };

  const handleDeleteComponentMaterial = async (id: number): Promise<boolean> => {
    try {
      return await deleteComponentMaterial(id);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || `Failed to delete component material with id ${id}`);
      console.error(`Error deleting component material with id ${id}:`, err);
      throw err;
    }
  };

  const value: ComponentContextValue = {
    components,
    loading,
    error,
    getComponentById: handleGetComponentById,
    getComponentsByPatternId: handleGetComponentsByPatternId,
    addComponent: handleAddComponent,
    updateComponent: handleUpdateComponent,
    deleteComponent: handleDeleteComponent,
    filterComponents: handleFilterComponents,
    refreshComponents: fetchComponents,
    // Component Material methods
    getComponentMaterials: handleGetComponentMaterials,
    getComponentMaterialById: handleGetComponentMaterialById,
    addComponentMaterial: handleAddComponentMaterial,
    updateComponentMaterial: handleUpdateComponentMaterial,
    deleteComponentMaterial: handleDeleteComponentMaterial,
  };

  return (
    <ComponentContext.Provider value={value}>{children}</ComponentContext.Provider>
  );
};

export const useComponentContext = (): ComponentContextValue => {
  const context = useContext(ComponentContext);
  if (context === undefined) {
    throw new Error('useComponentContext must be used within a ComponentProvider');
  }
  return context;
};