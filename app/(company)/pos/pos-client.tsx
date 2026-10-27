"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { processSale } from "./actions";
import { saveOfflineSale, getProducts, saveProducts } from "@/lib/offline-db";
import { Search, ShoppingCart, Trash2, PauseCircle, PlayCircle, X } from "lucide-react";
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

  // 👈 حالة الفاتورة المحلية
  const [offlineReceipt, setOfflineReceipt] = useState<any>(null);
  const [showOfflineReceipt, setShowOfflineReceipt] = useState(false);

  useEffect(() => {
    if (products && products.length > 0) {
      saveProducts(products).catch(console.error);
    }
  }, [products]);

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
        items: cartItems.map(item => {
          const product = products.find(p => p.id === item.id);
          return { ...item, name: product?.name || 'منتج' };
        }),
        total: total,
        subtotal: subtotal,
        discount: discount,
        paymentMethod: paymentMethod,
        companyId: (session?.user as any)?.companyId,
        userId: session?.user?.id,
        createdAt: new Date().toISOString(),
      };
      
      await saveOfflineSale(offlineSale);
      
      // 👈 عرض الفاتورة في نافذة منبثقة
      setOfflineReceipt(offlineSale);
      setShowOfflineReceipt(true);
      
      toast.success("تم حفظ الفاتورة محلياً.");
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
      {/* ... (بقية واجهة المنتجات والفاتورة كما هي) ... */}
      {/* 👈 أضف نافذة عرض الفاتورة المحلية هنا */}
      {showOfflineReceipt && offlineReceipt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white p-8 rounded-xl w-full max-w-md text-black">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">فاتورة (أوفلاين)</h2>
              <button onClick={() => setShowOfflineReceipt(false)}><X size={24} /></button>
            </div>
            <p>رقم الفاتورة: {offlineReceipt.id.slice(0, 8)}</p>
            <p>التاريخ: {new Date(offlineReceipt.createdAt).toLocaleString('ar-EG')}</p>
            
            <table className="w-full mt-4 text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right">المنتج</th>
                  <th className="text-center">الكمية</th>
                  <th className="text-left">السعر</th>
                </tr>
              </thead>
              <tbody>
                {offlineReceipt.items.map((item: any, idx: number) => (
                  <tr key={idx} className="border-b border-dashed">
                    <td>{item.name}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-left">{item.price * item.quantity} ج.م</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 border-t pt-4">
              <p className="font-bold">الإجمالي: {offlineReceipt.total} ج.م</p>
            </div>

            <button 
              onClick={() => window.print()} 
              className="w-full mt-4 py-2 bg-emerald-500 text-white rounded-lg"
            >
              طباعة
            </button>
          </div>
        </div>
      )}

      {/* ... (بقية واجهة المنتجات والفاتورة) ... */}
    </div>
  );
}