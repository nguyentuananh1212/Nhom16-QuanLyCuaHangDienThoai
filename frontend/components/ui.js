"use client";
/* eslint-disable @next/next/no-img-element -- ảnh sản phẩm là URL tuỳ ý do admin nhập, không cấu hình trước được cho next/image */

import { useEffect, useState } from "react";
import { STATUS_LABEL } from "@/lib/format";
import { getColorImage } from "@/lib/productVariants";

export function PhoneIcon() {
  return (
    <svg viewBox="0 0 60 100" className="w-[38%] text-ink-3" aria-hidden="true">
      <rect x="4" y="2" width="52" height="96" rx="9" fill="none" stroke="currentColor" strokeWidth="3" opacity=".5" />
      <rect x="22" y="7" width="16" height="4" rx="2" fill="currentColor" opacity=".5" />
    </svg>
  );
}

function getFallbackImage(name = "") {
  return getColorImage(name, name, "/products/galaxy-s25-ultra.jpg");
}

/** Ảnh sản phẩm: ưu tiên src, nếu không có hoặc hỏng thì dùng ảnh thật trong thư mục public/products/ */
export function ProductImage({ src, alt = "", className = "" }) {
  const [brokenSrc, setBrokenSrc] = useState(null);
  const fallback = getFallbackImage(alt);
  // Reset trạng thái lỗi nếu src thay đổi
  const activeSrc = src && brokenSrc !== src ? src : fallback;

  return (
    <div className={`grid aspect-square place-items-center overflow-hidden rounded-md bg-paper ${className}`}>
      <img
        key={activeSrc}
        src={activeSrc}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-contain p-1"
        onError={() => {
          if (activeSrc !== fallback) setBrokenSrc(src);
        }}
      />
    </div>
  );
}

const STATUS_COLOR = {
  PENDING: "text-warn", CONFIRMED: "text-accent", SHIPPING: "text-accent",
  DELIVERED: "text-ok", CANCELLED: "text-ink-3",
};
export function StatusTag({ status }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full bg-paper px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[status] || ""}`}>
      {STATUS_LABEL[status] || status}
    </span>
  );
}

export function Pager({ data, onChange }) {
  if (!data || data.totalPages <= 1) return null;
  const cur = data.page, last = data.totalPages - 1, pages = [];
  for (let i = Math.max(0, cur - 2); i <= Math.min(last, cur + 2); i++) pages.push(i);
  return (
    <div className="mt-6 flex justify-center gap-1.5">
      <button className="btn btn-sm" disabled={cur === 0} onClick={() => onChange(cur - 1)}>Trước</button>
      {pages.map((i) => (
        <button key={i} className={`btn btn-sm ${i === cur ? "btn-primary" : ""}`} onClick={() => onChange(i)}>{i + 1}</button>
      ))}
      <button className="btn btn-sm" disabled={cur === last} onClick={() => onChange(cur + 1)}>Sau</button>
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(10,12,30,.5)] p-5" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" className="max-h-[90vh] w-full max-w-[720px] overflow-y-auto rounded-xl bg-surface p-6">
        <h2 className="mb-4 text-xl font-bold">{title}</h2>
        {children}
      </div>
    </div>
  );
}

/** Ô nhập có nhãn + chỗ hiện lỗi validate trả về từ backend */
export function Field({ label, name, error, className = "", as = "input", children, ...props }) {
  const id = "f_" + name;
  const Tag = as;
  return (
    <div className={`mb-3.5 ${className}`}>
      <label htmlFor={id} className="label">{label}</label>
      <Tag id={id} name={name} className="input" {...props}>{children}</Tag>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export function Loading() {
  return <p className="py-12 text-center text-ink-3">Đang tải…</p>;
}

export function Empty({ children }) {
  return <div className="py-12 text-center text-ink-3">{children}</div>;
}

/** Tải dữ liệu phía client. deps thay đổi -> tự tải lại; reload() để tải lại sau khi thao tác. */
export function useLoad(fn, deps) {
  const [tick, setTick] = useState(0);
  // deps là giá trị đơn giản (id, object filter) nên JSON hoá được làm khoá cho lần tải
  const key = JSON.stringify([...deps, tick]);
  const [state, setState] = useState({ key: null, data: null, error: null });
  useEffect(() => {
    let alive = true;
    fn().then(
      (data) => alive && setState({ key, data, error: null }),
      (error) => alive && setState({ key, data: null, error }),
    );
    return () => { alive = false; }; // bỏ kết quả cũ nếu deps đổi giữa chừng (tránh hiển thị sai trang)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  // loading được suy ra: kết quả hiện có chưa ứng với khoá mới nhất. Dữ liệu cũ vẫn giữ để màn hình không nhấp nháy.
  return { data: state.data, error: state.error, loading: state.key !== key, reload: () => setTick((t) => t + 1) };
}
