"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { vnd } from "@/lib/format";
import { useToast } from "@/components/Providers";
import AdminHead from "@/components/AdminHead";
import { Empty, Loading, Modal, useLoad } from "@/components/ui";

export default function AdminVouchers() {
  const toast = useToast();
  const { data: vouchers, loading, reload } = useLoad(() => api("/api/admin/vouchers"), []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setEditing({
      code: "",
      name: "",
      description: "",
      discountType: "FIXED_AMOUNT",
      discountValue: "",
      minOrderAmount: "",
      maxDiscountAmount: "",
      quantity: 50,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "2026-12-31",
      active: true,
    });
    setModalOpen(true);
  };

  const openEdit = (v) => {
    setEditing({
      ...v,
      minOrderAmount: v.minOrderAmount || "",
      maxDiscountAmount: v.maxDiscountAmount || "",
    });
    setModalOpen(true);
  };

  const handleToggle = async (v) => {
    try {
      await api(`/api/admin/vouchers/${v.id}/toggle`, { method: "POST" });
      toast(`Đã ${v.active ? "tạm khóa" : "kích hoạt"} mã ${v.code}`);
      reload();
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const handleDelete = async (v) => {
    if (!confirm(`Bạn có chắc muốn xóa mã giảm giá "${v.code}"?`)) return;
    try {
      await api(`/api/admin/vouchers/${v.id}`, { method: "DELETE" });
      toast("Đã xóa mã giảm giá");
      reload();
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        code: editing.code.trim().toUpperCase(),
        name: editing.name.trim(),
        description: editing.description?.trim() || null,
        discountType: editing.discountType,
        discountValue: Number(editing.discountValue),
        minOrderAmount: editing.minOrderAmount ? Number(editing.minOrderAmount) : 0,
        maxDiscountAmount: editing.maxDiscountAmount ? Number(editing.maxDiscountAmount) : null,
        quantity: Number(editing.quantity) || 1,
        startDate: editing.startDate || null,
        endDate: editing.endDate || null,
        active: editing.active !== false,
      };

      if (editing.id) {
        await api(`/api/admin/vouchers/${editing.id}`, { method: "PUT", body: payload });
        toast("Cập nhật mã giảm giá thành công");
      } else {
        await api("/api/admin/vouchers", { method: "POST", body: payload });
        toast("Tạo mã giảm giá mới thành công");
      }
      setModalOpen(false);
      reload();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const totalVouchers = vouchers?.length || 0;
  const activeCount = vouchers?.filter((v) => v.active).length || 0;
  const totalUsed = vouchers?.reduce((s, v) => s + (v.usedCount || 0), 0) || 0;

  return (
    <>
      <AdminHead title="Mã giảm giá (Vouchers)" />

      {/* Thẻ thống kê nhanh */}
      <div className="mb-6 grid grid-cols-3 gap-4 max-sm:grid-cols-1">
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs text-ink-3">Tổng số mã ưu đãi</p>
          <p className="mt-1 text-2xl font-bold text-ink">{totalVouchers}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs text-ink-3">Đang kích hoạt</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs text-ink-3">Lượt khách đã dùng</p>
          <p className="mt-1 text-2xl font-bold text-accent">{totalUsed}</p>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-3">Danh sách các chương trình khuyến mãi, trợ giá lên đời điện thoại</p>
        <button onClick={openCreate} className="btn btn-primary text-sm">
          + Thêm mã giảm giá
        </button>
      </div>

      {loading && !vouchers ? (
        <Loading />
      ) : !vouchers || vouchers.length === 0 ? (
        <Empty>Chưa có mã giảm giá nào. Hãy tạo mã đầu tiên!</Empty>
      ) : (
        <div className="panel overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã Code</th>
                <th>Tên & Mô tả chương trình</th>
                <th>Mức giảm</th>
                <th>Đơn tối thiểu</th>
                <th>Lượt dùng</th>
                <th>Thời hạn</th>
                <th>Trạng thái</th>
                <th className="text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => (
                <tr key={v.id}>
                  <td>
                    <span className="font-mono font-bold text-accent bg-accent-soft/40 px-2 py-1 rounded text-xs">
                      {v.code}
                    </span>
                  </td>
                  <td>
                    <strong className="block text-ink text-sm font-semibold">{v.name}</strong>
                    <p className="text-xs text-ink-3 line-clamp-1">{v.description || "—"}</p>
                  </td>
                  <td>
                    <span className="font-semibold text-price tabular-nums">
                      {v.discountType === "FIXED_AMOUNT"
                        ? vnd(v.discountValue)
                        : `${v.discountValue}% ${v.maxDiscountAmount ? `(Tối đa ${vnd(v.maxDiscountAmount)})` : ""}`}
                    </span>
                  </td>
                  <td className="tabular-nums text-xs font-medium">
                    {v.minOrderAmount ? vnd(v.minOrderAmount) : "Không giới hạn"}
                  </td>
                  <td className="tabular-nums text-xs">
                    <span className="font-semibold text-ink">{v.usedCount}</span> / {v.quantity}
                  </td>
                  <td className="text-xs text-ink-3 whitespace-nowrap">
                    {v.startDate || "Bắt đầu"} → {v.endDate || "Vô thời hạn"}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggle(v)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                        v.active
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {v.active ? "Đang bật" : "Đã tắt"}
                    </button>
                  </td>
                  <td className="text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => openEdit(v)}
                      className="text-xs text-accent hover:underline font-medium"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(v)}
                      className="text-xs text-rose-600 hover:underline font-medium"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Thêm / Sửa Voucher */}
      {modalOpen && (
        <Modal
          title={editing?.id ? "Cập nhật mã giảm giá" : "Tạo mã giảm giá mới"}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <div>
              <label className="label">Mã Code (viết hoa liền nhau) *</label>
              <input
                type="text"
                required
                placeholder="VD: LENDOISANG"
                value={editing?.code || ""}
                onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })}
                className="input font-mono uppercase"
              />
            </div>
            <div>
              <label className="label">Tên chương trình *</label>
              <input
                type="text"
                required
                placeholder="VD: Trợ giá lên đời smartphone"
                value={editing?.name || ""}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Mô tả điều kiện ưu đãi</label>
            <input
              type="text"
              placeholder="VD: Giảm ngay 500.000₫ cho đơn hàng điện thoại từ 10 triệu"
              value={editing?.description || ""}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <div>
              <label className="label">Hình thức giảm giá</label>
              <select
                value={editing?.discountType || "FIXED_AMOUNT"}
                onChange={(e) => setEditing({ ...editing, discountType: e.target.value })}
                className="input"
              >
                <option value="FIXED_AMOUNT">Giảm số tiền cố định (₫)</option>
                <option value="PERCENT">Giảm theo phần trăm (%)</option>
              </select>
            </div>
            <div>
              <label className="label">
                {editing?.discountType === "PERCENT" ? "Số % giảm (VD: 10) *" : "Số tiền giảm (₫) *"}
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder={editing?.discountType === "PERCENT" ? "10" : "500000"}
                value={editing?.discountValue || ""}
                onChange={(e) => setEditing({ ...editing, discountValue: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <div>
              <label className="label">Đơn hàng tối thiểu (₫)</label>
              <input
                type="number"
                min="0"
                placeholder="VD: 5000000 (để trống nếu không yêu cầu)"
                value={editing?.minOrderAmount || ""}
                onChange={(e) => setEditing({ ...editing, minOrderAmount: e.target.value })}
                className="input"
              />
            </div>
            {editing?.discountType === "PERCENT" && (
              <div>
                <label className="label">Giảm tối đa (₫)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="VD: 1000000"
                  value={editing?.maxDiscountAmount || ""}
                  onChange={(e) => setEditing({ ...editing, maxDiscountAmount: e.target.value })}
                  className="input"
                />
              </div>
            )}
            <div>
              <label className="label">Số lượng mã phát hành *</label>
              <input
                type="number"
                required
                min="1"
                value={editing?.quantity || 50}
                onChange={(e) => setEditing({ ...editing, quantity: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <div>
              <label className="label">Ngày bắt đầu</label>
              <input
                type="date"
                value={editing?.startDate || ""}
                onChange={(e) => setEditing({ ...editing, startDate: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Ngày kết thúc</label>
              <input
                type="date"
                value={editing?.endDate || ""}
                onChange={(e) => setEditing({ ...editing, endDate: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="activeVoucher"
              checked={editing?.active !== false}
              onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
              className="accent-accent h-4 w-4"
            />
            <label htmlFor="activeVoucher" className="text-sm font-medium text-ink cursor-pointer">
              Kích hoạt sử dụng mã này ngay sau khi lưu
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn btn-secondary"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? "Đang lưu…" : editing?.id ? "Lưu thay đổi" : "Tạo voucher"}
            </button>
          </div>
        </form>
      </Modal>
    )}
  </>
);
}
