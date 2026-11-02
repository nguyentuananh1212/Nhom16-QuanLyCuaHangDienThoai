package com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response;

import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.Voucher;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.DiscountType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record VoucherResponse(
        Long id,
        String code,
        String name,
        String description,
        DiscountType discountType,
        BigDecimal discountValue,
        BigDecimal minOrderAmount,
        BigDecimal maxDiscountAmount,
        int quantity,
        int usedCount,
        LocalDate startDate,
        LocalDate endDate,
        boolean active
) {
    public static VoucherResponse from(Voucher v) {
        return new VoucherResponse(
                v.getId(),
                v.getCode(),
                v.getName(),
                v.getDescription(),
                v.getDiscountType(),
                v.getDiscountValue(),
                v.getMinOrderAmount(),
                v.getMaxDiscountAmount(),
                v.getQuantity(),
                v.getUsedCount(),
                v.getStartDate(),
                v.getEndDate(),
                v.isActive()
        );
    }
}
