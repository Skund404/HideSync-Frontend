// src/pages/PatternDetailPage.tsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PatternDetail from '../components/patterns/PatternDetail';

const PatternDetailPage: React.FC = () => {
  // Use the id parameter from the URL
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Add some logging to verify the ID is being extracted correctly
  console.log('Pattern Detail Page - ID parameter:', id);

  const handleClose = () => {
    navigate('/patterns');
  };

  if (!id) {
    console.error('No ID found in URL parameters');
    return (
      <div className='p-6 bg-red-50 rounded-lg max-w-md mx-auto mt-10 text-center'>
        <h2 className='text-xl font-semibold text-red-700 mb-2'>Error</h2>
        <p className='text-red-600 mb-4'>No pattern ID provided in the URL.</p>
        <button
          onClick={() => navigate('/patterns')}
          className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md'
        >
          Return to Patterns
        </button>
      </div>
    );
  }

  // Parse the ID as a number and pass it to the PatternDetail component
  const patternId = parseInt(id, 10);

  return (
    <div className='min-h-screen bg-stone-50'>
      <PatternDetail patternId={patternId} onClose={handleClose} />
    </div>
  );
};

export default PatternDetailPage;
