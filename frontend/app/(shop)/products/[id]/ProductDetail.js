"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { fmtDate, vnd } from "@/lib/format";
import { useAuth, useToast } from "@/components/Providers";
import { Empty, Loading, Pager, ProductImage, useLoad } from "@/components/ui";
import { getProductVariants } from "@/lib/productVariants";

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const { user, refreshCart } = useAuth();
  const [qty, setQty] = useState(1);

  // Tải chi tiết sản phẩm
  const { data: p, loading, error } = useLoad(() => api("/api/products/" + id), [id]);

  // Tải các sản phẩm cùng hãng để phân loại phiên bản
  const { data: relatedData } = useLoad(
    () => (p?.brandId ? api("/api/products", { query: { brandId: p.brandId, size: 24 } }) : Promise.resolve(null)),
    [p?.brandId]
  );

  // Sinh các phiên bản và màu sắc thật dựa trên sản phẩm
  const variantData = p ? getProductVariants(p, relatedData?.content || []) : null;

  // State phiên bản và màu sắc được chọn
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  // Tự động khởi tạo phiên bản và màu khi sản phẩm tải xong
  useEffect(() => {
    if (variantData) {
      const curVer = variantData.versions.find((v) => v.isCurrent) || variantData.versions[0];
      setSelectedVersionId(curVer?.id || null);

      const curCol = variantData.colors.find((c) => c.isCurrent) || variantData.colors[0];
      setSelectedColor(curCol || null);
    }
  }, [id, p?.id, relatedData]);

  // Đếm lượt xem bằng POST riêng
  useEffect(() => {
    api(`/api/products/${id}/view`, { method: "POST" }).catch(() => {});
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <Empty>{error.message}</Empty>;

  // Đảm bảo màu được chọn thuộc về sản phẩm hiện tại, tránh hiển thị ảnh của sản phẩm trước
  const isColorValid = variantData?.colors?.some((c) => c.id === selectedColor?.id);
  const activeColor = isColorValid
    ? selectedColor
    : (variantData?.colors?.find((c) => c.isCurrent) || variantData?.colors?.[0] || null);

  const currentVer = variantData?.versions.find((v) => v.id === selectedVersionId) || variantData?.versions[0];
  const activeProduct = p;
  const activeImage = activeColor?.imageUrl || p.imageUrl;

  // Tính giá và số lượng tồn kho theo từng màu sắc được chọn:
  const activeColorDiff = activeColor?.priceDiff || 0;
  const verBasePrice = currentVer ? currentVer.price : p.effectivePrice;
  const verOrigPrice = currentVer ? currentVer.originalPrice : p.price;

  const activePrice = Math.max(500000, verBasePrice + activeColorDiff);
  const activeOriginalPrice = Math.max(500000, verOrigPrice + activeColorDiff);
  const activeStock = activeColor?.stock !== undefined ? activeColor.stock : p.stock;

  const activeDiscount =
    activeOriginalPrice > activePrice
      ? Math.round(((activeOriginalPrice - activePrice) / activeOriginalPrice) * 100)
      : p.discountPercent || 0;

  const maxQty = Math.max(1, Math.min(activeStock, 50));

  const addToCart = async () => {
    if (!user) {
      router.push("/login?next=" + encodeURIComponent(pathname));
      return false;
    }
    if (activeStock <= 0) {
      toast(`Màu ${activeColor?.name || ""} hiện đã hết hàng, vui lòng chọn màu khác!`, "warn");
      return false;
    }
    try {
      const targetProductId = currentVer?.productId || p.id;
      await api("/api/cart/items", { method: "POST", body: { productId: targetProductId, quantity: qty } });
      await refreshCart();
      toast(`Đã thêm ${p.name} - Màu ${activeColor?.name || p.color} (${qty} chiếc) vào giỏ hàng`, "ok");
      return true;
    } catch (e) {
      toast(e.message, "error");
      return false;
    }
  };

  const specs = [
    ["Màn hình", p.screen],
    ["Chip", p.chip],
    ["RAM", currentVer?.ram || p.ram],
    ["Bộ nhớ", currentVer?.storage || p.storage],
    ["Camera", p.camera],
    ["Pin", p.battery],
    ["Màu sắc", activeColor?.name || p.color],
    ["Hãng", p.brandName],
    ["Phân khúc", p.categoryName],
  ].filter(([, v]) => v);

  return (
    <div className="pb-16 pt-2">
      {/* 1. BREADCRUMB kiểu CellphoneS */}
      <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-ink-3">
        <Link href="/" className="hover:text-ink">Trang chủ</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-ink">Điện thoại</Link>
        <span>/</span>
        <span className="text-ink-2 font-medium">{p.brandName}</span>
        <span>/</span>
        <span className="text-ink font-semibold truncate max-w-xs">{p.name}</span>
      </nav>

      {/* 2. TIÊU ĐỀ VÀ THANH ĐÁNH GIÁ NHANH */}
      <div className="border-b border-line pb-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-ink">
          {p.name} {activeColor ? `- ${activeColor.name}` : ""}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs md:text-sm text-ink-3">
          <span className="flex items-center gap-1 text-amber-500 font-bold">
            ★ 5.0 <span className="text-ink-3 font-normal">(25 đánh giá)</span>
          </span>
          <span className="text-line">|</span>
          <span className="tabular-nums">Đã bán {p.soldCount}</span>
          <span className="text-line">|</span>
          <span className="cursor-pointer hover:text-price flex items-center gap-1">
            <svg className="w-4 h-4 text-price" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            Yêu thích
          </span>
          <span className="text-line">|</span>
          <a href="#specs-table" className="cursor-pointer hover:text-ink">Thông số kỹ thuật</a>
        </div>
      </div>

      {/* 3. KHỐI NỘI DUNG CHÍNH (ẢNH BÊN TRÁI - PHÂN LOẠI & MUA HÀNG BÊN PHẢI) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CỘT TRÁI: ẢNH VÀ CAM KẾT CHẤT LƯỢNG */}
        <div className="lg:col-span-5">
          <div className="relative sticky top-20">
            <div className="overflow-hidden rounded-2xl border border-line bg-surface p-4 shadow-sm">
              <ProductImage
                key={activeImage}
                src={activeImage}
                alt={`${activeProduct.name} ${activeColor?.name || ""}`}
                className="w-full aspect-square object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Dải thumbnail xem trước theo từng màu sắc */}
            {variantData?.colors?.length > 1 && (
              <div className="mt-3 flex items-center justify-center gap-2 overflow-x-auto py-1">
                {variantData.colors.map((c) => {
                  const isSelected = activeColor?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      title={`Xem màu: ${c.name}`}
                      className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border-2 p-1 transition-all ${
                        isSelected
                          ? "border-[#D70018] ring-2 ring-red-100 shadow-sm scale-105"
                          : "border-line bg-paper opacity-70 hover:opacity-100 hover:border-red-200"
                      }`}
                    >
                      <ProductImage
                        src={c.imageUrl || p.imageUrl}
                        alt={c.name}
                        className="h-full w-full object-contain"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Khối cam kết sản phẩm CellphoneS */}
            <div className="mt-5 rounded-xl border border-line bg-surface p-4 text-xs space-y-2.5">
              <div className="font-bold text-sm text-ink mb-2">Thông tin & Cam kết chính hãng</div>
              <div className="flex items-start gap-2.5 text-ink-2">
                <span className="text-base leading-none">📦</span>
                <span>Bộ sản phẩm gồm: Hộp, Sách hướng dẫn, Cây lấy SIM, Cáp sạc Type-C.</span>
              </div>
              <div className="flex items-start gap-2.5 text-ink-2">
                <span className="text-base leading-none">🛡️</span>
                <span>Bảo hành chính hãng 12 tháng tại trung tâm bảo hành ủy quyền toàn quốc.</span>
              </div>
              <div className="flex items-start gap-2.5 text-ink-2">
                <span className="text-base leading-none">🔄</span>
                <span>1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất.</span>
              </div>
              <div className="flex items-start gap-2.5 text-ink-2">
                <span className="text-base leading-none">🚚</span>
                <span>Giao hàng miễn phí toàn quốc cho đơn hàng từ 300.000đ.</span>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: GIÁ - PHIÊN BẢN - MÀU SẮC - MUA HÀNG */}
        <div className="lg:col-span-7 space-y-5">
          {/* A. KHỐI GIÁ VÀ TRẢ GÓP KIỂU CELLPHONES */}
          <div className="rounded-xl border border-red-200 bg-red-50/40 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div className="flex flex-wrap items-baseline gap-2.5">
                <span className="text-3xl font-extrabold text-[#D70018] tabular-nums">
                  {vnd(activePrice)}
                </span>
                {activeDiscount > 0 && (
                  <>
                    <span className="text-sm text-ink-3 line-through tabular-nums">
                      {vnd(activeOriginalPrice)}
                    </span>
                    <span className="rounded bg-[#D70018] px-2 py-0.5 text-xs font-bold text-white tabular-nums">
                      -{activeDiscount}%
                    </span>
                  </>
                )}
              </div>
              <div className="text-xs text-ink-2 font-medium">
                Hoặc trả góp <strong className="text-[#D70018]">{vnd(Math.round(activePrice / 12))}/tháng</strong>
                <span className="text-ink-3 block text-[11px]">(Kỳ hạn 12 tháng, 0% lãi suất)</span>
              </div>
            </div>

            {/* Thẻ ưu đãi học sinh sinh viên & Smember */}
            <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-t border-red-100 pt-3">
              <div className="flex items-center gap-2 rounded-lg bg-surface border border-red-100 p-2">
                <span className="text-base">🎓</span>
                <div className="leading-tight">
                  <span className="font-semibold text-ink">HSSV, Giáo viên</span>
                  <div className="text-ink-3 text-[11px]">Giảm thêm đến 500.000đ</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-surface border border-red-100 p-2">
                <span className="text-base">👑</span>
                <div className="leading-tight">
                  <span className="font-semibold text-ink">Thành viên Smember</span>
                  <div className="text-ink-3 text-[11px]">Giảm thêm 1% tối đa 300.000đ</div>
                </div>
              </div>
            </div>
          </div>

          {/* B. PHÂN LOẠI 1: PHIÊN BẢN (STORAGE / MODELS) KIỂU CELLPHONES */}
          {variantData && variantData.versions?.length > 0 && (
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-sm font-bold text-ink">Phiên bản</span>
                <span className="text-xs text-ink-3">{variantData.versions.length} lựa chọn</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {variantData.versions.map((ver) => {
                  const isActive = ver.id === selectedVersionId;
                  return (
                    <button
                      key={ver.id}
                      type="button"
                      onClick={() => {
                        setSelectedVersionId(ver.id);
                        // Nếu phiên bản là sản phẩm khác trong DB thì chuyển trang
                        if (ver.productId && ver.productId !== p.id) {
                          router.push(`/products/${ver.productId}`);
                        }
                      }}
                      className={`relative flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all ${
                        isActive
                          ? "border-2 border-[#D70018] bg-red-50/20 text-[#D70018] font-bold shadow-sm"
                          : "border border-line bg-surface text-ink hover:border-red-300"
                      }`}
                    >
                      {/* Dấu tích đỏ CellphoneS ở góc trên */}
                      {isActive && (
                        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#D70018] text-[9px] font-bold text-white shadow-xs">
                          ✓
                        </span>
                      )}
                      <span className="text-sm leading-snug">{ver.label}</span>
                      <span className="mt-1 text-xs text-ink-3 font-normal tabular-nums">
                        {vnd(ver.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* C. PHÂN LOẠI 2: MÀU SẮC (COLORS) KIỂU CELLPHONES VỚI THUMBNAIL, GIÁ VÀ TỒN KHO RIÊNG */}
          {variantData && variantData.colors?.length > 0 && (
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-sm font-bold text-ink">
                  Màu sắc: <span className="font-semibold text-[#D70018]">{activeColor?.name || p.color}</span>
                </span>
                <span className="text-xs text-ink-3">{variantData.colors.length} màu</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {variantData.colors.map((c) => {
                  const isActive = activeColor?.id === c.id;
                  const colorPrice = Math.max(500000, verBasePrice + (c.priceDiff || 0));
                  const isOut = c.stock <= 0;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`relative flex items-center gap-2.5 rounded-xl p-2.5 text-left transition-all ${
                        isActive
                          ? "border-2 border-[#D70018] bg-red-50/20 shadow-sm"
                          : isOut
                            ? "border border-line bg-surface/60 opacity-60 hover:opacity-100"
                            : "border border-line bg-surface hover:border-red-300"
                      }`}
                    >
                      {/* Dấu tích đỏ CellphoneS ở góc trên */}
                      {isActive && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D70018] text-[9px] font-bold text-white shadow-xs">
                          ✓
                        </span>
                      )}

                      {/* Thumbnail nhỏ ảnh điện thoại */}
                      <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg border border-line bg-paper grid place-items-center">
                        <ProductImage
                          src={c.imageUrl || p.imageUrl}
                          alt={c.name}
                          className="h-full w-full object-contain p-0.5"
                        />
                      </div>

                      {/* Tên màu, giá và số lượng tồn kho riêng */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs font-semibold truncate ${isActive ? "text-[#D70018]" : "text-ink"}`}>
                            {c.name}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${
                            isOut
                              ? "bg-slate-200 text-slate-500"
                              : c.stock <= 5
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {isOut ? "Hết" : `Còn ${c.stock}`}
                          </span>
                        </div>
                        <div className="text-[11px] text-ink-3 tabular-nums mt-0.5 font-medium">
                          {vnd(colorPrice)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* D. TRẠNG THÁI KHO VÀ SỐ LƯỢNG THEO MÀU ĐƯỢC CHỌN */}
          <div className="flex items-center justify-between text-xs py-1">
            <span className={activeStock > 0 ? "text-ink-2 font-medium" : "font-bold text-price"}>
              {activeStock > 0 ? (
                <>
                  Tình trạng: Màu <strong className="text-ink">{activeColor?.name || p.color}</strong> còn <strong className="text-emerald-600 tabular-nums">{activeStock}</strong> sản phẩm trong kho
                </>
              ) : (
                <>
                  Tình trạng: Màu <strong className="text-price">{activeColor?.name || p.color}</strong> hiện tạm hết hàng
                </>
              )}
            </span>
            {activeStock > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-ink-3">Số lượng:</span>
                <div className="inline-flex overflow-hidden rounded-lg border border-line bg-surface">
                  <button
                    type="button"
                    aria-label="Giảm"
                    className="w-8 h-8 grid place-items-center bg-paper text-ink hover:bg-line text-sm font-bold"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    -
                  </button>
                  <input
                    aria-label="Số lượng"
                    type="number"
                    min="1"
                    max={maxQty}
                    value={qty}
                    onChange={(e) => setQty(Math.min(maxQty, Math.max(1, +e.target.value || 1)))}
                    className="w-10 h-8 bg-surface text-center tabular-nums text-xs font-semibold focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label="Tăng"
                    className="w-8 h-8 grid place-items-center bg-paper text-ink hover:bg-line text-sm font-bold"
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* E. CỤM NÚT MUA HÀNG PHONG CÁCH CELLPHONES */}
          {activeStock > 0 ? (
            <div className="space-y-2.5 pt-2">
              <div className="flex gap-2.5">
                {/* NÚT MUA NGAY LỚN MÀU ĐỎ */}
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await addToCart();
                    if (ok) router.push("/cart");
                  }}
                  className="flex-1 rounded-xl bg-[#D70018] py-3 px-4 text-center text-white transition-all hover:bg-[#B70014] active:scale-[0.99] shadow-sm"
                >
                  <span className="block text-base font-extrabold uppercase tracking-wide">MUA NGAY</span>
                  <span className="block text-[11px] opacity-90 font-normal">Giao tận nơi hoặc nhận tại cửa hàng</span>
                </button>

                {/* NÚT THÊM VÀO GIỎ HÀNG */}
                <button
                  type="button"
                  onClick={async () => {
                    await addToCart();
                  }}
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-[#D70018] px-4 py-2 text-[#D70018] transition-all hover:bg-red-50 active:scale-[0.99]"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap">Thêm vào giỏ</span>
                </button>
              </div>

              {/* 2 Nút Trả Góp và Thu Cũ Đổi Mới */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await addToCart();
                    if (ok) router.push("/checkout");
                  }}
                  className="rounded-xl border border-line bg-surface py-2.5 px-3 text-center transition-all hover:border-ink-3"
                >
                  <span className="block text-xs font-bold text-ink uppercase">TRẢ GÓP 0%</span>
                  <span className="block text-[10px] text-ink-3">Duyệt hồ sơ nhanh qua điện thoại</span>
                </button>
                <button
                  type="button"
                  onClick={() => toast("Chương trình thu cũ đổi mới: Trợ giá lên tới 2.000.000đ khi mang máy cũ tới shop!")}
                  className="rounded-xl border border-line bg-surface py-2.5 px-3 text-center transition-all hover:border-ink-3"
                >
                  <span className="block text-xs font-bold text-ink uppercase">THU CŨ LÊN ĐỜI</span>
                  <span className="block text-[10px] text-ink-3">Trợ giá thêm đến 2.000.000đ</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 pt-2">
              <div className="rounded-xl bg-slate-100 border border-slate-200 p-4 text-center">
                <div className="text-sm font-bold text-slate-700">MÀU NÀY TẠM THỜI HẾT HÀNG</div>
                <div className="text-xs text-slate-500 mt-1">Vui lòng chọn màu khác còn hàng ở trên để đặt mua ngay</div>
              </div>
            </div>
          )}

          {/* F. BẢNG THÔNG SỐ KỸ THUẬT RÚT GỌN */}
          <div id="specs-table" className="pt-4">
            <h2 className="text-base font-bold text-ink mb-2">Thông số kỹ thuật</h2>
            <div className="overflow-hidden rounded-xl border border-line bg-surface">
              <table className="w-full border-collapse text-xs">
                <tbody>
                  {specs.map(([k, v], idx) => (
                    <tr key={k} className={idx % 2 === 0 ? "bg-paper/40" : "bg-surface"}>
                      <td className="w-1/3 border-b border-line px-3 py-2 text-ink-3 font-medium">{k}</td>
                      <td className="border-b border-line px-3 py-2 font-semibold text-ink">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {p.description && (
            <div className="rounded-xl border border-line bg-surface p-4 text-xs text-ink-2 leading-relaxed">
              <div className="font-bold text-ink mb-1.5">Mô tả sản phẩm</div>
              {p.description}
            </div>
          )}
        </div>
      </div>

      {/* 4. THANH MUA NHANH CỐ ĐỊNH (STICKY BOTTOM BAR) KIỂU CELLPHONES */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md px-4 py-2.5 shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-line bg-paper grid place-items-center">
              <ProductImage src={activeImage} alt={activeProduct.name} className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-bold text-ink">
                {activeProduct.name} - {activeColor?.name || p.color}
              </div>
              <div className="text-sm font-extrabold text-[#D70018] tabular-nums">
                {vnd(activePrice)}
                {activeDiscount > 0 && (
                  <span className="ml-2 text-xs font-normal text-ink-3 line-through">
                    {vnd(activeOriginalPrice)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                const ok = await addToCart();
                if (ok) toast(`Đã thêm vào giỏ hàng`);
              }}
              className="hidden sm:inline-flex rounded-lg border border-[#D70018] px-3.5 py-2 text-xs font-bold text-[#D70018] hover:bg-red-50"
            >
              Thêm vào giỏ
            </button>
            <button
              type="button"
              onClick={async () => {
                const ok = await addToCart();
                if (ok) router.push("/cart");
              }}
              className="rounded-lg bg-[#D70018] px-5 py-2 text-xs font-bold text-white hover:bg-[#B70014] shadow-xs"
            >
              MUA NGAY
            </button>
          </div>
        </div>
      </div>

      {/* 5. KHỐI ĐÁNH GIÁ (REVIEWS) */}
      <Reviews productId={p.id} />
    </div>
  );
}

function Reviews({ productId }) {
  const { user, isStaff } = useAuth();
  const toast = useToast();
  const [page, setPage] = useState(0);
  const { data, reload } = useLoad(() => api(`/api/products/${productId}/comments`, { query: { page, size: 5 } }), [productId, page]);

  const submit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    try {
      await api(`/api/products/${productId}/comments`, { method: "POST", body: { rating: +f.get("rating"), content: f.get("content").trim() } });
      toast("Đã gửi đánh giá");
      form.reset();
      setPage(0);
      reload();
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const remove = async (id) => {
    if (!confirm("Xóa đánh giá này?")) return;
    try {
      await api("/api/comments/" + id, { method: "DELETE" });
      reload();
    } catch (err) {
      toast(err.message, "error");
    }
  };

  return (
    <section className="panel mb-10 mt-10">
      <h2 className="mb-1 text-xl font-bold">Đánh giá sản phẩm</h2>
      <p className="mb-4 text-ink-3 text-sm">
        {data?.averageRating
          ? `${data.averageRating.toFixed(1)} ★ trên ${data.page.totalElements} lượt đánh giá`
          : "Chưa có đánh giá nào cho sản phẩm này."}
      </p>
      {user && (
        <form onSubmit={submit} className="mb-6 rounded-xl border border-line bg-paper/50 p-4">
          <label className="label" htmlFor="rt">
            Chọn số sao
          </label>
          <select id="rt" name="rating" className="input mb-3 max-w-44 text-amber-500 font-bold">
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {"★".repeat(n)} ({n} sao)
              </option>
            ))}
          </select>
          <label className="label" htmlFor="rc">
            Nhận xét của bạn
          </label>
          <textarea id="rc" name="content" rows={3} maxLength={1000} required placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..." className="input mb-3" />
          <div className="flex items-center gap-3">
            <button className="btn btn-primary">Gửi đánh giá</button>
            <span className="text-xs text-ink-3">Chỉ khách đã mua và nhận hàng mới gửi được đánh giá.</span>
          </div>
        </form>
      )}
      {data?.page.content.map((c) => (
        <div key={c.id} className="border-t border-line py-3.5">
          <strong>{c.userName}</strong> <span className="tracking-widest text-[#E9A90A]">{"★".repeat(c.rating)}</span>{" "}
          <span className="text-[13px] text-ink-3">{fmtDate(c.createdAt)}</span>
          {user && (user.id === c.userId || isStaff) && (
            <button className="btn btn-sm btn-danger float-right" onClick={() => remove(c.id)}>
              Xóa
            </button>
          )}
          <p className="mt-1.5 text-sm">{c.content}</p>
        </div>
      ))}
      <Pager data={data?.page} onChange={setPage} />
    </section>
  );
}
