// src/components/documentation/printable/PrintableGuide.tsx

import { Printer, Save, Settings, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useDocumentation } from '../../../context/DocumentationContext';
import { DocumentationCategory } from '../../../types/documentationTypes';
import PrintableTemplate from './PrintableTemplate';

interface PrintableGuideProps {
  resourceId: string;
  onClose: () => void;
}

const PrintableGuide: React.FC<PrintableGuideProps> = ({
  resourceId,
  onClose,
}) => {
  const { resources, loading, error } = useDocumentation();
  const printRef = useRef<HTMLDivElement>(null);
  const [showPrintSettings, setShowPrintSettings] = useState(false);
  const [printSettings, setPrintSettings] = useState({
    includeImages: true,
    includeCode: true,
    includeVideos: false,
    includeFooter: true,
    includeHeader: true,
  });

  const resource = resources.find((r) => r.id === resourceId);

  // Native print implementation without dependencies
  const handlePrint = () => {
    if (!printRef.current) return;

    const printContent = printRef.current.cloneNode(true) as HTMLElement;

    // Apply print settings
    if (!printSettings.includeImages) {
      const images = printContent.querySelectorAll('img');
      images.forEach((img) => {
        // Cast to HTMLElement to access style property
        (img as HTMLElement).style.display = 'none';
      });
    }

    if (!printSettings.includeCode) {
      const codeBlocks = printContent.querySelectorAll('pre, code');
      codeBlocks.forEach((block) => {
        // Cast to HTMLElement to access style property
        (block as HTMLElement).style.display = 'none';
      });
    }

    if (!printSettings.includeVideos) {
      const videos = printContent.querySelectorAll('.video-embed');
      videos.forEach((video) => {
        // Cast to HTMLElement to access style property
        (video as HTMLElement).style.display = 'none';
      });
    }

    if (!printSettings.includeHeader) {
      const header = printContent.querySelector('.header');
      if (header) {
        // Cast to HTMLElement to access style property
        (header as HTMLElement).style.display = 'none';
      }
    }

    if (!printSettings.includeFooter) {
      const footer = printContent.querySelector('.footer');
      if (footer) {
        // Cast to HTMLElement to access style property
        (footer as HTMLElement).style.display = 'none';
      }
    }

    // Create print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print this document');
      return;
    }

    // Print CSS specific to this document
    const printStyles = `
      @page {
        size: letter;
        margin: 0.5in;
      }
      
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
      }
      
      .print-container {
        max-width: 100%;
        margin: 0 auto;
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
      
      /* Handle images better for printing */
      img {
        max-width: 100% !important;
        max-height: 3in !important;
      }
      
      /* Enhance code block visibility */
      pre, code {
        white-space: pre-wrap !important;
        word-wrap: break-word !important;
        border: 1px solid #ddd;
        background-color: #f8f8f8 !important;
        color: #333 !important;
      }
      
      .hidden {
        display: none !important;
      }
    `;

    // Write the document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${resource?.title || 'HideSync Guide'}</title>
          <style>${printStyles}</style>
        </head>
        <body>
          <div class="print-container">
            ${printContent.innerHTML}
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

  const handleSaveOffline = () => {
    if (resource) {
      try {
        // Get existing saved guides
        const savedGuidesJson =
          localStorage.getItem('hidesync_offline_guides') || '[]';
        const savedGuides = JSON.parse(savedGuidesJson);

        // Check if guide is already saved
        if (!savedGuides.includes(resource.id)) {
          // Add to saved guides index
          savedGuides.push(resource.id);
          localStorage.setItem(
            'hidesync_offline_guides',
            JSON.stringify(savedGuides)
          );

          // Save the resource content
          localStorage.setItem(
            `hidesync_guide_${resource.id}`,
            JSON.stringify(resource)
          );

          alert('Guide saved for offline use');
        } else {
          alert('This guide is already saved for offline use');
        }
      } catch (error) {
        console.error('Error saving guide offline:', error);
        alert('Failed to save guide offline');
      }
    }
  };

  const getCategoryName = (category: DocumentationCategory) => {
    return category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  if (loading) {
    return <div className='text-center p-4'>Loading guide...</div>;
  }

  if (error || !resource) {
    return <div className='text-red-600 p-4'>Error loading guide</div>;
  }

  return (
    <div className='fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col'>
        <div className='flex justify-between items-center border-b p-4'>
          <h2 className='text-xl font-medium'>Print Guide</h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'
            aria-label='Close'
          >
            <X size={20} />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto'>
          <div className='p-4 flex flex-wrap gap-4 border-b'>
            <button
              onClick={handlePrint}
              className='flex items-center px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700'
            >
              <Printer className='mr-2' size={18} />
              Print Guide
            </button>

            <button
              onClick={handleSaveOffline}
              className='flex items-center px-4 py-2 border border-gray-300 rounded hover:bg-gray-50'
            >
              <Save className='mr-2' size={18} />
              Save Offline
            </button>

            <button
              onClick={() => setShowPrintSettings(!showPrintSettings)}
              className='flex items-center px-4 py-2 border border-gray-300 rounded hover:bg-gray-50'
            >
              <Settings className='mr-2' size={18} />
              Print Settings
            </button>
          </div>

          {showPrintSettings && (
            <div className='p-4 border-b bg-gray-50'>
              <h3 className='font-medium mb-3'>Print Settings</h3>
              <div className='space-y-2'>
                <label className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={printSettings.includeImages}
                    onChange={(e) =>
                      setPrintSettings({
                        ...printSettings,
                        includeImages: e.target.checked,
                      })
                    }
                    className='mr-2'
                  />
                  Include Images
                </label>

                <label className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={printSettings.includeCode}
                    onChange={(e) =>
                      setPrintSettings({
                        ...printSettings,
                        includeCode: e.target.checked,
                      })
                    }
                    className='mr-2'
                  />
                  Include Code Blocks
                </label>

                <label className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={printSettings.includeVideos}
                    onChange={(e) =>
                      setPrintSettings({
                        ...printSettings,
                        includeVideos: e.target.checked,
                      })
                    }
                    className='mr-2'
                  />
                  Include Video References (thumbnails only)
                </label>

                <label className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={printSettings.includeHeader}
                    onChange={(e) =>
                      setPrintSettings({
                        ...printSettings,
                        includeHeader: e.target.checked,
                      })
                    }
                    className='mr-2'
                  />
                  Include Header
                </label>

                <label className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={printSettings.includeFooter}
                    onChange={(e) =>
                      setPrintSettings({
                        ...printSettings,
                        includeFooter: e.target.checked,
                      })
                    }
                    className='mr-2'
                  />
                  Include Footer
                </label>
              </div>

              <div className='mt-4 p-2 bg-amber-50 text-amber-800 text-sm rounded'>
                <p className='text-xs'>
                  For better printing capabilities, install:
                </p>
                <pre className='mt-1 text-xs bg-gray-100 p-1 rounded'>
                  npm install react-to-print
                </pre>
              </div>
            </div>
          )}

          <div className='p-4'>
            <div className='print-preview bg-white border rounded-lg shadow-sm p-1'>
              <div ref={printRef}>
                <PrintableTemplate
                  title={resource.title}
                  description={resource.description}
                  content={resource.content}
                  date={new Date().toLocaleDateString()}
                  author={resource.author}
                  category={getCategoryName(resource.category)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className='border-t p-4 flex justify-end'>
          <button
            onClick={onClose}
            className='px-4 py-2 border border-gray-300 rounded hover:bg-gray-50'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintableGuide;
