"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { logAction } from "@/lib/audit";
import { createClient } from "@supabase/supabase-js"; // 👈 استيراد Supabase

// إعداد Supabase Client (لرفع الصور)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // 👈 رفع الصورة (إذا تم اختيارها)
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

    // 👈 تجهيز البيانات
    const data = {
      name,
      price,
      cost,
      stock,
      lowStockThreshold,
      barcode: barcode && barcode.trim() !== "" ? barcode.trim() : null,
      imageUrl: imageUrl || (id ? undefined : null), // إذا لم يتم رفع صورة، احتفظ بالقديمة
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

// ... (باقي الدوال: deleteProduct، adjustStock، transferToStore)

// 👈 دالة استيراد المنتجات من Excel
export async function importProducts(data: any[]) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) throw new Error("غير مصرح");

    for (const item of data) {
      // البحث عن الفئة والمورد (إذا كانا موجودين)
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