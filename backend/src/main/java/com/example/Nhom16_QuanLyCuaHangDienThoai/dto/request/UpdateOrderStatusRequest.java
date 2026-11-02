package com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request;

import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(@NotNull OrderStatus status) {}
