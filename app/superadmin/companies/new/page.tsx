"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCompany } from "./actions";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NewCompanyPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await createCompany(formData);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      router.push("/superadmin/companies");
      router.refresh();
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link href="/superadmin/companies" className="flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-6 font-medium">
        <ArrowRight size={20} />
        العودة إلى قائمة الشركات
      </Link>

      <h1 className="text-3xl font-bold text-slate-800 mb-8">إضافة شركة جديدة</h1>

      <div className="glass-panel p-8">
        {error && <div className="bg-red-100/50 text-red-600 p-3 rounded-lg mb-6 border border-red-200">{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* 👈 حقل رفع الشعار */}
          <div>
            <label className="block text-sm text-slate-600 mb-2">شعار الشركة (اللوجو)</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/50 rounded-xl border border-white/30 flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-400 text-xs">لا يوجد شعار</span>
                )}
              </div>
              <input 
                name="logo" 
                type="file" 
                accept="image/*"
                onChange={handleLogoChange}
                className="glass-input flex-1 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-2">اسم الشركة</label>
            <input name="name" required className="glass-input w-full" placeholder="مثال: شركة النور" />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-2">البريد الإلكتروني (للدخول)</label>
            <input name="email" type="email" required className="glass-input w-full" placeholder="company@nabd.com" />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-2">كلمة المرور</label>
            <input name="password" type="password" required className="glass-input w-full" placeholder="••••••••" />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-2">تاريخ انتهاء الاشتراك</label>
            <input name="expiryDate" type="date" className="glass-input w-full" />
          </div>

          <button type="submit" disabled={isLoading} className="glass-button w-full mt-4">
            {isLoading ? "جاري الحفظ..." : "حفظ الشركة"}
          </button>
        </form>
      </div>
    </div>
  );
}