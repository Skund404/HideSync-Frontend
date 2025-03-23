import React, { useState, useEffect } from 'react';
import { MaterialType } from '@/types/materialTypes';

interface Material {
  id: number;
  name: string;
  materialType: string;
  description?: string;
  unit: string;
  quantity: number;
  quality: string;
  supplier?: string;
  notes?: string;
}

interface MaterialFormProps {
    material?: Material | null;
    materialType: MaterialType;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
  }

const MaterialForm: React.FC<MaterialFormProps> = ({ 
  material, 
  materialType,
  onSubmit, 
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<Partial<Material>>({
    name: '',
    materialType: materialType.toLowerCase(),
    description: '',
    unit: 'square_foot',
    quality: 'standard',
    quantity: 0,
    notes: ''
  });
  const [error, setError] = useState<string | null>(null);

  // If editing, populate form with material data
  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name,
        materialType: material.materialType,
        description: material.description || '',
        unit: material.unit,
        quality: material.quality,
        quantity: material.quantity,
        notes: material.notes || ''
      });
    } else {
      // New material should use the selected materialType
      setFormData(prev => ({
        ...prev,
        materialType: materialType.toLowerCase()
      }));
    }
  }, [material, materialType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Convert quantity to number
    if (name === 'quantity') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the material');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-stone-700">
            Material Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-stone-700">
            Quantity
          </label>
          <input
            type="number"
            step="0.01"
            name="quantity"
            id="quantity"
            required
            value={formData.quantity}
            onChange={handleChange}
            className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-stone-700">
            Unit
          </label>
          <select
            name="unit"
            id="unit"
            required
            value={formData.unit}
            onChange={handleChange}
            className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
          >
            <option value="piece">Piece</option>
            <option value="square_foot">Square Foot</option>
            <option value="linear_foot">Linear Foot</option>
            <option value="yard">Yard</option>
            <option value="meter">Meter</option>
            <option value="spool">Spool</option>
            <option value="bottle">Bottle</option>
            <option value="package">Package</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="quality" className="block text-sm font-medium text-stone-700">
            Quality
          </label>
          <select
            name="quality"
            id="quality"
            required
            value={formData.quality}
            onChange={handleChange}
            className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
          >
            <option value="premium">Premium</option>
            <option value="professional">Professional</option>
            <option value="standard">Standard</option>
            <option value="economy">Economy</option>
            <option value="seconds">Seconds</option>
          </select>
        </div>
        
        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-stone-700">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
          ></textarea>
        </div>
        
        <div className="sm:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-stone-700">
            Notes
          </label>
          <textarea
            name="notes"
            id="notes"
            rows={2}
            value={formData.notes}
            onChange={handleChange}
            className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
          ></textarea>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-4 border border-stone-300 shadow-sm text-sm font-medium rounded-md text-stone-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        >
          {isLoading ? 'Saving...' : material ? 'Update Material' : 'Create Material'}
        </button>
      </div>
    </form>
  );
};

export default MaterialForm;