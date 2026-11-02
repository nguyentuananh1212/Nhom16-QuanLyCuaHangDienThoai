package com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response;

import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.User;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.Role;

import java.time.LocalDateTime;

public record UserResponse(Long id, String email, String fullName, String phone, String address,
                           Role role, boolean enabled, LocalDateTime createdAt) {
    public static UserResponse from(User u) {
        return new UserResponse(u.getId(), u.getEmail(), u.getFullName(), u.getPhone(), u.getAddress(),
                u.getRole(), u.isEnabled(), u.getCreatedAt());
    }
}
