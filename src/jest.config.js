// jest.config.js
module.exports = {
  // Use the Jest environment for jsdom (browser-like environment)
  testEnvironment: "jsdom",
  
  // Ensure that Jest treats TypeScript files as ESM modules
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  
  // Setup files to run BEFORE Jest's test environment is set up
  // This ensures polyfills are available before any modules load
  setupFiles: ["<rootDir>/setupPolyfills.js"],
  
  // Setup files to run AFTER Jest's test environment is set up
  setupFilesAfterEnv: ["<rootDir>/src/tests/setupTests.ts"],
  
  // Transform TypeScript files with ts-jest
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.json",
        isolatedModules: true,
        diagnostics: { warnOnly: true }
      }
    ],
    // Transform JS files in node_modules that need it
    "node_modules/msw/.+\\.js$": "babel-jest"
  },
  
  // Tell Jest which files to transform and how
  transformIgnorePatterns: [
    "/node_modules/(?!(msw|@mswjs|@testing-library)).+\\.js$"
  ],
  
  // Map module paths to your source paths (matching your tsconfig paths)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@context/(.*)$": "<rootDir>/src/context/$1",
    "^@pages/(.*)$": "<rootDir>/src/pages/$1",
    "^@types/(.*)$": "<rootDir>/src/types/$1",
    "^@types$": "<rootDir>/src/types",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1"
  },
  
  // Specify file extensions Jest will look for
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  
  // Test file matching patterns
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],
  
  // Coverage settings
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/tests/**",
    "!src/**/index.{js,ts,jsx,tsx}",
    "!src/reportWebVitals.ts",
    "!src/serviceWorker.ts"
  ],
  
  maxWorkers: "50%",
  verbose: true,
  testTimeout: 15000, // Increased timeout for slower tests
};
