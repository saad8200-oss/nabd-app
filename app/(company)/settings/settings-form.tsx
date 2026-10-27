"use client";

import { useState } from "react";
import { updateCompanySettings, updateCompanyLogo } from "./actions";

export default function SettingsForm({ company }: { company: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(company.logo || null);

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
    setMessage("");

    const formData = new FormData(e.currentTarget);
    
    // رفع الشعار
    const logoFile = formData.get("logo") as File;
    if (logoFile && logoFile.size > 0) {
      const logoFormData = new FormData();
      logoFormData.append("logo", logoFile);
      await updateCompanyLogo(logoFormData);
    }

    // تحديث البيانات النصية
    const result = await updateCompanySettings(formData);

    if (result?.error) {
      setMessage(`خطأ: ${result.error}`);
    } else {
      setMessage("تم حفظ الإعدادات بنجاح!");
      setTimeout(() => window.location.reload(), 1000);
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-6 flex flex-col gap-4">
      {message && <div className={`p-3 rounded-lg ${message.includes("خطأ") ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{message}</div>}
      
      <div>
        <label className="block text-sm text-slate-600 mb-2">اسم الشركة</label>
        <input name="name" defaultValue={company.name} required className="glass-input w-full" />
      </div>

      <div>
        <label className="block text-sm text-slate-600 mb-2">رقم الهاتف</label>
        <input name="phone" defaultValue={company.phone || ""} className="glass-input w-full" />
      </div>

      <div>
        <label className="block text-sm text-slate-600 mb-2">عنوان المتجر (يظهر في الفاتورة)</label>
        <input name="address" defaultValue={company.address || ""} placeholder="مثال: شارع 9، المعادي" className="glass-input w-full" />
      </div>

      <div>
        <label className="block text-sm text-slate-600 mb-2">رسالة الشكر (تظهر أسفل الفاتورة)</label>
        <input name="receiptFooter" defaultValue={company.receiptFooter || "شكراً لزيارتكم!"} className="glass-input w-full" />
      </div>

      <div>
        <label className="block text-sm text-slate-600 mb-2">شعار الشركة (اللوجو)</label>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/50 rounded-xl border flex items-center justify-center overflow-hidden">
            {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-xs text-slate-400">لا يوجد</span>}
          </div>
          <input name="logo" type="file" accept="image/*" onChange={handleLogoChange} className="glass-input flex-1 cursor-pointer" />
        </div>
      </div>

      <button type="submit" disabled={isLoading} className="glass-button w-full mt-4">
        {isLoading ? "جاري الحفظ..." : "حفظ التعديلات"}
      </button>
    </form>
  );
}