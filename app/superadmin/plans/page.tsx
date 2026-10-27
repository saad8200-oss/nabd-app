import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function PlansPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") redirect("/login");

  const plans = await prisma.plan.findMany({ orderBy: { price: 'asc' } });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">إدارة خطط الاشتراك</h1>
        <Link href="/superadmin/plans/new" className="btn-emerald flex items-center gap-2 px-4 py-2">
          <Plus size={20} /> إضافة خطة جديدة
        </Link>
      </div>

      <div className="glass-panel overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-white/30 bg-white/20">
              <th className="p-4 text-slate-700 font-semibold">اسم الخطة</th>
              <th className="p-4 text-slate-700 font-semibold">السعر</th>
              <th className="p-4 text-slate-700 font-semibold">الميزات</th>
              <th className="p-4 text-slate-700 font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-500">لا توجد خطط. اضغط على إضافة خطة جديدة.</td></tr>
            ) : (
              plans.map((plan) => (
                <tr key={plan.id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{plan.name}</td>
                  <td className="p-4 text-purple-600 font-bold">{plan.price} ج.م / شهر</td>
                  <td className="p-4 text-slate-600">{plan.features.join(", ")}</td>
                  <td className="p-4">
                    {/* أزرار التعديل والحذف (يمكن إضافتها لاحقاً) */}
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