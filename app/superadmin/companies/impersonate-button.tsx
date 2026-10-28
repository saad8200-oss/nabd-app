"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, signIn } from "next-auth/react";
import { LogIn } from "lucide-react";
import { impersonateCompany } from "./actions";

export default function ImpersonateButton({ companyId }: { companyId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleImpersonate = async () => {
    setIsLoading(true);
    const result = await impersonateCompany(companyId);

    if (result.error) {
      alert(result.error);
      setIsLoading(false);
    } else if (result.success && result.email && result.password) {
      await signOut({ redirect: false });
      
      const loginResult = await signIn("credentials", {
        email: result.email,
        password: result.password,
        redirect: false,
      });

      if (loginResult?.error) {
        alert("حدث خطأ أثناء الدخول إلى الشركة.");
        setIsLoading(false);
        router.push("/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    }
  };

  return (
    <button 
      onClick={handleImpersonate}
      disabled={isLoading}
      className="btn-emerald p-2 rounded-lg"
      title="الدخول إلى الشركة"
    >
      <LogIn size={16} />
    </button>
  );
}