"use client";

import Link from "next/link";
import { fmtDate, vnd } from "@/lib/format";

export default function PaymentSuccessModal({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-line animate-scaleUp">
        {/* Nút đóng góc phải */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-3 hover:text-ink text-xl font-bold p-1 rounded-lg hover:bg-paper transition-all"
          aria-label="Đóng"
        >
          ✕
        </button>

        {/* Biểu tượng thành công */}
        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3 shadow-inner">
            <span className="text-4xl animate-bounce">✓</span>
            <span className="absolute -inset-1 rounded-full border-2 border-emerald-400 animate-ping opacity-30" />
          </div>

          <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-bold border border-emerald-200 mb-1">
            Giao dịch ZaloPay Sandbox thành công
          </span>
          <h2 className="text-2xl font-black text-ink">Thanh toán thành công!</h2>
          <p className="text-xs text-ink-3 mt-1 max-w-sm">
            Cảm ơn bạn! Đơn hàng <strong className="text-ink">#{order.id}</strong> đã được thanh toán và hệ thống tự động xác nhận thành công.
          </p>
        </div>

        {/* Khối chi tiết giao dịch */}
        <div className="mt-5 rounded-xl border border-line bg-paper/70 p-4 text-xs space-y-2.5">
          <div className="flex justify-between items-center pb-2 border-b border-line">
            <span className="text-ink-3">Số tiền đã thanh toán</span>
            <span className="text-base font-extrabold text-emerald-600 tabular-nums">
              {vnd(order.totalAmount)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-ink-3">Phương thức thanh toán</span>
            <span className="font-semibold text-ink flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-[#008fe5]" />
              ZaloPay Sandbox (Ví / ATM / QR)
            </span>
          </div>

          {order.zpTransId && (
            <div className="flex justify-between items-center">
              <span className="text-ink-3">Mã GD ZaloPay</span>
              <span className="font-mono font-bold text-accent">{order.zpTransId}</span>
            </div>
          )}

          {order.paymentRef && (
            <div className="flex justify-between items-center">
              <span className="text-ink-3">Mã tham chiếu (app_trans_id)</span>
              <span className="font-mono text-ink-2">{order.paymentRef}</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-ink-3">Thời gian thanh toán</span>
            <span className="font-medium text-ink">
              {fmtDate(order.paidAt || order.updatedAt || new Date().toISOString())}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-ink-3">Người nhận</span>
            <span className="font-medium text-ink">
              {order.receiverName} ({order.receiverPhone})
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-ink-3">Email nhận xác nhận</span>
            <span className="font-medium text-ink">{order.receiverEmail || order.userEmail}</span>
          </div>
        </div>

        {/* Thông báo vận chuyển */}
        <div className="mt-3.5 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-start gap-2.5">
          <span className="text-base shrink-0">📦</span>
          <div>
            <strong className="block text-emerald-900 font-bold">Trạng thái đơn hàng: ĐÃ XÁC NHẬN</strong>
            <p className="mt-0.5 text-emerald-700">
              Cửa hàng đang kiểm tra thiết bị, in phiếu bảo hành chính hãng và đóng gói để bàn giao đơn vị vận chuyển.
            </p>
          </div>
        </div>

        {/* Nút điều hướng: Tiếp tục mua hàng & Xem chi tiết đơn hàng vừa đặt */}
        <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <Link
            href="/products"
            onClick={onClose}
            className="btn bg-[#0068FF] hover:bg-blue-700 text-white font-bold flex-1 py-2.5 text-center text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
          >
            <span>🛍️</span>
            <span>Tiếp tục mua hàng</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              onClose();
              const el = document.getElementById("order-details-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="btn btn-secondary border-emerald-300 hover:bg-emerald-50 text-emerald-950 font-bold flex-1 py-2.5 text-center text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
          >
            <span>📄</span>
            <span>Xem chi tiết đơn hàng vừa đặt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
