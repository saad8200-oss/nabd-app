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