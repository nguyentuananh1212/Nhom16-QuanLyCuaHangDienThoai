"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ProductGrid } from "@/components/ProductCard";
import { Loading, useLoad } from "@/components/ui";
import HeroBanner from "@/components/HeroBanner";
import { vnd } from "@/lib/format";

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

// Phân khúc giá
const PRICE_SEGMENTS = [
  { label: "Dưới 5 triệu", sub: "Phù hợp HSSV", query: "maxPrice=5000000", color: "hover:border-emerald-400" },
  { label: "Từ 5 - 10 triệu", sub: "Cấu hình mạnh mẽ", query: "minPrice=5000000&maxPrice=10000000", color: "hover:border-blue-400" },
  { label: "Từ 10 - 20 triệu", sub: "Cận cao cấp", query: "minPrice=10000000&maxPrice=20000000", color: "hover:border-purple-400" },
  { label: "Trên 20 triệu", sub: "Siêu phẩm Flagship", query: "minPrice=20000000", color: "hover:border-red-400" },
];

// So sánh 3 siêu phẩm
const FLAGSHIP_COMPARE = [
  {
    name: "iPhone 16 Pro Max",
    brand: "Apple",
    price: 32490000,
    chip: "Apple A18 Pro 3nm",
    screen: '6.9" Super Retina XDR OLED 120Hz',
    camera: "48MP Fusion + 12MP Tele 5x Periscope",
    battery: "4.674 mAh (Sạc 25W MagSafe)",
    highlight: "Apple Intelligence & Phím Camera Control",
    image: "/products/iphone-16-pro-max.png",
    link: "/products/1",
  },
  {
    name: "Samsung Galaxy S25 Ultra",
    brand: "Samsung",
    price: 29990000,
    chip: "Snapdragon 8 Elite For Galaxy",
    screen: '6.9" Dynamic AMOLED 2X 120Hz',
    camera: "200MP OIS + 50MP Periscope 100x",
    battery: "5.000 mAh (Sạc 45W siêu tốc)",
    highlight: "Quyền năng Galaxy AI & Bút S-Pen tích hợp",
    image: "/products/galaxy-s25-ultra.jpg",
    link: "/products/3",
  },
  {
    name: "Xiaomi 15 Ultra",
    brand: "Xiaomi",
    price: 32990000,
    chip: "Snapdragon 8 Elite",
    screen: '6.73" AMOLED 2K 120Hz 3200 nits',
    camera: "Quad Camera 50MP cảm biến 1 inch Leica",
    battery: "5.300 mAh (Sạc 90W có dây + 50W không dây)",
    highlight: "Nhiếp ảnh huyền thoại Leica & Xiaomi HyperOS",
    image: "/products/xiaomi-15-ultra.jpg",
    link: "/products/5",
  },
];

// Khách hàng đánh giá thực tế
const TESTIMONIALS = [
  {
    name: "Nguyễn Hải Đăng",
    role: "Kỹ sư phần mềm, Hà Nội",
    phone: "iPhone 16 Pro Max 256GB",
    rating: 5,
    comment: "Giao hàng hoả tốc chỉ 45 phút! Máy nguyên seal VN/A chính hãng, nhân viên kỹ thuật hỗ trợ chuyển trọn vẹn dữ liệu từ máy cũ sang rất chu đáo.",
  },
  {
    name: "Trần Mai Anh",
    role: "Chuyên viên truyền thông, TP.HCM",
    phone: "Galaxy S25 Ultra",
    rating: 5,
    comment: "Thanh toán ZaloPay vừa quét mã xong là đơn tự động xác nhận tức thì, giao diện cực kỳ chuyên nghiệp và tiện lợi. Sẽ tiếp tục ủng hộ AURA Store!",
  },
  {
    name: "Lê Hoàng Phúc",
    role: "Nhiếp ảnh gia tự do, Đà Nẵng",
    phone: "Xiaomi 15 Ultra",
    rating: 5,
    comment: "Chương trình thu cũ đổi mới trợ giá rất cao, thủ tục trả góp 0% duyệt online qua CCCD cực nhanh, không mất phí ẩn.",
  },
];

export default function HomePage() {
  const { data, loading, error } = useLoad(
    () =>
      Promise.all([
        api("/api/brands"),
        api("/api/products/hot"),
        api("/api/products/sale?limit=20"),
        api("/api/products/most-viewed"),
      ]),
    []
  );

  // Tab lọc sản phẩm trong khối Flash Sale
  const [flashSaleBrand, setFlashSaleBrand] = useState(0); // 0: Tất cả
  const [showAllFlashSale, setShowAllFlashSale] = useState(false);

  // Tab lọc sản phẩm trực tiếp trên trang chủ
  const [activeBrandTab, setActiveBrandTab] = useState(0); // 0: Tất cả

  // Đồng hồ đếm ngược Flash Sale
  const [countdown, setCountdown] = useState({ hours: 3, minutes: 24, seconds: 45 });
  const [emailInput, setEmailInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);

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

  const hotProducts = data?.[1] || [];
  const saleProducts = data?.[2] || [];
  const viewedProducts = data?.[3] || [];
  const allBrands = data?.[0] || [];

  // Chuẩn hoá tên model dòng máy để loại bỏ trùng lặp phiên bản dung lượng (tránh hiện nhiều máy cùng dòng S25 Ultra)
  const getCanonicalModel = (name = "") => {
    return (name || "")
      .replace(/\b(samsung|apple|xiaomi|oppo|google)\b/gi, "")
      .replace(/\s*\b\d+\s*(?:GB|TB)\b/gi, "")
      .replace(/\s*\b\d+G\b/gi, "")
      .trim()
      .toLowerCase();
  };

  // Danh sách Flash Sale đa dạng các dòng máy khác nhau từ nhiều hãng (Apple, Samsung, Google, Xiaomi, OPPO)
  const distinctSaleProducts = useMemo(() => {
    const seen = new Set();
    const list = [];

    // Ưu tiên dòng có phần trăm giảm tốt và phiên bản phổ thông (như 256GB)
    const sorted = [...saleProducts].sort((a, b) => {
      // Ưu tiên các dòng Flagship / Pro / Ultra lên trước nếu cùng hãng
      const aIsPro = a.name.includes("Pro") || a.name.includes("Ultra");
      const bIsPro = b.name.includes("Pro") || b.name.includes("Ultra");
      if (aIsPro && !bIsPro) return -1;
      if (!aIsPro && bIsPro) return 1;
      return (b.discountPercent || 0) - (a.discountPercent || 0);
    });

    for (const p of sorted) {
      const key = getCanonicalModel(p.name);
      if (!seen.has(key)) {
        seen.add(key);
        list.push(p);
      }
    }

    // Gom nhóm theo từng hãng
    const byBrand = {};
    for (const p of list) {
      const b = p.brandName || "Khác";
      if (!byBrand[b]) byBrand[b] = [];
      byBrand[b].push(p);
    }

    // Xen kẽ các thương hiệu (Apple -> Samsung -> Google -> Xiaomi -> OPPO) để mặt tiền Flash Sale luôn đa dạng màu sắc
    const preferredOrder = ["Apple", "Samsung", "Google", "Xiaomi", "OPPO"];
    const interleaved = [];
    let added = true;
    let round = 0;
    while (added) {
      added = false;
      for (const b of preferredOrder) {
        if (byBrand[b] && byBrand[b][round]) {
          interleaved.push(byBrand[b][round]);
          added = true;
        }
      }
      round++;
    }

    return interleaved.length > 0 ? interleaved : list;
  }, [saleProducts]);

  // Các thương hiệu có mặt trong Flash Sale
  const flashSaleBrands = useMemo(() => {
    const brandMap = new Map();
    for (const p of saleProducts) {
      if (p.brandId && p.brandName && !brandMap.has(p.brandId)) {
        brandMap.set(p.brandId, { id: p.brandId, name: p.brandName });
      }
    }
    return Array.from(brandMap.values());
  }, [saleProducts]);

  // Danh sách hiển thị theo thương hiệu đã chọn trong Flash Sale (nhiều sản phẩm khác nhau)
  const displayedFlashSale = useMemo(() => {
    if (flashSaleBrand === 0) return distinctSaleProducts;
    return saleProducts.filter((p) => p.brandId === flashSaleBrand);
  }, [flashSaleBrand, distinctSaleProducts, saleProducts]);

  // Lọc sản phẩm bán chạy theo tab thương hiệu (loại bỏ trùng lặp phiên bản để hiển thị nhiều mẫu máy khác nhau)
  const distinctHotProducts = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const p of hotProducts) {
      const key = getCanonicalModel(p.name);
      if (!seen.has(key)) {
        seen.add(key);
        list.push(p);
      }
    }
    return list;
  }, [hotProducts]);

  const filteredHotProducts = activeBrandTab === 0
    ? distinctHotProducts
    : hotProducts.filter((p) => p.brandId === activeBrandTab);

  // Danh sách xem nhiều nhất cũng được chuẩn hóa đa dạng dòng máy
  const distinctViewedProducts = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const p of viewedProducts) {
      const key = getCanonicalModel(p.name);
      if (!seen.has(key)) {
        seen.add(key);
        list.push(p);
      }
    }
    return list;
  }, [viewedProducts]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <div className="space-y-12 pb-12">
      {/* 1. HERO BANNER CHÍNH VÀ CAM KẾT VÀNG */}
      <HeroBanner brands={allBrands} />

      {/* 2. CHỌN MÁY THEO PHÂN KHÚC NGÂN SÁCH */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-black text-ink tracking-tight flex items-center gap-2">
              <span>💰</span>
              <span>Chọn Điện Thoại Theo Ngân Sách</span>
            </h2>
            <p className="text-xs text-ink-3">Tìm dòng máy tốt nhất trong tầm giá dự chi của bạn</p>
          </div>
          <Link href="/products" className="text-xs font-bold text-accent hover:underline">
            Xem tất cả bảng giá →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PRICE_SEGMENTS.map((seg) => (
            <Link
              key={seg.label}
              href={`/products?${seg.query}`}
              className={`rounded-2xl border border-line bg-surface p-4 shadow-2xs transition-all hover:-translate-y-1 hover:shadow-md ${seg.color}`}
            >
              <span className="block text-sm md:text-base font-extrabold text-ink">{seg.label}</span>
              <span className="block text-[11px] text-ink-3 mt-0.5">{seg.sub}</span>
              <span className="mt-2.5 inline-block text-[11px] font-bold text-accent">Khám phá ngay →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FLASH SALE GIỜ VÀNG CÓ ĐỒNG HỒ ĐẾM NGƯỢC */}
      {saleProducts.length > 0 && (
        <section className="overflow-hidden rounded-3xl border border-red-500/30 bg-gradient-to-r from-[#D70018] via-rose-600 to-red-700 p-4 md:p-6 text-white shadow-xl">
          {/* Header Flash Sale & Đồng hồ đếm ngược */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-white/20 pb-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xl md:text-2xl font-black tracking-tight text-white uppercase">
                <span className="text-2xl animate-bounce">🔥</span>
                <span>FLASH SALE GIỜ VÀNG</span>
              </div>
              <span className="rounded-lg bg-white/20 px-2.5 py-0.5 text-xs font-bold text-amber-200 border border-white/10">
                Giảm Đến 40%
              </span>
            </div>

            {/* Đồng hồ đếm ngược số điện tử */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-white/85">Kết thúc trong:</span>
              <div className="flex items-center gap-1 font-mono font-black text-slate-900">
                <span className="rounded-lg bg-white px-2 py-1 shadow-xs">{formatDigits(countdown.hours)}</span>
                <span className="text-white font-bold">:</span>
                <span className="rounded-lg bg-white px-2 py-1 shadow-xs">{formatDigits(countdown.minutes)}</span>
                <span className="text-white font-bold">:</span>
                <span className="rounded-lg bg-white px-2 py-1 text-[#D70018] shadow-xs">{formatDigits(countdown.seconds)}</span>
              </div>
            </div>
          </div>

          {/* Thanh Tab chọn thương hiệu để xem nhiều sản phẩm khác nhau */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-white/90 mr-1 flex items-center gap-1">
                <span>🏷️</span>
                <span>Hãng:</span>
              </span>
              <button
                type="button"
                onClick={() => setFlashSaleBrand(0)}
                className={`rounded-full px-3.5 py-1 text-xs font-extrabold transition-all cursor-pointer ${
                  flashSaleBrand === 0
                    ? "bg-white text-[#D70018] shadow-md scale-105"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                Tất cả ({distinctSaleProducts.length} mẫu khác nhau)
              </button>
              {flashSaleBrands.map((b) => {
                const count = saleProducts.filter((p) => p.brandId === b.id).length;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setFlashSaleBrand(b.id)}
                    className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                      flashSaleBrand === b.id
                        ? "bg-white text-[#D70018] shadow-md scale-105"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    {b.name} ({count})
                  </button>
                );
              })}
            </div>

            <div className="text-[11.5px] text-amber-200 font-medium">
              ⚡ Đa dạng mọi dòng máy: Apple, Samsung, Google, Xiaomi, OPPO
            </div>
          </div>

          {/* Lưới sản phẩm Flash Sale đa dạng các dòng máy */}
          <div className="rounded-2xl bg-surface/95 p-4 text-ink backdrop-blur-md">
            <ProductGrid items={showAllFlashSale ? displayedFlashSale : displayedFlashSale.slice(0, 8)} />
          </div>

          {/* Chân trang Flash Sale: Xem thêm hoặc Xem tất cả */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-center">
            {displayedFlashSale.length > 8 && (
              <button
                type="button"
                onClick={() => setShowAllFlashSale(!showAllFlashSale)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/20 border border-white/40 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-white hover:text-[#D70018] transition-all cursor-pointer"
              >
                <span>{showAllFlashSale ? "Thu gọn bớt" : `Xem thêm ${displayedFlashSale.length - 8} sản phẩm Flash Sale`}</span>
                <span>{showAllFlashSale ? "↑" : "↓"}</span>
              </button>
            )}

            <Link
              href="/products?onSale=true"
              className="inline-flex items-center gap-1 rounded-xl bg-white px-6 py-2.5 text-xs font-bold text-[#D70018] shadow-md hover:bg-slate-100 transition-all hover:scale-102"
            >
              <span>Xem tất cả máy đang Flash Sale ({saleProducts.length} sản phẩm)</span>
              <span>→</span>
            </Link>
          </div>
        </section>
      )}

      {/* 4. CHỌN ĐIỆN THOẠI THEO NHU CẦU SỬ DỤNG */}
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
              className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-4 shadow-2xs transition-all hover:-translate-y-1 hover:border-accent hover:shadow-md"
            >
              <div>
                <div className="text-3xl mb-2.5 group-hover:scale-110 transition-transform inline-block">
                  {d.icon}
                </div>
                <div className="text-xs md:text-sm font-bold text-ink group-hover:text-accent transition-colors">
                  {d.label}
                </div>
                <div className="text-[11px] text-ink-3 mt-1 leading-snug">
                  {d.desc}
                </div>
              </div>
              <div className="mt-3 text-[10px] font-bold text-accent group-hover:translate-x-0.5 transition-transform">
                Khám phá ngay →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. KHÁM PHÁ CÁC THƯƠNG HIỆU HÀNG ĐẦU */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-black text-ink tracking-tight flex items-center gap-2">
              <span>👑</span>
              <span>Hệ Sinh Thái Thương Hiệu</span>
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
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold text-slate-300">
                    {brand.badge}
                  </span>
                </div>
                <div className="text-sm font-extrabold text-white mt-1">{brand.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{brand.slogan}</div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-slate-300 group-hover:text-white">
                <span>Vào gian hàng</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. TOP SẢN PHẨM BÁN CHẠY NHẤT VỚI BỘ LỌC TAB TRỰC TIẾP */}
      {hotProducts.length > 0 && (
        <section>
          <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-line pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-600 text-sm font-black">
                ★
              </span>
              <div>
                <h2 className="text-lg md:text-xl font-black tracking-tight text-ink">
                  Sản Phẩm Bán Chạy Nhất (Hot Trend)
                </h2>
                <p className="text-xs text-ink-3">Top điện thoại được khách hàng chọn mua nhiều nhất</p>
              </div>
            </div>

            {/* Các Tab lọc thương hiệu nhanh ngay trên trang chủ */}
            <div className="flex flex-wrap items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveBrandTab(0)}
                className={`rounded-xl px-3 py-1.5 font-bold transition-all cursor-pointer ${
                  activeBrandTab === 0
                    ? "bg-[#D70018] text-white shadow-xs"
                    : "bg-paper text-ink-2 hover:bg-slate-200"
                }`}
              >
                Tất cả
              </button>
              {allBrands.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setActiveBrandTab(b.id)}
                  className={`rounded-xl px-3 py-1.5 font-semibold transition-all cursor-pointer ${
                    activeBrandTab === b.id
                      ? "bg-[#D70018] text-white shadow-xs"
                      : "bg-paper text-ink-2 hover:bg-slate-200"
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {filteredHotProducts.length > 0 ? (
            <ProductGrid items={filteredHotProducts} />
          ) : (
            <div className="rounded-2xl border border-line bg-surface p-8 text-center text-xs text-ink-3">
              Chưa có sản phẩm nào thuộc thương hiệu này trong danh sách bán chạy.
            </div>
          )}
        </section>
      )}

      {/* 7. BẢNG SO SÁNH NHANH 3 SIÊU PHẨM FLAGSHIP 2026 */}
      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-[#0F172A] to-slate-950 p-6 md:p-8 text-white shadow-xl">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            FLAGSHIP SHOWDOWN 2026
          </span>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-white mt-2">
            So Sánh Nhanh 3 Siêu Phẩm Đầu Bảng
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Đâu là chiếc điện thoại phù hợp nhất với phong cách và nhu cầu của bạn?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FLAGSHIP_COMPARE.map((phone) => (
            <div
              key={phone.name}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md flex flex-col justify-between hover:border-amber-400/40 transition-all hover:scale-102"
            >
              <div>
                <div className="relative h-44 w-full flex items-center justify-center mb-4">
                  <img src={phone.image} alt={phone.name} className="h-full object-contain filter drop-shadow-xl" />
                </div>
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">{phone.brand}</div>
                <h3 className="text-base font-black text-white mt-0.5">{phone.name}</h3>
                <div className="text-base font-extrabold text-[#D70018] mt-1 tabular-nums">
                  {vnd(phone.price)}
                </div>

                <div className="mt-4 space-y-2 text-xs border-t border-white/10 pt-3">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Vi xử lý:</span>
                    <strong className="text-slate-200">{phone.chip}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Màn hình:</span>
                    <span className="text-slate-200">{phone.screen}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Camera:</span>
                    <span className="text-slate-200">{phone.camera}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Điểm nổi bật:</span>
                    <span className="text-amber-300 font-medium">{phone.highlight}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10">
                <Link
                  href={phone.link}
                  className="block w-full rounded-xl bg-white/15 hover:bg-white text-center py-2 text-xs font-bold text-white hover:text-slate-900 transition-all shadow-xs"
                >
                  Xem chi tiết máy →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. SẢN PHẨM ĐƯỢC QUAN TÂM & XEM NHIỀU NHẤT */}
      {viewedProducts.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 text-sm font-black">
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
              <span>Xem tất cả ({viewedProducts.length})</span>
              <span>→</span>
            </Link>
          </div>
          <ProductGrid items={distinctViewedProducts} />
        </section>
      )}

      {loading && <Loading />}
      {error && <p className="py-12 text-center text-price font-semibold">{error.message}</p>}

      {/* 9. ĐẶC QUYỀN MUA SẮM TẠI AURA STORE */}
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
              Tặng kèm củ sạc nhanh chính hãng, ốp lưng cao cấp và dán cường lực trọn đời máy.
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
              Kỹ thuật viên hỗ trợ chuyển trọn vẹn danh bạ, ảnh, Zalo, ứng dụng từ máy cũ sang máy mới.
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

      {/* 10. ĐÁNH GIÁ THỰC TẾ TỪ KHÁCH HÀNG */}
      <section>
        <div className="mb-4 text-center">
          <h2 className="text-lg md:text-xl font-black text-ink tracking-tight flex items-center justify-center gap-2">
            <span>💬</span>
            <span>Khách Hàng Nói Gì Về AURA Store?</span>
          </h2>
          <p className="text-xs text-ink-3">Hơn 10.000+ khách hàng hài lòng trên khắp cả nước</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-line bg-surface p-4 shadow-2xs space-y-2.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-500 text-xs mb-1">
                  {"★".repeat(t.rating)}
                </div>
                <p className="text-xs text-ink-2 italic leading-relaxed">
                  "{t.comment}"
                </p>
              </div>

              <div className="pt-2 border-t border-line/60 flex items-center justify-between text-[11px]">
                <div>
                  <div className="font-bold text-ink">{t.name}</div>
                  <div className="text-ink-3">{t.role}</div>
                </div>
                <span className="rounded bg-indigo-50 text-indigo-700 px-2 py-0.5 font-semibold text-[10px]">
                  {t.phone}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 11. HỘP NHẬN VOUCHER ƯU ĐÃI 500.000Đ */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-6 md:p-8 text-white shadow-lg text-center">
        <div className="max-w-xl mx-auto space-y-3">
          <span className="inline-block text-2xl animate-bounce">🎁</span>
          <h2 className="text-xl md:text-2xl font-black text-white">
            Nhận Ngay Voucher 500.000₫ Cho Đơn Hàng Đầu Tiên!
          </h2>
          <p className="text-xs text-slate-300">
            Đăng ký nhận thông tin khuyến mãi và mã giảm giá độc quyền dành riêng cho khách hàng mới của AURA Store.
          </p>

          {subscribed ? (
            <div className="rounded-xl bg-emerald-500/20 border border-emerald-400 p-3 text-xs font-bold text-emerald-300">
              🎉 Cảm ơn bạn! Mã giảm giá <span className="font-mono text-white underline">AURAVIP500</span> đã được gửi vào hòm thư của bạn.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Nhập email của bạn..."
                className="rounded-xl px-4 py-2.5 text-xs bg-white text-slate-900 flex-1 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#D70018] hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 shadow-md cursor-pointer transition-all whitespace-nowrap active:scale-95"
              >
                Nhận Voucher Ngay
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
