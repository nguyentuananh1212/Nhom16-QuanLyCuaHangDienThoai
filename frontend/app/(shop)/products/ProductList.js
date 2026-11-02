"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { ProductGrid } from "@/components/ProductCard";
import { Loading, Pager, useLoad } from "@/components/ui";
import { getSeriesForBrand, FEATURED_SERIES } from "@/lib/seriesConfig";

const SORTS = [["", "Mới nhất"], ["best_selling", "Bán chạy"], ["most_viewed", "Xem nhiều"], ["price_asc", "Giá tăng dần"], ["price_desc", "Giá giảm dần"]];

export default function ProductList() {
  const router = useRouter();
  const sp = useSearchParams();
  const q = Object.fromEntries(sp.entries());
  const key = sp.toString();

  const meta = useLoad(() => Promise.all([api("/api/brands"), api("/api/categories")]), []);
  const list = useLoad(() => api("/api/products", { query: { ...q, size: 12 } }), [key]);

  const push = (obj) => {
    Object.keys(obj).forEach((k) => (obj[k] === "" || obj[k] == null) && delete obj[k]);
    router.push("/products?" + new URLSearchParams(obj));
  };
  const onFilter = (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    if (!f.onSale) delete f.onSale;
    push({ ...f, page: 0 });
  };

  const [brands, cats] = meta.data || [[], []];
  const selectedBrand = brands.find((b) => String(b.id) === String(q.brandId));
  const brandSeries = selectedBrand ? getSeriesForBrand(selectedBrand) : [];

  return (
    <div className="my-6 mb-12 grid grid-cols-[240px_1fr] gap-6 max-md:grid-cols-1">
      {/* key: khi URL đổi (bấm link khác) form được tạo lại với giá trị mới */}
      <form key={key} onSubmit={onFilter} className="panel self-start p-4 md:sticky md:top-20">
        <label className="label" htmlFor="kw">Từ khoá</label>
        <input id="kw" name="keyword" className="input mb-3.5" defaultValue={q.keyword || ""} placeholder="Tên máy hoặc dòng..." />
        
        <label className="label" htmlFor="br">Hãng</label>
        <select
          id="br"
          name="brandId"
          className="input mb-3.5"
          defaultValue={q.brandId || ""}
          onChange={(e) => push({ ...q, brandId: e.target.value, keyword: "", page: 0 })}
        >
          <option value="">Tất cả</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>

        {/* Lựa chọn dòng con của hãng đã chọn */}
        {brandSeries.length > 0 && (
          <>
            <label className="label" htmlFor="sr">Dòng máy ({selectedBrand.name})</label>
            <select
              id="sr"
              name="keyword"
              className="input mb-3.5 bg-blue-50/50 border-blue-200 font-medium text-blue-900"
              defaultValue={q.keyword || ""}
              onChange={(e) => push({ ...q, keyword: e.target.value, page: 0 })}
            >
              <option value="">Tất cả dòng {selectedBrand.name}</option>
              {brandSeries.map((s) => (
                <option key={s.id} value={s.keyword}>
                  {s.name} ({s.badge})
                </option>
              ))}
            </select>
          </>
        )}

        <label className="label" htmlFor="ct">Phân khúc</label>
        <select id="ct" name="categoryId" className="input mb-3.5" defaultValue={q.categoryId || ""}>
          <option value="">Tất cả</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <span className="label">Khoảng giá (₫)</span>
        <div className="mb-3.5 grid grid-cols-2 gap-2">
          <input name="minPrice" type="number" min="0" step="500000" placeholder="Từ" aria-label="Giá từ" className="input" defaultValue={q.minPrice || ""} />
          <input name="maxPrice" type="number" min="0" step="500000" placeholder="Đến" aria-label="Giá đến" className="input" defaultValue={q.maxPrice || ""} />
        </div>
        <label className="mb-3.5 flex items-center gap-2">
          <input type="checkbox" name="onSale" value="true" defaultChecked={q.onSale === "true"} /> Chỉ hàng giảm giá
        </label>
        <label className="label" htmlFor="st">Sắp xếp</label>
        <select id="st" name="sort" className="input mb-3.5" defaultValue={q.sort || ""}>
          {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button className="btn btn-primary w-full">Lọc sản phẩm</button>
      </form>
      <div>
        {/* THANH CHỌN DÒNG MÁY (SERIES) TRỰC QUAN BẰNG NÚT CHIPS */}
        <div className="mb-5 rounded-2xl border border-line bg-surface p-3.5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
                {selectedBrand ? `Dòng máy của ${selectedBrand.name}` : "Dòng máy nổi bật"}
              </span>
              {q.keyword && (
                <button
                  type="button"
                  onClick={() => push({ ...q, keyword: "", page: 0 })}
                  className="rounded-md bg-red-50 text-red-600 px-2 py-0.5 text-[11px] font-semibold hover:bg-red-100 transition-colors"
                >
                  Xoá lọc: "{q.keyword}" ✕
                </button>
              )}
            </div>
            {selectedBrand && (
              <button
                type="button"
                onClick={() => push({ ...q, brandId: "", keyword: "", page: 0 })}
                className="text-xs text-accent hover:underline font-semibold"
              >
                ← Xem tất cả các hãng
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Khi đã chọn hãng: Hiện các dòng Series con của hãng đó */}
            {selectedBrand ? (
              <>
                <button
                  type="button"
                  onClick={() => push({ ...q, keyword: "", page: 0 })}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    !q.keyword
                      ? "bg-accent text-white shadow-sm"
                      : "bg-paper text-ink hover:bg-slate-200"
                  }`}
                >
                  Tất cả {selectedBrand.name}
                </button>
                {brandSeries.map((s) => {
                  const isActive = q.keyword?.toLowerCase() === s.keyword.toLowerCase();
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => push({ ...q, keyword: s.keyword, page: 0 })}
                      className={`group flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                        isActive
                          ? "bg-accent text-white shadow-sm ring-2 ring-accent/30"
                          : "bg-paper text-ink hover:bg-slate-200"
                      }`}
                      title={s.desc}
                    >
                      <span>{s.name}</span>
                      {s.badge && (
                        <span
                          className={`rounded px-1.5 py-0.2 text-[10px] font-semibold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-accent/10 text-accent group-hover:bg-accent/20"
                          }`}
                        >
                          {s.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </>
            ) : (
              /* Khi chưa chọn hãng: Hiện các Series tiêu biểu của các hãng */
              <>
                <button
                  type="button"
                  onClick={() => push({ ...q, brandId: "", keyword: "", page: 0 })}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    !q.brandId && !q.keyword
                      ? "bg-accent text-white shadow-sm"
                      : "bg-paper text-ink hover:bg-slate-200"
                  }`}
                >
                  Tất cả dòng máy
                </button>
                {FEATURED_SERIES.map((s) => {
                  const isActive =
                    String(q.brandId) === String(s.brandId) &&
                    q.keyword?.toLowerCase() === s.keyword.toLowerCase();
                  return (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => push({ ...q, brandId: s.brandId, keyword: s.keyword, page: 0 })}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                        isActive
                          ? "bg-accent text-white shadow-sm ring-2 ring-accent/30"
                          : "bg-paper text-ink hover:bg-slate-200"
                      }`}
                    >
                      <span className="text-ink-3 font-normal">{s.brandName}</span>
                      <span>{s.name}</span>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {list.loading && <Loading />}
        {list.error && <p className="py-12 text-center text-price">{list.error.message}</p>}
        {list.data && (
          <>
            <p className="mb-4 text-ink-3">{list.data.totalElements} sản phẩm</p>
            <ProductGrid items={list.data.content} />
            <Pager data={list.data} onChange={(p) => push({ ...q, page: p })} />
          </>
        )}
      </div>
    </div>
  );
}
