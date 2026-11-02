package com.example.Nhom16_QuanLyCuaHangDienThoai.repository;

import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    @EntityGraph(attributePaths = {"brand", "category", "colors"})
    Optional<Product> findWithRelationsById(Long id);

    @EntityGraph(attributePaths = {"brand", "category", "colors"})
    List<Product> findByActiveTrueAndBrandId(Long brandId);

    boolean existsByBrandId(Long brandId);
    boolean existsByCategoryId(Long categoryId);

    @EntityGraph(attributePaths = {"brand", "category"})
    List<Product> findByActiveTrueAndHotTrueOrderBySoldCountDesc(Pageable pageable);

    @EntityGraph(attributePaths = {"brand", "category"})
    List<Product> findByActiveTrueOrderByViewCountDesc(Pageable pageable);

    @EntityGraph(attributePaths = {"brand", "category"})
    @Query("SELECT p FROM Product p WHERE p.active = true AND p.salePrice IS NOT NULL AND p.salePrice < p.price ORDER BY (p.price - p.salePrice) DESC")
    List<Product> findOnSale(Pageable pageable);

    @EntityGraph(attributePaths = {"brand", "category"})
    List<Product> findByActiveTrueOrderByCreatedAtDesc(Pageable pageable);

    /**
     * Trừ kho nguyên tử. Trả về 0 nếu không đủ hàng hoặc sản phẩm đã ngừng bán.
     * Điều kiện nằm trong cùng câu UPDATE nên an toàn khi nhiều người đặt cùng lúc
     * (không có khoảng hở giữa "đọc tồn kho" và "ghi tồn kho").
     */
    @Modifying(flushAutomatically = true)
    @Query("UPDATE Product p SET p.stock = p.stock - :qty, p.soldCount = p.soldCount + :qty " +
           "WHERE p.id = :id AND p.active = true AND p.stock >= :qty")
    int decreaseStock(@Param("id") Long id, @Param("qty") int qty);

    @Modifying(flushAutomatically = true)
    @Query("UPDATE Product p SET p.stock = p.stock + :qty, p.soldCount = p.soldCount - :qty WHERE p.id = :id")
    int restoreStock(@Param("id") Long id, @Param("qty") int qty);

    @Modifying
    @Query("UPDATE Product p SET p.viewCount = p.viewCount + 1 WHERE p.id = :id")
    void incrementView(@Param("id") Long id);

    long countByActiveTrueAndStockLessThanEqual(int threshold);
}
