package com.example.Nhom16_QuanLyCuaHangDienThoai.controller;

import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request.ProductRequest;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.PageResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.ProductResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.service.ProductService;
import com.example.Nhom16_QuanLyCuaHangDienThoai.service.ProductService.ProductFilter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    // ===== Công khai =====

    @GetMapping("/api/products")
    public PageResponse<ProductResponse> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean onSale,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return productService.search(new ProductFilter(keyword, brandId, categoryId, minPrice, maxPrice, onSale, sort, false),
                page, size);
    }

    @GetMapping("/api/products/hot")
    public List<ProductResponse> hot(@RequestParam(defaultValue = "8") int limit) { return productService.hot(limit); }

    @GetMapping("/api/products/most-viewed")
    public List<ProductResponse> mostViewed(@RequestParam(defaultValue = "8") int limit) { return productService.mostViewed(limit); }

    @GetMapping("/api/products/sale")
    public List<ProductResponse> sale(@RequestParam(defaultValue = "8") int limit) { return productService.onSale(limit); }

    @GetMapping("/api/products/newest")
    public List<ProductResponse> newest(@RequestParam(defaultValue = "8") int limit) { return productService.newest(limit); }

    @GetMapping("/api/products/{id}")
    public ProductResponse get(@PathVariable Long id) { return productService.findById(id, false); }

    @GetMapping("/api/products/{id}/siblings")
    public List<ProductResponse> siblings(@PathVariable Long id) { return productService.findSiblings(id); }

    /** Tách riêng khỏi GET để GET luôn idempotent và không bị cache/crawler đếm sai lượt xem. */
    @PostMapping("/api/products/{id}/view")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void view(@PathVariable Long id) { productService.increaseView(id); }

    // ===== Quản trị =====

    @GetMapping("/api/admin/products")
    public PageResponse<ProductResponse> adminSearch(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return productService.search(new ProductFilter(keyword, brandId, categoryId, null, null, null, sort, true), page, size);
    }

    @GetMapping("/api/admin/products/{id}")
    public ProductResponse adminGet(@PathVariable Long id) { return productService.findById(id, true); }

    @PostMapping("/api/admin/products")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @RequestBody ProductRequest req) { return productService.create(req); }

    @PutMapping("/api/admin/products/{id}")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductRequest req) {
        return productService.update(id, req);
    }

    @PatchMapping("/api/admin/products/{id}/cost-price")
    public ProductResponse updateCostPrice(@PathVariable Long id, @RequestBody java.util.Map<String, BigDecimal> body) {
        BigDecimal cost = body.get("costPrice");
        return productService.updateCostPrice(id, cost);
    }

    @DeleteMapping("/api/admin/products/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { productService.deactivate(id); }
}
