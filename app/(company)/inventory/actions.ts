"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { logAction } from "@/lib/audit";

export async function saveProduct(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) throw new Error("غير مصرح");

    const id = formData.get("id") as string | null;
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const cost = parseFloat(formData.get("cost") as string);
    const stock = parseInt(formData.get("stock") as string);
    const lowStockThreshold = parseInt(formData.get("lowStockThreshold") as string);
    const barcode = formData.get("barcode") as string;
    const imageUrl = formData.get("imageUrl") as string;

    const data = {
      name,
      price,
      cost,
      stock,
      lowStockThreshold,
      barcode: barcode && barcode.trim() !== "" ? barcode.trim() : null,
      imageUrl: imageUrl || null,
      companyId: session.user.companyId,
    };

    if (id) {
      await prisma.product.update({ where: { id }, data });
      await logAction("UPDATE", "Product", id, `تم تعديل المنتج: ${name}`);
    } else {
      const newProduct = await prisma.product.create({ data });
      await logAction("CREATE", "Product", newProduct.id, `تم إضافة منتج: ${name}`);
    }

    revalidatePath("/inventory");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteProduct(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) throw new Error("غير مصرح");
    
    await prisma.product.delete({ where: { id, companyId: session.user.companyId } });
    await logAction("DELETE", "Product", id, `تم حذف منتج`);
    
    revalidatePath("/inventory");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function adjustStock(productId: string, quantity: number, type: "ADD" | "REMOVE") {
  try {
    const session = await auth();
    if (!session?.user?.companyId) throw new Error("غير مصرح");

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return { error: "المنتج غير موجود" };

    const newStock = type === "ADD" ? product.stock + quantity : product.stock - quantity;
    if (newStock < 0) return { error: "الكمية غير كافية" };

    await prisma.product.update({
      where: { id: productId },
      data: { stock: newStock },
    });

    await logAction(
      type === "ADD" ? "STOCK_IN" : "STOCK_OUT",
      "Product",
      productId,
      `${type === "ADD" ? "إيداع" : "سحب"} ${quantity} من ${product.name}`
    );

    revalidatePath("/inventory");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function transferToStore(productId: string, quantity: number) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) throw new Error("غير مصرح");

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return { error: "المنتج غير موجود" };
    if (product.stock < quantity) return { error: "الكمية غير كافية في المخزن" };

    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: { decrement: quantity },
        storeStock: { increment: quantity },
      },
    });

    await logAction("TRANSFER", "Product", productId, `تم سحب ${quantity} من ${product.name} إلى المتجر`);

    revalidatePath("/inventory");
    revalidatePath("/products");
    revalidatePath("/pos");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}