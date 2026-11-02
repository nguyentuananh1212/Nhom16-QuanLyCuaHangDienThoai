package com.example.Nhom16_QuanLyCuaHangDienThoai.repository;

import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.CartItems;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemsRepository extends JpaRepository<CartItems, Long> {
    @EntityGraph(attributePaths = {"product", "product.brand"})
    List<CartItems> findByCartIdOrderByIdAsc(Long cartId);

    Optional<CartItems> findByCartIdAndProductId(Long cartId, Long productId);

    /** Ràng buộc cart_id: user chỉ thao tác được trên item của giỏ mình. */
    Optional<CartItems> findByIdAndCartId(Long id, Long cartId);
}
