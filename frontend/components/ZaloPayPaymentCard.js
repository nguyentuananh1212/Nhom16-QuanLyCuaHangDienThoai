"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { api } from "@/lib/api";
import { fmtDate, vnd } from "@/lib/format";
import { useToast } from "@/components/Providers";
import PaymentSuccessModal from "@/components/PaymentSuccessModal";

export default function ZaloPayPaymentCard({ order, onPaid, initialShowSuccess = false }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [mocking, setMocking] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [paidLocally, setPaidLocally] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(initialShowSuccess);
  const [pollCount, setPollCount] = useState(0);

  // Đếm ngược 15 phút (900 giây) theo giao diện ZaloPay Gateway
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  const pollTimerRef = useRef(null);
  const fetchedOrderIdRef = useRef(null);

  const isPaid =
    paidLocally ||
    order.status === "CONFIRMED" ||
    order.status === "SHIPPING" ||
    order.status === "DELIVERED";

  // Hàm tạo phiên thanh toán ZaloPay Sandbox
  const fetchZaloPayOrder = useCallback(async () => {
    if (order.paymentMethod !== "ZALOPAY" || isPaid) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await api(`/api/payment/zalopay/create/${order.id}`, { method: "POST" });
      setPaymentData(res);

      const targetUrl = res.orderUrl || res.qrCode;
      if (targetUrl) {
        try {
          const dataUrl = await QRCode.toDataURL(targetUrl, {
            width: 320,
            margin: 1,
            color: {
              dark: "#000000",
              light: "#ffffff",
            },
          });
          setQrDataUrl(dataUrl);
        } catch (e) {
          console.error("Lỗi tạo mã QR Base64:", e);
        }
      }
    } catch (err) {
      console.error("Lỗi khởi tạo ZaloPay:", err);
      setErrorMessage(err.message || "Không thể khởi tạo mã QR ZaloPay. Vui lòng bấm thử lại.");
      toast(err.message || "Không thể khởi tạo mã QR ZaloPay", "error");
    } finally {
      setLoading(false);
    }
  }, [order.id, order.paymentMethod, isPaid, toast]);

  // 1. Tự động khởi tạo phiên thanh toán ZaloPay và tạo QR ngay khi vào trang nếu đơn còn PENDING
  useEffect(() => {
    if (order.paymentMethod === "ZALOPAY" && !isPaid) {
      if (fetchedOrderIdRef.current !== order.id) {
        fetchedOrderIdRef.current = order.id;
        fetchZaloPayOrder();
      }
    }
  }, [order.id, order.paymentMethod, isPaid, fetchZaloPayOrder]);

  // 2. Đồng hồ đếm ngược 15 phút (900s)
  useEffect(() => {
    if (isPaid) return;
    const countdownTimer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [isPaid]);

  // 3. Tự động kiểm tra trạng thái thanh toán ngầm (Auto-polling) mỗi 1.5 giây
  // Khách quét thanh toán xong -> hệ thống tự nhận diện và tự động xác nhận ngay!
  useEffect(() => {
    if (isPaid || !paymentData) {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      return;
    }

    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await api(`/api/payment/zalopay/query/${order.id}`);
        setPollCount((c) => c + 1);
        if (res.isPaid) {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          setPaidLocally(true);
          setShowSuccessModal(true);
          toast("Thanh toán thành công qua ZaloPay! Đơn hàng đã tự động xác nhận.", "ok");
          onPaid?.();
        }
      } catch {
        // Bỏ qua lỗi kết nối tạm thời trong lúc poll
      }
    }, 1500);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isPaid, paymentData, order.id, onPaid, toast]);

  if (order.paymentMethod !== "ZALOPAY") return null;

  // Xử lý Giả lập thanh toán thành công (cho test sandbox trên máy tính)
  const handleMockPay = async () => {
    if (mocking) return;
    setMocking(true);
    try {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      await new Promise((r) => setTimeout(r, 400));
      await api(`/api/payment/zalopay/mock-pay/${order.id}`, { method: "POST" });
      setPaidLocally(true);
      setShowSuccessModal(true);
      toast("Thanh toán ZaloPay Sandbox thành công!", "ok");
      onPaid?.();
    } catch (err) {
      toast(err.message || "Lỗi khi giả lập thanh toán", "error");
    } finally {
      setMocking(false);
    }
  };

  // URL dự phòng nếu QRCode chưa kịp render Base64
  const qrTargetUrl = paymentData?.orderUrl || "";
  const fallbackExternalQr = qrTargetUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=4&data=${encodeURIComponent(qrTargetUrl)}`
    : "";

  const formatZaloCurrency = (amount) => {
    return "₫" + Number(amount || 0).toLocaleString("vi-VN");
  };

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  // ==========================================
  // GIAO DIỆN 1: ĐÃ THANH TOÁN THÀNH CÔNG (TỰ ĐỘNG HIỂN THỊ TRÊN CÙNG TRANG)
  // ==========================================
  if (isPaid) {
    return (
      <>
        {showSuccessModal && (
          <PaymentSuccessModal order={order} onClose={() => setShowSuccessModal(false)} />
        )}

        <div className="rounded-2xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/80 p-6 shadow-sm text-center animate-fadeIn max-w-4xl mx-auto">
          <div className="flex flex-col items-center">
            {/* Biểu tượng tích xanh động */}
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white text-4xl font-black shadow-md mb-3">
              ✓
              <span className="absolute -inset-2 rounded-full border-2 border-emerald-400 animate-ping opacity-35" />
            </div>

            <span className="rounded-full bg-emerald-100 text-emerald-800 px-3.5 py-1 text-xs font-black tracking-wide border border-emerald-300 mb-1.5 uppercase">
              Thanh toán thành công (Tự động xác nhận)
            </span>

            <h2 className="text-2xl font-black text-emerald-950">
              ĐÃ THANH TOÁN QUA ZALOPAY THÀNH CÔNG!
            </h2>
            <p className="text-xs text-emerald-800 mt-1 max-w-md">
              Đơn hàng <strong className="text-emerald-950 font-bold">#{order.id}</strong> đã được hệ thống <strong>tự động phát hiện thanh toán và xác nhận ngay lập tức</strong>. Không cần xác nhận bằng tay.
            </p>

            {/* Khung tóm tắt giao dịch trên trang */}
            <div className="mt-5 w-full max-w-md rounded-xl bg-white/95 border border-emerald-200 p-4 text-xs space-y-2.5 text-left shadow-2xs">
              <div className="flex justify-between items-center pb-2.5 border-b border-line">
                <span className="text-ink-3">Số tiền đã thanh toán:</span>
                <span className="text-lg font-black text-emerald-600 tabular-nums">
                  {formatZaloCurrency(order.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink-3">Phương thức:</span>
                <span className="font-semibold text-ink flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#00BA51]" />
                  ZaloPay (Tự động xác nhận)
                </span>
              </div>
              {order.zpTransId && (
                <div className="flex justify-between items-center">
                  <span className="text-ink-3">Mã GD ZaloPay:</span>
                  <span className="font-mono font-bold text-[#0068FF]">{order.zpTransId}</span>
                </div>
              )}
              {order.paymentRef && (
                <div className="flex justify-between items-center">
                  <span className="text-ink-3">Mã phiên (app_trans_id):</span>
                  <span className="font-mono text-ink-2">{order.paymentRef}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-ink-3">Thời gian hoàn tất:</span>
                <span className="font-medium text-ink">
                  {fmtDate(order.paidAt || order.updatedAt || new Date().toISOString())}
                </span>
              </div>
            </div>

            {/* 2 nút điều hướng: Tiếp tục mua hàng & Xem chi tiết đơn hàng vừa đặt */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/products"
                className="btn bg-[#0068FF] hover:bg-blue-700 text-white font-bold shadow-md px-5 py-2.5 text-sm rounded-xl flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <span>🛍️</span>
                <span>Tiếp tục mua hàng</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("order-details-section");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  } else {
                    window.scrollTo({ top: 500, behavior: "smooth" });
                  }
                }}
                className="btn btn-secondary border-emerald-300 hover:bg-emerald-50 text-emerald-950 font-bold shadow-xs px-5 py-2.5 text-sm rounded-xl flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <span>📄</span>
                <span>Xem chi tiết đơn hàng vừa đặt</span>
              </button>
            </div>

            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => setShowSuccessModal(true)}
                className="text-xs text-emerald-700 hover:text-emerald-900 underline font-medium cursor-pointer"
              >
                🎉 Mở lại bảng chúc mừng thanh toán thành công
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Đơn đã huỷ
  if (order.status === "CANCELLED") {
    return null;
  }

  // ==========================================
  // GIAO DIỆN 2: CHUẨN ZALOPAY GATEWAY (QUÉT MÃ QR TỰ ĐỘNG XÁC NHẬN)
  // Khớp 100% bố cục và phong cách ZaloPay Gateway chính thức
  // ==========================================
  return (
    <>
      {showSuccessModal && (
        <PaymentSuccessModal order={order} onClose={() => setShowSuccessModal(false)} />
      )}

      <div className="max-w-4xl mx-auto">
        {/* Khung chính phong cách ZaloPay Gateway */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
          {/* Thanh tiêu đề ZaloPay Gateway & Ngôn ngữ */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 sm:px-8 py-4 bg-white">
            <div className="flex items-center gap-2">
              <div className="flex items-baseline">
                <span className="text-2xl font-black tracking-tight text-[#0068FF]">Zalo</span>
                <span className="text-2xl font-black tracking-tight text-[#00BA51]">pay</span>
              </div>
              <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase border-l border-slate-300 pl-2">
                GATEWAY
              </span>
            </div>

            <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-xs text-slate-700 shadow-2xs">
              <span className="text-base leading-none">🇻🇳</span>
              <span className="text-[10px] text-slate-400">▼</span>
            </div>
          </div>

          {/* Nội dung 2 cột: Thông tin đơn hàng (trái) và Quét QR (phải) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-8 items-stretch">
            {/* CỘT TRÁI: THÔNG TIN ĐƠN HÀNG */}
            <div className="md:col-span-5 flex flex-col justify-between space-y-4 md:border-r md:border-slate-100 md:pr-6">
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">Thông tin đơn hàng</h3>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-extrabold text-[#0068FF]">
                    Zalo<span className="text-[#00BA51]">pay</span>
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200">
                    Merchant Trial
                  </span>
                </div>

                <div className="space-y-2.5 pt-2 text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-500">Giá trị đơn hàng</span>
                    <span className="font-semibold text-slate-800 tabular-nums">
                      {formatZaloCurrency(order.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-500">Số tiền thanh toán</span>
                    <span className="font-black text-slate-900 text-lg tabular-nums">
                      {formatZaloCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <div className="text-slate-400 text-[11px] mb-0.5">Mã giao dịch</div>
                    <div className="font-bold text-slate-800 font-mono text-sm">
                      {paymentData?.appTransId || `${order.id}_${order.paymentRef || "ZALOPAY"}`}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px] mb-0.5">Nội dung</div>
                    <div className="font-semibold text-slate-800 text-xs leading-snug">
                      AURA PhoneStore - Don hang #{order.id}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hộp đếm ngược thời gian giao dịch ZaloPay */}
              <div className="mt-4 rounded-xl bg-[#FEF7EB] border border-[#FDE68A]/70 p-3 flex items-center justify-center gap-2 text-xs text-slate-700">
                <span className="text-slate-600 text-[11.5px]">Giao dịch kết thúc trong</span>
                <div className="flex items-center gap-1 font-mono font-bold text-slate-900">
                  <span className="rounded bg-white px-2 py-0.5 shadow-2xs border border-amber-200 tabular-nums">
                    {minutes}
                  </span>
                  <span className="text-slate-500">:</span>
                  <span className="rounded bg-white px-2 py-0.5 shadow-2xs border border-amber-200 tabular-nums">
                    {seconds}
                  </span>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: LOGO ỨNG DỤNG & MÃ QR VỚI 4 GÓC XANH */}
            <div className="md:col-span-7 flex flex-col items-center justify-center py-2">
              {/* Logo ứng dụng ZaloPay & Zalo trên đầu */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-sm font-black text-[#0068FF]">
                    Zalo<span className="text-[#00BA51]">pay</span>
                  </span>
                </div>
                <span className="text-slate-300 font-light text-lg">|</span>
                <div className="flex items-center justify-center px-4 py-1.5 rounded-xl bg-[#0068FF] text-white shadow-2xs">
                  <span className="text-sm font-black tracking-wide">Zalo</span>
                </div>
              </div>

              {/* Khung mã QR kèm 4 góc xanh lá đặc trưng ZaloPay */}
              <div className="relative p-5">
                {/* 4 Green Corner Brackets */}
                <div className="absolute top-0 left-0 w-7 h-7 border-t-[3.5px] border-l-[3.5px] border-[#00BA51] rounded-tl-sm pointer-events-none" />
                <div className="absolute top-0 right-0 w-7 h-7 border-t-[3.5px] border-r-[3.5px] border-[#00BA51] rounded-tr-sm pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-7 h-7 border-b-[3.5px] border-l-[3.5px] border-[#00BA51] rounded-bl-sm pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-7 h-7 border-b-[3.5px] border-r-[3.5px] border-[#00BA51] rounded-br-sm pointer-events-none" />

                <div className="h-56 w-56 sm:h-64 sm:w-64 bg-white flex items-center justify-center overflow-hidden">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <svg className="h-8 w-8 animate-spin text-[#00BA51]" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      <span className="text-xs text-slate-500 font-medium">Đang tạo mã QR ZaloPay…</span>
                    </div>
                  ) : qrDataUrl || fallbackExternalQr ? (
                    <div className="relative h-full w-full flex items-center justify-center">
                      <img
                        src={qrDataUrl || fallbackExternalQr}
                        alt={`Mã QR ZaloPay #${order.id}`}
                        className="h-full w-full object-contain p-1"
                      />
                    </div>
                  ) : (
                    <div className="text-center p-3 text-xs text-rose-500">
                      <p>{errorMessage || "Không tạo được mã QR."}</p>
                      <button
                        type="button"
                        onClick={fetchZaloPayOrder}
                        className="mt-2 text-xs font-semibold text-[#0068FF] underline"
                      >
                        Thử tạo lại
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thanh điều hướng chân trang (Quay về trang trước | Hủy giao dịch) */}
        <div className="mt-3 flex items-center justify-between px-3 text-xs">
          <Link
            href="/products"
            className="flex items-center gap-1 font-semibold text-[#0068FF] hover:underline cursor-pointer"
          >
            <span>‹</span>
            <span>Quay về trang trước</span>
          </Link>

          <Link
            href="/orders"
            className="flex items-center gap-1 text-slate-700 hover:text-rose-600 transition-colors font-medium cursor-pointer"
          >
            <span>✕</span>
            <span>Hủy giao dịch</span>
          </Link>
        </div>

        {/* Thanh tiện ích kiểm thử Sandbox (Tự động xác nhận & Giả lập) */}
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-900">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span>
                <strong>Đang chờ bạn quét mã</strong> — Hệ thống tự động xác nhận đơn hàng ngay khi thanh toán xong!
              </span>
            </div>

            <button
              type="button"
              onClick={handleMockPay}
              disabled={mocking}
              className="btn btn-sm bg-[#00BA51] hover:bg-[#009E45] text-white font-bold px-4 py-2 rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95"
            >
              {mocking ? "Đang xử lý…" : "⚡ Giả lập quét mã thành công (Sandbox)"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
