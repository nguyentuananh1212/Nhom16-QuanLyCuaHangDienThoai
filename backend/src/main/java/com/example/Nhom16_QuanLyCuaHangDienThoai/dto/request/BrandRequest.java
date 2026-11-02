package com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BrandRequest(
        @NotBlank(message = "Tên hãng không được để trống") @Size(max = 100) String name,
        @Size(max = 255) String logoUrl,
        @Size(max = 500) String description
) {}
