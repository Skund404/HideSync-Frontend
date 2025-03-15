// src/services/mock/components.ts

import { EnumTypes } from '../../types';
import { Component, ComponentMaterial } from '../../types/patternTypes';

// Sample components data
const componentsData: Component[] = [
  {
    id: 1,
    patternId: 1, // Assuming this matches a pattern ID in your system
    name: 'Front Panel',
    description: 'Exterior front panel of the wallet',
    componentType: EnumTypes.ComponentType.PANEL,
    attributes: {
      width: 105,
      height: 85,
      thickness: 2.5,
      corners: 'rounded',
      cornerRadius: 5,
    },
    pathData: 'M 10,10 L 115,10 L 115,95 L 10,95 Z',
    position: { x: 10, y: 10 },
    rotation: 0,
    isOptional: false,
    createdAt: new Date('2025-01-20'),
    modifiedAt: new Date('2025-02-22'),
    authorName: 'John Doe',
  },
  {
    id: 2,
    patternId: 1,
    name: 'Back Panel',
    description: 'Exterior back panel of the wallet',
    componentType: EnumTypes.ComponentType.PANEL,
    attributes: {
      width: 105,
      height: 85,
      thickness: 2.5,
      corners: 'rounded',
      cornerRadius: 5,
    },
    pathData: 'M 130,10 L 235,10 L 235,95 L 130,95 Z',
    position: { x: 130, y: 10 },
    rotation: 0,
    isOptional: false,
    createdAt: new Date('2025-01-20'),
    modifiedAt: new Date('2025-02-22'),
    authorName: 'John Doe',
  },
  {
    id: 3,
    patternId: 1,
    name: 'Card Pocket - Left',
    description: 'Left card pocket that holds 2 cards',
    componentType: EnumTypes.ComponentType.POCKET,
    attributes: {
      width: 100,
      height: 70,
      thickness: 1.0,
      corners: 'rounded',
      cornerRadius: 3,
      capacity: '2 cards',
    },
    pathData: 'M 10,110 L 110,110 L 110,180 L 10,180 Z',
    position: { x: 10, y: 110 },
    rotation: 0,
    isOptional: false,
    createdAt: new Date('2025-01-20'),
    modifiedAt: new Date('2025-02-22'),
    authorName: 'John Doe',
  },
  {
    id: 4,
    patternId: 1,
    name: 'Cash Divider',
    description: 'Center divider for separating cash',
    componentType: EnumTypes.ComponentType.DIVIDER,
    attributes: {
      width: 210,
      height: 75,
      thickness: 0.8,
      corners: 'rounded',
      cornerRadius: 3,
    },
    pathData: 'M 10,285 L 220,285 L 220,360 L 10,360 Z',
    position: { x: 10, y: 285 },
    rotation: 0,
    isOptional: false,
    createdAt: new Date('2025-01-20'),
    modifiedAt: new Date('2025-02-22'),
    authorName: 'John Doe',
  },
];

// Sample component materials data
const componentMaterialsData: ComponentMaterial[] = [
  {
    id: 1,
    componentId: 1,
    materialId: 1, // Assuming this is a leather material
    materialType: EnumTypes.MaterialType.LEATHER,
    quantity: 0.1,
    unit: EnumTypes.MeasurementUnit.SQUARE_FOOT,
    isRequired: true,
    notes: 'Use premium vegetable tanned leather for best results',
  },
  {
    id: 2,
    componentId: 2,
    materialId: 1,
    materialType: EnumTypes.MaterialType.LEATHER,
    quantity: 0.1,
    unit: EnumTypes.MeasurementUnit.SQUARE_FOOT,
    isRequired: true,
    notes: 'Use premium vegetable tanned leather for best results',
  },
  {
    id: 3,
    componentId: 3,
    materialId: 2, // Assuming this is a thinner leather
    materialType: EnumTypes.MaterialType.LEATHER,
    quantity: 0.05,
    unit: EnumTypes.MeasurementUnit.SQUARE_FOOT,
    isRequired: true,
    notes: 'Thinner leather works best for pockets',
  },
];

// Simulate async API calls
export const getComponents = (): Promise<Component[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...componentsData]), 300);
  });
};

export const getComponentsByPatternId = (
  patternId: number
): Promise<Component[]> => {
  return new Promise((resolve) => {
    const filteredComponents = componentsData.filter(
      (c) => c.patternId === patternId
    );
    setTimeout(() => resolve([...filteredComponents]), 300);
  });
};

export const getComponentById = (id: number): Promise<Component | null> => {
  return new Promise((resolve) => {
    const component = componentsData.find((c) => c.id === id);
    setTimeout(() => resolve(component || null), 300);
  });
};

export const addComponent = (
  component: Omit<Component, 'id'>
): Promise<Component> => {
  return new Promise((resolve) => {
    const newComponent = {
      ...component,
      id: Math.max(...componentsData.map((c) => c.id), 0) + 1,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };
    componentsData.push(newComponent as Component);
    setTimeout(() => resolve(newComponent as Component), 300);
  });
};

export const updateComponent = (
  id: number,
  component: Partial<Component>
): Promise<Component> => {
  return new Promise((resolve, reject) => {
    const index = componentsData.findIndex((c) => c.id === id);
    if (index === -1) {
      reject(new Error(`Component with id ${id} not found`));
      return;
    }

    const updatedComponent = {
      ...componentsData[index],
      ...component,
      modifiedAt: new Date(),
    };
    componentsData[index] = updatedComponent;
    setTimeout(() => resolve(updatedComponent), 300);
  });
};

export const deleteComponent = (id: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const index = componentsData.findIndex((c) => c.id === id);
    if (index === -1) {
      reject(new Error(`Component with id ${id} not found`));
      return;
    }

    componentsData.splice(index, 1);
    setTimeout(() => resolve(true), 300);
  });
};

// ComponentMaterial operations
export const getComponentMaterials = (
  componentId: number
): Promise<ComponentMaterial[]> => {
  return new Promise((resolve) => {
    const materials = componentMaterialsData.filter(
      (cm) => cm.componentId === componentId
    );
    setTimeout(() => resolve([...materials]), 300);
  });
};

export const getComponentMaterialById = (
  id: number
): Promise<ComponentMaterial | null> => {
  return new Promise((resolve) => {
    const material = componentMaterialsData.find((cm) => cm.id === id);
    setTimeout(() => resolve(material || null), 300);
  });
};

export const addComponentMaterial = (
  material: Omit<ComponentMaterial, 'id'>
): Promise<ComponentMaterial> => {
  return new Promise((resolve) => {
    const newMaterial = {
      ...material,
      id: Math.max(...componentMaterialsData.map((cm) => cm.id), 0) + 1,
    };
    componentMaterialsData.push(newMaterial as ComponentMaterial);
    setTimeout(() => resolve(newMaterial as ComponentMaterial), 300);
  });
};

export const updateComponentMaterial = (
  id: number,
  material: Partial<ComponentMaterial>
): Promise<ComponentMaterial> => {
  return new Promise((resolve, reject) => {
    const index = componentMaterialsData.findIndex((cm) => cm.id === id);
    if (index === -1) {
      reject(new Error(`Component material with id ${id} not found`));
      return;
    }

    const updatedMaterial = {
      ...componentMaterialsData[index],
      ...material,
    };
    componentMaterialsData[index] = updatedMaterial;
    setTimeout(() => resolve(updatedMaterial), 300);
  });
};

export const deleteComponentMaterial = (id: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const index = componentMaterialsData.findIndex((cm) => cm.id === id);
    if (index === -1) {
      reject(new Error(`Component material with id ${id} not found`));
      return;
    }

    componentMaterialsData.splice(index, 1);
    setTimeout(() => resolve(true), 300);
  });
};
