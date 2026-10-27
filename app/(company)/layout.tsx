import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.companyId) redirect("/login");

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { logo: true, name: true }
  });

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header 
          companyLogo={company?.logo} 
          userName={session.user.name || "مستخدم"} 
          userEmail={session.user.email || ""} 
        />
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}