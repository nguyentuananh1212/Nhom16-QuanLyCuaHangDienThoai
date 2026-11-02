package com.example.Nhom16_QuanLyCuaHangDienThoai.entity;

import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.DiscountType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vouchers", indexes = {
        @Index(name = "idx_voucher_code", columnList = "code", unique = true)
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code; // Ví dụ: LENDOISANG, FLAGSHIP1TR, CHAOBANMOI

    @Column(nullable = false, length = 150)
    private String name; // Ví dụ: Ưu đãi lên đời Flagship

    @Column(length = 500)
    private String description; // Ví dụ: Giảm 1.000.000₫ cho đơn hàng điện thoại từ 20 triệu

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DiscountType discountType; // FIXED_AMOUNT hoặc PERCENT

    @Column(nullable = false, precision = 15, scale = 0)
    private BigDecimal discountValue; // Giá trị giảm (tiền mặt hoặc %)

    @Column(precision = 15, scale = 0)
    private BigDecimal minOrderAmount; // Đơn tối thiểu để áp dụng

    @Column(precision = 15, scale = 0)
    private BigDecimal maxDiscountAmount; // Mức giảm tối đa nếu là giảm theo %

    @Column(nullable = false)
    private int quantity; // Tổng số lượt sử dụng tối đa

    @Column(nullable = false)
    private int usedCount; // Số lượt đã sử dụng

    private LocalDate startDate; // Ngày bắt đầu có hiệu lực
    private LocalDate endDate;   // Ngày hết hạn

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
