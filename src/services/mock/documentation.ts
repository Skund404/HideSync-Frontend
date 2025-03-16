// src/services/mock/documentation.ts

import {
  CategoryDefinition,
  DocumentationCategory,
  DocumentationResource,
  ResourceType,
  SkillLevel,
} from '../../types/documentationTypes';

// Sample documentation resources
export const documentationResources: DocumentationResource[] = [
  {
    id: 'getting-started-overview',
    title: 'HideSync Overview',
    description: 'Introduction to HideSync and its core components',
    content: `# Welcome to HideSync

HideSync is a specialized ERP system designed for small leatherworking businesses. This guide will help you understand the key components and features of the system.

## Core Modules

### 1. Materials Management
Track leather, hardware, thread, and other supplies with detailed information about thickness, color, and quantity.

### 2. Inventory Management
Manage finished products with multiple view options:
- Grid view for visual scanning
- List view for detailed information
- Storage view to track physical location
- Financial view for cost analysis

### 3. Projects & Patterns
Create and manage patterns and projects, with tools for:
- Pattern creation and storage
- Project planning and tracking
- Material requirements calculation
- Time and cost estimation

### 4. Sales & Customer Management
Track orders, customer information, and sales history with features for:
- Customer profiles
- Order management
- Payment tracking
- Delivery status

## Getting Started

To begin using HideSync:

1. Explore the dashboard for an overview of your business
2. Set up your materials inventory
3. Configure your storage locations
4. Create patterns for your products
5. Start tracking projects and sales

Need help? Use the documentation search or contextual help buttons throughout the application.`,
    category: DocumentationCategory.GETTING_STARTED,
    type: ResourceType.GUIDE,
    skillLevel: SkillLevel.BEGINNER,
    tags: ['overview', 'basics'],
    relatedResources: ['inventory-overview', 'materials-overview'],
    lastUpdated: '2025-03-10',
    author: 'HideSync Team',
    contextualHelpKeys: ['dashboard', 'home'],
  },
  {
    id: 'how-to-use-documentation',
    title: 'How to Use the Documentation System',
    description:
      'A complete guide to navigating and using the HideSync documentation system',
    content: `# How to Use the HideSync Documentation System

## Overview

The HideSync documentation system provides comprehensive information about all aspects of the application. This guide will help you navigate the system effectively.

## Documentation Interface

The documentation system is organized into several key sections:

### Main Navigation

![Documentation Navigation](/api/placeholder/600/300)

1. **Search Bar**: Located at the top of the page, allows you to search across all documentation
2. **Categories Panel**: On the left side, shows all documentation categories
3. **Content View**: The main area displaying the current documentation
4. **View Tabs**: Toggle between Articles and Videos views

### Content Types

The documentation includes various types of content:

- **Guides**: Step-by-step instructions for specific tasks
- **Tutorials**: Comprehensive learning resources with examples
- **References**: Detailed technical information
- **Workflows**: End-to-end process documentation
- **Videos**: Visual demonstrations of techniques and features

## Finding Information

### Using Search

The search function helps you quickly find specific information:

1. Click in the search bar at the top of the page
2. Type keywords related to what you're looking for
3. Press Enter to see search results
4. Click on any result to view the full content

### Browsing Categories

To browse documentation by category:

1. Navigate to the category panel on the left side
2. Click on a category to view its contents
3. Sub-categories will expand when clicked

### Video Library

To access video tutorials:

1. Click the "Videos" tab at the top of the documentation page
2. Browse videos by category or use the search function
3. Click on a video thumbnail to play it

## Using Documentation Features

### Contextual Help

Throughout the application, you'll find help buttons that provide context-specific documentation:

1. Look for question mark icons (?) in the application
2. Click these icons to open relevant documentation in a popup
3. You can expand to the full documentation view if needed

### Printable Guides

For workshop reference, you can print documentation:

1. Navigate to the documentation you want to print
2. Click the "Print" button at the top of the page
3. Select your print preferences in the dialog
4. The system will generate a print-optimized version

### Offline Access

To use documentation without internet access:

1. Navigate to the documentation you want to save
2. Click the "Save Offline" button
3. The content will be stored in your browser for offline access
4. Access saved content from the "Offline Guides" section

## Best Practices

- **Bookmark Frequently Used Pages**: Use your browser's bookmark feature for quick access
- **Use Keyboard Shortcuts**: Press '/' to focus the search bar from anywhere in the documentation
- **Check Related Resources**: At the bottom of each article, you'll find links to related content
- **Watch Video Tutorials**: For techniques that are hard to explain in text, check for video demonstrations

@[youtube](dQw4w9WgXcQ "Documentation System Overview")

## Getting Help

If you can't find what you're looking for or have suggestions for improving the documentation:

1. Click the "Feedback" button at the bottom of any documentation page
2. Fill out the form with your question or suggestion
3. The HideSync team will review and respond to your feedback`,
    category: DocumentationCategory.GETTING_STARTED,
    type: ResourceType.GUIDE,
    skillLevel: SkillLevel.BEGINNER,
    tags: ['documentation', 'help', 'navigation'],
    relatedResources: ['getting-started-overview'],
    lastUpdated: '2025-03-15',
    author: 'HideSync Team',
    contextualHelpKeys: ['documentation', 'help'],
    videos: [
      {
        videoId: 'dQw4w9WgXcQ',
        title: 'Documentation System Overview',
        description:
          'A walkthrough of the HideSync documentation system features',
        thumbnailQuality: 'high',
        duration: '5:20',
      },
    ],
  },
  {
    id: 'inventory-grid-view',
    title: 'Using the Inventory Grid View',
    description: 'How to effectively use the grid view in inventory management',
    content: `# Inventory Grid View

The grid view provides a visual card-based layout of your inventory items, making it easy to scan through your products quickly.

## Accessing Grid View

1. Navigate to the Inventory Management section from the main sidebar
2. If not already selected, click the "Grid" view option in the view selector

## Grid View Features

### Card Layout

Each product in your inventory is displayed as a card with the following information:

- Product image (if available)
- Product name and SKU
- Current stock level with visual indicator
- Price information
- Storage location
- Quick action buttons

### Visual Indicators

The grid view uses visual cues to help you quickly identify product status:

- **Green**: In stock, healthy inventory levels
- **Yellow**: Low stock, approaching reorder point
- **Red**: Out of stock or below minimum threshold
- **Gray**: Discontinued or inactive products

### Sorting and Filtering

Above the grid, you'll find controls to:

- Filter by product type, status, or storage location
- Sort by name, price, stock level, or other attributes
- Toggle between compact and expanded card views

### Quick Actions

Each card includes buttons for common actions:

- View detailed information
- Edit product details
- Adjust stock levels
- Print product labels or tags

## Best Practices

- Use grid view for visual scanning of your inventory
- Switch to list view when you need to see more detailed information
- Use filters to focus on specific product categories or stock status
- Regularly check for low stock indicators to manage reordering

## Related Features

- **List View**: For detailed tabular information
- **Storage View**: For location-based inventory management
- **Financial View**: For cost and margin analysis`,
    category: DocumentationCategory.INVENTORY,
    type: ResourceType.TUTORIAL,
    skillLevel: SkillLevel.BEGINNER,
    tags: ['inventory', 'grid view', 'ui'],
    relatedResources: ['inventory-list-view', 'inventory-financial-view'],
    lastUpdated: '2025-03-12',
    author: 'HideSync Team',
    contextualHelpKeys: ['inventory-grid', 'inventory-management'],
  },
  {
    id: 'saddle-stitching-technique',
    title: 'Saddle Stitching Technique',
    description: 'Learn proper saddle stitching for durable leather projects',
    content: `# Saddle Stitching Technique

Saddle stitching is one of the most important skills in leatherworking. Unlike machine stitching, saddle stitching creates a durable seam that won't unravel if a stitch breaks.

## Video Demonstration

@[youtube](dYigNTbvY8g "Saddle Stitch Demonstration")

Follow along with this demonstration to learn the proper technique.

## Tools You'll Need

- **Stitching Needles**: Two needles of appropriate size
- **Thread**: Waxed thread suitable for your project
- **Stitching Chisels/Pricking Irons**: For creating evenly spaced holes
- **Stitching Pony**: To hold the leather while stitching
- **Awl**: For widening or aligning holes if needed
- **Edge Beveler**: For preparing edges before stitching

## Basic Technique

1. **Prepare the leather**: Mark your stitch line and use an edge beveler if stitching along an edge
2. **Create holes**: Use stitching chisels or pricking irons to create evenly spaced holes
3. **Set up thread**: Cut thread to appropriate length (3-4 times the stitch line) and attach needles
4. **Secure the leather**: Place leather in stitching pony with holes accessible
5. **Begin stitching**: Start by pulling equal amounts of thread through the first hole
6. **Create the stitch pattern**: Pass each needle through subsequent holes in alternating fashion
7. **Maintain tension**: Keep tension consistent throughout for an even appearance
8. **Finish the stitching**: Use a backstitch technique to secure the end of the seam

## Common Mistakes

Here are some common mistakes to avoid:

* **Uneven tension**: Results in sloppy-looking stitches
* **Inconsistent spacing**: Creates an unprofessional appearance
* **Incorrect thread size**: Use appropriate thread for the project weight
* **Improper thread preparation**: Thread should be properly waxed
* **Wrong needle size**: Match needle size to thread and hole size

## Advanced Tips

@[youtube](WJ0y7YM-8L8 "Thread Tension Tips")

These advanced tips will help improve your stitching quality:

* Cast the thread to prevent twisting
* Use beeswax to condition and strengthen the thread
* For thick leather, use an awl to widen holes as needed
* Keep your hands clean to avoid soiling the leather
* Create a "saddle stitch rhythm" to maintain consistency

## Practice Projects

To master saddle stitching, try these practice projects:

1. Simple card holder
2. Key fob
3. Small wallet
4. Notebook cover

Remember that saddle stitching is a fundamental technique in leatherworking. Taking the time to master it will significantly improve the quality and longevity of your projects.`,
    category: DocumentationCategory.TECHNIQUES,
    type: ResourceType.TUTORIAL,
    skillLevel: SkillLevel.BEGINNER,
    tags: ['stitching', 'techniques', 'beginner'],
    relatedResources: ['thread-selection-guide'],
    lastUpdated: '2025-03-10',
    author: 'HideSync Team',
    contextualHelpKeys: ['stitching', 'leather-techniques'],
    videos: [
      {
        videoId: 'dYigNTbvY8g',
        title: 'Saddle Stitch Demonstration',
        description: 'Complete demonstration of the saddle stitch technique',
        thumbnailQuality: 'high',
        duration: '12:45',
      },
      {
        videoId: 'WJ0y7YM-8L8',
        title: 'Thread Tension Tips',
        description: 'How to maintain proper tension during stitching',
        startTime: 75,
        thumbnailQuality: 'high',
        duration: '8:32',
      },
    ],
  },
  {
    id: 'materials-management-overview',
    title: 'Materials Management Overview',
    description: 'Understanding the materials management system in HideSync',
    content: `# Materials Management Overview

The Materials Management module in HideSync helps you track, organize, and manage all the materials used in your leatherworking projects.

## Key Features

### Material Types

HideSync supports various material types:

- **Leather**: Track different leather types, thicknesses, and tannages
- **Hardware**: Manage buckles, rivets, snaps, and other metal components
- **Thread**: Keep track of thread types, colors, and thicknesses
- **Supplies**: Monitor adhesives, dyes, finishes, and other consumables

### Inventory Tracking

The system provides real-time visibility into your material inventory:

- Current stock levels
- Low stock alerts based on custom thresholds
- Usage history and trends
- Storage location tracking

### Material Sourcing

Keep track of where your materials come from:

- Supplier information
- Purchase history
- Cost tracking
- Quality notes

### Integration with Other Modules

Materials Management connects with other HideSync modules:

- **Projects**: Associate materials with specific projects
- **Patterns**: Link materials to pattern components
- **Purchases**: Track material acquisition
- **Storage**: Manage where materials are stored

## Getting Started

To begin using Materials Management:

1. **Add your materials**: Create entries for each material type
2. **Set up categories**: Organize materials logically
3. **Define storage locations**: Track where materials are kept
4. **Set thresholds**: Configure reorder points for critical items

## Common Tasks

### Adding a New Material

1. Navigate to Materials Management
2. Click "Add Material"
3. Select the material type
4. Fill in the required information
5. Set inventory quantities and thresholds
6. Assign storage location
7. Save the new material

### Managing Inventory

1. Regularly update stock levels
2. Process incoming shipments
3. Record material usage in projects
4. Conduct periodic inventory counts
5. Review low stock alerts

## Best Practices

- **Consistent Naming**: Use a logical naming convention
- **Complete Information**: Fill in all relevant details for each material
- **Regular Updates**: Keep inventory levels current
- **Storage Organization**: Use the storage system to locate materials easily
- **Quality Notes**: Record any issues or special characteristics

## Next Steps

Once you've set up your materials:

- Create patterns that use these materials
- Set up projects with material requirements
- Generate picking lists for efficient material gathering
- Track material usage to identify trends and forecast needs`,
    category: DocumentationCategory.MATERIALS,
    type: ResourceType.GUIDE,
    skillLevel: SkillLevel.BEGINNER,
    tags: ['materials', 'inventory', 'basics'],
    relatedResources: ['leather-material-guide', 'hardware-types'],
    lastUpdated: '2025-03-14',
    author: 'HideSync Team',
    contextualHelpKeys: ['materials', 'materials-management'],
  },
];

// Sample categories with hierarchy
export const documentationCategories: CategoryDefinition[] = [
  {
    id: DocumentationCategory.GETTING_STARTED,
    name: 'Getting Started',
    description: 'Introduction to HideSync and basic setup guides',
    icon: 'book-open',
    resources: ['getting-started-overview', 'how-to-use-documentation'],
  },
  {
    id: DocumentationCategory.INVENTORY,
    name: 'Inventory Management',
    description: 'Guides for managing your product inventory',
    icon: 'package',
    resources: ['inventory-grid-view'],
  },
  {
    id: DocumentationCategory.MATERIALS,
    name: 'Materials Management',
    description: 'Information about managing leather, hardware, and supplies',
    icon: 'layers',
    resources: ['materials-management-overview'],
  },
  {
    id: DocumentationCategory.TECHNIQUES,
    name: 'Leatherworking Techniques',
    description: 'Guides and tutorials for leatherworking methods',
    icon: 'tool',
    resources: ['saddle-stitching-technique'],
  },
];

// Get resources from localStorage or fallback to mock data
export const getDocumentationResources = () => {
  return new Promise<DocumentationResource[]>((resolve) => {
    try {
      const storedResources = localStorage.getItem(
        'hidesync_documentation_resources'
      );
      if (storedResources) {
        resolve(JSON.parse(storedResources));
      } else {
        // Initialize localStorage with mock data if not already present
        localStorage.setItem(
          'hidesync_documentation_resources',
          JSON.stringify(documentationResources)
        );
        resolve(documentationResources);
      }
    } catch (error) {
      console.error('Error retrieving resources from localStorage:', error);
      resolve(documentationResources);
    }
  });
};

export const getDocumentationCategories = () => {
  return Promise.resolve(documentationCategories);
};

export const getResourceById = (id: string) => {
  return new Promise<DocumentationResource | null>(async (resolve) => {
    try {
      const resources = await getDocumentationResources();
      const resource = resources.find((r) => r.id === id);
      resolve(resource || null);
    } catch (error) {
      console.error('Error finding resource by ID:', error);
      // Fallback to in-memory search
      const resource = documentationResources.find((r) => r.id === id);
      resolve(resource || null);
    }
  });
};

export const searchDocumentation = (query: string, filters: any = {}) => {
  // Search in localStorage resources if available
  return new Promise(async (resolve) => {
    try {
      const resources = await getDocumentationResources();

      // Simple search implementation
      const results = resources.filter((resource) => {
        const matchesQuery =
          !query ||
          resource.title.toLowerCase().includes(query.toLowerCase()) ||
          resource.description.toLowerCase().includes(query.toLowerCase()) ||
          resource.content.toLowerCase().includes(query.toLowerCase());

        const matchesCategory =
          !filters.category || resource.category === filters.category;
        const matchesType = !filters.type || resource.type === filters.type;
        const matchesSkillLevel =
          !filters.skillLevel || resource.skillLevel === filters.skillLevel;

        return (
          matchesQuery && matchesCategory && matchesType && matchesSkillLevel
        );
      });

      resolve({
        resources: results,
        totalCount: results.length,
      });
    } catch (error) {
      console.error('Error searching documentation:', error);
      // Fallback to in-memory search
      const results = documentationResources.filter((resource) => {
        const matchesQuery =
          !query ||
          resource.title.toLowerCase().includes(query.toLowerCase()) ||
          resource.description.toLowerCase().includes(query.toLowerCase()) ||
          resource.content.toLowerCase().includes(query.toLowerCase());

        const matchesCategory =
          !filters.category || resource.category === filters.category;
        const matchesType = !filters.type || resource.type === filters.type;
        const matchesSkillLevel =
          !filters.skillLevel || resource.skillLevel === filters.skillLevel;

        return (
          matchesQuery && matchesCategory && matchesType && matchesSkillLevel
        );
      });

      resolve({
        resources: results,
        totalCount: results.length,
      });
    }
  });
};

export const getContextualHelp = (contextKey: string) => {
  return new Promise<DocumentationResource[]>(async (resolve) => {
    try {
      const resources = await getDocumentationResources();
      const helpResources = resources.filter(
        (r) => r.contextualHelpKeys && r.contextualHelpKeys.includes(contextKey)
      );
      resolve(helpResources);
    } catch (error) {
      console.error('Error getting contextual help:', error);
      // Fallback to in-memory search
      const helpResources = documentationResources.filter(
        (r) => r.contextualHelpKeys && r.contextualHelpKeys.includes(contextKey)
      );
      resolve(helpResources);
    }
  });
};

// Add a new documentation resource
export const addDocumentationResource = async (
  resource: DocumentationResource
): Promise<DocumentationResource> => {
  return new Promise(async (resolve) => {
    try {
      // Get current resources from localStorage
      const resources = await getDocumentationResources();

      // Add the new resource
      resources.push(resource);

      // Save back to localStorage
      localStorage.setItem(
        'hidesync_documentation_resources',
        JSON.stringify(resources)
      );

      // Return the added resource
      setTimeout(() => resolve(resource), 500); // Simulate network delay
    } catch (error) {
      console.error('Error adding resource to localStorage:', error);
      // Fallback to in-memory storage
      documentationResources.push(resource);
      setTimeout(() => resolve(resource), 500);
    }
  });
};

// Update an existing documentation resource
export const updateDocumentationResource = async (
  resource: DocumentationResource
): Promise<DocumentationResource> => {
  return new Promise(async (resolve) => {
    try {
      // Get current resources from localStorage
      const resources = await getDocumentationResources();

      // Update the resource
      const updatedResources = resources.map((r) =>
        r.id === resource.id ? resource : r
      );

      // Save back to localStorage
      localStorage.setItem(
        'hidesync_documentation_resources',
        JSON.stringify(updatedResources)
      );

      // Return the updated resource
      setTimeout(() => resolve(resource), 500);
    } catch (error) {
      console.error('Error updating resource in localStorage:', error);
      // Fallback to in-memory storage
      const index = documentationResources.findIndex(
        (r) => r.id === resource.id
      );
      if (index !== -1) {
        documentationResources[index] = resource;
      }
      setTimeout(() => resolve(resource), 500);
    }
  });
};

// Delete a documentation resource
export const deleteDocumentationResource = async (
  resourceId: string
): Promise<boolean> => {
  return new Promise(async (resolve) => {
    try {
      // Get current resources from localStorage
      const resources = await getDocumentationResources();

      // Filter out the resource to delete
      const filteredResources = resources.filter((r) => r.id !== resourceId);

      // Save back to localStorage
      localStorage.setItem(
        'hidesync_documentation_resources',
        JSON.stringify(filteredResources)
      );

      // Return success
      setTimeout(() => resolve(true), 500);
    } catch (error) {
      console.error('Error deleting resource from localStorage:', error);
      // Fallback to in-memory storage
      const index = documentationResources.findIndex(
        (r) => r.id === resourceId
      );
      if (index !== -1) {
        documentationResources.splice(index, 1);
      }
      setTimeout(() => resolve(true), 500);
    }
  });
};
