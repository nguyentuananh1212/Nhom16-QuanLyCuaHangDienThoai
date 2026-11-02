package com.example.Nhom16_QuanLyCuaHangDienThoai.repository;

import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.ProductColor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductColorRepository extends JpaRepository<ProductColor, Long> {
    List<ProductColor> findByProductIdOrderByIdAsc(Long productId);
    void deleteByProductId(Long productId);
}
