package com.example.Nhom16_QuanLyCuaHangDienThoai.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_product_brand", columnList = "brand_id"),
        @Index(name = "idx_product_category", columnList = "category_id"),
        @Index(name = "idx_product_active_sold", columnList = "active, soldCount")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Giá niêm yết. */
    @Column(nullable = false, precision = 15, scale = 0)
    private BigDecimal price;

    /** Giá khuyến mãi; null nghĩa là không giảm giá. */
    @Column(precision = 15, scale = 0)
    private BigDecimal salePrice;

    /** Giá vốn nhập vào dùng để tính lãi và quản lý kho trong Admin. */
    @Column(precision = 15, scale = 0)
    private BigDecimal costPrice;

    @Column(nullable = false)
    private int stock;

    @Builder.Default
    @Column(nullable = false)
    private long soldCount = 0;

    @Builder.Default
    @Column(nullable = false)
    private long viewCount = 0;

    private String imageUrl;

    // Thông số kỹ thuật
    @Column(length = 100) private String screen;
    @Column(length = 100) private String chip;
    @Column(length = 50)  private String ram;
    @Column(length = 50)  private String storage;
    @Column(length = 100) private String camera;
    @Column(length = 50)  private String battery;
    @Column(length = 50)  private String color;

    @Builder.Default
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("id ASC")
    private java.util.List<ProductColor> colors = new java.util.ArrayList<>();

    public void addColor(ProductColor color) {
        if (colors == null) colors = new java.util.ArrayList<>();
        colors.add(color);
        color.setProduct(this);
    }

    public void clearColors() {
        if (colors != null) colors.clear();
    }

    @Builder.Default
    @Column(nullable = false)
    private boolean hot = false;

    /** Xoá mềm: sản phẩm đã nằm trong đơn hàng thì không được xoá cứng. */
    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    /** Giá bán thực tế tại thời điểm hiện tại. */
    public BigDecimal getEffectivePrice() {
        return salePrice != null && salePrice.compareTo(price) < 0 ? salePrice : price;
    }
}
