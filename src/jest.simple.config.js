module.exports = {
  // Use jsdom for a browser-like environment
  testEnvironment: "jsdom",

  // Setup files to run before tests
  setupFilesAfterEnv: ["<rootDir>/src/tests/setupTests.ts"],

  // Module name mappings
  moduleNameMapper: {
    // Map exactly "msw/node" to the Node adapter in MSW
    "^msw/node$": "<rootDir>/node_modules/msw/lib/node/index.js",
    // Map other msw imports (excluding "node") if needed
    "^msw/(?!node$)(.*)$": "<rootDir>/node_modules/msw/lib/$1",
    
    // (No mapping for @mswjs/interceptors/ClientRequest because we are handling it via jest.mock in setupTests.ts)

    // Handle CSS imports
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",

    // Handle image imports
    "\\.(jpg|jpeg|png|gif|webp|svg)$":
      "<rootDir>/src/tests/mocks/fileMock.js",

    // Handle module path aliases
    "^@/(.*)$": "<rootDir>/src/$1",

    // Auth and API client mocks
    "^@/utils/auth$": "<rootDir>/src/tests/mocks/utils/auth.ts",
    "^src/utils/auth$": "<rootDir>/src/tests/mocks/utils/auth.ts",
    "../utils/auth": "<rootDir>/src/tests/mocks/utils/auth.ts",
    "../services/api-client": "<rootDir>/src/tests/mocks/services/api-client.ts",
    "^src/services/api-client$": "<rootDir>/src/tests/mocks/services/api-client.ts",

    // Materials service mocks – many possible path variants
    "^src/services/materials-service$": "<rootDir>/src/tests/mocks/services/materials-service.ts",
    "../../services/materials-service": "<rootDir>/src/tests/mocks/services/materials-service.ts",
    "../services/materials-service": "<rootDir>/src/tests/mocks/services/materials-service.ts",
    "./services/materials-service": "<rootDir>/src/tests/mocks/services/materials-service.ts",
    "services/materials-service": "<rootDir>/src/tests/mocks/services/materials-service.ts",

    // Context mocks
    "^src/context/AuthContext$": "<rootDir>/src/tests/mocks/context/AuthContext.tsx",
    "^../context/AuthContext$": "<rootDir>/src/tests/mocks/context/AuthContext.tsx",
    "^src/context/DocumentationContext$": "<rootDir>/src/tests/mocks/context/DocumentationContext.tsx",
    "^src/context/MaterialsContext$": "<rootDir>/src/tests/mocks/context/MaterialsContext.tsx",
    "^src/context/PickingListContext$": "<rootDir>/src/tests/mocks/context/PickingListContext.tsx",
    "^src/context/ProjectContext$": "<rootDir>/src/tests/mocks/context/ProjectContext.tsx",
    "^src/context/ProjectTemplateContext$": "<rootDir>/src/tests/mocks/context/ProjectTemplateContext.tsx",
    "^src/context/PurchaseContext$": "<rootDir>/src/tests/mocks/context/PurchaseContext.tsx",
    "^src/context/RecurringProjectContext$": "<rootDir>/src/tests/mocks/context/RecurringProjectContext.tsx",
    "^src/context/StorageContext$": "<rootDir>/src/tests/mocks/context/StorageContext.tsx",
    "^src/context/SupplierContext$": "<rootDir>/src/tests/mocks/context/SupplierContext.tsx",

    // Component mocks
    "^src/components/common/ProtectedRoute$": "<rootDir>/src/tests/mocks/components/common/ProtectedRoute.tsx",
    "^src/components/layout/MainLayout$": "<rootDir>/src/tests/mocks/components/layout/MainLayout.tsx",
    "^src/components/development/ApiMonitor$": "<rootDir>/src/tests/mocks/components/development/ApiMonitor.tsx",

    // Page mocks
    "^src/pages/Login$": "<rootDir>/src/tests/mocks/pages/Login.tsx",
    "^src/pages/Dashboard$": "<rootDir>/src/tests/mocks/pages/Dashboard.tsx",
    "^src/pages/MaterialRoutes$": "<rootDir>/src/tests/mocks/pages/MaterialRoutes.tsx",
    "^src/pages/PatternRoutes$": "<rootDir>/src/tests/mocks/pages/PatternRoutes.tsx",
    "^src/pages/ProjectRoutes$": "<rootDir>/src/tests/mocks/pages/ProjectRoutes.tsx",
    "^src/pages/InventoryManagement$": "<rootDir>/src/tests/mocks/pages/InventoryManagement.tsx",
    "^src/pages/Storage$": "<rootDir>/src/tests/mocks/pages/Storage.tsx",
    "^src/pages/ToolManagement$": "<rootDir>/src/tests/mocks/pages/ToolManagement.tsx",
    "^src/pages/SupplierManagement$": "<rootDir>/src/tests/mocks/pages/SupplierManagement.tsx",
    "^src/pages/PurchaseOrderManagement$": "<rootDir>/src/tests/mocks/pages/PurchaseOrderManagement.tsx",
    "^src/pages/SalesManagement$": "<rootDir>/src/tests/mocks/pages/SalesManagement.tsx"
  },
transform: { "^.+\.(ts|tsx)$": [ "ts-jest", { tsconfig: "tsconfig.json", isolatedModules: true, diagnostics: { warnOnly: true } } ], "^.+\.(js|jsx)$": "babel-jest" },

transformIgnorePatterns: ["/node_modules/(?!(msw|@mswjs|@testing-library)).+\.js$"],

globals: { "ts-jest": { tsconfig: "tsconfig.json", isolatedModules: true } },

moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

testMatch: [ "/tests//.[jt]s?(x)", "**/?(.)+(spec|test).[jt]s?(x)" ],

collectCoverageFrom: [ "src//*.{js,jsx,ts,tsx}", "!src//*.d.ts", "!src/tests/", "!src//index.{js,ts,jsx,tsx}", "!src/reportWebVitals.ts", "!src/serviceWorker.ts" ],

maxWorkers: "50%", verbose: true, testTimeout: 10000 };