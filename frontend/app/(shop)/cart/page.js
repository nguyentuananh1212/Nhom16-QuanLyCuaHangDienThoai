"use client";

import Link from "next/link";
import { api } from "@/lib/api";
import { vnd } from "@/lib/format";
import { useAuth, useToast } from "@/components/Providers";
import RequireAuth from "@/components/RequireAuth";
import { Empty, Loading, ProductImage, useLoad } from "@/components/ui";

export default function Page() {
  return <RequireAuth><Cart /></RequireAuth>;
}

function Cart() {
  const toast = useToast();
  const { refreshCart } = useAuth();
  const { data: c, loading, reload } = useLoad(() => api("/api/cart"), []);

  const act = async (fn) => {
    try { await fn(); reload(); refreshCart(); } catch (e) { toast(e.message, "error"); }
  };
  if (loading && !c) return <Loading />;
  if (!c?.items.length) {
    return <Empty><p className="mb-4">Giỏ hàng đang trống.</p><Link className="btn btn-primary" href="/products">Xem sản phẩm</Link></Empty>;
  }
  const blocked = c.items.some((i) => !i.available);

  return (
    <div className="my-6 mb-12 grid grid-cols-[1fr_340px] items-start gap-6 max-md:grid-cols-1">
      <div className="panel">
        <h1 className="mb-2 text-2xl font-bold">Giỏ hàng</h1>
        {c.items.map((i) => (
          <div key={i.id} className="grid grid-cols-[72px_1fr_auto_auto] items-center gap-3.5 border-b border-line py-3.5 max-sm:grid-cols-[56px_1fr]">
            <ProductImage src={i.imageUrl} alt={i.productName} />
            <div>
              <Link href={`/products/${i.productId}`} className="font-semibold">{i.productName}</Link>
              <div className="font-bold text-price tabular-nums">{vnd(i.unitPrice)}</div>
              {!i.available && <div className="text-[13px] font-semibold text-warn">Chỉ còn {i.stock} sản phẩm — hãy giảm số lượng</div>}
            </div>
            <div className="inline-flex overflow-hidden rounded-md border border-line">
              <button aria-label="Giảm" disabled={i.quantity <= 1} className="w-9 bg-paper text-lg disabled:opacity-40"
                onClick={() => act(() => api(`/api/cart/items/${i.id}`, { method: "PUT", body: { quantity: i.quantity - 1 } }))}>−</button>
              <span className="grid w-11 place-items-center tabular-nums">{i.quantity}</span>
              <button aria-label="Tăng" className="w-9 bg-paper text-lg"
                onClick={() => act(() => api(`/api/cart/items/${i.id}`, { method: "PUT", body: { quantity: i.quantity + 1 } }))}>+</button>
            </div>
            <button className="btn btn-sm btn-danger" onClick={() => act(() => api(`/api/cart/items/${i.id}`, { method: "DELETE" }))}>Xoá</button>
          </div>
        ))}
      </div>
      <aside className="panel">
        <div className="flex justify-between py-1.5"><span>Số lượng</span><span className="tabular-nums">{c.totalQuantity}</span></div>
        <div className="mt-2 flex justify-between border-t border-line pt-3 text-lg font-bold">
          <span>Tạm tính</span><span className="text-price tabular-nums">{vnd(c.totalAmount)}</span>
        </div>
        {blocked
          ? <button className="btn btn-primary mt-3.5 w-full" onClick={() => toast("Vui lòng cập nhật sản phẩm vượt tồn kho", "error")}>Đặt hàng</button>
          : <Link className="btn btn-primary mt-3.5 w-full" href="/checkout">Đặt hàng</Link>}
      </aside>
    </div>
  );
}
