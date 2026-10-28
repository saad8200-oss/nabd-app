"use client"; // 👈 تحويل الملف إلى Client Component

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { redirect } from "next/navigation";

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 👈 حالة القائمة

  if (status === "loading") return <div className="p-8 text-center">جاري التحميل...</div>;
  if (!session?.user?.companyId) redirect("/login");

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      {/* القائمة الجانبية */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-h-screen">
        {/* الهيدر */}
        <Header 
          companyLogo={(session?.user as any)?.companyLogo} 
          userName={session.user.name || "مستخدم"} 
          userEmail={session.user.email || ""} 
          onMenuClick={() => setIsSidebarOpen(true)} // 👈 فتح القائمة
        />
        {/* محتوى الصفحة */}
        <main className="flex-1 p-4 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}