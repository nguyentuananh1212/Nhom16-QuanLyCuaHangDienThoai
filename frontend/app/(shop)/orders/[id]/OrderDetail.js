"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { fmtDate, PAY_LABEL, vnd } from "@/lib/format";
import { useToast } from "@/components/Providers";
import RequireAuth from "@/components/RequireAuth";
import { Empty, Loading, StatusTag, useLoad } from "@/components/ui";
import QrPaymentCard from "@/components/QrPaymentCard";
import ZaloPayPaymentCard from "@/components/ZaloPayPaymentCard";

export default function OrderDetail() {
  return <RequireAuth><Detail /></RequireAuth>;
}

function Detail() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { data: o, loading, error, reload } = useLoad(() => api("/api/orders/" + id), [id]);
  const [autoCheckedZalo, setAutoCheckedZalo] = useState(false);

  // Tự động kiểm tra trạng thái ZaloPay nếu người dùng vừa được chuyển hướng về từ cổng thanh toán
  useEffect(() => {
    const isFromZaloPay = searchParams.get("payment") === "zalopay" || searchParams.get("from_gateway") === "1";
    if (isFromZaloPay && o && o.status === "PENDING" && !autoCheckedZalo) {
      setAutoCheckedZalo(true);
      api(`/api/payment/zalopay/query/${id}`).then((res) => {
        if (res.isPaid) {
          toast("Thanh toán ZaloPay thành công!");
          reload();
        }
      }).catch(() => {});
    }
  }, [searchParams, o, id, autoCheckedZalo, reload, toast]);

  if (loading && !o) return <Loading />;
  if (error) return <Empty>{error.message}</Empty>;

  const cancel = async () => {
    if (!confirm("Huỷ đơn hàng này?")) return;
    try { await api(`/api/orders/${id}/cancel`, { method: "POST" }); toast("Đã huỷ đơn"); reload(); }
    catch (e) { toast(e.message, "error"); }
  };

  return (
    <div className="my-7">
      <Link href="/orders" className="text-ink-3 underline">Đơn hàng của tôi</Link>
      <div className="mb-5 mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Đơn #{o.id}</h1><StatusTag status={o.status} />
      </div>

      {/* Thông báo đơn VietQR chờ thanh toán */}
      {o.status === "PENDING" && o.paymentMethod === "BANK_TRANSFER" && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs text-amber-800 flex items-center gap-3 shadow-2xs">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-base font-bold text-amber-700">⏳</span>
          <div>
            <strong className="block text-sm font-bold text-amber-900">Đơn hàng đang chờ thanh toán chuyển khoản qua mã QR</strong>
            <p className="mt-0.5 text-amber-700">Quý khách vui lòng quét mã QR bên dưới để thanh toán, sau đó nhấn nút "Tôi đã chuyển khoản & Xác nhận đơn".</p>
          </div>
        </div>
      )}

      {/* Khối thanh toán ZaloPay */}
      {o.paymentMethod === "ZALOPAY" && (
        <div className="mb-6">
          <ZaloPayPaymentCard
            order={o}
            onPaid={reload}
            initialShowSuccess={searchParams.get("payment") === "zalopay"}
          />
        </div>
      )}

      {/* Khối thanh toán VietQR */}
      {o.paymentMethod === "BANK_TRANSFER" && (
        <div className="mb-6">
          <QrPaymentCard order={o} onPaid={reload} />
        </div>
      )}

      <div id="order-details-section" className="grid grid-cols-[1fr_340px] items-start gap-6 max-md:grid-cols-1 scroll-mt-6">
        <div className="panel overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Sản phẩm</th><th>Đơn giá</th><th>SL</th><th>Thành tiền</th></tr></thead>
            <tbody>
              {o.items.map((i) => (
                <tr key={i.productId}>
                  <td><Link href={`/products/${i.productId}`} className="underline">{i.productName}</Link></td>
                  <td className="tabular-nums">{vnd(i.unitPrice)}</td><td className="tabular-nums">{i.quantity}</td>
                  <td className="tabular-nums">{vnd(i.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 space-y-1.5 border-t border-line pt-3">
            {o.discountAmount > 0 && (
              <>
                <div className="flex justify-between text-sm text-ink-3">
                  <span>Tạm tính</span>
                  <span className="tabular-nums font-medium text-ink">{vnd(Number(o.totalAmount) + Number(o.discountAmount))}</span>
                </div>
                <div className="flex justify-between text-sm text-emerald-600 font-medium">
                  <span>Mã giảm giá ({o.voucherCode})</span>
                  <span className="tabular-nums font-semibold">- {vnd(o.discountAmount)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span>Tổng cộng thanh toán</span>
              <span className="text-price tabular-nums">{vnd(o.totalAmount)}</span>
            </div>
          </div>
        </div>

        <aside className="panel space-y-3">
          <div>
            <p className="font-semibold text-ink">{o.receiverName}</p>
            <p className="text-sm text-ink-2">{o.receiverPhone}</p>
            <p className="text-sm text-ink-2">✉️ {o.receiverEmail || o.userEmail}</p>
            <p className="text-sm text-ink-3 mt-1">{o.shippingAddress}</p>
          </div>
          {o.note && <p className="text-xs text-ink-3">Ghi chú: {o.note}</p>}
          <p className="text-sm font-medium">{PAY_LABEL[o.paymentMethod]}</p>
          <p className="text-xs text-ink-3">Đặt lúc {fmtDate(o.createdAt)}</p>
          {(o.status === "PENDING" || o.status === "CONFIRMED") && (
            <button className="btn btn-danger w-full mt-2" onClick={cancel}>Huỷ đơn hàng</button>
          )}
        </aside>
      </div>
    </div>
  );
}
