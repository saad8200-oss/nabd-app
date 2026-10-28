import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import POSClient from "./pos-client";

export default async function POSPage() {
  const session = await auth();
  if (!session?.user?.companyId) redirect("/login");

  // 👈 جلب تاريخ انتهاء الاشتراك
  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { expiryDate: true }
  });

  const products = await prisma.product.findMany({
    where: { 
      companyId: session.user.companyId,
      storeStock: { gt: 0 }
    },
    orderBy: { name: 'asc' }
  });

  // 👈 تمرير expiryDate إلى العميل
  return <POSClient products={products} expiryDate={company?.expiryDate?.toISOString() || null} />;
}