/**
 * Cấu hình các dòng máy con (Series / Sub-brand) chuẩn theo từng thương hiệu
 * Giúp người dùng lọc nhanh theo dòng máy (ví dụ: Samsung có Galaxy S, Galaxy Z, Galaxy A, Galaxy M)
 */

export const SERIES_BY_BRAND = {
  // Samsung: Hãng số 1 với các dòng rõ ràng
  samsung: [
    { id: "galaxy-s", name: "Galaxy S Series", keyword: "Galaxy S", desc: "Flagship đỉnh cao, hiệu năng & camera AI", badge: "Cao cấp" },
    { id: "galaxy-z", name: "Galaxy Z Series", keyword: "Galaxy Z", desc: "Màn hình gập thời thượng (Fold / Flip)", badge: "Màn gập" },
    { id: "galaxy-a", name: "Galaxy A Series", keyword: "Galaxy A", desc: "Quốc dân trẻ trung, pin trâu, chụp nét", badge: "Bán chạy" },
    { id: "galaxy-m", name: "Galaxy M Series", keyword: "Galaxy M", desc: "Pin khủng, cấu hình thực dụng giá tốt", badge: "Pin trâu" },
  ],

  // Apple: Phân chia theo đời iPhone
  apple: [
    { id: "iphone-16", name: "iPhone 16 Series", keyword: "iPhone 16", desc: "Camera Control, chip A18, Apple Intelligence", badge: "Mới nhất 2026" },
    { id: "iphone-15", name: "iPhone 15 Series", keyword: "iPhone 15", desc: "Dynamic Island, cổng Type-C tiện lợi", badge: "Hot" },
    { id: "iphone-14", name: "iPhone 14 Series", keyword: "iPhone 14", desc: "Thiết kế bền bỉ, hiệu năng mượt mà", badge: "Giá tốt" },
    { id: "iphone-13", name: "iPhone 13 Series", keyword: "iPhone 13", desc: "Cấu hình chuẩn mực, pin bền", badge: "Tiết kiệm" },
  ],

  // Xiaomi: Phân dòng Flagship, Redmi Note, Redmi thường và POCO
  xiaomi: [
    { id: "xiaomi-flagship", name: "Xiaomi Series", keyword: "Xiaomi 1", desc: "Ống kính Leica, chip đầu bảng Snapdragon", badge: "Flagship" },
    { id: "redmi-note", name: "Redmi Note Series", keyword: "Redmi Note", desc: "Vua phân khúc tầm trung, camera 200MP", badge: "Bán chạy" },
    { id: "redmi", name: "Redmi Thường (A/C)", keyword: "Redmi 1", desc: "Giá rẻ bất ngờ, màn to pin khoẻ", badge: "Giá rẻ" },
    { id: "poco", name: "POCO Series", keyword: "POCO", desc: "Cấu hình quái vật chuyên chiến game", badge: "Gaming" },
  ],

  // OPPO: Phân dòng Find, Reno, A Series
  oppo: [
    { id: "oppo-find", name: "OPPO Find Series", keyword: "Find", desc: "Tuyệt tác flagship và gập Find N", badge: "Đỉnh cao" },
    { id: "oppo-reno", name: "OPPO Reno Series", keyword: "Reno", desc: "Chuyên gia chụp ảnh chân dung tỏa sáng", badge: "Chân dung" },
    { id: "oppo-a", name: "OPPO A Series", keyword: "OPPO A", desc: "Loa kép, pin trâu, sạc nhanh SuperVOOC", badge: "Bền bỉ" },
  ],

  // Google Pixel:
  google: [
    { id: "pixel-9", name: "Pixel 9 Series", keyword: "Pixel 9", desc: "Google AI đỉnh cao, chụp đêm tuyệt hảo", badge: "Thuần Android" },
    { id: "pixel-8", name: "Pixel 8 Series", keyword: "Pixel 8", desc: "Nhiếp ảnh chân thực, hỗ trợ 7 năm cập nhật", badge: "Giá tốt" },
  ],

  // Vivo:
  vivo: [
    { id: "vivo-x", name: "Vivo X Series", keyword: "Vivo X", desc: "Ống kính quang học ZEISS đỉnh cao", badge: "Camera ZEISS" },
    { id: "vivo-v", name: "Vivo V Series", keyword: "Vivo V", desc: "Vòng sáng Aura light chân dung thời trang", badge: "Thời trang" },
    { id: "vivo-y", name: "Vivo Y Series", keyword: "Vivo Y", desc: "Giá bình dân, pin siêu khỏe", badge: "Pin trâu" },
  ],
};

// Danh mục dòng máy nổi bật toàn sàn hiển thị ở trang chủ & thanh lọc nhanh
export const FEATURED_SERIES = [
  { brandName: "Samsung", brandId: 2, name: "Galaxy S Series", keyword: "Galaxy S", color: "from-blue-600 to-indigo-600" },
  { brandName: "Samsung", brandId: 2, name: "Galaxy A Series", keyword: "Galaxy A", color: "from-cyan-600 to-blue-500" },
  { brandName: "Apple", brandId: 1, name: "iPhone 16 Series", keyword: "iPhone 16", color: "from-purple-600 to-pink-600" },
  { brandName: "Apple", brandId: 1, name: "iPhone 15 Series", keyword: "iPhone 15", color: "from-slate-700 to-slate-900" },
  { brandName: "Xiaomi", brandId: 3, name: "Redmi Note Series", keyword: "Redmi Note", color: "from-orange-500 to-red-500" },
  { brandName: "OPPO", brandId: 4, name: "OPPO Reno Series", keyword: "Reno", color: "from-emerald-500 to-teal-600" },
];

/** Lấy danh sách series của một hãng bất kỳ theo ID hoặc Tên */
export function getSeriesForBrand(brand) {
  if (!brand) return [];
  const name = (typeof brand === "string" ? brand : brand.name || "").toLowerCase().trim();
  for (const [key, list] of Object.entries(SERIES_BY_BRAND)) {
    if (name.includes(key)) return list;
  }
  return [];
}
