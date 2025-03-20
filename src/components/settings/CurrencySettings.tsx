import React, { useState } from 'react';
import { AppConfig } from '../../config/appConfig';
import { useCurrency } from '../../context/CurrencyContext';

const CurrencySettings: React.FC = () => {
  const { currency, setCurrency } = useCurrency();
  const [selectedCurrency, setSelectedCurrency] = useState(currency);

  const handleSave = () => {
    setCurrency(selectedCurrency);
    alert('Currency settings have been saved!');
  };

  return (
    <div className='p-4 border rounded shadow-md max-w-sm'>
      <h4 className='text-xl font-bold mb-4'>Currency Settings</h4>
      <label htmlFor='currencySelect' className='block mb-2'>
        Select Currency:
      </label>
      <select
        id='currencySelect'
        value={selectedCurrency}
        onChange={(e) => setSelectedCurrency(e.target.value)}
        className='border p-2 mb-4 rounded w-full'
      >
        {(
          Object.keys(
            AppConfig.currencyOptions
          ) as (keyof typeof AppConfig.currencyOptions)[]
        ).map((key) => {
          const option = AppConfig.currencyOptions[key];
          return (
            <option key={key} value={option.code}>
              {option.code} ({option.symbol})
            </option>
          );
        })}
      </select>
      <button
        onClick={handleSave}
        className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition'
      >
        Save Settings
      </button>
    </div>
  );
};

export default CurrencySettings;

// Ensure the file is treated as a module since it is compiled with --isolatedModules:
export {};
