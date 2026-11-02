package com.example.Nhom16_QuanLyCuaHangDienThoai.controller;

import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request.CommentRequest;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.CommentResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.security.CurrentUser;
import com.example.Nhom16_QuanLyCuaHangDienThoai.service.CommentService;
import com.example.Nhom16_QuanLyCuaHangDienThoai.service.CommentService.CommentPage;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    @GetMapping("/api/products/{productId}/comments")
    public CommentPage list(@PathVariable Long productId,
                            @RequestParam(defaultValue = "0") int page,
                            @RequestParam(defaultValue = "10") int size) {
        return commentService.list(productId, page, size);
    }

    @PostMapping("/api/products/{productId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse create(@PathVariable Long productId, @Valid @RequestBody CommentRequest req) {
        return commentService.create(CurrentUser.id(), productId, req);
    }

    @DeleteMapping("/api/comments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        commentService.delete(CurrentUser.id(), CurrentUser.isStaffOrAdmin(), id);
    }
}
