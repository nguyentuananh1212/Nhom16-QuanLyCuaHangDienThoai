"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { vnd } from "@/lib/format";
import { useToast } from "@/components/Providers";
import AdminHead from "@/components/AdminHead";
import { Loading, Modal, ProductImage, useLoad } from "@/components/ui";

const COST_STORAGE_KEY = "phoneshop_cost_prices";

// Tỷ lệ giá vốn mặc định (ước tính 78% giá niêm yết nếu chưa nhập giá vốn riêng)
const DEFAULT_COST_RATIO = 0.78;

export default function AdminInventory() {
  const toast = useToast();
  const [filterType, setFilterType] = useState("all"); // all, low_stock, out_stock, top_profit
  const [brandFilter, setBrandFilter] = useState("");
  const [editingCostProduct, setEditingCostProduct] = useState(null); // Sửa giá nhập
  const [stockingProduct, setStockingProduct] = useState(null); // Nhập thêm hàng vào kho

  // Tải danh sách tất cả sản phẩm và hãng
  const { data: productsData, loading, reload } = useLoad(
    () => api("/api/admin/products", { query: { size: 100 } }),
    []
  );
  const { data: brands } = useLoad(() => api("/api/brands"), []);

  // Đọc danh sách giá nhập tùy chỉnh từ localStorage (fallback)
  const [costPrices, setCostPrices] = useState({});
  const [savingCost, setSavingCost] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(COST_STORAGE_KEY);
      if (saved) setCostPrices(JSON.parse(saved));
    } catch {}
  }, []);

  const saveCostPrice = async (productId, newCost) => {
    setSavingCost(true);
    try {
      // Cập nhật giá nhập vào trực tiếp vào Database thông qua API
      await api(`/api/admin/products/${productId}/cost-price`, {
        method: "PATCH",
        body: { costPrice: Number(newCost) },
      });

      const updated = { ...costPrices, [productId]: Number(newCost) };
      setCostPrices(updated);
      try {
        localStorage.setItem(COST_STORAGE_KEY, JSON.stringify(updated));
      } catch {}

      toast("Đã cập nhật giá nhập vào trực tiếp vào Database thành công!", "ok");
      reload();
      setEditingCostProduct(null);
    } catch (err) {
      toast("Lỗi cập nhật giá nhập vào: " + err.message, "error");
    } finally {
      setSavingCost(false);
    }
  };

  const products = productsData?.content || [];

  // Tính toán số liệu kho và lợi nhuận cho từng sản phẩm
  const enrichedProducts = products.map((p) => {
    const sellPrice = Number(p.effectivePrice) || Number(p.price) || 0;
    // Giá nhập: ưu tiên đọc trực tiếp từ Database (p.costPrice), sau đó tới cấu hình riêng hoặc 78% giá bán
    const costPrice = p.costPrice != null
      ? Number(p.costPrice)
      : (costPrices[p.id] !== undefined ? costPrices[p.id] : Math.round(Number(p.price) * DEFAULT_COST_RATIO));
    const profitPerUnit = Math.max(0, sellPrice - costPrice);
    const profitMargin = sellPrice > 0 ? Math.round((profitPerUnit / sellPrice) * 100) : 0;
    const sold = Number(p.soldCount) || 0;
    const stock = Number(p.stock) || 0;
    const totalRevenue = sold * sellPrice;
    const totalCostOfSold = sold * costPrice;
    const totalProfit = sold * profitPerUnit;
    const totalStockValue = stock * costPrice;

    return {
      ...p,
      sellPrice,
      costPrice,
      profitPerUnit,
      profitMargin,
      totalRevenue,
      totalCostOfSold,
      totalProfit,
      totalStockValue,
    };
  });

  // Lọc sản phẩm
  const filteredProducts = enrichedProducts.filter((p) => {
    if (brandFilter && String(p.brandId) !== String(brandFilter)) return false;
    if (filterType === "low_stock") return p.stock > 0 && p.stock <= 5;
    if (filterType === "out_stock") return p.stock <= 0;
    return true;
  });

  // Sắp xếp nếu chọn top_profit
  if (filterType === "top_profit") {
    filteredProducts.sort((a, b) => b.totalProfit - a.totalProfit);
  }

  // TỔNG HỢP TOÀN BỘ CHỈ SỐ KINH DOANH VÀ KHO
  const totalRevenue = enrichedProducts.reduce((sum, p) => sum + p.totalRevenue, 0);
  const totalCost = enrichedProducts.reduce((sum, p) => sum + p.totalCostOfSold, 0);
  const totalProfit = enrichedProducts.reduce((sum, p) => sum + p.totalProfit, 0);
  const totalStockUnits = enrichedProducts.reduce((sum, p) => sum + p.stock, 0);
  const totalStockValue = enrichedProducts.reduce((sum, p) => sum + p.totalStockValue, 0);
  const overallMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0";
  const lowStockCount = enrichedProducts.filter((p) => p.stock <= 5).length;

  return (
    <>
      <AdminHead title="Quản lý Kho & Doanh Thu - Lợi Nhuận" />

      {/* 1. KHỐI CÁC THẺ KPI DOANH THU & LỢI NHUẬN HOÀNH TRÁNG */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* THẺ DOANH THU */}
        <div className="panel border-l-4 border-l-blue-500 bg-surface">
          <div className="flex items-center justify-between text-xs text-ink-3 mb-1 font-semibold">
            <span>TỔNG DOANH THU ĐÃ BÁN</span>
            <span className="text-blue-500 text-base">💰</span>
          </div>
          <div className="text-2xl font-black text-ink tabular-nums">{vnd(totalRevenue)}</div>
          <div className="mt-1 text-[11px] text-ink-3">Tổng giá trị đơn hàng đã hoàn tất</div>
        </div>

        {/* THẺ GIÁ VỐN */}
        <div className="panel border-l-4 border-l-amber-500 bg-surface">
          <div className="flex items-center justify-between text-xs text-ink-3 mb-1 font-semibold">
            <span>TỔNG TIỀN VỐN HÀNG ĐÃ BÁN</span>
            <span className="text-amber-500 text-base">📦</span>
          </div>
          <div className="text-2xl font-black text-ink tabular-nums">{vnd(totalCost)}</div>
          <div className="mt-1 text-[11px] text-ink-3">Tiền nhập hàng của số máy đã bán</div>
        </div>

        {/* THẺ LỢI NHUẬN RÒNG (LÃI THỰC TẾ) */}
        <div className="panel border-l-4 border-l-emerald-500 bg-emerald-50/20">
          <div className="flex items-center justify-between text-xs text-emerald-700 mb-1 font-bold">
            <span>TỔNG LỢI NHUẬN THU VỀ</span>
            <span className="text-emerald-600 text-base">📈</span>
          </div>
          <div className="text-2xl font-black text-emerald-600 tabular-nums">+{vnd(totalProfit)}</div>
          <div className="mt-1 text-[11px] text-emerald-700 font-semibold">
            Biên lợi nhuận ròng: <strong className="text-emerald-800">{overallMargin}%</strong>
          </div>
        </div>

        {/* THẺ TỒN KHO & TIỀN VỐN TỒN */}
        <div className="panel border-l-4 border-l-purple-500 bg-surface">
          <div className="flex items-center justify-between text-xs text-ink-3 mb-1 font-semibold">
            <span>VỐN HÀNG TỒN TRONG KHO</span>
            <span className="text-purple-500 text-base">🏢</span>
          </div>
          <div className="text-2xl font-black text-purple-600 tabular-nums">{vnd(totalStockValue)}</div>
          <div className="mt-1 text-[11px] text-ink-3">
            Hiện còn <strong className="text-ink font-bold">{totalStockUnits} máy</strong> trong kho ({lowStockCount} máy sắp hết)
          </div>
        </div>
      </div>

      {/* 2. THANH BỘ LỌC THÔNG MINH */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`btn btn-sm ${filterType === "all" ? "btn-primary" : ""}`}
          >
            Tất cả ({enrichedProducts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("top_profit")}
            className={`btn btn-sm ${filterType === "top_profit" ? "btn-primary" : ""}`}
          >
            Lãi nhiều nhất 🔥
          </button>
          <button
            type="button"
            onClick={() => setFilterType("low_stock")}
            className={`btn btn-sm ${filterType === "low_stock" ? "border-amber-500 bg-amber-50 text-amber-700 font-bold" : ""}`}
          >
            Sắp hết hàng (≤ 5)
          </button>
          <button
            type="button"
            onClick={() => setFilterType("out_stock")}
            className={`btn btn-sm ${filterType === "out_stock" ? "border-red-500 bg-red-50 text-price font-bold" : ""}`}
          >
            Đã hết hàng (0)
          </button>
        </div>

        {brands && (
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="input w-auto text-xs py-1.5"
          >
            <option value="">-- Lọc theo tất cả Hãng --</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 3. BẢNG CHI TIẾT GIÁ NHẬP - GIÁ BÁN - LỢI NHUẬN CỦA TỪNG MÁY */}
      {loading ? (
        <Loading />
      ) : (
        <div className="panel overflow-x-auto p-0">
          <table className="data-table">
            <thead>
              <tr className="bg-paper/60">
                <th className="py-3 px-3">Sản phẩm</th>
                <th>Hãng</th>
                <th className="text-right">Giá nhập vào (Giá vốn)</th>
                <th className="text-right">Giá bán ra</th>
                <th className="text-right">Lãi / 1 máy</th>
                <th className="text-center">Tỷ suất lãi</th>
                <th className="text-center">Tồn kho</th>
                <th className="text-center">Đã bán</th>
                <th className="text-right">Tổng Lãi đã thu</th>
                <th className="text-right">Thao tác kho</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const isCustomCost = p.costPrice != null || costPrices[p.id] !== undefined;
                return (
                  <tr key={p.id} className="hover:bg-paper/30 transition-colors">
                    {/* Sản phẩm */}
                    <td className="py-2.5 px-3 min-w-[220px]">
                      <div className="flex items-center gap-2.5">
                        <ProductImage src={p.imageUrl} alt={p.name} className="w-10 h-10 flex-shrink-0 rounded-lg" />
                        <div>
                          <div className="font-semibold text-ink text-xs line-clamp-1">{p.name}</div>
                          <div className="text-[11px] text-ink-3">Tồn vốn: {vnd(p.totalStockValue)}</div>
                        </div>
                      </div>
                    </td>

                    {/* Hãng */}
                    <td className="text-xs">{p.brandName}</td>

                    {/* Giá nhập vào (có nút sửa nhanh) */}
                    <td className="text-right tabular-nums text-xs">
                      <div className="font-bold text-amber-700">{vnd(p.costPrice)}</div>
                      <button
                        type="button"
                        onClick={() => setEditingCostProduct(p)}
                        className="text-[10px] text-accent hover:underline inline-block mt-0.5"
                      >
                        {isCustomCost ? "Sửa giá vốn" : "Tự đặt giá vốn"}
                      </button>
                    </td>

                    {/* Giá bán ra */}
                    <td className="text-right tabular-nums text-xs font-semibold text-ink">
                      {vnd(p.sellPrice)}
                    </td>

                    {/* Lãi trên 1 máy */}
                    <td className="text-right tabular-nums text-xs font-bold text-emerald-600">
                      +{vnd(p.profitPerUnit)}
                    </td>

                    {/* Tỷ suất lãi */}
                    <td className="text-center text-xs font-bold tabular-nums">
                      <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 border border-emerald-200">
                        {p.profitMargin}%
                      </span>
                    </td>

                    {/* Tồn kho */}
                    <td className="text-center tabular-nums text-xs">
                      <span
                        className={`inline-block font-extrabold px-2 py-0.5 rounded ${
                          p.stock <= 0
                            ? "bg-red-100 text-price"
                            : p.stock <= 5
                            ? "bg-amber-100 text-amber-800"
                            : "text-ink"
                        }`}
                      >
                        {p.stock} máy
                      </span>
                    </td>

                    {/* Đã bán */}
                    <td className="text-center tabular-nums text-xs font-semibold text-ink">
                      {p.soldCount} máy
                    </td>

                    {/* Tổng lãi đã thu */}
                    <td className="text-right tabular-nums text-sm font-black text-emerald-600">
                      +{vnd(p.totalProfit)}
                    </td>

                    {/* Thao tác kho */}
                    <td className="text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setStockingProduct(p)}
                        className="btn btn-sm text-xs font-bold text-accent hover:bg-accent-soft/30"
                      >
                        + Nhập hàng
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!filteredProducts.length && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-ink-3">
                    Không tìm thấy sản phẩm nào trong kho theo bộ lọc này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: CHỈNH SỬA GIÁ NHẬP VÀO (GIÁ VỐN) */}
      {editingCostProduct && (
        <Modal title={`Sửa giá nhập vào: ${editingCostProduct.name}`} onClose={() => setEditingCostProduct(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const val = new FormData(e.currentTarget).get("costPrice");
              saveCostPrice(editingCostProduct.id, val);
            }}
            className="space-y-4"
          >
            <div className="rounded-xl bg-paper p-3 text-xs space-y-1">
              <div>
                Giá bán hiện tại: <strong className="text-price">{vnd(editingCostProduct.sellPrice)}</strong>
              </div>
              <div className="text-ink-3">
                Lợi nhuận được tính theo công thức: <strong>Lợi nhuận = Giá bán - Giá nhập</strong>
              </div>
            </div>

            <div>
              <label className="label">Giá nhập vào (Giá vốn trên mỗi máy) (đ) *</label>
              <input
                type="number"
                name="costPrice"
                min="0"
                step="1000"
                defaultValue={editingCostProduct.costPrice}
                required
                className="input text-base font-bold text-amber-700"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-line">
              <button type="button" className="btn" onClick={() => setEditingCostProduct(null)} disabled={savingCost}>
                Hủy
              </button>
              <button className="btn btn-primary" disabled={savingCost}>
                {savingCost ? "Đang lưu vào Database..." : "Lưu giá vốn vào Database"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: NHẬP THÊM HÀNG VÀO KHO (STOCK IN) */}
      {stockingProduct && (
        <StockInModal
          product={stockingProduct}
          onClose={() => setStockingProduct(null)}
          onSuccess={() => {
            setStockingProduct(null);
            reload();
          }}
        />
      )}
    </>
  );
}

// Component Modal Nhập Hàng Vào Kho (Cập nhật số lượng tồn vào MySQL)
function StockInModal({ product: p, onClose, onSuccess }) {
  const toast = useToast();
  const [addQty, setAddQty] = useState(20);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const newStock = Number(p.stock) + Number(addQty);

    try {
      // Cập nhật tồn kho qua API PUT của backend
      await api(`/api/admin/products/${p.id}`, {
        method: "PUT",
        body: {
          name: p.name,
          price: p.price,
          salePrice: p.salePrice,
          stock: newStock,
          brandId: p.brandId,
          categoryId: p.categoryId,
          imageUrl: p.imageUrl,
          screen: p.screen,
          chip: p.chip,
          ram: p.ram,
          storage: p.storage,
          camera: p.camera,
          battery: p.battery,
          color: p.color,
          description: p.description,
          hot: p.hot,
          active: true,
        },
      });

      toast(`Đã nhập thêm +${addQty} chiếc ${p.name} vào kho thành công!`, "ok");
      onSuccess();
    } catch (err) {
      toast("Lỗi nhập hàng: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={`Nhập thêm hàng vào kho: ${p.name}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-xl bg-paper p-3.5 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-ink-3">Số lượng hiện có trong kho:</span>
            <span className="font-bold text-ink">{p.stock} máy</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-3">Giá nhập vốn hiện tại:</span>
            <span className="font-bold text-amber-700">{vnd(p.costPrice)}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-1.5">
            <span className="text-ink-3">Tổng vốn cần nhập đợt này:</span>
            <span className="font-extrabold text-price">{vnd(addQty * p.costPrice)}</span>
          </div>
        </div>

        <div>
          <label className="label">Số lượng máy nhập thêm *</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="500"
              value={addQty}
              onChange={(e) => setAddQty(Math.max(1, Number(e.target.value) || 1))}
              required
              className="input text-lg font-bold w-32 text-center"
            />
            <div className="flex gap-1.5">
              {[10, 20, 50, 100].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setAddQty(n)}
                  className="btn btn-sm text-xs font-semibold"
                >
                  +{n}
                </button>
              ))}
            </div>
          </div>
          <span className="block mt-1 text-[11px] text-ink-3">
            Sau khi nhập, tồn kho mới sẽ là: <strong>{Number(p.stock) + Number(addQty)} máy</strong>.
          </span>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-line">
          <button type="button" className="btn" onClick={onClose} disabled={submitting}>
            Hủy
          </button>
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? "Đang lưu..." : "Xác nhận nhập kho"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
