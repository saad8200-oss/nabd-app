import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, Users, Activity, AlertTriangle, TrendingUp } from "lucide-react";
import LogoutButton from "./logout-button";

export default async function SuperAdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  // 👈 إحصائيات المنصة
  const companiesCount = await prisma.company.count();
  const activeCompanies = await prisma.company.count({ where: { isActive: true } });
  const inactiveCompanies = await prisma.company.count({ where: { isActive: false } });
  const usersCount = await prisma.user.count();

  // 👈 الشركات التي ستنتهي اشتراكاتها قريباً (خلال 30 يوماً)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiringCompanies = await prisma.company.findMany({
    where: {
      expiryDate: {
        lte: thirtyDaysFromNow,
        gte: new Date(),
      },
    },
    orderBy: { expiryDate: 'asc' },
    take: 5, // أول 5 شركات
  });

  return (
    <div className="p-8">
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
            <span className="text-slate-500">الشركات النشطة</span>
            <Activity className="text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600">{activeCompanies}</p>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500">الشركات الموقوفة</span>
            <AlertTriangle className="text-red-500" />
          </div>
          <p className="text-3xl font-bold text-red-600">{inactiveCompanies}</p>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500">إجمالي المستخدمين</span>
            <Users className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{usersCount}</p>
        </div>
      </div>

      {/* 👈 قائمة الاشتراكات التي ستنتهي قريباً */}
      <div className="glass-panel p-6 mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp className="text-amber-500" /> اشتراكات تنتهي قريباً (خلال 30 يوماً)
        </h2>
        {expiringCompanies.length === 0 ? (
          <p className="text-slate-500 text-center py-4">لا توجد اشتراكات تنتهي قريباً.</p>
        ) : (
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-white/30 bg-white/20">
                <th className="p-3 text-slate-700 font-semibold">اسم الشركة</th>
                <th className="p-3 text-slate-700 font-semibold">تاريخ الانتهاء</th>
                <th className="p-3 text-slate-700 font-semibold">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {expiringCompanies.map((company) => (
                <tr key={company.id} className="border-b border-white/10">
                  <td className="p-3 text-slate-800">{company.name}</td>
                  <td className="p-3 text-red-600 font-bold">
                    {company.expiryDate ? new Date(company.expiryDate).toLocaleDateString('ar-EG') : 'غير محدد'}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${company.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {company.isActive ? 'نشطة' : 'موقوفة'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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