"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { logAction } from "@/lib/audit";

export async function processSale(
  items: any[], 
  total: number, 
  discount: number, 
  subtotal: number,
  paymentMethod: string
) {
  try {
    if (!items || items.length === 0) return { error: "السلة فارغة" };

    const session = await auth();
    if (!session?.user?.companyId) return { error: "يجب تسجيل الدخول" };

    // 1. إنشاء الفاتورة
    const sale = await prisma.sale.create({
      data: {
        invoiceNumber: `INV-${Date.now()}`,
        userId: session.user.id,
        companyId: session.user.companyId,
        subtotal: subtotal,
        discount: discount,
        total: total,
        paymentMethod: paymentMethod,
        items: {
          create: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
        },
      },
    });

    // 2. تحديث المخزون
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      if (!product || product.storeStock < item.quantity) {
        throw new Error(`الكمية غير كافية للمنتج: ${product?.name}`);
      }
      await prisma.product.update({
        where: { id: item.id },
        data: { storeStock: { decrement: item.quantity } },
      });
    }

    // 3. تسجيل العملية
    try {
      await logAction("SALE", "Sale", sale.id, `تم إتمام عملية بيع بقيمة ${total} ج.م`);
    } catch (error) {
      console.error("فشل تسجيل العملية:", error);
    }

    revalidatePath("/pos");
    revalidatePath("/inventory");
    revalidatePath("/reports");
    return { success: true, saleId: sale.id };
  } catch (error: any) {
    console.error("POS_SALE_ERROR:", error);
    return { error: error.message };
  }
}