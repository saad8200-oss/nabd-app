import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";

export default async function CompaniesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const companies = await prisma.company.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { users: true } } }
  });

  return (
    <div className="p-8">
      {/* زر العودة */}
      <Link href="/superadmin" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-6 font-medium">
        <ArrowRight size={20} />
        العودة إلى لوحة التحكم
      </Link>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">إدارة الشركات</h1>
          <p className="text-slate-500 mt-1">قائمة بجميع الشركات المسجلة في المنصة</p>
        </div>
        <Link 
          href="/superadmin/companies/new" 
          className="glass-button flex items-center gap-2"
        >
          <Plus size={20} />
          إضافة شركة جديدة
        </Link>
      </div>

      <div className="glass-panel overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-white/30 bg-white/20">
              <th className="p-4 text-slate-700 font-semibold">اسم الشركة</th>
              <th className="p-4 text-slate-700 font-semibold">البريد الإلكتروني</th>
              <th className="p-4 text-slate-700 font-semibold">تاريخ الانتهاء</th>
              <th className="p-4 text-slate-700 font-semibold">الحالة</th>
              <th className="p-4 text-slate-700 font-semibold">عدد المستخدمين</th>
              <th className="p-4 text-slate-700 font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {companies.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  لا توجد شركات مسجلة حتى الآن.
                </td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr key={company.id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{company.name}</td>
                  <td className="p-4 text-slate-600">{company.email}</td>
                  <td className="p-4 text-slate-600">
                    {company.expiryDate ? new Date(company.expiryDate).toLocaleDateString('ar-EG') : 'غير محدد'}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${company.isActive ? 'bg-green-100/50 text-green-700' : 'bg-red-100/50 text-red-700'}`}>
                      {company.isActive ? 'نشطة' : 'موقوفة'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{company._count.users}</td>
                  <td className="p-4">
                    <Link 
                      href={`/superadmin/companies/edit/${company.id}`} 
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      تعديل
                    </Link>
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