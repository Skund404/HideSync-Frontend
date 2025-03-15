// src/components/dashboard/StorageSummaryWidget.tsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useStorage } from "../../context/StorageContext";

/**
 * A dashboard widget that shows a summary of storage information
 */
const StorageSummaryWidget: React.FC = () => {
  const {
    storageLocations,
    storageOverview,
    fetchStorageLocations,
    fetchStorageOverview,
  } = useStorage();

  useEffect(() => {
    fetchStorageLocations();
    fetchStorageOverview();
  }, [fetchStorageLocations, fetchStorageOverview]);

  if (!storageOverview) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-stone-200 rounded w-1/3 mb-6"></div>
          <div className="flex space-x-4 mb-6">
            <div className="flex-1 space-y-4">
              <div className="h-3 bg-stone-200 rounded"></div>
              <div className="h-3 bg-stone-200 rounded"></div>
              <div className="h-3 bg-stone-200 rounded"></div>
            </div>
          </div>
          <div className="h-10 bg-stone-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Get the top storage locations that need attention
  const locationsNeedingAttention = storageOverview.lowSpace.slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-stone-800">Storage Status</h3>
        <Link
          to="/storage"
          className="text-sm text-amber-600 hover:text-amber-800"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="border border-stone-200 rounded-md p-3 text-center">
          <div className="text-sm text-stone-500 mb-1">Total Spaces</div>
          <div className="text-xl font-bold text-stone-800">
            {storageOverview.totalCapacity}
          </div>
        </div>
        <div className="border border-stone-200 rounded-md p-3 text-center">
          <div className="text-sm text-stone-500 mb-1">Used</div>
          <div className="text-xl font-bold text-stone-800">
            {storageOverview.totalUtilized}
          </div>
        </div>
        <div className="border border-stone-200 rounded-md p-3 text-center">
          <div className="text-sm text-stone-500 mb-1">Available</div>
          <div className="text-xl font-bold text-stone-800">
            {storageOverview.totalCapacity - storageOverview.totalUtilized}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-stone-500">Overall Utilization</div>
          <div
            className={`text-sm font-medium ${
              storageOverview.utilizationPercentage > 85
                ? "text-red-600"
                : storageOverview.utilizationPercentage > 65
                ? "text-amber-600"
                : "text-green-600"
            }`}
          >
            {storageOverview.utilizationPercentage}%
          </div>
        </div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              storageOverview.utilizationPercentage > 85
                ? "bg-red-500"
                : storageOverview.utilizationPercentage > 65
                ? "bg-amber-500"
                : "bg-green-500"
            }`}
            style={{ width: `${storageOverview.utilizationPercentage}%` }}
          ></div>
        </div>
      </div>

      {locationsNeedingAttention.length > 0 ? (
        <div>
          <h4 className="text-sm font-medium text-stone-700 mb-2">
            Needs Attention
          </h4>
          <div className="space-y-2">
            {locationsNeedingAttention.map((location) => (
              <div
                key={location.id}
                className="flex justify-between items-center p-2 bg-stone-50 rounded-md border border-stone-200"
              >
                <div>
                  <div className="text-sm font-medium text-stone-700">
                    {location.name}
                  </div>
                  <div className="text-xs text-stone-500">
                    {location.utilized}/{location.capacity} spaces used
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    location.utilized / location.capacity > 0.9
                      ? "bg-red-100 text-red-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {Math.round((location.utilized / location.capacity) * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center p-4 bg-green-50 rounded-md text-green-700 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          All storage locations have adequate space available
        </div>
      )}

      <Link
        to="/storage"
        className="mt-6 block w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-sm font-medium text-center"
      >
        Manage Storage
      </Link>
    </div>
  );
};

export default StorageSummaryWidget;
