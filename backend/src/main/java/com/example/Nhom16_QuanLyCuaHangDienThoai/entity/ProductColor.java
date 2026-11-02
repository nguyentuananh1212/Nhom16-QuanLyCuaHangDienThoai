package com.example.Nhom16_QuanLyCuaHangDienThoai.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "product_colors", indexes = {
        @Index(name = "idx_product_color_product", columnList = "product_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductColor {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, length = 100)
    private String colorName;

    @Column(length = 20)
    private String hex;

    /** Giá niêm yết riêng của màu này */
    @Column(nullable = false, precision = 15, scale = 0)
    private BigDecimal price;

    /** Giá khuyến mãi riêng của màu này; null nghĩa là không giảm giá */
    @Column(precision = 15, scale = 0)
    private BigDecimal salePrice;

    /** Số lượng tồn kho riêng của màu này */
    @Column(nullable = false)
    private int stock;

    private String imageUrl;

    /** Giá bán thực tế của màu này */
    public BigDecimal getEffectivePrice() {
        return salePrice != null && salePrice.compareTo(price) < 0 ? salePrice : price;
    }
}
