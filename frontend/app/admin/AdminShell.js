"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/Providers";
import RequireAuth from "@/components/RequireAuth";

// Danh mục menu điều hướng kèm icon SVG sắc nét chuẩn giao diện quản trị hiện đại
const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Tổng quan",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    href: "/admin/orders",
    label: "Đơn hàng",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    href: "/admin/products",
    label: "Sản phẩm",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/admin/inventory",
    label: "Kho & Lợi nhuận",
    badge: "Mới",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    href: "/admin/brands",
    label: "Hãng sản xuất",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    href: "/admin/categories",
    label: "Phân khúc",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    href: "/admin/vouchers",
    label: "Mã giảm giá",
    badge: "Mới",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
  },
  {
    href: "/admin/users",
    label: "Người dùng",
    adminOnly: true,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString("vi-VN"));
  }, []);

  return (
    <RequireAuth staff>
      <div className="grid min-h-screen grid-cols-[260px_1fr] max-md:grid-cols-1 bg-[#F8FAFC]">
        {/* SIDEBAR BÊN TRÁI HIỆN ĐẠI */}
        <aside className="sticky top-0 h-screen flex flex-col justify-between bg-[#0F172A] px-4 py-5 text-gray-300 shadow-xl max-md:static max-md:h-auto border-r border-slate-800">
          <div>
            {/* LOGO ADMIN */}
            <div className="px-2.5 pb-6 border-b border-slate-800/80 mb-5">
              <Link href="/admin" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 grid place-items-center text-white font-black text-lg shadow-md shadow-purple-500/30">
                  A
                </div>
                <div>
                  <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                    AURA
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-1.5 py-0.2 rounded-md">
                      ADMIN
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">Hệ thống quản trị AURA Store</div>
                </div>
              </Link>
            </div>

            {/* DANH SÁCH MENU ĐIỀU HƯỚNG */}
            <nav className="space-y-1">
              {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/25 font-bold"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive ? "text-white" : "text-slate-400 group-hover:text-white"}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* KHỐI TÀI KHOẢN ADMIN VÀ ĐĂNG XUẤT */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            {/* Thẻ User Profile */}
            <div className="flex items-center gap-3 rounded-xl bg-slate-800/40 p-2.5 border border-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-bold text-xs grid place-items-center shadow-xs">
                {(user?.fullName || "Admin").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">{user?.fullName || "Quản trị viên"}</div>
                <div className="text-[10px] text-slate-400 truncate">{user?.email || "admin@phoneshop.vn"}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 text-xs">
              <Link
                href="/"
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800/60 py-2 text-center text-[11px] font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                Về cửa hàng
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2 text-center text-[11px] font-semibold text-red-400 hover:bg-red-900/50 hover:text-red-200 transition-colors"
                title="Đăng xuất khỏi hệ thống"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </aside>

        {/* NỘI DUNG CHÍNH (MAIN CONTENT) */}
        <div className="flex flex-col min-w-0">
          {/* TOPBAR TRÊN CÙNG */}
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-7 max-sm:px-4 shadow-2xs">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-slate-600">Trạng thái: Máy chủ hoạt động ổn định</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <Link
                href="/admin/products"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 font-semibold hover:bg-blue-100 transition-colors"
              >
                <span>+ Thêm sản phẩm nhanh</span>
              </Link>
              {currentDate && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-600 font-semibold">{currentDate}</span>
                </>
              )}
            </div>
          </header>

          <main className="min-w-0 px-7 py-6 max-sm:px-4 flex-1">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}
