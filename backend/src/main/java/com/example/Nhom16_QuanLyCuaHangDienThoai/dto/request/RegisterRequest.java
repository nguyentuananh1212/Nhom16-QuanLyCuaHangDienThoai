package com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request;

import jakarta.validation.constraints.*;

public record RegisterRequest(
        @NotBlank(message = "Email không được để trống") @Email(message = "Email không hợp lệ") @Size(max = 120)
        String email,
        @NotBlank(message = "Mật khẩu không được để trống") @Size(min = 6, max = 72, message = "Mật khẩu từ 6 đến 72 ký tự")
        String password,
        @NotBlank(message = "Họ tên không được để trống") @Size(max = 100)
        String fullName,
        @Pattern(regexp = "^(0\\d{9,10})?$", message = "Số điện thoại không hợp lệ")
        String phone,
        @Size(max = 255)
        String address
) {}
