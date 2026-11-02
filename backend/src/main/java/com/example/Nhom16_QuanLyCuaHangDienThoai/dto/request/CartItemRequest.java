package com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CartItemRequest(
        @NotNull Long productId,
        @NotNull @Min(value = 1, message = "Số lượng tối thiểu là 1") @Max(value = 50, message = "Tối đa 50 sản phẩm") Integer quantity
) {}
