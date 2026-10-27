"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <h1 className="text-3xl font-bold text-slate-800 mb-4">أنت غير متصل بالإنترنت</h1>
      <p className="text-slate-500 mb-6">النظام يعمل في وضع عدم الاتصال. يمكنك متابعة البيع، وسيتم المزامنة عند عودة الإنترنت.</p>
      <button 
        onClick={() => window.location.reload()}
        className="glass-button"
      >
        إعادة المحاولة
      </button>
    </div>
  );
}