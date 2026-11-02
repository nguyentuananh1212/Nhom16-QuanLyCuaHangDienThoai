package com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request;

import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record VoucherRequest(
        @NotBlank(message = "Nhập mã voucher") String code,
        @NotBlank(message = "Nhập tên chương trình voucher") String name,
        String description,
        @NotNull(message = "Chọn loại giảm giá") DiscountType discountType,
        @NotNull(message = "Nhập mức giảm giá") @DecimalMin(value = "0", message = "Mức giảm không âm") BigDecimal discountValue,
        BigDecimal minOrderAmount,
        BigDecimal maxDiscountAmount,
        @Min(value = 1, message = "Số lượng tối thiểu là 1") int quantity,
        LocalDate startDate,
        LocalDate endDate,
        Boolean active
) {}
