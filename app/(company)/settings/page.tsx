import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SettingsForm from "./settings-form";
import UsersClient from "./users/users-client";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.companyId) redirect("/login");

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId }
  });

  const users = await prisma.user.findMany({
    where: { companyId: session.user.companyId },
    orderBy: { createdAt: 'desc' }
  });

  if (!company) return <div className="p-8 text-slate-800 text-center">لم يتم العثور على بيانات الشركة.</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-8">
      {/* 1. إعدادات الشركة */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">إعدادات الشركة</h2>
        <SettingsForm company={company} />
      </div>

      {/* 2. إدارة المستخدمين */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">إدارة المستخدمين</h2>
        <UsersClient users={users} currentUserId={session.user.id} />
      </div>
    </div>
  );
}