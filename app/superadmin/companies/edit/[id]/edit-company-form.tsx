"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCompany } from "../../actions";
import Link from "next/link";

export default function EditCompanyForm({ company }: { company: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    try {
      await updateCompany(company.id, formData);
      // 👈 بافتراض أن الدالة لا ترجع خطأ، نعتبرها نجحت
      router.push("/superadmin/companies");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع");
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link href="/superadmin/companies" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-6 font-medium">
        ← العودة إلى قائمة الشركات
      </Link>
      <h1 className="text-3xl font-bold text-slate-800 mb-8">تعديل شركة: {company.name}</h1>
      <div className="glass-panel p-8">
        {error && <div className="bg-red-100/50 text-red-600 p-3 rounded-lg mb-6 border border-red-200">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm text-slate-600 mb-2">اسم الشركة</label>
            <input name="name" defaultValue={company.name} required className="glass-input w-full" />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-2">تاريخ الانتهاء</label>
            <input name="expiryDate" type="date" defaultValue={company.expiryDate ? new Date(company.expiryDate).toISOString().split('T')[0] : ''} className="glass-input w-full" />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-2">إعادة تعيين كلمة مرور مدير الشركة (اتركها فارغة إذا لم ترد التغيير)</label>
            <input name="newPassword" type="password" placeholder="كلمة مرور جديدة..." className="glass-input w-full" />
          </div>
          <div className="flex items-center gap-2">
            <input name="isActive" type="checkbox" defaultChecked={company.isActive} id="isActive" className="w-5 h-5" />
            <label htmlFor="isActive" className="text-slate-600">الشركة نشطة</label>
          </div>
          <button type="submit" disabled={isLoading} className="btn-emerald w-full mt-4 py-2">
            {isLoading ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </form>
      </div>
    </div>
  );
}