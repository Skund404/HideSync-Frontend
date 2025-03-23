// src/components/materials/MaterialStorageAssignment.tsx
import React, { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { useMaterials } from "@/context/MaterialsContext";
import { useStorage } from "@/context/StorageContext";
import { 
  HardwareSubtype, 
  HardwareMaterialType, 
  MaterialType, 
  Material,
  isHardwareMaterial,
  LeatherSubtype,
  SuppliesSubtype,
  isLeatherMaterial,
  isSuppliesMaterial
} from "@/types/materialTypes";
import { StorageLocation } from "@/types/storage";
import { formatType } from "@/utils/materialHelpers";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog"; // Ensure this path exists
import { Button } from "@/components/ui/button"; // Ensure this path exists
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"; // Ensure this path exists
import { Input } from "@/components/ui/input"; // Ensure this path exists
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"; // Ensure this path exists
import { Loader2, Box, Layers, Droplet } from "lucide-react";
import { Badge } from "@/components/ui/badge"; // Ensure this path exists

// Enum for material categories
enum MaterialCategory {
  HARDWARE = 'hardware',
  LEATHER = 'leather',
  SUPPLIES = 'supplies'
}

// Interface for storage assignment
interface StorageAssignment {
  materialId: string;
  materialType: MaterialType;
  storageId: string;
  quantity: number;
  notes?: string;
}

// Adjust the type for Tabs component props
interface CustomTabsProps {
  value: MaterialCategory;
  onValueChange: (value: MaterialCategory) => void;
  children: React.ReactNode;
  className?: string;
}

const MaterialStorageAssignment: React.FC = () => {
  const { 
    materials, 
    loading: materialsLoading 
  } = useMaterials();
  
  const { 
    storageLocations, 
    assignMaterialToStorage,
    loading: storageLoading 
  } = useStorage();

  // State for form inputs
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory>(MaterialCategory.HARDWARE);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<StorageLocation | null>(null);
  const [quantity, setQuantity] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered materials based on selected category
  const filteredMaterials = useMemo(() => {
    switch (selectedCategory) {
      case MaterialCategory.HARDWARE:
        return materials.filter(isHardwareMaterial);
      case MaterialCategory.LEATHER:
        return materials.filter(isLeatherMaterial);
      case MaterialCategory.SUPPLIES:
        return materials.filter(isSuppliesMaterial);
      default:
        return [];
    }
  }, [materials, selectedCategory]);

  // Reset material selection when category changes
  useEffect(() => {
    setSelectedMaterial(null);
  }, [selectedCategory]);

  // Handle material selection
  const handleMaterialSelect = (materialId: string) => {
    const material = filteredMaterials.find(m => m.id === materialId);
    setSelectedMaterial(material || null);
  };

  // Handle storage selection
  const handleStorageSelect = (storageId: string) => {
    const storage = storageLocations.find(s => s.id === storageId);
    setSelectedStorage(storage || null);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedMaterial || !selectedStorage) {
      // Show error or return early
      return;
    }

    const parsedQuantity = parseFloat(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      // Show quantity error
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare storage assignment payload
      const assignmentPayload: StorageAssignment = {
        materialId: selectedMaterial.id,
        materialType: selectedMaterial.materialType,
        storageId: selectedStorage.id,
        quantity: parsedQuantity,
        notes: notes || undefined
      };

      // Update the method call to match the expected signature
      await assignMaterialToStorage(
        assignmentPayload.materialId, 
        assignmentPayload.materialType, 
        assignmentPayload.storageId, 
        assignmentPayload.quantity,
        assignmentPayload.notes
      );

      // Reset form
      setSelectedMaterial(null);
      setSelectedStorage(null);
      setQuantity('');
      setNotes('');
    } catch (error) {
      // Handle error
      console.error('Storage assignment failed', error);
      // Optionally show error toast or message
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render material type-specific details
  const renderMaterialDetails = () => {
    if (!selectedMaterial) return null;

    switch (selectedCategory) {
      case MaterialCategory.HARDWARE:
        return (
          <div className="space-y-2 bg-stone-50 p-3 rounded-md">
            <div className="flex justify-between">
              <span className="text-sm text-stone-600">Material:</span>
              <Badge variant="secondary">
                {formatType(selectedMaterial.subtype as HardwareSubtype)}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-stone-600">Current Quantity:</span>
              <span className="font-medium">
                {selectedMaterial.quantity} units
              </span>
            </div>
          </div>
        );
      case MaterialCategory.LEATHER:
        return (
          <div className="space-y-2 bg-stone-50 p-3 rounded-md">
            <div className="flex justify-between">
              <span className="text-sm text-stone-600">Type:</span>
              <Badge variant="secondary">
                {formatType(selectedMaterial.subtype as LeatherSubtype)}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-stone-600">Available Area:</span>
              <span className="font-medium">
                {selectedMaterial.quantity} sq ft
              </span>
            </div>
          </div>
        );
      case MaterialCategory.SUPPLIES:
        return (
          <div className="space-y-2 bg-stone-50 p-3 rounded-md">
            <div className="flex justify-between">
              <span className="text-sm text-stone-600">Type:</span>
              <Badge variant="secondary">
                {formatType(selectedMaterial.subtype as SuppliesSubtype)}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-stone-600">Current Stock:</span>
              <span className="font-medium">
                {selectedMaterial.quantity} units
              </span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Typed event handlers
  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuantity(e.target.value);
  };

  const handleNotesChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNotes(e.target.value);
  };

  // Custom Tabs component to handle type-safe props
  const CustomTabs: React.FC<CustomTabsProps> = ({ 
    value, 
    onValueChange, 
    children, 
    className 
  }) => (
    <Tabs 
      value={value} 
      onValueChange={(changedValue) => onValueChange(changedValue as MaterialCategory)}
      className={className}
    >
      {children}
    </Tabs>
  );

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-stone-800 flex items-center">
        <Box className="mr-3 text-amber-600" />
        Material Storage Assignment
      </h2>

      {/* Category Tabs */}
      <CustomTabs 
        value={selectedCategory} 
        onValueChange={setSelectedCategory}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value={MaterialCategory.HARDWARE}>
            <Layers className="mr-2 h-4 w-4" />
            Hardware
          </TabsTrigger>
          <TabsTrigger value={MaterialCategory.LEATHER}>
            <Droplet className="mr-2 h-4 w-4" />
            Leather
          </TabsTrigger>
          <TabsTrigger value={MaterialCategory.SUPPLIES}>
            <Box className="mr-2 h-4 w-4" />
            Supplies
          </TabsTrigger>
        </TabsList>
      </CustomTabs>

      {/* Material Selection */}
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1">
          Select {formatType(selectedCategory)} Material
        </label>
        <Select 
          onValueChange={handleMaterialSelect}
          value={selectedMaterial?.id || ''}
          disabled={materialsLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder={`Choose a ${selectedCategory} material`} />
          </SelectTrigger>
          <SelectContent>
            {filteredMaterials.map((material) => (
              <SelectItem 
                key={material.id} 
                value={material.id}
              >
                {material.name} - {material.quantity} units
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selected Material Details */}
      {selectedMaterial && renderMaterialDetails()}

      {/* Storage Location Selection */}
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1">
          Select Storage Location
        </label>
        <Select 
          onValueChange={handleStorageSelect}
          value={selectedStorage?.id || ''}
          disabled={storageLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a storage location" />
          </SelectTrigger>
          <SelectContent>
            {storageLocations.map((location) => (
              <SelectItem 
                key={location.id} 
                value={location.id}
              >
                {location.name} - {location.type} (Capacity: {location.utilized}/{location.capacity})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quantity Input */}
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1">
          Quantity to Store
        </label>
        <Input 
          type="number" 
          placeholder="Enter quantity" 
          value={quantity}
          onChange={handleQuantityChange}
          min="0"
          step="0.01"
          disabled={!selectedMaterial || !selectedStorage}
        />
      </div>

      {/* Optional Notes */}
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1">
          Notes (Optional)
        </label>
        <Input 
          type="text" 
          placeholder="Add any additional notes" 
          value={notes}
          onChange={handleNotesChange}
          disabled={!selectedMaterial || !selectedStorage}
        />
      </div>

      {/* Submit Button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            className="w-full"
            disabled={
              !selectedMaterial || 
              !selectedStorage || 
              !quantity || 
              isSubmitting
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              'Assign to Storage'
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Storage Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to assign {quantity} of {selectedMaterial?.name} 
              to {selectedStorage?.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {notes && (
            <div className="bg-stone-50 p-3 rounded-md">
              <p className="text-sm text-stone-600">
                <strong>Notes:</strong> {notes}
              </p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              Confirm Assignment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MaterialStorageAssignment;