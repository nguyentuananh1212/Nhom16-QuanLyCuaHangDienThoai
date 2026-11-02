# Nhóm 16 — Quản lý cửa hàng điện thoại

Backend REST API: Spring Boot 4.1 (Java 21) + MySQL + JWT. Giao diện là project Next.js riêng (`frontend`).

## Chạy dự án

1. Cài JDK 21 và MySQL 8. Tạo user MySQL (DB `phone_shop` tự được tạo).
2. Cấu hình kết nối bằng biến môi trường, hoặc sửa giá trị mặc định trong `application.properties`:
   ```
   DB_URL=jdbc:mysql://localhost:3306/phone_shop?createDatabaseIfNotExist=true
   DB_USERNAME=root
   DB_PASSWORD=matkhau
   JWT_SECRET=chuoi-ngau-nhien-it-nhat-32-ky-tu
   ```
3. Chạy: `./mvnw spring-boot:run` (Windows: `mvnw.cmd spring-boot:run`)
4. Chạy frontend Next.js (xem README trong `frontend`), rồi mở http://localhost:3000.

Lần chạy đầu tự tạo dữ liệu mẫu (5 hãng, 3 phân khúc, 9 sản phẩm) và tài khoản admin:
`admin@phoneshop.vn` / `Admin@123` — đổi qua biến `ADMIN_EMAIL`, `ADMIN_PASSWORD`. Tắt seed: `SEED_ENABLED=false`.

Chạy test (dùng H2 trong bộ nhớ, không cần MySQL): `./mvnw test`

## Chức năng

**Khách hàng:** đăng ký/đăng nhập, tìm kiếm + lọc (hãng, phân khúc, khoảng giá, đang giảm giá) + sắp xếp, xem chi tiết & thông số, giỏ hàng, đặt hàng (COD/chuyển khoản), xem/huỷ đơn, đánh giá sản phẩm (chỉ khi đã nhận hàng), sửa hồ sơ, đổi mật khẩu.

**Nhân viên (STAFF) & Admin:** dashboard doanh thu, xử lý đơn theo quy trình `Chờ xác nhận → Đã xác nhận → Đang giao → Đã giao` (huỷ được ở 2 bước đầu, tự hoàn kho), CRUD sản phẩm / hãng / phân khúc.

**Chỉ Admin:** quản lý người dùng (đổi vai trò, khoá tài khoản).

## Cấu trúc

```
config/       DataInitializer (dữ liệu mẫu)
controller/   REST API
dto/          request (có validate) / response
entity/       JPA entity + enums (Role, OrderStatus, PaymentMethod)
exception/    AppException, ErrorCode, GlobalExceptionHandler
repository/   Spring Data JPA
security/     SecurityConfig, JwtService, CurrentUser
service/      Nghiệp vụ
```

## API chính

| Method | Đường dẫn | Quyền |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | Công khai |
| GET/PUT | /api/auth/me, PUT /api/auth/me/password | Đã đăng nhập |
| GET | /api/products (lọc + phân trang), /api/products/{id} | Công khai |
| GET | /api/products/hot, /sale, /most-viewed, /newest | Công khai |
| GET | /api/brands, /api/categories | Công khai |
| GET/POST/PUT/DELETE | /api/cart, /api/cart/items/{id} | Đã đăng nhập |
| POST/GET | /api/orders, /api/orders/{id}, POST /api/orders/{id}/cancel | Đã đăng nhập (chỉ đơn của mình) |
| GET/POST | /api/products/{id}/comments, DELETE /api/comments/{id} | Xem: công khai |
| * | /api/admin/products, /brands, /categories, /orders, /dashboard | ADMIN, STAFF |
| * | /api/admin/users | ADMIN |

Lỗi luôn trả về dạng `{"code": "...", "message": "...", "fields": {...}}`.

## Các quyết định kỹ thuật đáng chú ý

- **Không bán vượt tồn kho:** trừ kho bằng một câu `UPDATE ... WHERE stock >= :qty` nguyên tử, cả đơn nằm trong 1 transaction — hết hàng ở bất kỳ sản phẩm nào thì rollback toàn bộ. Có test 10 người đặt cùng lúc cho sản phẩm còn 3 chiếc.
- **Giá được chốt vào đơn:** `OrderItem` lưu tên và đơn giá tại thời điểm đặt, sửa giá sau không ảnh hưởng đơn cũ.
- **Chống IDOR:** user id luôn lấy từ JWT, không nhận từ client; truy vấn giỏ/đơn luôn kèm điều kiện chủ sở hữu.
- **Khoá tài khoản có hiệu lực ngay:** mỗi request kiểm tra user còn hoạt động và đúng vai trò trong token.
- **Xoá mềm sản phẩm** (ngừng bán) để giữ lịch sử đơn hàng và đánh giá.

## Khi đưa lên môi trường thật

- Đổi `JWT_SECRET`, `ADMIN_PASSWORD`; đặt `SEED_ENABLED=false` sau lần chạy đầu.
- Đổi `DDL_AUTO=validate` và quản lý schema bằng Flyway/Liquibase.
- Token đang lưu ở `localStorage` cho đơn giản; nếu cần bảo mật cao hơn nên chuyển sang cookie `HttpOnly`.
