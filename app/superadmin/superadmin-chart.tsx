"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function SuperAdminChart({ data }: { data: any[] }) {
  // إذا لم تكن هناك بيانات، نعرض رسالة
  if (!data || data.length === 0) {
    return <div className="text-center text-slate-500 py-10">لا توجد بيانات كافية لعرض الرسم البياني.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
        <XAxis dataKey="name" stroke="#64748b" />
        <YAxis stroke="#64748b" allowDecimals={false} />
        <Tooltip 
          contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
          formatter={(value) => [`${value} شركة`, 'الشركات الجديدة']}
        />
        <Bar dataKey="companies" fill="#a78bfa" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}