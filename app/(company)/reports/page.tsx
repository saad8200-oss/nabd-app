import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ReportsClient from "./reports-client";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.companyId) redirect("/login");

  // جلب الفواتير غير المرتجعة
  const sales = await prisma.sale.findMany({
    where: { 
      companyId: session.user.companyId, 
      isReturned: false 
    },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  // حساب الإحصائيات
  const totalSales = sales.reduce((acc, sale) => acc + sale.total, 0);
  const totalInvoices = sales.length;

  return <ReportsClient sales={sales} totalSales={totalSales} totalInvoices={totalInvoices} />;
}