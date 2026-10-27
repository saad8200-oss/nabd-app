"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { deleteCompany } from "./new/actions";

export default function CompanyActions({ companyId }: { companyId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذه الشركة نهائياً؟ سيتم حذف جميع بياناتها (موظفين، منتجات، فواتير).")) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteCompany(companyId);
    
    if (result.error) {
      alert(result.error);
      setIsDeleting(false);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="flex gap-2 justify-end">
      <Link 
        href={`/superadmin/companies/edit/${companyId}`}
        className="p-2 bg-purple-100/50 text-purple-600 rounded-lg hover:bg-purple-200/50 transition-colors"
        title="تعديل الشركة"
      >
        <Edit size={16} />
      </Link>

      <button 
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-2 bg-red-100/50 text-red-600 rounded-lg hover:bg-red-200/50 transition-colors disabled:opacity-50"
        title="حذف الشركة"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}