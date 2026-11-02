package com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request;

import jakarta.validation.constraints.*;

public record CommentRequest(
        @NotNull @Min(1) @Max(5) Integer rating,
        @NotBlank(message = "Nhập nội dung đánh giá") @Size(max = 1000) String content
) {}
