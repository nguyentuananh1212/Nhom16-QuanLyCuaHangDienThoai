"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { api, storage } from "@/lib/api";

const SERVER = "__server__";
const AuthContext = createContext(null);
const ToastContext = createContext(() => {});

export function useAuth() { return useContext(AuthContext); }
export function useToast() { return useContext(ToastContext); }

export default function Providers({ children }) {
  // Server không có localStorage -> trả SERVER; client đọc thật. ready=false khi đang render phía server,
  // nên HTML server và lần render đầu ở client khớp nhau (không lỗi hydration).
  const raw = useSyncExternalStore(storage.subscribe, storage.getUserRaw, () => SERVER);
  const ready = raw !== SERVER;
  const user = useMemo(() => (ready ? JSON.parse(raw) : null), [raw, ready]);
  const [cartCount, setCartCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = "") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  // Gọi sau khi thêm/xoá/đặt hàng để cập nhật số trên icon giỏ
  const refreshCart = useCallback(async () => {
    if (!storage.getToken()) { setCartCount(0); return; }
    try { setCartCount((await api("/api/cart")).items.length); } catch { setCartCount(0); }
  }, []);

  // Đổi người dùng (đăng nhập/đăng xuất, kể cả ở tab khác) -> tải lại số lượng giỏ hàng
  const userId = user?.id;
  useEffect(() => {
    if (!ready) return;
    let alive = true;
    (userId ? api("/api/cart").then((c) => c.items.length, () => 0) : Promise.resolve(0))
      .then((n) => alive && setCartCount(n));
    return () => { alive = false; };
  }, [ready, userId]);

  useEffect(() => {
    const onExpired = () => toast("Phiên đăng nhập đã hết hạn", "error");
    window.addEventListener("auth-expired", onExpired);
    return () => window.removeEventListener("auth-expired", onExpired);
  }, [toast]);

  const auth = useMemo(() => ({
    ready, user, cartCount, refreshCart,
    isStaff: !!user && (user.role === "ADMIN" || user.role === "STAFF"),
    isAdmin: user?.role === "ADMIN",
    login(res) { storage.save(res.accessToken, res.user); },
    setUser(u) { storage.save(null, u); },
    logout() { storage.clear(); },
  }), [ready, user, cartCount, refreshCart]);

  return (
    <AuthContext.Provider value={auth}>
      <ToastContext.Provider value={toast}>
        {children}
        <div role="status" className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2">
          {toasts.map((t) => (
            <div key={t.id} className={`toast-in rounded-md px-4 py-2.5 font-medium ${t.type === "error" ? "bg-price text-white" : "bg-ink text-paper"}`}>
              {t.message}
            </div>
          ))}
        </div>
      </ToastContext.Provider>
    </AuthContext.Provider>
  );
}
