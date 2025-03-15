// src/pages/PatternDebug.tsx
import React from 'react';
import { usePatternContext } from '../context/PatternContext';

const PatternDebug: React.FC = () => {
  const { patterns, loading, error } = usePatternContext();

  return (
    <div className='p-4 bg-red-50 border border-red-200 rounded m-4'>
      <h2 className='text-xl font-bold mb-2'>Pattern Debug</h2>
      <div>Loading: {loading ? 'Yes' : 'No'}</div>
      <div>Error: {error || 'None'}</div>
      <div>Pattern Count: {patterns.length}</div>
      <div className='mt-2'>
        <h3 className='font-bold'>Available Patterns:</h3>
        <ul className='list-disc pl-5'>
          {patterns.map((p) => (
            <li key={p.id}>
              ID: {p.id} - {p.name} ({p.fileType})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PatternDebug;
