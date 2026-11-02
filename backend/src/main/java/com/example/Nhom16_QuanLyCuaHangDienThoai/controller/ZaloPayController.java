package com.example.Nhom16_QuanLyCuaHangDienThoai.controller;

import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.OrderResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.ZaloPayCreateResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.ZaloPayQueryResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.security.CurrentUser;
import com.example.Nhom16_QuanLyCuaHangDienThoai.service.ZaloPayService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payment/zalopay")
public class ZaloPayController {

    private final ZaloPayService zaloPayService;

    /**
     * Khởi tạo giao dịch thanh toán ZaloPay Sandbox cho đơn hàng.
     */
    @PostMapping("/create/{orderId}")
    public ZaloPayCreateResponse createPayment(@PathVariable Long orderId) {
        return zaloPayService.createPayment(CurrentUser.id(), CurrentUser.isStaffOrAdmin(), orderId);
    }

    /**
     * Truy vấn trạng thái thanh toán từ máy chủ ZaloPay Sandbox.
     */
    @GetMapping("/query/{orderId}")
    public ZaloPayQueryResponse queryPayment(@PathVariable Long orderId) {
        return zaloPayService.queryPayment(CurrentUser.id(), CurrentUser.isStaffOrAdmin(), orderId);
    }

    /**
     * Giả lập thanh toán thành công tức thì cho đơn hàng (tiện lợi khi test Sandbox).
     */
    @PostMapping("/mock-pay/{orderId}")
    public OrderResponse mockPay(@PathVariable Long orderId) {
        return zaloPayService.simulateSuccess(CurrentUser.id(), CurrentUser.isStaffOrAdmin(), orderId);
    }

    /**
     * Endpoint nhận Webhook / Callback từ ZaloPay khi khách hoàn tất thanh toán.
     */
    @PostMapping("/callback")
    public Map<String, Object> callback(@RequestBody String jsonPayload) {
        return zaloPayService.handleCallback(jsonPayload);
    }
}
