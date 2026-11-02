package com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response;

public record AuthResponse(String accessToken, String tokenType, long expiresIn, UserResponse user) {}
