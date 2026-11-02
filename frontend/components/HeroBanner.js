"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FEATURED_SERIES } from "@/lib/seriesConfig";

const SLIDES = [
  {
    tag: "GALAXY AI ĐỈNH CAO 2026",
    title: "Samsung Galaxy S25 Ultra",
    subtitle: "Snapdragon 8 Elite For Galaxy • Camera 200MP Zoom 100x • Bút S-Pen quyền năng",
    badge: "Mới Ra Mắt",
    priceText: "Ưu đãi mở bán từ 29.990.000₫",
    link: "/products/3",
    image: "/products/galaxy-s25-ultra.jpg",
    accentColor: "from-blue-600/30 to-indigo-900/40",
    themeBadge: "bg-blue-500/20 text-blue-300 border-blue-400/30",
  },
  {
    tag: "APPLE INTELLIGENCE ĐỈNH NÓC",
    title: "iPhone 16 Pro Max",
    subtitle: "Khung Titan sa mạc • Phím Camera Control thế hệ mới • Chip A18 Pro 3nm",
    badge: "Flagship Bán Chạy",
    priceText: "Trợ giá lên đời từ 32.490.000₫",
    link: "/products/1",
    image: "/products/iphone-16-pro-max.png",
    accentColor: "from-purple-900/30 to-slate-900/50",
    themeBadge: "bg-purple-500/20 text-purple-300 border-purple-400/30",
  },
  {
    tag: "HUYỀN THOẠI NHIẾP ẢNH LEICA",
    title: "Xiaomi 15 Ultra",
    subtitle: "Quad Camera cảm biến 1 inch Leica • Snapdragon 8 Elite • Sạc 90W siêu tốc",
    badge: "Trùm Nhiếp Ảnh",
    priceText: "Đặc quyền AURA VIP từ 32.990.000₫",
    link: "/products/5",
    image: "/products/xiaomi-15-ultra.jpg",
    accentColor: "from-orange-950/30 to-slate-900/50",
    themeBadge: "bg-orange-500/20 text-orange-300 border-orange-400/30",
  },
  {
    tag: "QUỐC DÂN TẦM TRUNG 2026",
    title: "Redmi Note 14 Pro",
    subtitle: "Màn hình cong 1.5K 120Hz • Camera 200MP OIS chống rung • Kháng nước IP68",
    badge: "Bán Chạy Nhất",
    priceText: "Chỉ từ 7.690.000₫ (Giảm 9%)",
    link: "/products/6",
    image: "/products/redmi-note-14-pro.jpg",
    accentColor: "from-teal-950/30 to-slate-900/50",
    themeBadge: "bg-teal-500/20 text-teal-300 border-teal-400/30",
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
      {/* 1. KHUNG BANNER CHÍNH + 2 BANNER PHỤ BÊN PHẢI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* BANNER LỚN SLIDER (8 CỘT) */}
        <div className="lg:col-span-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0F19] via-[#141C31] to-[#1E1B4B] p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col justify-between">
          {/* Vầng hào quang AURA phát sáng ngầm */}
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Cột trái: Nội dung slide */}
            <div className="md:col-span-7 space-y-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold border ${current.themeBadge}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />
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
                  className="rounded-xl bg-gradient-to-r from-[#D70018] via-red-600 to-rose-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-red-500/30 hover:scale-105 active:scale-95 transition-all"
                >
                  Mua ngay giá sốc →
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
                  key={current.image}
                  src={current.image}
                  alt={current.title}
                  className="h-full w-full object-contain filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform animate-fadeIn"
                />
              </div>
            </div>
          </div>

          {/* TAB ĐIỀU HƯỚNG TỪNG MÁY SLIDE DƯỚI ĐÁY */}
          <div className="relative z-10 mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SLIDES.map((slide, i) => {
              const isCurrent = activeSlide === i;
              return (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => setActiveSlide(i)}
                  className={`text-left rounded-xl p-2 transition-all ${
                    isCurrent
                      ? "bg-white/15 border border-white/25 shadow-sm"
                      : "bg-white/5 border border-transparent hover:bg-white/10 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className={`text-[11px] font-bold truncate ${isCurrent ? "text-amber-400" : "text-slate-200"}`}>
                    {slide.title}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {slide.badge}
                  </div>
                </button>
              );
            })}
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
              <p className="text-xs text-slate-300 leading-relaxed">
                Trợ giá tối đa lên đến <b className="text-amber-300 font-extrabold">4.000.000₫</b>. Định giá máy chỉ trong 3 phút, nhận máy ngay.
              </p>
            </div>
            <div className="mt-3 flex items-center text-xs font-bold text-rose-400 group-hover:translate-x-1 transition-transform">
              Định giá máy ngay <span>→</span>
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
              <p className="text-xs text-slate-300 leading-relaxed">
                Trả trước từ 0đ, xét duyệt hồ sơ online trong 5 phút, không giữ giấy tờ gốc.
              </p>
            </div>
            <div className="mt-3 flex items-center text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
              Xem chi tiết gói trả góp <span>→</span>
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
              placeholder="Tìm theo tên máy (iPhone 16, S25 Ultra, Redmi...)"
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
                  className="rounded-lg border border-line bg-paper px-3 py-1 font-semibold text-ink transition-all hover:bg-slate-900 hover:text-white hover:border-slate-900"
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
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-2xs hover:border-accent/40 transition-colors">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 text-2xl font-bold">
            🛡️
          </div>
          <div>
            <div className="font-bold text-ink">Chính hãng 100%</div>
            <div className="text-[11px] text-ink-3">Bảo hành 12 tháng 1 đổi 1</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-2xs hover:border-accent/40 transition-colors">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 text-2xl font-bold">
            🚚
          </div>
          <div>
            <div className="font-bold text-ink">Giao nhanh miễn phí</div>
            <div className="text-[11px] text-ink-3">Hoả tốc 2H nội thành</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-2xs hover:border-accent/40 transition-colors">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 text-2xl font-bold">
            🔄
          </div>
          <div>
            <div className="font-bold text-ink">30 ngày đổi trả</div>
            <div className="text-[11px] text-ink-3">Lỗi phần cứng đổi ngay máy mới</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-2xs hover:border-accent/40 transition-colors">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 text-2xl font-bold">
            💳
          </div>
          <div>
            <div className="font-bold text-ink">Trả góp 0% lãi suất</div>
            <div className="text-[11px] text-ink-3">Duyệt nhanh qua CCCD / Thẻ</div>
          </div>
        </div>
      </div>
    </div>
  );
}
