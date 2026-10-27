"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPlan } from "./actions";

export default function NewPlanPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createPlan(formData);
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      router.push("/superadmin/plans");
      router.refresh();
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">إضافة خطة جديدة</h1>
      <div className="glass-panel p-8">
        {error && <div className="bg-red-100/50 text-red-600 p-3 rounded-lg mb-6">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input name="name" placeholder="اسم الخطة (مثلاً: أساسية)" required className="glass-input w-full" />
          <input name="price" type="number" step="0.01" placeholder="السعر (ج.م / شهر)" required className="glass-input w-full" />
          <input name="features" placeholder="الميزات (مفصولة بفاصلة)" required className="glass-input w-full" />
          <button type="submit" disabled={isLoading} className="btn-emerald w-full py-2">
            {isLoading ? "جاري الحفظ..." : "حفظ الخطة"}
          </button>
        </form>
      </div>
    </div>
  );
}