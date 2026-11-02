"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formToObject, vnd } from "@/lib/format";
import { useAuth, useToast } from "@/components/Providers";
import RequireAuth from "@/components/RequireAuth";
import { Field, Loading, useLoad } from "@/components/ui";

export default function Page() {
  return <RequireAuth><Checkout /></RequireAuth>;
}

function Checkout() {
  const router = useRouter();
  const toast = useToast();
  const { refreshCart } = useAuth();
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const { data } = useLoad(() => Promise.all([api("/api/cart"), api("/api/auth/me")]), []);
  const [cart, me] = data || [];

  const [vouchers, setVouchers] = useState([]);
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [applyingVoucher, setApplyingVoucher] = useState(false);

  useEffect(() => {
    api("/api/vouchers/available").then((res) => {
      if (Array.isArray(res)) setVouchers(res);
    }).catch(() => {});
  }, []);

  useEffect(() => { if (cart && !cart.items.length) router.replace("/cart"); }, [cart, router]);
  if (!cart || !cart.items.length) return <Loading />;

  const handleApplyVoucher = async (codeToApply) => {
    const code = (codeToApply || voucherCodeInput || "").trim().toUpperCase();
    if (!code) {
      toast("Vui lòng nhập mã giảm giá", "warn");
      return;
    }
    setApplyingVoucher(true);
    try {
      const res = await api("/api/vouchers/apply", {
        method: "POST",
        body: { code, orderAmount: cart.totalAmount }
      });
      if (res.valid) {
        setAppliedVoucher(res);
        toast(`Áp dụng thành công: Giảm ${vnd(res.discountAmount)}`);
      } else {
        toast(res.message || "Mã giảm giá không hợp lệ", "error");
      }
    } catch (err) {
      toast(err.message || "Không thể kiểm tra mã giảm giá", "error");
    } finally {
      setApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCodeInput("");
    toast("Đã hủy áp dụng mã giảm giá");
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    const payload = formToObject(e.currentTarget);

    // 1. Kiểm tra Email bắt buộc: không được để trống & đúng định dạng
    const email = (payload.receiverEmail || "").trim();
    if (!email) {
      setErrors({ receiverEmail: "Vui lòng nhập email nhận thông báo đơn hàng" });
      toast("Vui lòng nhập email nhận thông báo", "warn");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors({ receiverEmail: "Email không đúng định dạng (VD: abc@gmail.com)" });
      toast("Email không đúng định dạng", "warn");
      return;
    }

    if (appliedVoucher?.valid) {
      payload.voucherCode = appliedVoucher.code;
    }

    setSending(true);
    try {
      const o = await api("/api/orders", { method: "POST", body: payload });
      await refreshCart();
      toast("Đặt hàng thành công! Đã gửi thông báo tới " + email);
      if (payload.paymentMethod === "ZALOPAY") {
        router.push("/orders/" + o.id + "?init_zalopay=1");
      } else {
        router.push("/orders/" + o.id);
      }
    } catch (err) {
      setErrors(err.fields || {});
      toast(err.message, "error");
      setSending(false);
    }
  };

  return (
    <div className="my-6 mb-12 grid grid-cols-[1fr_340px] items-start gap-6 max-md:grid-cols-1">
      <form noValidate onSubmit={submit} className="panel">
        <h1 className="mb-4 text-2xl font-bold">Thông tin giao hàng</h1>
        
        <div className="grid grid-cols-2 gap-x-4 max-sm:grid-cols-1">
          <Field label="Người nhận" name="receiverName" defaultValue={me.fullName} error={errors.receiverName} />
          <Field label="Số điện thoại" name="receiverPhone" inputMode="tel" defaultValue={me.phone || ""} error={errors.receiverPhone} />
        </div>

        <Field
          label="Email nhận thông báo (Email thật)"
          name="receiverEmail"
          type="email"
          defaultValue={me.email || ""}
          error={errors.receiverEmail}
          placeholder="Nhập email thật của bạn (VD: yourname@gmail.com)"
        />

        <Field label="Địa chỉ" name="shippingAddress" defaultValue={me.address || ""} error={errors.shippingAddress} />
        <Field label="Ghi chú" name="note" as="textarea" rows={2} maxLength={500} />

        {/* Lựa chọn phương thức thanh toán: ZaloPay, QR hoặc Tiền mặt (COD) */}
        <div className="mb-5">
          <label className="label">Phương thức thanh toán</label>
          <div className="space-y-2.5">
            {/* Tùy chọn 1: Cổng ZaloPay Sandbox */}
            <label
              className={`flex items-center justify-between rounded-xl border p-3.5 cursor-pointer transition-all ${
                paymentMethod === "ZALOPAY"
                  ? "border-[#008fe5] bg-[#008fe5]/10 shadow-xs ring-1 ring-[#008fe5]"
                  : "border-line bg-surface hover:border-ink-3"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="ZALOPAY"
                  checked={paymentMethod === "ZALOPAY"}
                  onChange={() => setPaymentMethod("ZALOPAY")}
                  className="accent-[#008fe5]"
                />
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0068ff] to-[#00beff] text-white shadow-xs shrink-0 font-bold text-lg">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-ink font-semibold text-sm">Cổng thanh toán ZaloPay (Sandbox)</strong>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                      Thử nghiệm
                    </span>
                  </div>
                  <p className="text-xs text-ink-3">Quét mã QR ZaloPay, thẻ ATM ngân hàng, tài khoản ZaloPay Sandbox</p>
                </div>
              </div>
              <span className="rounded-full bg-[#008fe5] px-2.5 py-0.5 text-[11px] font-bold text-white shrink-0">
                ZaloPay
              </span>
            </label>

            {/* Tùy chọn 2: Mã QR VietQR */}
            <label
              className={`flex items-center justify-between rounded-xl border p-3.5 cursor-pointer transition-all ${
                paymentMethod === "BANK_TRANSFER"
                  ? "border-accent bg-accent-soft/30 shadow-xs"
                  : "border-line bg-surface hover:border-ink-3"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="BANK_TRANSFER"
                  checked={paymentMethod === "BANK_TRANSFER"}
                  onChange={() => setPaymentMethod("BANK_TRANSFER")}
                  className="accent-accent"
                />
                <span className="text-xl">📱</span>
                <div>
                  <strong className="text-ink font-semibold text-sm block">Thanh toán qua mã QR (VietQR ảo)</strong>
                  <p className="text-xs text-ink-3">Quét mã QR bằng ứng dụng ngân hàng hoặc mô phỏng thanh toán sau khi đặt</p>
                </div>
              </div>
            </label>

            {/* Tùy chọn 3: Tiền mặt khi nhận hàng (COD) */}
            <label
              className={`flex items-center justify-between rounded-xl border p-3.5 cursor-pointer transition-all ${
                paymentMethod === "COD"
                  ? "border-accent bg-accent-soft/30 shadow-xs"
                  : "border-line bg-surface hover:border-ink-3"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="accent-accent"
                />
                <span className="text-xl">💵</span>
                <div>
                  <strong className="text-ink font-semibold text-sm block">Thanh toán tiền mặt khi nhận hàng (COD)</strong>
                  <p className="text-xs text-ink-3">Nhận hàng tại nhà, kiểm tra máy rồi trả tiền mặt cho shipper</p>
                </div>
              </div>
            </label>
          </div>
        </div>

        <button className="btn btn-primary w-full sm:w-auto" disabled={sending}>
          {sending ? "Đang đặt hàng…" : "Xác nhận đặt hàng"}
        </button>
      </form>

      <aside className="panel">
        <h2 className="mb-3 text-base font-bold text-ink">Đơn hàng của bạn</h2>
        {cart.items.filter((i) => i.available).map((i) => (
          <div key={i.id} className="flex justify-between gap-3 py-1.5 text-sm">
            <span>{i.productName} × {i.quantity}</span>
            <span className="tabular-nums font-medium">{vnd(i.lineTotal)}</span>
          </div>
        ))}

        {/* Khối Mã giảm giá Voucher */}
        <div className="mt-4 border-t border-line pt-3">
          <label className="text-xs font-semibold text-ink-2 mb-1.5 flex items-center justify-between">
            <span>🏷️ Mã giảm giá (Voucher)</span>
            {appliedVoucher && (
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Đã áp dụng
              </span>
            )}
          </label>

          {!appliedVoucher ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập mã (VD: LENDOISANG)"
                value={voucherCodeInput}
                onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                className="input py-1.5 text-xs uppercase font-medium flex-1"
              />
              <button
                type="button"
                onClick={() => handleApplyVoucher()}
                disabled={applyingVoucher}
                className="btn btn-sm btn-secondary text-xs shrink-0"
              >
                {applyingVoucher ? "Đang áp…" : "Áp dụng"}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs">
              <div>
                <span className="font-bold text-emerald-800">{appliedVoucher.code}</span>
                <p className="text-[11px] text-emerald-600 mt-0.5">{appliedVoucher.name}</p>
              </div>
              <button
                type="button"
                onClick={handleRemoveVoucher}
                className="text-xs text-rose-500 hover:text-rose-700 font-semibold underline ml-2"
              >
                Xóa mã
              </button>
            </div>
          )}

          {/* Gợi ý mã có sẵn */}
          {vouchers.length > 0 && !appliedVoucher && (
            <div className="mt-3 space-y-1.5">
              <span className="text-[11px] text-ink-3 block">Mã ưu đãi điện thoại hôm nay:</span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {vouchers.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => handleApplyVoucher(v.code)}
                    className="flex items-center justify-between p-2 rounded-lg border border-dashed border-accent/40 bg-accent-soft/20 hover:bg-accent-soft/40 cursor-pointer transition-all text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-accent">{v.code}</span>
                        <span className="text-[10px] bg-accent text-white px-1.5 py-0.2 rounded font-semibold">
                          {v.discountType === "PERCENT" ? `-${v.discountValue}%` : `-${Math.round(v.discountValue / 1000)}k`}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-3 line-clamp-1 mt-0.5">{v.description}</p>
                    </div>
                    <button type="button" className="text-[11px] font-semibold text-accent underline ml-2 shrink-0">
                      Dùng
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tổng tiền và chiết khấu */}
        <div className="mt-4 border-t border-line pt-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-ink-3">
            <span>Tạm tính</span>
            <span className="tabular-nums font-medium text-ink">{vnd(cart.totalAmount)}</span>
          </div>

          {appliedVoucher && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Giảm giá ({appliedVoucher.code})</span>
              <span className="tabular-nums font-semibold">- {vnd(appliedVoucher.discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between border-t border-line pt-2 text-lg font-bold">
            <span>Tổng cộng</span>
            <span className="text-price tabular-nums">
              {appliedVoucher ? vnd(appliedVoucher.finalAmount) : vnd(cart.totalAmount)}
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
