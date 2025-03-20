// src/components/materials/MaterialsTest.tsx
import React, { useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { getMaterials } from '../../services/materials-service';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';

const MaterialsTest: React.FC = () => {
  const { data, loading, error, execute } = useApi(getMaterials);

  useEffect(() => {
    execute(0, 10);
  }, [execute]);

  return (
    <div className='p-4'>
      <h2 className='text-xl font-bold mb-4'>Materials API Test</h2>

      {loading && <LoadingSpinner message='Loading materials from API...' />}

      {error && (
        <ErrorMessage
          message={`Error loading materials: ${error}`}
          onRetry={() => execute(0, 10)}
        />
      )}

      {data && (
        <div>
          <p className='mb-2'>Successfully loaded {data.length} materials:</p>
          <pre className='bg-gray-100 p-4 rounded overflow-auto'>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default MaterialsTest;
