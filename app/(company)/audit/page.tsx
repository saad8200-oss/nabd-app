import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const actionLabels: Record<string, string> = {
  LOGIN: "تسجيل دخول",
  CREATE: "إضافة",
  UPDATE: "تعديل",
  DELETE: "حذف",
  STOCK_IN: "إيداع مخزون",
  STOCK_OUT: "سحب مخزون",
  TRANSFER: "تحويل للمتجر",
  SALE: "بيع",
  RETURN: "إرجاع",
};

export default async function AuditPage() {
  const session = await auth();
  if (!session?.user?.companyId) redirect("/login");

  const logs = await prisma.auditLog.findMany({
    where: { companyId: session.user.companyId },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true } } }
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">سجل العمليات</h1>
        <p className="text-slate-500 mt-1">تتبع كل حركة داخل النظام</p>
      </div>

      <div className="glass-panel overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-white/30 bg-white/20">
              <th className="p-4 text-slate-700 font-semibold">التاريخ</th>
              <th className="p-4 text-slate-700 font-semibold">المستخدم</th>
              <th className="p-4 text-slate-700 font-semibold">العملية</th>
              <th className="p-4 text-slate-700 font-semibold">التفاصيل</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">لا توجد عمليات مسجلة حتى الآن.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                  <td className="p-4 text-slate-600 text-sm">{new Date(log.createdAt).toLocaleString('ar-EG')}</td>
                  <td className="p-4 text-slate-800">{log.user?.name || "غير معروف"}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-sm bg-purple-100/50 text-purple-700">
                      {actionLabels[log.action] || log.action}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}