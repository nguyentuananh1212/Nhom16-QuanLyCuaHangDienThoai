package com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public record ProductRequest(
        @NotBlank(message = "Tên sản phẩm không được để trống") @Size(max = 200) String name,
        String description,
        @NotNull(message = "Giá không được để trống") @DecimalMin(value = "0", message = "Giá phải >= 0") BigDecimal price,
        @DecimalMin(value = "0", message = "Giá khuyến mãi phải >= 0") BigDecimal salePrice,
        @DecimalMin(value = "0", message = "Giá vốn nhập vào phải >= 0") BigDecimal costPrice,
        @NotNull @Min(value = 0, message = "Tồn kho phải >= 0") Integer stock,
        @Size(max = 255) String imageUrl,
        @Size(max = 100) String screen,
        @Size(max = 100) String chip,
        @Size(max = 50) String ram,
        @Size(max = 50) String storage,
        @Size(max = 100) String camera,
        @Size(max = 50) String battery,
        @Size(max = 50) String color,
        Boolean hot,
        Boolean active,
        @NotNull(message = "Chọn hãng") Long brandId,
        @NotNull(message = "Chọn danh mục") Long categoryId,
        List<ProductColorRequest> colors
) {
    public record ProductColorRequest(
            Long id,
            @NotBlank(message = "Tên màu không được để trống") String colorName,
            String hex,
            @NotNull(message = "Giá màu không được để trống") @DecimalMin(value = "0") BigDecimal price,
            @DecimalMin(value = "0") BigDecimal salePrice,
            @NotNull @Min(value = 0) Integer stock,
            String imageUrl
    ) {}

    public ProductRequest(
            String name, String description, BigDecimal price, BigDecimal salePrice, Integer stock,
            String imageUrl, String screen, String chip, String ram, String storage,
            String camera, String battery, String color, Boolean hot, Boolean active,
            Long brandId, Long categoryId
    ) {
        this(name, description, price, salePrice, null, stock, imageUrl, screen, chip, ram, storage,
                camera, battery, color, hot, active, brandId, categoryId, null);
    }

    @AssertTrue(message = "Giá khuyến mãi phải nhỏ hơn giá gốc")
    public boolean isSalePriceValid() {
        return salePrice == null || price == null || salePrice.compareTo(price) < 0;
    }
}
