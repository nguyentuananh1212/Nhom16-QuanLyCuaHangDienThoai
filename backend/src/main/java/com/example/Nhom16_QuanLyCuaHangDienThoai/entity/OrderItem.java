package com.example.Nhom16_QuanLyCuaHangDienThoai.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /** Snapshot tên + giá: sửa sản phẩm sau này không làm đổi đơn cũ. */
    @Column(nullable = false, length = 200)
    private String productName;

    @Column(nullable = false, precision = 15, scale = 0)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private int quantity;
}
