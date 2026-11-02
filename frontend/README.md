# Nhóm 16 — Giao diện cửa hàng điện thoại (Next.js)

Next.js 16 (App Router) + JavaScript + Tailwind CSS 4. Gọi API của backend Spring Boot (`backend`).

## Chạy

Yêu cầu: Node.js 20 trở lên, backend đang chạy ở `http://localhost:8080`.

```powershell
npm install
npm run dev
```

Mở http://localhost:3000. Trang quản trị: http://localhost:3000/admin (đăng nhập `admin@phoneshop.vn` / `Admin@123`).

Backend chạy ở địa chỉ khác thì tạo file `.env.local` (xem `.env.example`):

```
BACKEND_URL=http://localhost:8080
```

Bản production: `npm run build` rồi `npm start`.

## Cách frontend nói chuyện với backend

Trình duyệt chỉ gọi `/api/...` trên chính cổng 3000. `next.config.mjs` có `rewrites` chuyển tiếp các request đó sang `BACKEND_URL`. Vì vậy:

- Backend **không cần bật CORS**.
- Đổi địa chỉ backend chỉ cần sửa một biến môi trường.

Sau khi đổi `BACKEND_URL` phải khởi động lại `npm run dev`.

## Cấu trúc

```
app/
  (shop)/            Trang khách hàng (có header chung)
    page.js            Trang chủ
    products/          Danh sách + chi tiết, đánh giá
    cart/ checkout/    Giỏ hàng, đặt hàng
    orders/            Đơn hàng của tôi
    account/ login/ register/
  admin/             Trang quản trị (sidebar, chỉ ADMIN/STAFF)
    page.js            Tổng quan
    orders/ products/ brands/ categories/ users/
components/          Providers (đăng nhập, giỏ, thông báo), Header, ui, ProductCard...
lib/                 api.js (gọi API), format.js (định dạng tiền, trạng thái)
```

## Ghi chú

- Kiểm tra quyền ở giao diện (`RequireAuth`) chỉ để điều hướng cho đúng; quyền thật do backend kiểm tra bằng JWT.
- Token lưu ở `localStorage`. Đăng xuất ở một tab thì các tab khác cũng đăng xuất theo.
- Không dùng extension sửa header (như ModHeader) với `localhost:3000` — header `Authorization` lạ sẽ bị backend từ chối (401).
