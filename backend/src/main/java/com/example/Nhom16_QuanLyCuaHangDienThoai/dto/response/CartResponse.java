package com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record CartResponse(List<CartItemResponse> items, int totalQuantity, BigDecimal totalAmount) {

    public record CartItemResponse(Long id, Long productId, String productName, String imageUrl,
                                   BigDecimal unitPrice, int quantity, int stock, boolean available,
                                   BigDecimal lineTotal) {}
}
