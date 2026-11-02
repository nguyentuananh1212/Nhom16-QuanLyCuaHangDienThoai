"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ProductGrid } from "@/components/ProductCard";
import { Loading, useLoad } from "@/components/ui";
import HeroBanner from "@/components/HeroBanner";

// Các thương hiệu với biểu tượng và slogan bắt mắt
const BRAND_SHOWCASE = [
  {
    id: 1,
    name: "Apple",
    slogan: "Titanium & Apple Intelligence",
    badge: "VN/A Chính Hãng",
    logoText: "",
    bg: "from-slate-900 to-slate-950",
    border: "border-slate-800",
    color: "text-white",
  },
  {
    id: 2,
    name: "Samsung",
    slogan: "Quyền năng Galaxy AI đỉnh cao",
    badge: "Galaxy S & Z",
    logoText: "SAMSUNG",
    bg: "from-blue-950 to-slate-950",
    border: "border-blue-900/40",
    color: "text-blue-400",
  },
  {
    id: 3,
    name: "Xiaomi",
    slogan: "Nhiếp ảnh huyền thoại Leica",
    badge: "Leica Optics",
    logoText: "XIAOMI",
    bg: "from-orange-950 to-slate-950",
    border: "border-orange-900/40",
    color: "text-orange-400",
  },
  {
    id: 4,
    name: "OPPO",
    slogan: "Chuyên gia chân dung tỏa sáng",
    badge: "Reno & Find",
    logoText: "OPPO",
    bg: "from-emerald-950 to-slate-950",
    border: "border-emerald-900/40",
    color: "text-emerald-400",
  },
  {
    id: 5,
    name: "Google",
    slogan: "Nhiếp ảnh chân thực Pixel AI",
    badge: "Google Tensor",
    logoText: "PIXEL",
    bg: "from-purple-950 to-slate-950",
    border: "border-purple-900/40",
    color: "text-purple-400",
  },
];

// Nhu cầu tìm kiếm phổ biến
const DEMANDS = [
  { label: "Gaming Cực Đỉnh", desc: "Chip Snapdragon 8, màn 120Hz", icon: "🎮", query: "keyword=Ultra" },
  { label: "Chụp Ảnh Đẹp", desc: "Camera 200MP, cảm biến Leica", icon: "📸", query: "keyword=Pro" },
  { label: "Pin Khủng 5000mAh", desc: "Dùng thoải mái 2 ngày liên tục", icon: "🔋", query: "maxPrice=12000000" },
  { label: "Màn Hình Gập", desc: "Thời thượng, mở rộng không gian", icon: "📱", query: "keyword=Galaxy" },
  { label: "Học Sinh - Sinh Viên", desc: "Cấu hình tốt dưới 5 triệu", icon: "🎓", query: "maxPrice=5000000" },
];

export default function HomePage() {
  const { data, loading, error } = useLoad(
    () =>
      Promise.all([
        api("/api/brands"),
        api("/api/products/hot"),
        api("/api/products/sale"),
        api("/api/products/most-viewed"),
      ]),
    []
  );

  // Đồng hồ đếm ngược Flash Sale giả lập thực tế
  const [countdown, setCountdown] = useState({ hours: 3, minutes: 24, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDigits = (num) => String(num).padStart(2, "0");

  return (
    <div className="space-y-10 pb-8">
      {/* 1. HERO BANNER CHÍNH VÀ CAM KẾT VÀNG */}
      <HeroBanner brands={data?.[0] || []} />

      {/* 2. CHỌN ĐIỆN THOẠI THEO NHU CẦU SỬ DỤNG */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-black text-ink tracking-tight flex items-center gap-2">
              <span>🎯</span>
              <span>Chọn Điện Thoại Theo Nhu Cầu</span>
            </h2>
            <p className="text-xs text-ink-3">Gợi ý dòng máy tối ưu cho từng mục đích sử dụng</p>
          </div>
          <Link href="/products" className="text-xs font-bold text-accent hover:underline">
            Xem tất cả →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {DEMANDS.map((d) => (
            <Link
              key={d.label}
              href={`/products?${d.query}`}
              className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-3.5 shadow-2xs transition-all hover:-translate-y-1 hover:border-accent hover:shadow-md"
            >
              <div>
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform inline-block">
                  {d.icon}
                </div>
                <div className="text-xs md:text-sm font-bold text-ink group-hover:text-accent transition-colors">
                  {d.label}
                </div>
                <div className="text-[11px] text-ink-3 mt-1 leading-snug">
                  {d.desc}
                </div>
              </div>
              <div className="mt-2 text-[10px] font-bold text-accent group-hover:translate-x-0.5 transition-transform">
                Khám phá →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FLASH SALE GIỜ VÀNG CÓ ĐỒNG HỒ ĐẾM NGƯỢC */}
      {data?.[2]?.length > 0 && (
        <section className="overflow-hidden rounded-3xl border border-red-500/30 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-4 md:p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-white/20 pb-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xl md:text-2xl font-black tracking-tight text-white uppercase">
                <span className="text-2xl animate-bounce">🔥</span>
                <span>FLASH SALE GIỜ VÀNG</span>
              </div>
              <span className="rounded-lg bg-white/20 px-2 py-0.5 text-xs font-bold text-amber-200">
                Giảm Đến 40%
              </span>
            </div>

            {/* Đồng hồ đếm ngược */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-white/80">Kết thúc sau:</span>
              <div className="flex items-center gap-1 font-mono font-black text-slate-900">
                <span className="rounded-md bg-white px-2 py-1 shadow-xs">{formatDigits(countdown.hours)}</span>
                <span className="text-white">:</span>
                <span className="rounded-md bg-white px-2 py-1 shadow-xs">{formatDigits(countdown.minutes)}</span>
                <span className="text-white">:</span>
                <span className="rounded-md bg-white px-2 py-1 text-red-600 shadow-xs">{formatDigits(countdown.seconds)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-surface/95 p-4 text-ink backdrop-blur-md">
            <ProductGrid items={data[2].slice(0, 4)} />
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/products?onSale=true"
              className="inline-flex items-center gap-1 rounded-xl bg-white px-5 py-2 text-xs font-bold text-red-600 shadow-md hover:bg-slate-100 transition-all"
            >
              Xem tất cả máy đang Flash Sale →
            </Link>
          </div>
        </section>
      )}

      {/* 4. KHÁM PHÁ CÁC THƯƠNG HIỆU HÀNG ĐẦU */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-black text-ink tracking-tight flex items-center gap-2">
              <span>👑</span>
              <span>Thương Hiệu Đẳng Cấp</span>
            </h2>
            <p className="text-xs text-ink-3">Hệ sinh thái chính hãng 100% được phân phối uỷ quyền</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {BRAND_SHOWCASE.map((brand) => (
            <Link
              key={brand.id}
              href={`/products?brandId=${brand.id}`}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-b ${brand.bg} border ${brand.border} p-4 text-white shadow-md hover:scale-102 transition-all flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-base font-black tracking-wider ${brand.color}`}>
                    {brand.logoText}
                  </span>
                  <span className="rounded bg-white/10 px-1.5 py-0.2 text-[9px] font-semibold text-slate-300">
                    {brand.badge}
                  </span>
                </div>
                <div className="text-sm font-extrabold text-white mt-1">{brand.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{brand.slogan}</div>
              </div>

              <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-slate-300 group-hover:text-white">
                <span>Vào gian hàng</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. TOP SẢN PHẨM BÁN CHẠY NHẤT */}
      {data?.[1]?.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 text-sm font-black">
                ★
              </span>
              <div>
                <h2 className="text-lg md:text-xl font-black tracking-tight text-ink">
                  Sản Phẩm Bán Chạy Nhất (Hot Trend)
                </h2>
                <p className="text-xs text-ink-3">Top điện thoại được khách hàng chọn mua nhiều nhất tháng này</p>
              </div>
            </div>
            <Link
              href="/products?sort=best_selling"
              className="text-xs md:text-sm font-bold text-accent hover:underline flex items-center gap-1"
            >
              <span>Xem tất cả ({data[1].length})</span>
              <span>→</span>
            </Link>
          </div>
          <ProductGrid items={data[1]} />
        </section>
      )}

      {/* 6. SẢN PHẨM ĐƯỢC QUAN TÂM & XEM NHIỀU NHẤT */}
      {data?.[3]?.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600 text-sm font-black">
                👁
              </span>
              <div>
                <h2 className="text-lg md:text-xl font-black tracking-tight text-ink">
                  Được Xem & Quan Tâm Nhiều Nhất
                </h2>
                <p className="text-xs text-ink-3">Những mẫu smartphone đón đầu công nghệ năm nay</p>
              </div>
            </div>
            <Link
              href="/products?sort=most_viewed"
              className="text-xs md:text-sm font-bold text-accent hover:underline flex items-center gap-1"
            >
              <span>Xem tất cả ({data[3].length})</span>
              <span>→</span>
            </Link>
          </div>
          <ProductGrid items={data[3]} />
        </section>
      )}

      {loading && <Loading />}
      {error && <p className="py-12 text-center text-price font-semibold">{error.message}</p>}

      {/* 7. ĐẶC QUYỀN MUA SẮM TẠI AURA STORE */}
      <section className="rounded-3xl border border-line bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-md">
        <div className="text-center max-w-xl mx-auto mb-6">
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            AURA VIP PRIVILEGES
          </span>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-white mt-2">
            Đặc Quyền Mua Sắm Tại AURA PHONESTORE
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Không chỉ là bán điện thoại, chúng tôi mang tới dịch vụ hậu mãi chuẩn 5 sao
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="text-2xl mb-2">🎁</div>
            <div className="font-bold text-white text-sm mb-1">Gói Quà Tặng VIP</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Tặng kèm củ sạc nhanh chính hãng, ốp lưng cao cấp và dán cường lực miễn phí.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="text-2xl mb-2">⚡</div>
            <div className="font-bold text-white text-sm mb-1">Bảo Hành Rơi Vỡ</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Hỗ trợ 50% chi phí sửa chữa thay thế linh kiện chính hãng nếu có tai nạn rơi vỡ vào nước.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="text-2xl mb-2">🔄</div>
            <div className="font-bold text-white text-sm mb-1">Chuyển Dữ Liệu 1-1</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Kỹ thuật viên hỗ trợ chuyển trọn vẹn danh bạ, ảnh, Zalo, app từ máy cũ sang máy mới.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="text-2xl mb-2">💎</div>
            <div className="font-bold text-white text-sm mb-1">Hội Viên Thân Thiết</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Tích điểm hoàn tiền đến 5% cho mỗi lần mua sắm phụ kiện và dịch vụ sửa chữa.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
