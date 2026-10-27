"use client";

import { useState } from "react";
import { createSupplier, deleteSupplier } from "./actions";
import { Plus, Trash2 } from "lucide-react";

export default function SuppliersClient({ suppliers }: { suppliers: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await createSupplier(formData);
    if (result?.error) setError(result.error);
    else { setIsModalOpen(false); setError(""); window.location.reload(); }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المورد؟")) {
      await deleteSupplier(id);
      window.location.reload();
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">إدارة الموردين</h1>
          <p className="text-slate-500 mt-1">إدارة شركات التوريد والأصناف المرتبطة بها</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="glass-button flex items-center gap-2">
          <Plus size={20} /> إضافة مورد جديد
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-slate-800">إضافة مورد جديد</h2>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input name="name" placeholder="اسم المورد" required className="glass-input" />
              <input name="phone" placeholder="رقم الهاتف" className="glass-input" />
              <input name="email" type="email" placeholder="البريد الإلكتروني (اختياري)" className="glass-input" />
              <div className="flex gap-2 mt-2">
                <button type="submit" className="glass-button flex-1">حفظ</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-200 text-slate-700 rounded-xl">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="glass-panel overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-white/30 bg-white/20">
              <th className="p-4 text-slate-700 font-semibold">اسم المورد</th>
              <th className="p-4 text-slate-700 font-semibold">رقم الهاتف</th>
              <th className="p-4 text-slate-700 font-semibold">البريد الإلكتروني</th>
              <th className="p-4 text-slate-700 font-semibold">عدد المنتجات</th>
              <th className="p-4 text-slate-700 font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">لا يوجد موردين حالياً.</td></tr>
            ) : (
              suppliers.map((s) => (
                <tr key={s.id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{s.name}</td>
                  <td className="p-4 text-slate-600">{s.phone || '-'}</td>
                  <td className="p-4 text-slate-600">{s.email || '-'}</td>
                  <td className="p-4 text-purple-600 font-bold">{s._count.products}</td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(s.id)} className="p-2 bg-red-100/50 text-red-600 rounded-lg hover:bg-red-200/50"><Trash2 size={16} /></button>
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