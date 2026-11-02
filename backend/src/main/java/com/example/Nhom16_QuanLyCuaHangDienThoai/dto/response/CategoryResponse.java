package com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response;

import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.Category;

public record CategoryResponse(Long id, String name, String description) {
    public static CategoryResponse from(Category c) {
        return new CategoryResponse(c.getId(), c.getName(), c.getDescription());
    }
}
