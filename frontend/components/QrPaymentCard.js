"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { vnd } from "@/lib/format";
import { useToast } from "@/components/Providers";

const BANK_INFO = {
  bankId: "MB",
  bankName: "MB Bank (Ngân hàng TMCP Quân Đội)",
  accountNo: "0399888999",
  accountName: "NHOM 16 PHONE STORE",
};

export default function QrPaymentCard({ order, onPaid }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState("");
  const [imgError, setImgError] = useState(false);

  if (order.paymentMethod !== "BANK_TRANSFER") return null;

  const memo = `DH${order.id}`;
  const qrUrl = `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNo}-compact2.png?amount=${order.totalAmount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

  const handleCopy = (text, label, key) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    toast(`Đã sao chép ${label}`);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleMockPay = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      await api(`/api/orders/${order.id}/mock-pay`, { method: "POST" });
      toast("Xác nhận thanh toán thành công! Đơn hàng đã được xác nhận.");
      onPaid?.();
    } catch (err) {
      toast(err.message || "Không thể xác nhận thanh toán", "error");
    } finally {
      setLoading(false);
    }
  };

  // Trạng thái đã thanh toán / đã xác nhận
  if (order.status === "CONFIRMED" || order.status === "SHIPPING" || order.status === "DELIVERED") {
    return (
      <div className="rounded-2xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/80 p-6 shadow-sm text-center">
        <div className="flex flex-col items-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white text-3xl font-black shadow-md mb-2.5">
            ✓
          </div>
          <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-0.5 text-xs font-bold border border-emerald-200 mb-1">
            Đã thanh toán thành công
          </span>
          <h2 className="text-xl font-black text-emerald-950">
            ĐÃ THANH TOÁN QUA MÃ QR THÀNH CÔNG!
          </h2>
          <p className="text-xs text-emerald-800 mt-1 max-w-md">
            Đơn hàng #{order.id} đã được ghi nhận thanh toán và hệ thống tự động xác nhận thành công.
          </p>

          {/* 2 nút điều hướng: Tiếp tục mua hàng & Xem chi tiết đơn hàng vừa đặt */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="btn bg-[#0068ff] hover:bg-blue-700 text-white font-bold shadow-md px-5 py-2.5 text-sm rounded-xl flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <span>🛍️</span>
              <span>Tiếp tục mua hàng</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("order-details-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
                else window.scrollTo({ top: 500, behavior: "smooth" });
              }}
              className="btn btn-secondary border-emerald-300 hover:bg-emerald-50 text-emerald-950 font-bold shadow-xs px-5 py-2.5 text-sm rounded-xl flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <span>📄</span>
              <span>Xem chi tiết đơn hàng vừa đặt</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Đơn đã huỷ
  if (order.status === "CANCELLED") {
    return null;
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Thanh toán qua mã QR</h2>
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
              VietQR Chuyển khoản
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-3">
            Quét mã bằng app ngân hàng bất kỳ và nhấn Xác nhận thanh toán bên dưới
          </p>
        </div>
        <span className="text-sm font-semibold text-price tabular-nums">{vnd(order.totalAmount)}</span>
      </div>

      <div className="mt-5 grid grid-cols-[220px_1fr] items-center gap-6 max-sm:grid-cols-1">
        {/* Khung hiển thị mã QR */}
        <div className="flex flex-col items-center">
          <div className="relative aspect-square w-full max-w-[220px] overflow-hidden rounded-lg border border-line bg-white p-2 shadow-xs">
            {!imgError ? (
              <img
                src={qrUrl}
                alt={`Mã QR thanh toán cho đơn hàng #${order.id}`}
                className="h-full w-full object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-paper p-3 text-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mb-2 h-12 w-12 text-accent" strokeWidth="1.5">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                <div className="text-xs font-bold text-ink">VIETQR ẢO (OFFLINE)</div>
                <div className="mt-1 text-[11px] text-ink-3">MB: {BANK_INFO.accountNo}</div>
                <div className="text-[11px] font-semibold text-price">{vnd(order.totalAmount)}</div>
              </div>
            )}
          </div>
          <a
            href={qrUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 text-xs text-ink-3 underline hover:text-accent"
          >
            Mở ảnh mã QR kích thước lớn
          </a>
        </div>

        {/* Thông tin chuyển khoản */}
        <div className="space-y-2.5 text-sm">
          <div className="flex items-center justify-between rounded-lg bg-paper px-3 py-2">
            <div>
              <span className="block text-xs text-ink-3">Ngân hàng</span>
              <span className="font-semibold">{BANK_INFO.bankName}</span>
            </div>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => handleCopy(BANK_INFO.bankName, "tên ngân hàng", "bank")}
            >
              {copied === "bank" ? "Đã chép" : "Sao chép"}
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-paper px-3 py-2">
            <div>
              <span className="block text-xs text-ink-3">Số tài khoản</span>
              <span className="font-mono font-bold text-accent">{BANK_INFO.accountNo}</span>
            </div>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => handleCopy(BANK_INFO.accountNo, "số tài khoản", "acc")}
            >
              {copied === "acc" ? "Đã chép" : "Sao chép"}
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-paper px-3 py-2">
            <div>
              <span className="block text-xs text-ink-3">Chủ tài khoản</span>
              <span className="font-semibold uppercase">{BANK_INFO.accountName}</span>
            </div>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => handleCopy(BANK_INFO.accountName, "tên chủ tài khoản", "name")}
            >
              {copied === "name" ? "Đã chép" : "Sao chép"}
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-paper px-3 py-2">
            <div>
              <span className="block text-xs text-ink-3">Số tiền</span>
              <span className="font-semibold text-price tabular-nums">{vnd(order.totalAmount)}</span>
            </div>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => handleCopy(order.totalAmount, "số tiền", "amount")}
            >
              {copied === "amount" ? "Đã chép" : "Sao chép"}
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-paper px-3 py-2">
            <div>
              <span className="block text-xs text-ink-3">Nội dung chuyển khoản</span>
              <span className="font-mono font-bold text-ink">{memo}</span>
            </div>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => handleCopy(memo, "nội dung chuyển khoản", "memo")}
            >
              {copied === "memo" ? "Đã chép" : "Sao chép"}
            </button>
          </div>
        </div>
      </div>

      {/* Nút hành động xác nhận thanh toán */}
      <div className="mt-5 border-t border-line pt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-ink-3">
          💡 <span className="font-medium text-ink-2">Hướng dẫn:</span> Quét mã QR trên bằng ứng dụng ngân hàng, sau đó nhấn nút <strong>Xác nhận thanh toán</strong> để hoàn tất xác nhận đơn hàng.
        </div>
        <button
          type="button"
          onClick={handleMockPay}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span>Đang kiểm tra và xác nhận…</span>
            </>
          ) : (
            <>
              <span>✓ Tôi đã chuyển khoản & Xác nhận đơn</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
