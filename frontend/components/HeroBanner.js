"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FEATURED_SERIES } from "@/lib/seriesConfig";

const SLIDES = [
  {
    tag: "GALAXY AI ĐỈNH CAO 2026",
    title: "Samsung Galaxy S25 Ultra",
    subtitle: "Snapdragon 8 Elite • Camera 200MP Zoom 100x • Bút S-Pen quyền năng",
    badge: "Mới Ra Mắt",
    priceText: "Ưu đãi mở bán từ 29.990.000₫",
    link: "/products?brandId=2&keyword=Galaxy+S25",
    image: "/products/galaxy-s25-ultra.jpg",
    accentColor: "from-blue-600/30 to-indigo-900/40",
  },
  {
    tag: "APPLE INTELLIGENCE ĐỈNH NÓC",
    title: "iPhone 16 Pro Max",
    subtitle: "Thiết kế Titan sa mạc • Nút Camera Control thế hệ mới • Chip A18 Pro 3nm",
    badge: "Flagship Bán Chạy",
    priceText: "Trợ giá lên đời từ 32.490.000₫",
    link: "/products?brandId=1&keyword=iPhone+16",
    image: "/products/iphone-16-pro-max.png",
    accentColor: "from-purple-900/30 to-slate-900/50",
  },
  {
    tag: "HUYỀN THOẠI NHIẾP ẢNH LEICA",
    title: "Xiaomi 15 Ultra",
    subtitle: "Cảm biến 1 inch Quad Camera Leica • Màn hình 2K 120Hz siêu sáng",
    badge: "Trùm Nhiếp Ảnh",
    priceText: "Đặc quyền AURA VIP từ 32.990.000₫",
    link: "/products?brandId=3&keyword=Xiaomi+15",
    image: "/products/xiaomi-15-ultra.jpg",
    accentColor: "from-orange-950/30 to-slate-900/50",
  },
];

export default function HeroBanner({ brands = [] }) {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);

  // Tự động chuyển slide sau mỗi 5 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    const kw = new FormData(e.currentTarget).get("keyword")?.trim();
    router.push("/products" + (kw ? "?keyword=" + encodeURIComponent(kw) : ""));
  };

  const current = SLIDES[activeSlide];

  return (
    <div className="mb-8 pt-3">
      {/* 1. KHUNG BANNER CHÍNH + BANNER PHỤ BÊN PHẢI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* BANNER LỚN SLIDER (8 CỘT) */}
        <div className="lg:col-span-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0F19] via-[#151D2F] to-[#1E1B4B] p-6 sm:p-8 text-white shadow-lg border border-slate-800">
          {/* Vầng hào quang AURA phát sáng ngầm */}
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Cột trái: Nội dung slide */}
            <div className="md:col-span-7 space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-[11px] font-bold text-amber-300 border border-amber-400/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                  {current.tag}
                </span>
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                  {current.badge}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                {current.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                {current.subtitle}
              </p>

              <div className="text-sm sm:text-base font-extrabold text-amber-400">
                {current.priceText}
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <Link
                  href={current.link}
                  className="rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-102 transition-all"
                >
                  Khám phá ngay →
                </Link>
                <Link
                  href="/products"
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-white/20 transition-all"
                >
                  Xem bảng giá
                </Link>
              </div>
            </div>

            {/* Cột phải: Ảnh máy Flagship */}
            <div className="md:col-span-5 flex justify-center items-center">
              <div className="relative h-48 w-48 sm:h-56 sm:w-56 drop-shadow-2xl transition-all duration-700">
                <img
                  src={current.image}
                  alt={current.title}
                  className="h-full w-full object-contain filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform"
                />
              </div>
            </div>
          </div>

          {/* CÁC CHẤM ĐIỀU HƯỚNG SLIDE DƯỚI ĐÁY */}
          <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`h-2 rounded-full transition-all ${
                    activeSlide === i ? "w-8 bg-amber-400" : "w-2 bg-white/30 hover:bg-white/60"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
            <div className="text-[11px] font-medium text-slate-400">
              {activeSlide + 1} / {SLIDES.length}
            </div>
          </div>
        </div>

        {/* 2 BANNER CON KHUYẾN MÃI BÊN PHẢI (4 CỘT) */}
        <div className="lg:col-span-4 flex flex-col gap-3.5">
          {/* Card 1: Thu cũ đổi mới */}
          <Link
            href="/products?onSale=true"
            className="group flex-1 relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 border border-rose-900/30 p-5 text-white shadow-md hover:border-rose-500/50 transition-all flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <span className="inline-block rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                Chương trình đặc quyền
              </span>
              <h3 className="text-base sm:text-lg font-black text-white group-hover:text-rose-300 transition-colors">
                Thu Cũ Đổi Mới — Lên Đời Flagship
              </h3>
              <p className="text-xs text-slate-300">
                Trợ giá tối đa lên đến <b className="text-amber-300 font-extrabold">4.000.000₫</b>. Định giá máy chỉ trong 3 phút.
              </p>
            </div>
            <div className="mt-3 flex items-center text-xs font-bold text-rose-400 group-hover:translate-x-1 transition-transform">
              Định giá ngay <span>→</span>
            </div>
          </Link>

          {/* Card 2: Trả góp 0% */}
          <Link
            href="/products?categoryId=1"
            className="group flex-1 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-900/30 p-5 text-white shadow-md hover:border-indigo-500/50 transition-all flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <span className="inline-block rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                Tài chính dễ dàng
              </span>
              <h3 className="text-base sm:text-lg font-black text-white group-hover:text-indigo-300 transition-colors">
                Trả Góp 0% Lãi Suất Qua Thẻ & CCCD
              </h3>
              <p className="text-xs text-slate-300">
                Trả trước từ 0đ, xét duyệt hồ sơ online trong 5 phút, nhận máy ngay.
              </p>
            </div>
            <div className="mt-3 flex items-center text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
              Xem chi tiết <span>→</span>
            </div>
          </Link>
        </div>
      </div>

      {/* 2. THANH TÌM KIẾM & CHỌN HÃNG / DÒNG MÁY NHANH */}
      <div className="mt-4 rounded-2xl border border-line bg-surface p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Form tìm kiếm */}
          <form onSubmit={onSearch} className="flex gap-2 w-full md:max-w-md">
            <input
              name="keyword"
              aria-label="Tìm kiếm điện thoại"
              placeholder="Nhập tên máy hoặc dòng (iPhone 16, S25 Ultra, Redmi...)"
              className="input rounded-xl px-3.5 py-2 text-xs md:text-sm bg-paper text-ink flex-1 focus:ring-2 focus:ring-accent/20"
            />
            <button className="btn btn-primary rounded-xl px-4 text-xs md:text-sm font-bold shadow-xs whitespace-nowrap">
              Tìm kiếm
            </button>
          </form>

          {/* Danh sách Hãng */}
          {brands?.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-ink-3 font-semibold mr-1">Hãng:</span>
              {brands.map((b) => (
                <Link
                  key={b.id}
                  href={`/products?brandId=${b.id}`}
                  className="rounded-lg border border-line bg-paper px-3 py-1 font-semibold text-ink transition-all hover:bg-accent hover:text-white hover:border-accent"
                >
                  {b.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Hàng chọn nhanh theo Dòng con (Series hot) */}
        <div className="mt-3 pt-3 border-t border-line/60 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-accent font-bold mr-1 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Dòng máy hot:
          </span>
          {FEATURED_SERIES.map((s) => (
            <Link
              key={s.name}
              href={`/products?brandId=${s.brandId}&keyword=${encodeURIComponent(s.keyword)}`}
              className="rounded-lg bg-paper border border-line px-2.5 py-1 text-[11px] font-semibold text-ink-2 transition-all hover:bg-slate-900 hover:text-white"
            >
              <span className="text-ink-3 font-normal">{s.brandName}</span> {s.name}
            </Link>
          ))}
        </div>
      </div>

      {/* 3. BỐN CAM KẾT VÀNG CHUẨN AURA STORE */}
      <div className="mt-3.5 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-2xs hover:border-accent/40 transition-colors">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 text-xl font-bold">
            🛡️
          </div>
          <div>
            <div className="font-bold text-ink">Chính hãng 100%</div>
            <div className="text-[11px] text-ink-3">Bảo hành 12 tháng 1 đổi 1</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-2xs hover:border-accent/40 transition-colors">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 text-xl font-bold">
            🚚
          </div>
          <div>
            <div className="font-bold text-ink">Giao nhanh miễn phí</div>
            <div className="text-[11px] text-ink-3">Giao hoả tốc 2h nội thành</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-2xs hover:border-accent/40 transition-colors">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 text-xl font-bold">
            🔄
          </div>
          <div>
            <div className="font-bold text-ink">30 ngày dùng thử</div>
            <div className="text-[11px] text-ink-3">Lỗi là đổi ngay máy mới</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-2xs hover:border-accent/40 transition-colors">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 text-xl font-bold">
            💳
          </div>
          <div>
            <div className="font-bold text-ink">Trả góp 0% lãi suất</div>
            <div className="text-[11px] text-ink-3">Thủ tục chỉ với CCCD</div>
          </div>
        </div>
      </div>
    </div>
  );
}
