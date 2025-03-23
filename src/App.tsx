import { Route, Routes } from 'react-router-dom';
import './App.css';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import InventoryManagement from './pages/InventoryManagement';
import MaterialRoutes from './pages/MaterialRoutes';
import PatternRoutes from './pages/PatternRoutes';
import ProjectRoutes from './pages/ProjectRoutes';
import PurchaseOrderManagement from './pages/PurchaseOrderManagement';
import SalesManagement from './pages/SalesManagement';
import Storage from './pages/Storage';
import SupplierManagement from './pages/SupplierManagement';
import ToolManagement from './pages/ToolManagement';

// Import documentation pages
import ArticlePage from './pages/ArticlePage';
import Documentation from './pages/Documentation';
import EditDocumentation from './pages/EditDocumentation';

// Import auth-related components
import Login from './pages/Login';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// Import providers
import { DocumentationProvider } from './context/DocumentationContext';
import { MaterialsProvider } from './context/MaterialsContext';
import { PickingListProvider } from './context/PickingListContext';
import { ProjectProvider } from './context/ProjectContext';
import { ProjectTemplateProvider } from './context/ProjectTemplateContext';
import { PurchaseOrderProvider } from './context/PurchaseContext';
import { RecurringProjectProvider } from './context/RecurringProjectContext';
import { StorageProvider } from './context/StorageContext';
import { SupplierProvider } from './context/SupplierContext';

// Import API Monitor for development
import ApiMonitor from './components/development/ApiMonitor';

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <PurchaseOrderProvider>
          <SupplierProvider>
            <ProjectTemplateProvider>
              <RecurringProjectProvider>
                <PickingListProvider>
                  <StorageProvider>
                    <MaterialsProvider>
                      <DocumentationProvider>
                        <Routes>
                          {/* Public route */}
                          <Route path="/login" element={<Login />} />
                          
                          {/* Protected routes */}
                          <Route path='/' element={
                            <ProtectedRoute>
                              <MainLayout />
                            </ProtectedRoute>
                          }>
                            <Route index element={<Dashboard />} />
                            <Route
                              path='materials/*'
                              element={<MaterialRoutes />}
                            />
                            <Route
                              path='inventory'
                              element={<InventoryManagement />}
                            />
                            <Route
                              path='patterns/*'
                              element={<PatternRoutes />}
                            />
                            <Route
                              path='projects/*'
                              element={<ProjectRoutes />}
                            />
                            <Route path='storage' element={<Storage />} />
                            <Route path='tools' element={<ToolManagement />} />
                            <Route
                              path='suppliers'
                              element={<SupplierManagement />}
                            />
                            <Route
                              path='purchases'
                              element={<PurchaseOrderManagement />}
                            />
                            <Route path='sales' element={<SalesManagement />} />

                            {/* Documentation System Routes */}
                            <Route
                              path='documentation'
                              element={<Documentation />}
                            />
                            <Route
                              path='documentation/:resourceId'
                              element={<ArticlePage />}
                            />
                            <Route
                              path='documentation/edit/:resourceId'
                              element={<EditDocumentation />}
                            />
                          </Route>
                        </Routes>
                        
                        {/* API Monitor for development */}
                        {process.env.NODE_ENV === 'development' && <ApiMonitor />}
                      </DocumentationProvider>
                    </MaterialsProvider>
                  </StorageProvider>
                </PickingListProvider>
              </RecurringProjectProvider>
            </ProjectTemplateProvider>
          </SupplierProvider>
        </PurchaseOrderProvider>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;