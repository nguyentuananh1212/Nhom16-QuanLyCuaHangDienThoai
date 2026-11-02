package com.example.Nhom16_QuanLyCuaHangDienThoai.config;

import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.Brand;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.Category;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.Order;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.Product;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.ProductColor;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.User;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.Voucher;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.DiscountType;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.OrderStatus;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.Role;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.BrandRepository;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.CategoryRepository;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.OrderRepository;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.ProductColorRepository;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.ProductRepository;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.UserRepository;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Tạo tài khoản admin và dữ liệu mẫu khi DB còn trống.
 * Lưu trữ trực tiếp bảng màu sắc (ProductColor) với giá và số lượng riêng biệt vào database.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
public class DataInitializer implements ApplicationRunner {
    private final UserRepository userRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductColorRepository productColorRepository;
    private final OrderRepository orderRepository;
    private final VoucherRepository voucherRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.admin-email}")
    private String adminEmail;
    @Value("${app.seed.admin-password}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!userRepository.existsByEmailIgnoreCase(adminEmail)) {
            userRepository.save(User.builder().email(adminEmail.toLowerCase())
                    .password(passwordEncoder.encode(adminPassword))
                    .fullName("Quản trị viên").role(Role.ADMIN).build());
            log.info("Đã tạo tài khoản admin: {}", adminEmail);
        }

        if (productRepository.count() == 0) {
            seedInitialProducts();
        } else {
            // Đảm bảo tất cả sản phẩm hiện có trong database đều có danh sách màu sắc với giá và số lượng riêng
            ensureProductColorsInDatabase();
        }

        if (voucherRepository.count() == 0) {
            seedVouchers();
        }
    }

    private void seedVouchers() {
        voucherRepository.saveAll(List.of(
                Voucher.builder()
                        .code("CHAOBANMOI")
                        .name("Ưu Đãi Khách Hàng Mới")
                        .description("Giảm ngay 200.000₫ cho đơn hàng điện thoại từ 3.000.000₫")
                        .discountType(DiscountType.FIXED_AMOUNT)
                        .discountValue(BigDecimal.valueOf(200000))
                        .minOrderAmount(BigDecimal.valueOf(3000000))
                        .quantity(100)
                        .usedCount(0)
                        .startDate(java.time.LocalDate.of(2026, 1, 1))
                        .endDate(java.time.LocalDate.of(2026, 12, 31))
                        .active(true)
                        .build(),
                Voucher.builder()
                        .code("LENDOISANG")
                        .name("Trợ Giá Lên Đời Smartphone")
                        .description("Giảm ngay 500.000₫ khi mua smartphone từ 10.000.000₫")
                        .discountType(DiscountType.FIXED_AMOUNT)
                        .discountValue(BigDecimal.valueOf(500000))
                        .minOrderAmount(BigDecimal.valueOf(10000000))
                        .quantity(50)
                        .usedCount(0)
                        .startDate(java.time.LocalDate.of(2026, 1, 1))
                        .endDate(java.time.LocalDate.of(2026, 12, 31))
                        .active(true)
                        .build(),
                Voucher.builder()
                        .code("FLAGSHIP1TR")
                        .name("Đặc Quyền Siêu Phẩm Flagship")
                        .description("Giảm thẳng 1.000.000₫ cho các dòng cao cấp (iPhone Pro Max, Galaxy Ultra) từ 20.000.000₫")
                        .discountType(DiscountType.FIXED_AMOUNT)
                        .discountValue(BigDecimal.valueOf(1000000))
                        .minOrderAmount(BigDecimal.valueOf(20000000))
                        .quantity(30)
                        .usedCount(0)
                        .startDate(java.time.LocalDate.of(2026, 1, 1))
                        .endDate(java.time.LocalDate.of(2026, 12, 31))
                        .active(true)
                        .build(),
                Voucher.builder()
                        .code("TRIAN5PT")
                        .name("Tri Ân Khách Hàng Thân Thiết")
                        .description("Giảm 5% (tối đa 600.000₫) cho đơn hàng điện thoại từ 5.000.000₫")
                        .discountType(DiscountType.PERCENT)
                        .discountValue(BigDecimal.valueOf(5))
                        .minOrderAmount(BigDecimal.valueOf(5000000))
                        .maxDiscountAmount(BigDecimal.valueOf(600000))
                        .quantity(80)
                        .usedCount(0)
                        .startDate(java.time.LocalDate.of(2026, 1, 1))
                        .endDate(java.time.LocalDate.of(2026, 12, 31))
                        .active(true)
                        .build()
        ));
        log.info("Đã khởi tạo các mã giảm giá mẫu chuyên dụng cho cửa hàng điện thoại");
    }

    private void seedInitialProducts() {
        Map<String, Brand> brands = new java.util.HashMap<>();
        for (String n : new String[]{"Apple", "Samsung", "Xiaomi", "OPPO", "Google"}) {
            brands.put(n, brandRepository.save(Brand.builder().name(n).build()));
        }
        Category flagship = categoryRepository.save(Category.builder().name("Flagship").description("Dòng cao cấp").build());
        Category mid = categoryRepository.save(Category.builder().name("Tầm trung").description("Hiệu năng/giá tốt").build());
        Category budget = categoryRepository.save(Category.builder().name("Phổ thông").description("Giá dễ tiếp cận").build());

        // 1. Seed Apple iPhone 16 Pro Max
        saveWithColors("iPhone 16 Pro Max 256GB", brands.get("Apple"), flagship, 34990000, 32490000, 27, true,
                "6.9\" OLED 120Hz", "Apple A18 Pro", "8GB", "256GB", "48MP + 48MP + 12MP", "4685 mAh", "Titan Sa Mạc", "/products/iphone-16-pro-max.png",
                List.of(
                        new ColorSeed("Titan Sa Mạc", "#C5A582", 35590000, 33090000, 5, "/products/iphone-16-pro-max-desert-titan.png"),
                        new ColorSeed("Titan Tự Nhiên", "#9E9885", 35340000, 32840000, 4, "/products/iphone-16-pro-max-natural-titan.png"),
                        new ColorSeed("Titan Trắng", "#EDEAE6", 34990000, 32490000, 11, "/products/iphone-16-pro-max-white-titan.png"),
                        new ColorSeed("Titan Đen", "#3C3B37", 34740000, 32240000, 7, "/products/iphone-16-pro-max-black-titan.png")
                ));

        // 2. Seed Apple iPhone 16
        saveWithColors("iPhone 16 128GB", brands.get("Apple"), flagship, 22990000, null, 77, true,
                "6.1\" OLED", "Apple A18", "8GB", "128GB", "48MP + 12MP", "3561 mAh", "Xanh Mòng Két", "/products/iphone-16.png",
                List.of(
                        new ColorSeed("Hồng", "#E8A3B8", 23390000, null, 7, "/products/iphone-16-pink.png"),
                        new ColorSeed("Xanh Mòng Két", "#4D9E9E", 23290000, null, 9, "/products/iphone-16-teal.png"),
                        new ColorSeed("Xanh Lưu Ly", "#3852A0", 23140000, null, 15, "/products/iphone-16-ultramarine.png"),
                        new ColorSeed("Trắng", "#F2F3F5", 22990000, null, 20, "/products/iphone-16-white.png"),
                        new ColorSeed("Đen", "#2A2B2D", 22790000, null, 26, "/products/iphone-16-black.png")
                ));

        // 3. Seed Samsung Galaxy S25 Ultra
        saveWithColors("Galaxy S25 Ultra 256GB", brands.get("Samsung"), flagship, 33990000, 29990000, 27, true,
                "6.9\" Dynamic AMOLED 2X", "Snapdragon 8 Elite", "12GB", "256GB", "200MP + 50MP + 50MP + 10MP", "5000 mAh", "Titan Xám", "/products/galaxy-s25-ultra.jpg",
                List.of(
                        new ColorSeed("Vàng Amber", "#D6B464", 34490000, 30490000, 2, "/products/galaxy-s25-ultra-amber-yellow.jpg"),
                        new ColorSeed("Tím Cobalt", "#4E486D", 34340000, 30340000, 3, "/products/galaxy-s25-ultra-cobalt-violet.jpg"),
                        new ColorSeed("Xanh Sky Blue", "#7EA9CC", 34190000, 30190000, 4, "/products/galaxy-s25-ultra-sky-blue.jpg"),
                        new ColorSeed("Titan Xám", "#8E8D8A", 33990000, 29990000, 5, "/products/galaxy-s25-ultra-titan-gray.jpg"),
                        new ColorSeed("Trắng Classic", "#EAEAEA", 33840000, 29840000, 6, "/products/galaxy-s25-ultra-classic-white.jpg"),
                        new ColorSeed("Đen Classic", "#222224", 33690000, 29690000, 7, "/products/galaxy-s25-ultra-classic-black.jpg")
                ));

        // 4. Seed Samsung Galaxy A56 5G
        saveWithColors("Galaxy A56 5G", brands.get("Samsung"), mid, 10990000, 9990000, 70, false,
                "6.7\" Super AMOLED", "Exynos 1580", "8GB", "128GB", "50MP + 12MP + 5MP", "5000 mAh", "Đen Bản Lĩnh", "/products/galaxy-a56.jpg",
                List.of(
                        new ColorSeed("Tím Thời Thượng", "#B19CD9", 11240000, 10240000, 12, "/products/galaxy-a56-awesome-violet.jpg"),
                        new ColorSeed("Xanh Năng Động", "#5D9CEC", 11140000, 10140000, 18, "/products/galaxy-a56-awesome-blue.jpg"),
                        new ColorSeed("Vàng Tươi Mới", "#F5D76E", 11090000, 10090000, 15, "/products/galaxy-a56-awesome-yellow.jpg"),
                        new ColorSeed("Đen Bản Lĩnh", "#212121", 10990000, 9990000, 25, "/products/galaxy-a56-awesome-black.jpg")
                ));

        // 5. Xiaomi 15 Ultra
        saveWithColors("Xiaomi 15 Ultra", brands.get("Xiaomi"), flagship, 32990000, null, 17, false,
                "6.73\" AMOLED", "Snapdragon 8 Elite", "16GB", "512GB", "50MP x4 Leica", "5410 mAh", "Bạc Titan", "/products/xiaomi-15-ultra.jpg",
                List.of(
                        new ColorSeed("Xanh Rừng Trúc", "#385E4D", 33440000, null, 2, "/products/xiaomi-15-ultra-green.jpg"),
                        new ColorSeed("Trắng Gốm", "#F5F5F7", 33240000, null, 4, "/products/xiaomi-15-ultra-white.jpg"),
                        new ColorSeed("Bạc Titan", "#B0B3B8", 32990000, null, 5, "/products/xiaomi-15-ultra-silver.jpg"),
                        new ColorSeed("Đen Nhám", "#1E1E1E", 32790000, null, 6, "/products/xiaomi-15-ultra-black.jpg")
                ));

        // 6. Redmi Note 14 Pro
        saveWithColors("Redmi Note 14 Pro", brands.get("Xiaomi"), mid, 8490000, 7690000, 90, true,
                "6.67\" AMOLED 120Hz", "Helio G100 Ultra", "8GB", "256GB", "200MP + 8MP + 2MP", "5500 mAh", "Tím Khói", "/products/redmi-note-14-pro.jpg",
                List.of(
                        new ColorSeed("Xanh Cực Quang", "#3B82A6", 8690000, 7890000, 18, "/products/redmi-note-14-pro-blue.jpg"),
                        new ColorSeed("Tím Khói", "#6E5D7E", 8640000, 7840000, 22, "/products/redmi-note-14-pro-purple.jpg"),
                        new ColorSeed("Xanh Bạc Hà", "#76D7C4", 8590000, 7790000, 20, "/products/redmi-note-14-pro-green.jpg"),
                        new ColorSeed("Đen Ánh Sao", "#1A1A1A", 8490000, 7690000, 30, "/products/redmi-note-14-pro-black.jpg")
                ));

        // 7. OPPO Reno13 F
        saveWithColors("OPPO Reno13 F", brands.get("OPPO"), mid, 8990000, null, 55, false,
                "6.67\" AMOLED", "Helio G100", "8GB", "256GB", "50MP + 8MP + 2MP", "5800 mAh", "Xanh Bướm Đêm", "/products/oppo-reno-13f.jpg",
                List.of(
                        new ColorSeed("Hồng Ánh Kim", "#D48B96", 9290000, null, 8, "/products/oppo-reno-13f-pink.jpg"),
                        new ColorSeed("Tím Cánh Bướm", "#8B6B9E", 9190000, null, 12, "/products/oppo-reno-13f-purple.jpg"),
                        new ColorSeed("Xanh Bướm Đêm", "#3E6B89", 8990000, null, 15, "/products/oppo-reno-13f-blue.jpg"),
                        new ColorSeed("Đen Midnight", "#1C1C1E", 8840000, null, 20, "/products/oppo-reno-13f-black.jpg")
                ));

        // 8. Redmi 14C
        saveWithColors("Redmi 14C", brands.get("Xiaomi"), budget, 3490000, 2990000, 130, false,
                "6.88\" IPS 120Hz", "Helio G81 Ultra", "4GB", "128GB", "50MP", "5160 mAh", "Đen", "/products/redmi-14c.jpg",
                List.of(
                        new ColorSeed("Xanh Bạc Hà", "#76D7C4", 3590000, 3090000, 35, "/products/redmi-14c-green.jpg"),
                        new ColorSeed("Tím Khói", "#6E5D7E", 3540000, 3040000, 40, "/products/redmi-14c-purple.jpg"),
                        new ColorSeed("Đen", "#1A1A1A", 3490000, 2990000, 55, "/products/redmi-14c-black.jpg")
                ));

        // 9. Pixel 9
        saveWithColors("Pixel 9", brands.get("Google"), flagship, 21990000, 19990000, 3, false,
                "6.3\" OLED 120Hz", "Google Tensor G4", "12GB", "128GB", "50MP + 48MP", "4700 mAh", "Hồng", "/products/pixel-9.jpg",
                List.of(
                        new ColorSeed("Rose Quartz (Hồng)", "#E6BAC5", 22490000, 20490000, 1, "/products/pixel-9-rose.jpg"),
                        new ColorSeed("Wintergreen (Xanh Bạc Hà)", "#B5C7B7", 22290000, 20290000, 1, "/products/pixel-9-wintergreen.jpg"),
                        new ColorSeed("Porcelain (Trắng Sứ)", "#EDE7DF", 21990000, 19990000, 1, "/products/pixel-9-porcelain.jpg"),
                        new ColorSeed("Obsidian (Đen)", "#222326", 21790000, 19790000, 0, "/products/pixel-9-obsidian.jpg")
                ));

        log.info("Đã tạo dữ liệu mẫu kèm các màu sắc, giá và số lượng lưu trực tiếp vào database");
    }

    /**
     * Tự động kiểm tra và thêm màu sắc vào database nếu sản phẩm chưa có,
     * đồng thời cập nhật đúng đường dẫn ảnh tương ứng cho từng màu sắc trong DB.
     */
    private void ensureProductColorsInDatabase() {
        List<Product> products = productRepository.findAll();
        boolean hasUpdated = false;
        for (Product p : products) {
            boolean productNeedSave = false;
            // Đảm bảo có giá vốn nhập vào được lưu trong Database
            if (p.getCostPrice() == null && p.getPrice() != null) {
                p.setCostPrice(BigDecimal.valueOf(Math.round(p.getPrice().doubleValue() * 0.78)));
                productNeedSave = true;
                hasUpdated = true;
            }

            if (p.getColors() == null || p.getColors().isEmpty()) {
                List<ColorSeed> seeds = generateDefaultColorSeeds(p);
                for (ColorSeed cs : seeds) {
                    String colorImg = cs.imageUrl != null ? cs.imageUrl : resolveColorImage(p.getName(), cs.name, p.getImageUrl());
                    ProductColor pc = ProductColor.builder()
                            .product(p)
                            .colorName(cs.name)
                            .hex(cs.hex)
                            .price(BigDecimal.valueOf(cs.price))
                            .salePrice(cs.salePrice == null ? null : BigDecimal.valueOf(cs.salePrice))
                            .stock(cs.stock)
                            .imageUrl(colorImg)
                            .build();
                    p.addColor(pc);
                }
                productNeedSave = true;
                hasUpdated = true;
            } else {
                // Đảm bảo các màu đã có trong database đều được gắn đường dẫn ảnh đúng màu
                for (ProductColor pc : p.getColors()) {
                    String resolved = resolveColorImage(p.getName(), pc.getColorName(), p.getImageUrl());
                    if (pc.getImageUrl() == null || (p.getImageUrl() != null && pc.getImageUrl().equals(p.getImageUrl()) && !resolved.equals(p.getImageUrl()))) {
                        pc.setImageUrl(resolved);
                        productNeedSave = true;
                        hasUpdated = true;
                    }
                }
            }

            if (productNeedSave) {
                productRepository.save(p);
            }
        }
        if (hasUpdated) {
            log.info("Đã cập nhật bảng màu sắc, giá nhập và ảnh sản phẩm trực tiếp vào database cho tất cả sản phẩm!");
        }
    }

    public static String resolveColorImage(String productName, String colorName, String defaultImage) {
        String p = (productName != null ? productName : "").toLowerCase();
        String c = (colorName != null ? colorName : "").toLowerCase();

        // 1. Apple iPhone Pro / Pro Max
        if ((p.contains("iphone") || p.contains("apple")) && p.contains("pro")) {
            if (c.contains("sa mạc") || c.contains("desert") || c.contains("vàng") || c.contains("gold")) return "/products/iphone-16-pro-max-desert-titan.png";
            if (c.contains("tự nhiên") || c.contains("natural") || c.contains("gray") || c.contains("xám")) return "/products/iphone-16-pro-max-natural-titan.png";
            if (c.contains("trắng") || c.contains("white") || c.contains("bạc") || c.contains("silver")) return "/products/iphone-16-pro-max-white-titan.png";
            if (c.contains("đen") || c.contains("black") || c.contains("dark")) return "/products/iphone-16-pro-max-black-titan.png";
            return "/products/iphone-16-pro-max-desert-titan.png";
        }

        // 2. Apple iPhone Standard
        if (p.contains("iphone") || p.contains("apple")) {
            if (c.contains("hồng") || c.contains("pink")) return "/products/iphone-16-pink.png";
            if (c.contains("mòng két") || c.contains("teal") || c.contains("xanh lá") || c.contains("green")) return "/products/iphone-16-teal.png";
            if (c.contains("lưu ly") || c.contains("ultramarine") || c.contains("xanh dương") || c.contains("blue")) return "/products/iphone-16-ultramarine.png";
            if (c.contains("trắng") || c.contains("white")) return "/products/iphone-16-white.png";
            if (c.contains("đen") || c.contains("black")) return "/products/iphone-16-black.png";
            return "/products/iphone-16.png";
        }

        // 3. Xiaomi 15 Series / Xiaomi Flagship
        if (p.contains("xiaomi") && (p.contains("15") || p.contains("ultra"))) {
            if (c.contains("trúc") || c.contains("xanh") || c.contains("green")) return "/products/xiaomi-15-ultra-green.jpg";
            if (c.contains("gốm") || c.contains("trắng") || c.contains("white")) return "/products/xiaomi-15-ultra-white.jpg";
            if (c.contains("bạc") || c.contains("silver") || c.contains("titan")) return "/products/xiaomi-15-ultra-silver.jpg";
            if (c.contains("đen") || c.contains("black")) return "/products/xiaomi-15-ultra-black.jpg";
            return "/products/xiaomi-15-ultra.jpg";
        }

        // 4. Redmi Note Series
        if (p.contains("note")) {
            if (c.contains("cực quang") || c.contains("xanh dương") || c.contains("blue")) return "/products/redmi-note-14-pro-blue.jpg";
            if (c.contains("khói") || c.contains("tím") || c.contains("purple")) return "/products/redmi-note-14-pro-purple.jpg";
            if (c.contains("bạc hà") || c.contains("xanh lá") || c.contains("green")) return "/products/redmi-note-14-pro-green.jpg";
            if (c.contains("đen") || c.contains("black")) return "/products/redmi-note-14-pro-black.jpg";
            return "/products/redmi-note-14-pro.jpg";
        }

        // 5. Redmi 14C & Budget
        if (p.contains("14c") || p.contains("redmi")) {
            if (c.contains("bạc hà") || c.contains("xanh") || c.contains("green")) return "/products/redmi-14c-green.jpg";
            if (c.contains("khói") || c.contains("tím") || c.contains("purple")) return "/products/redmi-14c-purple.jpg";
            if (c.contains("đen") || c.contains("black")) return "/products/redmi-14c-black.jpg";
            return "/products/redmi-14c.jpg";
        }

        // 6. Samsung Ultra Flagship
        if ((p.contains("ultra") || p.contains("s25") || p.contains("s24")) && (p.contains("samsung") || p.contains("galaxy") || !p.contains("xiaomi"))) {
            if (c.contains("amber") || c.contains("vàng") || c.contains("yellow")) return "/products/galaxy-s25-ultra-amber-yellow.jpg";
            if (c.contains("cobalt") || c.contains("tím") || c.contains("violet")) return "/products/galaxy-s25-ultra-cobalt-violet.jpg";
            if (c.contains("sky") || c.contains("xanh") || c.contains("blue")) return "/products/galaxy-s25-ultra-sky-blue.jpg";
            if (c.contains("trắng") || c.contains("white") || c.contains("bạc")) return "/products/galaxy-s25-ultra-classic-white.jpg";
            if (c.contains("đen") || c.contains("black")) return "/products/galaxy-s25-ultra-classic-black.jpg";
            return "/products/galaxy-s25-ultra-titan-gray.jpg";
        }

        // 7. Samsung A Series & Mid
        if (p.contains("a5") || p.contains("a3") || p.contains("galaxy") || p.contains("samsung")) {
            if (c.contains("tím") || c.contains("violet")) return "/products/galaxy-a56-awesome-violet.jpg";
            if (c.contains("xanh") || c.contains("blue")) return "/products/galaxy-a56-awesome-blue.jpg";
            if (c.contains("vàng") || c.contains("yellow")) return "/products/galaxy-a56-awesome-yellow.jpg";
            if (c.contains("đen") || c.contains("black")) return "/products/galaxy-a56-awesome-black.jpg";
            return "/products/galaxy-a56.jpg";
        }

        // 8. OPPO Reno Series
        if (p.contains("reno") || p.contains("oppo")) {
            if (c.contains("hồng") || c.contains("pink")) return "/products/oppo-reno-13f-pink.jpg";
            if (c.contains("tím") || c.contains("purple")) return "/products/oppo-reno-13f-purple.jpg";
            if (c.contains("xanh") || c.contains("blue")) return "/products/oppo-reno-13f-blue.jpg";
            if (c.contains("đen") || c.contains("black")) return "/products/oppo-reno-13f-black.jpg";
            return "/products/oppo-reno-13f.jpg";
        }

        // 9. Google Pixel Series
        if (p.contains("pixel") || p.contains("google")) {
            if (c.contains("rose") || c.contains("hồng") || c.contains("pink")) return "/products/pixel-9-rose.jpg";
            if (c.contains("wintergreen") || c.contains("bạc hà") || c.contains("xanh") || c.contains("green")) return "/products/pixel-9-wintergreen.jpg";
            if (c.contains("porcelain") || c.contains("trắng") || c.contains("white")) return "/products/pixel-9-porcelain.jpg";
            if (c.contains("obsidian") || c.contains("đen") || c.contains("black")) return "/products/pixel-9-obsidian.jpg";
            return "/products/pixel-9.jpg";
        }

        // Redmi 14C & Budget
        if (p.contains("14c") || p.contains("redmi")) {
            if (c.contains("bạc hà") || c.contains("xanh") || c.contains("green")) return "/products/redmi-14c-green.jpg";
            if (c.contains("khói") || c.contains("tím") || c.contains("purple")) return "/products/redmi-14c-purple.jpg";
            if (c.contains("đen") || c.contains("black")) return "/products/redmi-14c-black.jpg";
            return "/products/redmi-14c.jpg";
        }

        return defaultImage != null ? defaultImage : "/products/galaxy-s25-ultra.jpg";
    }

    private List<ColorSeed> generateDefaultColorSeeds(Product p) {
        String name = (p.getName() != null ? p.getName() : "").toLowerCase();
        long basePrice = p.getPrice().longValue();
        Integer baseSale = p.getSalePrice() != null ? p.getSalePrice().intValue() : null;
        int totalStock = p.getStock();

        List<ColorSeed> list = new ArrayList<>();
        if (name.contains("iphone") || name.contains("apple")) {
            if (name.contains("pro")) {
                list.add(new ColorSeed("Titan Sa Mạc", "#C5A582", basePrice + 600000, baseSale != null ? baseSale + 600000 : null, Math.max(1, (int)(totalStock * 0.18)), "/products/iphone-16-pro-max-desert-titan.png"));
                list.add(new ColorSeed("Titan Tự Nhiên", "#9E9885", basePrice + 350000, baseSale != null ? baseSale + 350000 : null, Math.max(1, (int)(totalStock * 0.25)), "/products/iphone-16-pro-max-natural-titan.png"));
                list.add(new ColorSeed("Titan Trắng", "#EDEAE6", basePrice, baseSale, Math.max(1, (int)(totalStock * 0.30)), "/products/iphone-16-pro-max-white-titan.png"));
                list.add(new ColorSeed("Titan Đen", "#3C3B37", basePrice - 250000, baseSale != null ? baseSale - 250000 : null, Math.max(1, (int)(totalStock * 0.35)), "/products/iphone-16-pro-max-black-titan.png"));
            } else {
                list.add(new ColorSeed("Hồng", "#E8A3B8", basePrice + 400000, baseSale != null ? baseSale + 400000 : null, Math.max(1, (int)(totalStock * 0.15)), "/products/iphone-16-pink.png"));
                list.add(new ColorSeed("Xanh Mòng Két", "#4D9E9E", basePrice + 300000, baseSale != null ? baseSale + 300000 : null, Math.max(1, (int)(totalStock * 0.20)), "/products/iphone-16-teal.png"));
                list.add(new ColorSeed("Xanh Lưu Ly", "#3852A0", basePrice + 150000, baseSale != null ? baseSale + 150000 : null, Math.max(1, (int)(totalStock * 0.25)), "/products/iphone-16-ultramarine.png"));
                list.add(new ColorSeed("Trắng", "#F2F3F5", basePrice, baseSale, Math.max(1, (int)(totalStock * 0.30)), "/products/iphone-16-white.png"));
                list.add(new ColorSeed("Đen", "#2A2B2D", basePrice - 200000, baseSale != null ? baseSale - 200000 : null, Math.max(1, (int)(totalStock * 0.35)), "/products/iphone-16-black.png"));
            }
        } else if (name.contains("samsung") || name.contains("galaxy")) {
            list.add(new ColorSeed("Vàng Amber", "#D6B464", basePrice + 500000, baseSale != null ? baseSale + 500000 : null, Math.max(1, (int)(totalStock * 0.15)), "/products/galaxy-s25-ultra-amber-yellow.jpg"));
            list.add(new ColorSeed("Tím Cobalt", "#4E486D", basePrice + 350000, baseSale != null ? baseSale + 350000 : null, Math.max(1, (int)(totalStock * 0.20)), "/products/galaxy-s25-ultra-cobalt-violet.jpg"));
            list.add(new ColorSeed("Xanh Sky Blue", "#7EA9CC", basePrice + 200000, baseSale != null ? baseSale + 200000 : null, Math.max(1, (int)(totalStock * 0.22)), "/products/galaxy-s25-ultra-sky-blue.jpg"));
            list.add(new ColorSeed("Titan Xám", "#8E8D8A", basePrice, baseSale, Math.max(1, (int)(totalStock * 0.28)), "/products/galaxy-s25-ultra-titan-gray.jpg"));
            list.add(new ColorSeed("Đen Classic", "#222224", basePrice - 300000, baseSale != null ? baseSale - 300000 : null, Math.max(1, (int)(totalStock * 0.35)), "/products/galaxy-s25-ultra-classic-black.jpg"));
        } else {
            String defaultColor = p.getColor() != null ? p.getColor() : "Đen";
            list.add(new ColorSeed(defaultColor, "#3B3F55", basePrice, baseSale, Math.max(1, (int)(totalStock * 0.4)), resolveColorImage(p.getName(), defaultColor, p.getImageUrl())));
            list.add(new ColorSeed("Bạc Ánh Kim", "#D9D9D9", basePrice + 200000, baseSale != null ? baseSale + 200000 : null, Math.max(1, (int)(totalStock * 0.3)), resolveColorImage(p.getName(), "Bạc Ánh Kim", p.getImageUrl())));
            list.add(new ColorSeed("Xanh Titan", "#3B82A6", basePrice + 350000, baseSale != null ? baseSale + 350000 : null, Math.max(1, (int)(totalStock * 0.3)), resolveColorImage(p.getName(), "Xanh Titan", p.getImageUrl())));
        }
        return list;
    }

    private void saveWithColors(String name, Brand brand, Category cat, long price, Integer sale, int stock, boolean hot,
                                String screen, String chip, String ram, String storage, String camera, String battery, String color,
                                String imageUrl, List<ColorSeed> colorSeeds) {
        Product p = Product.builder()
                .name(name).brand(brand).category(cat)
                .price(BigDecimal.valueOf(price)).salePrice(sale == null ? null : BigDecimal.valueOf(sale))
                .costPrice(BigDecimal.valueOf(Math.round(price * 0.78)))
                .stock(stock).hot(hot).imageUrl(imageUrl)
                .screen(screen).chip(chip).ram(ram).storage(storage).camera(camera).battery(battery).color(color)
                .description(name + " chính hãng màu " + color + ", bộ nhớ " + storage + ", bảo hành 12 tháng.")
                .build();

        for (ColorSeed cs : colorSeeds) {
            String colorImg = cs.imageUrl != null ? cs.imageUrl : resolveColorImage(name, cs.name, imageUrl);
            ProductColor pc = ProductColor.builder()
                    .product(p)
                    .colorName(cs.name)
                    .hex(cs.hex)
                    .price(BigDecimal.valueOf(cs.price))
                    .salePrice(cs.salePrice == null ? null : BigDecimal.valueOf(cs.salePrice))
                    .stock(cs.stock)
                    .imageUrl(colorImg)
                    .build();
            p.addColor(pc);
        }

        productRepository.save(p);
    }

    private record ColorSeed(String name, String hex, long price, Integer salePrice, int stock, String imageUrl) {
        public ColorSeed(String name, String hex, long price, Integer salePrice, int stock) {
            this(name, hex, price, salePrice, stock, null);
        }
    }
}
