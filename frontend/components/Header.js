"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useToast } from "@/components/Providers";

const nav = "whitespace-nowrap rounded-md px-3 py-2 font-medium text-ink-2 hover:bg-paper hover:text-ink max-sm:px-2 max-sm:text-sm";

export default function Header() {
  const { ready, user, isStaff, cartCount, logout } = useAuth();
  const toast = useToast();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-5 max-sm:gap-2 max-sm:px-3">
        <Link href="/" className="group flex items-center gap-2.5 whitespace-nowrap">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-950 via-indigo-950 to-purple-900 border border-purple-500/40 shadow-sm shadow-purple-500/20 transition-transform group-hover:scale-105">
            <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-tr from-amber-300 via-purple-200 to-white tracking-tighter">
              A
            </span>
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-400 animate-ping opacity-75" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-400" />
          </div>
          <div className="flex flex-col leading-none">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-wider text-slate-900 max-sm:text-[16px]">
                AURA
              </span>
              <span className="text-[9px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs">
                STORE
              </span>
            </div>
            <span className="text-[8.5px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
              Hào Quang Công Nghệ
            </span>
          </div>
        </Link>
        <nav className="ml-auto flex items-center gap-1 overflow-x-auto max-sm:gap-0">
          <Link className={nav} href="/products">Sản phẩm</Link>
          {ready && user && (
            <>
              <Link className={`${nav} relative`} href="/cart">
                Giỏ hàng
                {cartCount > 0 && (
                  <span className="absolute right-0 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-price px-1 text-[11px] font-bold text-white tabular-nums">{cartCount}</span>
                )}
              </Link>
              <Link className={nav} href="/orders">Đơn hàng</Link>
              {isStaff && <Link className={nav} href="/admin">Quản trị</Link>}
              <Link className={nav} href="/account" title={user.fullName}>Tài khoản</Link>
              <button className={nav} onClick={() => { logout(); toast("Đã đăng xuất"); router.push("/"); }}>Đăng xuất</button>
            </>
          )}
          {ready && !user && (
            <>
              <Link className={nav} href="/login">Đăng nhập</Link>
              <Link className="btn btn-primary btn-sm" href="/register">Đăng ký</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
