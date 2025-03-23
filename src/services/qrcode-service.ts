// src/services/qrcode-service.ts
import { apiClient } from './api-client';

export interface QRCodeParams {
  url: string;
  title: string;
  description?: string;
  size?: number;
  logoUrl?: string;
}

export interface QRCodeResponse {
  qrCodeUrl: string; // URL to the generated QR code image
  qrCodeSvg?: string; // SVG string of the QR code if available
}

// Generate a QR code through the API
export const generateQRCode = async (params: QRCodeParams): Promise<QRCodeResponse> => {
  const response = await apiClient.post<QRCodeResponse>('/qrcodes/generate', params);
  return response.data;
};

// Generate a QR code specifically for a storage location
export const generateStorageLocationQRCode = async (
  locationId: string,
  locationName: string,
  locationType: string
): Promise<QRCodeResponse> => {
  const locationUrl = `${window.location.origin}/storage/${locationId}`;
  
  return generateQRCode({
    url: locationUrl,
    title: locationName,
    description: `${locationType} Storage Location`,
  });
};