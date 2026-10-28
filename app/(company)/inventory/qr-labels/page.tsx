import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import QRLabelsClient from "./qr-labels-client";

export default async function QRLabelsPage() {
  const session = await auth();
  if (!session?.user?.companyId) redirect("/login");

  const products = await prisma.product.findMany({
    where: { companyId: session.user.companyId },
    orderBy: { name: 'asc' }
  });

  return <QRLabelsClient products={products} />;
}