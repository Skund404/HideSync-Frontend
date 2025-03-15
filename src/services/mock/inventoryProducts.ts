// This file contains mock data for the inventory products
import { InventoryStatus, ProjectType } from '@/types/enums';
export const MaterialStatus = InventoryStatus;
export const inventoryProducts = [
  {
    id: 1,
    name: 'Classic Bifold Wallet',
    productType: ProjectType.WALLET,
    sku: 'BFW-001',
    description:
      'Handcrafted vegetable tanned leather bifold wallet with 6 card slots and 2 cash compartments',
    materials: ['Vegetable Tanned Leather', 'Waxed Thread', 'Edge Paint'],
    color: 'Brown',
    dimensions: '4.5" x 3.5" x 0.5"',
    weight: 85, // grams
    patternId: 3,
    patternName: 'Standard Bifold Pattern',
    status: MaterialStatus.IN_STOCK, // Use enum value
    quantity: 8,
    reorderPoint: 5,
    storageLocation: 'Cabinet A-2',
    dateAdded: '2025-02-10',
    lastUpdated: '2025-03-10',
    thumbnail: '/api/placeholder/300/200',

    // Financial data
    costBreakdown: {
      materials: 24.5,
      labor: 35.0,
      overhead: 12.75,
    },
    totalCost: 72.25,
    sellingPrice: 129.99,
    profitMargin: 44.42, // percentage
    lastSold: '2025-03-05',
    salesVelocity: 3.2, // units per month

    // Project reference
    projectId: null, // Standard product, not from custom project
    batchNumber: 'B2025-02-A',

    // Custom fields
    customizations: [],
    notes: 'Bestselling model, keep well-stocked',
  },
  {
    id: 2,
    name: 'Minimalist Card Holder',
    productType: ProjectType.WALLET,
    sku: 'CH-015',
    description: 'Slim card holder with 3 card slots and center pocket',
    materials: ['Chromexcel Leather', 'Tiger Thread', 'Edge Paint'],
    color: 'Black',
    dimensions: '4" x 2.75" x 0.25"',
    weight: 35, // grams
    patternId: 8,
    patternName: 'Minimalist Card Sleeve',
    status: MaterialStatus.IN_STOCK, // Use enum value
    quantity: 15,
    reorderPoint: 8,
    storageLocation: 'Drawer B-3',
    dateAdded: '2025-01-15',
    lastUpdated: '2025-03-08',
    thumbnail: '/api/placeholder/300/200',

    // Financial data
    costBreakdown: {
      materials: 12.75,
      labor: 18.5,
      overhead: 7.25,
    },
    totalCost: 38.5,
    sellingPrice: 69.99,
    profitMargin: 44.99, // percentage
    lastSold: '2025-03-12',
    salesVelocity: 6.8, // units per month

    // Project reference
    projectId: null, // Standard product, not from custom project
    batchNumber: 'B2025-01-C',

    // Custom fields
    customizations: [],
    notes: 'High turnover product, production priority',
  },
  {
    id: 3,
    name: 'Custom Messenger Bag',
    productType: ProjectType.BAG,
    sku: 'CMB-JD-001',
    description:
      'Custom messenger bag with laptop compartment and adjustable strap',
    materials: [
      'Bridle Leather',
      'Brass Hardware',
      'Waxed Canvas',
      'Tiger Thread',
    ],
    color: 'Dark Brown / Olive',
    dimensions: '15" x 11" x 4"',
    weight: 1250, // grams
    patternId: 12,
    patternName: 'Professional Messenger Modified',
    status: MaterialStatus.IN_STOCK, // Use enum value
    quantity: 1,
    reorderPoint: 0, // Custom product
    storageLocation: 'Shelf C-1',
    dateAdded: '2025-03-02',
    lastUpdated: '2025-03-09',
    thumbnail: '/api/placeholder/300/200',

    // Financial data
    costBreakdown: {
      materials: 145.8,
      labor: 220.0,
      overhead: 55.2,
    },
    totalCost: 421.0,
    sellingPrice: 695.0,
    profitMargin: 39.42, // percentage
    lastSold: null, // Not yet sold
    salesVelocity: 0, // Custom product

    // Project reference
    projectId: 24, // Reference to the custom project
    batchNumber: null, // One-off custom product

    // Custom fields
    customizations: [
      'Monogrammed initials',
      'Custom dimensions',
      'Laptop sleeve reinforcement',
    ],
    notes: 'Custom order for J. Davis. Ready for pickup.',
  },
  {
    id: 4,
    name: 'Classic Belt',
    productType: ProjectType.BELT,
    sku: 'BLT-105',
    description: '1.5" dress belt with solid brass buckle',
    materials: ['Bridle Leather', 'Brass Buckle', 'Edge Paint'],
    color: 'Black',
    dimensions: '44" x 1.5" x 0.15"',
    weight: 180, // grams
    patternId: 5,
    patternName: 'Basic Belt Pattern',
    status: MaterialStatus.LOW_STOCK, // Use enum value
    quantity: 3,
    reorderPoint: 5,
    storageLocation: 'Rack A-4',
    dateAdded: '2025-01-22',
    lastUpdated: '2025-03-01',
    thumbnail: '/api/placeholder/300/200',

    // Financial data
    costBreakdown: {
      materials: 28.5,
      labor: 25.0,
      overhead: 10.25,
    },
    totalCost: 63.75,
    sellingPrice: 109.99,
    profitMargin: 42.04, // percentage
    lastSold: '2025-03-10',
    salesVelocity: 4.5, // units per month

    // Project reference
    projectId: null, // Standard product, not from custom project
    batchNumber: 'B2025-01-B',

    // Custom fields
    customizations: [],
    notes: 'Need to schedule production run',
  },
  {
    id: 5,
    name: 'Travel Journal Cover',
    productType: ProjectType.ACCESSORY,
    sku: 'JC-052',
    description: 'A5 leather journal cover with pen loop and pocket',
    materials: ['Pueblo Leather', 'Waxed Thread', 'Snap Closure'],
    color: 'Olive',
    dimensions: '8.5" x 6" x 0.75"',
    weight: 165, // grams
    patternId: 18,
    patternName: 'A5 Journal Wrap',
    status: MaterialStatus.IN_STOCK, // Use enum value
    quantity: 6,
    reorderPoint: 4,
    storageLocation: 'Drawer B-1',
    dateAdded: '2025-02-05',
    lastUpdated: '2025-02-28',
    thumbnail: '/api/placeholder/300/200',

    // Financial data
    costBreakdown: {
      materials: 32.25,
      labor: 40.0,
      overhead: 14.75,
    },
    totalCost: 87.0,
    sellingPrice: 149.99,
    profitMargin: 42.0, // percentage
    lastSold: '2025-03-08',
    salesVelocity: 2.8, // units per month

    // Project reference
    projectId: null, // Standard product, not from custom project
    batchNumber: 'B2025-02-B',

    // Custom fields
    customizations: [],
    notes: 'Popular gift item',
  },
  {
    id: 6,
    name: 'Laptop Sleeve',
    productType: ProjectType.CASE,
    sku: 'LS-13-025',
    description: '13" laptop sleeve with wool felt lining',
    materials: ['Vegetable Tanned Leather', 'Wool Felt', 'YKK Zipper'],
    color: 'Tan',
    dimensions: '13.5" x 9.5" x 1"',
    weight: 220, // grams
    patternId: 15,
    patternName: '13" Laptop Sleeve',
    status: MaterialStatus.OUT_OF_STOCK, // Use enum value
    quantity: 0,
    reorderPoint: 3,
    storageLocation: 'Shelf C-2',
    dateAdded: '2025-01-10',
    lastUpdated: '2025-03-05',
    thumbnail: '/api/placeholder/300/200',

    // Financial data
    costBreakdown: {
      materials: 45.5,
      labor: 50.0,
      overhead: 18.25,
    },
    totalCost: 113.75,
    sellingPrice: 189.99,
    profitMargin: 40.13, // percentage
    lastSold: '2025-03-05',
    salesVelocity: 3.2, // units per month

    // Project reference
    projectId: null, // Standard product, not from custom project
    batchNumber: 'B2025-01-A',

    // Custom fields
    customizations: [],
    notes: 'Production batch scheduled for next week',
  },
  {
    id: 7,
    name: 'Watch Strap',
    productType: ProjectType.ACCESSORY,
    sku: 'WS-20-032',
    description: '20mm watch strap with quick-release spring bars',
    materials: ['Shell Cordovan', 'Stainless Hardware', 'Edge Paint'],
    color: 'Burgundy',
    dimensions: '7.5" x 0.75" x 0.1"',
    weight: 25, // grams
    patternId: 22,
    patternName: '20mm Taper Watch Strap',
    status: MaterialStatus.IN_STOCK, // Use enum value
    quantity: 7,
    reorderPoint: 4,
    storageLocation: 'Drawer B-2',
    dateAdded: '2025-02-20',
    lastUpdated: '2025-03-01',
    thumbnail: '/api/placeholder/300/200',

    // Financial data
    costBreakdown: {
      materials: 35.75,
      labor: 30.0,
      overhead: 12.25,
    },
    totalCost: 78.0,
    sellingPrice: 129.99,
    profitMargin: 40.0, // percentage
    lastSold: '2025-03-11',
    salesVelocity: 4.0, // units per month

    // Project reference
    projectId: null, // Standard product, not from custom project
    batchNumber: 'B2025-02-C',

    // Custom fields
    customizations: [],
    notes: 'Cordovan from Horween, limited availability',
  },
  {
    id: 8,
    name: 'Custom Tote Bag',
    productType: ProjectType.BAG,
    sku: 'CTB-EM-001',
    description:
      'Large custom tote with interior zip pocket and magnetic closure',
    materials: ['Vegetable Tanned Leather', 'Brass Hardware', 'Suede Lining'],
    color: 'Natural',
    dimensions: '16" x 14" x 4.5"',
    weight: 950, // grams
    patternId: 14,
    patternName: 'Market Tote Modified',
    status: MaterialStatus.IN_STOCK, // Use enum value
    quantity: 1,
    reorderPoint: 0, // Custom product
    storageLocation: 'Shelf C-1',
    dateAdded: '2025-02-28',
    lastUpdated: '2025-03-10',
    thumbnail: '/api/placeholder/300/200',

    // Financial data
    costBreakdown: {
      materials: 125.5,
      labor: 180.0,
      overhead: 52.25,
    },
    totalCost: 357.75,
    sellingPrice: 595.0,
    profitMargin: 39.87, // percentage
    lastSold: null, // Not yet sold
    salesVelocity: 0, // Custom product

    // Project reference
    projectId: 28, // Reference to the custom project
    batchNumber: null, // One-off custom product

    // Custom fields
    customizations: [
      'Custom dimensions',
      'Monogrammed initials',
      'Additional interior pocket',
    ],
    notes: 'Custom order for E. Miller. Waiting for customer pickup.',
  },
  {
    id: 9,
    name: 'Keychain',
    productType: ProjectType.ACCESSORY,
    sku: 'KF-012',
    description: 'Leather keychain with brass snap hook',
    materials: ['Bridle Leather', 'Brass Hardware', 'Edge Paint'],
    color: 'Black',
    dimensions: '4.5" x 0.75" x 0.2"',
    weight: 30, // grams
    patternId: 7,
    patternName: 'Basic Key Fob',
    status: MaterialStatus.IN_STOCK, // Use enum value
    quantity: 22,
    reorderPoint: 10,
    storageLocation: 'Drawer B-4',
    dateAdded: '2025-01-15',
    lastUpdated: '2025-02-15',
    thumbnail: '/api/placeholder/300/200',

    // Financial data
    costBreakdown: {
      materials: 8.5,
      labor: 12.0,
      overhead: 4.25,
    },
    totalCost: 24.75,
    sellingPrice: 39.99,
    profitMargin: 38.11, // percentage
    lastSold: '2025-03-12',
    salesVelocity: 7.5, // units per month

    // Project reference
    projectId: null, // Standard product, not from custom project
    batchNumber: 'B2025-01-D',

    // Custom fields
    customizations: [],
    notes: 'Good entry-level product, often purchased as add-on',
  },
  {
    id: 10,
    name: 'Passport Holder',
    productType: ProjectType.WALLET,
    sku: 'PH-008',
    description: 'Leather passport holder with card slots',
    materials: ['Buttero Leather', 'Tiger Thread', 'Edge Paint'],
    color: 'Navy',
    dimensions: '5.5" x 4" x 0.3"',
    weight: 65, // grams
    patternId: 10,
    patternName: 'Passport Cover With Cards',
    status: MaterialStatus.LOW_STOCK, // Use enum value
    quantity: 2,
    reorderPoint: 4,
    storageLocation: 'Drawer B-1',
    dateAdded: '2025-02-10',
    lastUpdated: '2025-03-05',
    thumbnail: '/api/placeholder/300/200',

    // Financial data
    costBreakdown: {
      materials: 18.75,
      labor: 25.0,
      overhead: 8.5,
    },
    totalCost: 52.25,
    sellingPrice: 89.99,
    profitMargin: 41.94, // percentage
    lastSold: '2025-03-09',
    salesVelocity: 3.2, // units per month

    // Project reference
    projectId: null, // Standard product, not from custom project
    batchNumber: 'B2025-02-A',

    // Custom fields
    customizations: [],
    notes: 'Seasonal demand increases during summer',
  },
  {
    id: 11,
    name: 'Handcrafted Dog Collar',
    productType: ProjectType.ACCESSORY,
    sku: 'DC-M-022',
    description: 'Medium-sized leather dog collar with brass hardware',
    materials: ['Bridle Leather', 'Brass Hardware', 'Edge Paint'],
    color: 'Brown',
    dimensions: '16" x 1" x 0.2"', // Length x Width x Thickness
    weight: 85, // grams
    patternId: 25,
    patternName: 'Adjustable Dog Collar - Medium',
    status: MaterialStatus.IN_STOCK, // Use enum value
    quantity: 5,
    reorderPoint: 3,
    storageLocation: 'Drawer B-5',
    dateAdded: '2025-02-25',
    lastUpdated: '2025-03-08',
    thumbnail: '/api/placeholder/300/200',

    // Financial data
    costBreakdown: {
      materials: 22.5,
      labor: 30.0,
      overhead: 9.75,
    },
    totalCost: 62.25,
    sellingPrice: 99.99,
    profitMargin: 37.74, // percentage
    lastSold: '2025-03-10',
    salesVelocity: 2.8, // units per month

    // Project reference
    projectId: null, // Standard product, not from custom project
    batchNumber: 'B2025-02-D',

    // Custom fields
    customizations: [],
    notes: 'Also available in small and large sizes',
  },
  {
    id: 12,
    name: 'iPad Portfolio',
    productType: ProjectType.CASE,
    sku: 'IP-10-012',
    description: 'Leather portfolio case for 10.5" iPad with document pocket',
    materials: ['Vegetable Tanned Leather', 'Wool Felt', 'YKK Zipper'],
    color: 'Dark Brown',
    dimensions: '11" x 8" x 1"',
    weight: 320, // grams
    patternId: 17,
    patternName: '10.5-inch Tablet Portfolio',
    status: MaterialStatus.OUT_OF_STOCK, // Use enum value
    quantity: 0,
    reorderPoint: 2,
    storageLocation: 'Shelf C-2',
    dateAdded: '2025-01-20',
    lastUpdated: '2025-03-02',
    thumbnail: '/api/placeholder/300/200',

    // Financial data
    costBreakdown: {
      materials: 65.25,
      labor: 85.0,
      overhead: 27.5,
    },
    totalCost: 177.75,
    sellingPrice: 285.0,
    profitMargin: 37.63, // percentage
    lastSold: '2025-03-02',
    salesVelocity: 1.5, // units per month

    // Project reference
    projectId: null, // Standard product, not from custom project
    batchNumber: 'B2025-01-C',

    // Custom fields
    customizations: [],
    notes: 'Production scheduled for next month',
  },
];

// Helper function to get inventory summary data for the dashboard
export const getInventorySummary = () => {
  const total = inventoryProducts.length;
  const inStock = inventoryProducts.filter(
    (p) => p.status === MaterialStatus.IN_STOCK // Use enum value
  ).length;
  const lowStock = inventoryProducts.filter(
    (p) => p.status === MaterialStatus.LOW_STOCK // Use enum value
  ).length;
  const outOfStock = inventoryProducts.filter(
    (p) => p.status === MaterialStatus.OUT_OF_STOCK // Use enum value
  ).length;

  // Calculate total inventory value
  const totalValue = inventoryProducts.reduce((sum, product) => {
    return sum + product.quantity * product.sellingPrice;
  }, 0);

  // Calculate average profit margin
  const totalMargin = inventoryProducts.reduce((sum, product) => {
    return sum + product.profitMargin;
  }, 0);
  const averageMargin = totalMargin / total;

  return {
    totalProducts: total,
    inStock,
    lowStock,
    outOfStock,
    totalValue,
    averageMargin,
    needsReorder: inventoryProducts.filter((p) => p.quantity <= p.reorderPoint)
      .length,
  };
};

// Define mock storage locations
export const storageLocations = [
  {
    id: 'A-2',
    type: 'Cabinet',
    products: inventoryProducts.filter(
      (p) => p.storageLocation === 'Cabinet A-2'
    ),
  },
  {
    id: 'A-4',
    type: 'Rack',
    products: inventoryProducts.filter((p) => p.storageLocation === 'Rack A-4'),
  },
  {
    id: 'B-1',
    type: 'Drawer',
    products: inventoryProducts.filter(
      (p) => p.storageLocation === 'Drawer B-1'
    ),
  },
  {
    id: 'B-2',
    type: 'Drawer',
    products: inventoryProducts.filter(
      (p) => p.storageLocation === 'Drawer B-2'
    ),
  },
  {
    id: 'B-3',
    type: 'Drawer',
    products: inventoryProducts.filter(
      (p) => p.storageLocation === 'Drawer B-3'
    ),
  },
  {
    id: 'B-4',
    type: 'Drawer',
    products: inventoryProducts.filter(
      (p) => p.storageLocation === 'Drawer B-4'
    ),
  },
  {
    id: 'B-5',
    type: 'Drawer',
    products: inventoryProducts.filter(
      (p) => p.storageLocation === 'Drawer B-5'
    ),
  },
  {
    id: 'C-1',
    type: 'Shelf',
    products: inventoryProducts.filter(
      (p) => p.storageLocation === 'Shelf C-1'
    ),
  },
  {
    id: 'C-2',
    type: 'Shelf',
    products: inventoryProducts.filter(
      (p) => p.storageLocation === 'Shelf C-2'
    ),
  },
];
