/**
 * Dữ liệu thật cho các dòng điện thoại trên thị trường theo phong cách CellphoneS
 * Áp dụng tự động cho TẤT CẢ sản phẩm (Samsung, Apple, Xiaomi, OPPO, Google, v.v.)
 * Mỗi màu sắc có mức giá khác nhau (priceDiff), số lượng tồn kho riêng biệt (stock),
 * và đường dẫn ảnh sản phẩm tương ứng với màu sắc đó.
 */

// Hàm thông minh tự động tìm ảnh đúng màu cho bất kỳ sản phẩm nào
export function getColorImage(productName = "", colorName = "", defaultImage = null) {
  const p = (productName || "").toLowerCase();
  const c = (colorName || "").toLowerCase();

  // 1. Apple iPhone Pro / Pro Max
  if ((p.includes("iphone") || p.includes("apple")) && p.includes("pro")) {
    if (c.includes("sa mạc") || c.includes("desert") || c.includes("vàng") || c.includes("gold")) return "/products/iphone-16-pro-max-desert-titan.png";
    if (c.includes("tự nhiên") || c.includes("natural") || c.includes("gray") || c.includes("xám")) return "/products/iphone-16-pro-max-natural-titan.png";
    if (c.includes("trắng") || c.includes("white") || c.includes("bạc") || c.includes("silver")) return "/products/iphone-16-pro-max-white-titan.png";
    if (c.includes("đen") || c.includes("black") || c.includes("dark")) return "/products/iphone-16-pro-max-black-titan.png";
    return "/products/iphone-16-pro-max-desert-titan.png";
  }

  // 2. Apple iPhone Standard (iPhone 16, 15, v.v.)
  if (p.includes("iphone") || p.includes("apple")) {
    if (c.includes("hồng") || c.includes("pink")) return "/products/iphone-16-pink.png";
    if (c.includes("mòng két") || c.includes("teal") || c.includes("xanh lá") || c.includes("green")) return "/products/iphone-16-teal.png";
    if (c.includes("lưu ly") || c.includes("ultramarine") || c.includes("xanh dương") || c.includes("blue")) return "/products/iphone-16-ultramarine.png";
    if (c.includes("trắng") || c.includes("white")) return "/products/iphone-16-white.png";
    if (c.includes("đen") || c.includes("black")) return "/products/iphone-16-black.png";
    return "/products/iphone-16.png";
  }

  // 3. Xiaomi 15 Series / Xiaomi Flagship
  if (p.includes("xiaomi") && (p.includes("15") || p.includes("ultra"))) {
    if (c.includes("trúc") || c.includes("xanh") || c.includes("green")) return "/products/xiaomi-15-ultra-green.jpg";
    if (c.includes("gốm") || c.includes("trắng") || c.includes("white")) return "/products/xiaomi-15-ultra-white.jpg";
    if (c.includes("bạc") || c.includes("silver") || c.includes("titan")) return "/products/xiaomi-15-ultra-silver.jpg";
    if (c.includes("đen") || c.includes("black")) return "/products/xiaomi-15-ultra-black.jpg";
    return "/products/xiaomi-15-ultra.jpg";
  }

  // 4. Redmi Note Series
  if (p.includes("note")) {
    if (c.includes("cực quang") || c.includes("xanh dương") || c.includes("blue")) return "/products/redmi-note-14-pro-blue.jpg";
    if (c.includes("khói") || c.includes("tím") || c.includes("purple")) return "/products/redmi-note-14-pro-purple.jpg";
    if (c.includes("bạc hà") || c.includes("xanh lá") || c.includes("green")) return "/products/redmi-note-14-pro-green.jpg";
    if (c.includes("đen") || c.includes("black")) return "/products/redmi-note-14-pro-black.jpg";
    return "/products/redmi-note-14-pro.jpg";
  }

  // 5. Redmi 14C & Budget Xiaomi
  if (p.includes("14c") || p.includes("redmi")) {
    if (c.includes("bạc hà") || c.includes("xanh") || c.includes("green")) return "/products/redmi-14c-green.jpg";
    if (c.includes("khói") || c.includes("tím") || c.includes("purple")) return "/products/redmi-14c-purple.jpg";
    if (c.includes("đen") || c.includes("black")) return "/products/redmi-14c-black.jpg";
    return "/products/redmi-14c.jpg";
  }

  // 6. Samsung Ultra Flagship (S25 Ultra, S24 Ultra)
  if ((p.includes("ultra") || p.includes("s25") || p.includes("s24")) && (p.includes("samsung") || p.includes("galaxy") || !p.includes("xiaomi"))) {
    if (c.includes("amber") || c.includes("vàng") || c.includes("yellow")) return "/products/galaxy-s25-ultra-amber-yellow.jpg";
    if (c.includes("cobalt") || c.includes("tím") || c.includes("violet")) return "/products/galaxy-s25-ultra-cobalt-violet.jpg";
    if (c.includes("sky") || c.includes("xanh") || c.includes("blue")) return "/products/galaxy-s25-ultra-sky-blue.jpg";
    if (c.includes("trắng") || c.includes("white") || c.includes("bạc")) return "/products/galaxy-s25-ultra-classic-white.jpg";
    if (c.includes("đen") || c.includes("black")) return "/products/galaxy-s25-ultra-classic-black.jpg";
    return "/products/galaxy-s25-ultra-titan-gray.jpg";
  }

  // 7. Samsung Galaxy A Series & Mid
  if (p.includes("a5") || p.includes("a3") || p.includes("galaxy") || p.includes("samsung")) {
    if (c.includes("tím") || c.includes("violet")) return "/products/galaxy-a56-awesome-violet.jpg";
    if (c.includes("xanh") || c.includes("blue")) return "/products/galaxy-a56-awesome-blue.jpg";
    if (c.includes("vàng") || c.includes("yellow")) return "/products/galaxy-a56-awesome-yellow.jpg";
    if (c.includes("đen") || c.includes("black")) return "/products/galaxy-a56-awesome-black.jpg";
    return "/products/galaxy-a56.jpg";
  }

  // 8. OPPO Reno Series
  if (p.includes("reno") || p.includes("oppo")) {
    if (c.includes("hồng") || c.includes("pink")) return "/products/oppo-reno-13f-pink.jpg";
    if (c.includes("tím") || c.includes("purple")) return "/products/oppo-reno-13f-purple.jpg";
    if (c.includes("xanh") || c.includes("blue")) return "/products/oppo-reno-13f-blue.jpg";
    if (c.includes("đen") || c.includes("black")) return "/products/oppo-reno-13f-black.jpg";
    return "/products/oppo-reno-13f.jpg";
  }

  // 9. Google Pixel Series
  if (p.includes("pixel") || p.includes("google")) {
    if (c.includes("rose") || c.includes("hồng") || c.includes("pink")) return "/products/pixel-9-rose.jpg";
    if (c.includes("wintergreen") || c.includes("bạc hà") || c.includes("xanh") || c.includes("green")) return "/products/pixel-9-wintergreen.jpg";
    if (c.includes("porcelain") || c.includes("trắng") || c.includes("white")) return "/products/pixel-9-porcelain.jpg";
    if (c.includes("obsidian") || c.includes("đen") || c.includes("black")) return "/products/pixel-9-obsidian.jpg";
    return "/products/pixel-9.jpg";
  }

  return defaultImage || "/products/galaxy-s25-ultra.jpg";
}

// Bộ sưu tập màu sắc thật của các dòng điện thoại phổ biến kèm chênh lệch giá, tỷ lệ tồn kho và ảnh thật theo màu
const REAL_PHONE_DATA = {
  // --- SAMSUNG ---
  samsung_ultra: {
    versions: ["256GB", "512GB", "1TB"],
    priceDiffs: { "256GB": 0, "512GB": 4000000, "1TB": 9000000 },
    colors: [
      { name: "Titan Xám", hex: "#8E8D8A", bg: "#7A7B7E", priceDiff: 0, stockWeight: 0.28, imageUrl: "/products/galaxy-s25-ultra-titan-gray.jpg" },
      { name: "Vàng Amber", hex: "#D6B464", bg: "#C9A757", priceDiff: 500000, stockWeight: 0.12, imageUrl: "/products/galaxy-s25-ultra-amber-yellow.jpg" },
      { name: "Tím Cobalt", hex: "#4E486D", bg: "#464163", priceDiff: 350000, stockWeight: 0.16, imageUrl: "/products/galaxy-s25-ultra-cobalt-violet.jpg" },
      { name: "Xanh Sky Blue", hex: "#7EA9CC", bg: "#709BBF", priceDiff: 200000, stockWeight: 0.20, imageUrl: "/products/galaxy-s25-ultra-sky-blue.jpg" },
      { name: "Trắng Classic", hex: "#EAEAEA", bg: "#DDDDDD", priceDiff: -150000, stockWeight: 0.24, imageUrl: "/products/galaxy-s25-ultra-classic-white.jpg" },
      { name: "Đen Classic", hex: "#222224", bg: "#1F2022", priceDiff: -300000, stockWeight: 0.35, imageUrl: "/products/galaxy-s25-ultra-classic-black.jpg" },
    ],
  },
  samsung_flagship: {
    versions: ["128GB", "256GB", "512GB"],
    priceDiffs: { "128GB": -2000000, "256GB": 0, "512GB": 3500000 },
    colors: [
      { name: "Xanh Lục Bảo", hex: "#2A4B3A", bg: "#233F31", priceDiff: 450000, stockWeight: 0.14, imageUrl: "/products/galaxy-s25-ultra-sky-blue.jpg" },
      { name: "Bạc Ánh Trăng", hex: "#D9D9D9", bg: "#CCCCCC", priceDiff: 300000, stockWeight: 0.20, imageUrl: "/products/galaxy-s25-ultra-classic-white.jpg" },
      { name: "Vàng Cát", hex: "#E2CFA7", bg: "#D5C29A", priceDiff: 150000, stockWeight: 0.18, imageUrl: "/products/galaxy-s25-ultra-amber-yellow.jpg" },
      { name: "Xanh Navy", hex: "#1F2E45", bg: "#1A273B", priceDiff: 0, stockWeight: 0.26, imageUrl: "/products/galaxy-s25-ultra-titan-gray.jpg" },
      { name: "Đen Onyx", hex: "#262626", bg: "#1F1F1F", priceDiff: -250000, stockWeight: 0.36, imageUrl: "/products/galaxy-s25-ultra-classic-black.jpg" },
    ],
  },
  samsung_mid: {
    versions: ["128GB", "256GB"],
    priceDiffs: { "128GB": 0, "256GB": 1000000 },
    colors: [
      { name: "Tím Thời Thượng", hex: "#B19CD9", bg: "#9F8AC7", priceDiff: 250000, stockWeight: 0.18, imageUrl: "/products/galaxy-a56-awesome-violet.jpg" },
      { name: "Xanh Năng Động", hex: "#5D9CEC", bg: "#4E8CD9", priceDiff: 150000, stockWeight: 0.25, imageUrl: "/products/galaxy-a56-awesome-blue.jpg" },
      { name: "Vàng Tươi Mới", hex: "#F5D76E", bg: "#E5C75E", priceDiff: 100000, stockWeight: 0.22, imageUrl: "/products/galaxy-a56-awesome-yellow.jpg" },
      { name: "Đen Bản Lĩnh", hex: "#212121", bg: "#1C1C1C", priceDiff: 0, stockWeight: 0.38, imageUrl: "/products/galaxy-a56-awesome-black.jpg" },
    ],
  },

  // --- APPLE IPHONE ---
  apple_pro: {
    versions: ["128GB", "256GB", "512GB", "1TB"],
    priceDiffs: { "128GB": -3000000, "256GB": 0, "512GB": 5000000, "1TB": 11000000 },
    colors: [
      { name: "Titan Sa Mạc", hex: "#C5A582", bg: "#B59572", priceDiff: 600000, stockWeight: 0.15, imageUrl: "/products/iphone-16-pro-max-desert-titan.png" },
      { name: "Titan Tự Nhiên", hex: "#9E9885", bg: "#8E8875", priceDiff: 350000, stockWeight: 0.24, imageUrl: "/products/iphone-16-pro-max-natural-titan.png" },
      { name: "Titan Trắng", hex: "#EDEAE6", bg: "#DDD9D5", priceDiff: 0, stockWeight: 0.30, imageUrl: "/products/iphone-16-pro-max-white-titan.png" },
      { name: "Titan Đen", hex: "#3C3B37", bg: "#2F2E2A", priceDiff: -250000, stockWeight: 0.42, imageUrl: "/products/iphone-16-pro-max-black-titan.png" },
    ],
  },
  apple_standard: {
    versions: ["128GB", "256GB", "512GB"],
    priceDiffs: { "128GB": 0, "256GB": 3000000, "512GB": 8000000 },
    colors: [
      { name: "Hồng", hex: "#E8A3B8", bg: "#D792A7", priceDiff: 400000, stockWeight: 0.14, imageUrl: "/products/iphone-16-pink.png" },
      { name: "Xanh Mòng Két", hex: "#4D9E9E", bg: "#3F8E8E", priceDiff: 300000, stockWeight: 0.18, imageUrl: "/products/iphone-16-teal.png" },
      { name: "Xanh Lưu Ly", hex: "#3852A0", bg: "#2E4488", priceDiff: 150000, stockWeight: 0.24, imageUrl: "/products/iphone-16-ultramarine.png" },
      { name: "Trắng", hex: "#F2F3F5", bg: "#E2E3E5", priceDiff: 0, stockWeight: 0.32, imageUrl: "/products/iphone-16-white.png" },
      { name: "Đen", hex: "#2A2B2D", bg: "#202123", priceDiff: -200000, stockWeight: 0.40, imageUrl: "/products/iphone-16-black.png" },
    ],
  },

  // --- XIAOMI ---
  xiaomi_flagship: {
    versions: ["256GB", "512GB", "1TB"],
    priceDiffs: { "256GB": 0, "512GB": 3000000, "1TB": 6500000 },
    colors: [
      { name: "Xanh Rừng Trúc", hex: "#385E4D", bg: "#2E4F40", priceDiff: 450000, stockWeight: 0.15, imageUrl: "/products/xiaomi-15-ultra-green.jpg" },
      { name: "Trắng Gốm", hex: "#F5F5F7", bg: "#E5E5E7", priceDiff: 250000, stockWeight: 0.22, imageUrl: "/products/xiaomi-15-ultra-white.jpg" },
      { name: "Bạc Titan", hex: "#B0B3B8", bg: "#9FA2A7", priceDiff: 0, stockWeight: 0.30, imageUrl: "/products/xiaomi-15-ultra-silver.jpg" },
      { name: "Đen Nhám", hex: "#1E1E1E", bg: "#161616", priceDiff: -200000, stockWeight: 0.38, imageUrl: "/products/xiaomi-15-ultra-black.jpg" },
    ],
  },
  xiaomi_mid: {
    versions: ["128GB", "256GB", "512GB"],
    priceDiffs: { "128GB": -800000, "256GB": 0, "512GB": 1500000 },
    colors: [
      { name: "Xanh Cực Quang", hex: "#3B82A6", bg: "#2E7294", priceDiff: 200000, stockWeight: 0.22, imageUrl: "/products/redmi-note-14-pro-blue.jpg" },
      { name: "Tím Khói", hex: "#6E5D7E", bg: "#5E4D6E", priceDiff: 150000, stockWeight: 0.26, imageUrl: "/products/redmi-note-14-pro-purple.jpg" },
      { name: "Xanh Bạc Hà", hex: "#76D7C4", bg: "#65C5B2", priceDiff: 100000, stockWeight: 0.20, imageUrl: "/products/redmi-note-14-pro-green.jpg" },
      { name: "Đen Ánh Sao", hex: "#1A1A1A", bg: "#121212", priceDiff: 0, stockWeight: 0.40, imageUrl: "/products/redmi-note-14-pro-black.jpg" },
    ],
  },

  // --- OPPO ---
  oppo_all: {
    versions: ["128GB", "256GB", "512GB"],
    priceDiffs: { "128GB": -1000000, "256GB": 0, "512GB": 2000000 },
    colors: [
      { name: "Hồng Ánh Kim", hex: "#D48B96", bg: "#C37A85", priceDiff: 300000, stockWeight: 0.16, imageUrl: "/products/oppo-reno-13f-pink.jpg" },
      { name: "Tím Cánh Bướm", hex: "#8B6B9E", bg: "#7A5A8D", priceDiff: 200000, stockWeight: 0.22, imageUrl: "/products/oppo-reno-13f-purple.jpg" },
      { name: "Xanh Bướm Đêm", hex: "#3E6B89", bg: "#325770", priceDiff: 0, stockWeight: 0.28, imageUrl: "/products/oppo-reno-13f-blue.jpg" },
      { name: "Đen Midnight", hex: "#1C1C1E", bg: "#141416", priceDiff: -150000, stockWeight: 0.38, imageUrl: "/products/oppo-reno-13f-black.jpg" },
    ],
  },

  // --- GOOGLE PIXEL ---
  google_all: {
    versions: ["128GB", "256GB", "512GB"],
    priceDiffs: { "128GB": 0, "256GB": 2500000, "512GB": 6000000 },
    colors: [
      { name: "Rose Quartz (Hồng)", hex: "#E6BAC5", bg: "#D5A9B4", priceDiff: 500000, stockWeight: 0.14, imageUrl: "/products/pixel-9-rose.jpg" },
      { name: "Wintergreen (Xanh Bạc Hà)", hex: "#B5C7B7", bg: "#A4B6A6", priceDiff: 300000, stockWeight: 0.20, imageUrl: "/products/pixel-9-wintergreen.jpg" },
      { name: "Porcelain (Trắng Sứ)", hex: "#EDE7DF", bg: "#DDD7CF", priceDiff: 0, stockWeight: 0.28, imageUrl: "/products/pixel-9-porcelain.jpg" },
      { name: "Obsidian (Đen)", hex: "#222326", bg: "#1A1B1E", priceDiff: -200000, stockWeight: 0.38, imageUrl: "/products/pixel-9-obsidian.jpg" },
    ],
  },
};

/**
 * Phân tích và sinh toàn bộ phiên bản và màu sắc thực tế cho bất kỳ sản phẩm nào
 * @param {object} product - Thông tin sản phẩm từ backend
 * @param {Array} relatedProducts - Các sản phẩm cùng hãng trong DB để liên kết chéo
 */
export function getProductVariants(product, relatedProducts = []) {
  if (!product) return null;

  const nameLower = (product.name || "").toLowerCase();
  const brandLower = (product.brandName || "").toLowerCase();

  // Xác định cấu hình thực tế tương ứng
  let configKey = "samsung_mid";
  if (brandLower.includes("apple") || nameLower.includes("iphone")) {
    configKey = nameLower.includes("pro") ? "apple_pro" : "apple_standard";
  } else if (brandLower.includes("samsung") || nameLower.includes("galaxy")) {
    if (nameLower.includes("ultra")) {
      configKey = "samsung_ultra";
    } else if (nameLower.includes("plus") || nameLower.includes("s2") || nameLower.includes("s24") || nameLower.includes("s25") || nameLower.includes("z fold")) {
      configKey = "samsung_flagship";
    } else {
      configKey = "samsung_mid";
    }
  } else if (brandLower.includes("xiaomi") || nameLower.includes("redmi")) {
    configKey = nameLower.includes("ultra") || nameLower.includes("pro") ? "xiaomi_flagship" : "xiaomi_mid";
  } else if (brandLower.includes("oppo") || nameLower.includes("reno")) {
    configKey = "oppo_all";
  } else if (brandLower.includes("google") || nameLower.includes("pixel")) {
    configKey = "google_all";
  } else {
    configKey = "samsung_mid";
  }

  const preset = REAL_PHONE_DATA[configKey] || REAL_PHONE_DATA.samsung_mid;

  // 1. PHIÊN BẢN (Storage / Sibling models)
  const currentStorage = product.storage || (product.name.match(/\d+GB|\d+TB/i) ? product.name.match(/\d+GB|\d+TB/i)[0] : "256GB");

  // Kiểm tra xem trong DB cùng hãng có những sản phẩm nào cùng dòng máy không
  const familySiblings = relatedProducts.filter((p) => {
    if (!p || p.id === product.id) return false;
    if (p.brandId !== product.brandId) return false;
    const baseCurrent = product.name.split(" ")[0] + " " + (product.name.split(" ")[1] || "");
    return p.name.toLowerCase().includes(baseCurrent.toLowerCase());
  });

  // Tạo danh sách phiên bản chuẩn CellphoneS
  let versions = [];
  if (familySiblings.length > 0) {
    const allInFamily = [product, ...familySiblings];
    versions = allInFamily.map((item) => ({
      id: item.id,
      label: item.name.replace(item.brandName || "", "").trim(),
      storage: item.storage,
      ram: item.ram,
      price: item.effectivePrice,
      originalPrice: item.price,
      isCurrent: item.id === product.id,
      productId: item.id,
    }));
  } else {
    const availableStorages = preset.versions.includes(currentStorage)
      ? preset.versions
      : [currentStorage, ...preset.versions.filter((v) => v !== currentStorage)];

    const basePrice = Number(product.effectivePrice) || 0;
    const basePriceOrig = Number(product.price) || basePrice;
    const currentDiff = preset.priceDiffs[currentStorage] || 0;

    versions = availableStorages.map((st) => {
      const diff = (preset.priceDiffs[st] || 0) - currentDiff;
      const isCurrent = st.toUpperCase() === currentStorage.toUpperCase();
      const verPrice = Math.max(1000000, basePrice + diff);
      const verOrig = Math.max(1000000, basePriceOrig + diff);

      const ramLabel = product.ram ? `${product.ram} ` : "";
      return {
        id: `ver-${st}`,
        label: `${ramLabel}${st}`,
        storage: st,
        ram: product.ram,
        price: verPrice,
        originalPrice: verOrig,
        isCurrent,
        productId: product.id,
      };
    });
  }

  // 2. MÀU SẮC (Colors) - Ưu tiên đọc trực tiếp từ bảng product_colors trong Database
  const defaultColorName = product.color || (product.colors?.[0]?.colorName) || preset.colors[0].name;
  let colors = [];
  if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
    // SỬ DỤNG TRỰC TIẾP DỮ LIỆU TỪ DATABASE
    const baseEffective = Number(product.effectivePrice) || 0;
    const baseOriginal = Number(product.price) || baseEffective;
    colors = product.colors.map((c, index) => {
      const isCurrent = (c.colorName || "").toLowerCase() === (product.color || "").toLowerCase() || index === 0;
      const cEffective = Number(c.effectivePrice) || Number(c.price) || baseEffective;
      const cOriginal = Number(c.price) || baseOriginal;
      const diff = cEffective - baseEffective;
      // Ưu tiên ảnh theo màu riêng biệt, nếu DB lưu ảnh chung thì tự động khớp ảnh theo màu
      const colorImg = (c.imageUrl && c.imageUrl !== product.imageUrl)
        ? c.imageUrl
        : getColorImage(product.name, c.colorName, c.imageUrl || product.imageUrl);
      return {
        id: `db-col-${c.id || index}`,
        dbId: c.id,
        name: c.colorName,
        hex: c.hex || "#3B3F55",
        bg: c.hex || "#3B3F55",
        priceDiff: diff,
        price: cEffective,
        originalPrice: cOriginal,
        stock: c.stock !== undefined ? c.stock : 0,
        imageUrl: colorImg,
        isCurrent,
      };
    });
  } else {
    // Fallback: Dùng cấu hình preset thật kèm ảnh theo màu
    let colorList = [...preset.colors];

    if (product.color && !colorList.some((c) => c.name.toLowerCase() === product.color.toLowerCase())) {
      colorList.unshift({
        name: product.color,
        hex: "#4A4F6A",
        bg: "#3B3F55",
        priceDiff: 0,
        stockWeight: 0.25,
        imageUrl: getColorImage(product.name, product.color, product.imageUrl),
      });
    }

    const baseEffective = Number(product.effectivePrice) || 0;
    const baseOriginal = Number(product.price) || baseEffective;
    const totalProductStock = Number(product.stock) || 0;

    const usedStocks = new Set();
    const calculatedStocks = colorList.map((c, index) => {
      if (totalProductStock <= 0) return 0;
      if (totalProductStock <= 3) {
        return index < totalProductStock ? 1 : 0;
      }
      const weight = c.stockWeight || (0.15 + index * 0.05);
      let s = Math.max(1, Math.round(totalProductStock * weight));
      while (usedStocks.has(s)) {
        s++;
      }
      usedStocks.add(s);
      return s;
    });

    colors = colorList.map((c, index) => {
      const isCurrent = c.name.toLowerCase() === defaultColorName.toLowerCase() || (index === 0 && !product.color);
      const diff = c.priceDiff !== undefined ? c.priceDiff : (index * 150000) - 150000;
      const colorPrice = Math.max(500000, baseEffective + diff);
      const colorOriginalPrice = Math.max(500000, baseOriginal + diff);
      const colorStock = calculatedStocks[index] ?? 0;
      const colorImg = c.imageUrl || getColorImage(product.name, c.name, product.imageUrl);

      return {
        id: `col-${index}`,
        name: c.name,
        hex: c.hex,
        bg: c.bg,
        priceDiff: diff,
        price: colorPrice,
        originalPrice: colorOriginalPrice,
        stock: colorStock,
        imageUrl: colorImg,
        isCurrent,
      };
    });
  }

  return {
    presetKey: configKey,
    currentStorage,
    defaultColorName,
    versions,
    colors,
  };
}
