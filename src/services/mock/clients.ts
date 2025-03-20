// src/services/mock/clients.ts
import {
  CustomerSource,
  CustomerStatus,
  CustomerTier,
} from '../../types/enums';

export interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status: CustomerStatus;
  tier?: CustomerTier;
  source?: CustomerSource;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Sample clients data
let clientsData: Client[] = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '555-123-4567',
    status: CustomerStatus.ACTIVE,
    tier: CustomerTier.STANDARD,
    source: CustomerSource.WEBSITE,
    notes: 'Prefers communications via email.',
    createdAt: '2024-12-01',
    updatedAt: '2025-01-15',
  },
  {
    id: 2,
    name: 'Emily Johnson',
    email: 'emily.johnson@example.com',
    phone: '555-234-5678',
    status: CustomerStatus.ACTIVE,
    tier: CustomerTier.PREMIUM,
    source: CustomerSource.REFERRAL,
    notes: 'Repeat customer, prefers premium leathers.',
    createdAt: '2024-11-15',
    updatedAt: '2025-02-20',
  },
  {
    id: 3,
    name: 'Michael Williams',
    email: 'michael.williams@example.com',
    phone: '555-345-6789',
    status: CustomerStatus.ACTIVE,
    tier: CustomerTier.STANDARD,
    source: CustomerSource.INSTAGRAM,
    notes: 'Found us through social media campaign.',
    createdAt: '2025-01-05',
    updatedAt: '2025-01-05',
  },
  {
    id: 4,
    name: 'Sarah Davis',
    email: 'sarah.davis@example.com',
    phone: '555-456-7890',
    status: CustomerStatus.ACTIVE,
    tier: CustomerTier.VIP,
    source: CustomerSource.WORD_OF_MOUTH,
    notes: 'Particular about design details, requires approvals at each stage.',
    createdAt: '2024-10-30',
    updatedAt: '2025-02-10',
  },
  {
    id: 5,
    name: 'David Miller',
    email: 'david.miller@example.com',
    phone: '555-567-8901',
    status: CustomerStatus.ACTIVE,
    tier: CustomerTier.STANDARD,
    source: CustomerSource.CRAFT_FAIR,
    notes: 'Met at the Downtown Craft Fair.',
    createdAt: '2025-01-20',
    updatedAt: '2025-01-20',
  },
  {
    id: 6,
    name: 'Robert Taylor',
    email: 'robert.taylor@example.com',
    phone: '555-678-9012',
    status: CustomerStatus.ACTIVE,
    tier: CustomerTier.STANDARD,
    source: CustomerSource.WEBSITE,
    notes: 'Outdoor enthusiast, interested in durable gear.',
    createdAt: '2025-02-01',
    updatedAt: '2025-02-01',
  },
  {
    id: 7,
    name: 'Jennifer Anderson',
    email: 'jennifer.anderson@example.com',
    phone: '555-789-0123',
    status: CustomerStatus.RETURNING,
    tier: CustomerTier.PREMIUM,
    source: CustomerSource.WEBSITE,
    notes: 'Professional photographer, specific requirements for gear.',
    createdAt: '2024-09-15',
    updatedAt: '2025-01-25',
  },
];

// Helper function to simulate async delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Simulate async API calls
export const getClients = async (): Promise<Client[]> => {
  await delay(300);
  return [...clientsData];
};

export const getClientById = async (
  id: number
): Promise<Client | undefined> => {
  await delay(300);
  return clientsData.find((c) => c.id === id);
};

export const createClient = async (
  client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Client> => {
  await delay(300);

  // Generate a new ID
  const newId = Math.max(0, ...clientsData.map((c) => c.id)) + 1;
  const now = new Date().toISOString().split('T')[0];

  const newClient: Client = {
    ...client,
    id: newId,
    createdAt: now,
    updatedAt: now,
  };

  clientsData.push(newClient);
  return newClient;
};

export const updateClient = async (
  id: number,
  updates: Partial<Client>
): Promise<Client> => {
  await delay(300);

  const index = clientsData.findIndex((c) => c.id === id);

  if (index === -1) {
    throw new Error(`Client with ID ${id} not found`);
  }

  const updatedClient = {
    ...clientsData[index],
    ...updates,
    updatedAt: new Date().toISOString().split('T')[0],
  };

  clientsData[index] = updatedClient;
  return updatedClient;
};

export const deleteClient = async (id: number): Promise<boolean> => {
  await delay(300);

  const initialLength = clientsData.length;
  clientsData = clientsData.filter((c) => c.id !== id);

  return initialLength > clientsData.length;
};

// Filter clients by various criteria
export const filterClients = (filters: {
  status?: CustomerStatus;
  tier?: CustomerTier;
  source?: CustomerSource;
  searchQuery?: string;
}): Client[] => {
  return clientsData.filter((client) => {
    // Apply status filter
    if (filters.status && client.status !== filters.status) {
      return false;
    }

    // Apply tier filter
    if (filters.tier && client.tier !== filters.tier) {
      return false;
    }

    // Apply source filter
    if (filters.source && client.source !== filters.source) {
      return false;
    }

    // Apply search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const nameMatch = client.name.toLowerCase().includes(query);
      const emailMatch = client.email.toLowerCase().includes(query);
      const phoneMatch = client.phone?.toLowerCase().includes(query) || false;
      const notesMatch = client.notes?.toLowerCase().includes(query) || false;

      if (!(nameMatch || emailMatch || phoneMatch || notesMatch)) {
        return false;
      }
    }

    return true;
  });
};

// Default export for importing the mock data directly
export default clientsData;
