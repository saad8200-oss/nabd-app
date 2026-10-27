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
      data: { name, expiryDate: expiryDate ? new Date(expiryDate) : null, isActive },
    });

    if (newPassword && newPassword.trim() !== "") {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const companyAdmin = await prisma.user.findFirst({ where: { companyId: id, role: "ADMIN" } });
      if (companyAdmin) {
        await prisma.user.update({ where: { id: companyAdmin.id }, data: { password: hashedPassword } });
      }
    }

    revalidatePath("/superadmin/companies");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}