// src/components/documentation/offline/OfflineGuideManager.tsx

import { AlertTriangle, CheckCircle, Info, Save, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDocumentation } from '../../../context/DocumentationContext';
import { DocumentationResource } from '../../../types/documentationTypes';

interface SavedGuide {
  id: string;
  title: string;
  savedAt: string;
  size: number;
}

const OfflineGuideManager: React.FC = () => {
  const { resources } = useDocumentation();
  const [savedGuides, setSavedGuides] = useState<string[]>([]);
  const [savedGuideDetails, setSavedGuideDetails] = useState<SavedGuide[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Load saved guide IDs from localStorage on component mount
  useEffect(() => {
    const loadSavedGuides = () => {
      try {
        const saved = localStorage.getItem('hidesync_offline_guides');
        if (saved) {
          const savedIds = JSON.parse(saved) as string[];
          setSavedGuides(savedIds);

          // Load details for each saved guide
          const details = savedIds
            .map((id) => {
              const savedGuideJson = localStorage.getItem(
                `hidesync_guide_${id}`
              );
              if (savedGuideJson) {
                const guideData = JSON.parse(savedGuideJson);
                return {
                  id: guideData.id,
                  title: guideData.title,
                  savedAt:
                    localStorage.getItem(`hidesync_guide_${id}_saved_at`) ||
                    new Date().toISOString(),
                  size: savedGuideJson.length,
                };
              }
              return null;
            })
            .filter(Boolean) as SavedGuide[];

          setSavedGuideDetails(details);
        }
      } catch (error) {
        console.error('Error loading saved guides:', error);
      }
    };

    loadSavedGuides();
  }, []);

  // Save a guide for offline use
  const saveGuideOffline = async (resource: DocumentationResource) => {
    try {
      setIsSaving(true);

      // Add to saved guides list
      const updatedGuides = [...savedGuides, resource.id];
      setSavedGuides(updatedGuides);

      // Save to localStorage
      localStorage.setItem(
        'hidesync_offline_guides',
        JSON.stringify(updatedGuides)
      );
      localStorage.setItem(
        `hidesync_guide_${resource.id}`,
        JSON.stringify(resource)
      );
      localStorage.setItem(
        `hidesync_guide_${resource.id}_saved_at`,
        new Date().toISOString()
      );

      // Add to saved guide details
      const savedAt = new Date().toISOString();
      const size = JSON.stringify(resource).length;
      setSavedGuideDetails([
        ...savedGuideDetails,
        { id: resource.id, title: resource.title, savedAt, size },
      ]);

      setMessage({ text: 'Guide saved for offline use', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving guide offline:', error);
      setMessage({ text: 'Failed to save guide offline', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Remove a guide from offline storage
  const removeGuideOffline = (resourceId: string) => {
    try {
      // Remove from saved guides list
      const updatedGuides = savedGuides.filter((id) => id !== resourceId);
      setSavedGuides(updatedGuides);

      // Update savedGuideDetails
      const updatedDetails = savedGuideDetails.filter(
        (guide) => guide.id !== resourceId
      );
      setSavedGuideDetails(updatedDetails);

      // Update localStorage
      localStorage.setItem(
        'hidesync_offline_guides',
        JSON.stringify(updatedGuides)
      );
      localStorage.removeItem(`hidesync_guide_${resourceId}`);
      localStorage.removeItem(`hidesync_guide_${resourceId}_saved_at`);

      setMessage({ text: 'Guide removed from offline storage', type: 'info' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error removing guide:', error);
      setMessage({ text: 'Failed to remove guide', type: 'error' });
    }
  };

  // Calculate storage usage
  const getStorageUsage = () => {
    try {
      const totalSize = savedGuideDetails.reduce(
        (total, guide) => total + guide.size,
        0
      );

      return totalSize < 1024 * 1024
        ? `${(totalSize / 1024).toFixed(2)} KB`
        : `${(totalSize / (1024 * 1024)).toFixed(2)} MB`;
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      return 'Unknown';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  return (
    <div className='bg-white rounded-lg shadow-sm p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-medium'>Offline Guides</h2>
        <div className='text-sm text-gray-500'>
          Storage used: {getStorageUsage()}
        </div>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-md ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : message.type === 'error'
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          <div className='flex items-center'>
            {message.type === 'success' && (
              <CheckCircle size={18} className='mr-2' />
            )}
            {message.type === 'error' && (
              <AlertTriangle size={18} className='mr-2' />
            )}
            {message.type === 'info' && <Info size={18} className='mr-2' />}
            {message.text}
          </div>
        </div>
      )}

      <div className='mb-6'>
        <p className='text-gray-600'>
          Save guides for offline use in your workshop when an internet
          connection may not be available. Saved guides will be stored in your
          browser's local storage.
        </p>
      </div>

      {savedGuideDetails.length > 0 && (
        <div className='mb-8'>
          <h3 className='font-medium mb-3'>Saved Guides</h3>
          <div className='border rounded-lg overflow-hidden'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th
                    scope='col'
                    className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Guide
                  </th>
                  <th
                    scope='col'
                    className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Saved
                  </th>
                  <th
                    scope='col'
                    className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Size
                  </th>
                  <th
                    scope='col'
                    className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {savedGuideDetails.map((guide) => (
                  <tr key={guide.id}>
                    <td className='px-4 py-3 whitespace-nowrap'>
                      <a
                        href={`/documentation/${guide.id}`}
                        className='text-amber-600 hover:text-amber-800 font-medium'
                      >
                        {guide.title}
                      </a>
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
                      {formatDate(guide.savedAt)}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
                      {guide.size < 1024
                        ? `${guide.size} B`
                        : `${(guide.size / 1024).toFixed(1)} KB`}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-right text-sm'>
                      <button
                        onClick={() => removeGuideOffline(guide.id)}
                        className='text-red-600 hover:text-red-800'
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className='space-y-4'>
        <h3 className='font-medium'>Available Guides</h3>

        {resources.map((resource) => {
          const isSaved = savedGuides.includes(resource.id);

          return (
            <div
              key={resource.id}
              className='flex justify-between items-center p-3 border rounded-md'
            >
              <div>
                <h4 className='font-medium'>{resource.title}</h4>
                <p className='text-sm text-gray-500'>{resource.description}</p>
              </div>

              <div>
                {isSaved ? (
                  <button
                    onClick={() => removeGuideOffline(resource.id)}
                    className='flex items-center text-red-600 hover:text-red-800'
                    disabled={isSaving}
                  >
                    <Trash2 size={18} className='mr-1' />
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={() => saveGuideOffline(resource)}
                    className='flex items-center text-amber-600 hover:text-amber-800'
                    disabled={isSaving}
                  >
                    <Save size={18} className='mr-1' />
                    Save Offline
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {resources.length === 0 && (
          <div className='text-center py-4 text-gray-500'>
            No guides available
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineGuideManager;
