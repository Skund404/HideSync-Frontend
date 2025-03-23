// src/components/documentation/printable/PrintPreview.tsx
import React, { useState } from 'react';
import { Code, Download, Image, PanelBottom, PanelLeft, PanelTop, Printer, Video, X } from 'lucide-react';

interface PrintPreviewProps {
  contentRef: React.RefObject<HTMLElement>;
  documentTitle: string;
  onClose: () => void;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({
  contentRef,
  documentTitle,
  onClose,
}) => {
  const [printSettings, setPrintSettings] = useState({
    includeImages: true,
    includeCode: true,
    includeVideos: false,
    includeHeaders: true,
    includeFooters: true,
    orientation: 'portrait' as 'portrait' | 'landscape',
    scale: 100, // percentage
  });

  // Handle print function without external dependencies
  const handlePrint = () => {
    if (!contentRef.current) return;

    const content = contentRef.current.innerHTML;

    // Create print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print this document');
      return;
    }

    // Generate print CSS based on settings
    const printStyles = `
      @page {
        size: ${printSettings.orientation};
        margin: 0.5in;
      }
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        zoom: ${printSettings.scale}%;
      }
      .print-container {
        max-width: 100%;
        margin: 0 auto;
        padding: 10px;
      }
      .print-only { 
        display: block !important; 
      }
      .no-print { 
        display: none !important; 
      }
      ${!printSettings.includeImages ? 'img { display: none !important; }' : ''}
      ${
        !printSettings.includeCode
          ? 'pre, code { display: none !important; }'
          : ''
      }
      ${
        !printSettings.includeVideos
          ? '.video-embed, [data-video] { display: none !important; }'
          : ''
      }
      ${
        !printSettings.includeHeaders
          ? '.print-header { display: none !important; }'
          : ''
      }
      ${
        !printSettings.includeFooters
          ? '.print-footer { display: none !important; }'
          : ''
      }

      /* Ensure page breaks are handled cleanly */
      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid;
        break-after: avoid;
      }
      p, blockquote, li {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      table {
        page-break-inside: auto;
        break-inside: auto;
      }
      tr {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    `;

    // Write the document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${documentTitle || 'HideSync Document'}</title>
          <style>${printStyles}</style>
        </head>
        <body>
          <div class="print-container">
            <div class="print-header" ${
              !printSettings.includeHeaders ? 'style="display:none"' : ''
            }>
              <h1>${documentTitle || 'HideSync Document'}</h1>
              <div class="print-date">Printed on ${new Date().toLocaleDateString()}</div>
            </div>
            
            <main>
              ${content}
            </main>
            
            <div class="print-footer" ${
              !printSettings.includeFooters ? 'style="display:none"' : ''
            }>
              <p>HideSync Documentation - Page <span class="pageNumber"></span></p>
              <p>© ${new Date().getFullYear()} HideSync. All rights reserved.</p>
            </div>
          </div>
          <script>
            // Print automatically and close
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 250);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  // Handle download as PDF if browser supports it
  const handleDownload = () => {
    // Browsers don't fully support PDF generation from HTML without libraries
    // This is just a fallback that triggers the print dialog
    // with emphasis on saving as PDF if the browser supports it
    window.alert('To save as PDF, select "Save as PDF" in the print dialog that will open.');
    handlePrint();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-medium">Print Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border-b">
          <div className="col-span-1">
            <h3 className="font-medium mb-2">Print Settings</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orientation
                </label>
                <div className="flex space-x-2">
                  <button
                    className={`flex items-center px-3 py-2 border rounded ${
                      printSettings.orientation === 'portrait'
                        ? 'bg-amber-50 border-amber-500 text-amber-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() =>
                      setPrintSettings({
                        ...printSettings,
                        orientation: 'portrait',
                      })
                    }
                  >
                    <PanelTop size={16} className="mr-1" />
                    Portrait
                  </button>

                  <button
                    className={`flex items-center px-3 py-2 border rounded ${
                      printSettings.orientation === 'landscape'
                        ? 'bg-amber-50 border-amber-500 text-amber-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() =>
                      setPrintSettings({
                        ...printSettings,
                        orientation: 'landscape',
                      })
                    }
                  >
                    <PanelLeft size={16} className="mr-1" />
                    Landscape
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scale ({printSettings.scale}%)
                </label>
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="10"
                  value={printSettings.scale}
                  onChange={(e) =>
                    setPrintSettings({
                      ...printSettings,
                      scale: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={printSettings.includeImages}
                    onChange={(e) =>
                      setPrintSettings({
                        ...printSettings,
                        includeImages: e.target.checked,
                      })
                    }
                    className="mr-2 h-4 w-4 text-amber-600 focus:ring-amber-500 rounded"
                  />
                  <span className="flex items-center">
                    <Image size={16} className="mr-1 text-gray-500" />
                    Include Images
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={printSettings.includeCode}
                    onChange={(e) =>
                      setPrintSettings({
                        ...printSettings,
                        includeCode: e.target.checked,
                      })
                    }
                    className="mr-2 h-4 w-4 text-amber-600 focus:ring-amber-500 rounded"
                  />
                  <span className="flex items-center">
                    <Code size={16} className="mr-1 text-gray-500" />
                    Include Code Blocks
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={printSettings.includeVideos}
                    onChange={(e) =>
                      setPrintSettings({
                        ...printSettings,
                        includeVideos: e.target.checked,
                      })
                    }
                    className="mr-2 h-4 w-4 text-amber-600 focus:ring-amber-500 rounded"
                  />
                  <span className="flex items-center">
                    <Video size={16} className="mr-1 text-gray-500" />
                    Include Video References
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={printSettings.includeHeaders}
                    onChange={(e) =>
                      setPrintSettings({
                        ...printSettings,
                        includeHeaders: e.target.checked,
                      })
                    }
                    className="mr-2 h-4 w-4 text-amber-600 focus:ring-amber-500 rounded"
                  />
                  <span className="flex items-center">
                    <PanelTop size={16} className="mr-1 text-gray-500" />
                    Include Headers
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={printSettings.includeFooters}
                    onChange={(e) =>
                      setPrintSettings({
                        ...printSettings,
                        includeFooters: e.target.checked,
                      })
                    }
                    className="mr-2 h-4 w-4 text-amber-600 focus:ring-amber-500 rounded"
                  />
                  <span className="flex items-center">
                    <PanelBottom size={16} className="mr-1 text-gray-500" />
                    Include Footers
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <div className="bg-gray-100 border rounded-lg p-2 h-[400px] overflow-auto">
              <div
                className="bg-white border rounded shadow-sm mx-auto"
                style={{ maxWidth: '90%' }}
              >
                <div
                  className="preview-content p-4 text-xs overflow-hidden"
                  style={{
                    transform: `scale(${printSettings.scale / 100})`,
                    transformOrigin: 'top left',
                    width:
                      printSettings.orientation === 'portrait'
                        ? '8.5in'
                        : '11in',
                    height:
                      printSettings.orientation === 'portrait'
                        ? '11in'
                        : '8.5in',
                  }}
                >
                  {/* Preview header */}
                  {printSettings.includeHeaders && (
                    <div className="print-header border-b pb-4 mb-4">
                      <h1 className="text-xl font-bold">{documentTitle}</h1>
                      <div className="text-xs text-gray-500">
                        Printed on {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  )}
                
                  {/* Content preview */}
                  {contentRef.current && (
                    <div className="preview-content-inner">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: contentRef.current.innerHTML,
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Preview footer */}
                  {printSettings.includeFooters && (
                    <div className="print-footer border-t pt-4 mt-8 text-xs text-gray-500">
                      <p>HideSync Documentation - Page <span className="pageNumber">1</span></p>
                      <p>© {new Date().getFullYear()} HideSync. All rights reserved.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 flex justify-end space-x-3">
          <button
            onClick={handleDownload}
            className="flex items-center px-4 py-2 border border-gray-300 bg-gray-50 text-gray-700 rounded hover:bg-gray-100"
          >
            <Download size={18} className="mr-2" />
            Download as PDF
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
          >
            <Printer size={18} className="mr-2" />
            Print Document
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintPreview;