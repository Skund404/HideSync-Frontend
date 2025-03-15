// src/components/patterns/components/ComponentMaterialList.tsx

import React, { useEffect, useState } from 'react';
import { useComponentContext } from '../../../context/ComponentContext';
import { ComponentMaterial } from '../../../types/patternTypes';
import ComponentMaterialForm from './ComponentMaterialForm';

interface ComponentMaterialListProps {
  componentId: number;
}

const ComponentMaterialList: React.FC<ComponentMaterialListProps> = ({
  componentId,
}) => {
  const { getComponentMaterials, deleteComponentMaterial } =
    useComponentContext();
  const [materials, setMaterials] = useState<ComponentMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMaterial, setEditingMaterial] =
    useState<ComponentMaterial | null>(null);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const componentMaterials = await getComponentMaterials(componentId);
      setMaterials(componentMaterials);
      setError(null);
    } catch (err) {
      setError('Failed to load materials');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [componentId]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this material?')) {
      try {
        await deleteComponentMaterial(id);
        await fetchMaterials();
      } catch (err) {
        setError('Failed to delete material');
        console.error(err);
      }
    }
  };

  const handleSave = async () => {
    await fetchMaterials();
    setShowAddForm(false);
    setEditingMaterial(null);
  };

  if (loading) return <div className='py-4'>Loading materials...</div>;
  if (error) return <div className='py-4 text-red-500'>{error}</div>;

  return (
    <div>
      {showAddForm || editingMaterial ? (
        <ComponentMaterialForm
          componentId={componentId}
          componentMaterial={editingMaterial || undefined}
          onSave={handleSave}
          onCancel={() => {
            setShowAddForm(false);
            setEditingMaterial(null);
          }}
        />
      ) : (
        <>
          {materials.length > 0 ? (
            <div className='overflow-hidden border border-stone-200 rounded-md'>
              <table className='min-w-full divide-y divide-stone-200'>
                <thead className='bg-stone-50'>
                  <tr>
                    <th className='px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'>
                      Material
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'>
                      Quantity
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'>
                      Required
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'>
                      Notes
                    </th>
                    <th className='px-4 py-3 relative'>
                      <span className='sr-only'>Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-stone-200'>
                  {materials.map((material) => (
                    <tr key={material.id} className='hover:bg-stone-50'>
                      <td className='px-4 py-3 whitespace-nowrap text-sm text-stone-800'>
                        Material #{material.materialId}
                        <span className='ml-2 text-xs text-stone-500'>
                          ({material.materialType})
                        </span>
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-sm text-stone-800'>
                        {material.quantity} {material.unit}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-sm'>
                        {material.isRequired ? (
                          <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800'>
                            Required
                          </span>
                        ) : (
                          <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800'>
                            Optional
                          </span>
                        )}
                      </td>
                      <td className='px-4 py-3 text-sm text-stone-500'>
                        {material.notes || '-'}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-right text-sm font-medium'>
                        <button
                          onClick={() => setEditingMaterial(material)}
                          className='text-amber-600 hover:text-amber-800 mr-3'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(material.id)}
                          className='text-red-600 hover:text-red-800'
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className='py-4 text-center bg-stone-50 rounded-md'>
              <p className='text-stone-500'>
                No materials associated with this component
              </p>
            </div>
          )}

          <div className='mt-4'>
            <button
              onClick={() => setShowAddForm(true)}
              className='inline-flex items-center px-3 py-2 border border-stone-300 shadow-sm text-sm leading-4 font-medium rounded-md text-stone-700 bg-white hover:bg-stone-50'
            >
              <svg
                className='-ml-0.5 mr-2 h-4 w-4'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              Add Material
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ComponentMaterialList;
