// src/services/mock/patterns.ts
import { EnumTypes } from '../../types';
import {
  Pattern,
  PatternFileType,
  PatternFilters,
} from '../../types/patternTypes';

// Sample patterns data
let patternsData: Pattern[] = [
  {
    id: 1,
    name: 'Classic Bifold Wallet',
    description: 'Traditional bifold wallet with card slots and cash pocket',
    skillLevel: EnumTypes.SkillLevel.INTERMEDIATE,
    createdAt: new Date('2025-01-15'),
    modifiedAt: new Date('2025-02-20'),
    fileType: PatternFileType.SVG,
    filePath: '/patterns/bifold_wallet.svg',
    thumbnail: '/api/placeholder/300/200',
    tags: ['wallet', 'bifold', 'beginner-friendly'],
    isFavorite: true,
    projectType: EnumTypes.ProjectType.BIFOLD_WALLET,
    authorName: 'John Smith',
    isPublic: true,
    version: '1.2',
  },
  {
    id: 2,
    name: 'Messenger Bag Pattern v2',
    description:
      'Updated messenger bag with adjustable strap and multiple pockets',
    skillLevel: EnumTypes.SkillLevel.ADVANCED,
    createdAt: new Date('2024-12-05'),
    modifiedAt: new Date('2025-03-01'),
    fileType: PatternFileType.PDF,
    filePath: '/patterns/messenger_bag_v2.pdf',
    thumbnail: '/api/placeholder/300/200',
    tags: ['bag', 'messenger', 'advanced'],
    isFavorite: false,
    projectType: EnumTypes.ProjectType.MESSENGER_BAG,
    estimatedTime: 12,
    estimatedDifficulty: 8,
    authorName: 'Emily Chen',
    isPublic: true,
    version: '2.0',
  },
  {
    id: 3,
    name: 'Minimalist Card Holder',
    description: 'Simple card holder with three card slots and minimal design',
    skillLevel: EnumTypes.SkillLevel.BEGINNER,
    createdAt: new Date('2025-02-10'),
    modifiedAt: new Date('2025-02-12'),
    fileType: PatternFileType.SVG,
    filePath: '/patterns/card_holder.svg',
    thumbnail: '/api/placeholder/300/200',
    tags: ['card holder', 'minimalist', 'quick project'],
    isFavorite: true,
    projectType: EnumTypes.ProjectType.CARD_HOLDER,
    estimatedTime: 3,
    estimatedDifficulty: 3,
    authorName: 'Alex Johnson',
    isPublic: true,
    version: '1.0',
  },
  {
    id: 4,
    name: 'Custom Belt Pattern',
    description:
      'Adjustable belt pattern with options for width and buckle style',
    skillLevel: EnumTypes.SkillLevel.INTERMEDIATE,
    createdAt: new Date('2025-01-25'),
    modifiedAt: new Date('2025-02-28'),
    fileType: PatternFileType.PDF,
    filePath: '/patterns/custom_belt.pdf',
    thumbnail: '/api/placeholder/300/200',
    tags: ['belt', 'adjustable', 'customizable'],
    isFavorite: false,
    projectType: EnumTypes.ProjectType.BELT,
    estimatedTime: 5,
    estimatedDifficulty: 6,
    authorName: 'John Smith',
    isPublic: true,
    version: '1.1',
  },
  {
    id: 5,
    name: "Traveler's Notebook Cover",
    description: "Leather cover for standard traveler's notebook inserts",
    skillLevel: EnumTypes.SkillLevel.INTERMEDIATE,
    createdAt: new Date('2025-03-01'),
    modifiedAt: new Date('2025-03-10'),
    fileType: PatternFileType.SVG,
    filePath: '/patterns/notebook_cover.svg',
    thumbnail: '/api/placeholder/300/200',
    tags: ['notebook', 'cover', 'traveler'],
    isFavorite: false,
    projectType: EnumTypes.ProjectType.NOTEBOOK_COVER,
    estimatedTime: 6,
    estimatedDifficulty: 5,
    authorName: 'Maria Garcia',
    isPublic: true,
    version: '1.0',
  },
  {
    id: 6,
    name: 'Knife Sheath Template',
    description: 'Customizable knife sheath pattern with welt construction',
    skillLevel: EnumTypes.SkillLevel.ADVANCED,
    createdAt: new Date('2024-12-15'),
    modifiedAt: new Date('2025-02-05'),
    fileType: PatternFileType.IMAGE,
    filePath: '/patterns/knife_sheath.jpg',
    thumbnail: '/api/placeholder/300/200',
    tags: ['sheath', 'knife', 'tool holder'],
    isFavorite: false,
    projectType: EnumTypes.ProjectType.KNIFE_SHEATH,
    estimatedTime: 4,
    estimatedDifficulty: 7,
    authorName: 'Robert Wilson',
    isPublic: true,
    version: '2.1',
  },
];

// Simulate async API calls
export const getPatterns = (): Promise<Pattern[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...patternsData]), 300);
  });
};

export const getPatternById = (id: number): Promise<Pattern | null> => {
  return new Promise((resolve) => {
    const pattern = patternsData.find((p) => p.id === id) || null;
    setTimeout(() => resolve(pattern), 300);
  });
};

export const addPattern = (pattern: Omit<Pattern, 'id'>): Promise<Pattern> => {
  return new Promise((resolve) => {
    const newId = Math.max(0, ...patternsData.map((p) => p.id)) + 1;
    const newPattern = {
      ...pattern,
      id: newId,
    } as Pattern;

    patternsData.push(newPattern);
    setTimeout(() => resolve(newPattern), 300);
  });
};

export const updatePattern = (
  id: number,
  pattern: Partial<Pattern>
): Promise<Pattern> => {
  return new Promise((resolve, reject) => {
    const index = patternsData.findIndex((p) => p.id === id);

    if (index === -1) {
      return reject(new Error(`Pattern with id ${id} not found`));
    }

    const updatedPattern = {
      ...patternsData[index],
      ...pattern,
      modifiedAt: new Date(),
    };

    patternsData[index] = updatedPattern;
    setTimeout(() => resolve(updatedPattern), 300);
  });
};

export const deletePattern = (id: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const initialLength = patternsData.length;
    patternsData = patternsData.filter((p) => p.id !== id);
    const deleted = initialLength > patternsData.length;

    setTimeout(() => resolve(deleted), 300);
  });
};

export const togglePatternFavorite = (id: number): Promise<Pattern> => {
  return new Promise((resolve, reject) => {
    const index = patternsData.findIndex((p) => p.id === id);

    if (index === -1) {
      return reject(new Error(`Pattern with id ${id} not found`));
    }

    const updatedPattern = {
      ...patternsData[index],
      isFavorite: !patternsData[index].isFavorite,
      modifiedAt: new Date(),
    };

    patternsData[index] = updatedPattern;
    setTimeout(() => resolve(updatedPattern), 300);
  });
};

export const filterPatterns = (filters: PatternFilters): Pattern[] => {
  return patternsData.filter((pattern) => {
    // Apply search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const nameMatch = pattern.name.toLowerCase().includes(query);
      const descMatch = pattern.description.toLowerCase().includes(query);
      const tagMatch = pattern.tags.some((tag) =>
        tag.toLowerCase().includes(query)
      );

      if (!(nameMatch || descMatch || tagMatch)) {
        return false;
      }
    }

    // Apply skill level filter
    if (
      filters.skillLevel &&
      pattern.skillLevel.toString() !== filters.skillLevel
    ) {
      return false;
    }

    // Apply project type filter
    if (
      filters.projectType &&
      pattern.projectType.toString() !== filters.projectType
    ) {
      return false;
    }

    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      if (!filters.tags.some((tag) => pattern.tags.includes(tag))) {
        return false;
      }
    }

    // Apply author filter
    if (filters.authorId && pattern.authorId !== filters.authorId) {
      return false;
    }

    // Apply favorite filter
    if (
      filters.favorite !== undefined &&
      pattern.isFavorite !== filters.favorite
    ) {
      return false;
    }

    return true;
  });
};
