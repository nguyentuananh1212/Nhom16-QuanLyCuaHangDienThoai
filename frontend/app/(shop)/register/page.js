"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formToObject } from "@/lib/format";
import { useAuth, useToast } from "@/components/Providers";
import { Field } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();
  const [errors, setErrors] = useState({});

  const submit = async (e) => {
    e.preventDefault();
    try {
      login(await api("/api/auth/register", { method: "POST", body: formToObject(e.currentTarget) }));
      toast("Đã tạo tài khoản"); router.replace("/");
    } catch (err) { setErrors(err.fields); toast(err.message, "error"); }
  };

  return (
    <form noValidate onSubmit={submit} className="panel mx-auto my-12 max-w-[420px]">
      <h1 className="mb-5 text-[26px] font-bold">Tạo tài khoản</h1>
      <Field label="Họ tên" name="fullName" autoComplete="name" error={errors.fullName} />
      <Field label="Email" name="email" type="email" autoComplete="email" error={errors.email} />
      <Field label="Số điện thoại" name="phone" inputMode="tel" autoComplete="tel" error={errors.phone} />
      <Field label="Mật khẩu" name="password" type="password" autoComplete="new-password" error={errors.password} />
      <button className="btn btn-primary w-full">Tạo tài khoản</button>
      <p className="mt-4 text-center text-ink-3">
        Đã có tài khoản? <Link className="underline" href="/login">Đăng nhập</Link>
      </p>
    </form>
  );
}
