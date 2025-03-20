import { Route, Routes } from 'react-router-dom';
import './App.css';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import FinancialDashboard from './pages/FinancialDashboard';
import IntegrationCallback from './pages/IntegrationCallback';
import IntegrationsPage from './pages/IntegrationsPage';
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

// Import new Settings Page
import Settings from './pages/Settings';

// Import providers
import { ComponentProvider } from './context/ComponentContext';
import { CurrencyProvider } from './context/CurrencyContext'; // New CurrencyProvider
import { DocumentationProvider } from './context/DocumentationContext';
import { FinancialProvider } from './context/FinancialContext';
import { IntegrationsProvider } from './context/IntegrationsContext';
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

function App() {
  return (
    <CurrencyProvider>
      <ProjectProvider>
        <PurchaseOrderProvider>
          <SupplierProvider>
            <ProjectTemplateProvider>
              <RecurringProjectProvider>
                <PickingListProvider>
                  <StorageProvider>
                    <MaterialsProvider>
                      <FinancialProvider>
                        <DocumentationProvider>
                          <ToolProvider>
                            <PatternProvider>
                              <ComponentProvider>
                                <IntegrationsProvider>
                                  <Routes>
                                    <Route path='/' element={<MainLayout />}>
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
                                      <Route
                                        path='storage'
                                        element={<Storage />}
                                      />
                                      <Route
                                        path='tools'
                                        element={<ToolManagement />}
                                      />
                                      <Route
                                        path='suppliers'
                                        element={<SupplierManagement />}
                                      />
                                      <Route
                                        path='purchases'
                                        element={<PurchaseOrderManagement />}
                                      />
                                      <Route
                                        path='sales'
                                        element={<SalesManagement />}
                                      />
                                      <Route
                                        path='financial'
                                        element={<FinancialDashboard />}
                                      />
                                      <Route
                                        path='integrations'
                                        element={<IntegrationsPage />}
                                      />
                                      <Route
                                        path='integrations/callback'
                                        element={<IntegrationCallback />}
                                      />
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
                                      {/* Add Settings route */}
                                      <Route
                                        path='settings'
                                        element={<Settings />}
                                      />
                                    </Route>
                                  </Routes>
                                </IntegrationsProvider>
                              </ComponentProvider>
                            </PatternProvider>
                          </ToolProvider>
                        </DocumentationProvider>
                      </FinancialProvider>
                    </MaterialsProvider>
                  </StorageProvider>
                </PickingListProvider>
              </RecurringProjectProvider>
            </ProjectTemplateProvider>
          </SupplierProvider>
        </PurchaseOrderProvider>
      </ProjectProvider>
    </CurrencyProvider>
  );
}

export default App;
