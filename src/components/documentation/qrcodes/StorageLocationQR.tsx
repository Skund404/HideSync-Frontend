// src/components/documentation/qrcodes/StorageLocationQR.tsx

import { Printer, QrCode, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import QRCodeGenerator from './QRCodeGenerator';

interface StorageLocationQRProps {
  locationId: string;
  locationName: string;
  locationType: string;
}

const StorageLocationQR: React.FC<StorageLocationQRProps> = ({
  locationId,
  locationName,
  locationType,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Generate the URL for this specific storage location
  const locationUrl = `${window.location.origin}/storage/${locationId}`;

  // Simple print function that doesn't require external dependencies
  const handlePrint = () => {
    if (!printRef.current) return;

    // Create a new window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the QR code');
      return;
    }

    // Get content HTML
    const contentHtml = printRef.current.innerHTML;

    // Write to new window
    printWindow.document.write(`
      <html>
        <head>
          <title>Storage QR Code - ${locationName}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .qr-container { text-align: center; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="qr-container">
            ${contentHtml}
          </div>
        </body>
      </html>
    `);

    // Print and close
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className='flex items-center text-amber-600 hover:text-amber-800'
      >
        <QrCode size={18} className='mr-2' />
        Generate QR Code
      </button>

      {isModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-xl p-6 max-w-md w-full'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-medium'>Storage Location QR Code</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className='text-gray-500 hover:text-gray-700'
              >
                <X size={20} />
              </button>
            </div>

            <div className='mb-4'>
              <p className='text-gray-600'>
                Scan this QR code to quickly access this storage location in
                HideSync. Print and attach to your physical storage location for
                easy access.
              </p>
            </div>

            <div ref={printRef} className='p-4'>
              <QRCodeGenerator
                url={locationUrl}
                title={locationName}
                description={`${locationType} Storage Location`}
                size={200}
              />

              <div className='text-center mt-4 print-only'>
                <h2 className='text-xl font-bold'>{locationName}</h2>
                <p className='text-gray-600'>{locationType} Storage Location</p>
              </div>
            </div>

            <div className='mt-4 flex justify-between'>
              <button
                onClick={handlePrint}
                className='flex items-center px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700'
              >
                <Printer size={18} className='mr-2' />
                Print Label
              </button>

              <button
                onClick={() => setIsModalOpen(false)}
                className='px-4 py-2 border border-gray-300 rounded hover:bg-gray-100'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StorageLocationQR;
