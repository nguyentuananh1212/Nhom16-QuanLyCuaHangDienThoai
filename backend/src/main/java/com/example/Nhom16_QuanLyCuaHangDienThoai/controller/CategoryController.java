package com.example.Nhom16_QuanLyCuaHangDienThoai.controller;

import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request.CategoryRequest;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.CategoryResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping("/api/categories")
    public List<CategoryResponse> list() { return categoryService.findAll(); }

    @GetMapping("/api/categories/{id}")
    public CategoryResponse get(@PathVariable Long id) { return categoryService.findById(id); }

    @PostMapping("/api/admin/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse create(@Valid @RequestBody CategoryRequest req) { return categoryService.create(req); }

    @PutMapping("/api/admin/categories/{id}")
    public CategoryResponse update(@PathVariable Long id, @Valid @RequestBody CategoryRequest req) {
        return categoryService.update(id, req);
    }

    @DeleteMapping("/api/admin/categories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { categoryService.delete(id); }
}
