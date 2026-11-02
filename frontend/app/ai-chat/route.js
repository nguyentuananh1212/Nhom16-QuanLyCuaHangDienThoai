import { NextResponse } from "next/server";

// Danh mục sản phẩm cửa hàng có sẵn
const STORE_PRODUCTS = [
  {
    id: 1,
    name: "iPhone 16 Pro Max 256GB",
    brand: "Apple",
    category: "Flagship",
    price: 34990000,
    salePrice: 32490000,
    screen: "6.9\" OLED 120Hz ProMotion",
    chip: "Apple A18 Pro",
    ram: "8GB",
    storage: "256GB",
    camera: "48MP Fusion + 48MP UltraWide + 12MP Tele 5x",
    battery: "4685 mAh (Sạc 25W MagSafe)",
    highlight: "Khung Titan sa mạc, nút Camera Control, Apple Intelligence, quay 4K 120fps Dolby Vision",
    bestFor: ["chụp ảnh", "quay phim", "sang trọng", "flagship", "chơi game", "ios"],
  },
  {
    id: 2,
    name: "iPhone 16 128GB",
    brand: "Apple",
    category: "Flagship",
    price: 22990000,
    salePrice: null,
    screen: "6.1\" OLED Super Retina XDR",
    chip: "Apple A18",
    ram: "8GB",
    storage: "128GB",
    camera: "48MP Fusion + 12MP UltraWide",
    battery: "3561 mAh",
    highlight: "Mặt lưng pha màu rực rỡ, Camera Control mới, hỗ trợ Apple Intelligence",
    bestFor: ["nhỏ gọn", "giá vừa phải", "thời trang", "ios"],
  },
  {
    id: 3,
    name: "Galaxy S25 Ultra 256GB",
    brand: "Samsung",
    category: "Flagship",
    price: 33990000,
    salePrice: 29990000,
    screen: "6.9\" Dynamic AMOLED 2X 120Hz 2600 nits",
    chip: "Snapdragon 8 Elite for Galaxy",
    ram: "12GB",
    storage: "256GB",
    camera: "200MP Siêu chi tiết + 50MP Zoom 5x + 50MP Góc rộng + 10MP Zoom 3x",
    battery: "5000 mAh (Sạc nhanh 45W)",
    highlight: "Bút S-Pen tích hợp, khung Titan, Galaxy AI toàn diện thế hệ mới, zoom 100x",
    bestFor: ["chụp ảnh", "zoom xa", "công việc", "chơi game", "bút spen", "flagship"],
  },
  {
    id: 4,
    name: "Galaxy A56 5G",
    brand: "Samsung",
    category: "Tầm trung",
    price: 10990000,
    salePrice: 9990000,
    screen: "6.7\" Super AMOLED 120Hz",
    chip: "Exynos 1580 (4nm)",
    ram: "8GB",
    storage: "128GB",
    camera: "50MP OIS + 12MP + 5MP",
    battery: "5000 mAh (Sạc nhanh 45W)",
    highlight: "Kháng nước IP67, màn hình viền mỏng tuyệt đẹp, hỗ trợ cập nhật lâu dài",
    bestFor: ["tầm trung", "dưới 10 triệu", "bền bỉ", "học sinh", "sinh viên"],
  },
  {
    id: 5,
    name: "Xiaomi 15 Ultra",
    brand: "Xiaomi",
    category: "Flagship",
    price: 32990000,
    salePrice: null,
    screen: "6.73\" 2K AMOLED 120Hz LTPO",
    chip: "Snapdragon 8 Elite",
    ram: "16GB",
    storage: "512GB",
    camera: "Hệ thống 4 camera 50MP Leica quang học đỉnh cao",
    battery: "5410 mAh (Sạc 90W có dây, 80W không dây)",
    highlight: "Ống kính máy ảnh chuyên nghiệp Leica, cảm biến 1 inch, sạc siêu tốc",
    bestFor: ["chụp ảnh", "nhiếp ảnh leica", "cấu hình khủng", "sạc nhanh", "flagship"],
  },
  {
    id: 6,
    name: "Redmi Note 14 Pro",
    brand: "Xiaomi",
    category: "Tầm trung",
    price: 8490000,
    salePrice: 7690000,
    screen: "6.67\" AMOLED 1.5K 120Hz",
    chip: "Helio G100 Ultra",
    ram: "8GB",
    storage: "256GB",
    camera: "200MP Chống rung OIS + 8MP + 2MP",
    battery: "5500 mAh (Sạc nhanh 67W)",
    highlight: "Camera 200MP sắc nét, màn hình cong 1.5K bảo vệ mắt, pin khủng 5500mAh",
    bestFor: ["tầm trung", "dưới 8 triệu", "camera 200mp", "pin trâu", "ngon bổ rẻ"],
  },
  {
    id: 7,
    name: "OPPO Reno13 F",
    brand: "OPPO",
    category: "Tầm trung",
    price: 8990000,
    salePrice: null,
    screen: "6.67\" AMOLED 120Hz mượt mà",
    chip: "Helio G100",
    ram: "8GB",
    storage: "256GB",
    camera: "50MP Chân dung tỏa sáng + 8MP + 2MP",
    battery: "5800 mAh Siêu trâu (Sạc SuperVOOC 45W)",
    highlight: "Viền sáng Halo thông minh, chuyên gia chân dung AI, pin cực lớn 5800mAh",
    bestFor: ["chân dung", "selfie", "pin trâu", "thời trang", "dưới 10 triệu"],
  },
  {
    id: 8,
    name: "Redmi 14C",
    brand: "Xiaomi",
    category: "Phổ thông",
    price: 3490000,
    salePrice: 2990000,
    screen: "6.88\" IPS LCD 120Hz siêu lớn",
    chip: "Helio G81 Ultra",
    ram: "4GB",
    storage: "128GB",
    camera: "50MP AI",
    battery: "5160 mAh (Sạc nhanh 18W)",
    highlight: "Màn hình 120Hz lớn nhất phân khúc, pin dùng cả ngày dài, giá siêu tiết kiệm",
    bestFor: ["giá rẻ", "dưới 3 triệu", "dưới 5 triệu", "phụ huynh", "học sinh", "chạy xe ôm"],
  },
  {
    id: 9,
    name: "Google Pixel 9",
    brand: "Google",
    category: "Flagship",
    price: 21990000,
    salePrice: 19990000,
    screen: "6.3\" OLED Actua 120Hz",
    chip: "Google Tensor G4",
    ram: "12GB",
    storage: "128GB",
    camera: "50MP Chính + 48MP Góc siêu rộng",
    battery: "4700 mAh",
    highlight: "Google AI thông minh (Magic Editor, Best Take), chụp đêm hàng đầu, hỗ trợ 7 năm OS",
    bestFor: ["thuần android", "chụp đêm", "ai", "nhỏ gọn", "dưới 20 triệu"],
  },
];

const fmtVND = (num) => (num ? Number(num).toLocaleString("vi-VN") + "₫" : "");

// Xử lý bằng Google Gemini nếu có GEMINI_API_KEY
async function callGemini(userPrompt, history) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const systemPrompt = `Bạn là AURA AI - Chuyên viên tư vấn điện thoại thông minh cao cấp và nhiệt tình của AURA PHONESTORE (Nhóm 16).
THÔNG TIN CỬA HÀNG:
- Địa chỉ: Tòa nhà Landmark 81, TP. Hồ Chí Minh
- Hotline: 1900 8899 (8:00 - 21:30)
- Bảo hành: 12 tháng chính hãng toàn quốc, 1 đổi 1 trong 30 ngày nếu phát hiện lỗi phần cứng.
- Giao hàng: Hỏa tốc trong 2 giờ nội thành, giao toàn quốc 2-3 ngày, miễn phí đơn từ 500k.
- Thanh toán: Tiền mặt khi nhận hàng (COD), Chuyển khoản ngân hàng qua mã QR (VietQR tự động MB Bank 0399888999), Trả góp 0%.

DANH SÁCH ĐIỆN THOẠI TRONG CỬA HÀNG:
${STORE_PRODUCTS.map(
  (p) =>
    `- ${p.name} (${p.brand}): Giá ${fmtVND(p.salePrice || p.price)} (Gốc: ${fmtVND(p.price)}). Chip: ${p.chip}, Màn hình: ${p.screen}, RAM/ROM: ${p.ram}/${p.storage}, Camera: ${p.camera}, Pin: ${p.battery}. Điểm nổi bật: ${p.highlight}`
).join("\n")}

NGUYÊN TẮC TRẢ LỜI:
1. Luôn chào hỏi thân thiện, xưng "AURA AI" hoặc "mình" và gọi khách là "bạn" hoặc "quý khách".
2. Trả lời súc tích, rõ ràng, gạch đầu dòng các thông số quan trọng (Giá bán, Chip, Camera, Pin).
3. Đề xuất đúng điện thoại phù hợp với nhu cầu và tầm giá người dùng yêu cầu.
4. Sử dụng tiếng Việt tự nhiên, định dạng Markdown (in đậm, danh sách).`;

    const contents = [];
    if (history && Array.isArray(history)) {
      history.slice(-4).forEach((h) => {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }],
        });
      });
    }
    contents.push({ role: "user", parts: [{ text: userPrompt }] });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          },
        }),
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (e) {
    console.error("Gemini call error:", e);
    return null;
  }
}

// Bộ xử lý thông minh nội bộ (NLP Rule-based Engine) chuyên sâu về điện thoại
function generateSmartReply(query) {
  const q = (query || "").toLowerCase().trim();
  let text = "";
  let matchedProducts = [];

  // 1. Chào hỏi & danh tính
  if (
    q === "chào" ||
    q === "xin chào" ||
    q === "hello" ||
    q === "hi" ||
    q.includes("bạn là ai") ||
    q.includes("ai là ai") ||
    q.includes("trợ lý")
  ) {
    text = `Dạ xin chào bạn! Mình là **AURA AI** — Trợ lý tư vấn mua sắm thông minh của **AURA PHONESTORE** 🤖✨

Mình có thể hỗ trợ bạn:
• 📱 **Tư vấn chọn máy:** Tìm smartphone theo nhu cầu (chụp ảnh, chiến game, pin trâu, máy giá rẻ...)
• 💰 **Tìm theo tầm giá:** Dưới 5 triệu, 10 triệu, 15 triệu hoặc flagship trên 20 triệu.
• 💳 **Thanh toán mã QR:** Hướng dẫn quét mã VietQR và mô phỏng giao dịch ảo nhanh chóng.
• 🛡️ **Chính sách:** Bảo hành 12 tháng, 1 đổi 1 trong 30 ngày, giao hàng hỏa tốc 2 giờ.

Hôm nay bạn đang quan tâm dòng máy nào ạ?`;
    matchedProducts = [STORE_PRODUCTS[0], STORE_PRODUCTS[2], STORE_PRODUCTS[5]];
    return { text, products: matchedProducts };
  }

  // 2. Chính sách bảo hành & đổi trả
  if (q.includes("bảo hành") || q.includes("đổi trả") || q.includes("hỏng") || q.includes("lỗi")) {
    text = `🛡️ **Chính sách bảo hành & Đổi trả tại AURA PHONESTORE:**

• **Bảo hành chính hãng 12 tháng:** Áp dụng cho 100% điện thoại mới tại hệ thống cửa hàng và trung tâm bảo hành toàn quốc.
• **1 đổi 1 trong 30 ngày đầu:** Nếu máy phát sinh lỗi phần cứng từ nhà sản xuất, bạn được đổi máy mới nguyên seal ngay lập tức.
• **Hỗ trợ phần mềm trọn đời:** Cài đặt ứng dụng, nâng cấp hệ điều hành, vệ sinh máy miễn phí.
• **Địa điểm tiếp nhận:** Showroom Landmark 81, TP.HCM hoặc gửi chuyển phát miễn phí qua bưu điện.

Nếu bạn cần kiểm tra bảo hành cho đơn hàng cụ thể, vui lòng bấm vào mục **Đơn hàng của tôi** hoặc liên hệ hotline **1900 8899** nhé!`;
    return { text, products: [] };
  }

  // 3. Chính sách giao hàng / Vận chuyển
  if (q.includes("giao hàng") || q.includes("ship") || q.includes("vận chuyển") || q.includes("bao lâu")) {
    text = `🚚 **Chính sách giao hàng của AURA PHONESTORE:**

• ⚡ **Giao siêu tốc 2 Giờ:** Áp dụng tại khu vực nội thành TP. Hồ Chí Minh và Hà Nội.
• 📦 **Giao toàn quốc:** 2 – 3 ngày làm việc qua các đối tác vận chuyển uy tín (GHTK, Viettel Post).
• 🎁 **Miễn phí vận chuyển:** Cho tất cả đơn hàng có giá trị từ **500.000₫** trở lên.
• 🔍 **Đồng kiểm khi nhận:** Bạn được mở hộp kiểm tra ngoại quan máy và phụ kiện trước khi thanh toán.`;
    return { text, products: [] };
  }

  // 4. Thanh toán & Mã QR ảo
  if (
    q.includes("thanh toán") ||
    q.includes("qr") ||
    q.includes("chuyển khoản") ||
    q.includes("vietqr") ||
    q.includes("cod") ||
    q.includes("trả góp")
  ) {
    text = `💳 **Phương thức thanh toán tiện lợi tại AURA PHONESTORE:**

1. **Chuyển khoản qua Mã QR (VietQR ảo):**
   - Khi đặt hàng, hệ thống tự động sinh mã QR với số tiền và nội dung chuyển khoản chính xác.
   - Bạn có thể quét thử bằng app ngân hàng (MB Bank, VCB, Momo...) hoặc bấm nút **"⚡ Giả lập thanh toán thành công"** để hệ thống tự động xác nhận đơn ngay lập tức!
2. **Thanh toán khi nhận hàng (COD):**
   - Nhận hàng, kiểm tra máy và trả tiền mặt cho shipper.
3. **Trả góp 0% lãi suất:**
   - Hỗ trợ trả góp qua thẻ tín dụng hoặc CCCD với thủ tục duyệt online chỉ trong 15 phút.`;
    return { text, products: [] };
  }

  // 5. Địa chỉ, liên hệ, hotline
  if (
    q.includes("địa chỉ") ||
    q.includes("cửa hàng ở đâu") ||
    q.includes("hotline") ||
    q.includes("liên hệ") ||
    q.includes("sđt") ||
    q.includes("số điện thoại")
  ) {
    text = `🏢 **Thông tin liên hệ AURA PHONESTORE:**

• **Địa chỉ Showroom:** Toà nhà Landmark 81, P. 22, Q. Bình Thạnh, TP. Hồ Chí Minh
• **Hotline hỗ trợ:** 1900 8899 (Hoạt động từ 8:00 – 21:30 hàng ngày)
• **Email:** support@aurastore.vn
• **Website:** Hệ thống đặt hàng trực tuyến AURA Store`;
    return { text, products: [] };
  }

  // 6. Tìm theo ngân sách / mức giá
  if (q.includes("dưới 5 triệu") || q.includes("dưới 4 triệu") || q.includes("dưới 3 triệu") || q.includes("giá rẻ")) {
    const item = STORE_PRODUCTS.find((p) => (p.salePrice || p.price) <= 5000000);
    text = `💰 **Gợi ý điện thoại dưới 5 triệu tốt nhất hiện nay:**

Trong phân khúc này, máy bán chạy số 1 tại cửa hàng là **${item.name}**:
• **Giá ưu đãi:** **${fmtVND(item.salePrice || item.price)}** (Gốc: ${fmtVND(item.price)})
• **Màn hình:** ${item.screen} cực kỳ mượt mà
• **Pin:** ${item.battery} thoải mái sử dụng hơn 1 ngày
• **Điểm nổi bật:** ${item.highlight}

Phù hợp cho học sinh, sinh viên, phụ huynh hoặc làm máy phụ/chạy app công nghệ!`;
    return { text, products: [item] };
  }

  if (
    q.includes("dưới 10 triệu") ||
    q.includes("dưới 8 triệu") ||
    q.includes("tầm trung") ||
    q.includes("5 đến 10 triệu") ||
    q.includes("5-10 triệu")
  ) {
    const items = STORE_PRODUCTS.filter(
      (p) => (p.salePrice || p.price) > 5000000 && (p.salePrice || p.price) <= 11000000
    );
    text = `🎯 **Top điện thoại tầm trung từ 5 – 10 triệu đáng mua nhất:**

${items
  .map(
    (p, i) =>
      `**${i + 1}. ${p.name}** — **${fmtVND(p.salePrice || p.price)}**\n• Chip: ${p.chip} | Màn: ${p.screen}\n• Camera: ${p.camera} | Pin: ${p.battery}\n• Điểm mạnh: ${p.highlight}`
  )
  .join("\n\n")}

👉 Nếu bạn ưu tiên **camera 200MP & sạc 67W**: chọn ngay **Redmi Note 14 Pro**.
👉 Nếu bạn thích **chụp chân dung & pin 5800mAh**: chọn **OPPO Reno13 F**.
👉 Nếu thích **màn hình đẹp & kháng nước IP67**: chọn **Galaxy A56 5G**!`;
    return { text, products: items };
  }

  if (
    q.includes("dưới 20 triệu") ||
    q.includes("15 triệu") ||
    q.includes("15 đến 20 triệu") ||
    q.includes("10-20 triệu")
  ) {
    const items = [
      STORE_PRODUCTS.find((p) => p.name.includes("Pixel 9")),
      STORE_PRODUCTS.find((p) => p.name.includes("Galaxy A56")),
    ].filter(Boolean);
    text = `✨ **Phân khúc cận cao cấp (10 – 20 triệu) nổi bật:**

1. **Google Pixel 9:** **${fmtVND(19990000)}**
   • Điểm mạnh: AI thông minh thế hệ mới, camera chân thực đỉnh cao, hệ điều hành Android gốc siêu mượt.
2. **Galaxy A56 5G:** **${fmtVND(9990000)}**
   • Màn hình Super AMOLED 120Hz rực rỡ, chip Exynos 1580 4nm mát mẻ, chống nước IP67.`;
    return { text, products: items };
  }

  if (
    q.includes("flagship") ||
    q.includes("cao cấp") ||
    q.includes("trên 20 triệu") ||
    q.includes("tốt nhất") ||
    q.includes("đắt nhất")
  ) {
    const items = STORE_PRODUCTS.filter((p) => (p.salePrice || p.price) >= 20000000);
    text = `👑 **Top 3 Siêu phẩm Flagship Đỉnh cao nhất 2026:**

1. 🍏 **iPhone 16 Pro Max 256GB** (${fmtVND(32490000)}):
   • Chip A18 Pro mạnh nhất Apple, khung Titan, nút Camera Control, quay video 4K 120fps chuẩn rạp chiếu phim.
2. 🌌 **Galaxy S25 Ultra 256GB** (${fmtVND(29990000)}):
   • Chip Snapdragon 8 Elite, camera 200MP zoom 100x, bút S-Pen quyền năng, Galaxy AI toàn diện.
3. 🔴 **Xiaomi 15 Ultra** (${fmtVND(32990000)}):
   • Bộ 4 camera Leica chuyên nghiệp, cảm biến 1 inch, sạc siêu tốc 90W.

Bạn là fan của hệ sinh thái iOS mượt mà hay Android tự do nhiều công nghệ mới?`;
    return { text, products: items.slice(0, 3) };
  }

  // 7. Nhu cầu Chụp ảnh / Camera
  if (q.includes("chụp ảnh") || q.includes("camera") || q.includes("quay phim") || q.includes("sống ảo")) {
    const items = [
      STORE_PRODUCTS.find((p) => p.name.includes("Galaxy S25 Ultra")),
      STORE_PRODUCTS.find((p) => p.name.includes("iPhone 16 Pro Max")),
      STORE_PRODUCTS.find((p) => p.name.includes("Redmi Note 14 Pro")),
    ].filter(Boolean);
    text = `📸 **Top điện thoại chụp ảnh đẹp nhất theo nhu cầu:**

• 🌟 **Đỉnh cao Zoom xa & Đa dụng:** **Galaxy S25 Ultra** — Camera 200MP, cảm biến zoom 5x quang học & 100x Space Zoom thách thức mọi khoảng cách.
• 🎬 **Đỉnh cao Quay phim & Chân dung điện ảnh:** **iPhone 16 Pro Max** — Nút Camera Control thế hệ mới, hỗ trợ 4K 120fps Dolby Vision, micro thu âm studio.
• 💎 **Chụp ảnh 200MP Giá mềm tầm trung:** **Redmi Note 14 Pro** (chỉ từ ${fmtVND(7690000)}) — Cảm biến 200MP chống rung OIS sắc nét vượt tầm giá.`;
    return { text, products: items };
  }

  // 8. Nhu cầu Chơi game / Pin trâu
  if (
    q.includes("chơi game") ||
    q.includes("game") ||
    q.includes("gaming") ||
    q.includes("pin trâu") ||
    q.includes("pin khủng")
  ) {
    const items = [
      STORE_PRODUCTS.find((p) => p.name.includes("Galaxy S25 Ultra")),
      STORE_PRODUCTS.find((p) => p.name.includes("OPPO Reno13 F")),
      STORE_PRODUCTS.find((p) => p.name.includes("Redmi Note 14 Pro")),
    ].filter(Boolean);
    text = `🎮 **Điện thoại chuyên chiến Game mượt mà & Pin trâu:**

• 🔥 **Chiến mọi game MAX Setting:** **Galaxy S25 Ultra** hoặc **iPhone 16 Pro Max** — Cấu hình chip Snapdragon 8 Elite / A18 Pro mạnh nhất thế giới hiện nay, tản nhiệt buồng hơi lớn.
• 🔋 **Vua Pin trâu 5800mAh:** **OPPO Reno13 F** (${fmtVND(8990000)}) — Pin 5800mAh chơi game, xem phim cả ngày dài không lo hết pin.
• ⚡ **Pin 5500mAh & Sạc nhanh 67W:** **Redmi Note 14 Pro** (${fmtVND(7690000)}) — Vừa pin lớn vừa sạc chỉ tầm 40 phút là đầy.`;
    return { text, products: items };
  }

  // 9. Hỏi đích danh iPhone
  if (q.includes("iphone") || q.includes("apple")) {
    const items = STORE_PRODUCTS.filter((p) => p.brand === "Apple");
    text = `🍏 **Các dòng iPhone chính hãng sẵn hàng tại AURA STORE:**

• **iPhone 16 Pro Max 256GB:** **${fmtVND(32490000)}** (Đang giảm 2.500.000₫) — Đỉnh cao flagship Apple với nút Camera Control và khung Titan siêu bền.
• **iPhone 16 128GB:** **${fmtVND(22990000)}** — Thiết kế trẻ trung, chip A18 mạnh mẽ, hỗ trợ Apple Intelligence.

Tất cả iPhone đều là máy chính hãng VN/A, bảo hành 12 tháng tại các trung tâm ủy quyền Apple toàn quốc!`;
    return { text, products: items };
  }

  // 10. Hỏi đích danh Samsung
  if (q.includes("samsung") || q.includes("galaxy") || q.includes("s25")) {
    const items = STORE_PRODUCTS.filter((p) => p.brand === "Samsung");
    text = `🌌 **Các dòng Samsung Galaxy chính hãng nổi bật:**

• **Galaxy S25 Ultra 256GB:** **${fmtVND(29990000)}** (Giảm sốc từ 33.990.000₫) — Chip Snapdragon 8 Elite, camera 200MP, bút S-Pen độc quyền.
• **Galaxy A56 5G:** **${fmtVND(9990000)}** — Dòng A tầm trung quốc dân với màn hình Super AMOLED 120Hz và kháng nước IP67.`;
    return { text, products: items };
  }

  // 11. Hỏi đích danh Xiaomi / Redmi
  if (q.includes("xiaomi") || q.includes("redmi")) {
    const items = STORE_PRODUCTS.filter((p) => p.brand === "Xiaomi");
    text = `🔴 **Các dòng Xiaomi & Redmi cực hot cấu hình cao giá tốt:**

• **Xiaomi 15 Ultra:** **${fmtVND(32990000)}** — Camera Leica 4 ống kính, Snapdragon 8 Elite, sạc 90W.
• **Redmi Note 14 Pro:** **${fmtVND(7690000)}** — Camera 200MP OIS, sạc nhanh 67W, màn hình 1.5K 120Hz.
• **Redmi 14C:** **${fmtVND(2990000)}** — Màn hình lớn 6.88 inch 120Hz, pin 5160mAh, giá rẻ bất ngờ!`;
    return { text, products: items };
  }

  // 12. Hỏi đích danh OPPO
  if (q.includes("oppo") || q.includes("reno")) {
    const item = STORE_PRODUCTS.find((p) => p.brand === "OPPO");
    text = `✨ **OPPO Reno13 F — Chuyên gia chân dung & Pin khủng:**

• **Giá bán:** **${fmtVND(item.price)}**
• **Pin:** Dung lượng khủng **5800 mAh** kèm sạc nhanh SuperVOOC 45W.
• **Thiết kế:** Viền sáng Halo thông minh, mỏng nhẹ thời trang.
• **Camera:** 50MP AI bắt trọn từng khoảnh khắc chân dung rạng rỡ.`;
    return { text, products: [item] };
  }

  // 13. Hỏi đích danh Pixel
  if (q.includes("pixel") || q.includes("google")) {
    const item = STORE_PRODUCTS.find((p) => p.brand === "Google");
    text = `🌐 **Google Pixel 9 — Trí tuệ nhân tạo đỉnh cao của Google:**

• **Giá ưu đãi:** **${fmtVND(item.salePrice)}** (Giá gốc: ${fmtVND(item.price)})
• **Chip:** Google Tensor G4 mạnh mẽ tối ưu riêng cho AI.
• **Camera:** Thuật toán xử lý ảnh hàng đầu thế giới, chụp đêm sắc nét.
• **Phần mềm:** Android gốc mượt mà, cam kết cập nhật 7 năm!`;
    return { text, products: [item] };
  }

  // 14. Mặc định / Tổng quát
  text = `Cảm ơn bạn đã nhắn tin cho **AURA AI**! 

Để mình tư vấn chính xác nhất cho bạn, bạn có thể cho mình biết thêm:
1. Bạn đang tìm điện thoại trong tầm giá khoảng bao nhiêu? (Ví dụ: dưới 5tr, 10-15tr, hay trên 20tr?)
2. Tiêu chí quan trọng nhất của bạn là gì? (Chụp ảnh đẹp, pin trâu chơi game, máy nhỏ gọn, hay thiết kế sang trọng?)
3. Hoặc bạn muốn tìm hiểu về chính sách giao hàng, bảo hành hay thanh toán mã QR của shop?

Dưới đây là một số dòng máy đang bán rất chạy tại cửa hàng để bạn tham khảo nhé! 👇`;
  matchedProducts = [STORE_PRODUCTS[0], STORE_PRODUCTS[2], STORE_PRODUCTS[5]];
  return { text, products: matchedProducts };
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = body.message || "";
    const history = body.history || [];

    if (!message.trim()) {
      return NextResponse.json({ error: "Tin nhắn không được để trống" }, { status: 400 });
    }

    // Thử gọi Gemini AI nếu có key
    let aiResponse = await callGemini(message, history);

    // Nếu không có Gemini hoặc API lỗi, dùng NLP Engine nội bộ thông minh
    if (!aiResponse) {
      const smartResult = generateSmartReply(message);
      return NextResponse.json({
        reply: smartResult.text,
        products: smartResult.products || [],
        source: "nlp-engine",
      });
    }

    // Nếu Gemini trả lời, tìm các sản phẩm liên quan trong câu hỏi để đính kèm card
    const qLower = message.toLowerCase();
    const relatedProducts = STORE_PRODUCTS.filter((p) => {
      const pName = p.name.toLowerCase();
      const pBrand = p.brand.toLowerCase();
      return qLower.includes(pBrand) || qLower.includes(pName.split(" ")[0].toLowerCase());
    }).slice(0, 3);

    return NextResponse.json({
      reply: aiResponse,
      products: relatedProducts,
      source: "gemini",
    });
  } catch (err) {
    console.error("AI Chat Route Error:", err);
    return NextResponse.json(
      {
        reply:
          "Xin lỗi bạn, hệ thống AI tạm thời đang bận. Bạn có thể liên hệ trực tiếp hotline 1900 8899 hoặc chọn xem các sản phẩm tại trang chủ nhé!",
        products: [],
      },
      { status: 500 }
    );
  }
}
