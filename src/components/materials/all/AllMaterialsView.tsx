import React, { useState, useEffect } from "react";
import { useMaterials } from "../../../context/MaterialsContext";
import MaterialCard from "../common/MaterialCard";
import EmptyState from "../common/EmptyState";
import { Material } from "../../../types/materialTypes";
import { filterMaterials } from "../../../utils/materialHelpers";

// Mock data import - in a real app, this would come from an API
import { supplyMaterials } from "../../../services/mock/supplies";

interface SuppliesViewProps {
  onAdd: () => void;
}

const SuppliesView: React.FC<SuppliesViewProps> = ({ onAdd }) => {
  const {
    viewMode,
    searchQuery,
    filterType,
    filterMaterial,
    filterFinish,
    filterStatus,
    filterStorage,
    filterSupplier,
  } = useMaterials();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [detailViewMaterial, setDetailViewMaterial] = useState<Material | null>(
    null
  );
  const [stockAdjustMaterial, setStockAdjustMaterial] =
    useState<Material | null>(null);

  // Simulate loading data from API
  useEffect(() => {
    const loadData = async () => {
      // In a real application, this would be an API call
      // For now, we'll just simulate a delay
      setTimeout(() => {
        setMaterials(supplyMaterials);
        setLoading(false);
      }, 500);
    };

    loadData();
  }, []);

  // Filter materials based on current filters
  const filteredMaterials = filterMaterials(materials, {
    searchQuery,
    filterType,
    filterMaterial,
    filterFinish,
    filterStatus,
    filterStorage,
    filterSupplier,
  });

  // View material details
  const handleViewMaterial = (material: Material) => {
    setDetailViewMaterial(material);
  };

  // Adjust stock
  const handleAdjustStock = (material: Material) => {
    setStockAdjustMaterial(material);
  };

  // Close detail modal
  const closeDetailModal = () => {
    setDetailViewMaterial(null);
  };

  // Close stock adjust modal
  const closeStockModal = () => {
    setStockAdjustMaterial(null);
  };

  // Render view based on viewMode
  const renderView = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <svg
            className="animate-spin -ml-1 mr-3 h-8 w-8 text-green-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-lg font-medium text-stone-600">
            Loading supplies...
          </span>
        </div>
      );
    }

    if (filteredMaterials.length === 0) {
      return <EmptyState onAdd={onAdd} />;
    }

    switch (viewMode) {
      case "grid":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <MaterialCard
                key={material.id}
                material={material}
                onView={handleViewMaterial}
                onAdjustStock={handleAdjustStock}
              />
            ))}
          </div>
        );
      case "list":
        return (
          <div className="bg-white shadow-sm rounded-lg border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-200">
                <thead className="bg-stone-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider"
                    >
                      Supply
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider"
                    >
                      Color
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider"
                    >
                      Quantity
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider"
                    >
                      Location
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider"
                    >
                      Supplier
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-stone-200">
                  {/* Table rows would go here */}
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-4 text-center text-sm text-stone-500"
                    >
                      List view implementation would show detailed supplies here
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case "storage":
        return (
          <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-stone-800 mb-2">
                Supplies Storage Map
              </h3>
              <p className="text-sm text-stone-600">
                Visual representation of supplies storage locations
              </p>
            </div>

            <div className="p-4 text-center border border-dashed border-stone-300 rounded-lg bg-stone-50">
              <p className="text-stone-600">
                Storage map view would be implemented here, showing where
                supplies are stored
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderView()}

      {/* Detail Modal */}
      {detailViewMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{detailViewMaterial.name}</h2>
              <button
                onClick={closeDetailModal}
                className="text-stone-400 hover:text-stone-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="text-center p-8 text-stone-600">
              Detailed supply information would be displayed here
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={closeDetailModal}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {stockAdjustMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Adjust Stock</h2>
              <button
                onClick={closeStockModal}
                className="text-stone-400 hover:text-stone-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="text-center p-8 text-stone-600">
              Stock adjustment form would be here
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={closeStockModal}
                className="px-4 py-2 border border-stone-300 rounded-md text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={closeStockModal}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SuppliesView;
