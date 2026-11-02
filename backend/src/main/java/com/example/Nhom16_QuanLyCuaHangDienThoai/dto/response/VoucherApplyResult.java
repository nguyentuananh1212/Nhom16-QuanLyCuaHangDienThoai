package com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response;

import java.math.BigDecimal;

public record VoucherApplyResult(
        boolean valid,
        String code,
        String name,
        BigDecimal discountAmount,
        BigDecimal finalAmount,
        String message
) {}
