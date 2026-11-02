package com.example.Nhom16_QuanLyCuaHangDienThoai.repository;

import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.Order;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"user"})
    Page<Order> findByUserId(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    @Query("""
            SELECT o FROM Order o
            WHERE (:status IS NULL OR o.status = :status)
              AND (:keyword IS NULL OR LOWER(o.receiverName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR o.receiverPhone LIKE CONCAT('%', :keyword, '%'))
            """)
    Page<Order> search(@Param("status") OrderStatus status, @Param("keyword") String keyword, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "items"})
    Optional<Order> findDetailById(Long id);

    @EntityGraph(attributePaths = {"user", "items"})
    List<Order> findByStatus(OrderStatus status);

    long countByStatus(OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = :status")
    BigDecimal sumTotalByStatus(@Param("status") OrderStatus status);

    /** Doanh thu theo ngày (chỉ đơn đã giao) — trả về [ngày, tổng tiền, số đơn]. */
    @Query("""
            SELECT CAST(o.createdAt AS LocalDate), SUM(o.totalAmount), COUNT(o)
            FROM Order o
            WHERE o.status = :status AND o.createdAt >= :from
            GROUP BY CAST(o.createdAt AS LocalDate)
            ORDER BY CAST(o.createdAt AS LocalDate)
            """)
    List<Object[]> revenueByDay(@Param("status") OrderStatus status, @Param("from") LocalDateTime from);

    /** Người dùng đã nhận được sản phẩm này chưa (điều kiện để đánh giá). */
    @Query("""
            SELECT COUNT(oi) > 0 FROM OrderItem oi
            WHERE oi.order.user.id = :userId AND oi.product.id = :productId AND oi.order.status = :status
            """)
    boolean hasPurchased(@Param("userId") Long userId, @Param("productId") Long productId,
                         @Param("status") OrderStatus status);
}
