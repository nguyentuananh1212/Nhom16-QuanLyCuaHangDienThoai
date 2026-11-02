package com.example.Nhom16_QuanLyCuaHangDienThoai.service;

import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request.CheckoutRequest;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.OrderResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.Order;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.Product;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.User;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.OrderStatus;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.PaymentMethod;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.Role;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.OrderRepository;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.ProductRepository;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.UserRepository;
import com.example.Nhom16_QuanLyCuaHangDienThoai.util.HMacUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class ZaloPayServiceTest {

    @Autowired ZaloPayService zaloPayService;
    @Autowired OrderRepository orderRepository;
    @Autowired UserRepository userRepository;
    @Autowired ProductRepository productRepository;
    @Autowired OrderService orderService;
    @Autowired CartService cartService;

    @Test
    @Transactional
    void testSimulateSuccessUpdatesOrderStatusAndPaidAt() {
        User user = userRepository.save(User.builder()
                .email("zalopay_" + UUID.randomUUID() + "@test.vn")
                .password("hash")
                .fullName("ZaloPay User")
                .role(Role.CUSTOMER)
                .build());

        Order order = orderRepository.save(Order.builder()
                .user(user)
                .receiverName("Test Receiver")
                .receiverPhone("0987654321")
                .shippingAddress("123 Test St")
                .status(OrderStatus.PENDING)
                .paymentMethod(PaymentMethod.ZALOPAY)
                .totalAmount(BigDecimal.valueOf(15000000))
                .build());

        OrderResponse res = zaloPayService.simulateSuccess(user.getId(), false, order.getId());

        assertThat(res.status()).isEqualTo(OrderStatus.CONFIRMED);
        assertThat(res.paidAt()).isNotNull();
        assertThat(res.zpTransId()).isNotNull();

        Order updated = orderRepository.findById(order.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
        assertThat(updated.getPaidAt()).isNotNull();
        assertThat(updated.getZpTransId()).isNotNull();
    }

    @Test
    @Transactional
    void testCallbackVerification() {
        String key2 = "uUfsWgfLkRLzq6W2uNXTCxrfxs51auny";
        String sampleData = "{\"app_id\":554,\"app_trans_id\":\"261102_999\",\"amount\":50000,\"zp_trans_id\":123456}";
        String validMac = HMacUtil.hmacSha256(key2, sampleData);

        String jsonPayload = """
                {"data": "%s", "mac": "%s"}
                """.formatted(sampleData.replace("\"", "\\\""), validMac);

        Map<String, Object> resp = zaloPayService.handleCallback(jsonPayload);
        assertThat(resp.get("return_code")).isEqualTo(1);
    }
}
