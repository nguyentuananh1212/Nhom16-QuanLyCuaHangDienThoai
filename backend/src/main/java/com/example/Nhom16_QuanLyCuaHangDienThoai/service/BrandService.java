package com.example.Nhom16_QuanLyCuaHangDienThoai.service;

import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request.BrandRequest;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.BrandResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.Brand;
import com.example.Nhom16_QuanLyCuaHangDienThoai.exception.AppException;
import com.example.Nhom16_QuanLyCuaHangDienThoai.exception.ErrorCode;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.BrandRepository;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.example.Nhom16_QuanLyCuaHangDienThoai.service.AuthService.blankToNull;

@Service
@RequiredArgsConstructor
public class BrandService {
    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<BrandResponse> findAll() {
        return brandRepository.findAll(Sort.by("name")).stream().map(BrandResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public BrandResponse findById(Long id) {
        return BrandResponse.from(get(id));
    }

    @Transactional
    public BrandResponse create(BrandRequest req) {
        if (brandRepository.existsByNameIgnoreCase(req.name().trim())) throw new AppException(ErrorCode.NAME_EXISTED);
        return BrandResponse.from(brandRepository.save(Brand.builder()
                .name(req.name().trim()).logoUrl(blankToNull(req.logoUrl()))
                .description(blankToNull(req.description())).build()));
    }

    @Transactional
    public BrandResponse update(Long id, BrandRequest req) {
        Brand b = get(id);
        if (brandRepository.existsByNameIgnoreCaseAndIdNot(req.name().trim(), id)) throw new AppException(ErrorCode.NAME_EXISTED);
        b.setName(req.name().trim());
        b.setLogoUrl(blankToNull(req.logoUrl()));
        b.setDescription(blankToNull(req.description()));
        return BrandResponse.from(b);
    }

    @Transactional
    public void delete(Long id) {
        Brand b = get(id);
        if (productRepository.existsByBrandId(id)) {
            throw new AppException(ErrorCode.IN_USE, "Hãng đang có sản phẩm, không thể xoá");
        }
        brandRepository.delete(b);
    }

    Brand get(Long id) {
        return brandRepository.findById(id).orElseThrow(() -> AppException.notFound("hãng", id));
    }
}
