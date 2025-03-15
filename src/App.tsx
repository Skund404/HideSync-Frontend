// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { MaterialsProvider } from './context/MaterialsContext';
import { PatternProvider } from './context/PatternContext';
import { PickingListProvider } from './context/PickingListContext';
import { ProjectProvider } from './context/ProjectContext';
import { ProjectTemplateProvider } from './context/ProjectTemplateContext';
import { PurchaseOrderProvider } from './context/PurchaseContext';
import { RecurringProjectProvider } from './context/RecurringProjectContext';
import { StorageProvider } from './context/StorageContext';
import { SupplierProvider } from './context/SupplierContext';
import { ToolProvider } from './context/ToolContext';
import Dashboard from './pages/Dashboard';
import InventoryManagement from './pages/InventoryManagement';
import MaterialsManagement from './pages/MaterialsManagement';
import PatternRoutes from './pages/PatternRoutes';
import ProjectRoutes from './pages/ProjectRoutes';
import PurchaseOrderManagement from './pages/PurchaseOrderManagement';
import RecurringProjectPage from './pages/RecurringProjectPage';
import Storage from './pages/Storage';
import SupplierManagement from './pages/SupplierManagement';
import ToolManagement from './pages/ToolManagement';

const App: React.FC = () => {
  return (
    <Router>
      <MaterialsProvider>
        <StorageProvider>
          <ToolProvider>
            <PatternProvider>
              <ProjectProvider>
                <ProjectTemplateProvider>
                  <RecurringProjectProvider>
                    <PickingListProvider>
                      <SupplierProvider>
                        <PurchaseOrderProvider>
                          <Layout>
                            <Routes>
                              <Route path='/' element={<Dashboard />} />
                              <Route
                                path='/projects/*'
                                element={<ProjectRoutes />}
                              />
                              <Route
                                path='/patterns/*'
                                element={<PatternRoutes />}
                              />
                              <Route
                                path='/tools'
                                element={<ToolManagement />}
                              />
                              <Route path='/storage' element={<Storage />} />
                              <Route
                                path='/materials/*'
                                element={<MaterialsManagement />}
                              />
                              <Route
                                path='/inventory'
                                element={<InventoryManagement />}
                              />
                              <Route
                                path='/recurring-projects/:id'
                                element={<RecurringProjectPage />}
                              />
                              <Route
                                path='/suppliers'
                                element={<SupplierManagement />}
                              />
                              <Route
                                path='/purchases'
                                element={<PurchaseOrderManagement />}
                              />
                            </Routes>
                          </Layout>
                        </PurchaseOrderProvider>
                      </SupplierProvider>
                    </PickingListProvider>
                  </RecurringProjectProvider>
                </ProjectTemplateProvider>
              </ProjectProvider>
            </PatternProvider>
          </ToolProvider>
        </StorageProvider>
      </MaterialsProvider>
    </Router>
  );
};

export default App;
