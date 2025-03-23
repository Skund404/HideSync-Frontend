// src/components/documentation/offline/OfflineGuideManager.tsx
import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Download, Info, Trash2, X } from 'lucide-react';
import { useDocumentation } from '../../../context/DocumentationContext';
import { DocumentationResource } from '../../../types/documentationTypes';
import LoadingSpinner from '../../common/LoadingSpinner';

interface SavedGuide {
  id: string;
  title: string;
  savedAt: string;
  size: number;
}

interface OfflineGuideManagerProps {
  onClose?: () => void;
}

const OfflineGuideManager: React.FC<OfflineGuideManagerProps> = ({ onClose }) => {
  const { resources, loading } = useDocumentation();
  const [savedGuides, setSavedGuides] = useState<string[]>([]);
  const [savedGuideDetails, setSavedGuideDetails] = useState<SavedGuide[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ used: 0, available: 0 });
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResources, setFilteredResources] = useState<DocumentationResource[]>([]);

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
        setMessage({
          text: 'Error loading saved guides',
          type: 'error'
        });
      }
    };

    loadSavedGuides();
    estimateStorageUsage();
  }, []);

  // Filter resources based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredResources(resources);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = resources.filter(
      resource => 
        resource.title.toLowerCase().includes(term) || 
        resource.description.toLowerCase().includes(term)
    );
    
    setFilteredResources(filtered);
  }, [resources, searchTerm]);

  // Estimate storage usage
  const estimateStorageUsage = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        setStorageInfo({
          used: estimate.usage || 0,
          available: estimate.quota || 0
        });
      } catch (error) {
        console.error('Error estimating storage:', error);
      }
    }
  };

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
      
      // Update storage info
      estimateStorageUsage();
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
      
      // Update storage info
      estimateStorageUsage();
    } catch (error) {
      console.error('Error removing guide:', error);
      setMessage({ text: 'Failed to remove guide', type: 'error' });
    }
  };

  // Format bytes to human-readable size
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
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
    <div className="bg-white rounded-lg shadow-lg border border-stone-200 max-w-3xl mx-auto">
      <div className="flex justify-between items-center p-4 border-b border-stone-200">
        <h2 className="text-xl font-semibold">Manage Offline Documentation</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        )}
      </div>
      
      {/* Storage info */}
      <div className="p-4 bg-stone-50 border-b border-stone-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-stone-700">Storage Usage</h3>
            <p className="text-sm text-stone-600 mt-1">
              {formatBytes(storageInfo.used)} used of {formatBytes(storageInfo.available)} available
            </p>
          </div>
          
          <div className="flex items-center">
            <Download className="h-5 w-5 text-amber-600 mr-2" />
            <span className="text-sm font-medium">
              {savedGuideDetails.length} {savedGuideDetails.length === 1 ? 'document' : 'documents'} available offline
            </span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 bg-stone-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-amber-600 h-full"
            style={{ width: `${(storageInfo.used / storageInfo.available) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {message && (
        <div
          className={`m-4 p-3 rounded-md ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : message.type === 'error'
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          <div className="flex items-center">
            {message.type === 'success' && (
              <CheckCircle size={18} className="mr-2" />
            )}
            {message.type === 'error' && (
              <AlertTriangle size={18} className="mr-2" />
            )}
            {message.type === 'info' && <Info size={18} className="mr-2" />}
            {message.text}
          </div>
        </div>
      )}
      
      {/* Search */}
      <div className="p-4 border-b border-stone-200">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search documentation..."
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 pl-10"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Saved guides section */}
      {savedGuideDetails.length > 0 && (
        <div className="p-4 border-b border-stone-200">
          <h3 className="font-medium mb-3">Saved Guides</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider"
                  >
                    Guide
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider"
                  >
                    Saved
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider"
                  >
                    Size
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-stone-200">
                {savedGuideDetails.map((guide) => (
                  <tr key={guide.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <a
                        href={`/documentation/${guide.id}`}
                        className="text-amber-600 hover:text-amber-800 font-medium"
                      >
                        {guide.title}
                      </a>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-stone-500">
                      {formatDate(guide.savedAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-stone-500">
                      {guide.size < 1024
                        ? `${guide.size} B`
                        : `${(guide.size / 1024).toFixed(1)} KB`}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => removeGuideOffline(guide.id)}
                        className="text-red-600 hover:text-red-800"
                        aria-label="Remove from offline storage"
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
      
      {/* Available guides section */}
      <div className="max-h-96 overflow-y-auto p-4">
        <h3 className="font-medium mb-3">Available Guides</h3>
        
        {loading ? (
          <div className="text-center py-8">
            <LoadingSpinner size="small" message="Loading documentation..." />
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-8 text-stone-500">
            No guides found matching your criteria
          </div>
        ) : (
          <div className="space-y-3">
            {filteredResources.map((resource) => {
              const isSaved = savedGuides.includes(resource.id);
              const isProcessing = isSaving && resource.id === savedGuides[savedGuides.length - 1];
              
              return (
                <div
                  key={resource.id}
                  className="flex justify-between items-center p-3 border rounded-md hover:bg-stone-50"
                >
                  <div className="flex-grow">
                    <h4 className="font-medium text-stone-800">{resource.title}</h4>
                    <p className="text-sm text-stone-500 mt-1 line-clamp-2">
                      {resource.description}
                    </p>
                    <div className="mt-1 flex items-center text-xs text-stone-400">
                      <span className="inline-block px-2 py-0.5 bg-stone-100 rounded-full">
                        {resource.category.replace(/_/g, ' ')}
                      </span>
                      <span className="mx-2">•</span>
                      <span>{resource.type}</span>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {isProcessing ? (
                      <LoadingSpinner size="small" />
                    ) : isSaved ? (
                      <button
                        onClick={() => removeGuideOffline(resource.id)}
                        className="flex items-center text-red-600 hover:text-red-800"
                        aria-label="Remove from offline storage"
                      >
                        <Trash2 size={18} className="mr-1" />
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => saveGuideOffline(resource)}
                        className="flex items-center text-amber-600 hover:text-amber-800"
                        disabled={isSaving}
                      >
                        <Download size={18} className="mr-1" />
                        Save Offline
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Footer info */}
      <div className="p-4 border-t border-stone-200 bg-stone-50 text-sm text-stone-600">
        <p>
          Offline documentation is saved in your browser's storage and will be available even without an internet connection.
        </p>
      </div>
    </div>
  );
};

export default OfflineGuideManager;