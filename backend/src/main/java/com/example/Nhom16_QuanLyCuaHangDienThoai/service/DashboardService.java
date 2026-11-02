package com.example.Nhom16_QuanLyCuaHangDienThoai.service;

import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.DashboardResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.DashboardResponse.DailyRevenue;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.ProductResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.OrderStatus;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.Role;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.OrderRepository;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.ProductRepository;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private static final int LOW_STOCK_THRESHOLD = 5;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public DashboardResponse summary() {
        Map<String, Long> byStatus = new LinkedHashMap<>();
        long totalOrders = 0;
        for (OrderStatus s : OrderStatus.values()) {
            long c = orderRepository.countByStatus(s);
            byStatus.put(s.name(), c);
            totalOrders += c;
        }
        List<DailyRevenue> daily = orderRepository
                .revenueByDay(OrderStatus.DELIVERED, LocalDate.now().minusDays(29).atStartOfDay())
                .stream()
                .map(r -> new DailyRevenue((LocalDate) r[0], (BigDecimal) r[1], ((Number) r[2]).longValue()))
                .toList();
        List<ProductResponse> top = productRepository
                .findAll(PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "soldCount")))
                .map(ProductResponse::from).getContent();

        return new DashboardResponse(
                orderRepository.sumTotalByStatus(OrderStatus.DELIVERED),
                totalOrders, byStatus,
                userRepository.countByRole(Role.CUSTOMER),
                productRepository.count(),
                productRepository.countByActiveTrueAndStockLessThanEqual(LOW_STOCK_THRESHOLD),
                daily, top);
    }
}
