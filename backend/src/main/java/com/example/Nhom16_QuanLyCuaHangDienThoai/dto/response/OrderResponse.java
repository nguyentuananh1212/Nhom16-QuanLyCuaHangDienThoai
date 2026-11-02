package com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response;

import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.Order;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.OrderStatus;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.PaymentMethod;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id, Long userId, String userEmail,
        String receiverName, String receiverPhone, String receiverEmail, String shippingAddress, String note,
        OrderStatus status, PaymentMethod paymentMethod, BigDecimal totalAmount,
        String voucherCode, BigDecimal discountAmount,
        List<OrderItemResponse> items, LocalDateTime createdAt, LocalDateTime updatedAt,
        String paymentRef, String zpTransId, LocalDateTime paidAt
) {
    public record OrderItemResponse(Long productId, String productName, BigDecimal unitPrice, int quantity,
                                    BigDecimal lineTotal) {}

    public String notificationEmail() {
        return (receiverEmail != null && !receiverEmail.isBlank()) ? receiverEmail : userEmail;
    }

    /** Dùng cho danh sách: không load items để tránh N+1. */
    public static OrderResponse summary(Order o) {
        return build(o, List.of());
    }

    public static OrderResponse detail(Order o) {
        return build(o, o.getItems().stream()
                .map(i -> new OrderItemResponse(i.getProduct().getId(), i.getProductName(), i.getUnitPrice(),
                        i.getQuantity(), i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity()))))
                .toList());
    }

    private static OrderResponse build(Order o, List<OrderItemResponse> items) {
        return new OrderResponse(o.getId(), o.getUser().getId(), o.getUser().getEmail(),
                o.getReceiverName(), o.getReceiverPhone(), o.getReceiverEmail(), o.getShippingAddress(), o.getNote(),
                o.getStatus(), o.getPaymentMethod(), o.getTotalAmount(),
                o.getVoucherCode(), o.getDiscountAmount(),
                items, o.getCreatedAt(), o.getUpdatedAt(),
                o.getPaymentRef(), o.getZpTransId(), o.getPaidAt());
    }
}
