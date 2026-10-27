"use client";

import { useState } from "react";
import { createCategory, deleteCategory } from "./actions";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function CategoriesClient({ categories }: { categories: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await createCategory(formData);
    if (result?.error) {
      setError(result.error);
      toast.error(result.error);
    } else {
      setIsModalOpen(false);
      setError("");
      toast.success("تم إضافة الفئة بنجاح!");
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الفئة؟")) {
      const result = await deleteCategory(id);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("تم حذف الفئة!");
        setTimeout(() => window.location.reload(), 1000);
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">إدارة الفئات</h1>
          <p className="text-slate-500 mt-1">إضافة وحذف فئات المنتجات</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="glass-button flex items-center gap-2">
          <Plus size={20} /> إضافة فئة جديدة
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-800 mb-4">إضافة فئة جديدة</h2>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input name="name" placeholder="اسم الفئة (مثلاً: مشروبات)" required className="glass-input" />
              <div className="flex gap-4 mt-4">
                <button type="submit" className="glass-button flex-1">حفظ</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="glass-panel overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-white/30 bg-white/20">
              <th className="p-4 text-slate-700 font-semibold">اسم الفئة</th>
              <th className="p-4 text-slate-700 font-semibold">عدد المنتجات</th>
              <th className="p-4 text-slate-700 font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr><td colSpan={3} className="p-8 text-center text-slate-500">لا توجد فئات. اضغط على إضافة فئة جديدة.</td></tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{c.name}</td>
                  <td className="p-4 text-purple-600 font-bold">{c._count.products}</td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(c.id)} className="p-2 bg-red-100/50 text-red-600 rounded-lg hover:bg-red-200/50"><Trash2 size={16} /></button>
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