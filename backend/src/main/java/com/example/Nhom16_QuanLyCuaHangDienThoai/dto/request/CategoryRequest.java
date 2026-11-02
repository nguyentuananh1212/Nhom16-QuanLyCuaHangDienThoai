package com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank(message = "Tên danh mục không được để trống") @Size(max = 100) String name,
        @Size(max = 500) String description
) {}
