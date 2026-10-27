import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ProductsPage() {
  const session = await auth();
  if (!session?.user?.companyId) redirect("/login");

  // جلب المنتجات التي في المتجر فقط
  const products = await prisma.product.findMany({
    where: { 
      companyId: session.user.companyId,
      storeStock: { gt: 0 }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">المنتجات (رفوف المتجر)</h1>
        <p className="text-slate-500 mt-1">الكميات المتاحة للبيع حالياً في المتجر</p>
      </div>

      <div className="glass-panel overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-white/30 bg-white/20">
              <th className="p-4 text-slate-700 font-semibold">المنتج</th>
              <th className="p-4 text-slate-700 font-semibold">الكمية في المتجر</th>
              <th className="p-4 text-slate-700 font-semibold">السعر</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-slate-500">
                  لا توجد منتجات في المتجر حالياً. قم بسحب منتجات من صفحة المخازن.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{p.name}</td>
                  <td className="p-4 text-purple-600 font-bold">{p.storeStock}</td>
                  <td className="p-4 text-slate-600">{p.price} ج.م</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}