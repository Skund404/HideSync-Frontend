// src/context/ComponentContext.tsx
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { EnumTypes } from '../types';
import {
  Component,
  ComponentFilters,
  ComponentMaterial,
} from '../types/patternTypes';

// Sample mock data for components
const mockComponents: Component[] = [
  {
    id: 1,
    patternId: 1,
    name: 'Front Panel',
    description: 'Main front panel of the wallet',
    componentType: EnumTypes.ComponentType.PANEL,
    attributes: { width: 8, height: 4, cornerRadius: 0.25 },
    pathData: 'M 10,10 L 90,10 L 90,90 L 10,90 Z',
    position: { x: 50, y: 50 },
    rotation: 0,
    isOptional: false,
    createdAt: new Date(),
    modifiedAt: new Date(),
    authorName: 'John Doe',
  },
  {
    id: 2,
    patternId: 1,
    name: 'Back Panel',
    description: 'Main back panel of the wallet',
    componentType: EnumTypes.ComponentType.PANEL,
    attributes: { width: 8, height: 4, cornerRadius: 0 },
    pathData: 'M 100,100 L 180,100 L 180,180 L 100,180 Z',
    position: { x: 150, y: 150 },
    rotation: 0,
    isOptional: false,
    createdAt: new Date(),
    modifiedAt: new Date(),
    authorName: 'John Doe',
  },
  {
    id: 3,
    patternId: 1,
    name: 'Card Pocket',
    description: 'Inner pocket for cards',
    componentType: EnumTypes.ComponentType.POCKET,
    attributes: { width: 6, height: 3.5, depth: 0.25 },
    pathData: 'M 200,50 L 260,50 L 260,95 L 200,95 Z',
    position: { x: 220, y: 70 },
    rotation: 0,
    isOptional: false,
    createdAt: new Date(),
    modifiedAt: new Date(),
    authorName: 'Jane Smith',
  },
  {
    id: 4,
    patternId: 2, // Different pattern ID
    name: 'Handle',
    description: 'Bag handle component',
    componentType: EnumTypes.ComponentType.STRAP,
    attributes: { length: 12, width: 1, thickness: 0.125 },
    pathData: 'M 300,150 Q 350,100 400,150',
    position: { x: 350, y: 150 },
    rotation: 0,
    isOptional: false,
    createdAt: new Date(),
    modifiedAt: new Date(),
    authorName: 'Jane Smith',
  },
];

// Sample mock data for component materials
const mockComponentMaterials: ComponentMaterial[] = [
  {
    id: 1,
    componentId: 1,
    materialId: 101,
    materialType: EnumTypes.MaterialType.LEATHER,
    quantity: 0.5,
    unit: EnumTypes.MeasurementUnit.SQUARE_FOOT,
    isRequired: true,
    notes: 'Use veg-tanned leather for best results',
  },
  {
    id: 2,
    componentId: 2,
    materialId: 101,
    materialType: EnumTypes.MaterialType.LEATHER,
    quantity: 0.5,
    unit: EnumTypes.MeasurementUnit.SQUARE_FOOT,
    isRequired: true,
  },
  {
    id: 3,
    componentId: 3,
    materialId: 102,
    materialType: EnumTypes.MaterialType.LEATHER,
    quantity: 0.25,
    unit: EnumTypes.MeasurementUnit.SQUARE_FOOT,
    isRequired: true,
    notes: 'Thinner leather recommended (2-3oz)',
  },
];

interface ComponentContextValue {
  components: Component[];
  loading: boolean;
  error: string | null;
  getComponentById: (id: number) => Component | undefined;
  getComponentsByPatternId: (patternId: number) => Component[];
  addComponent: (component: Omit<Component, 'id'>) => Promise<Component>;
  updateComponent: (
    id: number,
    component: Partial<Component>
  ) => Promise<Component>;
  deleteComponent: (id: number) => Promise<boolean>;
  filterComponents: (filters: ComponentFilters) => Component[];
  getComponentMaterials: (componentId: number) => Promise<ComponentMaterial[]>;
  addComponentMaterial: (
    material: Omit<ComponentMaterial, 'id'>
  ) => Promise<ComponentMaterial>;
  updateComponentMaterial: (
    id: number,
    material: Partial<ComponentMaterial>
  ) => Promise<ComponentMaterial>;
  deleteComponentMaterial: (id: number) => Promise<boolean>;
}

const ComponentContext = createContext<ComponentContextValue | undefined>(
  undefined
);

export const ComponentProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [components, setComponents] = useState<Component[]>(mockComponents);
  const [materials, setMaterials] = useState<ComponentMaterial[]>(
    mockComponentMaterials
  );
  const [loading] = useState<boolean>(false);
  const [error] = useState<string | null>(null);

  const getComponentById = (id: number): Component | undefined => {
    return components.find((c) => c.id === id);
  };

  const getComponentsByPatternId = (patternId: number): Component[] => {
    return components.filter((c) => c.patternId === patternId);
  };

  const addComponent = async (
    component: Omit<Component, 'id'>
  ): Promise<Component> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newComponent: Component = {
      ...component,
      id: Math.max(...components.map((c) => c.id), 0) + 1,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    setComponents((prev) => [...prev, newComponent]);
    return newComponent;
  };

  const updateComponent = async (
    id: number,
    component: Partial<Component>
  ): Promise<Component> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = components.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Component with ID ${id} not found`);
    }

    const updatedComponent: Component = {
      ...components[index],
      ...component,
      modifiedAt: new Date(),
    };

    const updatedComponents = [...components];
    updatedComponents[index] = updatedComponent;
    setComponents(updatedComponents);

    return updatedComponent;
  };

  const deleteComponent = async (id: number): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = components.findIndex((c) => c.id === id);
    if (index === -1) {
      return false;
    }

    setComponents((prev) => prev.filter((c) => c.id !== id));
    // Also delete related materials
    setMaterials((prev) => prev.filter((m) => m.componentId !== id));

    return true;
  };

  const filterComponents = (filters: ComponentFilters): Component[] => {
    return components.filter((component) => {
      // Filter by pattern ID if specified
      if (
        filters.patternId !== undefined &&
        component.patternId !== filters.patternId
      ) {
        return false;
      }

      // Filter by component type if specified
      if (
        filters.componentType !== undefined &&
        component.componentType !== filters.componentType
      ) {
        return false;
      }

      // Filter by search query if specified
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          component.name.toLowerCase().includes(query) ||
          component.description.toLowerCase().includes(query)
        );
      }

      // Filter by materials if specified
      if (filters.hasMaterials) {
        const hasMaterials = materials.some(
          (m) => m.componentId === component.id
        );
        return hasMaterials === filters.hasMaterials;
      }

      return true;
    });
  };

  const getComponentMaterials = async (
    componentId: number
  ): Promise<ComponentMaterial[]> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    return materials.filter((m) => m.componentId === componentId);
  };

  const addComponentMaterial = async (
    material: Omit<ComponentMaterial, 'id'>
  ): Promise<ComponentMaterial> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newMaterial: ComponentMaterial = {
      ...material,
      id: Math.max(...materials.map((m) => m.id), 0) + 1,
    };

    setMaterials((prev) => [...prev, newMaterial]);
    return newMaterial;
  };

  const updateComponentMaterial = async (
    id: number,
    material: Partial<ComponentMaterial>
  ): Promise<ComponentMaterial> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = materials.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new Error(`Component material with ID ${id} not found`);
    }

    const updatedMaterial: ComponentMaterial = {
      ...materials[index],
      ...material,
    };

    const updatedMaterials = [...materials];
    updatedMaterials[index] = updatedMaterial;
    setMaterials(updatedMaterials);

    return updatedMaterial;
  };

  const deleteComponentMaterial = async (id: number): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = materials.findIndex((m) => m.id === id);
    if (index === -1) {
      return false;
    }

    setMaterials((prev) => prev.filter((m) => m.id !== id));
    return true;
  };

  const value: ComponentContextValue = {
    components,
    loading,
    error,
    getComponentById,
    getComponentsByPatternId,
    addComponent,
    updateComponent,
    deleteComponent,
    filterComponents,
    getComponentMaterials,
    addComponentMaterial,
    updateComponentMaterial,
    deleteComponentMaterial,
  };

  return (
    <ComponentContext.Provider value={value}>
      {children}
    </ComponentContext.Provider>
  );
};

export const useComponentContext = (): ComponentContextValue => {
  const context = useContext(ComponentContext);
  if (context === undefined) {
    throw new Error(
      'useComponentContext must be used within a ComponentProvider'
    );
  }
  return context;
};
