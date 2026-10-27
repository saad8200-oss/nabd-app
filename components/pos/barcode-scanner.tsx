"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { X } from "lucide-react";

export default function BarcodeScanner({ onScan }: { onScan: (barcode: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isOpen) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText) => {
          onScan(decodedText);
          scanner.clear();
          setIsOpen(false);
        },
        (error) => {
          // تجاهل أخطاء المسح المستمرة
        }
      );
      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [isOpen, onScan]);

  return (
    <div>
      <button 
        onClick={() => setIsOpen(true)}
        className="glass-button flex items-center gap-2 px-4 py-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect width="4" height="4" x="10" y="10" rx="1"/></svg>
        مسح باركود
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]">
          <div className="bg-white p-4 rounded-xl w-full max-w-lg relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 mb-4 text-center">امسح الباركود</h2>
            <div id="reader" className="w-full"></div>
          </div>
        </div>
      )}
    </div>
  );
}