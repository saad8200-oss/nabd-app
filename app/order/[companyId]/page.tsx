import { prisma } from "@/lib/prisma";
import OrderClient from "./order-client";

export default async function OrderPage({ params }: { params: Promise<{ companyId: string }> }) {
  const resolvedParams = await params;
  const companyId = resolvedParams.companyId;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { name: true, logo: true }
  });

  const products = await prisma.product.findMany({
    where: { 
      companyId: companyId,
      storeStock: { gt: 0 }
    },
    orderBy: { name: 'asc' }
  });

  if (!company) return <div className="p-8 text-center">الشركة غير موجودة.</div>;

  return <OrderClient company={company} products={products} companyId={companyId} />;
}