package com.example.Nhom16_QuanLyCuaHangDienThoai.entity;

import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.OrderStatus;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.PaymentMethod;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders", indexes = {
        @Index(name = "idx_order_user", columnList = "user_id"),
        @Index(name = "idx_order_status", columnList = "status")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Thông tin giao hàng được lưu cứng tại thời điểm đặt
    @Column(nullable = false, length = 100) private String receiverName;
    @Column(nullable = false, length = 20)  private String receiverPhone;
    @Column(length = 120)                   private String receiverEmail;
    @Column(nullable = false)               private String shippingAddress;
    @Column(length = 500)                   private String note;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    @Column(nullable = false, precision = 15, scale = 0)
    private BigDecimal totalAmount;

    @Column(length = 50)
    private String voucherCode;

    @Column(precision = 15, scale = 0)
    private BigDecimal discountAmount;

    @Column(length = 100)
    private String paymentRef;

    @Column(length = 100)
    private String zpTransId;

    @Column
    private LocalDateTime paidAt;

    @Builder.Default
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    /** Khoá lạc quan: chặn 2 admin đổi trạng thái cùng lúc ghi đè nhau. */
    @Version
    private Long version;
}
