"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import Image from "next/image"; // 👈 لاستخدام الصور

export default function ReceiptClient({ sale }: { sale: any }) {
  const [qrUrl, setQrUrl] = useState<string>("");

  // 👈 توليد رمز QR للدفع
  useEffect(() => {
    const generateQR = async () => {
      try {
        const paymentUrl = `${window.location.origin}/pay/${sale.id}`;
        const url = await QRCode.toDataURL(paymentUrl, { width: 120, margin: 1 });
        setQrUrl(url);
      } catch (err) {
        console.error(err);
      }
    };
    generateQR();
  }, [sale.id]);

  // 👈 الطباعة التلقائية
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!sale) return <div className="p-8 text-center text-red-500">الفاتورة غير موجودة.</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
      {/* زر العودة (لا يظهر في الطباعة) */}
      <div className="mb-6 print:hidden">
        <Link href="/pos" className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
          العودة لنقطة البيع
        </Link>
      </div>

      {/* الفاتورة (تظهر في الطباعة) */}
      <div id="receipt-print" className="bg-white p-8 w-full max-w-md rounded-xl shadow-2xl text-black relative overflow-hidden">
        
        {/* 👈 شعار الشركة (إذا وجد) */}
        {sale.company.logo && (
          <div className="flex justify-center mb-4">
            <img src={sale.company.logo} alt="Logo" className="w-16 h-16 object-contain" />
          </div>
        )}

        {/* رأس الفاتورة */}
        <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
          <h1 className="text-2xl font-extrabold text-gray-800">{sale.company.name}</h1>
          {sale.company.address && <p className="text-xs text-gray-600 mt-1">{sale.company.address}</p>}
          <p className="text-xs text-gray-600">هاتف: {sale.company.phone || 'غير مسجل'}</p>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>رقم الفاتورة: {sale.invoiceNumber}</span>
            <span>التاريخ: {new Date(sale.createdAt).toLocaleString('ar-EG')}</span>
          </div>
        </div>

        {/* جدول المنتجات */}
        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-right py-2">المنتج</th>
              <th className="text-center py-2">الكمية</th>
              <th className="text-left py-2">السعر</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item: any) => (
              <tr key={item.id} className="border-b border-dashed border-gray-200">
                <td className="py-2 font-medium">{item.product.name}</td>
                <td className="text-center py-2">{item.quantity}</td>
                <td className="text-left py-2">{item.unitPrice * item.quantity} ج.م</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* الإجمالي */}
        <div className="border-t-2 border-dashed border-gray-300 pt-4 text-sm space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>المجموع الفرعي:</span>
            <span>{sale.subtotal} ج.م</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>الخصم:</span>
            <span>{sale.discount} ج.م</span>
          </div>
          <div className="flex justify-between font-bold text-lg text-gray-800 border-t pt-2">
            <span>الإجمالي:</span>
            <span>{sale.total} ج.م</span>
          </div>
        </div>

        {/* 👈 QR Code للدفع */}
        {qrUrl && (
          <div className="text-center mt-6 border-t border-dashed border-gray-300 pt-4">
            <p className="text-xs font-bold text-gray-600 mb-2">امسح للدفع</p>
            <img src={qrUrl} alt="QR Code" className="mx-auto w-24 h-24" />
          </div>
        )}

        {/* رسالة الشكر */}
        <div className="text-center mt-6">
          <p className="font-bold text-gray-800">{sale.company.receiptFooter || "شكراً لزيارتكم!"}</p>
          <p className="text-xs text-gray-400 mt-1">تم الإنشاء بواسطة نظام نبض</p>
        </div>
      </div>

      {/* تنسيق الطباعة */}
      <style jsx global>{`
        @media print {
          body { background-color: #fff !important; margin: 0 !important; padding: 0 !important; }
          .print\\:hidden { display: none !important; }
          #receipt-print { 
            box-shadow: none !important; 
            border-radius: 0 !important; 
            max-width: 100% !important;
            width: 80mm !important; /* عرض ورق الطباعة الحراري */
            margin: 0 auto !important;
            padding: 10px !important;
          }
        }
      `}</style>
    </div>
  );
}