import React, { useState } from "react";
import { useMaterials } from "../../../context/MaterialsContext";
import {
  HardwareType,
  HardwareMaterialType,
  HardwareFinishType,
} from "../../../types/materialTypes";
import { formatType } from "../../../utils/materialHelpers";

const HardwareFilters: React.FC = () => {
  const { filters, setFilters } = useMaterials();
  const hardwareFilters = filters?.hardware || {};

  const [hardwareType, setHardwareType] = useState(
    hardwareFilters.hardwareType || ""
  );
  const [material, setMaterial] = useState(hardwareFilters.material || "");
  const [finish, setFinish] = useState(hardwareFilters.finish || "");
  const [size, setSize] = useState(hardwareFilters.size || "");
  const [color, setColor] = useState(hardwareFilters.color || "");

  const handleApplyFilters = () => {
    setFilters("hardware", {
      hardwareType,
      material,
      finish,
      size,
      color,
    });
  };

  const handleClearFilters = () => {
    setHardwareType("");
    setMaterial("");
    setFinish("");
    setSize("");
    setColor("");
    setFilters("hardware", {});
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-stone-700">Hardware Filters</h3>

      <div>
        <label className="block text-xs font-medium text-stone-500 mb-1">
          Hardware Type
        </label>
        <select
          value={hardwareType}
          onChange={(e) => setHardwareType(e.target.value)}
          className="w-full rounded-md border border-stone-300 py-1.5 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">All Types</option>
          {Object.values(HardwareType).map((type) => (
            <option key={type} value={type}>
              {formatType(type)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-stone-500 mb-1">
          Material
        </label>
        <select
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          className="w-full rounded-md border border-stone-300 py-1.5 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">All Materials</option>
          {Object.values(HardwareMaterialType).map((material) => (
            <option key={material} value={material}>
              {formatType(material)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-stone-500 mb-1">
          Finish
        </label>
        <select
          value={finish}
          onChange={(e) => setFinish(e.target.value)}
          className="w-full rounded-md border border-stone-300 py-1.5 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">All Finishes</option>
          {Object.values(HardwareFinishType).map((finish) => (
            <option key={finish} value={finish}>
              {formatType(finish)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-stone-500 mb-1">
          Size
        </label>
        <select
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="w-full rounded-md border border-stone-300 py-1.5 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">All Sizes</option>
          <option value="1/4 inch">1/4 inch</option>
          <option value="3/8 inch">3/8 inch</option>
          <option value="1/2 inch">1/2 inch</option>
          <option value="5/8 inch">5/8 inch</option>
          <option value="3/4 inch">3/4 inch</option>
          <option value="1 inch">1 inch</option>
          <option value="1.25 inch">1.25 inch</option>
          <option value="1.5 inch">1.5 inch</option>
          <option value="2 inch">2 inch</option>
        </select>
      </div>

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
          <option value="gold">Gold</option>
          <option value="silver">Silver</option>
          <option value="brass">Brass</option>
          <option value="nickel">Nickel</option>
          <option value="copper">Copper</option>
          <option value="antique_brass">Antique Brass</option>
          <option value="black">Black</option>
          <option value="gunmetal">Gunmetal</option>
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

export default HardwareFilters;
