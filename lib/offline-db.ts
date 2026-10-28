export interface OfflineSale {
  id: string;
  items: any[];
  total: number;
  subtotal: number;
  discount: number;
  paymentMethod: string;
  companyId: string | undefined;
  userId: string | undefined;
  createdAt: string;
}

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    // 👈 رفع الإصدار إلى 3 لإضافة store جديد
    const request = indexedDB.open("NabdOfflineDB", 3);

    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      
      // store للمبيعات
      if (!db.objectStoreNames.contains("sales")) {
        db.createObjectStore("sales", { keyPath: "id" });
      }
      
      // store للمنتجات
      if (!db.objectStoreNames.contains("products")) {
        db.createObjectStore("products", { keyPath: "id" });
      }

      // 👈 store للإعدادات (تاريخ الانتهاء)
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings");
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

// دوال المنتجات
export async function saveProducts(products: any[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("products", "readwrite");
    const store = tx.objectStore("products");
    products.forEach(p => store.put(p));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getProducts(): Promise<any[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("products", "readonly");
    const store = tx.objectStore("products");
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// 👈 دوال تاريخ الانتهاء
export async function saveExpiryDate(expiryDate: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("settings", "readwrite");
    const store = tx.objectStore("settings");
    store.put(expiryDate, "expiryDate");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getExpiryDate(): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("settings", "readonly");
    const store = tx.objectStore("settings");
    const request = store.get("expiryDate");
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}