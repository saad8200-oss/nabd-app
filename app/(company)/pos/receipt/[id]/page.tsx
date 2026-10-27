import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ReceiptClient from "./receipt-client";

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const session = await auth();
  if (!session?.user?.companyId) redirect("/login");

  const sale = await prisma.sale.findUnique({
    where: { id: id, companyId: session.user.companyId },
    include: {
      items: { include: { product: true } },
      user: true,
      company: true,
    }
  });

  if (!sale) return <div className="p-8 text-slate-800 text-center">الفاتورة غير موجودة.</div>;

  return <ReceiptClient sale={sale} />;
}