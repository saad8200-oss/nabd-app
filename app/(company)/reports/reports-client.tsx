"use client";

import Link from "next/link";
import { DollarSign, FileText, Eye } from "lucide-react";

export default function ReportsClient({ sales, totalSales, totalInvoices }: { sales: any[], totalSales: number, totalInvoices: number }) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">الفواتير والتقارير</h1>
        <p className="text-slate-500 mt-1">سجل كامل لعمليات المبيعات والأرباح</p>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500">إجمالي المبيعات</span>
            <DollarSign className="text-green-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{totalSales} ج.م</p>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500">عدد الفواتير</span>
            <FileText className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{totalInvoices}</p>
        </div>
      </div>

      {/* جدول الفواتير */}
      <div className="glass-panel overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-white/30 bg-white/20">
              <th className="p-4 text-slate-700 font-semibold">رقم الفاتورة</th>
              <th className="p-4 text-slate-700 font-semibold">التاريخ</th>
              <th className="p-4 text-slate-700 font-semibold">الكاشير</th>
              <th className="p-4 text-slate-700 font-semibold">الإجمالي</th>
              <th className="p-4 text-slate-700 font-semibold">التفاصيل</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  لا توجد فواتير مسجلة حتى الآن.
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                  <td className="p-4 font-mono text-sm text-slate-600">{sale.invoiceNumber}</td>
                  <td className="p-4 text-slate-600">{new Date(sale.createdAt).toLocaleString('ar-EG')}</td>
                  <td className="p-4 text-slate-800">{sale.user.name || "غير معروف"}</td>
                  <td className="p-4 text-purple-600 font-bold">{sale.total} ج.م</td>
                  <td className="p-4">
                    <Link 
                      href={`/pos/receipt/${sale.id}`}
                      className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800"
                    >
                      <Eye size={16} /> عرض
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}