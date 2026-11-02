# BÁO CÁO GIẢI PHÁP BẢO MẬT VÀ PHÒNG CHỐNG TẤN CÔNG MẠNG
**Dự án:** Hệ Thống Quản Lý Cửa Hàng Điện Thoại (Nhóm 16)
**Công nghệ:** Spring Boot 4 + Spring Security + JWT + MySQL + Next.js

---

## I. TỔNG QUAN VỀ PHÒNG CHỐNG TẤN CÔNG MẠNG
Phòng chống tấn công mạng trong dự án là việc triển khai mô hình **"Phòng thủ theo chiều sâu" (Defense in Depth)**, kết hợp nhiều lớp bảo vệ độc lập từ giao diện, API, mã nguồn đến cơ sở dữ liệu nhằm:
1. Đảm bảo tính **Bảo mật (Confidentiality)**: Thông tin cá nhân, mật khẩu, đơn hàng của khách hàng không bị rò rỉ.
2. Đảm bảo tính **Toàn vẹn (Integrity)**: Dữ liệu đơn hàng, giá tiền không bị chỉnh sửa trái phép trong quá trình truyền tải.
3. Đảm bảo tính **Sẵn sàng (Availability)**: Hệ thống luôn phục vụ ổn định, không bị sập bởi các cuộc tấn công spam hay DoS/DDoS.

---

## II. CÁC HÌNH THỨC TẤN CÔNG VÀ GIẢI PHÁP TRIỂN KHAI TRONG DỰ ÁN

### 1. Phòng chống tấn công SQL Injection (SQLi)
* **Nguy cơ:** Kẻ xấu chèn câu lệnh SQL độc hại vào ô tìm kiếm hoặc đăng nhập (ví dụ: `' OR 1=1 --`) nhằm đọc trộm toàn bộ database.
* **Giải pháp trong dự án:**
  * Sử dụng **Spring Data JPA & Hibernate ORM**.
  * Toàn bộ truy vấn đều tự động dùng **Prepared Statements** và tham số hóa (Parameterized Queries).
  * Dữ liệu người dùng nhập vào được đối xử như một chuỗi giá trị thuần túy, hoàn toàn không thể trở thành lệnh thực thi trong MySQL.

### 2. Phòng chống tấn công Brute Force (Dò quét mật khẩu)
* **Nguy cơ:** Hacker sử dụng botnet/tool tự động thử hàng nghìn mật khẩu liên tục trên endpoint `/api/auth/login` để chiếm tài khoản Admin.
* **Giải pháp trong dự án (`RateLimitingFilter.java`):**
  * Triển khai bộ lọc **Rate Limiting** theo dõi địa chỉ IP của client.
  * Giới hạn tối đa **10 lần thử đăng nhập / 1 phút**.
  * Nếu vượt ngưỡng, hệ thống lập tức chặn và trả về mã lỗi `HTTP 429 Too Many Requests`, ghi log cảnh báo an ninh.

### 3. Phòng chống tấn công DoS / DDoS (Làm tràn tài nguyên máy chủ)
* **Nguy cơ:** Kẻ tấn công gửi hàng triệu request liên tiếp đến API để làm đầy RAM, quá tải CPU khiến server sập.
* **Giải pháp trong dự án (`RateLimitingFilter.java`):**
  * Giới hạn tần suất chung **120 requests / phút** cho mỗi địa chỉ IP.
  * Tự động dọn dẹp bộ nhớ đệm (Cache Cleaning) để tránh việc chính server bị cạn kiệt tài nguyên do lưu trữ IP rác.

### 4. Phòng chống tấn công XSS (Cross-Site Scripting)
* **Nguy cơ:** Kẻ xấu gửi nội dung bình luận chứa mã JavaScript (ví dụ: `<script>stealCookie()</script>`) để đánh cắp token của người dùng khác khi họ đọc bình luận.
* **Giải pháp trong dự án:**
  * **Next.js & React**: Tự động escape toàn bộ ký tự nguy hiểm (`<`, `>`, `&`, `"`) trước khi render ra HTML.
  * **Security Headers**: Thiết lập header `X-XSS-Protection: 1; mode=block` để trình duyệt tự động chặn khi phát hiện script nguy hại.

### 5. Phòng chống tấn công Đánh cắp phiên đăng nhập (Session Hijacking & CSRF)
* **Nguy cơ:** Hacker giả mạo request của người dùng khi người dùng đang đăng nhập bằng Cookie truyền thống.
* **Giải pháp trong dự án (`SecurityConfig.java`):**
  * Thiết kế kiến trúc **Stateless** hoàn toàn: Không sử dụng Cookie hay HTTP Session (`SessionCreationPolicy.STATELESS`).
  * Sử dụng **JSON Web Token (JWT)** được ký bằng thuật toán bảo mật `HmacSHA256` cùng chuỗi bí mật `JWT_SECRET` (tối thiểu 32 ký tự).
  * Khi JWT hết hạn (mặc định sau 24h), token lập tức mất hiệu lực, buộc phải xác thực lại.

### 6. Bảo vệ mật khẩu người dùng (Password Hashing)
* **Nguy cơ:** Nếu database bị rò rỉ, hacker có thể đọc được mật khẩu nếu lưu dạng văn bản thô (Plain Text).
* **Giải pháp trong dự án:**
  * Sử dụng giải thuật băm **BCrypt (BCryptPasswordEncoder)** với độ phức tạp cao kèm Salt ngẫu nhiên.
  * Quá trình băm là một chiều (One-way hashing), không thể dịch ngược lại mật khẩu gốc.

### 7. Phòng chống tấn công Clickjacking & MIME-Sniffing (Security Headers)
* **Nguy cơ:** Kẻ xấu nhúng trang web của bạn vào một thẻ `<iframe>` vô hình để lừa người dùng click vào các nút nhạy cảm (Clickjacking).
* **Giải pháp trong dự án:**
  * Cấu hình header `X-Frame-Options: DENY`: Cấm hoàn toàn mọi website khác nhúng trang web của hệ thống vào iframe.
  * Cấu hình header `X-Content-Type-Options: nosniff`: Ngăn trình duyệt tự ý đoán định dạng file độc hại.
  * Cấu hình header `Referrer-Policy: strict-origin-when-cross-origin`: Bảo vệ quyền riêng tư đường dẫn người dùng.

### 8. Phân quyền chặt chẽ (Role-Based Access Control - RBAC)
* **Nguy cơ:** Khách hàng thông thường đoán được URL trang quản trị để vào sửa sản phẩm hoặc xem danh sách người dùng.
* **Giải pháp trong dự án:**
  * Cấu hình kiểm tra quyền nghiêm ngặt trong `SecurityConfig.java`:
    * Khách xem: Chỉ được gọi các API `GET /api/products/**`, `GET /api/categories/**`.
    * Khách mua hàng: Phải có Token hợp lệ mới được gọi API Giỏ hàng, Đặt hàng.
    * Quản trị viên (`ADMIN`, `STAFF`): Chỉ những token có chứa Role `ROLE_ADMIN` hoặc `ROLE_STAFF` mới được phép thao tác trên các endpoint `/api/admin/**`. Mọi truy cập trái phép bị từ chối bằng mã lỗi `HTTP 403 Forbidden`.

---

## III. TÓM TẮT DANH MỤC FILE BẢO MẬT TRONG DỰ ÁN

| STT | Tên File / Thành phần | Vị trí | Chức năng phòng thủ |
|:---:|---|---|---|
| 1 | `RateLimitingFilter.java` | `backend/.../security/` | Chống Brute Force mật khẩu, chống Spam DoS/DDoS, chèn Security Headers |
| 2 | `SecurityConfig.java` | `backend/.../security/` | Phân quyền vai trò (RBAC), kích hoạt JWT, cấu hình Stateless, BCrypt |
| 3 | `JwtService.java` | `backend/.../security/` | Tạo và xác thực chữ ký điện tử cho Token đăng nhập |
| 4 | `ActiveUserJwtValidator.java` | `backend/.../security/` | Kiểm tra tài khoản còn đang hoạt động không (chặn token của tài khoản bị khóa) |
| 5 | `DataInitializer.java` | `backend/.../config/` | Khởi tạo tài khoản Admin mặc định với mật khẩu được mã hóa an toàn |

---

## IV. CÂU HỎI BẢO VỆ ĐỒ ÁN THƯỜNG GẶP (FAQ)

**Câu 1: Web của em chống tấn công bằng cách nào?**
> *Trả lời:* Dự án áp dụng mô hình bảo mật nhiều tầng:
> 1. Dùng Spring Data JPA để triệt tiêu lỗ hổng SQL Injection.
> 2. Có `RateLimitingFilter` để chặn tự động các cuộc tấn công Brute Force dò mật khẩu và chống Spam DoS.
> 3. Dùng mã hóa mật khẩu BCrypt và xác thực bằng JSON Web Token (JWT) stateless.
> 4. Phân quyền chặt chẽ bằng Spring Security (chỉ Role ADMIN mới vào được quản trị).

**Câu 2: Nếu kẻ xấu spam nút đăng nhập hoặc F5 liên tục thì sao?**
> *Trả lời:* Bộ lọc `RateLimitingFilter` sẽ nhận diện IP của kẻ tấn công và chặn ngay lập tức sau 10 lần thử trong 1 phút, trả về mã lỗi `429 Too Many Requests` để bảo vệ server.
