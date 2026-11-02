package com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record VoucherApplyRequest(
        @NotBlank(message = "Vui lòng nhập mã giảm giá") String code,
        @NotNull(message = "Số tiền đơn hàng không được để trống") BigDecimal orderAmount
) {}
