"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";

// إعداد Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function createCompany(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return { error: "غير مصرح لك بهذا الإجراء" };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const expiryDate = formData.get("expiryDate") as string;
    const logoFile = formData.get("logo") as File | null;

    if (!name || !email || !password) {
      return { error: "جميع الحقول مطلوبة" };
    }

    const existingCompany = await prisma.company.findUnique({ where: { email } });
    if (existingCompany) {
      return { error: "البريد الإلكتروني مسجل بالفعل" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let logoUrl: string | null = null;

    // رفع الصورة إلى Supabase Storage
    if (logoFile && logoFile.size > 0) {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(fileName, logoFile, { cacheControl: '3600', upsert: true });

      if (uploadError) throw new Error("فشل رفع الشعار");

      const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(fileName);
      logoUrl = publicUrl;
    }

    // إنشاء الشركة والمستخدم في معاملة واحدة
    await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name,
          email,
          password: hashedPassword,
          logo: logoUrl,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
        },
      });

      await tx.user.create({
        data: {
          name: `مدير ${name}`,
          email,
          password: hashedPassword,
          role: "ADMIN",
          companyId: company.id,
        },
      });
    });

    revalidatePath("/superadmin/companies");
    return { success: true };
  } catch (error: any) {
    console.error("CREATE_COMPANY_ERROR:", error);
    return { error: error.message || "حدث خطأ أثناء حفظ الشركة" };
  }
}

// دالة الحذف (كما هي)
export async function deleteCompany(id: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") throw new Error("غير مصرح");

    await prisma.$transaction(async (tx) => {
      await tx.saleItem.deleteMany({ where: { sale: { companyId: id } } });
      await tx.sale.deleteMany({ where: { companyId: id } });
      await tx.product.deleteMany({ where: { companyId: id } });
      await tx.supplier.deleteMany({ where: { companyId: id } });
      await tx.auditLog.deleteMany({ where: { companyId: id } });
      await tx.user.deleteMany({ where: { companyId: id } });
      await tx.company.delete({ where: { id } });
    });

    revalidatePath("/superadmin/companies");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}