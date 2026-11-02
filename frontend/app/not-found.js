import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center text-ink-3">
      <p className="mb-4">Không tìm thấy trang.</p>
      <Link className="btn btn-primary" href="/">Về trang chủ</Link>
    </div>
  );
}
