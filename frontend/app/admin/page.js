"use client";

import Link from "next/link";
import { api } from "@/lib/api";
import { vnd } from "@/lib/format";
import AdminHead from "@/components/AdminHead";
import { Empty, Loading, ProductImage, StatusTag, useLoad } from "@/components/ui";

function KpiCard({ title, value, subText, icon, color = "blue", badge }) {
  const colorMap = {
    blue: "border-l-blue-500 bg-blue-500/10 text-blue-600",
    emerald: "border-l-emerald-500 bg-emerald-500/10 text-emerald-600",
    indigo: "border-l-indigo-500 bg-indigo-500/10 text-indigo-600",
    amber: "border-l-amber-500 bg-amber-500/10 text-amber-600",
    rose: "border-l-rose-500 bg-rose-500/10 text-rose-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`w-9 h-9 rounded-xl grid place-items-center ${colorMap[color] || colorMap.blue}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className="text-2xl font-black text-slate-800 tracking-tight tabular-nums">{value}</div>
        {badge && (
          <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
            {badge}
          </span>
        )}
      </div>
      {subText && <div className="mt-1 text-xs text-slate-400 font-medium">{subText}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { data: d, loading, error } = useLoad(() => api("/api/admin/dashboard"), []);
  if (loading) return <Loading />;
  if (error) return <Empty>{error.message}</Empty>;

  const max = Math.max(1, ...d.revenueLast30Days.map((x) => Number(x.revenue)));
  // Ước tính lợi nhuận gộp (~22% doanh thu)
  const estProfit = Math.round(Number(d.totalRevenue || 0) * 0.22);

  return (
    <div className="space-y-6">
      <AdminHead title="Tổng quan Kinh Doanh">
        <Link
          href="/admin/inventory"
          className="btn bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-500/20 hover:brightness-110 border-0"
        >
          <span>Quản lý Kho & Lợi nhuận</span>
          <span>→</span>
        </Link>
      </AdminHead>

      {/* 1. DÃY THẺ KPI THỐNG KÊ ĐẲNG CẤP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Doanh thu đã giao"
          value={vnd(d.totalRevenue)}
          subText="Tổng giá trị đơn thành công"
          color="blue"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <KpiCard
          title="Lợi nhuận ước tính"
          value={`+${vnd(estProfit)}`}
          subText="Biên độ lãi gộp ~22%"
          color="emerald"
          badge="Lãi tốt"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />

        <KpiCard
          title="Tổng đơn hàng"
          value={d.totalOrders}
          subText="Bao gồm mọi trạng thái"
          color="indigo"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
        />

        <KpiCard
          title="Đơn chờ duyệt"
          value={d.ordersByStatus.PENDING || 0}
          subText="Cần xử lý ngay"
          color="amber"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <KpiCard
          title="Hàng sắp hết kho"
          value={d.lowStockProducts}
          subText="Tồn kho ≤ 5 máy"
          color="rose"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
      </div>

      {/* 2. KHỐI BIỂU ĐỒ DOANH THU & ĐƠN HÀNG */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Biểu đồ doanh thu 30 ngày */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">Biểu đồ Doanh thu (30 ngày gần nhất)</h2>
              <p className="text-xs text-slate-400">Thống kê giá trị đơn hàng giao thành công theo ngày</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Cập nhật trực tiếp
            </span>
          </div>

          {d.revenueLast30Days.length ? (
            <div className="flex h-48 items-end gap-1.5 pt-4 border-b border-slate-100 pb-2">
              {d.revenueLast30Days.map((x) => (
                <div
                  key={x.date}
                  title={`${x.date}: ${vnd(x.revenue)} (${x.orders} đơn)`}
                  className="group relative min-h-1 flex-1 rounded-t-md bg-gradient-to-t from-blue-600 to-indigo-500 transition-all hover:brightness-125"
                  style={{ height: `${Math.max(6, (Number(x.revenue) / max) * 100)}%` }}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Chưa có đơn hàng nào được giao thành công trong 30 ngày qua.
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>30 ngày trước</span>
            <span className="font-semibold text-slate-600">Hôm nay</span>
          </div>
        </div>

        {/* Trạng thái đơn hàng */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-800 mb-1">Trạng thái Đơn hàng</h2>
          <p className="text-xs text-slate-400 mb-4">Phân bổ tiến độ giao hàng</p>

          <div className="space-y-3">
            {Object.entries(d.ordersByStatus).map(([statusKey, count]) => (
              <div key={statusKey} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <StatusTag status={statusKey} />
                <span className="text-sm font-extrabold text-slate-700 tabular-nums">{count} đơn</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. BẢNG TOP SẢN PHẨM BÁN CHẠY NHẤT */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Top Sản Phẩm Bán Chạy Nhất</h2>
            <p className="text-xs text-slate-400">Những mẫu điện thoại dẫn đầu doanh số</p>
          </div>
          <Link href="/admin/products" className="text-xs font-bold text-blue-600 hover:underline">
            Xem tất cả sản phẩm →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[11px] font-bold">
                <th className="py-3 px-3">Xếp hạng</th>
                <th>Sản phẩm</th>
                <th className="text-center">Đã bán</th>
                <th className="text-center">Tồn kho</th>
                <th className="text-right">Giá bán</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {d.topSelling.map((p, idx) => {
                const rankBadges = ["bg-amber-400 text-amber-900", "bg-slate-300 text-slate-800", "bg-amber-600/30 text-amber-800"];
                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3">
                      <span
                        className={`w-6 h-6 rounded-full inline-grid place-items-center font-bold text-xs ${
                          rankBadges[idx] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <ProductImage src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg" />
                        <div>
                          <div className="font-bold text-slate-800">{p.name}</div>
                          <div className="text-[11px] text-slate-400">{p.brandName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center font-extrabold text-slate-700 tabular-nums">
                      {p.soldCount} máy
                    </td>
                    <td className="text-center tabular-nums">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          p.stock <= 5 ? "bg-rose-50 text-rose-600" : "text-slate-600"
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="text-right font-black text-slate-800 tabular-nums">
                      {vnd(p.effectivePrice)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
