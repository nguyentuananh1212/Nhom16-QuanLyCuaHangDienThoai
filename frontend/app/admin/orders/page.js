"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { fmtDate, NEXT_STATUS, PAY_LABEL, STATUS_LABEL, vnd } from "@/lib/format";
import { useToast } from "@/components/Providers";
import AdminHead from "@/components/AdminHead";
import { Loading, Modal, Pager, StatusTag, useLoad } from "@/components/ui";

export default function AdminOrders() {
  const toast = useToast();
  const [filter, setFilter] = useState({ keyword: "", status: "", page: 0 });
  const [openId, setOpenId] = useState(null);
  const [confirmingAll, setConfirmingAll] = useState(false);
  const { data, loading, reload } = useLoad(() => api("/api/admin/orders", { query: { ...filter, size: 20 } }), [filter]);

  const handleAutoConfirmAll = async () => {
    setConfirmingAll(true);
    try {
      const res = await api("/api/admin/orders/auto-confirm-all", { method: "POST" });
      if (res.confirmedCount > 0) {
        toast(`Đã tự động xác nhận ${res.confirmedCount} đơn hàng chờ duyệt thành công!`, "ok");
      } else {
        toast("Tất cả đơn hàng đều đã được xác nhận!", "ok");
      }
      reload();
    } catch (e) {
      toast("Lỗi tự động xác nhận: " + e.message, "error");
    } finally {
      setConfirmingAll(false);
    }
  };

  return (
    <>
      <AdminHead title="Đơn hàng" />

      {/* THANH TRẠNG THÁI TỰ ĐỘNG XÁC NHẬN VÀ NÚT DUYỆT TẤT CẢ */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3 shadow-2xs">
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            ✓ Chế độ tự động xác nhận đơn hàng đang BẬT
          </span>
          <span className="text-ink-3 hidden sm:inline">(Mọi đơn mới đặt sẽ tự động chuyển sang Đã xác nhận)</span>
        </div>
        <button
          type="button"
          onClick={handleAutoConfirmAll}
          disabled={confirmingAll}
          className="btn btn-sm btn-primary flex items-center gap-1.5 shadow-xs"
        >
          <span>⚡ {confirmingAll ? "Đang duyệt..." : "Tự động duyệt tất cả đơn chờ"}</span>
        </button>
      </div>

      <form className="mb-3.5 flex flex-wrap gap-2" onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setFilter({ keyword: f.get("keyword").trim(), status: f.get("status"), page: 0 });
      }}>
        <input name="keyword" placeholder="Tên hoặc SĐT người nhận" aria-label="Tìm đơn" className="input w-auto min-w-48" />
        <select name="status" aria-label="Trạng thái" className="input w-auto">
          <option value="">Mọi trạng thái</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="btn">Lọc</button>
      </form>
      {loading && !data ? <Loading /> : (
        <div className="panel overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Mã</th><th>Khách</th><th>Người nhận</th><th>Tổng tiền</th><th>Thanh toán</th><th>Ngày đặt</th><th>Trạng thái</th><th /></tr></thead>
            <tbody>
              {data?.content.map((o) => (
                <tr key={o.id}>
                  <td className="tabular-nums">#{o.id}</td><td>{o.userEmail}</td>
                  <td>{o.receiverName}<br /><span className="text-ink-3 tabular-nums">{o.receiverPhone}</span></td>
                  <td className="tabular-nums">{vnd(o.totalAmount)}</td>
                  <td>{o.paymentMethod === "COD" ? "COD" : "Chuyển khoản (QR)"}</td>
                  <td>{fmtDate(o.createdAt)}</td><td><StatusTag status={o.status} /></td>
                  <td><button className="btn btn-sm" onClick={() => setOpenId(o.id)}>Xử lý</button></td>
                </tr>
              ))}
              {data && !data.content.length && <tr><td colSpan={8} className="py-12 text-center text-ink-3">Không có đơn nào</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <Pager data={data} onChange={(page) => setFilter((f) => ({ ...f, page }))} />
      {openId && <OrderModal id={openId} onClose={() => setOpenId(null)} onChanged={() => { setOpenId(null); reload(); }} />}
    </>
  );
}

function OrderModal({ id, onClose, onChanged }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const { data: o } = useLoad(() => api("/api/orders/" + id), [id]);

  const change = async (status) => {
    if (status === "CANCELLED" && !confirm("Huỷ đơn và hoàn lại tồn kho?")) return;
    setBusy(true);
    try { await api(`/api/admin/orders/${id}/status`, { method: "PUT", body: { status } }); toast("Đã cập nhật"); onChanged(); }
    catch (e) { toast(e.message, "error"); setBusy(false); }
  };

  return (
    <Modal title={`Đơn #${id}`} onClose={onClose}>
      {!o ? <Loading /> : (
        <>
          <p className="mb-2"><StatusTag status={o.status} /></p>
          <p className="mb-3"><strong>{o.receiverName}</strong> · {o.receiverPhone}<br />{o.shippingAddress}</p>
          {o.note && <p className="mb-3 text-ink-3">Ghi chú: {o.note}</p>}
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Sản phẩm</th><th>Đơn giá</th><th>SL</th><th>Thành tiền</th></tr></thead>
              <tbody>
                {o.items.map((i) => (
                  <tr key={i.productId}><td>{i.productName}</td><td className="tabular-nums">{vnd(i.unitPrice)}</td>
                    <td className="tabular-nums">{i.quantity}</td><td className="tabular-nums">{vnd(i.lineTotal)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 flex justify-between border-t border-line pt-3 text-lg font-bold">
            <span>Tổng cộng ({PAY_LABEL[o.paymentMethod]})</span><span className="text-price tabular-nums">{vnd(o.totalAmount)}</span>
          </div>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            {NEXT_STATUS[o.status].map((s) => (
              <button key={s} disabled={busy} className={`btn ${s === "CANCELLED" ? "btn-danger" : "btn-primary"}`} onClick={() => change(s)}>
                {s === "CANCELLED" ? "Huỷ đơn" : "Chuyển sang: " + STATUS_LABEL[s]}
              </button>
            ))}
            <button className="btn" onClick={onClose}>Đóng</button>
          </div>
        </>
      )}
    </Modal>
  );
}
