"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createOnlineOrder(data: any) {
  try {
    const order = await prisma.onlineOrder.create({
      data: {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        pickupBranch: data.pickupBranch,
        total: data.total,
        companyId: data.companyId,
        items: {
          create: data.items.map((item: any) => ({
            productId: item.id,
            productName: item.name,
            quantity: item.qty,
            unitPrice: item.price,
          })),
        },
      },
    });

    // 👈 خصم المخزون فوراً (لتحديث المتجر)
    for (const item of data.items) {
      await prisma.product.update({
        where: { id: item.id },
        data: { storeStock: { decrement: item.qty } },
      });
    }

    revalidatePath("/pos");
    revalidatePath("/inventory");
    return { success: true, orderId: order.id };
  } catch (error: any) {
    return { error: error.message };
  }
}