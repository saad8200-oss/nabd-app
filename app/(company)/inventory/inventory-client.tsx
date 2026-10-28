"use client";

import { useState } from "react";
import { saveProduct, deleteProduct, adjustStock, transferToStore, importProducts } from "./actions";
import { Plus, Edit, Trash2, ArrowUpCircle, ArrowDownCircle, Store, Download, Upload, QrCode } from "lucide-react"; // 👈 أضفنا QrCode
import { toast } from "sonner";
import * as XLSX from "xlsx";
import Link from "next/link"; // 👈 استيراد Link

export default function InventoryClient({ products, categories, suppliers }: { products: any[], categories: any[], suppliers: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [error, setError] = useState("");
  
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<any>(null);
  const [adjustType, setAdjustType] = useState<"ADD" | "REMOVE">("ADD");
  const [adjustQty, setAdjustQty] = useState(1);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (editingProduct) formData.append("id", editingProduct.id);

    const result = await saveProduct(formData);
    if (result?.error) {
      setError(result.error);
      toast.error(result.error);
    } else {
      setIsModalOpen(false);
      setEditingProduct(null);
      setError("");
      toast.success("تم حفظ المنتج بنجاح!");
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleAdjustSubmit = async () => {
    const result = await adjustStock(adjustingProduct.id, adjustQty, adjustType);
    if (result?.error) toast.error(result.error);
    else {
      setIsAdjustModalOpen(false);
      setAdjustingProduct(null);
      toast.success("تم تحديث الكمية بنجاح!");
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleTransfer = async (product: any) => {
    const qty = prompt(`كم تريد سحب من "${product.name}" إلى المتجر؟\nالمتاح في المخزن: ${product.stock}`);
    if (qty && !isNaN(Number(qty)) && Number(qty) > 0) {
      const result = await transferToStore(product.id, Number(qty));
      if (result?.error) toast.error(result.error);
      else {
        toast.success("تم السحب إلى المتجر بنجاح!");
        setTimeout(() => window.location.reload(), 1000);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      const result = await deleteProduct(id);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("تم حذف المنتج!");
        setTimeout(() => window.location.reload(), 1000);
      }
    }
  };

  const handleExportExcel = () => {
    if (products.length === 0) return toast.error("لا توجد منتجات للتصدير.");
    
    const data = products.map(p => ({
      "اسم المنتج": p.name,
      "الفئة": p.category?.name || "",
      "المورد": p.supplier?.name || "",
      "السعر": p.price,
      "التكلفة": p.cost,
      "الكمية في المخزن": p.stock,
      "الكمية في المتجر": p.storeStock,
      "الباركود": p.barcode || "",
      "حد التنبيه": p.lowStockThreshold,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "المنتجات");
    XLSX.writeFile(workbook, `المنتجات_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("تم التصدير بنجاح!");
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      const result = await importProducts(jsonData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("تم استيراد المنتجات بنجاح!");
        setTimeout(() => window.location.reload(), 1000);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">إدارة المخازن</h1>
          <p className="text-slate-500 mt-1">إضافة، تعديل، سحب، وإيداع المنتجات في المستودع الرئيسي</p>
        </div>
        <div className="flex gap-2">
          <Link href="/inventory/qr-labels" className="btn-blue flex items-center gap-2 px-4 py-2">
            <QrCode size={20} /> طباعة QR
          </Link>
          <button onClick={handleExportExcel} className="btn-blue flex items-center gap-2 px-4 py-2">
            <Download size={20} /> تصدير Excel
          </button>
          <label className="btn-emerald flex items-center gap-2 px-4 py-2 cursor-pointer">
            <Upload size={20} /> استيراد Excel
            <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportExcel} />
          </label>
          <button 
            onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} 
            className="btn-emerald flex items-center gap-2 px-4 py-2"
          >
            <Plus size={20} /> إضافة منتج جديد
          </button>
        </div>
      </div>

      {/* ... (باقي الكود كما هو) ... */}
    </div>
  );
}