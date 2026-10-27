"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createSupplier(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) throw new Error("غير مصرح");

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;

    if (!name) return { error: "اسم المورد مطلوب" };

    await prisma.supplier.create({
      data: { name, phone: phone || null, email: email || null, companyId: session.user.companyId },
    });

    revalidatePath("/suppliers");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteSupplier(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) throw new Error("غير مصرح");
    await prisma.supplier.delete({ where: { id, companyId: session.user.companyId } });
    revalidatePath("/suppliers");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}