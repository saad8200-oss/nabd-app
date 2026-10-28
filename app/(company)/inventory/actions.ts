"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { logAction } from "@/lib/audit";
import { createClient } from "@supabase/supabase-js";

// إعداد Supabase Client (لرفع الصور)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 1. حفظ المنتج (إضافة أو تعديل)
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
    const categoryId = formData.get("categoryId") as string;
    const supplierId = formData.get("supplierId") as string;

    // رفع الصورة (إذا تم اختيارها)
    const imageFile = formData.get("image") as File | null;
    let imageUrl: string | null = null;

    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `product-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(fileName, imageFile, { cacheControl: '3600', upsert: true });

      if (uploadError) throw new Error("فشل رفع الصورة");

      const { data: { publicUrl } } = supabase.storage
        .from("logos")
        .getPublicUrl(fileName);
      
      imageUrl = publicUrl;
    }

    const data = {
      name,
      price,
      cost,
      stock,
      lowStockThreshold,
      barcode: barcode && barcode.trim() !== "" ? barcode.trim() : null,
      imageUrl: imageUrl || (id ? undefined : null), // إذا لم يتم رفع صورة جديدة، احتفظ بالقديمة
      categoryId: categoryId || null,
      supplierId: supplierId || null,
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
    console.error("SAVE_PRODUCT_ERROR:", error);
    return { error: error.message };
  }
}

// 2. حذف المنتج
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

// 3. تعديل كمية المخزون (سحب/إيداع)
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

// 4. سحب من المخزن إلى المتجر
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

// 5. استيراد المنتجات من Excel
export async function importProducts(data: any[]) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) throw new Error("غير مصرح");

    for (const item of data) {
      const category = item["الفئة"] ? await prisma.category.findFirst({ 
        where: { name: item["الفئة"], companyId: session.user.companyId } 
      }) : null;

      const supplier = item["المورد"] ? await prisma.supplier.findFirst({ 
        where: { name: item["المورد"], companyId: session.user.companyId } 
      }) : null;

      await prisma.product.create({
        data: {
          name: item["اسم المنتج"],
          categoryId: category?.id || null,
          supplierId: supplier?.id || null,
          price: parseFloat(item["السعر"]),
          cost: parseFloat(item["التكلفة"]),
          stock: parseInt(item["الكمية في المخزن"]),
          storeStock: parseInt(item["الكمية في المتجر"] || 0),
          barcode: item["الباركود"] || null,
          lowStockThreshold: parseInt(item["حد التنبيه"] || 10),
          companyId: session.user.companyId,
        },
      });
    }

    revalidatePath("/inventory");
    return { success: true };
  } catch (error: any) {
    console.error("IMPORT_PRODUCTS_ERROR:", error);
    return { error: error.message };
  }
}