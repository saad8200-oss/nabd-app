"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { processSale } from "./actions";
import { saveOfflineSale } from "@/lib/offline-db";
import { Search, ShoppingCart, Trash2, PauseCircle, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import BarcodeScanner from "@/components/pos/barcode-scanner";

export default function POSClient({ products }: { products: any[] }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [heldCart, setHeldCart] = useState<any[] | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("heldCart");
    if (saved) {
      setHeldCart(JSON.parse(saved));
    }
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.includes(searchTerm) || (p.barcode && p.barcode.includes(searchTerm))
  );

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const handleBarcodeScan = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      addToCart(product);
      toast.success(`تمت إضافة ${product.name}`);
    } else {
      toast.error("المنتج غير موجود! تأكد من الباركود.");
    }
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const total = Math.max(0, subtotal - discount);

  const handleHold = () => {
    if (cart.length === 0) return;
    localStorage.setItem("heldCart", JSON.stringify(cart));
    setHeldCart(cart);
    setCart([]);
    toast.success("تم تعليق الفاتورة");
  };

  const handleResume = () => {
    if (!heldCart) return;
    setCart(heldCart);
    localStorage.removeItem("heldCart");
    setHeldCart(null);
    toast.success("تم استعادة الفاتورة");
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsLoading(true);
    setError("");

    const cartItems = cart.map(item => ({
      id: item.id,
      quantity: item.qty,
      price: item.price
    }));

    if (!navigator.onLine) {
      const offlineSale = {
        id: crypto.randomUUID(),
        items: cartItems,
        total: total,
        subtotal: subtotal,
        discount: discount,
        paymentMethod: paymentMethod,
        companyId: (session?.user as any)?.companyId,
        userId: session?.user?.id,
        createdAt: new Date().toISOString(),
      };
      
      await saveOfflineSale(offlineSale);
      toast.success("تم حفظ الفاتورة محلياً (وضع عدم الاتصال)");
      setCart([]);
      setDiscount(0);
      setIsLoading(false);
      return;
    }

    const result = await processSale(cartItems, total, discount, subtotal, paymentMethod);
    
    if (result?.error) {
      setError(result.error);
      toast.error(result.error);
      setIsLoading(false);
    } else {
      setCart([]);
      setDiscount(0);
      toast.success("تمت عملية البيع بنجاح!");
      setIsLoading(false);
      router.refresh(); 
      
      if (result?.saleId) {
        router.push(`/pos/receipt/${result.saleId}`);
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] gap-4 p-4">
      {/* قسم المنتجات */}
      <div className="flex-1 glass-panel p-4 flex flex-col">
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="ابحث باسم المنتج أو الباركود..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input w-full pl-10"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <BarcodeScanner onScan={handleBarcodeScan} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto">
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              onClick={() => addToCart(product)}
              className="bg-white/40 p-4 rounded-xl cursor-pointer border border-white/50 hover:bg-white/60 transition-all flex flex-col items-center text-center shadow-sm"
            >
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-lg mb-2" />
              ) : (
                <div className="w-12 h-12 bg-slate-200 rounded-lg mb-2" />
              )}
              <h3 className="text-slate-800 font-bold text-sm mb-1">{product.name}</h3>
              <p className="text-purple-600 font-bold">{product.price} ج.م</p>
              <p className="text-slate-500 text-xs mt-1">متوفر: {product.storeStock}</p>
            </div>
          ))}
        </div>
      </div>

      {/* قسم الفاتورة */}
      <div className="w-full md:w-80 glass-panel p-4 flex flex-col">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <ShoppingCart size={20} /> الفاتورة
        </h2>

        {error && <div className="bg-red-100/50 text-red-600 p-2 rounded-lg mb-2 text-sm">{error}</div>}

        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
          {cart.length === 0 ? (
            <div className="text-center text-slate-400 mt-10">السلة فارغة</div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-white/40 p-3 rounded-lg border border-white/50">
                <div>
                  <div className="text-slate-800 font-medium text-sm">{item.name}</div>
                  <div className="text-slate-500 text-xs">{item.qty} × {item.price} ج.م</div>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 border-t border-white/50 pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-600">الخصم:</span>
            <input 
              type="number" 
              value={discount} 
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="glass-input w-24 text-center"
              min="0"
            />
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-600">طريقة الدفع:</span>
            <select 
              value={paymentMethod} 
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="glass-input w-32"
            >
              <option value="CASH">كاش</option>
              <option value="CARD">فيزا</option>
              <option value="WALLET">محفظة</option>
            </select>
          </div>

          <div className="flex justify-between text-slate-800 font-bold text-lg mb-4">
            <span>الإجمالي:</span>
            <span className="text-purple-600">{total} ج.م</span>
          </div>

          {/* 👈 أزرار التعليق والاستعادة بألوان زاهية */}
          <div className="flex gap-2 mb-2">
            <button 
              onClick={handleHold}
              disabled={cart.length === 0}
              className="btn-amber flex-1 flex items-center justify-center gap-1 py-2 disabled:opacity-50"
            >
              <PauseCircle size={16} /> تعليق
            </button>
            <button 
              onClick={handleResume}
              disabled={!heldCart}
              className="btn-emerald flex-1 flex items-center justify-center gap-1 py-2 disabled:opacity-50"
            >
              <PlayCircle size={16} /> استعادة
            </button>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0 || isLoading}
            className="btn-emerald w-full py-2 disabled:opacity-50"
          >
            {isLoading ? "جاري الدفع..." : "إتمام الدفع"}
          </button>
        </div>
      </div>
    </div>
  );
}