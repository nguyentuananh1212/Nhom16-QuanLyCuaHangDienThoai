package com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record DashboardResponse(
        BigDecimal totalRevenue,
        long totalOrders,
        Map<String, Long> ordersByStatus,
        long totalCustomers,
        long totalProducts,
        long lowStockProducts,
        List<DailyRevenue> revenueLast30Days,
        List<ProductResponse> topSelling
) {
    public record DailyRevenue(LocalDate date, BigDecimal revenue, long orders) {}
}
