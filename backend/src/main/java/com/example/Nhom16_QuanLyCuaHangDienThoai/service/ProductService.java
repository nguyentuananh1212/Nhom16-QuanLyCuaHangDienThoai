package com.example.Nhom16_QuanLyCuaHangDienThoai.service;

import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request.ProductRequest;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.PageResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.ProductResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.Product;
import com.example.Nhom16_QuanLyCuaHangDienThoai.exception.AppException;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.ProductRepository;
import jakarta.persistence.criteria.JoinType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static com.example.Nhom16_QuanLyCuaHangDienThoai.service.AuthService.blankToNull;

@Service
@RequiredArgsConstructor
public class ProductService {
    private static final int MAX_SIZE = 50;
    private final ProductRepository productRepository;
    private final BrandService brandService;
    private final CategoryService categoryService;

    public record ProductFilter(String keyword, Long brandId, Long categoryId,
                                BigDecimal minPrice, BigDecimal maxPrice, Boolean onSale, String sort,
                                boolean includeInactive) {}

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> search(ProductFilter f, int page, int size) {
        Specification<Product> spec = (root, query, cb) -> {
            // fetch join brand/category cho truy vấn dữ liệu (không áp cho truy vấn count)
            if (query != null && Long.class != query.getResultType() && long.class != query.getResultType()) {
                root.fetch("brand", JoinType.INNER);
                root.fetch("category", JoinType.INNER);
            }
            return cb.conjunction();
        };
        if (!f.includeInactive()) spec = spec.and((r, q, cb) -> cb.isTrue(r.get("active")));
        String kw = blankToNull(f.keyword());
        if (kw != null) {
            String like = "%" + kw.toLowerCase().replace("%", "\\%").replace("_", "\\_") + "%";
            spec = spec.and((r, q, cb) -> cb.like(cb.lower(r.get("name")), like, '\\'));
        }
        if (f.brandId() != null) spec = spec.and((r, q, cb) -> cb.equal(r.get("brand").get("id"), f.brandId()));
        if (f.categoryId() != null) spec = spec.and((r, q, cb) -> cb.equal(r.get("category").get("id"), f.categoryId()));
        // Lọc theo giá bán thực tế = COALESCE(salePrice, price)
        if (f.minPrice() != null) spec = spec.and((r, q, cb) ->
                cb.ge(cb.coalesce(r.get("salePrice"), r.<BigDecimal>get("price")), f.minPrice()));
        if (f.maxPrice() != null) spec = spec.and((r, q, cb) ->
                cb.le(cb.coalesce(r.get("salePrice"), r.<BigDecimal>get("price")), f.maxPrice()));
        if (Boolean.TRUE.equals(f.onSale())) spec = spec.and((r, q, cb) -> cb.and(
                cb.isNotNull(r.get("salePrice")), cb.lessThan(r.get("salePrice"), r.<BigDecimal>get("price"))));

        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), MAX_SIZE), toSort(f.sort()));
        return PageResponse.of(productRepository.findAll(spec, pageable), ProductResponse::from);
    }

    /** Whitelist trường sắp xếp — không đưa thẳng input client vào ORDER BY. */
    private Sort toSort(String sort) {
        if (sort == null) return Sort.by(Sort.Direction.DESC, "id");
        return switch (sort) {
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "best_selling" -> Sort.by(Sort.Direction.DESC, "soldCount");
            case "most_viewed" -> Sort.by(Sort.Direction.DESC, "viewCount");
            case "name" -> Sort.by(Sort.Direction.ASC, "name");
            default -> Sort.by(Sort.Direction.DESC, "id");
        };
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> findSiblings(Long id) {
        Product p = productRepository.findWithRelationsById(id)
                .filter(Product::isActive)
                .orElseThrow(() -> AppException.notFound("sản phẩm", id));
        List<Product> brandProducts = productRepository.findByActiveTrueAndBrandId(p.getBrand().getId());
        return map(brandProducts);
    }

    @Transactional(readOnly = true)
    public ProductResponse findById(Long id, boolean includeInactive) {
        Product p = productRepository.findWithRelationsById(id)
                .filter(x -> includeInactive || x.isActive())
                .orElseThrow(() -> AppException.notFound("sản phẩm", id));
        return ProductResponse.from(p);
    }

    @Transactional
    public void increaseView(Long id) {
        productRepository.incrementView(id);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> hot(int limit) {
        return map(productRepository.findByActiveTrueAndHotTrueOrderBySoldCountDesc(PageRequest.of(0, clamp(limit))));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> mostViewed(int limit) {
        return map(productRepository.findByActiveTrueOrderByViewCountDesc(PageRequest.of(0, clamp(limit))));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> onSale(int limit) {
        return map(productRepository.findOnSale(PageRequest.of(0, clamp(limit))));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> newest(int limit) {
        return map(productRepository.findByActiveTrueOrderByCreatedAtDesc(PageRequest.of(0, clamp(limit))));
    }

    @Transactional
    public ProductResponse create(ProductRequest req) {
        Product p = new Product();
        apply(p, req);
        return ProductResponse.from(productRepository.save(p));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest req) {
        Product p = productRepository.findWithRelationsById(id).orElseThrow(() -> AppException.notFound("sản phẩm", id));
        apply(p, req);
        return ProductResponse.from(p);
    }

    /** Xoá mềm: giữ nguyên lịch sử đơn hàng và đánh giá. */
    @Transactional
    public void deactivate(Long id) {
        Product p = productRepository.findById(id).orElseThrow(() -> AppException.notFound("sản phẩm", id));
        p.setActive(false);
    }

    /** Cập nhật riêng giá vốn nhập vào trực tiếp trong Database */
    @Transactional
    public ProductResponse updateCostPrice(Long id, BigDecimal costPrice) {
        Product p = productRepository.findById(id).orElseThrow(() -> AppException.notFound("sản phẩm", id));
        p.setCostPrice(costPrice);
        return ProductResponse.from(p);
    }

    private void apply(Product p, ProductRequest r) {
        p.setName(r.name().trim());
        p.setDescription(blankToNull(r.description()));
        p.setPrice(r.price());
        p.setSalePrice(r.salePrice());
        p.setCostPrice(r.costPrice());
        p.setStock(r.stock());
        p.setImageUrl(blankToNull(r.imageUrl()));
        p.setScreen(blankToNull(r.screen()));
        p.setChip(blankToNull(r.chip()));
        p.setRam(blankToNull(r.ram()));
        p.setStorage(blankToNull(r.storage()));
        p.setCamera(blankToNull(r.camera()));
        p.setBattery(blankToNull(r.battery()));
        p.setColor(blankToNull(r.color()));
        p.setHot(Boolean.TRUE.equals(r.hot()));
        p.setActive(r.active() == null || r.active());
        p.setBrand(brandService.get(r.brandId()));
        p.setCategory(categoryService.get(r.categoryId()));

        if (r.colors() != null) {
            p.clearColors();
            int totalColorStock = 0;
            for (ProductRequest.ProductColorRequest cr : r.colors()) {
                com.example.Nhom16_QuanLyCuaHangDienThoai.entity.ProductColor pc = com.example.Nhom16_QuanLyCuaHangDienThoai.entity.ProductColor.builder()
                        .product(p)
                        .colorName(cr.colorName().trim())
                        .hex(blankToNull(cr.hex()))
                        .price(cr.price())
                        .salePrice(cr.salePrice())
                        .stock(cr.stock() != null ? cr.stock() : 0)
                        .imageUrl(blankToNull(cr.imageUrl()))
                        .build();
                p.addColor(pc);
                totalColorStock += pc.getStock();
            }
            if (!r.colors().isEmpty() && (r.stock() == null || r.stock() == 0)) {
                p.setStock(totalColorStock);
            }
        }
    }

    private static int clamp(int limit) {
        return Math.min(Math.max(limit, 1), 24);
    }

    private static List<ProductResponse> map(List<Product> list) {
        return list.stream().map(ProductResponse::from).toList();
    }
}
