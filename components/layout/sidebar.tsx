"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, FileText, Settings, Store, Truck, Activity, Tag } from "lucide-react"; // 👈 أضفنا Tag
import { useSession } from "next-auth/react";

const navItems = [
  { name: "لوحة التحكم", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "CASHIER", "WAREHOUSE"] },
  { name: "المخازن", href: "/inventory", icon: Package, roles: ["ADMIN", "WAREHOUSE"] },
  { name: "الفئات", href: "/categories", icon: Tag, roles: ["ADMIN", "WAREHOUSE"] }, // 👈 تمت الإضافة هنا
  { name: "المنتجات (المتجر)", href: "/products", icon: Store, roles: ["ADMIN", "WAREHOUSE"] },
  { name: "الموردين", href: "/suppliers", icon: Truck, roles: ["ADMIN", "WAREHOUSE"] },
  { name: "نقطة البيع", href: "/pos", icon: ShoppingCart, roles: ["ADMIN", "CASHIER"] },
  { name: "الفواتير والتقارير", href: "/reports", icon: FileText, roles: ["ADMIN"] },
  { name: "سجل العمليات", href: "/audit", icon: Activity, roles: ["ADMIN"] },
  { name: "الإعدادات", href: "/settings", icon: Settings, roles: ["ADMIN"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "";

  return (
    <aside className="w-64 h-screen glass-panel m-4 rounded-3xl flex flex-col p-4">
      <div className="flex items-center gap-3 px-4 py-6 border-b border-white/20 mb-6">
        <Activity className="w-8 h-8 text-purple-500" />
        <span className="text-xl font-bold text-slate-800">نبض (Nabd)</span>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          // إخفاء الرابط إذا لم يكن الدور مسموحاً به
          if (!item.roles.includes(userRole)) return null;

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? "bg-purple-100/50 text-purple-700 font-semibold" 
                  : "text-slate-600 hover:bg-white/40"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-purple-600" : "text-slate-500"}`} />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}