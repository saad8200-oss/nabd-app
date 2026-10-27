"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getOfflineSales } from "@/lib/offline-db";
import Link from "next/link";

export default function OfflineReceiptPage() {
  const searchParams = useSearchParams();
  const saleId = searchParams.get("id");
  const [sale, setSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSale = async () => {
      if (!saleId) return;
      
      const offlineSales = await getOfflineSales();
      const found = offlineSales.find(s => s.id === saleId);
      setSale(found);
      setLoading(false);
    };
    loadSale();
  }, [saleId]);

  if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;
  if (!sale) return <div className="p-8 text-center">الفاتورة غير موجودة.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center">
      <div className="mb-4">
        <Link href="/pos" className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
          العودة لنقطة البيع
        </Link>
      </div>

      <div className="bg-white p-8 w-full max-w-md rounded-xl shadow-lg text-black">
        <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
          <h1 className="text-2xl font-bold">فاتورة (أوفلاين)</h1>
          <p className="text-sm mt-1">رقم الفاتورة: {sale.id.slice(0, 8)}...</p>
          <p className="text-sm mt-1">التاريخ: {new Date(sale.createdAt).toLocaleString('ar-EG')}</p>
        </div>

        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-right pb-2">المنتج</th>
              <th className="text-center pb-2">الكمية</th>
              <th className="text-left pb-2">السعر</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item: any, idx: number) => (
              <tr key={idx} className="border-b border-dashed border-gray-200">
                <td className="py-2">{item.name || 'منتج'}</td>
                <td className="text-center py-2">{item.quantity}</td>
                <td className="text-left py-2">{item.price * item.quantity} ج.م</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t-2 border-dashed border-gray-300 pt-4 text-sm">
          <div className="flex justify-between mb-2">
            <span>المجموع الفرعي:</span>
            <span>{sale.subtotal} ج.م</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>الخصم:</span>
            <span>{sale.discount} ج.م</span>
          </div>
          <div className="flex justify-between font-bold text-lg mt-2">
            <span>الإجمالي:</span>
            <span>{sale.total} ج.م</span>
          </div>
        </div>

        <div className="text-center mt-8 text-sm">
          <p className="font-bold mb-1">شكراً لزيارتكم!</p>
          <p className="text-xs text-gray-500">تم الإنشاء بواسطة نظام نبض</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background-color: #fff !important; margin: 0 !important; padding: 0 !important; }
          body * { visibility: hidden; }
          #receipt-print, #receipt-print * { visibility: visible; }
          #receipt-print { position: absolute; left: 0; top: 0; width: 100%; max-width: 100%; box-shadow: none !important; border-radius: 0 !important; }
        }
      `}</style>
    </div>
  );
}