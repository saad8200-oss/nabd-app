"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 1. تحديث بيانات الشركة
export async function updateCompanySettings(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) throw new Error("غير مصرح");

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const receiptFooter = formData.get("receiptFooter") as string;

    await prisma.company.update({
      where: { id: session.user.companyId },
      data: { name, phone, address, receiptFooter },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// 2. رفع شعار الشركة
export async function updateCompanyLogo(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) throw new Error("غير مصرح");

    const file = formData.get("logo") as File;
    if (!file || file.size === 0) return { error: "لم يتم اختيار صورة" };

    const fileExt = file.name.split('.').pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage.from("logos").upload(fileName, file, { cacheControl: '3600', upsert: true });
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(fileName);

    await prisma.company.update({
      where: { id: session.user.companyId },
      data: { logo: publicUrl },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true, url: publicUrl };
  } catch (error: any) {
    return { error: error.message };
  }
}

// 3. إضافة موظف
export async function createUser(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) throw new Error("غير مصرح");

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as "ADMIN" | "CASHIER" | "WAREHOUSE";

    if (!name || !email || !password || !role) return { error: "جميع الحقول مطلوبة" };

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return { error: "البريد الإلكتروني مسجل بالفعل" };

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { name, email, password: hashedPassword, role, companyId: session.user.companyId },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// 4. حذف موظف
export async function deleteUser(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) throw new Error("غير مصرح");

    await prisma.user.delete({ where: { id, companyId: session.user.companyId } });
    revalidatePath("/settings");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}