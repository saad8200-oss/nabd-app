export interface OfflineSale {
  id: string;
  items: any[];
  total: number;
  subtotal: number;
  discount: number;
  paymentMethod: string;
  companyId: string | undefined; // 👈 السماح بـ undefined
  userId: string | undefined;    // 👈 السماح بـ undefined
  createdAt: string;
}

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("NabdOfflineDB", 1);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("sales")) {
        db.createObjectStore("sales", { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveOfflineSale(sale: OfflineSale): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("sales", "readwrite");
    const store = tx.objectStore("sales");
    store.put(sale);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineSales(): Promise<OfflineSale[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("sales", "readonly");
    const store = tx.objectStore("sales");
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function clearOfflineSales(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("sales", "readwrite");
    const store = tx.objectStore("sales");
    store.clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}