import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import InventoryClient from "./inventory-client";

export default async function InventoryPage() {
  const session = await auth();
  if (!session?.user?.companyId) redirect("/login");

  const [products, categories, suppliers] = await Promise.all([
    prisma.product.findMany({
      where: { companyId: session.user.companyId },
      orderBy: { createdAt: 'desc' },
      include: { category: true, supplier: true }
    }),
    prisma.category.findMany({ where: { companyId: session.user.companyId } }),
    prisma.supplier.findMany({ where: { companyId: session.user.companyId } })
  ]);

  return <InventoryClient products={products} categories={categories} suppliers={suppliers} />;
}