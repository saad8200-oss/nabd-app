import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import InventoryClient from "./inventory-client";

export default async function InventoryPage() {
  const session = await auth();
  if (!session?.user?.companyId) redirect("/login");

  const products = await prisma.product.findMany({
    where: { companyId: session.user.companyId },
    orderBy: { createdAt: 'desc' }
  });

  return <InventoryClient products={products} />;
}