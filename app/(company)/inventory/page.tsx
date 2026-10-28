import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import InventoryClient from "./inventory-client";

export default async function InventoryPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const session = await auth();
  if (!session?.user?.companyId) redirect("/login");

  const resolvedParams = await searchParams;
  const filter = resolvedParams.filter;

  const [products, categories, suppliers] = await Promise.all([
    prisma.product.findMany({
      where: { 
        companyId: session.user.companyId,
        isActive: true 
      },
      orderBy: { createdAt: 'desc' },
      include: { category: true, supplier: true }
    }),
    prisma.category.findMany({ where: { companyId: session.user.companyId } }),
    prisma.supplier.findMany({ where: { companyId: session.user.companyId } })
  ]);

  // 👈 فلترة المنتجات إذا كان المستخدم قادماً من تنبيهات المخزون
  let filteredProducts = products;
  if (filter === 'low-stock') {
    filteredProducts = products.filter(p => p.stock <= p.lowStockThreshold);
  }

  return <InventoryClient products={filteredProducts} categories={categories} suppliers={suppliers} />;
}