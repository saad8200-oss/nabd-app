"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { logAction } from "@/lib/audit";

export async function createCompany(formData: FormData) { /* ... */ }
export async function updateCompany(id: string, formData: FormData) { /* ... */ }
export async function deleteCompany(id: string) { /* ... */ }