"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-2 text-red-500 hover:text-red-700 transition-colors bg-red-50/50 px-4 py-2 rounded-xl"
    >
      <LogOut className="w-5 h-5" />
      <span className="text-sm font-medium">تسجيل الخروج</span>
    </button>
  );
}