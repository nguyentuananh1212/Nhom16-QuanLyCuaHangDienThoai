package com.example.Nhom16_QuanLyCuaHangDienThoai.service;

import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request.CategoryRequest;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.CategoryResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.Category;
import com.example.Nhom16_QuanLyCuaHangDienThoai.exception.AppException;
import com.example.Nhom16_QuanLyCuaHangDienThoai.exception.ErrorCode;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.CategoryRepository;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.example.Nhom16_QuanLyCuaHangDienThoai.service.AuthService.blankToNull;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll() {
        return categoryRepository.findAll(Sort.by("name")).stream().map(CategoryResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse findById(Long id) {
        return CategoryResponse.from(get(id));
    }

    @Transactional
    public CategoryResponse create(CategoryRequest req) {
        if (categoryRepository.existsByNameIgnoreCase(req.name().trim())) throw new AppException(ErrorCode.NAME_EXISTED);
        return CategoryResponse.from(categoryRepository.save(Category.builder()
                .name(req.name().trim()).description(blankToNull(req.description())).build()));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest req) {
        Category c = get(id);
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(req.name().trim(), id)) throw new AppException(ErrorCode.NAME_EXISTED);
        c.setName(req.name().trim());
        c.setDescription(blankToNull(req.description()));
        return CategoryResponse.from(c);
    }

    @Transactional
    public void delete(Long id) {
        Category c = get(id);
        if (productRepository.existsByCategoryId(id)) {
            throw new AppException(ErrorCode.IN_USE, "Danh mục đang có sản phẩm, không thể xoá");
        }
        categoryRepository.delete(c);
    }

    Category get(Long id) {
        return categoryRepository.findById(id).orElseThrow(() -> AppException.notFound("danh mục", id));
    }
}
