import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "SUPER_ADMIN") {
    redirect("/superadmin");
  }

  if (session.user.role === "CASHIER") {
    redirect("/pos");
  }

  // افتراضياً: مدير الشركة أو أمين المخزن
  redirect("/dashboard");
}