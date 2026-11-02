"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api, safeNext } from "@/lib/api";
import { formToObject } from "@/lib/format";
import { useAuth, useToast } from "@/components/Providers";
import { Field } from "@/components/ui";

export default function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const { login } = useAuth();
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api("/api/auth/login", { method: "POST", body: formToObject(e.currentTarget) });
      login(res);
      toast("Xin chào " + res.user.fullName);
      const target = safeNext(next);
      // Khách hàng bị đưa tới trang quản trị -> báo rõ thay vì quay vòng về trang đăng nhập
      if (target.startsWith("/admin") && res.user.role === "CUSTOMER") {
        toast("Tài khoản này không có quyền quản trị", "error");
        router.replace("/");
      } else {
        router.replace(target);
      }
    } catch (err) { toast(err.message, "error"); }
  };

  return (
    <form onSubmit={submit} className="panel mx-auto my-12 max-w-[420px]">
      <h1 className="mb-5 text-[26px] font-bold">Đăng nhập</h1>
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <Field label="Mật khẩu" name="password" type="password" autoComplete="current-password" required />
      <button className="btn btn-primary w-full">Đăng nhập</button>
      <p className="mt-4 text-center text-ink-3">
        Chưa có tài khoản? <Link className="underline" href="/register">Đăng ký</Link>
      </p>
    </form>
  );
}
