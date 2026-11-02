package com.example.Nhom16_QuanLyCuaHangDienThoai.repository;

import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.User;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    long countByRole(Role role);

    @Query("""
            SELECT u FROM User u
            WHERE (:keyword IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:role IS NULL OR u.role = :role)
            """)
    Page<User> search(@Param("keyword") String keyword, @Param("role") Role role, Pageable pageable);
}
