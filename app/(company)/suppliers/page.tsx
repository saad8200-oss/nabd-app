import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SuppliersClient from "./suppliers-client";

export default async function SuppliersPage() {
  const session = await auth();
  if (!session?.user?.companyId) redirect("/login");

  const suppliers = await prisma.supplier.findMany({
    where: { companyId: session.user.companyId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { products: true } } }
  });

  return <SuppliersClient suppliers={suppliers} />;
}