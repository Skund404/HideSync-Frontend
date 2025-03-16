// src/components/documentation/qrcodes/QRCodeGenerator.tsx

import { Check, Copy, Download, Link } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface QRCodeGeneratorProps {
  url: string;
  title: string;
  description?: string;
  size?: number;
  logoUrl?: string;
  bgColor?: string;
  fgColor?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  url,
  title,
  description,
  size = 200,
  logoUrl,
  bgColor = '#FFFFFF',
  fgColor = '#000000',
}) => {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR code using canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    // Draw placeholder QR code pattern (simplified version)
    ctx.fillStyle = fgColor;

    // Draw position detection patterns (corners)
    // Top-left corner
    ctx.fillRect(10, 10, 30, 30);
    ctx.fillStyle = bgColor;
    ctx.fillRect(15, 15, 20, 20);
    ctx.fillStyle = fgColor;
    ctx.fillRect(20, 20, 10, 10);

    // Top-right corner
    ctx.fillStyle = fgColor;
    ctx.fillRect(size - 40, 10, 30, 30);
    ctx.fillStyle = bgColor;
    ctx.fillRect(size - 35, 15, 20, 20);
    ctx.fillStyle = fgColor;
    ctx.fillRect(size - 30, 20, 10, 10);

    // Bottom-left corner
    ctx.fillStyle = fgColor;
    ctx.fillRect(10, size - 40, 30, 30);
    ctx.fillStyle = bgColor;
    ctx.fillRect(15, size - 35, 20, 20);
    ctx.fillStyle = fgColor;
    ctx.fillRect(20, size - 30, 10, 10);

    // Draw QR code modules (dots) - simplified pattern
    const moduleSize = 5;
    const margin = 50;
    const gridSize = (size - 2 * margin) / moduleSize;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        // Generate a pseudo-random pattern based on the URL
        const charCode =
          (url.charCodeAt(i % url.length) + url.charCodeAt(j % url.length)) % 2;

        if (charCode === 1) {
          ctx.fillRect(
            margin + i * moduleSize,
            margin + j * moduleSize,
            moduleSize - 1,
            moduleSize - 1
          );
        }
      }
    }

    // Add text to indicate this is a fallback
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = '10px Arial';
    ctx.fillText('Install qrcode.react for actual QR codes', 10, size - 10);

    // Add logo if provided
    if (logoUrl) {
      const logoSize = size * 0.2;
      const logoX = (size - logoSize) / 2;
      const logoY = (size - logoSize) / 2;

      const logo = new Image();
      logo.onload = () => {
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
      };
      logo.src = logoUrl;
    }
  }, [url, size, bgColor, fgColor, logoUrl]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    if (canvasRef.current) {
      const pngUrl = canvasRef.current
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');

      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `hidesync-${title
        .toLowerCase()
        .replace(/\s+/g, '-')}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className='qr-generator p-4 border rounded-lg bg-white'>
      <div className='text-center mb-4'>
        <h3 className='text-lg font-medium'>{title}</h3>
        {description && <p className='text-sm text-gray-600'>{description}</p>}
      </div>

      <div className='flex justify-center mb-4'>
        <canvas
          ref={canvasRef}
          id='qr-canvas'
          width={size}
          height={size}
          className='border rounded'
        />
      </div>

      <div className='flex flex-col space-y-2'>
        <button
          onClick={handleDownload}
          className='flex items-center justify-center px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700'
        >
          <Download size={18} className='mr-2' />
          Download QR Code
        </button>

        <button
          onClick={handleCopyUrl}
          className='flex items-center justify-center px-4 py-2 border border-gray-300 rounded hover:bg-gray-50'
        >
          {copied ? (
            <>
              <Check size={18} className='mr-2 text-green-500' />
              URL Copied!
            </>
          ) : (
            <>
              <Copy size={18} className='mr-2' />
              Copy URL
            </>
          )}
        </button>

        <div className='flex items-center text-sm text-gray-500 mt-2 p-2 bg-gray-50 rounded break-all'>
          <Link size={16} className='mr-2 flex-shrink-0' />
          <span className='truncate'>{url}</span>
        </div>
      </div>

      <div className='mt-4 p-2 bg-amber-50 text-amber-800 text-sm rounded'>
        <p>Note: For functional QR codes, please install:</p>
        <pre className='mt-1 text-xs bg-gray-100 p-1 rounded'>
          npm install qrcode.react
        </pre>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
