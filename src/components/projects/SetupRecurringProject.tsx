import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectType, SkillLevel } from '../../types/enums';
import {
  DayOfWeek,
  RecurrenceFrequency,
  RecurrencePattern,
  RecurringProject,
} from '../../types/recurringProject';

interface SetupRecurringProjectProps {
  existingId?: string;
  onSave?: (id: string) => void;
  onCancel?: () => void;
}

const SetupRecurringProject: React.FC<SetupRecurringProjectProps> = ({
  existingId,
  onSave,
  onCancel,
}) => {
  const navigate = useNavigate();

  // Mock implementations for the methods we need
  const createRecurringProject = async (project: Partial<RecurringProject>) => {
    console.log('Creating project:', project);
    // Mock implementation - replace with real API call when context is updated
    return { ...project, id: `project-${Date.now()}` } as RecurringProject;
  };

  const updateRecurringProject = async (
    id: string,
    updates: Partial<RecurringProject>
  ) => {
    console.log('Updating project:', id, updates);
    // Mock implementation - replace with real API call when context is updated
    return { id, ...updates } as RecurringProject;
  };

  const getRecurringProjectById = async (id: string) => {
    console.log('Getting project:', id);
    // Mock implementation - replace with real API call when context is updated
    return null as unknown as RecurringProject;
  };

  // Project state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>(
    ProjectType.WALLET
  );
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(
    SkillLevel.INTERMEDIATE
  );
  const [clientId, setClientId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [duration, setDuration] = useState(7); // Default 7 days

  // Initialize with a default recurrence pattern to avoid null/undefined issues
  const defaultPattern: RecurrencePattern = {
    id: '',
    name: '',
    frequency: RecurrenceFrequency.WEEKLY,
    interval: 1,
    startDate: new Date().toISOString(),
  };

  // Recurrence pattern state
  const [selectedPattern, setSelectedPattern] =
    useState<RecurrencePattern>(defaultPattern);

  // Load existing project if editing
  useEffect(() => {
    if (existingId) {
      const loadProject = async () => {
        try {
          const project = await getRecurringProjectById(existingId);
          if (project) {
            setName(project.name);
            setDescription(project.description);
            setProjectType(project.projectType);
            setSkillLevel(project.skillLevel);
            setClientId(project.clientId || '');
            setIsActive(project.isActive);
            setDuration(project.duration);
            setSelectedPattern(project.recurrencePattern);
          }
        } catch (error) {
          console.error('Error loading recurring project:', error);
        }
      };

      loadProject();
    }
  }, [existingId]);

  // Handle frequency change
  const handleFrequencyChange = (value: RecurrenceFrequency) => {
    // Use the null coalescing operator to ensure we don't spread undefined
    const updatedPattern = {
      ...(selectedPattern || defaultPattern),
      frequency: value,
    };
    setSelectedPattern(updatedPattern);
  };

  // Handle interval change
  const handleIntervalChange = (value: number) => {
    // Use the null coalescing operator to ensure we don't spread undefined
    const updatedPattern = {
      ...(selectedPattern || defaultPattern),
      interval: value,
    };
    setSelectedPattern(updatedPattern);
  };

  // Handle days of week selection
  const handleDaysOfWeekChange = (day: DayOfWeek) => {
    const currentDays = selectedPattern?.daysOfWeek || [];
    let selectedDays: DayOfWeek[];

    if (currentDays.includes(day)) {
      selectedDays = currentDays.filter((d) => d !== day);
    } else {
      selectedDays = [...currentDays, day];
    }

    // Use the null coalescing operator to ensure we don't spread undefined
    const updatedPattern = {
      ...(selectedPattern || defaultPattern),
      daysOfWeek: selectedDays,
    };
    setSelectedPattern(updatedPattern);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const projectData: Partial<RecurringProject> = {
        templateId: '', // Assign if using templates
        name,
        description,
        projectType,
        skillLevel,
        clientId: clientId || undefined,
        duration,
        components: [], // Add components as needed
        recurrencePattern: selectedPattern,
        isActive,
        autoGenerate: true,
        advanceNoticeDays: 3, // Default
        createdBy: 'current-user', // Replace with actual user ID
      };

      let id: string;

      if (existingId) {
        const updatedProject = await updateRecurringProject(
          existingId,
          projectData
        );
        id = existingId;
      } else {
        const newProject = await createRecurringProject(projectData);
        id = newProject.id;
      }

      if (onSave) {
        onSave(id);
      } else {
        navigate(`/projects/recurring/${id}`);
      }
    } catch (error) {
      console.error('Error saving recurring project:', error);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/projects/recurring');
    }
  };

  return (
    <div className='bg-white shadow rounded-lg p-6'>
      <h2 className='text-xl font-medium text-gray-900 mb-6'>
        {existingId ? 'Edit Recurring Project' : 'Create Recurring Project'}
      </h2>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Basic project information */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Project Name
            </label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full border border-gray-300 rounded-md shadow-sm p-2'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Project Type
            </label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as ProjectType)}
              className='w-full border border-gray-300 rounded-md shadow-sm p-2'
            >
              {Object.values(ProjectType).map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className='w-full border border-gray-300 rounded-md shadow-sm p-2'
            />
          </div>
        </div>

        {/* Recurrence pattern configuration */}
        <div className='border-t border-gray-200 pt-6'>
          <h3 className='text-lg font-medium text-gray-900 mb-4'>
            Recurrence Pattern
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Frequency
              </label>
              <select
                value={selectedPattern?.frequency || RecurrenceFrequency.WEEKLY}
                onChange={(e) =>
                  handleFrequencyChange(e.target.value as RecurrenceFrequency)
                }
                className='w-full border border-gray-300 rounded-md shadow-sm p-2'
              >
                {Object.values(RecurrenceFrequency).map((freq) => (
                  <option key={freq} value={freq}>
                    {freq.charAt(0).toUpperCase() + freq.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Repeat Every
              </label>
              <div className='flex items-center'>
                <input
                  type='number'
                  min='1'
                  value={selectedPattern?.interval || 1}
                  onChange={(e) =>
                    handleIntervalChange(parseInt(e.target.value))
                  }
                  className='w-20 border border-gray-300 rounded-md shadow-sm p-2 mr-2'
                />
                <span>
                  {selectedPattern?.frequency?.toLowerCase()}
                  {selectedPattern?.interval !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Days of week selection for weekly frequency */}
            {selectedPattern?.frequency === RecurrenceFrequency.WEEKLY && (
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  On these days
                </label>
                <div className='flex flex-wrap gap-2'>
                  {Object.values(DayOfWeek)
                    .filter((day) => typeof day === 'number')
                    .map((day) => (
                      <label
                        key={day}
                        className='inline-flex items-center p-2 border rounded'
                      >
                        <input
                          type='checkbox'
                          checked={
                            selectedPattern.daysOfWeek?.includes(
                              day as DayOfWeek
                            ) || false
                          }
                          onChange={() =>
                            handleDaysOfWeekChange(day as DayOfWeek)
                          }
                          className='mr-2'
                        />
                        {
                          ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
                            day as number
                          ]
                        }
                      </label>
                    ))}
                </div>
              </div>
            )}

            {/* Monthly recurrence options */}
            {selectedPattern?.frequency === RecurrenceFrequency.MONTHLY && (
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Monthly options
                </label>
                <div className='flex flex-col space-y-2'>
                  <label className='inline-flex items-center'>
                    <input
                      type='radio'
                      name='monthlyOption'
                      className='mr-2'
                      checked={!selectedPattern.dayOfWeekMonthly}
                      onChange={() => {
                        const { dayOfWeekMonthly, weekOfMonth, ...rest } =
                          selectedPattern;
                        setSelectedPattern({
                          ...rest,
                          dayOfMonth:
                            selectedPattern.dayOfMonth || new Date().getDate(),
                        });
                      }}
                    />
                    <span>Day of month</span>
                    {!selectedPattern.dayOfWeekMonthly && (
                      <select
                        className='ml-2 border border-gray-300 rounded'
                        value={selectedPattern.dayOfMonth || 1}
                        onChange={(e) =>
                          setSelectedPattern({
                            ...selectedPattern,
                            dayOfMonth: parseInt(e.target.value),
                          })
                        }
                      >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(
                          (day) => (
                            <option key={day} value={day}>
                              {day}
                            </option>
                          )
                        )}
                      </select>
                    )}
                  </label>

                  <label className='inline-flex items-center'>
                    <input
                      type='radio'
                      name='monthlyOption'
                      className='mr-2'
                      checked={!!selectedPattern.dayOfWeekMonthly}
                      onChange={() => {
                        const { dayOfMonth, ...rest } = selectedPattern;
                        setSelectedPattern({
                          ...rest,
                          dayOfWeekMonthly: DayOfWeek.MONDAY,
                          weekOfMonth: 1,
                        });
                      }}
                    />
                    <span>The</span>
                    {selectedPattern.dayOfWeekMonthly && (
                      <>
                        <select
                          className='mx-2 border border-gray-300 rounded'
                          value={selectedPattern.weekOfMonth || 1}
                          onChange={(e) =>
                            setSelectedPattern({
                              ...selectedPattern,
                              weekOfMonth: parseInt(e.target.value),
                            })
                          }
                        >
                          <option value={1}>First</option>
                          <option value={2}>Second</option>
                          <option value={3}>Third</option>
                          <option value={4}>Fourth</option>
                          <option value={5}>Last</option>
                        </select>

                        <select
                          className='border border-gray-300 rounded'
                          value={
                            selectedPattern.dayOfWeekMonthly || DayOfWeek.MONDAY
                          }
                          onChange={(e) =>
                            setSelectedPattern({
                              ...selectedPattern,
                              dayOfWeekMonthly: parseInt(
                                e.target.value
                              ) as DayOfWeek,
                            })
                          }
                        >
                          <option value={DayOfWeek.SUNDAY}>Sunday</option>
                          <option value={DayOfWeek.MONDAY}>Monday</option>
                          <option value={DayOfWeek.TUESDAY}>Tuesday</option>
                          <option value={DayOfWeek.WEDNESDAY}>Wednesday</option>
                          <option value={DayOfWeek.THURSDAY}>Thursday</option>
                          <option value={DayOfWeek.FRIDAY}>Friday</option>
                          <option value={DayOfWeek.SATURDAY}>Saturday</option>
                        </select>
                        <span className='ml-2'>of the month</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            )}

            {/* Yearly recurrence options */}
            {selectedPattern?.frequency === RecurrenceFrequency.YEARLY && (
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Month
                </label>
                <select
                  className='w-full border border-gray-300 rounded-md shadow-sm p-2'
                  value={selectedPattern.month || 1}
                  onChange={(e) =>
                    setSelectedPattern({
                      ...selectedPattern,
                      month: parseInt(e.target.value),
                    })
                  }
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {new Date(2000, month - 1, 1).toLocaleString('default', {
                        month: 'long',
                      })}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Project duration and status */}
        <div className='border-t border-gray-200 pt-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Project Duration (days)
              </label>
              <input
                type='number'
                min='1'
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className='w-full border border-gray-300 rounded-md shadow-sm p-2'
              />
            </div>

            <div className='flex items-center'>
              <label className='inline-flex items-center'>
                <input
                  type='checkbox'
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className='mr-2'
                />
                <span className='text-sm font-medium text-gray-700'>
                  Active
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Form actions */}
        <div className='border-t border-gray-200 pt-6 flex justify-end space-x-3'>
          <button
            type='button'
            onClick={handleCancel}
            className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'
          >
            Cancel
          </button>
          <button
            type='submit'
            className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700'
          >
            {existingId ? 'Update' : 'Create'} Recurring Project
          </button>
        </div>
      </form>
    </div>
  );
};

export default SetupRecurringProject;
