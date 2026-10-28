"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { logAction } from "@/lib/audit";

// 1. إضافة شركة جديدة
export async function createCompany(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") throw new Error("غير مصرح");

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const expiryDate = formData.get("expiryDate") as string;

    if (!name || !email || !password) return { error: "جميع الحقول مطلوبة" };

    const existingCompany = await prisma.company.findUnique({ where: { email } });
    if (existingCompany) return { error: "البريد الإلكتروني مسجل بالفعل" };

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name,
          email,
          password: hashedPassword,
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
    return { error: error.message };
  }
}

// 2. تعديل الشركة (مع إعادة تعيين كلمة المرور)
export async function updateCompany(id: string, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") throw new Error("غير مصرح");

    const name = formData.get("name") as string;
    const expiryDate = formData.get("expiryDate") as string;
    const isActive = formData.get("isActive") === "on";
    const newPassword = formData.get("newPassword") as string;

    await prisma.company.update({
      where: { id },
      data: {
        name,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive,
      },
    });

    if (newPassword && newPassword.trim() !== "") {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const companyAdmin = await prisma.user.findFirst({ where: { companyId: id, role: "ADMIN" } });
      if (companyAdmin) {
        await prisma.user.update({ where: { id: companyAdmin.id }, data: { password: hashedPassword } });
      }
    }

    await logAction("UPDATE", "Company", id, `تم تعديل الشركة: ${name}`);
    revalidatePath("/superadmin/companies");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// 3. حذف شركة
export async function deleteCompany(id: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") throw new Error("غير مصرح");

    await prisma.$transaction(async (tx) => {
      await tx.saleItem.deleteMany({ where: { sale: { companyId: id } } });
      await tx.sale.deleteMany({ where: { companyId: id } });
      await tx.product.deleteMany({ where: { companyId: id } });
      await tx.supplier.deleteMany({ where: { companyId: id } });
      await tx.category.deleteMany({ where: { companyId: id } });
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

// 👈 4. الانتحال (الدخول إلى الشركة)
export async function impersonateCompany(companyId: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      throw new Error("غير مصرح");
    }

    const companyAdmin = await prisma.user.findFirst({
      where: { companyId, role: "ADMIN" },
    });

    if (!companyAdmin) return { error: "لا يوجد مدير لهذه الشركة" };

    await prisma.user.update({
      where: { id: companyAdmin.id },
      data: { isImpersonating: true, impersonatedBy: session.user.email },
    });

    return { success: true, email: companyAdmin.email, password: "123456" };
  } catch (error: any) {
    return { error: error.message };
  }
}

// 5. إعادة تعيين حالة الانتحال
export async function stopImpersonation(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isImpersonating: false, impersonatedBy: null },
    });
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}