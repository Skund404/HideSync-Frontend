// MaterialsManagement.test.tsx
import { render, screen } from '@testing-library/react';
import React from 'react';
import MaterialsManagement from './pages/MaterialsManagement';

// Mocks
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' }),
}));

jest.mock('@context/MaterialsContext', () => ({
  useMaterials: () => ({
    activeTab: 'LEATHER',
    setActiveTab: jest.fn(),
    // Add other required properties
  }),
}));

// Mock child components
jest.mock('@components/materials/common/MaterialsFilter', () => () => (
  <div>Filter</div>
));
jest.mock('@components/materials/common/MaterialsHeader', () => () => (
  <div>Header</div>
));
jest.mock('@components/materials/leather/LeatherView', () => () => (
  <div>Leather View</div>
));

test('renders MaterialsManagement', () => {
  render(<MaterialsManagement />);
  expect(screen.getByText('Header')).toBeInTheDocument();
  expect(screen.getByText('Filter')).toBeInTheDocument();
  expect(screen.getByText('Leather View')).toBeInTheDocument();
});
