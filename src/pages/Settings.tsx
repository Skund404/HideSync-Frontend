// src/pages/Settings.tsx
import React from 'react';
import CurrencySettings from '../components/settings/CurrencySettings';

const Settings: React.FC = () => {
  return (
    <div className='p-6'>
      <h2 className='text-2xl font-bold mb-4'>Settings</h2>
      <div className='mb-8'>
        {/* You can add additional settings components here */}
        <CurrencySettings />
      </div>
    </div>
  );
};

export default Settings;
