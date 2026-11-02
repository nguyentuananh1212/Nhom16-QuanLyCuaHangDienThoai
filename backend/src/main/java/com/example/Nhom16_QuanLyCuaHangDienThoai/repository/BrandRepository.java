package com.example.Nhom16_QuanLyCuaHangDienThoai.repository;

import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrandRepository extends JpaRepository<Brand, Long> {
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
