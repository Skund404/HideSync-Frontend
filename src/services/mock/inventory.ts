// Mock data for inventory status
export default {
  lowStock: [
    { id: 4, name: "Edge Paint - Black", currentStock: 3, reorderPoint: 5 },
    { id: 7, name: "Waxed Thread - Brown", currentStock: 2, reorderPoint: 5 },
    { id: 12, name: "Dye - Mahogany", currentStock: 1, reorderPoint: 3 },
  ],
  materialUsage: [
    { name: "Vegetable Tan Leather", usage: 42 },
    { name: "Waxed Thread", usage: 28 },
    { name: "Hardware", usage: 15 },
    { name: "Dye", usage: 8 },
    { name: "Edge Paint", usage: 7 },
  ],
  recentTransactions: [
    {
      id: 1,
      date: "2025-03-12",
      type: "usage",
      material: "Vegetable Tan Leather",
      quantity: 4,
      project: "Custom Messenger Bag",
    },
    {
      id: 2,
      date: "2025-03-12",
      type: "restock",
      material: "Brass Buckles - 1 inch",
      quantity: 50,
      supplier: "Hardware Emporium",
    },
    {
      id: 3,
      date: "2025-03-11",
      type: "usage",
      material: "Waxed Thread - Brown",
      quantity: 1,
      project: "Leather Wallet Set",
    },
  ],
};
