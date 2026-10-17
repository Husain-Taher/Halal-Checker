import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, X, AlertCircle } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    try {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 160 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
        },
        /* verbose= */ false
      );

      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          if (decodedText) {
            scanner.clear().catch(console.error);
            onScan(decodedText);
          }
        },
        (errorMessage) => {
          // Normal background frame scanning message, ignore harmless frames
        }
      );
    } catch (err: any) {
      setError(err?.message || 'Could not initialize camera scanner.');
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-slate-100">Align Barcode in Box</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Camera Area */}
        <div className="p-4 bg-black flex flex-col items-center justify-center min-h-[300px]">
          {error ? (
            <div className="text-center p-6 text-rose-400">
              <AlertCircle className="w-10 h-10 mx-auto mb-2" />
              <p className="text-sm">{error}</p>
              <p className="text-xs text-slate-400 mt-2">
                Make sure camera permissions are enabled in your browser.
              </p>
            </div>
          ) : (
            <div id="qr-reader" className="w-full text-slate-900 overflow-hidden rounded-xl" />
          )}
        </div>

        <div className="p-4 bg-slate-900/90 text-center">
          <p className="text-xs text-slate-400">
            Works with standard retail food UPC-A, EAN-13, and QR codes.
          </p>
        </div>
      </div>
    </div>
  );
};
