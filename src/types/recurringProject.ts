import { ProjectStatus, ProjectType, SkillLevel } from "./enums";

/**
 * Comprehensive Project interface based on the ER diagram.
 * 
 * Fields:
 *  - id: Unique numeric identifier.
 *  - name: Project name.
 *  - description: Project description.
 *  - projectType: The type (e.g. WALLET, BAG, BELT, etc.).
 *  - status: The current project status (e.g. CONCEPT, PLANNING, IN_PROGRESS, etc.).
 *  - startDate: ISO string representing the start date.
 *  - dueDate: ISO string representing the due date.
 *  - completedDate: (Optional) ISO string for when the project was completed.
 *  - progress: Current progress as a number.
 *  - completionPercentage: A number from 0 to 100.
 *  - salesId: (Optional) Foreign key to a sale.
 *  - templateId: (Optional) Foreign key to a project template.
 *  - customer: Customer name or identifier.
 *  - notes: (Optional) Any additional notes.
 */
export interface Project {
  id: number;
  name: string;
  description: string;
  projectType: ProjectType;
  status: ProjectStatus;
  startDate: string;
  dueDate: string;
  completedDate?: string;
  progress: number;
  completionPercentage: number;
  salesId?: number;
  templateId?: number;
  customer: string;
  notes?: string;
}

/**
 * Represents a project component used in recurring projects.
 */
export interface ProjectComponent {
  id: string;
  name: string;
  description?: string;
  // Additional properties can be added as needed.
}

/**
 * Enum representing frequency types for recurring projects.
 */
export enum RecurrenceFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  YEARLY = "yearly",
  CUSTOM = "custom",
}

/**
 * Enum for days of the week used in weekly recurrence.
 */
export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

/**
 * Defines the recurrence pattern configuration.
 */
export interface RecurrencePattern {
  id: string;
  name: string;
  frequency: RecurrenceFrequency;
  interval: number; // Number of frequency units between occurrences.
  startDate: Date | string;
  endDate?: Date | string; // Optional end date.
  endAfterOccurrences?: number; // End after a specific number of occurrences.
  // For weekly recurrence:
  daysOfWeek?: DayOfWeek[];
  // For monthly recurrence:
  dayOfMonth?: number; // 1–31
  weekOfMonth?: number; // 1–5, where 5 represents "last"
  dayOfWeekMonthly?: DayOfWeek; // e.g. "first Monday" of the month.
  // For yearly recurrence:
  month?: number; // 1–12
  // For custom recurrence:
  customDates?: (Date | string)[];
  // Skip rules:
  skipWeekends?: boolean;
  skipHolidays?: boolean;
  holidays?: (Date | string)[];
  // How to handle disabled dates (e.g. weekends/holidays):
  disabledDateHandling?: "previous" | "next" | "skip";
  // Custom expression for complex patterns:
  customExpression?: string;
}

/**
 * Interface for a recurring project.
 */
export interface RecurringProject {
  id: string;
  templateId: string;
  name: string;
  description: string;
  projectType: ProjectType;
  skillLevel: SkillLevel;
  // Base project details:
  clientId?: string;
  duration: number; // Duration in days.
  components: ProjectComponent[];
  // Recurrence configuration:
  recurrencePattern: RecurrencePattern;
  // State tracking:
  isActive: boolean;
  nextOccurrence?: Date | string;
  lastOccurrence?: Date | string;
  totalOccurrences: number;
  remainingOccurrences?: number;
  // Generation options:
  autoGenerate: boolean;
  advanceNoticeDays: number; // Days in advance to generate the project.
  projectSuffix?: string; // e.g. "#1"
  // Generated projects associated with this recurring project.
  generatedProjects: GeneratedProject[];
  // Metadata:
  createdBy: string;
  createdAt: Date | string;
  modifiedAt: Date | string;
}

/**
 * Interface for a project generated from a recurring project pattern.
 */
export interface GeneratedProject {
  id: string;
  projectId: string;
  recurringProjectId: string;
  occurrenceNumber: number;
  scheduledDate: Date | string;
  actualGenerationDate: Date | string;
  status: "scheduled" | "generated" | "skipped" | "failed";
  notes?: string;
}

/**
 * Interface for filtering recurring projects.
 */
export interface RecurringProjectFilter {
  clientId?: string;
  projectType?: ProjectType;
  isActive?: boolean;
  createdBy?: string;
  searchText?: string;
}

/**
 * Interface for creating a new occurrence of a recurring project.
 */
export interface RecurringProjectOccurrence {
  recurringProjectId: string;
  scheduledDate: Date | string;
  clientId?: string;
  customizations?: {
    name?: string;
    description?: string;
    components?: ProjectComponent[];
    duration?: number;
  };
}

/**
 * Interface for updating a recurring project pattern.
 */
export interface RecurringProjectUpdate {
  name?: string;
  description?: string;
  isActive?: boolean;
  recurrencePattern?: Partial<RecurrencePattern>;
  autoGenerate?: boolean;
  advanceNoticeDays?: number;
  projectSuffix?: string;
}

/**
 * Calculates the next occurrence date based on the given recurrence pattern.
 * @param pattern - The recurrence pattern configuration.
 * @param from - The reference date (defaults to now).
 * @returns The next occurrence Date or null if the pattern has ended.
 */
export function calculateNextOccurrence(
  pattern: RecurrencePattern,
  from: Date = new Date()
): Date | null {
  if (pattern.endDate && new Date(pattern.endDate) < from) {
    return null;
  }
  switch (pattern.frequency) {
    case RecurrenceFrequency.DAILY:
      return new Date(from.getTime() + pattern.interval * 24 * 60 * 60 * 1000);
    case RecurrenceFrequency.WEEKLY:
      return new Date(from.getTime() + pattern.interval * 7 * 24 * 60 * 60 * 1000);
    case RecurrenceFrequency.MONTHLY: {
      const nextMonth = new Date(from);
      nextMonth.setMonth(nextMonth.getMonth() + pattern.interval);
      return nextMonth;
    }
    case RecurrenceFrequency.QUARTERLY: {
      const nextQuarter = new Date(from);
      nextQuarter.setMonth(nextQuarter.getMonth() + pattern.interval * 3);
      return nextQuarter;
    }
    case RecurrenceFrequency.YEARLY: {
      const nextYear = new Date(from);
      nextYear.setFullYear(nextYear.getFullYear() + pattern.interval);
      return nextYear;
    }
    case RecurrenceFrequency.CUSTOM: {
      if (pattern.customDates && pattern.customDates.length > 0) {
        const futureDates = pattern.customDates
          .map((d) => new Date(d))
          .filter((d) => d > from)
          .sort((a, b) => a.getTime() - b.getTime());
        return futureDates.length > 0 ? futureDates[0] : null;
      }
      return null;
    }
    default:
      return null;
  }
}

/**
 * Generates a new Project instance from a recurring project definition.
 * Constructs a complete Project object using the updated interface.
 * @param recurringProject - The recurring project definition.
 * @param date - The target occurrence date (defaults to now).
 * @returns A new Project object.
 */
export function generateProjectFromRecurring(
  recurringProject: RecurringProject,
  date: Date = new Date()
): Project {
  const occurrenceNumber = recurringProject.totalOccurrences + 1;
  const suffix =
    recurringProject.projectSuffix && recurringProject.projectSuffix.includes("{n}")
      ? recurringProject.projectSuffix.replace("{n}", occurrenceNumber.toString())
      : `#${occurrenceNumber}`;

  // Construct a complete Project object.
  const newProject: Project = {
    id: Date.now(), // Numeric ID as required.
    name: `${recurringProject.name} ${suffix}`,
    description: recurringProject.description,
    status: ProjectStatus.CONCEPT,
    projectType: recurringProject.projectType,
    startDate: date.toISOString(),
    dueDate: new Date(date.getTime() + recurringProject.duration * 24 * 60 * 60 * 1000).toISOString(),
    progress: 0,
    completionPercentage: 0,
    customer: recurringProject.clientId ? `Client #${recurringProject.clientId}` : "",
    notes: `Generated from recurring project ${recurringProject.name}`,
  };

  // Append additional recurring metadata and extra properties as needed.
  (newProject as any).isRecurring = true;
  (newProject as any).recurrenceInfo = {
    recurringProjectId: recurringProject.id,
    occurrenceNumber,
  };
  (newProject as any).components = [...recurringProject.components];
  (newProject as any).pickingLists = [];

  return newProject;
}
