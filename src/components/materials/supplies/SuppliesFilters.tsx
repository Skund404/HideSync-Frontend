import React, { useState } from "react";
import { useMaterials } from "../../../context/MaterialsContext";
import {
  MaterialType,
  ThreadType,
  AdhesiveType,
  SuppliesType,
} from "../../../types/materialTypes";
import { formatType } from "../../../utils/materialHelpers";

const SuppliesFilters: React.FC = () => {
  const { filters, setFilters } = useMaterials();
  const suppliesFilters = filters.supplies || {};

  const [filterType, setFilterType] = useState(
    suppliesFilters.materialType || ""
  );
  const [color, setColor] = useState(suppliesFilters.color || "");
  const [brand, setBrand] = useState(suppliesFilters.brand || "");
  const [subType, setSubType] = useState(suppliesFilters.subType || "");

  // Get filtered MaterialType enum values relevant to supplies
  const supplyTypes = [
    MaterialType.THREAD,
    MaterialType.WAXED_THREAD,
    MaterialType.DYE,
    MaterialType.ADHESIVE,
    MaterialType.FINISH,
    MaterialType.EDGE_PAINT,
    MaterialType.BURNISHING_GUM,
  ];

  // Render subtype filter based on selected type
  const renderSubtypeFilter = () => {
    switch (filterType) {
      case MaterialType.THREAD:
      case MaterialType.WAXED_THREAD:
        return (
          <div>
            <label
              htmlFor="threadType"
              className="block text-xs font-medium text-stone-500 mb-1"
            >
              Thread Type
            </label>
            <select
              id="threadType"
              value={subType}
              onChange={(e) => setSubType(e.target.value)}
              className="w-full rounded-md border border-stone-300 py-1.5 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">All Thread Types</option>
              {Object.values(ThreadType).map((type) => (
                <option key={type} value={type}>
                  {formatType(type)}
                </option>
              ))}
            </select>
          </div>
        );
      case MaterialType.ADHESIVE:
        return (
          <div>
            <label
              htmlFor="adhesiveType"
              className="block text-xs font-medium text-stone-500 mb-1"
            >
              Adhesive Type
            </label>
            <select
              id="adhesiveType"
              value={subType}
              onChange={(e) => setSubType(e.target.value)}
              className="w-full rounded-md border border-stone-300 py-1.5 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">All Adhesive Types</option>
              {Object.values(AdhesiveType).map((type) => (
                <option key={type} value={type}>
                  {formatType(type)}
                </option>
              ))}
            </select>
          </div>
        );
      default:
        return null;
    }
  };

  const handleApplyFilters = () => {
    setFilters("supplies", {
      materialType: filterType,
      color,
      brand,
      subType,
    });
  };

  const handleClearFilters = () => {
    setFilterType("");
    setColor("");
    setBrand("");
    setSubType("");
    setFilters("supplies", {});
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-stone-700">Supplies Filters</h3>

      <div>
        <label className="block text-xs font-medium text-stone-500 mb-1">
          Material Type
        </label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full rounded-md border border-stone-300 py-1.5 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">All Types</option>
          {supplyTypes.map((type) => (
            <option key={type} value={type}>
              {formatType(type)}
            </option>
          ))}
        </select>
      </div>

      {renderSubtypeFilter()}

      <div>
        <label className="block text-xs font-medium text-stone-500 mb-1">
          Color
        </label>
        <select
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full rounded-md border border-stone-300 py-1.5 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">All Colors</option>
          <option value="black">Black</option>
          <option value="brown">Brown</option>
          <option value="tan">Tan</option>
          <option value="natural">Natural</option>
          <option value="red">Red</option>
          <option value="blue">Blue</option>
          <option value="green">Green</option>
          <option value="yellow">Yellow</option>
          <option value="white">White</option>
          <option value="clear">Clear</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-stone-500 mb-1">
          Brand
        </label>
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="w-full rounded-md border border-stone-300 py-1.5 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">All Brands</option>
          <option value="ritza">Ritza</option>
          <option value="fil_au_chinois">Fil Au Chinois</option>
          <option value="fiebing">Fiebing's</option>
          <option value="eco_flo">Eco-Flo</option>
          <option value="barge">Barge</option>
          <option value="tokonole">Tokonole</option>
          <option value="tandy">Tandy</option>
          <option value="weaver">Weaver</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="pt-2 flex space-x-2">
        <button
          onClick={handleApplyFilters}
          className="flex-1 bg-amber-600 text-white py-1.5 px-3 rounded-md text-sm font-medium hover:bg-amber-700"
        >
          Apply Filters
        </button>
        <button
          onClick={handleClearFilters}
          className="flex-1 bg-stone-100 text-stone-700 py-1.5 px-3 rounded-md text-sm font-medium hover:bg-stone-200"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default SuppliesFilters;
