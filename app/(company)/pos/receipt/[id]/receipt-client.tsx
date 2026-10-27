"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ReceiptClient({ sale }: { sale: any }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center">
      <div className="mb-4">
        <Link href="/pos" className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
          العودة لنقطة البيع
        </Link>
      </div>

      <div id="receipt-print" className="bg-white p-8 w-full max-w-md rounded-xl shadow-lg text-black">
        <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
          <h1 className="text-2xl font-bold">{sale.company.name}</h1>
          {sale.company.address && <p className="text-sm mt-1">{sale.company.address}</p>}
          <p className="text-sm mt-1">هاتف: {sale.company.phone || 'غير مسجل'}</p>
          <p className="text-sm mt-1">رقم الفاتورة: {sale.invoiceNumber}</p>
          <p className="text-sm mt-1">التاريخ: {new Date(sale.createdAt).toLocaleString('ar-EG')}</p>
          <p className="text-sm mt-1">الكاشير: {sale.user.name}</p>
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
            {sale.items.map((item: any) => (
              <tr key={item.id} className="border-b border-dashed border-gray-200">
                <td className="py-2">{item.product.name}</td>
                <td className="text-center py-2">{item.quantity}</td>
                <td className="text-left py-2">{item.unitPrice * item.quantity} ج.م</td>
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
          <p className="font-bold mb-1">{sale.company.receiptFooter || "شكراً لزيارتكم!"}</p>
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