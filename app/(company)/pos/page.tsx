import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import POSClient from "./pos-client";

export default async function POSPage() {
  const session = await auth();
  if (!session?.user?.companyId) redirect("/login");

  // جلب المنتجات التي في المتجر فقط (storeStock > 0)
  const products = await prisma.product.findMany({
    where: { 
      companyId: session.user.companyId,
      storeStock: { gt: 0 }
    },
    orderBy: { name: 'asc' }
  });

  return <POSClient products={products} />;
}