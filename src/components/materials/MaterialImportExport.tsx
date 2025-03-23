// src/components/materials/MaterialImportExport.tsx
import React, { useState, useRef } from "react";
import { Download, Upload, FileSpreadsheet, X } from "lucide-react";
import { MaterialService } from "@/services/materials-service";
import { MaterialType } from "@/types/materialTypes";

// Advanced Error Handling Interface
interface ImportError {
  row?: number;
  message: string;
  details?: any;
}

// Import/Export Options Interfaces
interface ImportOptions {
  materialType?: MaterialType;
  replaceExisting: boolean;
  validateBeforeImport: boolean;
}

interface ExportOptions {
  materialType?: MaterialType;
  includeDetails?: boolean;
  fileFormat?: "csv" | "xlsx" | "json";
}

const MaterialImportExport: React.FC = () => {
  // State for file input and import results
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<{
    imported: number;
    errors: ImportError[];
  } | null>(null);

  // Import and export options with default values.
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    materialType: undefined,
    replaceExisting: false,
    validateBeforeImport: true,
  });

  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    materialType: undefined,
    includeDetails: false,
    fileFormat: "csv",
  });

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Material Type Options for Filtering
  const materialTypeOptions = Object.values(MaterialType);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      // Reset previous states
      setImportResults(null);
      setError(null);
    }
  };

  // Handle file import with advanced options
  const handleImport = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setImportResults(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Add import options (all values are now defined)
      if (importOptions.materialType) {
        formData.append("materialType", importOptions.materialType);
      }
      formData.append(
        "replaceExisting",
        importOptions.replaceExisting.toString()
      );
      formData.append(
        "validateBeforeImport",
        importOptions.validateBeforeImport.toString()
      );

      // Perform import (ensure your MaterialService accepts FormData now)
      const results = await MaterialService.importMaterials(formData);

      // Set import results
      setImportResults({
        imported: results.imported,
        errors: results.errors.map((err) => ({
          message: err.message || "Unknown import error",
          row: err.row,
          details: err,
        })),
      });

      // Check for import errors
      if (results.errors.length > 0) {
        setError(`Import completed with ${results.errors.length} errors`);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to import materials";
      setError(errorMessage);
      console.error("Import failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle file export with advanced options
  const handleExport = async () => {
    setLoading(true);
    setError(null);

    try {
      // Prepare export parameters
      const params: Record<string, any> = {};

      if (exportOptions.materialType) {
        params.materialType = exportOptions.materialType;
      }
      if (exportOptions.includeDetails) {
        params.includeDetails = true;
      }

      // Add the format property only if it's not CSV.
      const query =
        exportOptions.fileFormat && exportOptions.fileFormat !== "csv"
          ? { ...params, format: exportOptions.fileFormat }
          : params;

      // Perform export.
      const exportedFile: Blob = await MaterialService.exportMaterials(query);

      // Create download link.
      const url = window.URL.createObjectURL(exportedFile);
      const link = document.createElement("a");
      link.href = url;

      // Generate filename.
      const timestamp = new Date().toISOString().replace(/[:\.]/g, "-");
      const filename = `materials_export_${timestamp}.${exportOptions.fileFormat}`;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to export materials";
      setError(errorMessage);
      console.error("Export failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Clear selected file
  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setImportResults(null);
    setError(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-200 flex justify-between items-center">
        <h3 className="font-medium text-stone-800">Materials Import/Export</h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Import Section */}
        <div className="bg-stone-50 border border-stone-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-stone-700 mb-3 flex items-center">
            <FileSpreadsheet className="h-5 w-5 mr-2 text-amber-600" />
            Import Materials from CSV
          </h4>

          {/* Import Options */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">
                Material Type
              </label>
              <select
                value={importOptions.materialType || ""}
                onChange={(e) =>
                  setImportOptions((prev) => ({
                    ...prev,
                    materialType: e.target.value as MaterialType,
                  }))
                }
                className="w-full rounded-md border border-stone-300 p-2 text-sm"
              >
                <option value="">All Types</option>
                {materialTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2 mt-5">
              <input
                type="checkbox"
                id="replaceExisting"
                checked={importOptions.replaceExisting}
                onChange={(e) =>
                  setImportOptions((prev) => ({
                    ...prev,
                    replaceExisting: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300 rounded"
              />
              <label htmlFor="replaceExisting" className="text-sm text-stone-700">
                Replace Existing Materials
              </label>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.xlsx"
              onChange={handleFileSelect}
              className="hidden"
              disabled={loading}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white border border-stone-300 rounded-md text-sm text-stone-700 hover:bg-stone-50 flex items-center"
              disabled={loading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </button>

            {selectedFile && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-stone-600">
                  {selectedFile.name}
                </span>
                <button
                  onClick={clearSelectedFile}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <button
              onClick={handleImport}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                selectedFile
                  ? "bg-amber-600 text-white hover:bg-amber-700"
                  : "bg-stone-300 text-stone-500 cursor-not-allowed"
              }`}
              disabled={!selectedFile || loading}
            >
              {loading ? "Importing..." : "Import"}
            </button>
          </div>

          {/* Import Results */}
          {importResults && (
            <div className="mt-4 bg-white border border-stone-200 rounded-md p-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-stone-800">
                    Import Results
                  </div>
                  <div className="text-xs text-stone-600">
                    Successfully imported {importResults.imported} materials
                  </div>
                </div>
                {importResults.errors.length > 0 && (
                  <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                    {importResults.errors.length} Errors
                  </div>
                )}
              </div>

              {importResults.errors.length > 0 && (
                <details className="mt-2 text-xs text-stone-600">
                  <summary>View Errors</summary>
                  <div className="max-h-40 overflow-y-auto mt-2 bg-stone-50 p-2 rounded-md">
                    {importResults.errors.map((err, index) => (
                      <div key={index} className="mb-1">
                        <div className="font-semibold">
                          {err.row ? `Row ${err.row}: ` : ""}
                          {err.message}
                        </div>
                        {err.details && (
                          <pre className="text-xs text-stone-500 mt-1">
                            {JSON.stringify(err.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Export Section */}
        <div className="bg-stone-50 border border-stone-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-stone-700 mb-3 flex items-center">
            <Download className="h-5 w-5 mr-2 text-blue-600" />
            Export Materials
          </h4>

          {/* Export Options */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">
                Material Type
              </label>
              <select
                value={exportOptions.materialType || ""}
                onChange={(e) =>
                  setExportOptions((prev) => ({
                    ...prev,
                    materialType: e.target.value as MaterialType,
                  }))
                }
                className="w-full rounded-md border border-stone-300 p-2 text-sm"
              >
                <option value="">All Types</option>
                {materialTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">
                File Format
              </label>
              <select
                value={exportOptions.fileFormat}
                onChange={(e) =>
                  setExportOptions((prev) => ({
                    ...prev,
                    fileFormat: e.target.value as "csv" | "xlsx" | "json",
                  }))
                }
                className="w-full rounded-md border border-stone-300 p-2 text-sm"
              >
                <option value="csv">CSV</option>
                <option value="xlsx">Excel (XLSX)</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 mt-5">
              <input
                type="checkbox"
                id="includeDetails"
                checked={exportOptions.includeDetails}
                onChange={(e) =>
                  setExportOptions((prev) => ({
                    ...prev,
                    includeDetails: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300 rounded"
              />
              <label htmlFor="includeDetails" className="text-sm text-stone-700">
                Include Detailed Information
              </label>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-white border border-stone-300 rounded-md text-sm text-stone-700 hover:bg-stone-50 flex items-center"
              disabled={loading}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Materials
            </button>
          </div>

          <div className="mt-4 space-y-2">
            <div className="text-xs text-stone-500">
              Tip: Use filters to customize your export
            </div>
          </div>
        </div>

        {/* Global Error Handling */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Progress Indicator */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-amber-600"
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
              <span className="text-stone-700">
                {selectedFile ? "Importing..." : "Exporting..."}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialImportExport;
