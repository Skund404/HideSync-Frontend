// src/pages/ProjectRoutes.tsx

import CreateFromTemplate from '@components/projects/CreateFromTemplate';
import ProjectDashboard from '@components/projects/ProjectDashboard'; // Import the new component
import ProjectDetailWrapper from '@components/projects/ProjectDetailWrapper';
import ProjectTemplateList from '@components/projects/ProjectTemplateList';
import RecurringProjectList from '@components/projects/RecurringProjectList';
import SaveAsTemplate from '@components/projects/SaveAsTemplate';
import SetupRecurringProject from '@components/projects/SetupRecurringProject';
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PickingListPages from './PickingListPages';
import ProjectTemplatePage from './ProjectTemplatePage';
import RecurringProjectPage from './RecurringProjectPage';

const ProjectRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Main project dashboard - Updated to use the new component */}
      <Route path='/' element={<ProjectDashboard />} />

      {/* Dedicated route for picking lists - matches sidebar navigation */}
      <Route path='/picking-lists/*' element={<PickingListPages />} />

      {/* Template routes */}
      <Route path='/templates' element={<ProjectTemplateList />} />
      <Route path='/templates/new' element={<ProjectTemplatePage />} />
      <Route path='/templates/:templateId' element={<ProjectTemplatePage />} />
      <Route path='/new/from-template' element={<CreateFromTemplate />} />
      <Route
        path='/new/from-template/:templateId'
        element={<CreateFromTemplate />}
      />

      {/* Recurring project routes */}
      <Route path='/recurring' element={<RecurringProjectList />} />
      <Route path='/recurring/new' element={<SetupRecurringProject />} />
      <Route
        path='/recurring/:recurringId'
        element={<RecurringProjectPage />}
      />
      <Route
        path='/recurring/:recurringId/edit'
        element={<SetupRecurringProject />}
      />

      {/* Dynamic project routes - THESE MUST COME AFTER specific routes */}
      <Route path='/:projectId' element={<ProjectDetailWrapper />} />
      <Route path='/:projectId/save-as-template' element={<SaveAsTemplate />} />
      <Route path='/:projectId/picking-list/*' element={<PickingListPages />} />
    </Routes>
  );
};

export default ProjectRoutes;
