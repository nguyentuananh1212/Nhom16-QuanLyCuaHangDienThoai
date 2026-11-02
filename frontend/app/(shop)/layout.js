import Header from "@/components/Header";
import Link from "next/link";
import AiChatBox from "@/components/AiChatBox";

export default function ShopLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 py-2 max-sm:px-3">
        {children}
      </main>

      {/* TRỢ LÝ AI CHAT BOX NỔI GÓC MÀN HÌNH */}
      <AiChatBox />

      {/* FOOTER AURA PHONESTORE ĐẲNG CẤP */}
      <footer className="mt-16 border-t border-line bg-surface text-ink-2">
        <div className="mx-auto max-w-[1200px] px-5 py-10 max-sm:px-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-slate-900 via-indigo-950 to-purple-900 border border-purple-500/30 text-white font-black text-sm">
                  A
                </div>
                <span className="text-lg font-black tracking-wider text-ink">
                  AURA <span className="text-xs bg-indigo-600 text-white font-bold px-1.5 py-0.5 rounded">STORE</span>
                </span>
              </div>
              <p className="text-xs text-ink-3 max-w-md leading-relaxed">
                AURA PHONESTORE — Hệ thống phân phối smartphone Flagship và thiết bị công nghệ chính hãng. Khẳng định khí chất, bứt phá giới hạn công nghệ 2026.
              </p>
              <div className="text-xs text-ink-3 space-y-1">
                <p>📍 Địa chỉ: Toà nhà Landmark 81, TP. Hồ Chí Minh</p>
                <p>📞 Hotline bán hàng: 1900 8899 (8:00 - 21:30)</p>
                <p>✉️ Email hỗ trợ: support@aurastore.vn</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-3">Chính sách & Hỗ trợ</h3>
              <ul className="text-xs space-y-2 text-ink-3">
                <li><Link href="/products" className="hover:text-accent">Chính sách bảo hành 12 tháng</Link></li>
                <li><Link href="/products" className="hover:text-accent">Chính sách 1 đổi 1 trong 30 ngày</Link></li>
                <li><Link href="/products" className="hover:text-accent">Giao hàng hoả tốc toàn quốc</Link></li>
                <li><Link href="/products" className="hover:text-accent">Hướng dẫn trả góp 0%</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-3">Về chúng tôi</h3>
              <ul className="text-xs space-y-2 text-ink-3">
                <li><Link href="/products" className="hover:text-accent">Hệ thống showroom</Link></li>
                <li><Link href="/products" className="hover:text-accent">Tuyển dụng nhân tài</Link></li>
                <li><Link href="/account" className="hover:text-accent">Khách hàng thân thiết AURA VIP</Link></li>
                <li><Link href="/admin" className="hover:text-accent">Cổng quản trị viên</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-line/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-ink-3 gap-2">
            <div>© 2026 AURA PHONESTORE — Bản quyền thuộc về Nhóm 16.</div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-accent">Uy tín • Tốc độ • Đẳng cấp</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
