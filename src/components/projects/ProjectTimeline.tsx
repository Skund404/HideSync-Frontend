import React, { useEffect, useState } from 'react';

// Comprehensive enum for Project Status
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

// Comprehensive Project interface
interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  startDate?: Date | string;
  deadline?: Date | string;
  completedDate?: Date | string;
  progress?: number;
  components?: { name: string }[];
  materials?: { name: string }[];
  client?: { name: string };
  skillLevel?: string;
  type?: string;
  notes?: string;
}

interface TimelineTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  status: ProjectStatus;
  dependencies?: string[];
  isCriticalPath?: boolean;
}

interface ProjectTimelineProps {
  project: Project;
  showCriticalPath?: boolean;
}

const statusToPhase: Record<
  string,
  { name: string; order: number; duration: number }
> = {
  // Planning phase
  [ProjectStatus.CONCEPT]: { name: 'Planning', order: 1, duration: 2 },
  [ProjectStatus.PLANNING]: { name: 'Planning', order: 1, duration: 2 },
  [ProjectStatus.INITIAL_CONSULTATION]: {
    name: 'Planning',
    order: 1,
    duration: 1,
  },
  [ProjectStatus.DESIGN_PHASE]: { name: 'Design', order: 2, duration: 3 },
  [ProjectStatus.DESIGN_RESEARCH]: { name: 'Design', order: 2, duration: 2 },
  [ProjectStatus.REFERENCE_GATHERING]: {
    name: 'Design',
    order: 2,
    duration: 1,
  },
  [ProjectStatus.SKETCH_PHASE]: { name: 'Design', order: 2, duration: 2 },
  [ProjectStatus.PATTERN_DEVELOPMENT]: {
    name: 'Pattern Development',
    order: 3,
    duration: 3,
  },
  [ProjectStatus.PATTERN_TESTING]: {
    name: 'Pattern Development',
    order: 3,
    duration: 2,
  },
  [ProjectStatus.CLIENT_APPROVAL]: { name: 'Approval', order: 4, duration: 1 },

  // Further mappings remain the same as in the original file
  // ... (keep the entire existing statusToPhase object)
};

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({
  project,
  showCriticalPath = true,
}) => {
  const [tasks, setTasks] = useState<TimelineTask[]>([]);
  const [timeRange, setTimeRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(),
  });

  // Generate tasks based on project data
  useEffect(() => {
    if (!project) return;

    const projectTasks: TimelineTask[] = [];
    const phases = new Map<
      string,
      {
        status: ProjectStatus;
        startDate: Date;
        endDate: Date;
        progress: number;
      }
    >();

    // Get project start date
    const projectStartDate = project.startDate
      ? new Date(project.startDate)
      : new Date();
    let latestEndDate = new Date(projectStartDate);

    // Determine project phases based on current status and project history
    // This is a simplified version - in a real app, you would use actual task tracking data
    const statusKey = project.status as keyof typeof statusToPhase;
    const currentPhaseInfo = statusToPhase[statusKey];
    if (!currentPhaseInfo) return;

    // Calculate how many days into the project we are
    const today = new Date();
    const daysPassed = Math.max(
      0,
      Math.floor(
        (today.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    );

    // Create past and current phases
    let currentDay = 0;
    Object.entries(statusToPhase)
      .filter(
        ([_, info]) => info.order > 0 && info.order <= currentPhaseInfo.order
      )
      .sort((a, b) => a[1].order - b[1].order)
      .forEach(([status, info]) => {
        const isCurrentPhase = info.name === currentPhaseInfo.name;
        const phaseDuration = info.duration;

        const startDate = new Date(projectStartDate);
        startDate.setDate(projectStartDate.getDate() + currentDay);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + phaseDuration);

        if (endDate > latestEndDate) {
          latestEndDate = new Date(endDate);
        }

        // Calculate progress for the phase
        let progress = 0;
        if (info.order < currentPhaseInfo.order) {
          // Completed phases
          progress = 100;
        } else if (isCurrentPhase) {
          // Current phase - estimate progress
          const phaseElapsed = daysPassed - currentDay;
          progress = Math.min(
            100,
            Math.round((phaseElapsed / phaseDuration) * 100)
          );
        }

        // Store phase in map to deduplicate (some statuses map to the same phase)
        if (!phases.has(info.name) || isCurrentPhase) {
          phases.set(info.name, {
            status: status as ProjectStatus,
            startDate,
            endDate,
            progress,
          });
        }

        currentDay += phaseDuration;
      });

    // Add future phases (if not cancelled or completed)
    if (
      ![ProjectStatus.CANCELLED, ProjectStatus.COMPLETED].includes(
        project.status
      )
    ) {
      let lastOrder = currentPhaseInfo.order;

      Object.entries(statusToPhase)
        .filter(([_, info]) => info.order > 0 && info.order > lastOrder)
        .sort((a, b) => a[1].order - b[1].order)
        .forEach(([status, info]) => {
          const startDate = new Date(latestEndDate);

          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + info.duration);

          latestEndDate = new Date(endDate);

          // Only add if we don't already have this phase
          if (!phases.has(info.name)) {
            phases.set(info.name, {
              status: status as ProjectStatus,
              startDate,
              endDate,
              progress: 0,
            });
          }
        });
    }

    // Convert phases map to tasks array
    let taskId = 1;
    Array.from(phases.entries()).forEach(([name, phase]) => {
      projectTasks.push({
        id: `task-${taskId++}`,
        name,
        startDate: phase.startDate,
        endDate: phase.endDate,
        progress: phase.progress,
        status: phase.status,
        // Simple dependency chain - each task depends on the previous one
        dependencies: taskId > 2 ? [`task-${taskId - 2}`] : undefined,
        // Mark most tasks as on critical path for demo purposes
        isCriticalPath:
          name !== 'Documentation' &&
          name !== 'Photography' &&
          showCriticalPath,
      });
    });

    // Set time range for chart
    const timeBuffer = 3; // days before and after
    const rangeStart = new Date(projectStartDate);
    rangeStart.setDate(rangeStart.getDate() - timeBuffer);

    const projectEndDate = project.deadline || latestEndDate;
    const rangeEnd = new Date(projectEndDate);
    rangeEnd.setDate(rangeEnd.getDate() + timeBuffer);

    setTimeRange({ start: rangeStart, end: rangeEnd });
    setTasks(projectTasks);
  }, [project, showCriticalPath]);

  // Calculate the total days in the time range
  const totalDays = Math.ceil(
    (timeRange.end.getTime() - timeRange.start.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  // Generate array of dates for the time axis
  const dateArray = Array.from({ length: totalDays }, (_, i) => {
    const date = new Date(timeRange.start);
    date.setDate(date.getDate() + i);
    return date;
  });

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calculate position and width of task bars
  const getTaskPosition = (task: TimelineTask) => {
    const taskStart = Math.max(
      0,
      Math.floor(
        (task.startDate.getTime() - timeRange.start.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );

    const taskDuration = Math.max(
      1,
      Math.ceil(
        (task.endDate.getTime() - task.startDate.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );

    const percentStart = (taskStart / totalDays) * 100;
    const percentWidth = (taskDuration / totalDays) * 100;

    return {
      left: `${percentStart}%`,
      width: `${percentWidth}%`,
    };
  };

  // Get color based on task progress and status
  const getTaskColor = (task: TimelineTask) => {
    if (task.status === ProjectStatus.CANCELLED) {
      return 'bg-red-200 border-red-500';
    }

    if (
      task.status === ProjectStatus.ON_HOLD ||
      task.status === ProjectStatus.DELAYED ||
      task.status === ProjectStatus.WAITING_FOR_MATERIALS ||
      task.status === ProjectStatus.WAITING_FOR_TOOLS ||
      task.status === ProjectStatus.WAITING_FOR_CLIENT
    ) {
      return 'bg-amber-200 border-amber-500';
    }

    if (task.progress === 100) {
      return 'bg-green-200 border-green-500';
    }

    if (task.progress > 0) {
      return 'bg-blue-200 border-blue-500';
    }

    return 'bg-stone-200 border-stone-400';
  };

  // Get dependency lines between tasks
  const getDependencyLines = () => {
    const lines: React.ReactElement[] = [];

    tasks.forEach((task) => {
      if (!task.dependencies || task.dependencies.length === 0) return;

      task.dependencies.forEach((dependencyId) => {
        const dependencyTask = tasks.find((t) => t.id === dependencyId);
        if (!dependencyTask) return;

        const fromPosition = getTaskPosition(dependencyTask);
        const fromCenter =
          parseFloat(fromPosition.left) + parseFloat(fromPosition.width) / 2;

        const toPosition = getTaskPosition(task);
        const toCenter =
          parseFloat(toPosition.left) + parseFloat(toPosition.width) / 2;

        // Skip if positions can't be calculated
        if (isNaN(fromCenter) || isNaN(toCenter)) return;

        // Create simple right-angled dependency line
        const fromX = `${fromCenter}%`;
        const fromY = '50%';
        const toX = `${toCenter}%`;

        const isBackward = fromCenter > toCenter;

        if (!isBackward) {
          lines.push(
            <polyline
              key={`${task.id}-${dependencyId}`}
              points={`${fromX},${fromY} ${toX},${fromY}`}
              stroke='#9CA3AF'
              strokeWidth='1'
              strokeDasharray='4'
              markerEnd='url(#arrowhead)'
            />
          );
        }
      });
    });

    return lines;
  };

  return (
    <div className='bg-white p-4 rounded-lg shadow-sm border border-stone-200'>
      <h3 className='font-medium text-lg mb-4'>Project Timeline</h3>

      {/* Time axis */}
      <div className='relative mb-6'>
        <div className='flex border-b border-stone-300'>
          {dateArray.map((date, index) => (
            <div
              key={index}
              className='flex1 text-xs text-stone-500 pb-1 text-center'
              style={{ minWidth: `${100 / totalDays}%` }}
            >
              {index % 3 === 0 && formatDate(date)}
            </div>
          ))}
        </div>

        {/* Today marker */}
        <div
          className='absolute top-0 bottom-0 w-px bg-red-500 z-10'
          style={{
            left: `${Math.max(
              0,
              Math.min(
                100,
                ((new Date().getTime() - timeRange.start.getTime()) /
                  (timeRange.end.getTime() - timeRange.start.getTime())) *
                  100
              )
            )}%`,
          }}
        >
          <div className='absolute top-6 -ml-14 w-28 text-center'>
            <span className='text-xs font-medium bg-red-100 text-red-700 px-2 py-1 rounded'>
              Today
            </span>
          </div>
        </div>

        {/* Project deadline marker */}
        {project.deadline && (
          <div
            className='absolute top-0 bottom-0 w-px bg-amber-500 z-10 border-l border-dashed border-amber-400'
            style={{
              left: `${Math.max(
                0,
                Math.min(
                  100,
                  ((new Date(project.deadline).getTime() -
                    timeRange.start.getTime()) /
                    (timeRange.end.getTime() - timeRange.start.getTime())) *
                    100
                )
              )}%`,
            }}
          >
            <div className='absolute top-12 -ml-14 w-28 text-center'>
              <span className='text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded'>
                Deadline
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Gantt chart */}
      <div
        className='relative'
        style={{ height: `${tasks.length * 40 + 20}px` }}
      >
        {/* SVG for dependency lines */}
        <svg
          className='absolute top-0 left-0 w-full h-full z-0 overflow-visible'
          style={{ pointerEvents: 'none' }}
        >
          <defs>
            <marker
              id='arrowhead'
              markerWidth='5'
              markerHeight='5'
              refX='5'
              refY='2.5'
              orient='auto'
            >
              <polygon points='0 0, 5 2.5, 0 5' fill='#9CA3AF' />
            </marker>
          </defs>
          {getDependencyLines()}
        </svg>

        {/* Task bars */}
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className='absolute h-8 flex items-center'
            style={{
              top: `${index * 40 + 10}px`,
              left: 0,
              right: 0,
            }}
          >
            <div className='w-1/4 pr-4 text-right'>
              <span className='text-sm font-medium text-stone-700'>
                {task.name}
              </span>
            </div>

            <div className='w-3/4 relative h-full'>
              {/* Task bar */}
              <div
                className={`absolute top-0 h-full rounded border ${getTaskColor(
                  task
                )} ${task.isCriticalPath ? 'ring-2 ring-amber-300' : ''}`}
                style={getTaskPosition(task)}
              >
                {/* Progress indicator */}
                {task.progress > 0 && (
                  <div
                    className='h-full bg-opacity-50 bg-blue-500 rounded-l'
                    style={{ width: `${task.progress}%` }}
                  ></div>
                )}

                {/* Task label (visible for longer tasks) */}
                {parseFloat(getTaskPosition(task).width) > 10 && (
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <span className='text-xs font-medium truncate px-2'>
                      {task.progress > 0 ? `${task.progress}%` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className='mt-6 flex flex-wrap gap-4 text-xs font-medium'>
        <div className='flex items-center'>
          <div className='w-4 h-4 bg-green-200 border border-green-500 rounded mr-2'></div>
          <span>Completed</span>
        </div>
        <div className='flex items-center'>
          <div className='w-4 h-4 bg-blue-200 border border-blue-500 rounded mr-2'></div>
          <span>In Progress</span>
        </div>
        <div className='flex items-center'>
          <div className='w-4 h-4 bg-stone-200 border border-stone-400 rounded mr-2'></div>
          <span>Planned</span>
        </div>
        <div className='flex items-center'>
          <div className='w-4 h-4 bg-amber-200 border border-amber-500 rounded mr-2'></div>
          <span>Waiting/On Hold</span>
        </div>
        {showCriticalPath && (
          <div className='flex items-center'>
            <div className='w-4 h-4 bg-stone-200 border border-stone-400 rounded ring-2 ring-amber-300 mr-2'></div>
            <span>Critical Path</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectTimeline;
