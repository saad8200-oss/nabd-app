"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { logAction } from "@/lib/audit";

export async function returnSale(saleId: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) throw new Error("غير مصرح");

    await prisma.$transaction(async (tx) => {
      // 1. جلب الفاتورة مع المنتجات
      const sale = await tx.sale.findUnique({
        where: { id: saleId, companyId: session.user.companyId },
        include: { items: true },
      });

      if (!sale || sale.isReturned) {
        throw new Error("الفاتورة غير موجودة أو تم إرجاعها مسبقاً");
      }

      // 2. إعادة الكميات إلى المتجر (storeStock)
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { storeStock: { increment: item.quantity } },
        });
      }

      // 3. تحديث حالة الفاتورة إلى "مرتجعة"
      await tx.sale.update({
        where: { id: saleId },
        data: { isReturned: true },
      });
    });

    await logAction("RETURN", "Sale", saleId, `تم إرجاع الفاتورة`);
    revalidatePath("/reports");
    revalidatePath("/inventory");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}