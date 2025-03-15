// src/components/layout/Layout.tsx
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className='flex flex-col min-h-screen'>
      <Header title='HideSync' />
      <div className='flex flex-1'>
        <Sidebar />
        <main className='flex-1 p-6 bg-gray-100'>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
