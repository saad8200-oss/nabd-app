"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createCategory(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) throw new Error("غير مصرح");

    const name = formData.get("name") as string;
    if (!name) return { error: "اسم الفئة مطلوب" };

    await prisma.category.create({
      data: { name, companyId: session.user.companyId },
    });

    revalidatePath("/categories");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteCategory(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) throw new Error("غير مصرح");

    await prisma.category.delete({
      where: { id, companyId: session.user.companyId },
    });

    revalidatePath("/categories");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}