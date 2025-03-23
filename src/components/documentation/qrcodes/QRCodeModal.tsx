// src/components/documentation/qrcodes/QRCodeModal.tsx
import { X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react'; // Using QRCodeSVG component
import React from 'react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  description?: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  url,
  title,
  description,
}) => {
  if (!isOpen) return null;
  
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center'>
      <div className='bg-white rounded-lg shadow-xl p-6 max-w-md w-full'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-medium'>{title}</h3>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'
          >
            <X size={20} />
          </button>
        </div>
        {description && <p className='text-gray-600 mb-4'>{description}</p>}
        <div className='flex justify-center mb-4'>
          <QRCodeSVG
            value={url}
            size={200}
            level='H'
            includeMargin={true}
          />
        </div>
        <div className='text-center text-sm text-gray-500'>
          <p>Scan this QR code with your mobile device</p>
          <p className='mt-1 text-xs'>{url}</p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;