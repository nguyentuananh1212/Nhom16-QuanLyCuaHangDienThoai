package com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response;

import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.Product;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.ProductColor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ProductResponse(
        Long id, String name, String description,
        BigDecimal price, BigDecimal salePrice, BigDecimal costPrice, BigDecimal effectivePrice, Integer discountPercent,
        int stock, long soldCount, long viewCount, String imageUrl,
        String screen, String chip, String ram, String storage, String camera, String battery, String color,
        boolean hot, boolean active,
        Long brandId, String brandName, Long categoryId, String categoryName,
        List<ProductColorResponse> colors,
        LocalDateTime createdAt
) {
    public record ProductColorResponse(
            Long id,
            String colorName,
            String hex,
            BigDecimal price,
            BigDecimal salePrice,
            BigDecimal effectivePrice,
            int stock,
            String imageUrl
    ) {
        public static ProductColorResponse from(ProductColor c) {
            return new ProductColorResponse(
                    c.getId(),
                    c.getColorName(),
                    c.getHex(),
                    c.getPrice(),
                    c.getSalePrice(),
                    c.getEffectivePrice(),
                    c.getStock(),
                    c.getImageUrl()
            );
        }
    }

    public static ProductResponse from(Product p) {
        BigDecimal effective = p.getEffectivePrice();
        Integer discount = null;
        if (effective.compareTo(p.getPrice()) < 0 && p.getPrice().signum() > 0) {
            discount = p.getPrice().subtract(effective).multiply(BigDecimal.valueOf(100))
                    .divide(p.getPrice(), 0, java.math.RoundingMode.HALF_UP).intValue();
        }
        List<ProductColorResponse> colorList = p.getColors() == null ? List.of() :
                p.getColors().stream().map(ProductColorResponse::from).toList();

        return new ProductResponse(p.getId(), p.getName(), p.getDescription(),
                p.getPrice(), p.getSalePrice(), p.getCostPrice(), effective, discount,
                p.getStock(), p.getSoldCount(), p.getViewCount(), p.getImageUrl(),
                p.getScreen(), p.getChip(), p.getRam(), p.getStorage(), p.getCamera(), p.getBattery(), p.getColor(),
                p.isHot(), p.isActive(),
                p.getBrand().getId(), p.getBrand().getName(),
                p.getCategory().getId(), p.getCategory().getName(),
                colorList,
                p.getCreatedAt());
    }
}
