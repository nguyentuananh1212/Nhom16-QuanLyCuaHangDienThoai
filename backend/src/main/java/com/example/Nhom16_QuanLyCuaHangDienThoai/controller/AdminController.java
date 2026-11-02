package com.example.Nhom16_QuanLyCuaHangDienThoai.controller;

import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request.AdminUserRequest;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.DashboardResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.PageResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.UserResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.Role;
import com.example.Nhom16_QuanLyCuaHangDienThoai.security.CurrentUser;
import com.example.Nhom16_QuanLyCuaHangDienThoai.service.DashboardService;
import com.example.Nhom16_QuanLyCuaHangDienThoai.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final DashboardService dashboardService;
    private final UserService userService;

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() { return dashboardService.summary(); }

    /** Chỉ ADMIN (đã chặn ở SecurityConfig: /api/admin/users/**). */
    @GetMapping("/users")
    public PageResponse<UserResponse> users(@RequestParam(required = false) String keyword,
                                            @RequestParam(required = false) Role role,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size) {
        return userService.search(keyword, role, page, Math.min(size, 50));
    }

    @PutMapping("/users/{id}")
    public UserResponse updateUser(@PathVariable Long id, @Valid @RequestBody AdminUserRequest req) {
        return userService.adminUpdate(CurrentUser.id(), id, req);
    }
}
