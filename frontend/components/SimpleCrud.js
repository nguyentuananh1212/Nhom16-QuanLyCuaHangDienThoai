"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { formToObject } from "@/lib/format";
import { useToast } from "@/components/Providers";
import AdminHead from "@/components/AdminHead";
import { Field, Loading, Modal, useLoad } from "@/components/ui";

/** Màn CRUD dùng chung cho Hãng và Phân khúc (cùng cấu trúc: danh sách + form tên/mô tả) */
export default function SimpleCrud({ title, endpoint, adminEndpoint, fields }) {
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const { data: list, loading, reload } = useLoad(() => api(endpoint), [endpoint]);

  const open = (item) => { setErrors({}); setEditing(item); };
  const submit = async (e) => {
    e.preventDefault();
    const isNew = !editing.id;
    try {
      await api(isNew ? adminEndpoint : `${adminEndpoint}/${editing.id}`, { method: isNew ? "POST" : "PUT", body: formToObject(e.currentTarget) });
      toast("Đã lưu"); setEditing(null); reload();
    } catch (err) { setErrors(err.fields); toast(err.message, "error"); }
  };
  const remove = async (id) => {
    if (!confirm("Xoá mục này?")) return;
    try { await api(`${adminEndpoint}/${id}`, { method: "DELETE" }); toast("Đã xoá"); reload(); }
    catch (err) { toast(err.message, "error"); }
  };

  return (
    <>
      <AdminHead title={title}><button className="btn btn-primary" onClick={() => open({})}>Thêm mới</button></AdminHead>
      {loading && !list ? <Loading /> : (
        <div className="panel overflow-x-auto">
          <table className="data-table">
            <thead><tr>{fields.map((f) => <th key={f.name}>{f.label}</th>)}<th /></tr></thead>
            <tbody>
              {list?.map((x) => (
                <tr key={x.id}>
                  {fields.map((f) => <td key={f.name}>{x[f.name] ?? ""}</td>)}
                  <td className="whitespace-nowrap">
                    <button className="btn btn-sm" onClick={() => open(x)}>Sửa</button>{" "}
                    <button className="btn btn-sm btn-danger" onClick={() => remove(x.id)}>Xoá</button>
                  </td>
                </tr>
              ))}
              {list && !list.length && <tr><td colSpan={fields.length + 1} className="py-12 text-center text-ink-3">Chưa có dữ liệu</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {editing && (
        <Modal title={`${editing.id ? "Sửa" : "Thêm"} ${title.toLowerCase()}`} onClose={() => setEditing(null)}>
          <form noValidate onSubmit={submit}>
            {fields.map((f) => <Field key={f.name} label={f.label} name={f.name} defaultValue={editing[f.name] ?? ""} error={errors[f.name]} />)}
            <div className="flex justify-end gap-2">
              <button type="button" className="btn" onClick={() => setEditing(null)}>Huỷ</button>
              <button className="btn btn-primary">Lưu</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
