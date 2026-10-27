import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function logAction(
  action: string,
  entity: string,
  entityId: string | null,
  details: string
) {
  try {
    const session = await auth();
    const currentUser = session?.user as any;

    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        details,
        userId: currentUser?.id || null,
        companyId: currentUser?.companyId || null,
      },
    });
  } catch (error) {
    console.error("Failed to log action:", error);
  }
}