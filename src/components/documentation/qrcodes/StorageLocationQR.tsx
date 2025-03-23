// src/components/documentation/qrcodes/StorageLocationQR.tsx
import { Download, Printer, QrCode, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { generateStorageLocationQRCode } from '../../../services/qrcode-service';
import ErrorMessage from '../../common/ErrorMessage';
import LoadingSpinner from '../../common/LoadingSpinner';

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
  const [qrCodeData, setQrCodeData] = useState<{ url: string; svg?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Generate the URL for this specific storage location
  const locationUrl = `${window.location.origin}/storage/${locationId}`;

  // Fetch QR code from API
  const fetchQRCode = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await generateStorageLocationQRCode(locationId, locationName, locationType);
      setQrCodeData({
        url: result.qrCodeUrl,
        svg: result.qrCodeSvg
      });
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError('Failed to generate QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle modal open
  const handleOpenModal = () => {
    setIsModalOpen(true);
    if (!qrCodeData && !loading && !error) {
      fetchQRCode();
    }
  };

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

  // Download QR code image
  const handleDownload = () => {
    if (qrCodeData?.url) {
      const link = document.createElement('a');
      link.href = qrCodeData.url;
      link.download = `storage-${locationId}-qrcode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="flex items-center text-amber-600 hover:text-amber-800"
      >
        <QrCode size={18} className="mr-2" />
        Generate QR Code
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Storage Location QR Code</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600">
                Scan this QR code to quickly access this storage location in
                HideSync. Print and attach to your physical storage location for
                easy access.
              </p>
            </div>

            <div ref={printRef} className="p-4">
              {loading && <LoadingSpinner />}
              
              {error && (
                <ErrorMessage 
                  message={error} 
                  onRetry={fetchQRCode}
                />
              )}
              
              {!loading && !error && qrCodeData && (
                <>
                  {qrCodeData.svg ? (
                    <div className="flex justify-center mb-4">
                      <div dangerouslySetInnerHTML={{ __html: qrCodeData.svg }} />
                    </div>
                  ) : (
                    <div className="flex justify-center mb-4">
                      <img 
                        src={qrCodeData.url} 
                        alt={`QR Code for ${locationName}`}
                        className="w-48 h-48"
                      />
                    </div>
                  )}

                  <div className="text-center mt-4">
                    <h2 className="text-xl font-bold">{locationName}</h2>
                    <p className="text-gray-600">{locationType} Storage Location</p>
                    <p className="text-xs text-gray-500 mt-2">{locationUrl}</p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 flex justify-between">
              <div className="space-x-2">
                <button
                  onClick={handlePrint}
                  disabled={loading || !!error || !qrCodeData}
                  className="flex items-center px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Printer size={18} className="mr-2" />
                  Print Label
                </button>
                
                <button
                  onClick={handleDownload}
                  disabled={loading || !!error || !qrCodeData}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={18} className="mr-2" />
                  Download
                </button>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
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