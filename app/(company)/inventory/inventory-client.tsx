"use client";

import { useState } from "react";
import { saveProduct, deleteProduct, adjustStock, transferToStore, importProducts } from "./actions";
import { Plus, Edit, Trash2, ArrowUpCircle, ArrowDownCircle, Store, Download, Upload, QrCode } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import Link from "next/link";

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

      {/* نافذة إضافة/تعديل منتج */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-800 mb-4">{editingProduct ? "تعديل منتج" : "إضافة منتج جديد"}</h2>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <input name="name" defaultValue={editingProduct?.name} placeholder="اسم المنتج" required className="glass-input" />
              <input name="price" type="number" step="0.01" defaultValue={editingProduct?.price} placeholder="سعر البيع" required className="glass-input" />
              <input name="cost" type="number" step="0.01" defaultValue={editingProduct?.cost} placeholder="سعر التكلفة" required className="glass-input" />
              <input name="stock" type="number" defaultValue={editingProduct?.stock} placeholder="الكمية الافتتاحية" required className="glass-input" />
              <input name="lowStockThreshold" type="number" defaultValue={editingProduct?.lowStockThreshold} placeholder="حد التنبيه" required className="glass-input" />
              <input name="barcode" defaultValue={editingProduct?.barcode} placeholder="الباركود (اختياري)" className="glass-input" />
              
              <div>
                <label className="block text-sm text-slate-600 mb-2">صورة المنتج (اختياري)</label>
                <input name="image" type="file" accept="image/*" className="glass-input w-full cursor-pointer" />
              </div>

              <select name="categoryId" defaultValue={editingProduct?.categoryId || ""} className="glass-input">
                <option value="">اختر الفئة (اختياري)</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <select name="supplierId" defaultValue={editingProduct?.supplierId || ""} className="glass-input">
                <option value="">اختر المورد (اختياري)</option>
                {suppliers.map(sup => (
                  <option key={sup.id} value={sup.id}>{sup.name}</option>
                ))}
              </select>
              
              <div className="flex gap-4 mt-4">
                <button type="submit" className="btn-emerald flex-1 py-2">حفظ</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة السحب والإيداع */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-8 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-800 mb-4">{adjustType === "ADD" ? "إيداع كمية" : "سحب كمية"} - {adjustingProduct?.name}</h2>
            <input type="number" value={adjustQty} onChange={(e) => setAdjustQty(parseInt(e.target.value))} min="1" className="glass-input w-full mb-4" />
            <div className="flex gap-4">
              <button onClick={handleAdjustSubmit} className="btn-emerald flex-1 py-2">تأكيد</button>
              <button onClick={() => setIsAdjustModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* جدول المنتجات */}
      <div className="glass-panel overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-white/30 bg-white/20">
              <th className="p-4 text-slate-700 font-semibold">المنتج</th>
              <th className="p-4 text-slate-700 font-semibold">الفئة</th>
              <th className="p-4 text-slate-700 font-semibold">المورد</th>
              <th className="p-4 text-slate-700 font-semibold">السعر</th>
              <th className="p-4 text-slate-700 font-semibold">الكمية في المخزن</th>
              <th className="p-4 text-slate-700 font-semibold">الكمية في المتجر</th>
              <th className="p-4 text-slate-700 font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-slate-500">لا توجد منتجات. اضغط على إضافة منتج جديد.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{p.name}</td>
                  <td className="p-4 text-slate-600">{p.category?.name || '-'}</td>
                  <td className="p-4 text-slate-600">{p.supplier?.name || '-'}</td>
                  <td className="p-4 text-slate-600">{p.price} ج.م</td>
                  <td className="p-4 text-slate-600 font-bold">{p.stock}</td>
                  <td className="p-4 text-purple-600 font-bold">{p.storeStock || 0}</td>
                  <td className="p-4 flex gap-2 justify-end">
                    <button onClick={() => handleTransfer(p)} title="سحب للمتجر" className="btn-emerald p-2"><Store size={16} /></button>
                    <button onClick={() => { setAdjustingProduct(p); setAdjustType("ADD"); setIsAdjustModalOpen(true); }} title="إيداع" className="btn-emerald p-2"><ArrowUpCircle size={16} /></button>
                    <button onClick={() => { setAdjustingProduct(p); setAdjustType("REMOVE"); setIsAdjustModalOpen(true); }} title="سحب" className="btn-amber p-2"><ArrowDownCircle size={16} /></button>
                    <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} title="تعديل" className="btn-blue p-2"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(p.id)} title="حذف" className="btn-amber p-2"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}