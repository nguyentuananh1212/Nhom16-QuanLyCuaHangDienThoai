package com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request;

import jakarta.validation.constraints.*;

public record UpdateProfileRequest(
        @NotBlank(message = "Họ tên không được để trống") @Size(max = 100) String fullName,
        @Pattern(regexp = "^(0\\d{9,10})?$", message = "Số điện thoại không hợp lệ") String phone,
        @Size(max = 255) String address
) {}
