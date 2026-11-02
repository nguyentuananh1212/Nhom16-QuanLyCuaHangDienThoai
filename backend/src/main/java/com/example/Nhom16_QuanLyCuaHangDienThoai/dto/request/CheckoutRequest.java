package com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request;

import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.PaymentMethod;
import jakarta.validation.constraints.*;

public record CheckoutRequest(
        @NotBlank(message = "Nhập tên người nhận") @Size(max = 100) String receiverName,
        @NotBlank(message = "Nhập số điện thoại") @Pattern(regexp = "^0\\d{9,10}$", message = "Số điện thoại không hợp lệ") String receiverPhone,
        @NotBlank(message = "Email không được để trống") @Email(message = "Email không đúng định dạng") @Size(max = 120) String receiverEmail,
        @NotBlank(message = "Nhập địa chỉ giao hàng") @Size(max = 255) String shippingAddress,
        @Size(max = 500) String note,
        @NotNull(message = "Chọn phương thức thanh toán") PaymentMethod paymentMethod,
        @Size(max = 50) String voucherCode
) {}
