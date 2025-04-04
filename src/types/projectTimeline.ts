// src/types/projectTimeline.ts

/**
 * Comprehensive enum for Project Status.
 * This enum represents the various phases and statuses that a project may have,
 * based on the ER diagram. It covers the phases from planning to delivery,
 * as well as additional statuses.
 */
export enum ProjectStatus {
  // Planning phase
  CONCEPT = 'CONCEPT',
  PLANNING = 'PLANNING',
  INITIAL_CONSULTATION = 'INITIAL_CONSULTATION',
  DESIGN_PHASE = 'DESIGN_PHASE',
  DESIGN_RESEARCH = 'DESIGN_RESEARCH',
  REFERENCE_GATHERING = 'REFERENCE_GATHERING',
  SKETCH_PHASE = 'SKETCH_PHASE',
  PATTERN_DEVELOPMENT = 'PATTERN_DEVELOPMENT',
  PATTERN_TESTING = 'PATTERN_TESTING',
  CLIENT_APPROVAL = 'CLIENT_APPROVAL',

  // Preparation phase
  MATERIAL_SELECTION = 'MATERIAL_SELECTION',
  MATERIAL_SAMPLING = 'MATERIAL_SAMPLING',
  MATERIAL_PURCHASED = 'MATERIAL_PURCHASED',
  MATERIAL_PREPARATION = 'MATERIAL_PREPARATION',
  TOOL_PREPARATION = 'TOOL_PREPARATION',

  // Production phase
  PRODUCTION_QUEUE = 'PRODUCTION_QUEUE',
  CUTTING = 'CUTTING',
  SKIVING = 'SKIVING',
  PREPARATION = 'PREPARATION',
  DYEING = 'DYEING',
  ASSEMBLY = 'ASSEMBLY',
  GLUING = 'GLUING',
  STITCHING = 'STITCHING',
  HOLE_PUNCHING = 'HOLE_PUNCHING',
  EDGE_FINISHING = 'EDGE_FINISHING',
  BEVELING = 'BEVELING',
  BURNISHING = 'BURNISHING',
  PAINTING = 'PAINTING',
  HARDWARE_INSTALLATION = 'HARDWARE_INSTALLATION',
  EMBOSSING = 'EMBOSSING',
  TOOLING = 'TOOLING',
  STAMPING = 'STAMPING',
  CONDITIONING = 'CONDITIONING',
  POLISHING = 'POLISHING',

  // Finishing phase
  QUALITY_CHECK = 'QUALITY_CHECK',
  REVISIONS = 'REVISIONS',
  FINAL_TOUCHES = 'FINAL_TOUCHES',
  PHOTOGRAPHY = 'PHOTOGRAPHY',
  DOCUMENTATION = 'DOCUMENTATION',
  PACKAGING = 'PACKAGING',

  // Delivery phase
  READY_FOR_DELIVERY = 'READY_FOR_DELIVERY',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',

  // Other statuses
  ON_HOLD = 'ON_HOLD',
  DELAYED = 'DELAYED',
  WAITING_FOR_MATERIALS = 'WAITING_FOR_MATERIALS',
  WAITING_FOR_TOOLS = 'WAITING_FOR_TOOLS',
  WAITING_FOR_CLIENT = 'WAITING_FOR_CLIENT',
  WAITING_FOR_APPROVAL = 'WAITING_FOR_APPROVAL',
  CANCELLED = 'CANCELLED',

  // Legacy statuses
  PLANNED = 'PLANNED',
  MATERIALS_READY = 'MATERIALS_READY',
  IN_PROGRESS = 'IN_PROGRESS',
}

/**
 * Project interface aligned with the ER diagram.
 *
 * The ER diagram for Project defines these fields:
 * - id, name, description, status, startDate, dueDate, completedDate,
 *   progress, completionPercentage, type (project type), customer, and notes.
 *
 * Here, we update the interface accordingly:
 * - Replaced "deadline" with "dueDate".
 * - Added "description" and "completionPercentage".
 * - Renamed "type" to "projectType" for clarity.
 * - Replaced "client" with "customer" (a string name) to match the ER diagram.
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate: Date | string;
  dueDate: Date | string;
  completedDate?: Date | string;
  progress?: number;
  completionPercentage?: number;
  projectType?: string;
  salesId?: string; // Added to align with ER diagram
  templateId?: string; // Added to align with ER diagram
  customer?: string;
  notes?: string;
}

/**
 * TimelineTask interface for representing individual tasks within a project's timeline.
 *
 * This mirrors the ER diagram for TimelineTask, which includes:
 * - id, name, startDate, endDate, progress, status, dependencies, and isCriticalPath.
 */
export interface TimelineTask {
  id: string;
  projectId?: string; // Added to align with ER diagram
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  progress: number;
  status: ProjectStatus;
  dependencies?: string[];
  isCriticalPath?: boolean;
}

/**
 * Properties for a ProjectTimeline component.
 */
export interface ProjectTimelineProps {
  project: Project;
  showCriticalPath?: boolean;
}
