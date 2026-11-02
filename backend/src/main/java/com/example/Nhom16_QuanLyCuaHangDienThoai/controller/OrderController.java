package com.example.Nhom16_QuanLyCuaHangDienThoai.controller;

import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request.CheckoutRequest;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request.UpdateOrderStatusRequest;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.OrderResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.PageResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.OrderStatus;
import com.example.Nhom16_QuanLyCuaHangDienThoai.security.CurrentUser;
import com.example.Nhom16_QuanLyCuaHangDienThoai.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    // ===== Khách hàng =====

    @PostMapping("/api/orders")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse checkout(@Valid @RequestBody CheckoutRequest req) {
        return orderService.checkout(CurrentUser.id(), req);
    }

    @GetMapping("/api/orders")
    public PageResponse<OrderResponse> myOrders(@RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "10") int size) {
        return orderService.myOrders(CurrentUser.id(), page, size);
    }

    @GetMapping("/api/orders/{id}")
    public OrderResponse get(@PathVariable Long id) {
        return orderService.getForUser(CurrentUser.id(), CurrentUser.isStaffOrAdmin(), id);
    }

    @PostMapping("/api/orders/{id}/cancel")
    public OrderResponse cancel(@PathVariable Long id) {
        return orderService.cancelByCustomer(CurrentUser.id(), id);
    }

    @PostMapping("/api/orders/{id}/mock-pay")
    public OrderResponse mockPay(@PathVariable Long id) {
        return orderService.mockPay(CurrentUser.id(), id);
    }

    @GetMapping(value = "/api/orders/{id}/email-preview", produces = "text/html;charset=UTF-8")
    public String getEmailPreview(@PathVariable Long id) {
        return orderService.getOrderEmailHtml(CurrentUser.id(), CurrentUser.isStaffOrAdmin(), id);
    }

    // ===== Quản trị =====

    @GetMapping("/api/admin/orders")
    public PageResponse<OrderResponse> search(@RequestParam(required = false) OrderStatus status,
                                              @RequestParam(required = false) String keyword,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "20") int size) {
        return orderService.search(status, keyword, page, size);
    }

    @PutMapping("/api/admin/orders/{id}/status")
    public OrderResponse updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateOrderStatusRequest req) {
        return orderService.updateStatus(id, req.status());
    }

    @PostMapping("/api/admin/orders/auto-confirm-all")
    public java.util.Map<String, Object> autoConfirmAll() {
        int count = orderService.autoConfirmAllPending();
        return java.util.Map.of("success", true, "confirmedCount", count);
    }
}
