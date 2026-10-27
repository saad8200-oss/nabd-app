import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CategoriesClient from "./categories-client";

export default async function CategoriesPage() {
  const session = await auth();
  if (!session?.user?.companyId) redirect("/login");

  const categories = await prisma.category.findMany({
    where: { companyId: session.user.companyId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { products: true } } }
  });

  return <CategoriesClient categories={categories} />;
}