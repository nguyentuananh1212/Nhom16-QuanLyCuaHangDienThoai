"use client";

import Link from "next/link";
import { ProductImage } from "@/components/ui";
import { vnd } from "@/lib/format";

export function ProductCard({ p }) {
  const hasDiscount = p.discountPercent > 0;
  const savings = hasDiscount && p.price && p.effectivePrice ? p.price - p.effectivePrice : 0;

  return (
    <Link
      href={`/products/${p.id}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-400 max-sm:p-3"
    >
      {/* BADGES GÓC TRÊN */}
      <div className="absolute left-2.5 top-2.5 z-10 flex flex-col gap-1 items-start">
        {hasDiscount && (
          <span className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 px-2 py-0.5 text-[11px] font-extrabold text-white shadow-xs tabular-nums">
            <span>🔥</span>
            <span>-{p.discountPercent}%</span>
          </span>
        )}
        <span className="rounded-md bg-amber-500/10 text-amber-700 border border-amber-500/20 px-1.5 py-0.2 text-[10px] font-bold">
          Trả góp 0%
        </span>
      </div>

      {/* ẢNH SẢN PHẨM CÓ ZOOM EFFECT */}
      <div className="relative mb-3 flex h-48 w-full items-center justify-center overflow-hidden rounded-xl bg-slate-50/70 p-3 max-sm:h-40">
        <div className="h-full w-full transition-transform duration-500 group-hover:scale-110 flex items-center justify-center">
          <ProductImage src={p.imageUrl} alt={p.name} className="max-h-full max-w-full object-contain" />
        </div>
      </div>

      {/* THÔNG TIN CHI TIẾT */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          {/* CẤU HÌNH NHANH (CHIP / RAM / BỘ NHỚ) */}
          <div className="mb-1.5 flex flex-wrap gap-1 text-[11px]">
            {p.storage && (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-700">
                {p.storage}
              </span>
            )}
            {p.ram && (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-600">
                RAM {p.ram}
              </span>
            )}
            {p.chip && (
              <span className="max-w-[130px] truncate rounded bg-indigo-50 px-1.5 py-0.5 font-medium text-indigo-700">
                {p.chip}
              </span>
            )}
          </div>

          {/* TÊN SẢN PHẨM */}
          <h3 className="mb-2 min-h-[2.6em] text-[14px] md:text-[15px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
            {p.name}
          </h3>
        </div>

        <div>
          {/* GIÁ BÁN & GIÁ GỐC */}
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-base md:text-lg font-black text-red-600 tabular-nums">
              {vnd(p.effectivePrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through tabular-nums">
                {vnd(p.price)}
              </span>
            )}
          </div>

          {/* TIẾT KIỆM */}
          {savings > 0 && (
            <div className="mt-0.5 text-[11px] font-medium text-emerald-600">
              Tiết kiệm {vnd(savings)}
            </div>
          )}

          {/* ĐÁNH GIÁ VÀ TRẠNG THÁI */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1 text-amber-500 font-semibold text-[11px]">
              <span>★</span>
              <span>4.9</span>
              <span className="text-slate-400 font-normal">({p.viewCount ? Math.min(p.viewCount * 3 + 12, 198) : 24})</span>
            </div>
            {p.stock <= 0 ? (
              <span className="text-[11px] font-bold text-red-500">Tạm hết hàng</span>
            ) : (
              <span className="text-[11px] font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center">
                Mua ngay →
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ProductGrid({ items }) {
  if (!items?.length) {
    return (
      <div className="py-16 text-center text-slate-400 rounded-2xl border border-dashed border-slate-200 bg-white">
        <p className="text-sm font-medium">Hiện chưa có sản phẩm nào trong danh mục này</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 max-sm:grid-cols-2 max-sm:gap-2.5">
      {items.map((p) => (
        <ProductCard key={p.id} p={p} />
      ))}
    </div>
  );
}
