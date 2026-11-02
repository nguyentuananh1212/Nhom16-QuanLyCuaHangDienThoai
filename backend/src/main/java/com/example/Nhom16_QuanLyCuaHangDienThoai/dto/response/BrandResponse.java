package com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response;

import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.Brand;

public record BrandResponse(Long id, String name, String logoUrl, String description) {
    public static BrandResponse from(Brand b) {
        return new BrandResponse(b.getId(), b.getName(), b.getLogoUrl(), b.getDescription());
    }
}
