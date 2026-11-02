"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { fmtDate, ROLE_LABEL } from "@/lib/format";
import { useAuth, useToast } from "@/components/Providers";
import AdminHead from "@/components/AdminHead";
import { Empty, Loading, Pager, useLoad } from "@/components/ui";

export default function AdminUsers() {
  const { user: me, isAdmin } = useAuth();
  const [filter, setFilter] = useState({ keyword: "", role: "", page: 0 });
  const { data, loading, reload } = useLoad(
    () => (isAdmin ? api("/api/admin/users", { query: { ...filter, size: 20 } }) : Promise.resolve(null)), [filter, isAdmin]);

  if (!isAdmin) return <Empty>Chỉ quản trị viên được truy cập.</Empty>;
  return (
    <>
      <AdminHead title="Người dùng" />
      <form className="mb-3.5 flex flex-wrap gap-2" onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setFilter({ keyword: f.get("keyword").trim(), role: f.get("role"), page: 0 });
      }}>
        <input name="keyword" placeholder="Email hoặc họ tên" aria-label="Tìm người dùng" className="input w-auto min-w-48" />
        <select name="role" aria-label="Vai trò" className="input w-auto">
          <option value="">Mọi vai trò</option>
          {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="btn">Lọc</button>
      </form>
      {loading && !data ? <Loading /> : (
        <div className="panel overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Email</th><th>Họ tên</th><th>SĐT</th><th>Vai trò</th><th>Trạng thái</th><th>Ngày tạo</th><th /></tr></thead>
            <tbody>{data?.content.map((u) => <UserRow key={u.id} u={u} isMe={u.id === me.id} onError={reload} />)}</tbody>
          </table>
        </div>
      )}
      <Pager data={data} onChange={(page) => setFilter((f) => ({ ...f, page }))} />
    </>
  );
}

function UserRow({ u, isMe, onError }) {
  const toast = useToast();
  const [role, setRole] = useState(u.role);
  const [enabled, setEnabled] = useState(u.enabled);
  const save = async () => {
    try { await api("/api/admin/users/" + u.id, { method: "PUT", body: { role, enabled } }); toast("Đã cập nhật"); }
    catch (e) { toast(e.message, "error"); setRole(u.role); setEnabled(u.enabled); onError(); }
  };
  return (
    <tr>
      <td>{u.email}</td><td>{u.fullName}</td><td className="tabular-nums">{u.phone || ""}</td>
      <td>
        <select aria-label="Vai trò" className="input w-auto" value={role} disabled={isMe} onChange={(e) => setRole(e.target.value)}>
          {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </td>
      <td>
        <label className="flex items-center gap-2 whitespace-nowrap">
          <input type="checkbox" checked={enabled} disabled={isMe} onChange={(e) => setEnabled(e.target.checked)} /> Hoạt động
        </label>
      </td>
      <td>{fmtDate(u.createdAt)}</td>
      <td>{isMe ? <span className="text-ink-3">Bạn</span> : <button className="btn btn-sm" onClick={save}>Lưu</button>}</td>
    </tr>
  );
}
