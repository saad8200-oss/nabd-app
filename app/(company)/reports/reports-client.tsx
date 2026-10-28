"use client";

import Link from "next/link";
import { DollarSign, FileText, Eye, TrendingUp, RotateCcw, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { returnSale } from "./actions";
import { toast } from "sonner";
import * as XLSX from "xlsx"; // 👈 استيراد مكتبة Excel

export default function ReportsClient({ sales, totalSales, totalInvoices, totalProfit, chartData }: any) {
  const [isReturning, setIsReturning] = useState<string | null>(null);
  const safeChartData = chartData && chartData.length > 0 ? chartData : [{ date: "لا يوجد", total: 0 }];

  const handleReturn = async (saleId: string) => {
    if (!confirm("هل أنت متأكد من إرجاع هذه الفاتورة؟ سيتم إعادة الكميات إلى المتجر.")) return;
    
    setIsReturning(saleId);
    const result = await returnSale(saleId);
    
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("تم إرجاع الفاتورة بنجاح!");
      setTimeout(() => window.location.reload(), 1000);
    }
    setIsReturning(null);
  };

  // 👈 دالة تصدير Excel
  const handleExportExcel = () => {
    if (sales.length === 0) {
      toast.error("لا توجد فواتير للتصدير.");
      return;
    }

    // تجهيز البيانات
    const data = sales.map((sale: any) => ({
      "رقم الفاتورة": sale.invoiceNumber,
      "التاريخ": new Date(sale.createdAt).toLocaleString('ar-EG'),
      "الكاشير": sale.user.name || "غير معروف",
      "الإجمالي": sale.total,
      "الخصم": sale.discount,
      "طريقة الدفع": sale.paymentMethod,
      "الحالة": sale.isReturned ? "مرتجعة" : "نشطة",
    }));

    // إنشاء ملف Excel
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "الفواتير");
    
    // تحميل الملف
    XLSX.writeFile(workbook, `تقرير_الفواتير_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("تم تصدير التقرير بنجاح!");
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">الفواتير والتقارير</h1>
          <p className="text-slate-500 mt-1">سجل كامل لعمليات المبيعات والأرباح</p>
        </div>
        {/* 👈 زر التصدير */}
        <button 
          onClick={handleExportExcel}
          className="btn-emerald flex items-center gap-2 px-4 py-2"
        >
          <Download size={20} /> تصدير Excel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500">إجمالي المبيعات</span>
            <DollarSign className="text-green-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{totalSales} ج.م</p>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500">إجمالي الأرباح</span>
            <TrendingUp className="text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-purple-600">{totalProfit} ج.م</p>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500">عدد الفواتير</span>
            <FileText className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{totalInvoices}</p>
        </div>
      </div>

      <div className="glass-panel p-6 mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6">مبيعات آخر 7 أيام</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={safeChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                formatter={(value) => [`${value} ج.م`, 'المبيعات']}
              />
              <Bar dataKey="total" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-white/30 bg-white/20">
              <th className="p-4 text-slate-700 font-semibold">رقم الفاتورة</th>
              <th className="p-4 text-slate-700 font-semibold">التاريخ</th>
              <th className="p-4 text-slate-700 font-semibold">الكاشير</th>
              <th className="p-4 text-slate-700 font-semibold">الإجمالي</th>
              <th className="p-4 text-slate-700 font-semibold">إجراءات</th>
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
              sales.map((sale: any) => (
                <tr key={sale.id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                  <td className="p-4 font-mono text-sm text-slate-600">{sale.invoiceNumber}</td>
                  <td className="p-4 text-slate-600">{new Date(sale.createdAt).toLocaleString('ar-EG')}</td>
                  <td className="p-4 text-slate-800">{sale.user.name || "غير معروف"}</td>
                  <td className="p-4 text-purple-600 font-bold">{sale.total} ج.م</td>
                  <td className="p-4 flex gap-2">
                    <Link 
                      href={`/pos/receipt/${sale.id}`}
                      className="btn-blue p-2 rounded-lg"
                    >
                      <Eye size={16} />
                    </Link>
                    {!sale.isReturned && (
                      <button 
                        onClick={() => handleReturn(sale.id)}
                        disabled={isReturning === sale.id}
                        className="btn-amber p-2 rounded-lg"
                      >
                        <RotateCcw size={16} />
                      </button>
                    )}
                    {sale.isReturned && (
                      <span className="text-xs text-red-500 font-bold">مرتجعة</span>
                    )}
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