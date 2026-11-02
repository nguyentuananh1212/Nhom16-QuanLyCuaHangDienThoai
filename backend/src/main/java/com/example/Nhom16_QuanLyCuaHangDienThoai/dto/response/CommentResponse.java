package com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response;

import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.Comment;

import java.time.LocalDateTime;

public record CommentResponse(Long id, Long userId, String userName, int rating, String content,
                              LocalDateTime createdAt) {
    public static CommentResponse from(Comment c) {
        return new CommentResponse(c.getId(), c.getUser().getId(), c.getUser().getFullName(),
                c.getRating(), c.getContent(), c.getCreatedAt());
    }
}
