"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { formToObject } from "@/lib/format";
import { useAuth, useToast } from "@/components/Providers";
import RequireAuth from "@/components/RequireAuth";
import { Field, Loading, useLoad } from "@/components/ui";

export default function Page() {
  return <RequireAuth><Account /></RequireAuth>;
}

function Account() {
  const toast = useToast();
  const { setUser } = useAuth();
  const [errors, setErrors] = useState({});
  const [pwErrors, setPwErrors] = useState({});
  const { data: me } = useLoad(() => api("/api/auth/me"), []);
  if (!me) return <Loading />;

  const saveProfile = async (e) => {
    e.preventDefault();
    try { setUser(await api("/api/auth/me", { method: "PUT", body: formToObject(e.currentTarget) })); setErrors({}); toast("Đã lưu thông tin"); }
    catch (err) { setErrors(err.fields); toast(err.message, "error"); }
  };
  const changePassword = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    try { await api("/api/auth/me/password", { method: "PUT", body: formToObject(form) }); form.reset(); setPwErrors({}); toast("Đã đổi mật khẩu"); }
    catch (err) { setPwErrors(err.fields); toast(err.message, "error"); }
  };

  return (
    <div className="mx-auto my-12 max-w-[560px] space-y-4">
      <form onSubmit={saveProfile} className="panel">
        <h1 className="text-[26px] font-bold">Tài khoản</h1>
        <p className="mb-5 text-ink-3">{me.email}</p>
        <Field label="Họ tên" name="fullName" defaultValue={me.fullName} error={errors.fullName} />
        <Field label="Số điện thoại" name="phone" defaultValue={me.phone || ""} error={errors.phone} />
        <Field label="Địa chỉ" name="address" defaultValue={me.address || ""} />
        <button className="btn btn-primary">Lưu thông tin</button>
      </form>
      <form onSubmit={changePassword} className="panel">
        <h2 className="mb-4 text-lg font-bold">Đổi mật khẩu</h2>
        <Field label="Mật khẩu hiện tại" name="currentPassword" type="password" autoComplete="current-password" />
        <Field label="Mật khẩu mới" name="newPassword" type="password" autoComplete="new-password" error={pwErrors.newPassword} />
        <button className="btn">Đổi mật khẩu</button>
      </form>
    </div>
  );
}
