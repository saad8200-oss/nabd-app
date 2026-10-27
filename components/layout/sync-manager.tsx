"use client";

import { useEffect } from "react";
import { getOfflineSales, clearOfflineSales } from "@/lib/offline-db";
import { toast } from "sonner";

export function SyncManager() {
  useEffect(() => {
    const syncSales = async () => {
      if (!navigator.onLine) return;

      const offlineSales = await getOfflineSales();
      if (offlineSales.length === 0) return;

      toast.info(`جاري مزامنة ${offlineSales.length} فاتورة محفوظة...`);

      for (const sale of offlineSales) {
        try {
          const res = await fetch("/api/sync-sale", {
            method: "POST",
            body: JSON.stringify(sale),
          });
          if (!res.ok) throw new Error("Sync failed");
        } catch (error) {
          console.error("Failed to sync sale:", error);
          return;
        }
      }

      await clearOfflineSales();
      toast.success("تمت مزامنة جميع الفواتير بنجاح!");
      window.location.reload();
    };

    window.addEventListener("online", syncSales);
    return () => window.removeEventListener("online", syncSales);
  }, []);

  return null;
}