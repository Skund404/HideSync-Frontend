// Mock data for dashboard
export default {
  activeProjects: 12,
  pendingOrders: 8,
  materialsToReorder: 5,
  upcomingDeadlines: [
    {
      id: 1,
      name: "Custom Belt",
      customer: "M. Williams",
      dueDate: "2025-03-15",
      status: "priority",
      completionPercentage: 75,
    },
    {
      id: 2,
      name: "Travel Wallet Set",
      customer: "K. Lee",
      dueDate: "2025-03-18",
      status: "in_progress",
      completionPercentage: 45,
    },
    {
      id: 3,
      name: "Material Order - Thread & Dye",
      customer: null,
      dueDate: "2025-03-20",
      status: "not_started",
      completionPercentage: 0,
    },
  ],
  recentActivity: [
    {
      id: 1,
      type: "project_completed",
      title: "Project Completed: Custom Messenger Bag",
      description: "Finished ahead of schedule - ready for customer pickup",
      timestamp: "2025-03-13T10:45:00Z",
    },
    {
      id: 2,
      type: "new_order",
      title: "New Order: Handcrafted Wallet",
      description: "Customer: Emily Johnson - $89.99",
      timestamp: "2025-03-12T15:30:00Z",
    },
    {
      id: 3,
      type: "material_delivery",
      title: "Material Delivery: Vegetable Tan Leather",
      description: "5 sq ft added to inventory - Location: Shelf A3",
      timestamp: "2025-03-12T11:15:00Z",
    },
    {
      id: 4,
      type: "pattern_added",
      title: "New Pattern Added: Minimalist Card Holder",
      description: "3 components, 2 materials required",
      timestamp: "2025-03-11T14:20:00Z",
    },
  ],
  materialStockSummary: [
    { name: "Vegetable Tan Leather", percentage: 62, status: "medium" },
    { name: "Brass Hardware", percentage: 89, status: "good" },
    { name: "Waxed Thread", percentage: 18, status: "low" },
    { name: "Dye (Brown)", percentage: 12, status: "low" },
    { name: "Snaps and Rivets", percentage: 35, status: "medium" },
  ],
  projectTimeline: {
    upcoming: 4,
    inProgress: 7,
    completed: 32,
  },
};
