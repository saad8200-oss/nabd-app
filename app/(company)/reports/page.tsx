import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ReportsClient from "./reports-client";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.companyId) redirect("/login");

  // جلب الفواتير غير المرتجعة مع المنتجات لحساب الأرباح
  const sales = await prisma.sale.findMany({
    where: { 
      companyId: session.user.companyId, 
      isReturned: false 
    },
    include: { 
      user: true,
      items: { include: { product: true } }
    },
    orderBy: { createdAt: "desc" },
  });

  // حساب الإحصائيات
  const totalSales = sales.reduce((acc, sale) => acc + sale.total, 0);
  const totalInvoices = sales.length;
  
  // حساب الأرباح (سعر البيع - سعر التكلفة)
  const totalProfit = sales.reduce((acc, sale) => {
    const saleProfit = sale.items.reduce((itemAcc, item) => {
      const profitPerItem = (item.unitPrice - (item.product?.cost || 0)) * item.quantity;
      return itemAcc + profitPerItem;
    }, 0);
    return acc + saleProfit;
  }, 0);

  // تجهيز بيانات الرسم البياني (آخر 7 أيام)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toLocaleDateString('ar-EG', { weekday: 'short' });
  }).reverse();

  const chartData = last7Days.map(day => {
    const daySales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt).toLocaleDateString('ar-EG', { weekday: 'short' });
      return saleDate === day;
    });
    const total = daySales.reduce((acc, sale) => acc + sale.total, 0);
    return { date: day, total };
  });

  return <ReportsClient 
    sales={sales} 
    totalSales={totalSales} 
    totalInvoices={totalInvoices} 
    totalProfit={totalProfit}
    chartData={chartData}
  />;
}