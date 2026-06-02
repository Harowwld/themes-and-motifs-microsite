'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCodeIcon, DownloadIcon } from 'lucide-react';

interface VendorQRCodeProps {
  vendorSlug: string;
  vendorName: string;
  className?: string;
}

export default function VendorQRCode({ vendorSlug, vendorName, className = '' }: VendorQRCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    if (!baseUrl) return;

    const vendorUrl = `${baseUrl}/suppliers/${vendorSlug}`;
    
    // Generate QR code
    const generateQR = async () => {
      try {
        setIsLoading(true);
        const dataUrl = await QRCode.toDataURL(vendorUrl, {
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

    generateQR();
  }, [vendorSlug, baseUrl]);

  const downloadQR = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `${vendorName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qrcode.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`rounded-2xl border border-black/6 bg-[#fcfbf9] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-md ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-semibold text-[#2c2c2c] flex items-center gap-2">
          <QrCodeIcon className="h-4 w-4 text-[#a68b6a]" />
          Share Supplier
        </h3>
        {qrDataUrl && !isLoading && (
          <button
            onClick={downloadQR}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#a68b6a] hover:text-[#957a5c] hover:-translate-y-[1px] active:scale-[0.95] transition-[transform,colors] duration-200 ease-out"
            title="Download QR Code"
          >
            <DownloadIcon className="h-3.5 w-3.5" />
            Download
          </button>
        )}
      </div>
      
      <div className="flex flex-col items-center">
        {isLoading ? (
          <div className="w-[200px] h-[200px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
            <QrCodeIcon className="h-8 w-8 text-gray-400" />
          </div>
        ) : qrDataUrl ? (
          <>
            <div className="w-[200px] h-[200px] bg-white p-3 rounded-xl border border-black/10 shadow-sm hover:shadow-md transition-shadow duration-300">
              <img 
                src={qrDataUrl} 
                alt={`QR code for ${vendorName}`}
                className="w-full h-full"
              />
            </div>
            <p className="mt-3 text-[12px] text-black/55 text-center leading-relaxed">
              Scan to view<br/>{vendorName}
            </p>
            <p className="mt-1 text-[11px] text-black/40 text-center break-all">
              {baseUrl}/suppliers/{vendorSlug}
            </p>
          </>
        ) : (
          <div className="w-[200px] h-[200px] bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-[12px] text-black/40 text-center">QR code unavailable</p>
          </div>
        )}
      </div>
    </div>
  );
}
