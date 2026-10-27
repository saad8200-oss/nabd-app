import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const sale = await req.json();

    // التحقق من وجود الفاتورة مسبقاً (لتجنب التكرار)
    const existingSale = await prisma.sale.findUnique({
      where: { id: sale.id }
    });

    if (existingSale) {
      return NextResponse.json({ message: "Sale already exists" }, { status: 200 });
    }

    await prisma.$transaction(async (tx) => {
      // إنشاء الفاتورة
      await tx.sale.create({
        data: {
          id: sale.id,
          invoiceNumber: `INV-${Date.now()}`,
          userId: sale.userId,
          companyId: sale.companyId,
          subtotal: sale.subtotal,
          discount: sale.discount,
          total: sale.total,
          paymentMethod: sale.paymentMethod,
          createdAt: new Date(sale.createdAt),
          items: {
            create: sale.items.map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,
              unitPrice: item.price,
            })),
          },
        },
      });

      // تحديث المخزون
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.id },
          data: { storeStock: { decrement: item.quantity } },
        });
      }
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error("Sync Sale Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}