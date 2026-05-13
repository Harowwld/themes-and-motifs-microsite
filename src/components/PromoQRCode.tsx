'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCodeIcon, DownloadIcon } from 'lucide-react';

interface PromoQRCodeProps {
  promoId: number;
  promoTitle: string;
  className?: string;
}

export default function PromoQRCode({ promoId, promoTitle, className = '' }: PromoQRCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [baseUrl, setBaseUrl] = useState<string>('');

  useEffect(() => {
    // Get the current base URL dynamically
    const getBaseUrl = () => {
      if (typeof window !== 'undefined') {
        return window.location.origin;
      }
      return '';
    };

    const currentBaseUrl = getBaseUrl();
    setBaseUrl(currentBaseUrl);

    const promoUrl = `${currentBaseUrl}/promos/${promoId}`;
    
    // Generate QR code
    const generateQR = async () => {
      try {
        setIsLoading(true);
        const dataUrl = await QRCode.toDataURL(promoUrl, {
          width: 200,
          margin: 1,
          color: {
            dark: '#2c2c2c',
            light: '#ffffff'
          },
          errorCorrectionLevel: 'M'
        });
        setQrDataUrl(dataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentBaseUrl) {
      generateQR();
    }
  }, [promoId]);

  const downloadQR = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `${promoTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_promo_qrcode.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex flex-col items-center">
        {isLoading ? (
          <div className="w-10 h-10 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
            <QrCodeIcon className="h-4 w-4 text-gray-400" />
          </div>
        ) : qrDataUrl ? (
          <>
            <div className="w-[120px] h-[120px] bg-white p-2 rounded-lg border border-black/10">
              <img 
                src={qrDataUrl} 
                alt={`QR code for ${promoTitle}`}
                className="w-full h-full"
              />
            </div>
            <button
              onClick={downloadQR}
              className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-[#a68b6a] hover:text-[#957a5c] transition-colors"
              title="Download QR Code"
            >
              <DownloadIcon className="h-3 w-3" />
              Download QR
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
