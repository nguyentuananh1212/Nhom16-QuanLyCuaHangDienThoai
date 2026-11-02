import { Be_Vietnam_Pro } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

// Font thiết kế cho tiếng Việt, tự host qua next/font (không gọi Google lúc người dùng tải trang)
const font = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: { default: "AURA PHONESTORE — Đỉnh Cao Smartphone Chính Hãng", template: "%s — AURA PHONESTORE" },
  description: "AURA PHONESTORE - Hệ thống bán lẻ smartphone và công nghệ hàng đầu Việt Nam",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={`${font.variable} antialiased`}>
      <body className="min-h-screen font-sans text-[15px] leading-normal">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
