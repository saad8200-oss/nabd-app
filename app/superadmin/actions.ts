"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { logAction } from "@/lib/audit";

// 1. إضافة شركة جديدة (إذا كنت تستخدمها هنا)
export async function createCompany(formData: FormData) {
  // ... (نفس الكود السابق)
}

// 2. تعديل شركة (مع إعادة تعيين كلمة المرور)
export async function updateCompany(id: string, formData: FormData) {
  // ... (نفس الكود السابق)
}

// 3. حذف شركة
export async function deleteCompany(id: string) {
  // ... (نفس الكود السابق)
}