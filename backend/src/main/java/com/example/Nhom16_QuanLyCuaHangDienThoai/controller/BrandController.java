package com.example.Nhom16_QuanLyCuaHangDienThoai.controller;

import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request.BrandRequest;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.BrandResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.service.BrandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class BrandController {
    private final BrandService brandService;

    @GetMapping("/api/brands")
    public List<BrandResponse> list() { return brandService.findAll(); }

    @GetMapping("/api/brands/{id}")
    public BrandResponse get(@PathVariable Long id) { return brandService.findById(id); }

    @PostMapping("/api/admin/brands")
    @ResponseStatus(HttpStatus.CREATED)
    public BrandResponse create(@Valid @RequestBody BrandRequest req) { return brandService.create(req); }

    @PutMapping("/api/admin/brands/{id}")
    public BrandResponse update(@PathVariable Long id, @Valid @RequestBody BrandRequest req) {
        return brandService.update(id, req);
    }

    @DeleteMapping("/api/admin/brands/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { brandService.delete(id); }
}
