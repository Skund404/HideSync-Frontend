// src/types/recurringProject.ts
import { ProjectStatus, ProjectType, SkillLevel } from './enums';
import { Project } from './models';

interface ProjectComponent {
  id: string; // Use string type to match your usage
  name: string;
  description?: string;
  // Add any other properties needed for your project components
}

/**
 * Frequency types for recurring projects
 */
export enum RecurrenceFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

/**
 * Days of the week for weekly recurrence
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
 * Interface for recurrence pattern configuration
 */

export interface RecurrencePattern {
  id: string;
  name: string;
  frequency: RecurrenceFrequency;
  interval: number; // How many frequency units between occurrences
  startDate: Date | string;
  endDate?: Date | string; // Optional, for patterns with a defined end
  endAfterOccurrences?: number; // Optional, for patterns with a defined number of occurrences

  // For weekly recurrence
  daysOfWeek?: DayOfWeek[];

  // For monthly recurrence
  dayOfMonth?: number; // 1-31
  weekOfMonth?: number; // 1-5, where 5 means "last"
  dayOfWeekMonthly?: DayOfWeek; // For patterns like "first Monday of month"

  // For yearly recurrence
  month?: number; // 1-12

  // For custom recurrence
  customDates?: (Date | string)[];

  // Skip rules
  skipWeekends?: boolean;
  skipHolidays?: boolean;
  holidays?: (Date | string)[];

  // Handling of disabled dates (weekends/holidays)
  disabledDateHandling?: 'previous' | 'next' | 'skip';

  // Custom expression for complex patterns
  customExpression?: string;
}

/**
 * Interface for a recurring project
 */
export interface RecurringProject {
  id: string;
  templateId: string;
  name: string;
  description: string;
  projectType: ProjectType;
  skillLevel: SkillLevel;

  // Base project details
  clientId?: string;
  duration: number; // Duration in days
  components: ProjectComponent[];

  // Recurrence configuration
  recurrencePattern: RecurrencePattern;

  // State tracking
  isActive: boolean;
  nextOccurrence?: Date | string;
  lastOccurrence?: Date | string;
  totalOccurrences: number;
  remainingOccurrences?: number;

  // Generation options
  autoGenerate: boolean; // Generate automatically on schedule
  advanceNoticeDays: number; // Days before the project should be created
  projectSuffix?: string; // Optional suffix pattern for generated projects (e.g., "#1")

  // Generated projects
  generatedProjects: GeneratedProject[];

  // Metadata
  createdBy: string;
  createdAt: Date | string;
  modifiedAt: Date | string;
}

/**
 * Interface for a project that has been generated from a recurring pattern
 */
export interface GeneratedProject {
  id: string;
  projectId: string;
  recurringProjectId: string;
  occurrenceNumber: number;
  scheduledDate: Date | string;
  actualGenerationDate: Date | string;
  status: 'scheduled' | 'generated' | 'skipped' | 'failed';
  notes?: string;
}

/**
 * Interface for filters to search recurring projects
 */
export interface RecurringProjectFilter {
  clientId?: string;
  projectType?: ProjectType;
  isActive?: boolean;
  createdBy?: string;
  searchText?: string;
}

/**
 * Interface for creating a new occurrence of a recurring project
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
 * Interface for updating a recurring project pattern
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
 * Calculate the next occurrence date for a recurrence pattern
 * @param pattern The recurrence pattern
 * @param from The date to calculate from (defaults to now)
 * @returns The next occurrence date
 */
export function calculateNextOccurrence(
  pattern: RecurrencePattern,
  from: Date = new Date()
): Date | null {
  // Implementation would include complex date calculation logic
  // This is a placeholder implementation

  // Check if pattern has ended
  if (pattern.endDate && new Date(pattern.endDate) < from) {
    return null;
  }

  // Different calculation based on frequency
  switch (pattern.frequency) {
    case RecurrenceFrequency.DAILY:
      return new Date(from.getTime() + pattern.interval * 24 * 60 * 60 * 1000);

    case RecurrenceFrequency.WEEKLY:
      // Would include logic to find the next day of week from the pattern
      return new Date(
        from.getTime() + pattern.interval * 7 * 24 * 60 * 60 * 1000
      );

    case RecurrenceFrequency.MONTHLY:
      // Would include logic for finding the next month occurrence
      const nextMonth = new Date(from);
      nextMonth.setMonth(nextMonth.getMonth() + pattern.interval);
      return nextMonth;

    case RecurrenceFrequency.QUARTERLY:
      // Would include logic for finding the next quarter occurrence
      const nextQuarter = new Date(from);
      nextQuarter.setMonth(nextQuarter.getMonth() + pattern.interval * 3);
      return nextQuarter;

    case RecurrenceFrequency.YEARLY:
      // Would include logic for finding the next yearly occurrence
      const nextYear = new Date(from);
      nextYear.setFullYear(nextYear.getFullYear() + pattern.interval);
      return nextYear;

    case RecurrenceFrequency.CUSTOM:
      // Would include logic for finding the next custom date
      if (pattern.customDates && pattern.customDates.length > 0) {
        const futureDates = pattern.customDates
          .map((d) => new Date(d))
          .filter((d) => d > from)
          .sort((a, b) => a.getTime() - b.getTime());

        return futureDates.length > 0 ? futureDates[0] : null;
      }
      return null;

    default:
      return null;
  }
}

/**
 * Generate a project from a recurring project pattern
 * @param recurringProject The recurring project definition
 * @param date The target date for the occurrence
 * @returns A new project instance
 */
export function generateProjectFromRecurring(
  recurringProject: RecurringProject,
  date: Date = new Date()
): Project {
  const occurrenceNumber = recurringProject.totalOccurrences + 1;
  const projectSuffix = recurringProject.projectSuffix
    ? recurringProject.projectSuffix.replace('{n}', occurrenceNumber.toString())
    : `#${occurrenceNumber}`;

  // Create a base project with properties that match the Project interface
  const baseProject: Partial<Project> = {
    id: parseInt(`${Date.now()}`), // Convert to number
    name: `${recurringProject.name} ${projectSuffix}`,
    description: recurringProject.description,
    status: ProjectStatus.CONCEPT,
    type: recurringProject.projectType,
    startDate: date.toISOString(),
    dueDate: new Date(
      date.getTime() + recurringProject.duration * 24 * 60 * 60 * 1000
    ).toISOString(),
    notes: `Generated from recurring project ${recurringProject.name}`,
  };

  // Create the project with additional properties as needed
  // Adjust this based on your Project interface requirements
  const project = {
    ...baseProject,
    customer: recurringProject.clientId
      ? `Client #${recurringProject.clientId}`
      : '',
    completionPercentage: 0,
  } as Project;

  // Add any optional properties that might exist on your Project interface
  const projectWithExtras = project as any;

  // Add additional properties that may be needed
  projectWithExtras.isRecurring = true;
  projectWithExtras.recurrenceInfo = {
    recurringProjectId: recurringProject.id,
    occurrenceNumber: occurrenceNumber,
  };

  // Add components if needed
  projectWithExtras.components = [...recurringProject.components];

  // Add empty picking lists if needed
  projectWithExtras.pickingLists = [];

  return project;
}
