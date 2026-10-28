"use client";

import { signOut } from "next-auth/react";
import { LogOut, User, Moon, Sun, Menu } from "lucide-react"; // 👈 إضافة Menu
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Header({ 
  companyLogo, 
  userName, 
  userEmail, 
  onMenuClick 
}: { 
  companyLogo?: string | null, 
  userName: string, 
  userEmail: string,
  onMenuClick: () => void // 👈 دالة فتح القائمة
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <header className="h-16 glass-panel m-4 mt-4 rounded-3xl flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* 👈 زر القائمة (يظهر فقط على الهاتف) */}
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white"
        >
          <Menu size={24} />
        </button>

        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center overflow-hidden border border-purple-200 dark:border-purple-700">
          {companyLogo ? (
            <Image src={companyLogo} alt="Logo" width={40} height={40} className="object-cover" />
          ) : (
            <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{userName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{userEmail}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 text-red-500 hover:text-red-700 transition-colors bg-red-50/50 dark:bg-red-900/20 px-3 py-2 rounded-xl"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium hidden md:block">تسجيل الخروج</span> {/* 👈 إخفاء النص على الهاتف */}
        </button>
      </div>
    </header>
  );
}