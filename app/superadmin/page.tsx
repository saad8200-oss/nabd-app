import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, Users, DollarSign, Activity } from "lucide-react";
import LogoutButton from "./logout-button"; // 👈 استيراد الزر

export default async function SuperAdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const companiesCount = await prisma.company.count();
  const usersCount = await prisma.user.count();
  const totalSales = await prisma.sale.aggregate({ _sum: { total: true } });

  return (
    <div className="p-8">
      {/* 👈 زر تسجيل الخروج */}
      <div className="flex justify-end mb-4">
        <LogoutButton />
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">لوحة تحكم مالك النظام</h1>
        <p className="text-slate-500 mt-1">نظرة عامة على أداء المنصة والشركات</p>
      </div>

      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500">إجمالي الشركات</span>
            <Building2 className="text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{companiesCount}</p>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500">إجمالي المستخدمين</span>
            <Users className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{usersCount}</p>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500">إجمالي المبيعات</span>
            <DollarSign className="text-green-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{totalSales._sum.total || 0} ج.م</p>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500">حالة النظام</span>
            <Activity className="text-pink-500" />
          </div>
          <p className="text-3xl font-bold text-green-500">نشط</p>
        </div>
      </div>

      {/* روابط سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/superadmin/companies" className="glass-panel p-6 hover:bg-white/40 transition-all group">
          <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-purple-600">إدارة الشركات</h3>
          <p className="text-sm text-slate-500">إضافة، تعديل، وحذف الشركات</p>
        </Link>

        <Link href="/superadmin/audit" className="glass-panel p-6 hover:bg-white/40 transition-all group">
          <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-purple-600">سجل النظام</h3>
          <p className="text-sm text-slate-500">متابعة جميع الأحداث داخل المنصة</p>
        </Link>

        <Link href="/superadmin/settings" className="glass-panel p-6 hover:bg-white/40 transition-all group">
          <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-purple-600">الإعدادات</h3>
          <p className="text-sm text-slate-500">إعدادات حسابك الشخصي</p>
        </Link>
      </div>
    </div>
  );
}