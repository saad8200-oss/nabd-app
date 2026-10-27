import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ReceiptClient from "./receipt-client";
import { getOfflineSales } from "@/lib/offline-db"; // 👈 استيراد دالة القراءة

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const session = await auth();
  if (!session?.user?.companyId) redirect("/login");

  // 1. حاول جلب الفاتورة من السيرفر
  const sale = await prisma.sale.findUnique({
    where: { id: id, companyId: session.user.companyId },
    include: {
      items: { include: { product: true } },
      user: true,
      company: true,
    }
  });

  // 2. إذا لم توجد (أوفلاين)، حاول جلبها من IndexedDB
  if (!sale) {
    // في وضع السيرفر، لا يمكننا الوصول إلى IndexedDB مباشرة.
    // لذلك، سنحتاج إلى تمرير الفاتورة عبر query param أو التعامل معها في العميل.
    // الحل الأسهل: عرض رسالة "الفاتورة محفوظة محلياً" أو تحويل المستخدم إلى صفحة POS.
    return (
      <div className="p-8 text-center text-slate-800">
        <h2>الفاتورة محفوظة محلياً (وضع عدم الاتصال).</h2>
        <p>سيتم مزامنتها عند عودة الإنترنت.</p>
        <a href="/pos" className="glass-button mt-4 inline-block">العودة إلى نقطة البيع</a>
      </div>
    );
  }

  return <ReceiptClient sale={sale} />;
}