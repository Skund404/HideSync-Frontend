// src/services/mock/projects.ts
import { ProjectStatus, ProjectType } from '../../types/enums';
import { Project } from '../../types/models';

// Sample projects data
let projectsData: Project[] = [
  {
    id: 1,
    name: 'Custom Messenger Bag',
    type: ProjectType.BAG,
    status: ProjectStatus.IN_PROGRESS,
    startDate: '2025-02-15',
    dueDate: '2025-03-22',
    completionPercentage: 75,
    customer: 'John Smith',
    notes:
      'Client requested extra reinforcement on strap attachments. Using 5-6oz veg tan leather for main body.',
  },
  {
    id: 2,
    name: 'Leather Wallet Set',
    type: ProjectType.WALLET,
    status: ProjectStatus.CUTTING,
    startDate: '2025-03-01',
    dueDate: '2025-03-18',
    completionPercentage: 30,
    customer: 'Emily Johnson',
    notes:
      'Set of 3 wallets with matching design. Using Wickett & Craig English Bridle in Dark Brown.',
  },
  {
    id: 3,
    name: 'Custom Belt',
    type: ProjectType.BELT,
    status: ProjectStatus.STITCHING,
    startDate: '2025-03-05',
    dueDate: '2025-03-15',
    completionPercentage: 60,
    customer: 'Michael Williams',
    notes:
      '38mm width belt with brass buckle. Pattern requires stitching along edges.',
  },
  {
    id: 4,
    name: 'Laptop Sleeve',
    type: ProjectType.CASE,
    status: ProjectStatus.PLANNING,
    startDate: '2025-02-28',
    dueDate: '2025-03-30',
    completionPercentage: 10,
    customer: 'Sarah Davis',
    notes:
      'For 15-inch MacBook Pro. Client requested minimal design with magnetic closure.',
  },
  {
    id: 5,
    name: 'Leather Journal Cover',
    type: ProjectType.ACCESSORY,
    status: ProjectStatus.MATERIAL_PREPARATION,
    startDate: '2025-03-10',
    dueDate: '2025-04-05',
    completionPercentage: 25,
    customer: 'David Miller',
    notes:
      'A5 size journal cover with pen holder and card slots. Using Buttero leather in tan.',
  },
  {
    id: 6,
    name: 'Knife Sheath',
    type: ProjectType.CASE,
    status: ProjectStatus.DESIGN_PHASE,
    startDate: '2025-03-12',
    dueDate: '2025-03-29',
    completionPercentage: 15,
    customer: 'Robert Taylor',
    notes:
      'Custom sheath for hunting knife. Requires wet forming and secure retention.',
  },
  {
    id: 7,
    name: 'Leather Camera Strap',
    type: ProjectType.ACCESSORY,
    status: ProjectStatus.COMPLETED,
    startDate: '2025-02-01',
    dueDate: '2025-02-25',
    completionPercentage: 100,
    customer: 'Jennifer Anderson',
    notes:
      'Completed ahead of schedule. Used Hermann Oak leather with comfortable padding.',
  },
];

// Helper function to simulate async delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Simulate async API calls
export const getProjects = async (): Promise<Project[]> => {
  await delay(300);
  return [...projectsData];
};

export const getProjectById = async (
  id: number
): Promise<Project | undefined> => {
  await delay(300);
  return projectsData.find((p) => p.id === id);
};

export const createProject = async (
  project: Omit<Project, 'id'>
): Promise<Project> => {
  await delay(300);

  // Generate a new ID (in a real app, this would be handled by the backend)
  const newId = Math.max(0, ...projectsData.map((p) => p.id)) + 1;

  const newProject: Project = {
    ...project,
    id: newId,
  };

  projectsData.push(newProject);
  return newProject;
};

export const updateProject = async (
  id: number,
  updates: Partial<Project>
): Promise<Project> => {
  await delay(300);

  const index = projectsData.findIndex((p) => p.id === id);

  if (index === -1) {
    throw new Error(`Project with ID ${id} not found`);
  }

  const updatedProject = {
    ...projectsData[index],
    ...updates,
  };

  projectsData[index] = updatedProject;
  return updatedProject;
};

export const deleteProject = async (id: number): Promise<boolean> => {
  await delay(300);

  const initialLength = projectsData.length;
  projectsData = projectsData.filter((p) => p.id !== id);

  return initialLength > projectsData.length;
};

// Filter projects by various criteria
export const filterProjects = (filters: {
  status?: ProjectStatus;
  customer?: string;
  type?: ProjectType;
  searchQuery?: string;
  startDateFrom?: string;
  startDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}): Project[] => {
  return projectsData.filter((project) => {
    // Apply status filter
    if (filters.status && project.status !== filters.status) {
      return false;
    }

    // Apply customer filter
    if (filters.customer && project.customer !== filters.customer) {
      return false;
    }

    // Apply type filter
    if (filters.type && project.type !== filters.type) {
      return false;
    }

    // Apply search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const nameMatch = project.name.toLowerCase().includes(query);
      const typeMatch = project.type.toString().toLowerCase().includes(query);
      const customerMatch = project.customer.toLowerCase().includes(query);
      const notesMatch = project.notes?.toLowerCase().includes(query);

      if (!(nameMatch || typeMatch || customerMatch || notesMatch)) {
        return false;
      }
    }

    // Apply date range filters
    if (filters.startDateFrom && project.startDate < filters.startDateFrom) {
      return false;
    }

    if (filters.startDateTo && project.startDate > filters.startDateTo) {
      return false;
    }

    if (
      filters.dueDateFrom &&
      project.dueDate &&
      project.dueDate < filters.dueDateFrom
    ) {
      return false;
    }

    if (
      filters.dueDateTo &&
      project.dueDate &&
      project.dueDate > filters.dueDateTo
    ) {
      return false;
    }

    return true;
  });
};

// Helper to get active projects (not completed or cancelled)
export const getActiveProjects = async (): Promise<Project[]> => {
  await delay(300);
  return projectsData.filter(
    (p) =>
      p.status !== ProjectStatus.COMPLETED &&
      p.status !== ProjectStatus.CANCELLED
  );
};

// Helper to get completed projects
export const getCompletedProjects = async (): Promise<Project[]> => {
  await delay(300);
  return projectsData.filter((p) => p.status === ProjectStatus.COMPLETED);
};

// Default export for importing the mock data directly
export default projectsData;
