"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Link from "next/link";

export default function QRLabelsClient({ products }: { products: any[] }) {
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

  useEffect(() => {
    const generateQRCodes = async () => {
      const codes: Record<string, string> = {};
      for (const product of products) {
        if (product.barcode) {
          const url = await QRCode.toDataURL(product.barcode, { width: 150 });
          codes[product.id] = url;
        }
      }
      setQrCodes(codes);
    };
    generateQRCodes();
  }, [products]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <h1 className="text-3xl font-bold text-slate-800">ملصقات QR للمنتجات</h1>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="btn-emerald flex items-center gap-2 px-4 py-2">
            طباعة الملصقات
          </button>
          <Link href="/inventory" className="btn-blue flex items-center gap-2 px-4 py-2">
            العودة للمخازن
          </Link>
        </div>
      </div>

      <div id="labels-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          product.barcode && (
            <div key={product.id} className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center bg-white">
              <p className="font-bold text-sm mb-1 text-black">{product.name}</p>
              <p className="text-xs text-gray-600 mb-2">{product.barcode}</p>
              {qrCodes[product.id] && (
                <img src={qrCodes[product.id]} alt="QR" className="w-24 h-24 mx-auto" />
              )}
              <p className="text-xs text-gray-500 mt-2">{product.price} ج.م</p>
            </div>
          )
        ))}
      </div>

      <style jsx global>{`
        @media print {
          body { background-color: #fff !important; margin: 0 !important; padding: 0 !important; }
          .print\\:hidden { display: none !important; }
          #labels-grid { 
            display: grid !important; 
            grid-template-columns: repeat(3, 1fr) !important; 
            gap: 10px !important;
          }
          #labels-grid > div {
            border: 1px solid #000 !important;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}