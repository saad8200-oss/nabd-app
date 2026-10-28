"use client";

import { useState } from "react";
import { createOnlineOrder } from "./actions";
import { toast } from "sonner";
import { ShoppingCart, CheckCircle } from "lucide-react";

export default function OrderClient({ company, products, companyId }: any) {
  const [cart, setCart] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [branch, setBranch] = useState("الفرع الرئيسي");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return toast.error("السلة فارغة.");
    if (!name || !phone) return toast.error("الرجاء إدخال الاسم ورقم الهاتف.");

    setIsSubmitting(true);
    const result = await createOnlineOrder({
      companyId,
      customerName: name,
      customerPhone: phone,
      pickupBranch: branch,
      items: cart,
      total
    });

    if (result?.error) {
      toast.error(result.error);
      setIsSubmitting(false);
    } else {
      setOrderSuccess(true);
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <CheckCircle size={64} className="text-green-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-800">تم استلام طلبك بنجاح!</h1>
        <p className="text-slate-500 mt-2">سيتم تجهيز طلبك للاستلام من {branch}.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          {company.logo && <img src={company.logo} alt="Logo" className="w-16 h-16 mx-auto mb-2" />}
          <h1 className="text-3xl font-bold text-slate-800">{company.name}</h1>
          <p className="text-slate-500">اطلب الآن واستلم من الفرع</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* المنتجات */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((p: any) => (
              <div 
                key={p.id} 
                onClick={() => addToCart(p)}
                className="bg-white p-4 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-all"
              >
                {p.imageUrl ? <img src={p.imageUrl} className="w-full h-32 object-cover rounded-lg mb-2" /> : <div className="w-full h-32 bg-slate-200 rounded-lg mb-2" />}
                <h3 className="font-bold text-slate-800">{p.name}</h3>
                <p className="text-purple-600 font-bold">{p.price} ج.م</p>
              </div>
            ))}
          </div>

          {/* السلة والطلب */}
          <div className="w-full md:w-96 bg-white p-6 rounded-xl shadow-sm h-fit">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ShoppingCart size={20} /> طلبك</h2>
            
            {cart.map((item: any) => (
              <div key={item.id} className="flex justify-between mb-2 text-sm">
                <span>{item.name} × {item.qty}</span>
                <span>{item.price * item.qty} ج.م</span>
              </div>
            ))}
            
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between font-bold text-lg mb-4">
                <span>الإجمالي:</span>
                <span>{total} ج.م</span>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input placeholder="الاسم بالكامل" value={name} onChange={e => setName(e.target.value)} className="p-2 border rounded-lg" required />
                <input placeholder="رقم الهاتف" value={phone} onChange={e => setPhone(e.target.value)} className="p-2 border rounded-lg" required />
                <select value={branch} onChange={e => setBranch(e.target.value)} className="p-2 border rounded-lg">
                  <option value="الفرع الرئيسي">الفرع الرئيسي</option>
                  <option value="فرع المعادي">فرع المعادي</option>
                </select>
                <button type="submit" disabled={isSubmitting} className="bg-purple-600 text-white py-2 rounded-lg font-bold">
                  {isSubmitting ? "جاري الطلب..." : "تأكيد الطلب"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}