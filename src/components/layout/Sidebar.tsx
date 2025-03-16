import React from 'react';
import { Link } from 'react-router-dom';

// Types
export interface NavItem {
  name: string;
  path: string;
  icon: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

// Navigation data
const navigationData: NavSection[] = [
  {
    title: 'Main',
    items: [{ name: 'Dashboard', path: '/', icon: 'dashboard' }],
  },
  {
    title: 'Workshop',
    items: [
      { name: 'Projects', path: '/projects', icon: 'projects' },
      {
        name: 'Project Templates',
        path: '/projects/templates',
        icon: 'templates',
      },
      {
        name: 'Recurring Projects',
        path: '/projects/recurring',
        icon: 'recurring',
      },
      {
        name: 'Picking Lists',
        path: '/projects/picking-lists',
        icon: 'picking-list',
      },
      { name: 'Patterns', path: '/patterns', icon: 'patterns' },
      { name: 'Tools', path: '/tools', icon: 'tools' },
      { name: 'Storage', path: '/storage', icon: 'storage' },
    ],
  },
  {
    title: 'Materials',
    items: [
      { name: 'Leather', path: '/materials/leather', icon: 'leather' },
      { name: 'Hardware', path: '/materials/hardware', icon: 'hardware' },
      { name: 'Supplies', path: '/materials/supplies', icon: 'supplies' },
      { name: 'Inventory', path: '/materials/inventory', icon: 'inventory' },
    ],
  },
  {
    title: 'Business',
    items: [
      { name: 'Sales', path: '/sales', icon: 'sales' },
      { name: 'Customers', path: '/customers', icon: 'customers' },
      { name: 'Suppliers', path: '/suppliers', icon: 'suppliers' },
      { name: 'Purchases', path: '/purchases', icon: 'purchases' },
      { name: 'Reports', path: '/reports', icon: 'reports' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { name: 'Knowledge Base', path: '/documentation', icon: 'documentation' },
    ],
  },
];

// Icon Component
const Icon: React.FC<{ name: string }> = ({ name }) => {
  switch (name) {
    case 'dashboard':
      return (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-5 w-5 mr-3'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
          />
        </svg>
      );
    case 'projects':
      return (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-5 w-5 mr-3'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
          />
        </svg>
      );
    case 'picking-list':
      return (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-5 w-5 mr-3'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
          />
        </svg>
      );
    case 'patterns':
      return (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-5 w-5 mr-3'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01'
          />
        </svg>
      );
    case 'tools':
      return (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-5 w-5 mr-3'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
          />
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
          />
        </svg>
      );
    case 'storage':
      return (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-5 w-5 mr-3'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4'
          />
        </svg>
      );
    case 'leather':
      return (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-5 w-5 mr-3'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
          />
        </svg>
      );
    case 'hardware':
      return (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-5 w-5 mr-3'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z'
          />
        </svg>
      );
    case 'supplies':
      return (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-5 w-5 mr-3'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z'
          />
        </svg>
      );
    case 'inventory':
      return (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-5 w-5 mr-3'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
          />
        </svg>
      );
    case 'sales':
      return (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-5 w-5 mr-3'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
      );
    case 'customers':
      return (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-5 w-5 mr-3'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
          />
        </svg>
      );
    case 'suppliers':
      return (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-5 w-5 mr-3'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
          />
        </svg>
      );
    case 'purchases':
      return (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-5 w-5 mr-3'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
          />
        </svg>
      );
    case 'reports':
      return (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-5 w-5 mr-3'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
          />
        </svg>
      );
    case 'templates':
      return (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-5 w-5 mr-3'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2'
          />
        </svg>
      );
    case 'recurring':
      return (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-5 w-5 mr-3'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
          />
        </svg>
      );
    case 'documentation':
      return (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-5 w-5 mr-3'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
          />
        </svg>
      );
    // Add more icons as needed
    default:
      return null;
  }
};

// Sidebar Item Component
const SidebarItem: React.FC<{
  item: NavItem;
  isActive: boolean;
}> = ({ item, isActive }) => {
  const baseClasses =
    'flex items-center px-3 py-2 text-sm font-medium rounded-md';
  const activeClasses = 'bg-stone-700 text-stone-100';
  const inactiveClasses = 'text-stone-100 hover:bg-stone-700';

  return (
    <li className={isActive ? activeClasses : inactiveClasses}>
      <Link
        to={item.path}
        className={baseClasses}
        aria-current={isActive ? 'page' : undefined}
      >
        <span className={isActive ? 'text-stone-300' : 'text-stone-400'}>
          <Icon name={item.icon.toLowerCase()} />
        </span>
        {item.name}
      </Link>
    </li>
  );
};

// Sidebar Section Component
const SidebarSection: React.FC<{
  section: NavSection;
  currentPath: string;
}> = ({ section, currentPath }) => {
  return (
    <div>
      <div className='text-sm font-medium text-stone-400 uppercase tracking-wider mb-2'>
        {section.title}
      </div>
      <ul className='space-y-1'>
        {section.items.map((item) => (
          <SidebarItem
            key={item.path}
            item={item}
            isActive={
              item.path === '/'
                ? currentPath === '/'
                : currentPath.startsWith(item.path)
            }
          />
        ))}
      </ul>
    </div>
  );
};

// Main Sidebar Component
const Sidebar: React.FC<{ currentPath: string }> = ({ currentPath }) => {
  return (
    <div className='w-64 bg-stone-800 text-stone-100 flex flex-col shadow-lg h-full'>
      {/* Logo and Brand */}
      <div className='p-4 border-b border-stone-700 flex items-center space-x-3'>
        <div className='w-10 h-10 rounded-md bg-amber-700 flex items-center justify-center text-stone-100'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-6 w-6'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
            />
          </svg>
        </div>
        <div className='font-semibold text-xl'>HideSync</div>
      </div>

      {/* Main Navigation */}
      <nav className='flex-1 p-4 overflow-y-auto'>
        <div className='space-y-6'>
          {navigationData.map((section) => (
            <SidebarSection
              key={section.title}
              section={section}
              currentPath={currentPath}
            />
          ))}
        </div>
      </nav>

      {/* User Menu */}
      <div className='p-4 border-t border-stone-700'>
        <button className='flex items-center text-sm w-full'>
          <div className='w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center mr-3'>
            <span className='text-white font-medium'>JS</span>
          </div>
          <span className='flex-1 font-medium text-left'>John Smith</span>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5 text-stone-400'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 9l-7 7-7-7'
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export { Icon, navigationData };
export default Sidebar;
