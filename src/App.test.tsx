import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';

// Context Providers (kept from original)
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

// Page Imports (kept from original)
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

// 404 Not Found Component
const NotFound: React.FC = () => (
  <div className='flex flex-col items-center justify-center h-screen bg-stone-50'>
    <h1 className='text-4xl font-bold text-stone-800 mb-4'>
      404 - Page Not Found
    </h1>
    <p className='text-stone-600 mb-6'>
      The page you are looking for does not exist.
    </p>
    <button
      onClick={() => (window.location.href = '/')}
      className='px-6 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition'
    >
      Return to Dashboard
    </button>
  </div>
);

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

                              {/* Catch-all route for undefined paths */}
                              <Route path='*' element={<NotFound />} />
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
