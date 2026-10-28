import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { DollarSign, Package, AlertTriangle, TrendingUp } from "lucide-react";
import Link from "next/link"; // 👈 استيراد Link

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user || !session.user.companyId) {
    redirect("/login");
  }

  const [salesAgg, productsCount, lowStockProducts] = await Promise.all([
    prisma.sale.aggregate({
      where: { companyId: session.user.companyId },
      _sum: { total: true },
    }),
    prisma.product.count({
      where: { companyId: session.user.companyId }
    }),
    prisma.product.findMany({
      where: { companyId: session.user.companyId, isActive: true },
      orderBy: { stock: "asc" },
      take: 100,
    }),
  ]);

  const lowStockItems = lowStockProducts.filter(p => p.stock <= p.lowStockThreshold);
  const totalSales = salesAgg._sum.total || 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">لوحة التحكم</h1>
        <p className="text-slate-500 mt-1">نظرة عامة على أداء المبيعات والمخزون</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500">إجمالي المبيعات</span>
            <DollarSign className="text-green-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{totalSales} ج.م</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500">المنتجات</span>
            <Package className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{productsCount}</p>
        </GlassCard>

        {/* 👈 بطاقة تنبيهات المخزون (أصبحت قابلة للنقر) */}
        <Link href="/inventory?filter=low-stock" className="block">
          <GlassCard className="cursor-pointer hover:bg-white/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500">تنبيهات المخزون</span>
              <AlertTriangle className="text-amber" />
            </div>
            <p className="text-3xl font-bold text-amber">{lowStockItems.length}</p>
          </GlassCard>
        </Link>

        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500">الأرباح (تقديري)</span>
            <TrendingUp className="text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">0.00 ج.م</p>
        </GlassCard>
      </div>
    </div>
  );
}