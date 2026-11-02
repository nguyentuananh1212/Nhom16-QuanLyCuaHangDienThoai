export default function AdminHead({ title, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
      <div>
        <h1 className="text-2xl md:text-[26px] font-extrabold tracking-tight text-slate-800">{title}</h1>
        <p className="text-xs text-slate-400 mt-0.5">Bảng điều khiển & quản trị hệ thống cửa hàng</p>
      </div>
      <div className="flex items-center gap-2.5">
        {children}
      </div>
    </div>
  );
}
