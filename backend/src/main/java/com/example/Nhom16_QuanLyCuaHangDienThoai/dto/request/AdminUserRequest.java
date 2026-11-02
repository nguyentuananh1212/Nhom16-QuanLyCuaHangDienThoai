package com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request;

import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.Role;
import jakarta.validation.constraints.NotNull;

/** Admin đổi quyền / khoá tài khoản. */
public record AdminUserRequest(@NotNull Role role, @NotNull Boolean enabled) {}
