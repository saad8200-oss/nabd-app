"use client";

import { useState } from "react";
import { createUser, deleteUser } from "../actions";
import { Plus, Trash2 } from "lucide-react";

export default function UsersClient({ users, currentUserId }: { users: any[], currentUserId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await createUser(formData);
    if (result?.error) setError(result.error);
    else { setIsModalOpen(false); setError(""); window.location.reload(); }
  };

  const handleDelete = async (id: string) => {
    if (id === currentUserId) return alert("لا يمكنك حذف حسابك الحالي!");
    if (confirm("هل أنت متأكد من حذف هذا الموظف؟")) {
      await deleteUser(id);
      window.location.reload();
    }
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setIsModalOpen(true)} className="glass-button flex items-center gap-2">
          <Plus size={16} /> إضافة موظف
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">إضافة موظف جديد</h2>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input name="name" placeholder="اسم الموظف" required className="glass-input" />
              <input name="email" type="email" placeholder="البريد الإلكتروني" required className="glass-input" />
              <input name="password" type="password" placeholder="كلمة المرور" required className="glass-input" />
              <select name="role" className="glass-input">
                <option value="CASHIER">كاشير</option>
                <option value="WAREHOUSE">أمين مخزن</option>
              </select>
              <div className="flex gap-2 mt-2">
                <button type="submit" className="glass-button flex-1">حفظ</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-200 text-slate-700 rounded-xl">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="w-full text-right mt-4">
        <thead>
          <tr className="border-b border-white/30 bg-white/20">
            <th className="p-3 text-slate-700">الاسم</th>
            <th className="p-3 text-slate-700">البريد</th>
            <th className="p-3 text-slate-700">الصلاحية</th>
            <th className="p-3 text-slate-700">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-white/10">
              <td className="p-3 text-slate-800">{u.name}</td>
              <td className="p-3 text-slate-600">{u.email}</td>
              <td className="p-3 text-slate-600">{u.role === 'ADMIN' ? 'مدير' : u.role === 'CASHIER' ? 'كاشير' : 'أمين مخزن'}</td>
              <td className="p-3">
                <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}